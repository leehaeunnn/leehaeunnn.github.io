import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Submission from '@/models/Submission';

// GET: 특정 제출물 가져오기
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    await connectDB();
    const submission = await Submission.findById(id);
    
    if (!submission) {
      return NextResponse.json(
        { message: '해당 제출물을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(submission);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || '제출물 정보를 가져오는데 실패했습니다.' },
      { status: 500 }
    );
  }
} 