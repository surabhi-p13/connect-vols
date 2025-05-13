
const express = require('express');
const router = express.Router();
const { ChatMessage } = require('../models/chat.model');
const { User } = require('../models/user.model');
const { authenticate } = require('../middleware/auth.middleware');

// Send a message
router.post('/', authenticate, async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user._id;
    
    if (!content || content.trim() === '') {
      return res.status(400).json({ message: 'Message content cannot be empty' });
    }
    
    // Verify receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'Recipient not found' });
    }
    
    const newMessage = new ChatMessage({
      senderId,
      receiverId,
      content,
      timestamp: new Date(),
      read: false
    });
    
    await newMessage.save();
    
    // Real-time notification will be handled by Socket.IO
    
    res.status(201).json({
      message: 'Message sent successfully',
      chatMessage: newMessage
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Failed to send message' });
  }
});

// Get conversation with a user
router.get('/conversation/:userId', authenticate, async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const otherUserId = req.params.userId;
    
    // Verify other user exists
    const otherUser = await User.findById(otherUserId).select('name profileImage');
    if (!otherUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get messages between the two users
    const messages = await ChatMessage.find({
      $or: [
        { senderId: currentUserId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: currentUserId }
      ]
    }).sort({ timestamp: 1 });
    
    // Mark messages from other user as read
    await ChatMessage.updateMany(
      { senderId: otherUserId, receiverId: currentUserId, read: false },
      { $set: { read: true } }
    );
    
    res.json({
      conversation: {
        with: otherUser,
        messages
      }
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ message: 'Failed to retrieve conversation' });
  }
});

// Get list of conversations
router.get('/conversations', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Find all unique users the current user has chatted with
    const sentToUsers = await ChatMessage.distinct('receiverId', { senderId: userId });
    const receivedFromUsers = await ChatMessage.distinct('senderId', { receiverId: userId });
    
    // Combine and remove duplicates
    const uniqueUserIds = [...new Set([...sentToUsers, ...receivedFromUsers])];
    
    // Get user details for each conversation partner
    const conversationPartners = await User.find({
      _id: { $in: uniqueUserIds }
    }).select('name profileImage');
    
    // Get the latest message and unread count for each conversation
    const conversations = await Promise.all(conversationPartners.map(async (partner) => {
      const latestMessage = await ChatMessage.findOne({
        $or: [
          { senderId: userId, receiverId: partner._id },
          { senderId: partner._id, receiverId: userId }
        ]
      }).sort({ timestamp: -1 });
      
      const unreadCount = await ChatMessage.countDocuments({
        senderId: partner._id,
        receiverId: userId,
        read: false
      });
      
      return {
        user: partner,
        latestMessage,
        unreadCount
      };
    }));
    
    // Sort by latest message
    conversations.sort((a, b) => {
      if (!a.latestMessage) return 1;
      if (!b.latestMessage) return -1;
      return b.latestMessage.timestamp - a.latestMessage.timestamp;
    });
    
    res.json({ conversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Failed to retrieve conversations' });
  }
});

// Mark all messages from a user as read
router.put('/read/:userId', authenticate, async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const otherUserId = req.params.userId;
    
    await ChatMessage.updateMany(
      { senderId: otherUserId, receiverId: currentUserId, read: false },
      { $set: { read: true } }
    );
    
    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Mark messages read error:', error);
    res.status(500).json({ message: 'Failed to mark messages as read' });
  }
});

// Delete conversation
router.delete('/conversation/:userId', authenticate, async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const otherUserId = req.params.userId;
    
    await ChatMessage.deleteMany({
      $or: [
        { senderId: currentUserId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: currentUserId }
      ]
    });
    
    res.json({ message: 'Conversation deleted successfully' });
  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({ message: 'Failed to delete conversation' });
  }
});

module.exports = router;
