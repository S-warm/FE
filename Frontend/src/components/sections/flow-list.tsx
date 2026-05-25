import { useMemo, useState } from "react"
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react"

import { CommonButton, IconButton, StatusBadge, TextField } from "@/components/atoms"
import { SearchField } from "@/components/forms"
import { StepIndicator } from "@/components/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useFlowListStore } from "@/store/flow-list.store"
import { useShallow } from "zustand/react/shallow"

function FlowList() {
  const [newFlowName, setNewFlowName] = useState("")

  const { flows, selectedFlowId, searchKeyword } = useFlowListStore(
    useShallow((state) => ({
      flows: state.flows,
      selectedFlowId: state.selectedFlowId,
      searchKeyword: state.searchKeyword,
    }))
  )
  const { setSearchKeyword, selectFlow, addFlow, removeFlow, moveFlowUp, moveFlowDown } =
    useFlowListStore(
      useShallow((state) => ({
        setSearchKeyword: state.setSearchKeyword,
        selectFlow: state.selectFlow,
        addFlow: state.addFlow,
        removeFlow: state.removeFlow,
        moveFlowUp: state.moveFlowUp,
        moveFlowDown: state.moveFlowDown,
      }))
    )

  const filteredFlows = useMemo(
    () =>
      flows.filter((item) =>
        item.name.toLowerCase().includes(searchKeyword.trim().toLowerCase())
      ),
    [flows, searchKeyword]
  )

  const selectedFlow = flows.find((item) => item.id === selectedFlowId)

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <Card>
        <CardHeader>
          <CardTitle>시뮬레이션 플로우 목록</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          <SearchField
            value={searchKeyword}
            onChange={(event) => setSearchKeyword(event.target.value)}
            onClear={() => setSearchKeyword("")}
            placeholder="플로우 검색"
          />

          <div className="flex gap-2">
            <TextField
              value={newFlowName}
              onChange={(event) => setNewFlowName(event.target.value)}
              placeholder="새 플로우 이름"
              className="w-full"
            />
            <CommonButton
              variant="secondary"
              onClick={() => {
                addFlow(newFlowName)
                setNewFlowName("")
              }}
            >
              <Plus className="size-4" />
              추가
            </CommonButton>
          </div>

          <div className="grid gap-2">
            {filteredFlows.map((flow) => (
              <div
                key={flow.id}
                className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2"
              >
                <button
                  type="button"
                  className="flex flex-1 items-center justify-between gap-2 text-left"
                  onClick={() => selectFlow(flow.id)}
                >
                  <span className="text-body-14-medium text-foreground">{flow.name}</span>
                  <StatusBadge variant={flow.status}>{flow.status.toUpperCase()}</StatusBadge>
                </button>
                <IconButton
                  icon={<ArrowUp />}
                  label="위로 이동"
                  size="sm"
                  onClick={() => moveFlowUp(flow.id)}
                />
                <IconButton
                  icon={<ArrowDown />}
                  label="아래로 이동"
                  size="sm"
                  onClick={() => moveFlowDown(flow.id)}
                />
                <IconButton
                  icon={<Trash2 />}
                  label="삭제"
                  size="sm"
                  variant="destructive"
                  onClick={() => removeFlow(flow.id)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>선택 플로우 단계</CardTitle>
        </CardHeader>
        <CardContent>
          {selectedFlow ? (
            <StepIndicator
              steps={selectedFlow.steps.map((step, index) => ({
                id: `${selectedFlow.id}-${index + 1}`,
                label: step,
                done: index < selectedFlow.steps.length - 1,
              }))}
              currentStepId={`${selectedFlow.id}-${selectedFlow.steps.length}`}
            />
          ) : (
            <p className="text-body-14-regular text-muted-foreground">선택된 플로우가 없습니다.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export { FlowList }
