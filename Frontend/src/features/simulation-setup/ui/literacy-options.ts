import type { DigitalLiteracyLevel } from "@/features/simulation-setup/model/types"

export const digitalLiteracyOptions: Array<{
  label: string
  value: DigitalLiteracyLevel
}> = [
  { label: "상", value: "high" },
  { label: "중", value: "medium" },
  { label: "하", value: "low" },
]
