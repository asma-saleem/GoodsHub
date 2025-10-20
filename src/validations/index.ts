import { createVariantSchema, updateVariantSchema, variantParamsSchema, productParamsSchema, updateProductSchema, productSchema, getProductsQuerySchema } from './product/product';
import { orderParamsSchema, orderQuerySchema, cartSchema } from './orders/order';
import { forgotPasswordSchema, resetPasswordSchema, signupSchema } from './auth/auth';
import { metadataSchema } from './stripe/stripe';

export const schemas = [
  {
    path: '/api/products/[id]/variants',
    method: 'POST',
    body: createVariantSchema,
    params: productParamsSchema
  },
  {
    path: '/api/products/[id]/variants/[variantId]',
    method: 'PUT',
    body: updateVariantSchema,
    params: variantParamsSchema
  },
  {
    path: '/api/products/[id]/variants/[variantId]',
    method: 'DELETE',
    params: variantParamsSchema
  },
  {
    path: '/api/products/[id]',
    method: 'PUT',
    body: updateProductSchema,
    params: productParamsSchema
  },
  {
    path: '/api/products/[id]',
    method: 'DELETE',
    params: productParamsSchema
  },
  {
    path: '/api/products',
    method: 'POST',
    body: productSchema
  },
   {
    path: '/api/products',
    method: 'GET',
    query: getProductsQuerySchema
  },

  {
    path: '/api/orders/[id]',
    method: 'GET',
    params: orderParamsSchema
  },
  {
    path: '/api/orders/[id]',
    method: 'PATCH',
    params: orderParamsSchema
  },
  {
    path: '/api/orders',
    method: 'GET',
    query: orderQuerySchema
  },
  {
    path: '/api/checkout',
    method: 'POST',
    body: cartSchema
  },

  {
    path: '/api/auth/forgot',
    method: 'POST',
    body: forgotPasswordSchema
  },
  {
    path: '/api/auth/reset',
    method: 'POST',
    body: resetPasswordSchema
  },
  {
    path: '/api/auth/signup',
    method: 'POST',
    body: signupSchema
  },

  {
    path: '/api/stripe-webhook',
    method: 'POST',
    body: metadataSchema
  },
  {
    path: '/api/stripe/verify',
    method: 'GET',
    body: metadataSchema
  }
];
