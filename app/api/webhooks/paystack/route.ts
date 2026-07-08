import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const event = body.event;

    // Verify webhook signature
    const hash = await crypto.subtle.digest(
      'SHA-512',
      new TextEncoder().encode(JSON.stringify(body))
    );
    const signature = Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    if (signature !== request.headers.get('x-paystack-signature')) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    if (event === 'charge.success') {
      const data = body.data;
      const reference = data.reference;
      const amountPaid = data.amount / 100;

      // Find invoice by reference in payments
      const payment = await prisma.payment.findFirst({
        where: { reference },
        include: { invoice: true },
      });

      if (payment && payment.invoice) {
        // Update invoice status if fully paid
        const totalPaid = await prisma.payment.aggregate({
          where: { invoiceId: payment.invoiceId },
          _sum: { amount: true },
        });

        const totalAmount = payment.invoice.total;
        const newStatus = (totalPaid._sum.amount || 0) >= totalAmount ? 'paid' : 'unpaid';

        await prisma.invoice.update({
          where: { id: payment.invoiceId },
          data: {
            paidAmount: totalPaid._sum.amount || 0,
            paidDate: newStatus === 'paid' ? new Date() : payment.invoice.paidDate,
            status: newStatus,
          },
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}
