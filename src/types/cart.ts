import { ProductType } from './product';
export interface CartItem {
  id: number;   
  qty: number; 
  price: number; 
}

export interface CartItemType extends ProductType {
  key: number;
  qty: number;
}