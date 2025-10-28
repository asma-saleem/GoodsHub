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
  createdAt: Date
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

export interface SingleVariantFormValues {
  id?: string;
  variantId?: string;
  color: string;
  colorCode?: string;
  size: string;
  price: string;
  stock: string;
  image?: string;
}
