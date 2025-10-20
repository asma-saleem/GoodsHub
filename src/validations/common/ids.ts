import Joi from 'joi';

export const idSchema = Joi.string()
  .uuid()
  .required()
  .messages({
    'string.base': 'Product ID must be a string',
    'string.guid': 'Product ID must be a valid UUID',
    'any.required': 'Product ID is required'
  });

export const variantIdSchema = Joi.string()
  .uuid()
  .required()
  .messages({
    'string.base': 'Variant ID must be a string',
    'string.guid': 'Variant ID must be a valid UUID',
    'any.required': 'Variant ID is required'
  });

  export const orderIdSchema = Joi.string()
  .uuid()
  .required()
  .messages({
    'string.base': 'Order ID must be a string',
    'string.guid': 'Order ID must be a valid UUID',
    'any.required': 'Order ID is required'
  });

  export const userIdSchema = Joi.string()
  .uuid()
  .required()
  .messages({
    'string.base': 'User ID must be a string',
    'string.guid': 'User ID must be a valid UUID',
    'any.required': 'User ID is required'
  });
