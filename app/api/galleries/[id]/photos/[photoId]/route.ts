import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; photoId: string } }
) {
  try {
    await prisma.galleryPhoto.delete({
      where: { id: params.photoId },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete photo' }, { status: 500 });
  }
}