import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, service, eventDate, duration, location, budget, notes } = body;

    // Find or create client
    let client = await prisma.client.findUnique({ where: { email } });
    if (!client) {
      client = await prisma.client.create({
        data: { name, email, phone },
      });
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        clientId: client.id,
        service,
        eventDate: new Date(eventDate),
        duration: parseInt(duration),
        location: location || null,
        budget: budget ? parseFloat(budget) : null,
        notes: notes || null,
        status: 'pending',
      },
      include: { client: true },
    });

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    console.error('Booking API error:', error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      include: { client: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Bookings API error:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}
