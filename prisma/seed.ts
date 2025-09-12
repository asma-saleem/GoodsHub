import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();


async function main() {
  const products = [
    {
    image: '/dashboard-image-1.png',
    title: 'Bluetooth Wireless Speaker with Superior Sound Quality',
    price: 200
  },
  {
    image: '/dashboard-image-2.png',
    title: 'LED Desk Lamp with Adjustable Brightness and Color Temperature',
    price: 120
  },
  {
    image: '/dashboard-image-3.png',
    title: 'Stylish Leather Backpack for Daily Use - Multiple Colors Available',
    price: 300
  },
  {
    image: '/dashboard-image-4.png',
    title: 'Wireless Charging Pad for Smartphones and Devices',
    price: 250
  },
  {
    image: '/dashboard-image-4.png',
    title: 'Wireless Charging Pad for Smartphones and Devices',
    price: 250
  },
  {
    image: '/dashboard-image-3.png',
    title: 'Stylish Leather Backpack for Daily Use - Multiple Colors Available',
    price: 300
  },
  {
    image: '/dashboard-image-2.png',
    title: 'LED Desk Lamp with Adjustable Brightness and Color Temperature',
    price: 120
  },
  {
    image: '/dashboard-image-1.png',
    title: 'Bluetooth Wireless Speaker with Superior Sound Quality',
    price: 200
  }
  ];

  await prisma.product.createMany({
    data: products,
    skipDuplicates: true
  });

  console.log('✅ Products seeded');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
