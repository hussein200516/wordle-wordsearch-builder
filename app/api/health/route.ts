import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Adjust path if your Prisma client is located elsewhere

export async function GET() {
  try {
    const totalActivities = await prisma.activity.count();
    const wordleCount = await prisma.activity.count({
      where: { type: 'WORDLE' },
    });
    const wordSearchCount = await prisma.activity.count({
      where: { type: 'WORD_SEARCH' },
    });

    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: 'operational',
        api: 'operational',
      },
      statistics: {
        totalActivities,
        wordleCount,
        wordSearchCount,
        mostUsedType: wordleCount >= wordSearchCount ? 'WORDLE' : 'WORD_SEARCH',
      },
    };

    return NextResponse.json(healthData, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message,
        services: {
          database: 'down',
          api: 'operational',
        },
      },
      { status: 500 }
    );
  }
}