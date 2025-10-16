export interface ProductVariantType {
  id: string;
  color?: string;
  colorCode?: string;
  product: {
    id: string;
    title: string;
  };
  size?: string;
  price: number;
  image?: string;
  stock: number;
  isVariantDeleted: boolean;
}

export interface ProductType {
  id: string;
  title: string;
  image?: string; 
  createdAt: string;
  variants: ProductVariantType[];

  defaultVariant?: ProductVariantType | null;
  minPrice?: number | null;

  isProductDeleted?: boolean;
}
