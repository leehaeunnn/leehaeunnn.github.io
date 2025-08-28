'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Problem {
  _id: string;
  title: string;
  schoolLevel: string;
  grade: number;
  createdAt: string;
}

export default function ProblemList() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState({
    schoolLevel: '',
    grade: 0
  });

  // 페이지 로드 시 문제 목록 가져오기
  useEffect(() => {
    const fetchProblems = async () => {
      try {
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

  // 필터링된 문제 목록
  const filteredProblems = problems.filter(problem => {
    if (filter.schoolLevel && problem.schoolLevel !== filter.schoolLevel) {
      return false;
    }
    if (filter.grade > 0 && problem.grade !== filter.grade) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <Link href="/" className="text-blue-600 hover:text-blue-800">
              ← 홈으로 돌아가기
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 mt-4">수학 문제 목록</h1>
          </div>
          <Link 
            href="/problems/create" 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            + 새 문제 등록
          </Link>
        </div>

        {/* 필터 옵션 */}
        <div className="bg-white shadow sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">필터</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="schoolLevel" className="block text-sm font-medium text-gray-700">
                  학교급
                </label>
                <select
                  id="schoolLevel"
                  value={filter.schoolLevel}
                  onChange={(e) => setFilter({ ...filter, schoolLevel: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">전체</option>
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
                  value={filter.grade}
                  onChange={(e) => setFilter({ ...filter, grade: Number(e.target.value) })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="0">전체</option>
                  {[1, 2, 3, 4, 5, 6].map((g) => (
                    <option key={g} value={g}>
                      {g}학년
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-gray-500">문제 목록을 불러오는 중...</div>
          </div>
        ) : filteredProblems.length > 0 ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {filteredProblems.map((problem) => (
                <li key={problem._id}>
                  <Link 
                    href={`/problems/${problem._id}`} 
                    className="block hover:bg-gray-50"
                  >
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-blue-600 truncate">
                          {problem.title}
                        </div>
                        <div className="ml-2 flex-shrink-0 flex">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {problem.schoolLevel} {problem.grade}학년
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 flex justify-between">
                        <div className="sm:flex">
                          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            {new Date(problem.createdAt).toLocaleDateString('ko-KR')}
                          </div>
                        </div>
                        <div>
                          <span className="inline-flex items-center text-sm text-gray-500">
                            자세히 보기 →
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="text-center py-12 bg-white shadow sm:rounded-md">
            <p className="text-gray-500">등록된 문제가 없습니다.</p>
            <Link 
              href="/problems/create" 
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              새 문제 등록하기
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 