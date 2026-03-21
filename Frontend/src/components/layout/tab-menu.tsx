import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface TabMenuProps {
  value: string
  onChange: (value: string) => void
}

const tabs = [
  { value: "overview", label: "개요" },
  { value: "issues", label: "주요 이슈" },
  { value: "heatmap", label: "히트맵" },
  { value: "wcag", label: "WCAG 검사" },
  { value: "ai", label: "AI 수정" },
]

function TabMenu({ value, onChange }: TabMenuProps) {
  return (
    <Tabs
      value={value}
      onValueChange={(nextValue) => {
        if (nextValue) {
          onChange(nextValue)
        }
      }}
    >
      <TabsList variant="line" className="w-full flex-wrap justify-start rounded-none border-b p-0">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value} className="h-10 !flex-none rounded-none px-4">
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}

export { TabMenu }
