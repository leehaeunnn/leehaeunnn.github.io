import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '수학 문제 자동 채점 시스템',
  description: '학생이 제출한 수학 문제 풀이를 자동으로 채점하고 피드백을 제공합니다.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        {children}
      </body>
    </html>
  );
} 