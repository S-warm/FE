import { useState } from "react"

import { CommonButton } from "@/components/atoms"
import { RangeSlider, SelectionSelect } from "@/components/forms"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"

import { personaDeviceOptions, type PersonaDevice } from "@/constants/persona-device"
import { useSimulationDraftStore } from "@/store/simulation-draft.store"

function DigitalLiteracyDetailModal({ triggerClassName }: { triggerClassName?: string }) {
  const [open, setOpen] = useState(false)
  const [visionLoss, setVisionLoss] = useState(0)
  const [attentionLevel, setAttentionLevel] = useState(50)
  const device = useSimulationDraftStore((state) => state.personaDevice)
  const setDevice = useSimulationDraftStore((state) => state.setPersonaDevice)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <CommonButton type="button" variant="secondary" size="sm" className={triggerClassName} />
        }
      >
        세부설정 +
      </DialogTrigger>

      <DialogContent overlayClassName="bg-black/25" className="max-w-2xl overflow-hidden p-0">
        <div className="grid gap-4 p-6">
          <DialogHeader>
            <DialogTitle>고급설정</DialogTitle>
            <DialogDescription>세부적으로 페르소나를 조정합니다.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-6">
            <div className="grid gap-2">
              <p className="text-body-14-medium text-[#283452]">시력저하</p>
              <RangeSlider
                value={visionLoss}
                min={0}
                max={100}
                step={1}
                unit="%"
                color="#cfd7ea"
                tooltipFormatter={(nextValue) => `${nextValue}%`}
                onChange={setVisionLoss}
              />
            </div>

            <div className="grid gap-2">
              <p className="text-body-14-medium text-[#283452]">주의력</p>
              <RangeSlider
                value={attentionLevel}
                min={0}
                max={100}
                step={1}
                unit="%"
                color="#6f86d9"
                startLabel="낮음"
                endLabel="높음"
                tooltipFormatter={(nextValue) => `${nextValue}%`}
                onChange={setAttentionLevel}
              />
            </div>

            <SelectionSelect
              label="디바이스"
              value={device}
              options={[...personaDeviceOptions]}
              onChange={(nextDevice) => setDevice(nextDevice as PersonaDevice)}
            />
          </div>
        </div>

        <DialogFooter className="mx-0 mb-0 rounded-b-xl bg-[#f8faff] px-6 py-3 sm:justify-end">
          <div className="flex w-full items-center justify-end gap-2">
            <CommonButton variant="ghost" className="min-w-[72px]" onClick={() => setOpen(false)}>
              취소
            </CommonButton>
            <CommonButton className="min-w-[88px]" onClick={() => setOpen(false)}>
              적용
            </CommonButton>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { DigitalLiteracyDetailModal }
