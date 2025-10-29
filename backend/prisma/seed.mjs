import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing existing data...');
  await prisma.forecastLog.deleteMany();
  await prisma.customerQuery.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.store.deleteMany();
  await prisma.user.deleteMany();
  console.log('Existing data cleared.');

  const passwordHash = await bcrypt.hash('demo123', 10);

  const user = await prisma.user.create({
    data: {
      email: 'demo@ecomai.com',
      passwordHash,
      tier: 'premium'
    }
  });
  console.log(`Created user: ${user.email}`);

  const store = await prisma.store.create({
    data: {
      name: 'Demo E-Commerce Store',
      platform: 'shopify',
      userId: user.id
    }
  });
  console.log(`Created store: ${store.name}`);

  const inventoryItems = [
    { productName: 'Wireless Headphones', sku: 'WH-001', currentStock: 45 },
    { productName: 'Smart Watch', sku: 'SW-002', currentStock: 12 },
    { productName: 'Phone Case', sku: 'PC-003', currentStock: 150 },
    { productName: 'USB-C Cable', sku: 'UC-004', currentStock: 5 },
    { productName: 'Laptop Stand', sku: 'LS-005', currentStock: 30 }
  ];

  for (const item of inventoryItems) {
    const createdItem = await prisma.inventoryItem.create({
      data: {
        productName: item.productName,
        sku: item.sku,
        currentStock: item.currentStock,
        storeId: store.id
      }
    });

    console.log(`Created inventory item: ${createdItem.productName}`);
  }

  console.log('Database seeding completed successfully.');
}

main()
  .catch((error) => {
    console.error('Error seeding database:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
