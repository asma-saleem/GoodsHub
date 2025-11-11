import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  const colors = ['Black','White','Green','Grey','Maroon','Pink','Skyblue','Camel','Navy'];
  const colorCodes = ['#000000','#FFFFFF','#008000','#808080','#800000','#FFC0CB','#87CEEB','#C19A6B','#0E3A47'];

  const colorImages: Record<string, string> = {
    Black: '/shirt-black.png',
    White: '/shirt-white.png',
    Green: '/shirt-green.png',
    Grey: '/shirt-grey.png',
    Maroon: '/shirt-maroon.png',
    Pink: '/shirt-pink.png',
    Skyblue: '/shirt-skyblue.png',
    Camel: '/shirt-camel.png',
    Navy: '/shirt-navy.png'
  };

  const shirtNames = [
    'Casual Shirt', 'Formal Shirt', 'Polo Shirt', 'T-Shirt', 'Hoodie',
    'Henley Shirt', 'Denim Shirt', 'Flannel Shirt', 'Linen Shirt', 'Sweatshirt'
  ];
  const sizes = ['S','M','L','XL'];

  let colorIndex = 0;

  for (let i = 0; i < 80; i++) { 
    const typeName = shirtNames[i % shirtNames.length];

    const productColors = [];
    for (let j = 0; j < 4; j++) {
      productColors.push(colors[(colorIndex + j) % colors.length]);
    }
    colorIndex += 4;

    const variantsData = productColors.flatMap((color, colorIdx) =>
      sizes.map((size, sizeIdx) => {
        const basePrice = 100 + (i + 1) * 5;
        const price = basePrice + colorIdx * 10 + sizeIdx * 5;

        return {
          color,
          colorCode: colorCodes[colors.indexOf(color)],
          size,
          price,
          stock: 10 + (i + 1) * 2,
          image: colorImages[color],
          isVariantDeleted: false
        };
      })
    );

    const product = await prisma.product.create({
      data: {
        title: `${typeName} ${i + 1}`,
        isProductDeleted: false,
        variants: { create: variantsData }
      },
      include: { variants: true }
    });

    console.log(`Inserted product: ${product.title} with ${product.variants.length} variants`);
    await delay(200);
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

//   console.log('Admin ensured in DB:', admin.email);
// }

// main()
//   .then(() => prisma.$disconnect())
//   .catch((e) => {
//     console.error(e);
//     prisma.$disconnect();
//     process.exit(1);
//   });

