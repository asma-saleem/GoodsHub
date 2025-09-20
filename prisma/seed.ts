import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();


async function main() {
  const products = [
  {
    image: '/dashboard-image-1.png',
    title: 'BT Speaker Black',
    price: 200,
    color: 'Black',
    colorCode: '#000000',
    stock: 50,
    size: '12'
  },
  {
    image: '/dashboard-image-2.png',
    title: 'LED Lamp White 15',
    price: 120,
    color: 'White',
    colorCode: '#FFFFFF',
    stock: 75,
    size: '15'
  },
  {
    image: '/dashboard-image-3.png',
    title: 'Leather Bag Brown',
    price: 300,
    color: 'Brown',
    colorCode: '#8B4513',
    stock: 30,
    size: '18'
  },
  {
    image: '/dashboard-image-4.png',
    title: 'Charge Pad Gray20',
    price: 250,
    color: 'Gray',
    colorCode: '#808080',
    stock: 100,
    size: '20'
  },
  {
    image: '/dashboard-image-4.png',
    title: 'Charge Pad Black22',
    price: 250,
    color: 'Black',
    colorCode: '#000000',
    stock: 90,
    size: '22'
  },
  {
    image: '/dashboard-image-3.png',
    title: 'Leather Bag DBlue',
    price: 300,
    color: 'Dark Blue',
    colorCode: '#00008B',
    stock: 25,
    size: '16'
  },
  {
    image: '/dashboard-image-2.png',
    title: 'LED Lamp Silver14',
    price: 120,
    color: 'Silver',
    colorCode: '#C0C0C0',
    stock: 60,
    size: '14'
  },
  {
    image: '/dashboard-image-1.png',
    title: 'BT Speaker Red 10',
    price: 200,
    color: 'Red',
    colorCode: '#FF0000',
    stock: 40,
    size: '10'
  },
  {
    image: '/dashboard-image-1.png',
    title: 'BT Speaker Blue12',
    price: 210,
    color: 'Blue',
    colorCode: '#0000FF',
    stock: 35,
    size: '12'
  },
  {
    image: '/dashboard-image-2.png',
    title: 'LED Lamp Black16',
    price: 125,
    color: 'Black',
    colorCode: '#000000',
    stock: 70,
    size: '16'
  },
  {
    image: '/dashboard-image-3.png',
    title: 'Leather Bag Gray',
    price: 310,
    color: 'Gray',
    colorCode: '#808080',
    stock: 20,
    size: '15'
  },
  {
    image: '/dashboard-image-4.png',
    title: 'Charge Pad Blue18',
    price: 260,
    color: 'Blue',
    colorCode: '#0000FF',
    stock: 85,
    size: '18'
  },
  {
    image: '/dashboard-image-4.png',
    title: 'Charge Pad White21',
    price: 255,
    color: 'White',
    colorCode: '#FFFFFF',
    stock: 95,
    size: '21'
  },
  {
    image: '/dashboard-image-3.png',
    title: 'Leather Bag Green',
    price: 320,
    color: 'Green',
    colorCode: '#008000',
    stock: 28,
    size: '17'
  },
  {
    image: '/dashboard-image-2.png',
    title: 'LED Lamp Gold 13',
    price: 130,
    color: 'Gold',
    colorCode: '#FFD700',
    stock: 55,
    size: '13'
  },
  {
    image: '/dashboard-image-1.png',
    title: 'BT Speaker Gray11',
    price: 205,
    color: 'Gray',
    colorCode: '#808080',
    stock: 45,
    size: '11'
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
