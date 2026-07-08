import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { token: string } }
) {
  try {
    const gallery = await prisma.gallery.findUnique({
      where: { accessToken: params.token },
      include: {
        client: true,
        invoice: {
          include: {
            payments: true,
          },
        },
        photos: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!gallery) {
      return NextResponse.json({ error: 'Gallery not found' }, { status: 404 });
    }

    if (!gallery.isActive) {
      return NextResponse.json({ error: 'Gallery is no longer available' }, { status: 403 });
    }

    // Check if invoice is fully paid
    const totalPaid = gallery.invoice?.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
    const isPaid = totalPaid >= (gallery.invoice?.total || 0);
    const balance = (gallery.invoice?.total || 0) - totalPaid;

    return NextResponse.json({
      gallery: {
        id: gallery.id,
        title: gallery.title,
        description: gallery.description,
        photos: gallery.photos,
        createdAt: gallery.createdAt,
      },
      client: {
        name: gallery.client.name,
      },
      paymentStatus: {
        isPaid,
        total: gallery.invoice?.total || 0,
        paid: totalPaid,
        balance,
        invoiceNumber: gallery.invoice?.invoiceNumber || null,
      },
    });
  } catch (error) {
    console.error('Gallery access error:', error);
    return NextResponse.json({ error: 'Failed to load gallery' }, { status: 500 });
  }
}