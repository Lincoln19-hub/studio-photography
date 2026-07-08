import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { generateInvoiceNumber } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      clientId,
      bookingId,
      items,
      taxRate,
      dueDate,
      notes,
    } = body;

    // Calculate totals
    const amount = items.reduce((sum: number, item: any) => sum + item.rate * item.quantity, 0);
    const taxAmount = amount * (taxRate / 100);
    const total = amount + taxAmount;

    const invoice = await prisma.invoice.create({
      data: {
        clientId,
        bookingId: bookingId || null,
        invoiceNumber: generateInvoiceNumber(),
        amount,
        taxRate: taxRate / 100,
        taxAmount,
        total,
        dueDate: new Date(dueDate),
        notes: notes || null,
        items: {
          create: items.map((item: any) => ({
            description: item.description,
            quantity: parseInt(item.quantity),
            rate: parseFloat(item.rate),
            amount: parseFloat(item.rate) * parseInt(item.quantity),
          })),
        },
      },
      include: {
        client: true,
        items: true,
        booking: true,
      },
    });

    return NextResponse.json({ success: true, invoice });
  } catch (error) {
    console.error('Invoice API error:', error);
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const invoices = await prisma.invoice.findMany({
      include: {
        client: true,
        items: true,
        booking: true,
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(invoices);
  } catch (error) {
    console.error('Invoices API error:', error);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}
