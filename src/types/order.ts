import {ProductType} from './product';
export interface OrderItemType {
  key: number;
  product: ProductType;
  image: string;
  // stock: number;
  qty: number;
  price: number;
}

export interface OrderType {
  id: string;
  key: number;
  date: string;
  orderNo: number | string;
  user: number;
  products: number;
  amount: number;
  createdAt: string;
  userId: number;
  total: number;
  items: OrderItemType[]; 
}

