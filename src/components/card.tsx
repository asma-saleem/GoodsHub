'use client';
// import { Card, Button } from "antd";
import Image from 'next/image';

import React,{ useState } from 'react';
import { Button, Card } from 'antd';


interface ProductCardProps {
  image: string;
  title: string;
  price: string | number;
}
const AppI: React.FC<ProductCardProps> = ({ image, title, price }) => {

  const [quantity, setQuantity] = useState(1);

  const increment = () => setQuantity((prev) => prev + 1);

  const decrement = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  return(
  <Card
    className="w-full rounded-md border border-[#DFDFDF] bg-white shadow-sm mobile:!px-3 tablet:!px-4"
    cover={
      <Image
        alt="example"
        src={image}
        width={257}
        height={222}
        className="object-contain block mobile:pt-3 tablet:pt-4"
      />
    }
  >
    <div className="mobile:pt-3 tablet:pt-4 flex flex-col gap-y-2">
      <p className="font-inter font-medium text-[14px] leading-[19.2px] !mb-0">
      {title}
    </p>
    <div className="flex justify-start">
      <p className="font-inter font-bold text-[14px] leading-5 text-[#868E96] py-1.25 !mb-0">
        Price:
      </p>
      <p className="font-inter font-normal text-[20px] leading-[30px] text-center text-[#007BFF] !mb-0">
        ${Number(price).toFixed(2)}
      </p>
    </div>
    </div>
    

    <div className="flex justify-between pt-[35px] pb-4">
      <div className="flex items-center justify-center gap-[4px]">
        <Button onClick={increment} className='!text-[#007BFF] !p-0 mobile:!w-6 mobile:!h-6 desktop:!w-9 desktop:!h-9 !text-2xl'> + </Button>
        <Button className='!p-0 mobile:!w-[29px] mobile:!h-6 tablet:!w-[30px] desktop:!w-11 desktop:!h-9'>{quantity}</Button>
        <Button onClick={decrement} className='!text-[#007BFF] !p-0 mobile:!w-6 mobile:!h-6 desktop:!w-9 desktop:!h-9 !text-2xl'> - </Button>
      </div>
      <Button className="!p-0 mobile:!w-[74px] mobile:!h-[24px] tablet:!w-[101px] tablet:!h-9 desktop:!w-[112px] mobile:!px-3 mobile:!py-[6px] font-inter font-normal mobile:!text-[12px] tablet:!text-[16px] desktop:!text-base leading-6 text-center align-middle !bg-[#007BFF] !text-[#FFFFFF] rounded">
        Add to Cart
      </Button>
      {/* !p-0 mobile:!w-[74px] mobile:!h-[23px] tablet:!w-[101px] tablet:!h-9 desktop:!w-[112px] */}
    </div>

    {/* Card Content Below */}
  </Card>
);
};

export default AppI;
