import { SettingSlider } from "@/components/forms/setting-slider"

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
    <div className="grid gap-2 rounded-2xl border border-border-strong bg-card p-3">
      {(Object.keys(AGE_COPY) as AgeKey[]).map((key) => (
        <div
          key={key}
          className="grid gap-2 rounded-xl border border-border-soft-2 bg-surface-subtle px-3 py-2.5"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-body-14-medium text-text-secondary">{AGE_COPY[key].label}</p>
              <p className="mt-1 text-caption-12-regular text-text-subtle">
                {AGE_COPY[key].description}
              </p>
            </div>
            <span className="rounded-lg bg-brand-subtle px-2.5 py-1 text-caption-12-medium text-brand-accent">
              {ratios[key]}%
            </span>
          </div>

          <SettingSlider
            label="연령층 비율"
            value={ratios[key]}
            onChange={(value) => onChange(key, value)}
            size="sm"
          />
          <div className="flex justify-between text-caption-12-regular text-text-subtle">
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
