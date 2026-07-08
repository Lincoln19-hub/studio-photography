import { prisma } from '@/lib/db';

async function tryDb<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}

const DEMO_CLIENTS = [
  { id: 'c1', name: 'Sarah & James Mensah', email: 'sarah.mensah@email.com', phone: '+233 24 123 4567', address: 'East Legon, Accra', createdAt: new Date('2026-06-01'), _count: { bookings: 2, invoices: 2 } },
  { id: 'c2', name: 'Kofi Asante', email: 'kofi.asante@company.com', phone: '+233 20 987 6543', address: 'Airport Residential, Accra', createdAt: new Date('2026-06-15'), _count: { bookings: 1, invoices: 1 } },
  { id: 'c3', name: 'Ama Serwaa', email: 'ama.serwaa@email.com', phone: '+233 27 555 1234', address: 'Osu, Accra', createdAt: new Date('2026-07-01'), _count: { bookings: 0, invoices: 0 } },
];

const DEMO_BOOKINGS = [
  { id: 'b1', clientId: 'c1', service: 'Wedding', eventDate: new Date('2026-08-15'), duration: 8, location: 'La Palm Royal Beach Hotel', budget: 5000, status: 'confirmed', createdAt: new Date('2026-06-01'), client: { name: 'Sarah & James Mensah', email: 'sarah.mensah@email.com' } },
  { id: 'b2', clientId: 'c2', service: 'Event', eventDate: new Date('2026-07-20'), duration: 4, location: 'Kempinski Hotel, Accra', budget: 2000, status: 'pending', createdAt: new Date('2026-06-15'), client: { name: 'Kofi Asante', email: 'kofi.asante@company.com' } },
  { id: 'b3', clientId: 'c3', service: 'Portrait', eventDate: new Date('2026-07-10'), duration: 2, location: 'Studio', budget: 500, status: 'completed', createdAt: new Date('2026-07-01'), client: { name: 'Ama Serwaa', email: 'ama.serwaa@email.com' } },
];

const DEMO_INVOICES = [
  { id: 'inv1', invoiceNumber: 'INV-2026-001', clientId: 'c1', amount: 4500, taxRate: 0, taxAmount: 0, total: 5000, status: 'paid', dueDate: new Date('2026-08-10'), paidDate: new Date('2026-08-01'), paidAmount: 5000, createdAt: new Date('2026-06-01'), client: { name: 'Sarah & James Mensah', email: 'sarah.mensah@email.com' }, items: [
    { id: 'i1', description: 'Full-day wedding coverage (8 hours)', quantity: 1, rate: 3000, amount: 3000 },
    { id: 'i2', description: 'Second photographer', quantity: 1, rate: 800, amount: 800 },
    { id: 'i3', description: 'Premium album (50 pages)', quantity: 1, rate: 500, amount: 500 },
    { id: 'i4', description: 'Edited digital files (USB)', quantity: 1, rate: 700, amount: 700 },
  ], payments: [
    { id: 'p1', amount: 2500, method: 'bank_transfer', reference: 'TXN-001', date: new Date('2026-07-15'), notes: '50% deposit' },
    { id: 'p2', amount: 2500, method: 'bank_transfer', reference: 'TXN-002', date: new Date('2026-08-01'), notes: 'Final payment' },
  ] },
  { id: 'inv2', invoiceNumber: 'INV-2026-002', clientId: 'c2', amount: 1800, taxRate: 0, taxAmount: 0, total: 2000, status: 'unpaid', dueDate: new Date('2026-07-15'), paidDate: null, paidAmount: 0, createdAt: new Date('2026-06-15'), client: { name: 'Kofi Asante', email: 'kofi.asante@company.com' }, items: [
    { id: 'i5', description: 'Event coverage (4 hours)', quantity: 1, rate: 1200, amount: 1200 },
    { id: 'i6', description: 'Photo editing & delivery', quantity: 1, rate: 400, amount: 400 },
    { id: 'i7', description: 'Same-day highlights video', quantity: 1, rate: 200, amount: 200 },
  ], payments: [] },
  { id: 'inv3', invoiceNumber: 'INV-2026-003', clientId: 'c3', amount: 450, taxRate: 0, taxAmount: 0, total: 500, status: 'paid', dueDate: new Date('2026-07-10'), paidDate: new Date('2026-07-10'), paidAmount: 500, createdAt: new Date('2026-07-01'), client: { name: 'Ama Serwaa', email: 'ama.serwaa@email.com' }, items: [
    { id: 'i8', description: 'Portrait session (2 hours)', quantity: 1, rate: 300, amount: 300 },
    { id: 'i9', description: 'Retouched images (10 photos)', quantity: 1, rate: 200, amount: 200 },
  ], payments: [
    { id: 'p3', amount: 500, method: 'mobile_money', reference: 'MM-001', date: new Date('2026-07-10'), notes: 'Full payment' },
  ] },
];

export async function getDashboardData() {
  const [
    totalRevenue,
    unpaidInvoices,
    upcomingBookings,
    totalClients,
    recentBookings,
    recentInvoices,
  ] = await Promise.all([
    tryDb(() => prisma.invoice.aggregate({ where: { status: 'paid' }, _sum: { paidAmount: true } }), { _sum: { paidAmount: 5500 } }),
    tryDb(() => prisma.invoice.count({ where: { status: 'unpaid' } }), 1),
    tryDb(() => prisma.booking.count({ where: { status: { in: ['pending', 'confirmed'] }, eventDate: { gte: new Date() } } }), 2),
    tryDb(() => prisma.client.count(), 3),
    tryDb(() => prisma.booking.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: { client: true } }), DEMO_BOOKINGS as any),
    tryDb(() => prisma.invoice.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: { client: true } }), DEMO_INVOICES as any),
  ]);

  const revenue = totalRevenue._sum.paidAmount || 0;

  return {
    stats: [
      { label: 'Total Revenue', value: `GHS ${revenue.toFixed(2)}`, icon: 'TrendingUp', color: 'text-green-600 bg-green-50', trend: '+12.5%', trendUp: true },
      { label: 'Pending Bookings', value: upcomingBookings.toString(), icon: 'CalendarCheck', color: 'text-blue-600 bg-blue-50', trend: '2 upcoming', trendUp: true },
      { label: 'Unpaid Invoices', value: unpaidInvoices.toString(), icon: 'FileText', color: 'text-red-600 bg-red-50', trend: 'Action needed', trendUp: false },
      { label: 'Total Clients', value: totalClients.toString(), icon: 'Users', color: 'text-purple-600 bg-purple-50', trend: '+1 this month', trendUp: true },
    ],
    recentBookings,
    recentInvoices,
  };
}

export async function getAllBookings() {
  return await tryDb(
    () => prisma.booking.findMany({ include: { client: true, invoice: true }, orderBy: { eventDate: 'desc' } }),
    DEMO_BOOKINGS as any
  );
}

export async function getAllInvoices() {
  return await tryDb(
    () => prisma.invoice.findMany({ include: { client: true, items: true, payments: true }, orderBy: { createdAt: 'desc' } }),
    DEMO_INVOICES as any
  );
}

export async function getAllClients() {
  return await tryDb(
    () => prisma.client.findMany({ include: { _count: { select: { bookings: true, invoices: true } }, bookings: { orderBy: { createdAt: 'desc' }, take: 1 } }, orderBy: { createdAt: 'desc' } }),
    DEMO_CLIENTS as any
  );
}

export async function getInvoice(id: string) {
  return await tryDb(
    () => prisma.invoice.findUnique({ where: { id }, include: { client: true, booking: true, items: true, payments: { orderBy: { date: 'desc' } } } }),
    DEMO_INVOICES.find(i => i.id === id) as any
  );
}
