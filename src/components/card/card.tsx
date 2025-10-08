// 'use client';

// import Image from 'next/image';
// import React, { useState } from 'react';
// import { Button, Card } from 'antd';
// import { toast } from 'react-toastify';
// import { useRouter } from 'next/navigation';
// import { useSession } from 'next-auth/react';

// import { ProductType } from '@/types/product';
// import { formatPrice } from '@/lib/utils';
// import './card.css';

// interface ProductCardProps {
//   product: ProductType;
// }
// const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  
//   const router = useRouter();
//   const { data: session } = useSession();
//   const [quantity, setQuantity] = useState(1);
//   const increment = () => setQuantity((prev) => prev + 1);
//   const decrement = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  
//   const addToCart = () => {
//     if (!session) {
//       router.push('/auth/login');
//       return;
//     }

//     if(session.user.role==='ADMIN'){
//       toast.error('Admins cannot add items to cart from public store');
//       router.push('/admin-dashboard');
//       return; 
//     }
//     const userId = session.user.id;
//     const storageKey = `cart_${userId}`;
//     const cart = JSON.parse(localStorage.getItem(storageKey) || '[]');

//     const newItem = {
//       key: Date.now(),
//       id: product.id,
//       title: product.title,
//       image: product.image,
//       price: product.price,
//       qty: quantity,
//       stock: product.stock,
//       size: product.size ?? 'M',
//       color: product.color ?? 'Default', 
//       colorCode: product.colorCode ?? '#000000' 
//     };

//     const existingIndex = cart.findIndex(
//       (item: ProductType) => item.id === newItem.id
//     );
//     if (existingIndex !== -1) {
//       if (cart[existingIndex].qty + quantity <= product.stock) {
//         cart[existingIndex].stock = product.stock;
//         cart[existingIndex].qty += quantity;
//         toast.success('Quantity updated in cart!');
//       } else {
//         toast.error(`${cart[existingIndex].qty+quantity} can not be added to cart. 
//           The quantity is limited to ${product.stock}.`);
//         return;
//       }
//     } else {
//       if (quantity <= newItem.stock) {
//         cart.push(newItem);
//         toast.success('Item added to cart!');
//       } else {
//         toast.error(`Only ${newItem.stock} items available in stock!`);
//         return;
//       }
//     }

//     localStorage.setItem(storageKey, JSON.stringify(cart));
//     window.dispatchEvent(new Event('cartUpdated'));
//   };

//   return (
//     <Card
//       className='card-container'
//       cover={
//         <Image
//           alt='example'
//           src={product.image}
//           width={257}
//           height={222}
//           className='product-image'
//         />
//       }
//     >
//       <div className='title-price-container'>
//         <p className='product-title'>
//           {product.title}
//         </p>
//         <div className='price-container'>
//           <p className='price-label'>
//             Price:
//           </p>
//           <p className='price-value'>
//             {formatPrice(product.price)}
//           </p>
//         </div>
//       </div>
//       <div className='quantity-container'>
//         <div className='flex items-center justify-center gap-[4px]'>
//           <Button
//             onClick={decrement}
//             disabled={quantity <= 1}
//             className='quantity-btn'
//           >
//            <span className='!h-[35px]'>-</span>
//           </Button>          
//           <input
//             type='number'
//             value={quantity}
//             onChange={(e) => {
//               const val = e.target.value;
//               if (/^[1-9]\d*$/.test(val)) {
//                 setQuantity(Number(val));              
//               }
//             }}
//             onFocus={(e) => e.target.select()}
//             className='quantity-input'
//           />
//           <Button
//             onClick={increment}
//             disabled={quantity >= product.stock}
//             className='quantity-btn'
//           >
//             <span className='!h-[35px]'>+</span>
//           </Button>
//         </div>
//         <Button
//           onClick={addToCart}
//           disabled={product.stock <= 0|| quantity <= 0}
//           className={`add-to-cart-btn
//          ${
//            product.stock > 0
//              ? 'btn-enabled'
//              : 'btn-disabled'
//          }
//         `}
//         >
//           {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
//         </Button>
//       </div>
//     </Card>
//   );
// };

// export default ProductCard;

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
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const router = useRouter();
  const { data: session } = useSession();

  // Initialize default variant
  const [selectedVariant, setSelectedVariant] = useState<ProductVariantType | null>(
    product.defaultVariant || (product.variants.length ? product.variants[0] : null)
  );
  const [quantity, setQuantity] = useState(1);

  // Update selectedVariant if product changes
  useEffect(() => {
    setSelectedVariant(product.defaultVariant || (product.variants.length ? product.variants[0] : null));
    setQuantity(1);
  }, [product]);

  const increment = () => setQuantity((prev) => Math.min(prev + 1, selectedVariant?.stock ?? 1));
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
      (item: ProductVariantType) => item.id === newItem.id && item.size === newItem.size && item.color === newItem.color
    );

    if (existingIndex !== -1) {
      if (cart[existingIndex].qty + quantity <= selectedVariant.stock) {
        cart[existingIndex].qty += quantity;
        cart[existingIndex].stock = selectedVariant.stock;
        toast.success('Quantity updated in cart!');
      } else {
        toast.error(`Cannot add ${cart[existingIndex].qty + quantity} items. Max stock: ${selectedVariant.stock}`);
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

    localStorage.setItem(storageKey, JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  // Get unique colors & sizes
  const colors = Array.from(new Set(product.variants.map((v) => v.color || 'Default')));
  const sizes = Array.from(new Set(product.variants.map((v) => v.size || 'M')));

  // Filter variants by selected color
  const variantsByColor = product.variants.filter((v) => v.color === selectedVariant?.color);

  return (
    <Card
      className='card-container'
      cover={
        <Image
          alt={product.title}
          src={selectedVariant?.image || product.image || '/placeholder.png'}
          width={257}
          height={222}
          className='product-image'
        />
      }
    >
      <div className='title-price-container'>
        <p className='product-title'>{product.title}</p>
        <div className='price-container'>
          <p className='price-label'>Price:</p>
          <p className='price-value'>{formatPrice(selectedVariant?.price || 0)}</p>
        </div>
      </div>

      {/* Color Selection */}
{colors.length > 1 && (
  <div className='color-selection'>
    <p className='label'>Color Family:</p>
    <div className='flex gap-2'>
      {colors.map((color) => {
        const variantForColor = product.variants.find(v => v.color === color);

        if (!variantForColor) return null;

        return (
          <div
            key={color}
            className={`relative cursor-pointer border-2 ${
              selectedVariant?.color === color ? 'border-orange-500' : 'border-gray-200'
            } rounded-md`}
            onClick={() => {
              setSelectedVariant(variantForColor);
              setQuantity(1);
            }}
          >
            <Image
              src={variantForColor.image || '/placeholder.png'}
              alt={color}
              width={50}
              height={50}
              className='rounded-md'
            />
            <p className='text-xs text-center mt-1'>{color}</p>
            {selectedVariant?.color === color && (
              <span className='absolute top-0 right-0 text-orange-500 font-bold'>✓</span>
            )}
          </div>
        );
      })}
    </div>
  </div>
)}


{/* Size Selection */}
{sizes.length > 1 && (
  <div className='size-selection mt-2'>
    <p className='label'>Size:</p>
    <div className='flex gap-2'>
      {sizes.map((size) => {
        const variantForSize = variantsByColor.find((v) => v.size === size);
        return (
          <button
            key={size}
            className={`px-3 py-1 border rounded-md ${
              selectedVariant?.size === size ? 'border-orange-500 text-orange-500' : 'border-gray-300'
            }`}
            disabled={!variantForSize || variantForSize.stock <= 0}
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


      {/* Quantity + Add to Cart */}
      <div className='quantity-container'>
        <div className='flex items-center justify-center gap-[4px]'>
          <Button onClick={decrement} disabled={quantity <= 1} className='quantity-btn'>
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
          disabled={!selectedVariant || selectedVariant.stock <= 0 || quantity <= 0}
          className={`add-to-cart-btn ${(selectedVariant?.stock ?? 0) > 0 ? 'btn-enabled' : 'btn-disabled'}`}
        >
          {(selectedVariant?.stock ?? 0) > 0 ? 'Add to Cart' : 'Out of Stock'}
        </Button>
      </div>
    </Card>
  );
};

export default ProductCard;
