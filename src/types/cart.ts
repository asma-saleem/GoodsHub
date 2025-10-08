import { ProductType } from './product';
export interface CartItem {
  id: string;   
  qty: number; 
  price: number; 
}

export interface CartItemType extends ProductType {
  variantId: string;
  key: number;
  qty: number;
  stock: number;
  color?: string;
  colorCode?: string;
  size?: string;
  price: number;
  image?: string;
}