import { useEffect, useState } from "react"

import { CommonButton } from "@/components/atoms"
import {
  ChipTag,
  SearchField,
  SelectionCheckbox,
  SelectionRadioGroup,
  SelectionSelect,
  SettingSlider,
  ToggleSwitchField,
} from "@/components/forms"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  useSimulationSettingsStore,
  type AgeGroup,
  type DeviceType,
  type GenderType,
  type SimulationSettingsSnapshot,
} from "@/store/simulation-settings.store"
import { useShallow } from "zustand/react/shallow"

const deviceOptions: { label: string; value: DeviceType }[] = [
  { label: "데스크탑", value: "desktop" },
  { label: "태블릿", value: "tablet" },
  { label: "모바일", value: "mobile" },
]

const ageOptions: { label: string; value: AgeGroup }[] = [
  { label: "10대", value: "10s" },
  { label: "20대", value: "20s" },
  { label: "30대", value: "30s" },
  { label: "40대", value: "40s" },
  { label: "50대+", value: "50plus" },
]

const genderOptions: { label: string; value: GenderType }[] = [
  { label: "전체", value: "all" },
  { label: "여성", value: "female" },
  { label: "남성", value: "male" },
]

const categoryOptions = [
  { label: "대비(Contrast)", value: "contrast" },
  { label: "네비게이션", value: "navigation" },
  { label: "가독성", value: "readability" },
]

function SettingsModal() {
  const settingsSnapshot = useSimulationSettingsStore(
    useShallow((state) => ({
      searchKeyword: state.searchKeyword,
      threshold: state.threshold,
      device: state.device,
      ageGroup: state.ageGroup,
      gender: state.gender,
      categories: state.categories,
      includeLowContrast: state.includeLowContrast,
      includeWarnings: state.includeWarnings,
      tags: state.tags,
    }))
  )
  const applySettings = useSimulationSettingsStore((state) => state.applySettings)

  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<SimulationSettingsSnapshot>(settingsSnapshot)

  useEffect(() => {
    if (open) {
      setDraft(settingsSnapshot)
    }
  }, [open, settingsSnapshot])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<CommonButton variant="secondary" size="sm" />}>고급설정</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>고급설정</DialogTitle>
          <DialogDescription>실행 전 시뮬레이션 환경 값을 조정합니다.</DialogDescription>
        </DialogHeader>

        <div className="grid max-h-[70vh] gap-5 overflow-y-auto pr-1">
          <SearchField
            value={draft.searchKeyword}
            placeholder="페이지/이슈 검색"
            onChange={(event) => setDraft((prev) => ({ ...prev, searchKeyword: event.target.value }))}
            onClear={() => setDraft((prev) => ({ ...prev, searchKeyword: "" }))}
          />

          <SettingSlider
            label="민감도 임계치"
            min={0}
            max={100}
            value={draft.threshold}
            onChange={(value) => setDraft((prev) => ({ ...prev, threshold: value }))}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <SelectionSelect
              label="디바이스"
              value={draft.device}
              options={deviceOptions}
              onChange={(value) => setDraft((prev) => ({ ...prev, device: value as DeviceType }))}
            />
            <SelectionSelect
              label="연령대"
              value={draft.ageGroup}
              options={ageOptions}
              onChange={(value) => setDraft((prev) => ({ ...prev, ageGroup: value as AgeGroup }))}
            />
          </div>

          <SelectionRadioGroup
            label="성별"
            value={draft.gender}
            options={genderOptions}
            onChange={(value) => setDraft((prev) => ({ ...prev, gender: value as GenderType }))}
          />

          <div className="grid gap-2">
            <p className="text-body-14-medium text-foreground">카테고리</p>
            <div className="flex flex-wrap gap-2">
              {categoryOptions.map((category) => {
                const selected = draft.categories.includes(category.value)
                return (
                  <ChipTag
                    key={category.value}
                    selected={selected}
                    onClick={() =>
                      setDraft((prev) => ({
                        ...prev,
                        categories: selected
                          ? prev.categories.filter((item) => item !== category.value)
                          : [...prev.categories, category.value],
                      }))
                    }
                  >
                    {category.label}
                  </ChipTag>
                )
              })}
            </div>
          </div>

          <div className="grid gap-2 md:grid-cols-2">
            <SelectionCheckbox
              label="저대비 이슈 포함"
              checked={draft.includeLowContrast}
              onCheckedChange={(checked) =>
                setDraft((prev) => ({ ...prev, includeLowContrast: checked }))
              }
            />
            <SelectionCheckbox
              label="경고 이슈 포함"
              checked={draft.includeWarnings}
              onCheckedChange={(checked) => setDraft((prev) => ({ ...prev, includeWarnings: checked }))}
            />
          </div>

          <div className="grid gap-2 md:grid-cols-2">
            <ToggleSwitchField
              label="저대비 강조"
              checked={draft.includeLowContrast}
              onCheckedChange={(checked) =>
                setDraft((prev) => ({ ...prev, includeLowContrast: checked }))
              }
            />
            <ToggleSwitchField
              label="경고 강조"
              checked={draft.includeWarnings}
              onCheckedChange={(checked) => setDraft((prev) => ({ ...prev, includeWarnings: checked }))}
            />
          </div>
        </div>

        <DialogFooter>
          <CommonButton variant="ghost" onClick={() => setOpen(false)}>
            취소
          </CommonButton>
          <CommonButton
            onClick={() => {
              applySettings(draft)
              setOpen(false)
            }}
          >
            저장
          </CommonButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { SettingsModal }
