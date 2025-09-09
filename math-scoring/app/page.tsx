'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">수학 문제 자동 채점 시스템</h1>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white shadow sm:rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">학생 풀이 자동 채점 시스템에 오신 것을 환영합니다</h2>
            <p className="text-gray-600 mb-8">
              학교급과 학년을 선택하고 수학 문제와 학생 답안을 제출하면 자동으로 채점해드립니다.
              각 풀이 단계별로 점수를 매기고 피드백을 제공합니다.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg shadow-sm hover:shadow-md transition duration-300">
                <h3 className="text-lg font-medium text-blue-800 mb-2">문제 등록</h3>
                <p className="text-blue-600 mb-4">새로운 수학 문제를 등록하고 채점 기준을 설정하세요.</p>
                <Link href="/problems/create" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                  문제 등록하기
                </Link>
              </div>
              
              <div className="bg-green-50 p-6 rounded-lg shadow-sm hover:shadow-md transition duration-300">
                <h3 className="text-lg font-medium text-green-800 mb-2">풀이 제출</h3>
                <p className="text-green-600 mb-4">학생 풀이를 제출하고 자동 채점 결과를 확인하세요.</p>
                <Link href="/submissions/create" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
                  풀이 제출하기
                </Link>
              </div>
            </div>
            
            <div className="mt-8 p-6 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium text-gray-800 mb-4">사용 방법</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-600">
                <li>문제 등록 페이지에서 학교급, 학년을 선택하고 문제와 채점 기준을 입력합니다.</li>
                <li>풀이 제출 페이지에서 문제를 선택하고 학생 이름과 풀이를 입력합니다.</li>
                <li>시스템이 자동으로 학생 풀이를 분석하고 채점합니다.</li>
                <li>단계별 점수와 전체 점수, 피드백을 확인할 수 있습니다.</li>
              </ol>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-gray-500 text-center">© 2025 수학 문제 자동 채점 시스템</p>
        </div>
      </footer>
    </div>
  );
} 