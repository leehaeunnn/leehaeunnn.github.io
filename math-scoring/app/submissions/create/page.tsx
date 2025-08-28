'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Problem {
  _id: string;
  title: string;
  schoolLevel: string;
  grade: number;
  content: string;
}

export default function CreateSubmission() {
  const router = useRouter();
  const [studentName, setStudentName] = useState('');
  const [selectedProblemId, setSelectedProblemId] = useState('');
  const [studentAnswer, setStudentAnswer] = useState('');
  const [problems, setProblems] = useState<Problem[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // 페이지 로드 시 문제 목록 가져오기
  useEffect(() => {
    const fetchProblems = async () => {
      try {
        // API 요청 (서버가 실행 중일 때 작동)
        const response = await fetch('/api/problems');
        if (!response.ok) {
          throw new Error('문제 목록을 불러오는데 실패했습니다.');
        }
        const data = await response.json();
        setProblems(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProblems();
  }, []);

  // 선택한 문제 정보 가져오기
  useEffect(() => {
    if (selectedProblemId) {
      const problem = problems.find(p => p._id === selectedProblemId) || null;
      setSelectedProblem(problem);
    } else {
      setSelectedProblem(null);
    }
  }, [selectedProblemId, problems]);

  // 폼 제출 처리
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // 검증
      if (!studentName || !selectedProblemId || !studentAnswer) {
        throw new Error('모든 필드를 입력해주세요.');
      }

      // API 요청 데이터
      const submission = {
        problemId: selectedProblemId,
        studentName,
        studentAnswer,
      };

      // API 요청 (서버가 실행 중일 때 작동)
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submission),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || '풀이 제출에 실패했습니다.');
      }

      const result = await response.json();
      // 성공 시 결과 페이지로 리디렉션
      router.push(`/submissions/${result._id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            ← 홈으로 돌아가기
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">학생 풀이 제출</h1>
        </div>

        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            {error && (
              <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="text-center py-12">
                <div className="text-gray-500">문제 목록을 불러오는 중...</div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  {/* 학생 이름 */}
                  <div>
                    <label htmlFor="studentName" className="block text-sm font-medium text-gray-700">
                      학생 이름
                    </label>
                    <input
                      type="text"
                      id="studentName"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="예: 홍길동"
                    />
                  </div>

                  {/* 문제 선택 */}
                  <div>
                    <label htmlFor="problemId" className="block text-sm font-medium text-gray-700">
                      문제 선택
                    </label>
                    <select
                      id="problemId"
                      value={selectedProblemId}
                      onChange={(e) => setSelectedProblemId(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">선택하세요</option>
                      {problems.map((problem) => (
                        <option key={problem._id} value={problem._id}>
                          [{problem.schoolLevel} {problem.grade}학년] {problem.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 선택한 문제 내용 표시 */}
                  {selectedProblem && (
                    <div className="bg-gray-50 p-4 rounded-md">
                      <h3 className="text-md font-medium text-gray-800 mb-2">문제 내용</h3>
                      <div className="text-gray-700 whitespace-pre-line">
                        {selectedProblem.content}
                      </div>
                    </div>
                  )}

                  {/* 학생 풀이 */}
                  <div>
                    <label htmlFor="studentAnswer" className="block text-sm font-medium text-gray-700">
                      학생 풀이
                    </label>
                    <textarea
                      id="studentAnswer"
                      rows={8}
                      value={studentAnswer}
                      onChange={(e) => setStudentAnswer(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="학생이 작성한 풀이를 단계별로 입력해주세요."
                    ></textarea>
                  </div>

                  {/* 제출 버튼 */}
                  <div className="pt-5">
                    <div className="flex justify-end">
                      <Link
                        href="/"
                        className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        취소
                      </Link>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                      >
                        {isSubmitting ? '처리 중...' : '풀이 제출 및 채점'}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 