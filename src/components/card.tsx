'use client';

import Image from 'next/image';

import React, { useState } from 'react';
import { Button, Card } from 'antd';
import { ProductType } from '@/types/product';
import { toast } from 'react-toastify';

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
      className='w-full rounded-md border border-[#DFDFDF] bg-white shadow-sm mobile:!px-3 tablet:!px-4'
      cover={
        <Image
          alt='example'
          src={product.image}
          width={257}
          height={222}
          className='object-contain block mobile:pt-3 tablet:pt-4'
        />
      }
    >
      <div className='mobile:pt-3 tablet:pt-4 flex flex-col gap-y-2'>
        <p className='font-inter font-medium text-[14px] leading-[19.2px] !mb-0'>
          {product.title}
        </p>
        <div className='flex justify-start'>
          <p className='font-inter font-bold text-[14px] leading-5 text-[#868E96] py-1.25 !mb-0'>
            Price:
          </p>
          <p className='font-inter font-normal text-[20px] leading-[30px] text-center text-[#007BFF] !mb-0'>
            ${Number(product.price).toFixed(2)}
          </p>
        </div>
      </div>

      <div className='flex justify-between pt-[35px] pb-4'>
        <div className='flex items-center justify-center gap-[4px]'>
          <Button
            onClick={decrement}
            disabled={quantity <= 1}
            className='!text-[#007BFF] !p-0 mobile:!w-6 mobile:!h-6 desktop:!w-9 desktop:!h-9 !text-2xl'
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
            className='!p-0 text-center border border-[#DFDFDF] rounded mobile:!w-[29px] mobile:!h-6 
             tablet:!w-[30px] desktop:!w-11 desktop:!h-9 [&::-webkit-inner-spin-button]:appearance-none 
             [&::-webkit-outer-spin-button]:appearance-none 
             [appearance:textfield]'
          />

          <Button
            onClick={increment}
            disabled={quantity >= product.stock}
            className='!text-[#007BFF] !p-0 mobile:!w-6 mobile:!h-6 desktop:!w-9 desktop:!h-9 !text-2xl'
          >
            <span className='!h-[35px]'>+</span>
          </Button>
        </div>
        <Button
          onClick={addToCart}
          disabled={product.stock <= 0|| quantity <= 0}
          className={`!p-0 mobile:!w-[74px] mobile:!h-[24px] tablet:!w-[101px] tablet:!h-9 desktop:!w-[112px] mobile:!px-3 mobile:!py-[6px] font-inter font-normal mobile:!text-[12px] tablet:!text-base leading-6 text-center align-middle rounded !shadow-none !border-none 
         ${
           product.stock > 0
             ? '!bg-[#007BFF] !text-white'
             : '!bg-gray-300 !text-white cursor-not-allowed'
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
