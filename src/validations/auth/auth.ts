import Joi from 'joi';

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Invalid email format'
  })
});

export const resetPasswordSchema = Joi.object({
  token: Joi.string().required().messages({
    'string.empty': 'Reset token is required'
  }),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/)
    .required()
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 8 characters',
      'string.pattern.base':
        'Password must contain uppercase, lowercase, number and special character'
    })
});

export const signupSchema = Joi.object({
  fullname: Joi.string().min(3).max(50).required().messages({
    'string.empty': 'Full name is required',
    'string.min': 'Full name must be at least 3 characters',
    'string.max': 'Full name cannot exceed 50 characters'
  }),
  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Invalid email format'
  }),
  mobile: Joi.string()
    .pattern(/^(?:\+92|0)[0-9]{10}$/) 
    .required()
    .messages({
      'string.empty': 'Mobile number is required',
      'string.pattern.base':
        'Enter a valid mobile number (e.g. 03001234567 or +923001234567)'
    }),
  password: Joi.string()
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    )
    .required()
    .messages({
      'string.empty': 'Password is required',
      'string.pattern.base':
        'Password must be at least 8 characters, include uppercase, lowercase, number & special character'
    })
});


