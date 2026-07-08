import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create sample clients
  const client1 = await prisma.client.create({
    data: {
      name: 'Sarah & James Mensah',
      email: 'sarah.mensah@email.com',
      phone: '+233 24 123 4567',
      address: 'East Legon, Accra',
    },
  });

  const client2 = await prisma.client.create({
    data: {
      name: 'Kofi Asante',
      email: 'kofi.asante@company.com',
      phone: '+233 20 987 6543',
      address: 'Airport Residential, Accra',
    },
  });

  const client3 = await prisma.client.create({
    data: {
      name: 'Ama Serwaa',
      email: 'ama.serwaa@email.com',
      phone: '+233 27 555 1234',
      address: 'Osu, Accra',
    },
  });

  // Create bookings
  const booking1 = await prisma.booking.create({
    data: {
      clientId: client1.id,
      service: 'Wedding',
      eventDate: new Date('2026-08-15'),
      duration: 8,
      location: 'La Palm Royal Beach Hotel',
      budget: 5000,
      notes: 'Traditional Ghanaian wedding, 200 guests',
      status: 'confirmed',
    },
  });

  const booking2 = await prisma.booking.create({
    data: {
      clientId: client2.id,
      service: 'Event',
      eventDate: new Date('2026-07-20'),
      duration: 4,
      location: 'Kempinski Hotel, Accra',
      budget: 2000,
      notes: 'Corporate annual dinner',
      status: 'pending',
    },
  });

  const booking3 = await prisma.booking.create({
    data: {
      clientId: client3.id,
      service: 'Portrait',
      eventDate: new Date('2026-07-10'),
      duration: 2,
      location: 'Studio',
      budget: 500,
      notes: 'Professional headshots for LinkedIn',
      status: 'completed',
    },
  });

  // Create invoices
  const invoice1 = await prisma.invoice.create({
    data: {
      bookingId: booking1.id,
      clientId: client1.id,
      invoiceNumber: 'INV-2026-001',
      amount: 4500,
      taxRate: 12.5,
      taxAmount: 562.5,
      total: 5062.5,
      status: 'paid',
      dueDate: new Date('2026-08-10'),
      paidDate: new Date('2026-08-01'),
      paidAmount: 5062.5,
      items: {
        create: [
          { description: 'Full-day wedding coverage (8 hours)', quantity: 1, rate: 3000, amount: 3000 },
          { description: 'Second photographer', quantity: 1, rate: 800, amount: 800 },
          { description: 'Premium album (50 pages)', quantity: 1, rate: 500, amount: 500 },
          { description: 'Edited digital files (USB)', quantity: 1, rate: 200, amount: 200 },
        ],
      },
      payments: {
        create: [
          { amount: 2500, method: 'bank_transfer', reference: 'TXN-001', date: new Date('2026-07-15'), notes: '50% deposit' },
          { amount: 2562.5, method: 'bank_transfer', reference: 'TXN-002', date: new Date('2026-08-01'), notes: 'Final payment' },
        ],
      },
    },
  });

  const invoice2 = await prisma.invoice.create({
    data: {
      bookingId: booking2.id,
      clientId: client2.id,
      invoiceNumber: 'INV-2026-002',
      amount: 1800,
      taxRate: 12.5,
      taxAmount: 225,
      total: 2025,
      status: 'unpaid',
      dueDate: new Date('2026-07-15'),
      items: {
        create: [
          { description: 'Event coverage (4 hours)', quantity: 1, rate: 1200, amount: 1200 },
          { description: 'Photo editing & delivery', quantity: 1, rate: 400, amount: 400 },
          { description: 'Same-day highlights video', quantity: 1, rate: 200, amount: 200 },
        ],
      },
    },
  });

  const invoice3 = await prisma.invoice.create({
    data: {
      bookingId: booking3.id,
      clientId: client3.id,
      invoiceNumber: 'INV-2026-003',
      amount: 450,
      taxRate: 12.5,
      taxAmount: 56.25,
      total: 506.25,
      status: 'paid',
      dueDate: new Date('2026-07-10'),
      paidDate: new Date('2026-07-10'),
      paidAmount: 506.25,
      items: {
        create: [
          { description: 'Portrait session (2 hours)', quantity: 1, rate: 300, amount: 300 },
          { description: 'Retouched images (10 photos)', quantity: 1, rate: 150, amount: 150 },
        ],
      },
      payments: {
        create: [
          { amount: 506.25, method: 'mobile_money', reference: 'MM-001', date: new Date('2026-07-10'), notes: 'Full payment' },
        ],
      },
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log(`   Clients: ${await prisma.client.count()}`);
  console.log(`   Bookings: ${await prisma.booking.count()}`);
  console.log(`   Invoices: ${await prisma.invoice.count()}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
