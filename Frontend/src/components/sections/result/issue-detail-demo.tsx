/**
 * 이슈 상세보기 모달 데모 컴포넌트
 * 실제 ResultIssuesPage에서 사용되므로 이 컴포넌트는 현재 미사용 상태
 */

import { IssueListSection } from "./issue-list-section"
import type { ResultIssueViewModel } from "@/types/view-model/result/result-issues"

export function IssueDetailDemo() {
  // 데모용 더미 데이터 (실제로는 API에서 가져옴)
  const demoIssues: ResultIssueViewModel[] = []

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">이슈 상세보기 데모</h1>
        <p className="text-muted-foreground">
          이슈 목록의 "상세보기" 버튼을 클릭하면 우측 사이드 모달에서 상세 정보를 확인할 수 있습니다.
        </p>
      </div>

      {/* 이슈 목록 섹션 */}
      <IssueListSection issues={demoIssues} title="식별된 주요 이슈" />

      {/* 설명 섹션 */}
      <div className="mt-12 pt-6 border-t space-y-4">
        <h2 className="text-lg font-semibold">사용 가능한 기능</h2>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2">
            <span className="text-blue-500 font-semibold">•</span>
            <span>각 이슈 카드 호버 시 "상세보기" 버튼 표시</span>
          </li>
          <li className="flex gap-2">
            <span className="text-blue-500 font-semibold">•</span>
            <span>우측에서 부드러운 슬라이드인 애니메이션으로 모달 오픈</span>
          </li>
          <li className="flex gap-2">
            <span className="text-blue-500 font-semibold">•</span>
            <span>페르소나별 분석: 각 페르소나별 발생 건수와 비율을 시각화</span>
          </li>
          <li className="flex gap-2">
            <span className="text-blue-500 font-semibold">•</span>
            <span>발생 통계: 총 발생 건수, 발생률 등 주요 지표 표시</span>
          </li>
          <li className="flex gap-2">
            <span className="text-blue-500 font-semibold">•</span>
            <span>세션 정보: 영향받은 세션 및 페르소나 정보 나열</span>
          </li>
          <li className="flex gap-2">
            <span className="text-blue-500 font-semibold">•</span>
            <span>배경 클릭 또는 X 버튼으로 모달 종료</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
