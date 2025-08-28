import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Problem from '@/models/Problem';

// GET: 특정 문제 가져오기
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    await connectDB();
    const problem = await Problem.findById(id);
    
    if (!problem) {
      return NextResponse.json(
        { message: '해당 문제를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(problem);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || '문제 정보를 가져오는데 실패했습니다.' },
      { status: 500 }
    );
  }
} 