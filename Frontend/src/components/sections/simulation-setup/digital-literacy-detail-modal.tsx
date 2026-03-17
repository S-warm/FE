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

type DeviceOption = "mac" | "windows" | "iphone" | "android" | "ipad" | "android_tablet"

const deviceOptions = [
  { label: "Mac", value: "mac" },
  { label: "Windows", value: "windows" },
  { label: "iPhone", value: "iphone" },
  { label: "Android", value: "android" },
  { label: "iPad", value: "ipad" },
  { label: "Android Tablet", value: "android_tablet" },
] as const

function DigitalLiteracyDetailModal({ triggerClassName }: { triggerClassName?: string }) {
  const [open, setOpen] = useState(false)
  const [visionLoss, setVisionLoss] = useState(0)
  const [attentionLevel, setAttentionLevel] = useState(50)
  const [device, setDevice] = useState<DeviceOption>("mac")

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
              options={[...deviceOptions]}
              onChange={(nextDevice) => setDevice(nextDevice as DeviceOption)}
            />
          </div>
        </div>

        <DialogFooter className="bg-[#f8faff]">
          <CommonButton variant="ghost" onClick={() => setOpen(false)}>
            취소
          </CommonButton>
          <CommonButton onClick={() => setOpen(false)}>적용</CommonButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { DigitalLiteracyDetailModal }
