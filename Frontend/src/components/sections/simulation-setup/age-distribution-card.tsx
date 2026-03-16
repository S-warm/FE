import { SettingSlider } from "@/components/forms/setting-slider"
import { cn } from "@/lib/utils"

const AGE_COPY = {
  teen: {
    label: "10대",
    description: "트렌드 민감형 탐색 세대",
  },
  fifty: {
    label: "50대",
    description: "안정성 중시형 사용자층",
  },
  eighty: {
    label: "80대",
    description: "접근성 개선이 중요한 시니어층",
  },
} as const

type AgeKey = keyof typeof AGE_COPY

function AgeDistributionCard({
  ratios,
  onChange,
}: {
  ratios: Record<AgeKey, number>
  onChange: (key: AgeKey, value: number) => void
}) {
  return (
    <div className="grid gap-2 rounded-2xl border border-[#cfd7ea] bg-white p-3">
      {(Object.keys(AGE_COPY) as AgeKey[]).map((key) => (
        <div
          key={key}
          className={cn(
            "grid gap-2 rounded-xl border border-[#d8dff0] bg-[#fbfcff] px-3 py-2.5",
            key !== "eighty" ? "" : ""
          )}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-body-14-medium text-[#435176]">{AGE_COPY[key].label}</p>
              <p className="mt-1 text-caption-12-regular text-[#9aa3b9]">
                {AGE_COPY[key].description}
              </p>
            </div>
            <span className="rounded-lg bg-[#eef2ff] px-2.5 py-1 text-caption-12-medium text-[#4f66bf]">
              {ratios[key]}%
            </span>
          </div>

          <SettingSlider
            label="연령층 비율"
            value={ratios[key]}
            onChange={(value) => onChange(key, value)}
            size="sm"
          />
          <div className="flex justify-between text-caption-12-regular text-[#9aa3b9]">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>
      ))}
    </div>
  )
}

export { AgeDistributionCard }
export type { AgeKey }
