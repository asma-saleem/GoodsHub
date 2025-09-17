import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();


async function main() {
  const products = [
  {
    image: '/dashboard-image-1.png',
    title: 'Bluetooth Wireless Speaker with Superior Sound Quality',
    price: 200,
    color: 'Black',
    colorCode: '#000000',
    stock: 50,
    size: '12'
  },
  {
    image: '/dashboard-image-2.png',
    title: 'LED Desk Lamp with Adjustable Brightness and Color Temperature',
    price: 120,
    color: 'White',
    colorCode: '#FFFFFF',
    stock: 75,
    size: '15'
  },
  {
    image: '/dashboard-image-3.png',
    title: 'Stylish Leather Backpack for Daily Use - Multiple Colors Available',
    price: 300,
    color: 'Brown',
    colorCode: '#8B4513',
    stock: 30,
    size: '18'
  },
  {
    image: '/dashboard-image-4.png',
    title: 'Wireless Charging Pad for Smartphones and Devices',
    price: 250,
    color: 'Gray',
    colorCode: '#808080',
    stock: 100,
    size: '20'
  },
  {
    image: '/dashboard-image-4.png',
    title: 'Wireless Charging Pad for Smartphones and Devices',
    price: 250,
    color: 'Black',
    colorCode: '#000000',
    stock: 90,
    size: '22'
  },
  {
    image: '/dashboard-image-3.png',
    title: 'Stylish Leather Backpack for Daily Use - Multiple Colors Available',
    price: 300,
    color: 'Dark Blue',
    colorCode: '#00008B',
    stock: 25,
    size: '16'
  },
  {
    image: '/dashboard-image-2.png',
    title: 'LED Desk Lamp with Adjustable Brightness and Color Temperature',
    price: 120,
    color: 'Silver',
    colorCode: '#C0C0C0',
    stock: 60,
    size: '14'
  },
  {
    image: '/dashboard-image-1.png',
    title: 'Bluetooth Wireless Speaker with Superior Sound Quality',
    price: 200,
    color: 'Red',
    colorCode: '#FF0000',
    stock: 40,
    size: '10'
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
