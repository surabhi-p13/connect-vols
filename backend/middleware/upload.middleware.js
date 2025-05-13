
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const createDirectories = () => {
  const dirs = ['uploads', 'uploads/resumes', 'uploads/profile-images', 'uploads/project-images'];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// Configure storage for different file types
const configStorage = (folder) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      createDirectories();
      cb(null, `uploads/${folder}/`);
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`);
    }
  });
};

// File filters
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    return cb(null, true);
  }
  
  cb(new Error('Only image files (jpg, jpeg, png, gif) are allowed'));
};

const resumeFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    return cb(null, true);
  }
  
  cb(new Error('Only document files (pdf, doc, docx) are allowed'));
};

// Create upload objects
const profileImageUpload = multer({
  storage: configStorage('profile-images'),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: imageFilter
});

const projectImageUpload = multer({
  storage: configStorage('project-images'),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: imageFilter
});

const resumeUpload = multer({
  storage: configStorage('resumes'),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: resumeFilter
});

// Error handler middleware
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large' });
    }
    return res.status(400).json({ message: err.message });
  }
  
  if (err) {
    return res.status(400).json({ message: err.message });
  }
  
  next();
};

module.exports = {
  profileImageUpload,
  projectImageUpload,
  resumeUpload,
  handleUploadError
};
