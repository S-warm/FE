import { CommonButton } from "@/components/atoms"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  useSimulationSettingsStore,
  type AgeGroup,
  type DeviceType,
  type GenderType,
} from "@/store/simulation-settings.store"

import { ChipTag } from "@/components/forms/chip-tag"
import { SearchField } from "@/components/forms/search-field"
import { SelectionCheckbox } from "@/components/forms/selection-checkbox"
import { SelectionRadioGroup } from "@/components/forms/selection-radio-group"
import { SelectionSelect } from "@/components/forms/selection-select"
import { SettingSlider } from "@/components/forms/setting-slider"
import { ToggleSwitchField } from "@/components/forms/toggle-switch-field"

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

function AdvancedSettingsPanel() {
  const {
    searchKeyword,
    threshold,
    device,
    ageGroup,
    gender,
    categories,
    includeLowContrast,
    includeWarnings,
    tags,
    setSearchKeyword,
    setThreshold,
    setDevice,
    setAgeGroup,
    setGender,
    toggleCategory,
    setIncludeLowContrast,
    setIncludeWarnings,
    removeTag,
    addTag,
    reset,
  } = useSimulationSettingsStore()

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <Card>
        <CardHeader>
          <CardTitle>고급설정</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <SearchField
            value={searchKeyword}
            onChange={(event) => setSearchKeyword(event.target.value)}
            onClear={() => setSearchKeyword("")}
            placeholder="페이지/이슈 검색"
          />

          <SettingSlider
            label="민감도 임계치"
            min={0}
            max={100}
            step={1}
            value={threshold}
            unit="%"
            onChange={setThreshold}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <SelectionSelect
              label="디바이스"
              value={device}
              options={deviceOptions}
              onChange={(value) => setDevice(value as DeviceType)}
            />
            <SelectionSelect
              label="연령대"
              value={ageGroup}
              options={ageOptions}
              onChange={(value) => setAgeGroup(value as AgeGroup)}
            />
          </div>

          <SelectionRadioGroup
            label="성별"
            value={gender}
            options={genderOptions}
            onChange={(value) => setGender(value as GenderType)}
          />

          <div className="grid gap-2">
            <p className="text-body-14-medium text-foreground">카테고리</p>
            <div className="flex flex-wrap gap-2">
              {categoryOptions.map((category) => {
                const selected = categories.includes(category.value)
                return (
                  <ChipTag
                    key={category.value}
                    selected={selected}
                    onClick={() => toggleCategory(category.value)}
                  >
                    {category.label}
                  </ChipTag>
                )
              })}
            </div>
          </div>

          <div className="grid gap-2">
            <p className="text-body-14-medium text-foreground">선택된 태그</p>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <ChipTag key={tag} removable selected onRemove={() => removeTag(tag)}>
                  {tag}
                </ChipTag>
              ))}
              <CommonButton
                size="sm"
                variant="secondary"
                onClick={() => addTag(`태그${tags.length + 1}`)}
              >
                태그 추가
              </CommonButton>
            </div>
          </div>

          <div className="grid gap-2 md:grid-cols-2">
            <SelectionCheckbox
              label="저대비 이슈 포함"
              checked={includeLowContrast}
              onCheckedChange={setIncludeLowContrast}
            />
            <SelectionCheckbox
              label="경고 이슈 포함"
              checked={includeWarnings}
              onCheckedChange={setIncludeWarnings}
            />
          </div>

          <div className="grid gap-2 md:grid-cols-2">
            <ToggleSwitchField
              label="저대비 강조"
              description="저대비 요소를 우선 표시합니다."
              checked={includeLowContrast}
              onCheckedChange={setIncludeLowContrast}
            />
            <ToggleSwitchField
              label="경고 강조"
              description="Warning 등급 이슈를 우선 표시합니다."
              checked={includeWarnings}
              onCheckedChange={setIncludeWarnings}
            />
          </div>

          <div className="flex justify-end">
            <CommonButton variant="ghost" onClick={reset}>
              설정 초기화
            </CommonButton>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Store 상태 미리보기</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-caption-12-regular text-foreground">
            {JSON.stringify(
              {
                searchKeyword,
                threshold,
                device,
                ageGroup,
                gender,
                categories,
                includeLowContrast,
                includeWarnings,
                tags,
              },
              null,
              2
            )}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}

export { AdvancedSettingsPanel }
