import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { url, caption } = body;

    const photo = await prisma.galleryPhoto.create({
      data: {
        galleryId: params.id,
        url,
        caption: caption || null,
      },
    });

    return NextResponse.json({ success: true, photo });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add photo' }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const photos = await prisma.galleryPhoto.findMany({
      where: { galleryId: params.id },
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(photos);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch photos' }, { status: 500 });
  }
}