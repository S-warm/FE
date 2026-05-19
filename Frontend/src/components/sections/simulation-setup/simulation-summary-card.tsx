import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { motion } from "@/lib/motion"

import type { DigitalLiteracyLevel } from "@/components/sections/simulation-setup/digital-literacy-selector"
import { personaDeviceLabelMap, type PersonaDevice } from "@/constants/persona-device"

const literacyLabelMap: Record<DigitalLiteracyLevel, string> = {
  high: "시력 저하 70% 적용 (최소 폰트 16px 인식)",
  medium: "기본 정보 처리와 비교 탐색에 익숙함",
  low: "핵심 행동 유도 중심의 단순한 인터페이스 선호",
}

function SummaryRow({
  title,
  value,
  hasValue = true,
  scrollable = false,
}: {
  title: string
  value: string
  hasValue?: boolean
  scrollable?: boolean
}) {
  return (
    <div className="grid gap-1.5 text-left">
      <p className="text-body-14-medium font-semibold text-text-body">{title}</p>
      <p
        className={cn(
          "rounded-xl bg-surface-muted px-3 py-1.5 text-caption-12-regular leading-5 transition-colors",
          hasValue ? "text-text-secondary" : "text-text-secondary/45",
          scrollable && "h-[44px] overflow-y-auto overscroll-contain [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        )}
      >
        {value}
      </p>
    </div>
  )
}

interface AgeGroupItem {
  name: string
  count: number
  color: string
}

function AgeGroupGrid({ ageGroups }: { ageGroups: AgeGroupItem[] }) {
  return (
    <div className="grid gap-1.5 text-left">
      <p className="text-body-14-medium font-semibold text-text-body">연령대별 횟수</p>
      <div className="grid grid-cols-2 gap-x-2 gap-y-1 rounded-xl bg-surface-muted px-3 py-2">
        {ageGroups.map((item) => (
          <div key={item.name} className={cn("flex items-center gap-1.5 transition-opacity duration-300", item.count === 0 && "opacity-40")}>
            <span className="size-2 flex-shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-caption-12-regular text-text-secondary">
              {item.name}: {item.count.toLocaleString()}명
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function SimulationSummaryCard({
  projectTitle,
  targetUrl,
  endUrl,
  urlParams,
  personaCount,
  ageGroupSummary,
  ageGroups,
  personaDevice,
  digitalLiteracy,
  task,
  className,
}: {
  projectTitle: string
  targetUrl: string
  endUrl: string
  urlParams: string
  personaCount: number
  ageGroupSummary: string
  ageGroups?: AgeGroupItem[]
  personaDevice: PersonaDevice
  digitalLiteracy: DigitalLiteracyLevel
  task: string
  className?: string
}) {
  return (
    <Card
      className={cn(
        "rounded-2xl border border-border-strong bg-surface-subtle py-[10.4px] shadow-none",
        motion.card,
        className
      )}
    >
      <CardContent className="flex flex-col gap-2.5 py-0 text-left">
        <SummaryRow title="프로젝트 제목" value={projectTitle.trim() || "Automation Exercise - Product Search Scenario"} hasValue={Boolean(projectTitle.trim())} />
        <div className="h-px bg-border-subtle" />
        <SummaryRow title="시작 URL" value={targetUrl.trim() || "https://automationexercise.com"} hasValue={Boolean(targetUrl.trim())} />
        <div className="h-px bg-border-subtle" />
        <SummaryRow title="종료 URL" value={endUrl.trim() || "https://automationexercise.com/checkout"} hasValue={Boolean(endUrl.trim())} />
        <SummaryRow title="URL 파라미터" value={urlParams.trim() || "파라미터 없음"} hasValue={Boolean(urlParams.trim())} />
        <SummaryRow title="페르소나 횟수" value={`총 ${personaCount.toLocaleString()}회 시뮬레이션`} />
        <div className="h-px bg-border-subtle" />
        {ageGroups ? (
          <AgeGroupGrid ageGroups={ageGroups} />
        ) : (
          <SummaryRow title="연령대별 횟수" value={ageGroupSummary} scrollable />
        )}
        <div className="h-px bg-border-subtle" />
        <SummaryRow title="디바이스" value={personaDeviceLabelMap[personaDevice]} />
        <div className="h-px bg-border-subtle" />
        <SummaryRow title="디지털 리터러시" value={literacyLabelMap[digitalLiteracy]} />
        <div className="h-px bg-border-subtle" />
        <SummaryRow
          title="수행 목표"
          value={task.trim() || "홈에서 상품 목록 페이지로 이동한 뒤, 'Blue Top' 상품의 상세 페이지를 열고 장바구니에 추가한다."}
          hasValue={Boolean(task.trim())}
          scrollable
        />
        <div className="h-px bg-border-subtle" />
        <div className="grid gap-2 text-left">
          <p className="text-body-14-medium font-semibold text-text-body">소요 시간 / 소요 토큰</p>
          <p className="text-caption-12-regular leading-5 text-text-secondary">약 1시간 소요 / 100 Token 예상</p>
        </div>
      </CardContent>
    </Card>
  )
}

export { SimulationSummaryCard }
