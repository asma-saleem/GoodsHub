'use client';

import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { Button, Card } from 'antd';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

import { ProductType, ProductVariantType } from '@/types/product';
import { formatPrice } from '@/lib/utils';
import './card.css';

interface ProductCardProps {
  product: ProductType;
  hideCart?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  hideCart = false
}) => {
  const router = useRouter();
  const { data: session } = useSession();

  const [selectedVariant, setSelectedVariant] =
    useState<ProductVariantType | null>(
      product.defaultVariant ||
        (product.variants.length ? product.variants[0] : null)
    );
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const variantsForColor = selectedVariant
      ? product.variants.filter(
          (v) => v.color === selectedVariant.color && v.stock > 0
        )
      : product.variants.filter((v) => v.stock > 0);

    if (
      !selectedVariant ||
      !variantsForColor.find((v) => v.id === selectedVariant.id)
    ) {
      if (variantsForColor.length > 0) {
        setSelectedVariant(variantsForColor[0]);
        setQuantity(1);
      } else {
        setSelectedVariant(null);
        setQuantity(0);
      }
    }
  }, [product, selectedVariant]);

  const increment = () =>
    setQuantity((prev) => Math.min(prev + 1, selectedVariant?.stock ?? 1));
  const decrement = () => setQuantity((prev) => Math.max(prev - 1, 1));

  const addToCart = () => {
    if (!session) {
      router.push('/auth/login');
      return;
    }

    if (session.user.role === 'ADMIN') {
      toast.error('Admins cannot add items to cart from public store');
      router.push('/admin-dashboard');
      return;
    }

    if (!selectedVariant) return;

    const userId = session.user.id;
    const storageKey = `cart_${userId}`;
    const cart = JSON.parse(localStorage.getItem(storageKey) || '[]');

    const newItem = {
      key: Date.now(),
      id: product.id,
      variantId: selectedVariant.id,
      title: product.title,
      image: selectedVariant.image,
      price: selectedVariant.price,
      qty: quantity,
      stock: selectedVariant.stock,
      size: selectedVariant.size ?? 'M',
      color: selectedVariant.color ?? 'Default',
      colorCode: selectedVariant.colorCode ?? '#000000'
    };

    const existingIndex = cart.findIndex(
      (item: ProductVariantType) =>
        item.id === newItem.id &&
        item.size === newItem.size &&
        item.color === newItem.color
    );

    if (existingIndex !== -1) {
      if (cart[existingIndex].qty + quantity <= selectedVariant.stock) {
        cart[existingIndex].qty += quantity;
        cart[existingIndex].stock = selectedVariant.stock;
        toast.success('Quantity updated in cart!');
      } else {
        toast.error(
          `${
            cart[existingIndex].qty + quantity
          } can not be added to cart. The quantity is limited to ${
            selectedVariant.stock
          }`
        );
        return;
      }
    } else {
      if (quantity <= selectedVariant.stock) {
        cart.push(newItem);
        toast.success('Item added to cart!');
      } else {
        toast.error(`Only ${selectedVariant.stock} items available!`);
        return;
      }
    }
    console.log(JSON.stringify(cart));
    localStorage.setItem(storageKey, JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const colors = Array.from(
    new Set(product.variants.map((v) => v.color || 'Default'))
  );
  const sizes = Array.from(new Set(product.variants.map((v) => v.size || 'M')));

  const variantsByColor = product.variants.filter(
    (v) => v.color === selectedVariant?.color
  );

  return (
    <Card
      className={`card-container ${hideCart ? '!py-4' : ''}`}
      cover={
        <Image
          alt={product.title}
          src={selectedVariant?.image || product.image || '/placeholder.png'}
          width={257}
          height={222}
          className='product-image-card'
        />
      }
    >
      <div className='title-price-container'>
        <p className='product-title'>{product.title}</p>
        <div className='price-container'>
          <p className='price-label'>Price:</p>
          <p className='price-value'>
            {formatPrice(selectedVariant?.price || 0)}
          </p>
        </div>
      </div>

      {colors.length > 0 && (
        <div className='color-selection mt-2'>
          <div className='color-selection-container'>
            <p className='label font-semibold'>
              Color Family:
              {selectedVariant?.color && (
                <span className='variant-color'>{selectedVariant.color}</span>
              )}
            </p>
          </div>

          <div className='variant-container'>
            {colors.map((color) => {
              const variantForColor = product.variants.find(
                (v) => v.color === color && v.stock > 0
              );

              if (!variantForColor) return null;

              return (
                <div
                  key={color}
                  className={`selected-variant-border ${
                    selectedVariant?.color === color
                      ? 'border-orange-500'
                      : 'border-gray-200'
                  } rounded-md`}
                  onClick={() => {
                    const firstAvailable = product.variants.find(
                      (v) => v.color === color && v.stock > 0
                    );
                    if (firstAvailable) setSelectedVariant(firstAvailable);
                    setQuantity(1);
                  }}
                >
                  <Image
                    src={variantForColor.image || '/placeholder.png'}
                    alt={color}
                    width={45}
                    height={45}
                    className='image-options'
                  />
                  {selectedVariant?.color === color && (
                    <span className='tick-color-selection'>✓</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
      {sizes.length > 0 && (
        <div className='size-selection mt-2'>
          <p className='label'>Size:</p>
          <div className='size-container'>
            {sizes
              .filter((size) => {
                const variantForSize = variantsByColor.find(
                  (v) => v.size === size
                );
                return variantForSize && variantForSize.stock > 0;
              })
              .map((size) => {
                const variantForSize = variantsByColor.find(
                  (v) => v.size === size
                );

                return (
                  <button
                    key={size}
                    className={`size-border ${
                      selectedVariant?.size === size
                        ? 'border-orange-500 text-orange-500'
                        : 'border-gray-300'
                    }`}
                    onClick={() => {
                      if (variantForSize) setSelectedVariant(variantForSize);
                      setQuantity(1);
                    }}
                  >
                    {size}
                  </button>
                );
              })}
          </div>
        </div>
      )}
      {!hideCart && (
        <div className='quantity-container'>
          <div className='quantity-subcontainer'>
            <Button
              onClick={decrement}
              disabled={quantity <= 1}
              className='quantity-btn'
            >
              -
            </Button>
            <input
              type='number'
              value={quantity}
              onChange={(e) => {
                const val = e.target.value;
                if (/^[1-9]\d*$/.test(val)) setQuantity(Number(val));
              }}
              onFocus={(e) => e.target.select()}
              className='quantity-input'
            />
            <Button
              onClick={increment}
              disabled={quantity >= (selectedVariant?.stock || 1)}
              className='quantity-btn'
            >
              +
            </Button>
          </div>

          <Button
            onClick={addToCart}
            disabled={
              !selectedVariant || selectedVariant.stock <= 0 || quantity <= 0
            }
            className={`add-to-cart-btn ${
              (selectedVariant?.stock ?? 0) > 0 ? 'btn-enabled' : 'btn-disabled'
            }`}
          >
            {(selectedVariant?.stock ?? 0) > 0 ? 'Add to Cart' : 'Out of Stock'}
          </Button>
        </div>
      )}
    </Card>
  );
};

export default ProductCard;
