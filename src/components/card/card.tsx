'use client';

import Image from 'next/image';
import React, { useState } from 'react';
import { Button, Card } from 'antd';
import { toast } from 'react-toastify';

import { ProductType } from '@/types/product';
import './card.css';

interface ProductCardProps {
  product: ProductType;
}
const ProductCard: React.FC<ProductCardProps> = ({ product }) => {

  const [quantity, setQuantity] = useState(1);
  const increment = () => setQuantity((prev) => prev + 1);
  const decrement = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  
  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');

    const newItem = {
      key: Date.now(),
      id: product.id,
      title: product.title,
      image: product.image,
      price: product.price,
      qty: quantity,
      stock: product.stock,
      size: product.size ?? 'M',
      color: product.color ?? 'Default', 
      colorCode: product.colorCode ?? '#000000' 
    };

    const existingIndex = cart.findIndex(
      (item: ProductType) => item.id === newItem.id
    );
    if (existingIndex !== -1) {
      if (cart[existingIndex].qty + quantity < cart[existingIndex].stock) {
        cart[existingIndex].qty += quantity;
        toast.success('Quantity updated in cart!');
      } else {
        toast.error('Not enough stock!');
        return;
      }
    } else {
      if (quantity <= newItem.stock) {
        cart.push(newItem);
        toast.success('Item added to cart!');
      } else {
        toast.error(`Only ${newItem.stock} items available in stock!`);
        return;
      }
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  return (
    <Card
      className='card-container'
      cover={
        <Image
          alt='example'
          src={product.image}
          width={257}
          height={222}
          className='product-image'
        />
      }
    >
      <div className='title-price-container'>
        <p className='product-title'>
          {product.title}
        </p>
        <div className='price-container'>
          <p className='price-label'>
            Price:
          </p>
          <p className='price-value'>
            ${Number(product.price).toFixed(2)}
          </p>
        </div>
      </div>
      <div className='quantity-container'>
        <div className='flex items-center justify-center gap-[4px]'>
          <Button
            onClick={decrement}
            disabled={quantity <= 1}
            className='quantity-btn'
          >
           <span className='!h-[35px]'>-</span>
          </Button>          
          <input
            type='number'
            value={quantity}
            onChange={(e) => {
              const val = e.target.value;
              if (/^[1-9]\d*$/.test(val)) {
                setQuantity(Number(val));              
              }
            }}
            onFocus={(e) => e.target.select()}
            className='quantity-input'
          />
          <Button
            onClick={increment}
            disabled={quantity >= product.stock}
            className='quantity-btn'
          >
            <span className='!h-[35px]'>+</span>
          </Button>
        </div>
        <Button
          onClick={addToCart}
          disabled={product.stock <= 0|| quantity <= 0}
          className={`add-to-cart-btn
         ${
           product.stock > 0
             ? 'btn-enabled'
             : 'btn-disabled'
         }
        `}
        >
          {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
        </Button>
      </div>
    </Card>
  );
};

export default ProductCard;
