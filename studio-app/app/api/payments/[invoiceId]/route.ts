import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: { invoiceId: string } }
) {
  try {
    const body = await request.json();
    const { amount, method, reference, notes, date } = body;

    const payment = await prisma.payment.create({
      data: {
        invoiceId: params.invoiceId,
        amount: parseFloat(amount),
        method,
        reference: reference || null,
        notes: notes || null,
        date: date ? new Date(date) : new Date(),
      },
    });

    // Update invoice totals
    const allPayments = await prisma.payment.findMany({
      where: { invoiceId: params.invoiceId },
    });
    const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0);

    const invoice = await prisma.invoice.findUnique({
      where: { id: params.invoiceId },
    });

    if (invoice) {
      const newStatus = totalPaid >= invoice.total ? 'paid' : 'unpaid';
      await prisma.invoice.update({
        where: { id: params.invoiceId },
        data: {
          paidAmount: totalPaid,
          paidDate: newStatus === 'paid' ? new Date() : invoice.paidDate,
          status: newStatus,
        },
      });
    }

    return NextResponse.json({ success: true, payment });
  } catch (error) {
    console.error('Payment API error:', error);
    return NextResponse.json({ error: 'Failed to record payment' }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: { invoiceId: string } }
) {
  try {
    const payments = await prisma.payment.findMany({
      where: { invoiceId: params.invoiceId },
      orderBy: { date: 'desc' },
    });
    return NextResponse.json(payments);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }
}
