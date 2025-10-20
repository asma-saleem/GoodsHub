import Joi from 'joi';
import { orderIdSchema } from '../common/ids';

export const orderParamsSchema = Joi.object({
  id: orderIdSchema
});

export const orderQuerySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .allow(null, '') 
    .default(1)
    .messages({
      'number.base': 'Page must be a number',
      'number.integer': 'Page must be an integer',
      'number.min': 'Page must be at least 1'
    }),

  pageSize: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .allow(null, '') 
    .default(10)
    .messages({
      'number.base': 'Page size must be a number',
      'number.min': 'Page size must be at least 1',
      'number.max': 'Page size cannot exceed 100'
    }),

  q: Joi.string()
    .allow('', null)
    .default('')
    .messages({
      'string.base': 'Search query must be a string'
    })
});


const cartItemSchema = Joi.object({
  key: Joi.number().required(),
  id: Joi.string().uuid().required(),
  variantId: Joi.string().uuid().required(),
  title: Joi.string().required(),
  image: Joi.string().required(),
  price: Joi.number().min(0).required(),
  qty: Joi.number().min(1).required(),
  stock: Joi.number().min(0).required(),
  size: Joi.string().required(),
  color: Joi.string().required(),
  colorCode: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).required()
});

export const cartSchema = Joi.object({
  cart: Joi.array().items(cartItemSchema).min(1).required(),
  userId: Joi.string().uuid().required()
});