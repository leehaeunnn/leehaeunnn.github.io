'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface StepScore {
  stepId: number;
  earnedPoints: number;
  feedback: string;
}

interface Submission {
  _id: string;
  problemId: string;
  studentName: string;
  studentAnswer: string;
  scoring: {
    stepScores: StepScore[];
    totalScore: number;
    totalPossible: number;
    feedback: string;
  };
  isScored: boolean;
  createdAt: string;
}

interface Problem {
  _id: string;
  title: string;
  schoolLevel: string;
  grade: number;
  content: string;
  solution: string;
  scoringCriteria: {
    steps: {
      description: string;
      points: number;
    }[];
  };
}

export default function SubmissionDetail() {
  const params = useParams();
  const submissionId = params.id as string;
  
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // 페이지 로드 시 제출 정보 가져오기
  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        // API 요청 (서버가 실행 중일 때 작동)
        const response = await fetch(`/api/submissions/${submissionId}`);
        if (!response.ok) {
          throw new Error('제출 정보를 불러오는데 실패했습니다.');
        }
        const data = await response.json();
        setSubmission(data);
        
        // 문제 정보도 함께 가져오기
        const problemResponse = await fetch(`/api/problems/${data.problemId}`);
        if (!problemResponse.ok) {
          throw new Error('문제 정보를 불러오는데 실패했습니다.');
        }
        const problemData = await problemResponse.json();
        setProblem(problemData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (submissionId) {
      fetchSubmission();
    }
  }, [submissionId]);

  // 점수 비율에 따른 색상 계산
  const getScoreColor = (earned: number, possible: number) => {
    const ratio = earned / possible;
    if (ratio >= 0.8) return 'text-green-600';
    if (ratio >= 0.6) return 'text-blue-600';
    if (ratio >= 0.4) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="text-gray-500">채점 결과를 불러오는 중...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !submission || !problem) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow sm:rounded-lg p-6">
            <h1 className="text-2xl font-bold text-red-600 mb-4">오류 발생</h1>
            <p className="text-gray-700">{error || '데이터를 불러올 수 없습니다.'}</p>
            <div className="mt-6">
              <Link href="/" className="text-blue-600 hover:text-blue-800">
                ← 홈으로 돌아가기
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            ← 홈으로 돌아가기
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">채점 결과</h1>
        </div>

        <div className="bg-white shadow sm:rounded-lg overflow-hidden mb-8">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">{problem.title}</h2>
                <p className="text-sm text-gray-500">
                  {problem.schoolLevel} {problem.grade}학년 | 학생: {submission.studentName}
                </p>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${getScoreColor(submission.scoring.totalScore, submission.scoring.totalPossible)}`}>
                  {submission.scoring.totalScore} / {submission.scoring.totalPossible}
                </div>
                <p className="text-sm text-gray-500">
                  {new Date(submission.createdAt).toLocaleString('ko-KR')}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* 문제 내용 */}
          <div className="bg-white shadow sm:rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-2">문제</h3>
              <div className="text-gray-700 whitespace-pre-line">{problem.content}</div>
            </div>
          </div>

          {/* 학생 답안 */}
          <div className="bg-white shadow sm:rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-2">학생 풀이</h3>
              <div className="text-gray-700 whitespace-pre-line">{submission.studentAnswer}</div>
            </div>
          </div>
        </div>

        {/* 전체 피드백 */}
        <div className="bg-blue-50 rounded-lg p-4 mb-8">
          <h3 className="text-lg font-medium text-blue-800 mb-2">종합 평가</h3>
          <p className="text-blue-700">{submission.scoring.feedback}</p>
        </div>

        {/* 단계별 채점 결과 */}
        <div className="bg-white shadow sm:rounded-lg overflow-hidden mb-8">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">단계별 채점</h3>
            
            <div className="space-y-4">
              {submission.scoring.stepScores.map((score, index) => {
                const step = problem.scoringCriteria.steps[score.stepId];
                return (
                  <div key={index} className="border rounded-md overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 border-b flex justify-between items-center">
                      <span className="font-medium">단계 {index + 1}: {step.description}</span>
                      <span className={`font-bold ${getScoreColor(score.earnedPoints, step.points)}`}>
                        {score.earnedPoints} / {step.points}
                      </span>
                    </div>
                    <div className="px-4 py-3">
                      <p className="text-gray-700">{score.feedback}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 모범 답안 */}
        <div className="bg-white shadow sm:rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-800 mb-2">모범 답안</h3>
            <div className="text-gray-700 whitespace-pre-line">{problem.solution}</div>
          </div>
        </div>
      </div>
    </div>
  );
} 