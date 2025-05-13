
const Joi = require('joi');

// Validate user registration input
const validateRegistration = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().required().min(2).max(50),
    email: Joi.string().email().required(),
    password: Joi.string().required().min(6),
    role: Joi.string().valid('volunteer', 'admin', 'coordinator'),
    skills: Joi.array().items(Joi.string()),
    location: Joi.string(),
    bio: Joi.string()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  
  next();
};

// Validate login input
const validateLogin = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  
  next();
};

// Validate project input
const validateProject = (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().required().min(3).max(100),
    description: Joi.string().required().min(10),
    organization: Joi.string().required(),
    skills: Joi.array().items(Joi.string()).required(),
    location: Joi.string().required(),
    coordinates: Joi.array().items(Joi.number()).length(2),
    startDate: Joi.date().required(),
    endDate: Joi.date().required().greater(Joi.ref('startDate')),
    volunteersNeeded: Joi.number().integer().min(1).required(),
    imageUrl: Joi.string().uri(),
    category: Joi.string().required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  
  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateProject
};
