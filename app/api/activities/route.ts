import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Adjust path if your Prisma client is located elsewhere

// GET /api/activities
export async function GET() {
  try {
    const activities = await prisma.activity.findMany({
      include: {
        words: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: activities,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}

// POST /api/activities
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, type, targetWord, difficulty, phonemes, words } = body;

    if (!title || (!targetWord && (!words || words.length === 0))) {
      return NextResponse.json(
        { error: 'Title and target word are required' },
        { status: 400 }
      );
    }

    const wordString =
      targetWord || (typeof words[0] === 'string' ? words[0] : words[0]?.text);

    const newActivity = await prisma.activity.create({
      data: {
        title,
        type: type || 'WORDLE',
        targetWord: wordString,
        difficulty: difficulty || 'MEDIUM',
        phonemes: phonemes || '',
        words: {
          create: Array.isArray(words)
            ? words.map((w: any) => ({
                text: typeof w === 'string' ? w : w.text,
              }))
            : [{ text: wordString }],
        },
      },
      include: {
        words: true,
      },
    });

    return NextResponse.json(
      { success: true, data: newActivity },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'internal server error' },
      { status: 500 }
    );
  }
}