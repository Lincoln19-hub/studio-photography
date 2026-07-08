import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      include: { client: true },
      orderBy: { eventDate: 'desc' },
    });
    const formatted = bookings.map((b) => ({
      id: b.id,
      service: b.service,
      eventDate: b.eventDate.toISOString(),
      clientName: b.client.name,
    }));
    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Bookings list API error:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}
