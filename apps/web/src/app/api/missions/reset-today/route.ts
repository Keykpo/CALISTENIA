import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

function startOfDay(d: Date) {
  const dt = new Date(d);
  dt.setHours(0,0,0,0);
  return dt;
}

export async function POST(req: NextRequest) {
  try {
    const today = startOfDay(new Date());

    const result = await prisma.dailyMission.deleteMany({
      where: {
        date: today
      }
    });

    return NextResponse.json({
      success: true,
      message: `Deleted ${result.count} missions from today`,
      count: result.count
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
