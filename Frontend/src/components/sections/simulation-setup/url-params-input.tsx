import { useSimulationSettingsStore } from "@/store/simulation-settings.store"
import { TextField } from "@/components/atoms"
import { SetupSectionTitle } from "@/components/sections/simulation-setup/setup-section-title"

interface UrlParamsInputProps {
  title?: string
  description?: string
  placeholder?: string
}

export function UrlParamsInput({
  title = "URL 파라미터",
  description = "도메인 뒤에 붙는 쿼리 파라미터를 입력하세요",
  placeholder = "예) param1=value1&param2=value2",
}: UrlParamsInputProps) {
  const { urlParams, setUrlParams } = useSimulationSettingsStore()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // '?' 로 시작하면 제거
    const cleanValue = value.startsWith("?") ? value.slice(1) : value
    setUrlParams(cleanValue)
  }

  return (
    <div className="grid gap-3">
      <SetupSectionTitle title={title} description={description} />
      <TextField
        type="text"
        value={urlParams}
        onChange={handleChange}
        placeholder={placeholder}
        variant="default"
        size="lg"
        className="h-11 rounded-xl border-border-soft-2 bg-card px-4 text-text-secondary placeholder:text-text-muted"
      />
    </div>
  )
}
