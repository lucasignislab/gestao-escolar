import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Busca o perfil do professor usando o email da sessão
    const profile = await prisma.profile.findFirst({
      where: {
        username: session.user.email,
      },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Busca as aulas do professor
    const aulas = await prisma.lesson.findMany({
      where: {
        teacher: {
          profileId: profile.id,
        },
      },
      include: {
        subject: true,
        class: true,
      },
    });

    return NextResponse.json(aulas);
  } catch (error) {
    console.error('Error fetching teacher lessons:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
