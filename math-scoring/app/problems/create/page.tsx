'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ScoringStep {
  description: string;
  points: number;
}

export default function CreateProblem() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [schoolLevel, setSchoolLevel] = useState('중학교');
  const [grade, setGrade] = useState(1);
  const [content, setContent] = useState('');
  const [solution, setSolution] = useState('');
  const [scoringSteps, setScoringSteps] = useState<ScoringStep[]>([
    { description: '', points: 0 }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // 채점 단계 추가
  const addScoringStep = () => {
    setScoringSteps([...scoringSteps, { description: '', points: 0 }]);
  };

  // 채점 단계 제거
  const removeScoringStep = (index: number) => {
    const newSteps = [...scoringSteps];
    newSteps.splice(index, 1);
    setScoringSteps(newSteps);
  };

  // 채점 단계 업데이트
  const updateScoringStep = (index: number, field: keyof ScoringStep, value: string | number) => {
    const newSteps = [...scoringSteps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setScoringSteps(newSteps);
  };

  // 문제 등록 제출
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // 검증
      if (!title || !content || !solution) {
        throw new Error('모든 필드를 입력해주세요.');
      }

      if (scoringSteps.some(step => !step.description || step.points <= 0)) {
        throw new Error('모든 채점 단계에 설명과 점수를 입력해주세요.');
      }

      // API 요청 데이터
      const problem = {
        title,
        schoolLevel,
        grade,
        content,
        solution,
        scoringCriteria: {
          steps: scoringSteps
        }
      };

      // API 요청 (서버가 실행 중일 때 작동)
      const response = await fetch('/api/problems', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(problem),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || '문제 등록에 실패했습니다.');
      }

      // 성공 시 리디렉션
      router.push('/problems');
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
          <h1 className="text-2xl font-bold text-gray-900 mt-4">새 수학 문제 등록</h1>
        </div>

        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            {error && (
              <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {/* 문제 제목 */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    문제 제목
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* 학교급 및 학년 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="schoolLevel" className="block text-sm font-medium text-gray-700">
                      학교급
                    </label>
                    <select
                      id="schoolLevel"
                      value={schoolLevel}
                      onChange={(e) => setSchoolLevel(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="초등학교">초등학교</option>
                      <option value="중학교">중학교</option>
                      <option value="고등학교">고등학교</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="grade" className="block text-sm font-medium text-gray-700">
                      학년
                    </label>
                    <select
                      id="grade"
                      value={grade}
                      onChange={(e) => setGrade(Number(e.target.value))}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      {[1, 2, 3, 4, 5, 6].map((g) => (
                        <option key={g} value={g}>
                          {g}학년
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 문제 내용 */}
                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                    문제 내용
                  </label>
                  <textarea
                    id="content"
                    rows={5}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="수학 문제를 입력하세요. 수식이나 이미지가 필요한 경우 업로드할 수 있습니다."
                  ></textarea>
                </div>

                {/* 모범 답안 */}
                <div>
                  <label htmlFor="solution" className="block text-sm font-medium text-gray-700">
                    모범 답안
                  </label>
                  <textarea
                    id="solution"
                    rows={5}
                    value={solution}
                    onChange={(e) => setSolution(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="모범 답안을 단계별로 자세히 작성해주세요."
                  ></textarea>
                </div>

                {/* 채점 기준 */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      채점 기준 (단계별)
                    </label>
                    <button
                      type="button"
                      onClick={addScoringStep}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                    >
                      + 단계 추가
                    </button>
                  </div>

                  <div className="space-y-4">
                    {scoringSteps.map((step, index) => (
                      <div key={index} className="grid grid-cols-12 gap-4 bg-gray-50 p-3 rounded-md">
                        <div className="col-span-1 flex items-center">
                          <span className="text-sm font-medium text-gray-900">{index + 1}</span>
                        </div>
                        <div className="col-span-8">
                          <input
                            type="text"
                            value={step.description}
                            onChange={(e) => updateScoringStep(index, 'description', e.target.value)}
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="단계 설명"
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            value={step.points}
                            onChange={(e) => updateScoringStep(index, 'points', parseInt(e.target.value) || 0)}
                            min="0"
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="점수"
                          />
                        </div>
                        <div className="col-span-1 flex items-center">
                          {scoringSteps.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeScoringStep(index)}
                              className="text-red-600 hover:text-red-800"
                              aria-label="단계 삭제"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
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
                      className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {isSubmitting ? '처리 중...' : '문제 등록'}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 