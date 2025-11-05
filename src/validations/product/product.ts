import Joi from 'joi';
import { idSchema, variantIdSchema } from '../common/ids';

export const variantParamsSchema = Joi.object({
  id: idSchema,
  variantId: variantIdSchema
});

export const productParamsSchema = Joi.object({
  id: idSchema
});

export const updateVariantSchema = Joi.object({
  id: Joi.string().optional(),
  variantId: Joi.string().optional(),
  color: Joi.string().optional().allow(null, ''),
  colorCode: Joi.string()
    .pattern(/^#([0-9A-Fa-f]{6})$/)
    .required()
    .messages({
      'string.empty': 'Color code is required',
      'string.pattern.base': 'Invalid color code format'
    }),
  size: Joi.string().required().allow(null, ''),
  price: Joi.number().min(0).required(),
  stock: Joi.number().min(0).required(),
  image: Joi.alternatives().try(
    Joi.string().pattern(/^(\/|https?:\/\/).+\.(jpg|jpeg|png|webp)$/i, 'valid image path or URL'),
    Joi.array().items(
      Joi.object({ url: Joi.string().pattern(/^(\/|https?:\/\/).+\.(jpg|jpeg|png|webp)$/i).required() })
    )
  ).optional()
});

export const createVariantSchema = Joi.object({
  id: Joi.string().optional(),
  color: Joi.string().optional().allow(null, ''),
  colorCode: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional().allow(null, ''),
  size: Joi.string().required(),
  price: Joi.number().min(0).required(),
  stock: Joi.number().min(0).required(),
  image: Joi.alternatives().try(
    Joi.string().pattern(/^(\/|https?:\/\/).+\.(jpg|jpeg|png|webp)$/i, 'valid image path or URL'),
    Joi.array().items(
      Joi.object({ url: Joi.string().pattern(/^(\/|https?:\/\/).+\.(jpg|jpeg|png|webp)$/i).required() })
    )
  ).optional()
});

export const updateProductSchema = Joi.object({
  id: Joi.string().optional(),
  name: Joi.string().min(1).required()
});

export const variantSchema = Joi.object({
  id: Joi.string().optional(),
  color: Joi.string().optional().allow(null, ''),
  colorCode: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional().allow(null, ''),
  size: Joi.string().optional().allow(null, ''),
  price: Joi.number().min(0).required(),
  stock: Joi.number().min(0).required(),
  image: Joi.alternatives().try(
    Joi.string().pattern(/^(\/|https?:\/\/).+\.(jpg|jpeg|png|webp)$/i, 'valid image path or URL'),
    Joi.array().items(
      Joi.object({ url: Joi.string().pattern(/^(\/|https?:\/\/).+\.(jpg|jpeg|png|webp)$/i).required() })
    )
  ).optional()
});

export const productSchema = Joi.object({
  name: Joi.string().min(1).required(),
  variants: Joi.array().items(variantSchema).min(1).required()
});

export const getProductsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1)
    .messages({
      'number.base': 'Page must be a number',
      'number.min': 'Page must be at least 1'
    }),

  limit: Joi.number().integer().min(1).max(100).default(8)
    .messages({
      'number.base': 'Limit must be a number',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100'
    }),

  q: Joi.string().allow('', null).default(''),

  sortBy: Joi.string()
    .valid(
      'createdAt_asc',
      'createdAt_desc',
      'price_asc',
      'price_desc',
      'title_asc',
      'title_desc'
    )
    .default('createdAt_desc')
    .messages({
      'any.only': 'Invalid sort option provided'
    })
});