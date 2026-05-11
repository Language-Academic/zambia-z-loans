const Joi = require('joi');

/**
 * ZAMBIA Z - SCHEMA DEFINITIONS
 * Strategy: Centralized, strict, and reusable validation rules.
 */

const schemas = {
  // Registration Schema
  register: Joi.object({
    fullName: Joi.string()
      .trim()
      .min(3)
      .max(50)
      .required()
      .messages({
        'string.min': 'Full name must be at least 3 characters.',
        'any.required': 'Full name is a mandatory field.'
      }),

    email: Joi.string()
      .email({ tlds: { allow: false } })
      .lowercase()
      .required()
      .messages({ 'string.email': 'Please provide a valid corporate or personal email.' }),

    nationalId: Joi.string()
      .regex(/^\d{7,8}$/) // Kenyan IDs are usually 7 or 8 digits
      .required()
      .messages({ 'string.pattern.base': 'National ID must be a valid 7 or 8-digit number.' }),

    password: Joi.string()
      .min(8)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .required()
      .messages({
        'string.min': 'Password must be at least 8 characters.',
        'string.pattern.base': 'Password must contain an uppercase letter, a lowercase letter, and a number.'
      }),

    isCitizen: Joi.boolean().required(),
    
    // Optional: Device Info for fraud tracking
    deviceId: Joi.string().optional()
  }),

  // Loan Application Schema
  loanApplication: Joi.object({
    amount: Joi.number()
      .integer()
      .min(500)
      .max(100000)
      .required()
      .messages({
        'number.min': 'Minimum loan amount is KSh 500.',
        'number.max': 'Maximum loan amount allowed is KSh 100,000.'
      }),

    phoneNumber: Joi.string()
      .regex(/^(?:254|\+254|0)?(7|1)\d{8}$/) // Matches 254, +254, or 07.../01...
      .required()
      .messages({ 'string.pattern.base': 'Invalid M-PESA phone number format.' }),

    description: Joi.string()
      .max(255)
      .allow('', null)
      .optional()
  })
};

/**
 * VALIDATION EXECUTION ENGINE
 * Higher-order function to validate any schema
 */
const validate = (schemaName) => {
  return (req, res, next) => {
    const schema = schemas[schemaName];
    if (!schema) {
      return next(new Error(`Schema "${schemaName}" not found.`));
    }

    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Return all errors, not just the first one
      stripUnknown: true, // Remove fields not defined in schema (Security!)
    });

    if (error) {
      const errorMessages = error.details.map((detail) => detail.message.replace(/"/g, ''));
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: errorMessages,
      });
    }

    // Replace req.body with the sanitized/validated value
    req.body = value;
    next();
  };
};

module.exports = {
  validateRegister: validate('register'),
  validateLoanApplication: validate('loanApplication'),
};
