import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { invoiceId, amount, method, reference, notes, date } = body;

    const payment = await prisma.payment.create({
      data: {
        invoiceId,
        amount: parseFloat(amount),
        method,
        reference: reference || null,
        notes: notes || null,
        date: date ? new Date(date) : new Date(),
      },
    });

    // Update invoice with payment info
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { payments: true },
    });

    if (invoice) {
      const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0) + parseFloat(amount);
      const newStatus = totalPaid >= invoice.total ? 'paid' : 'unpaid';

      await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          paidAmount: totalPaid,
          paidDate: newStatus === 'paid' ? new Date() : undefined,
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
