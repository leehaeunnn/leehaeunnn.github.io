import mongoose, { Schema, Document } from 'mongoose';

// 수학 문제의 인터페이스 정의
export interface IProblem extends Document {
  title: string;
  schoolLevel: string; // 초등학교, 중학교, 고등학교
  grade: number; // 학년 (1~6학년)
  content: string; // 문제 내용
  solution: string; // 모범 답안
  scoringCriteria: {
    steps: {
      description: string; // 단계 설명
      points: number; // 배점
    }[]
  };
  createdAt: Date;
  updatedAt: Date;
}

// 수학 문제 스키마 정의
const ProblemSchema = new Schema<IProblem>(
  {
    title: { type: String, required: true },
    schoolLevel: { 
      type: String, 
      required: true, 
      enum: ['초등학교', '중학교', '고등학교'] 
    },
    grade: { 
      type: Number, 
      required: true, 
      min: 1, 
      max: 6 
    },
    content: { type: String, required: true },
    solution: { type: String, required: true },
    scoringCriteria: {
      steps: [
        {
          description: { type: String, required: true },
          points: { type: Number, required: true, min: 0 }
        }
      ]
    }
  },
  { timestamps: true }
);

// 모델이 이미 존재하는지 확인하고, 없으면 생성
export default mongoose.models.Problem || mongoose.model<IProblem>('Problem', ProblemSchema); 