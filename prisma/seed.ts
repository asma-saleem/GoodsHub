// import { PrismaClient } from '@prisma/client';
// const prisma = new PrismaClient();
// // import { prisma } from '@/lib/prisma';


// async function main() {
//   const products = [
//   {
//     image: '/dashboard-image-1.png',
//     title: 'BT Speaker Black',
//     price: 200,
//     color: 'Black',
//     colorCode: '#000000',
//     stock: 50,
//     size: '12'
//   },
//   {
//     image: '/dashboard-image-2.png',
//     title: 'LED Lamp White 15',
//     price: 120,
//     color: 'White',
//     colorCode: '#FFFFFF',
//     stock: 75,
//     size: '15'
//   },
//   {
//     image: '/dashboard-image-3.png',
//     title: 'Leather Bag Brown',
//     price: 300,
//     color: 'Brown',
//     colorCode: '#8B4513',
//     stock: 30,
//     size: '18'
//   },
//   {
//     image: '/dashboard-image-4.png',
//     title: 'Charge Pad Gray20',
//     price: 250,
//     color: 'Gray',
//     colorCode: '#808080',
//     stock: 100,
//     size: '20'
//   },
//   {
//     image: '/dashboard-image-4.png',
//     title: 'Charge Pad Black22',
//     price: 250,
//     color: 'Black',
//     colorCode: '#000000',
//     stock: 90,
//     size: '22'
//   },
//   {
//     image: '/dashboard-image-3.png',
//     title: 'Leather Bag DBlue',
//     price: 300,
//     color: 'Dark Blue',
//     colorCode: '#00008B',
//     stock: 25,
//     size: '16'
//   },
//   {
//     image: '/dashboard-image-2.png',
//     title: 'LED Lamp Silver14',
//     price: 120,
//     color: 'Silver',
//     colorCode: '#C0C0C0',
//     stock: 60,
//     size: '14'
//   },
//   {
//     image: '/dashboard-image-1.png',
//     title: 'BT Speaker Red 10',
//     price: 200,
//     color: 'Red',
//     colorCode: '#FF0000',
//     stock: 40,
//     size: '10'
//   },
//   {
//     image: '/dashboard-image-1.png',
//     title: 'BT Speaker Blue12',
//     price: 210,
//     color: 'Blue',
//     colorCode: '#0000FF',
//     stock: 35,
//     size: '12'
//   },
//   {
//     image: '/dashboard-image-2.png',
//     title: 'LED Lamp Black16',
//     price: 125,
//     color: 'Black',
//     colorCode: '#000000',
//     stock: 70,
//     size: '16'
//   },
//   {
//     image: '/dashboard-image-3.png',
//     title: 'Leather Bag Gray',
//     price: 310,
//     color: 'Gray',
//     colorCode: '#808080',
//     stock: 20,
//     size: '15'
//   },
//   {
//     image: '/dashboard-image-4.png',
//     title: 'Charge Pad Blue18',
//     price: 260,
//     color: 'Blue',
//     colorCode: '#0000FF',
//     stock: 85,
//     size: '18'
//   },
//   {
//     image: '/dashboard-image-4.png',
//     title: 'Charge Pad White21',
//     price: 255,
//     color: 'White',
//     colorCode: '#FFFFFF',
//     stock: 95,
//     size: '21'
//   },
//   {
//     image: '/dashboard-image-3.png',
//     title: 'Leather Bag Green',
//     price: 320,
//     color: 'Green',
//     colorCode: '#008000',
//     stock: 28,
//     size: '17'
//   },
//   {
//     image: '/dashboard-image-2.png',
//     title: 'LED Lamp Gold 13',
//     price: 130,
//     color: 'Gold',
//     colorCode: '#FFD700',
//     stock: 55,
//     size: '13'
//   },
//   {
//     image: '/dashboard-image-1.png',
//     title: 'BT Speaker Gray11',
//     price: 205,
//     color: 'Gray',
//     colorCode: '#808080',
//     stock: 45,
//     size: '11'
//   }
// ];

//   await prisma.product.createMany({
//     data: products,
//     skipDuplicates: true
//   });

//   console.log('Products seeded');
// }

// main()
//   .then(() => prisma.$disconnect())
//   .catch((e) => {
//     console.error(e);
//     prisma.$disconnect();
//     process.exit(1);
//   });

import { PrismaClient, VariantAvailability } from '@prisma/client';
const prisma = new PrismaClient();

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  const colors = ['Black','White','Green','Grey','Maroon','Pink','Skyblue','Camel','Zinc'];
  const colorCodes = ['#000000','#FFFFFF','#008000','#808080','#800000','#FFC0CB','#87CEEB','#C19A6B','#E0E0E0'];

  const colorImages: Record<string, string> = {
    Black: '/shirt-black.png',
    White: '/shirt-white.png',
    Green: '/shirt-green.png',
    Grey: '/shirt-grey.png',
    Maroon: '/shirt-maroon.png',
    Pink: '/shirt-pink.png',
    Skyblue: '/shirt-skyblue.png',
    Camel: '/shirt-camel.png',
    Zinc: '/shirt-zinc.png'
  };

  const shirtNames = [
    'Casual Shirt', 'Formal Shirt', 'Polo Shirt', 'T-Shirt', 'Hoodie',
    'Henley Shirt', 'Denim Shirt', 'Flannel Shirt', 'Linen Shirt', 'Sweatshirt'
  ];
  const sizes = ['S','M','L','XL'];

  let colorIndex = 0;

  for (let i = 0; i < 40; i++) { // 40 products
    const typeName = shirtNames[i % shirtNames.length];

    // Pick 4 consecutive colors for this product (wrap around)
    const productColors = [];
    for (let j = 0; j < 4; j++) {
      productColors.push(colors[(colorIndex + j) % colors.length]);
    }
    colorIndex += 4; // Move to next set of colors

    // Build 16 variants (4 colors × 4 sizes) with dynamic pricing
    const variantsData = productColors.flatMap((color, colorIdx) =>
      sizes.map((size, sizeIdx) => {
        // Base price + color increment + size increment
        const basePrice = 100 + (i + 1) * 5;
        const price = basePrice + colorIdx * 10 + sizeIdx * 5; // e.g., color adds 10, size adds 5

        return {
          color,
          colorCode: colorCodes[colors.indexOf(color)],
          size,
          price,
          stock: 10 + (i + 1) * 2,
          image: colorImages[color],
          availabilityStatus: VariantAvailability.ACTIVE
        };
      })
    );

    const product = await prisma.product.create({
      data: {
        title: `${typeName} ${i + 1}`,
        isDeleted: 'active',
        variants: { create: variantsData }
      },
      include: { variants: true }
    });

    console.log(`Inserted product: ${product.title} with ${product.variants.length} variants`);
    await delay(200); // faster for large number of products
  }

  console.log('All 40 shirt products seeded with dynamic pricing');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });

// import { PrismaClient } from '@prisma/client';
// import bcrypt from 'bcryptjs';

// const prisma = new PrismaClient();

// async function main() {
//   const hashedPassword = await bcrypt.hash('Admin@123', 10);

 
//   const admin = await prisma.user.upsert({
//     where: { email: 'admin@example.com' }, 
//     update: {}, 
//     create: {
//       fullname: 'Admin',
//       email: 'admin@example.com',
//       password: hashedPassword,
//       mobile: '03001234567',
//       role: 'ADMIN' 
//     }
//   });

//   console.log('✅ Admin ensured in DB:', admin.email);
// }

// main()
//   .then(() => prisma.$disconnect())
//   .catch((e) => {
//     console.error(e);
//     prisma.$disconnect();
//     process.exit(1);
//   });

