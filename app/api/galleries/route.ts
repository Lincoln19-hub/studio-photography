import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { invoiceId, title, description } = body;

    // Check if invoice is fully paid
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { payments: true, client: true },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
    const isPaid = totalPaid >= invoice.total;

    if (!isPaid) {
      return NextResponse.json({
        error: 'Gallery cannot be created. Invoice must be fully paid.',
        balance: invoice.total - totalPaid
      }, { status: 400 });
    }

    // Generate secure access token
    const accessToken = Math.random().toString(36).substring(2, 15) + 
                        Math.random().toString(36).substring(2, 15);

    const gallery = await prisma.gallery.create({
      data: {
        invoiceId,
        clientId: invoice.clientId,
        title: title || `Gallery for ${invoice.invoiceNumber}`,
        description: description || null,
        accessToken,
      },
      include: { client: true },
    });

    return NextResponse.json({
      success: true,
      gallery,
      shareLink: `/gallery/${accessToken}`,
    });
  } catch (error) {
    console.error('Gallery creation error:', error);
    return NextResponse.json({ error: 'Failed to create gallery' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const galleries = await prisma.gallery.findMany({
      include: {
        client: true,
        invoice: true,
        _count: { select: { photos: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(galleries);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch galleries' }, { status: 500 });
  }
}