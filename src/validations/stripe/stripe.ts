import Joi from 'joi';
import { userIdSchema, orderIdSchema } from '../common/ids';

export const metadataSchema = Joi.object({
  orderId: orderIdSchema,
  userId: userIdSchema
});