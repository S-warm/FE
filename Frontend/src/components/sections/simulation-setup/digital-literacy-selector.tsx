import { cn } from "@/lib/utils"

import { DigitalLiteracyDetailModal } from "@/components/sections/simulation-setup/digital-literacy-detail-modal"

type DigitalLiteracyLevel = "low" | "medium" | "high"

const OPTIONS: Array<{ label: string; value: DigitalLiteracyLevel }> = [
  { label: "상", value: "high" },
  { label: "중", value: "medium" },
  { label: "하", value: "low" },
]

function DigitalLiteracySelector({
  value,
  onChange,
  className,
}: {
  value: DigitalLiteracyLevel
  onChange: (value: DigitalLiteracyLevel) => void
  className?: string
}) {
  return (
    <div className={cn("flex items-center rounded-xl border border-[#cdd6ea] bg-white p-0.5", className)}>
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          className={cn(
            "flex-[0.8] rounded-md px-1.5 py-1 text-body-14-medium transition-colors",
            value === option.value
              ? "bg-[#6f86d9] text-white"
              : "text-[#6b7391] hover:bg-[#eef1f7] hover:text-[#435176]"
          )}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}

      <DigitalLiteracyDetailModal
        triggerClassName="ml-1 flex-[1.35] rounded-md border border-[#d3dbee] bg-[#f4f6fb] px-3 text-caption-12-medium text-[#66708e] hover:bg-[#e9edf7]"
      />
    </div>
  )
}

export { DigitalLiteracySelector }
export type { DigitalLiteracyLevel }
