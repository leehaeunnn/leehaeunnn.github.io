import mongoose, { Schema, Document } from 'mongoose';
import { IProblem } from './Problem';

// 학생 풀이 제출물 인터페이스 정의
export interface ISubmission extends Document {
  problemId: IProblem['_id'];
  studentName: string;
  studentAnswer: string; // 학생 풀이 내용
  scoring: {
    stepScores: {
      stepId: number;
      earnedPoints: number;
      feedback: string;
    }[];
    totalScore: number;
    totalPossible: number;
    feedback: string;
  };
  isScored: boolean; // 채점 완료 여부
  createdAt: Date;
  updatedAt: Date;
}

// 학생 풀이 제출물 스키마 정의
const SubmissionSchema = new Schema<ISubmission>(
  {
    problemId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Problem', 
      required: true 
    },
    studentName: { type: String, required: true },
    studentAnswer: { type: String, required: true },
    scoring: {
      stepScores: [
        {
          stepId: { type: Number, required: true },
          earnedPoints: { type: Number, required: true, default: 0 },
          feedback: { type: String, default: '' }
        }
      ],
      totalScore: { type: Number, default: 0 },
      totalPossible: { type: Number, default: 0 },
      feedback: { type: String, default: '' }
    },
    isScored: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// 모델이 이미 존재하는지 확인하고, 없으면 생성
export default mongoose.models.Submission || mongoose.model<ISubmission>('Submission', SubmissionSchema); 