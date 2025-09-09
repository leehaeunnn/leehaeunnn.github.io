import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Problem from '@/models/Problem';
import Submission from '@/models/Submission';

// POST: 새 풀이 제출 및 자동 채점
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // 필수 필드 확인
    if (!body.problemId || !body.studentName || !body.studentAnswer) {
      return NextResponse.json(
        { message: '모든 필수 필드를 입력해야 합니다.' },
        { status: 400 }
      );
    }
    
    await connectDB();
    
    // 문제 정보 가져오기
    const problem = await Problem.findById(body.problemId);
    if (!problem) {
      return NextResponse.json(
        { message: '해당 문제를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    // 제출 정보 저장
    const submission = new Submission({
      problemId: body.problemId,
      studentName: body.studentName,
      studentAnswer: body.studentAnswer,
      isScored: false
    });
    
    await submission.save();
    
    // 자동 채점 로직
    await scoreSubmission(submission._id);
    
    // 채점된 제출 정보 가져오기
    const scoredSubmission = await Submission.findById(submission._id);
    
    return NextResponse.json(scoredSubmission, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || '풀이 제출에 실패했습니다.' },
      { status: 500 }
    );
  }
}

// 자동 채점 함수
async function scoreSubmission(submissionId: string) {
  try {
    // 제출 정보 가져오기
    const submission = await Submission.findById(submissionId);
    if (!submission) {
      throw new Error('제출 정보를 찾을 수 없습니다.');
    }
    
    // 문제 정보 가져오기
    const problem = await Problem.findById(submission.problemId);
    if (!problem) {
      throw new Error('문제 정보를 찾을 수 없습니다.');
    }
    
    // 채점 준비
    const scoringCriteria = problem.scoringCriteria.steps;
    const studentAnswer = submission.studentAnswer.toLowerCase();
    const modelSolution = problem.solution.toLowerCase();
    const stepScores = [];
    let totalScore = 0;
    let totalPossible = 0;
    let overallFeedback = '';
    
    // 각 단계별 채점
    for (let i = 0; i < scoringCriteria.length; i++) {
      const step = scoringCriteria[i];
      const stepDescription = step.description.toLowerCase();
      const possiblePoints = step.points;
      totalPossible += possiblePoints;
      
      // 단계별 점수 및 피드백 계산
      // 간단한 예시: 단계 설명에 포함된 키워드가 학생 답안에 있는지 확인
      // 실제로는 더 복잡한 NLP 방식으로 구현해야 함
      const keywordsInStep = stepDescription.split(' ').filter(word => word.length > 3);
      let earnedPoints = 0;
      let feedback = '';
      
      // 키워드 매칭 점수 계산
      if (keywordsInStep.length > 0) {
        const matchedKeywords = keywordsInStep.filter(keyword => 
          studentAnswer.includes(keyword)
        );
        
        const matchRatio = matchedKeywords.length / keywordsInStep.length;
        
        if (matchRatio > 0.8) {
          earnedPoints = possiblePoints;
          feedback = '완벽하게 이해하고 있습니다.';
        } else if (matchRatio > 0.5) {
          earnedPoints = Math.floor(possiblePoints * 0.7);
          feedback = '대체로 이해하고 있으나 일부 개념이 부족합니다.';
        } else if (matchRatio > 0.3) {
          earnedPoints = Math.floor(possiblePoints * 0.4);
          feedback = '기본적인 개념은 알고 있으나 풀이 과정에 오류가 있습니다.';
        } else {
          earnedPoints = 0;
          feedback = '이 단계의 핵심 개념을 이해하지 못했습니다.';
        }
      }
      
      totalScore += earnedPoints;
      stepScores.push({
        stepId: i,
        earnedPoints,
        feedback
      });
    }
    
    // 전체 피드백 생성
    const scoreRatio = totalScore / totalPossible;
    if (scoreRatio > 0.8) {
      overallFeedback = '훌륭한 풀이입니다. 개념을 매우 잘 이해하고 있습니다.';
    } else if (scoreRatio > 0.6) {
      overallFeedback = '대체로 좋은 풀이이나 일부 개선이 필요합니다.';
    } else if (scoreRatio > 0.4) {
      overallFeedback = '기본적인 개념은 알고 있으나 좀 더 학습이 필요합니다.';
    } else {
      overallFeedback = '핵심 개념에 대한 이해가 부족합니다. 다시 학습해보세요.';
    }
    
    // 채점 결과 업데이트
    submission.scoring = {
      stepScores,
      totalScore,
      totalPossible,
      feedback: overallFeedback
    };
    submission.isScored = true;
    
    await submission.save();
    return submission;
  } catch (error) {
    console.error('채점 중 오류 발생:', error);
    throw error;
  }
} 