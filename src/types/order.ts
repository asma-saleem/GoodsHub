import {ProductVariantType} from './product';
export interface OrderItemType {
  key: number;
  variant: ProductVariantType;
  variantId: string;
  image: string;
  quantity: number;
  price: number;
}

export interface OrderType {
  id: string;
  key: number;
  date: string;
  orderNo: number | string;
  user?: {
    fullname: string;
  };
  products: number;
  amount: number;
  createdAt: string;
  userId: number;
  total: number;
  items: OrderItemType[]; 
}

