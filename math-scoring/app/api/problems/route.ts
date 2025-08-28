import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Problem from '@/models/Problem';

// GET: 모든 문제 목록 가져오기
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const problems = await Problem.find({}).sort({ createdAt: -1 });
    return NextResponse.json(problems);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || '문제 목록을 가져오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

// POST: 새 문제 생성
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // 필수 필드 확인
    if (!body.title || !body.schoolLevel || !body.grade || !body.content || !body.solution) {
      return NextResponse.json(
        { message: '모든 필수 필드를 입력해야 합니다.' },
        { status: 400 }
      );
    }
    
    // 채점 기준 확인
    if (!body.scoringCriteria || !body.scoringCriteria.steps || body.scoringCriteria.steps.length === 0) {
      return NextResponse.json(
        { message: '최소 하나 이상의 채점 기준을 입력해야 합니다.' },
        { status: 400 }
      );
    }
    
    await connectDB();
    const problem = new Problem(body);
    await problem.save();
    
    return NextResponse.json(problem, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || '문제 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
} 