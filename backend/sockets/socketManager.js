
const { User } = require('../models/user.model');
const { ChatMessage } = require('../models/chat.model');
const { Notification } = require('../models/notification.model');

module.exports = function(io) {
  // Store active users
  const activeUsers = new Map();

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // User authentication and association
    socket.on('authenticate', async (userId) => {
      try {
        const user = await User.findById(userId);
        if (user) {
          activeUsers.set(userId, socket.id);
          socket.userId = userId;
          
          // Join user-specific room for targeted messages
          socket.join(`user:${userId}`);
          
          // Emit status change to relevant users
          socket.broadcast.emit('user_status', { userId, status: 'online' });
          
          // Send any pending notifications to user
          const notifications = await Notification.find({ 
            userId, 
            read: false 
          }).sort({ createdAt: -1 }).limit(20);
          
          if (notifications.length > 0) {
            socket.emit('pending_notifications', notifications);
          }
        }
      } catch (error) {
        console.error('Socket authentication error:', error);
      }
    });

    // Chat message handling
    socket.on('send_message', async (messageData) => {
      try {
        const { senderId, receiverId, content } = messageData;
        
        // Create and save message to database
        const newMessage = new ChatMessage({
          senderId,
          receiverId,
          content,
          timestamp: new Date(),
          read: false
        });
        
        await newMessage.save();
        
        // Send to specific user if online
        const receiverSocketId = activeUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(`user:${receiverId}`).emit('new_message', newMessage);
        }
        
        // Also send back to sender for confirmation
        socket.emit('message_sent', newMessage);
      } catch (error) {
        console.error('Message sending error:', error);
        socket.emit('message_error', { error: 'Failed to send message' });
      }
    });

    // Notification handling
    socket.on('read_notification', async (notificationId) => {
      try {
        await Notification.findByIdAndUpdate(notificationId, { read: true });
        socket.emit('notification_updated', notificationId);
      } catch (error) {
        console.error('Notification update error:', error);
      }
    });

    // User disconnection
    socket.on('disconnect', () => {
      if (socket.userId) {
        activeUsers.delete(socket.userId);
        socket.broadcast.emit('user_status', { 
          userId: socket.userId, 
          status: 'offline' 
        });
      }
      console.log('Client disconnected:', socket.id);
    });
  });
};
