import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { reference, bookingData } = body;

    // Verify payment with Paystack
    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    });

    const verifyData = await verifyRes.json();

    if (!verifyData.status || verifyData.data.status !== 'success') {
      return NextResponse.json(
        { error: 'Payment verification failed' },
        { status: 400 }
      );
    }

    const payment = verifyData.data;
    const amountPaid = payment.amount / 100; // Convert from kobo/pesewas

    // Extract booking data
    const { name, email, phone, service, eventDate, duration, location, budget, notes } = bookingData;

    // Find or create client
    let client = await prisma.client.findUnique({ where: { email } });
    if (!client) {
      client = await prisma.client.create({
        data: { name, email, phone },
      });
    }

    // Calculate totals
    const totalAmount = budget ? parseFloat(budget) : getDefaultPrice(service);
    const depositPercentage = parseInt(process.env.DEPOSIT_PERCENTAGE || '50');
    const depositAmount = (totalAmount * depositPercentage) / 100;

    // Create booking with confirmed status (deposit paid)
    const booking = await prisma.booking.create({
      data: {
        clientId: client.id,
        service,
        eventDate: new Date(eventDate),
        duration: parseInt(duration),
        location: location || null,
        budget: totalAmount,
        notes: notes || null,
        status: 'confirmed',
      },
    });

    // Create invoice for full amount
    const invoice = await prisma.invoice.create({
      data: {
        clientId: client.id,
        bookingId: booking.id,
        invoiceNumber: `INV-${new Date().getFullYear()}-${String(
          (await prisma.invoice.count()) + 1
        ).padStart(3, '0')}`,
        amount: totalAmount,
        taxRate: 0,
        taxAmount: 0,
        total: totalAmount,
        status: 'unpaid',
        dueDate: new Date(eventDate),
        items: {
          create: [
            {
              description: `${service} Photography (${duration} hours)`,
              quantity: 1,
              rate: totalAmount,
              amount: totalAmount,
            },
          ],
        },
      },
    });

    // Record the deposit payment
    await prisma.payment.create({
      data: {
        invoiceId: invoice.id,
        amount: amountPaid,
        method: 'card',
        reference: reference,
        notes: `${depositPercentage}% deposit via Paystack`,
        date: new Date(payment.paid_at),
      },
    });

    // Update invoice with paid amount
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        paidAmount: amountPaid,
        paidDate: new Date(payment.paid_at),
        status: amountPaid >= totalAmount ? 'paid' : 'unpaid',
      },
    });

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        invoiceNumber: invoice.invoiceNumber,
        amountPaid,
        balance: totalAmount - amountPaid,
      },
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}

function getDefaultPrice(service: string): number {
  const prices: Record<string, number> = {
    Wedding: 5000,
    Portrait: 500,
    Event: 2000,
    Commercial: 3000,
  };
  return prices[service] || 1000;
}
