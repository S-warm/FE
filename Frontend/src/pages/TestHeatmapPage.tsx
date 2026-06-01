import { useState, useRef, useEffect } from "react"

// 테스트용 더미 히트맵 포인트 데이터
const DUMMY_HEATMAP_POINTS = [
  { x: 400, y: 300, count: 3, severity: "high" },
  { x: 600, y: 600, count: 5, severity: "critical" },
  { x: 350, y: 1200, count: 2, severity: "medium" },
  { x: 800, y: 1500, count: 7, severity: "critical" },
  { x: 500, y: 2000, count: 1, severity: "low" },
  { x: 700, y: 2400, count: 4, severity: "high" },
  { x: 450, y: 2800, count: 6, severity: "critical" },
  { x: 900, y: 3000, count: 2, severity: "medium" },
]

function TestHeatmapPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [imageMetrics, setImageMetrics] = useState<{
    displayWidth: number
    displayHeight: number
    naturalWidth: number
    naturalHeight: number
  } | null>(null)

  const PANEL_MAX_HEIGHT = 800 // 고정 높이 테스트

  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const image = event.currentTarget
    const metrics = {
      displayWidth: image.clientWidth,
      displayHeight: image.clientHeight,
      naturalWidth: image.naturalWidth,
      naturalHeight: image.naturalHeight,
    }
    setImageMetrics(metrics)
    console.log("📊 Image loaded:", metrics)
  }

  // Canvas 그리기 (간단한 원형 마커)
  useEffect(() => {
    if (!canvasRef.current || !imageMetrics) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = imageMetrics.displayWidth
    canvas.height = imageMetrics.displayHeight
    canvas.style.width = `${imageMetrics.displayWidth}px`
    canvas.style.height = `${imageMetrics.displayHeight}px`

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 포인트들을 비율 기반으로 계산
    DUMMY_HEATMAP_POINTS.forEach((point) => {
      const xRatio = point.x / imageMetrics.naturalWidth
      const yRatio = point.y / imageMetrics.naturalHeight

      const displayX = xRatio * imageMetrics.displayWidth
      const displayY = yRatio * imageMetrics.displayHeight

      // 히트맵 그라데이션 원 그리기
      const gradient = ctx.createRadialGradient(displayX, displayY, 0, displayX, displayY, 60)
      gradient.addColorStop(0, `rgba(255, 0, 0, 0.6)`)
      gradient.addColorStop(1, `rgba(255, 0, 0, 0)`)

      ctx.fillStyle = gradient
      ctx.fillRect(displayX - 60, displayY - 60, 120, 120)
    })
  }, [imageMetrics])

  // 리사이즈 옵저버
  useEffect(() => {
    const image = imageRef.current
    if (!image) return

    const updateMetrics = () => {
      if (!image) return
      setImageMetrics({
        displayWidth: image.clientWidth,
        displayHeight: image.clientHeight,
        naturalWidth: image.naturalWidth,
        naturalHeight: image.naturalHeight,
      })
    }

    const resizeObserver = new ResizeObserver(updateMetrics)
    resizeObserver.observe(image)
    window.addEventListener("resize", updateMetrics)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener("resize", updateMetrics)
    }
  }, [])

  return (
    <div className="flex flex-col gap-4 p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">🧪 히트맵 레이아웃 테스트</h1>
        <p className="text-gray-600">
          긴 스크린샷(3500px)을 max-height(800px) 컨테이너에서 테스트합니다.
        </p>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <div className="bg-white p-4 rounded-lg">
            <h2 className="text-sm font-semibold mb-2">✅ 예상 결과</h2>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>✓ 사진이 축소되지 않음 (원본 비율 유지)</li>
              <li>✓ 컨테이너 높이 = 800px (고정)</li>
              <li>✓ 사진 높이 &gt; 800px 시 내부 스크롤</li>
              <li>✓ 히트맵 마커가 사진과 함께 스크롤</li>
            </ul>
          </div>
        </div>

        <div className="flex-1">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h2 className="text-sm font-semibold mb-2">📊 이미지 정보</h2>
            {imageMetrics ? (
              <div className="text-xs text-gray-600 space-y-1">
                <li>원본: {imageMetrics.naturalWidth}x{imageMetrics.naturalHeight}px</li>
                <li>표시: {imageMetrics.displayWidth.toFixed(0)}x{imageMetrics.displayHeight.toFixed(0)}px</li>
                <li>포인트 수: {DUMMY_HEATMAP_POINTS.length}개</li>
              </div>
            ) : (
              <p className="text-xs text-gray-500">이미지 로딩 중...</p>
            )}
          </div>
        </div>
      </div>

      {/* 메인 컨테이너 - 수정된 레이아웃 */}
      <div
        ref={containerRef}
        className="relative rounded-2xl border-2 border-blue-500 bg-white overflow-y-auto overscroll-contain shadow-lg"
        style={{
          maxHeight: `${PANEL_MAX_HEIGHT}px`,
        }}
      >
        <div className="inline-block w-full">
          <div className="relative w-full" style={{ display: "inline-block" }}>
            <img
              ref={imageRef}
              src="/test-screenshot-long.png"
              alt="Test Screenshot"
              className="block w-full h-auto"
              onLoad={handleImageLoad}
            />

            {/* 히트맵 캔버스 레이어 */}
            {imageMetrics ? (
              <canvas
                ref={canvasRef}
                className="pointer-events-none absolute left-0 top-0 z-[1] opacity-80"
                style={{
                  width: `${imageMetrics.displayWidth}px`,
                  height: `${imageMetrics.displayHeight}px`,
                }}
              />
            ) : null}

            {/* 핀포인트 마커 레이어 */}
            {imageMetrics ? (
              <div
                className="pointer-events-none absolute left-0 top-0 z-[3]"
                style={{
                  width: `${imageMetrics.displayWidth}px`,
                  height: `${imageMetrics.displayHeight}px`,
                }}
              >
                {DUMMY_HEATMAP_POINTS.map((point, index) => {
                  const xRatio = point.x / imageMetrics.naturalWidth
                  const yRatio = point.y / imageMetrics.naturalHeight
                  const displayX = xRatio * imageMetrics.displayWidth
                  const displayY = yRatio * imageMetrics.displayHeight

                  return (
                    <button
                      key={index}
                      className="pointer-events-auto absolute w-9 h-9 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-red-600 text-white text-xs font-bold shadow-lg hover:scale-110 transition-transform"
                      style={{
                        left: `${displayX}px`,
                        top: `${displayY}px`,
                      }}
                      title={`Point ${index + 1} - Severity: ${point.severity}`}
                    >
                      {point.count}
                    </button>
                  )
                })}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* 테스트 정보 */}
      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-sm">
        <p className="font-semibold mb-2">📝 테스트 방법:</p>
        <ol className="list-decimal list-inside text-gray-700 space-y-1">
          <li>위의 파란 박스 안에서 스크롤해보세요</li>
          <li>빨간 번호 마커가 이미지와 함께 스크롤되는지 확인</li>
          <li>사진이 축소되지 않고 전체가 보이는지 확인</li>
          <li>마커에 마우스 오버하면 정보가 표시됩니다</li>
        </ol>
      </div>
    </div>
  )
}

export default TestHeatmapPage
