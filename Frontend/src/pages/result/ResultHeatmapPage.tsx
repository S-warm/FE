import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useParams } from "react-router-dom"
import { Info } from "lucide-react"

import { IssueBadge } from "@/components/atoms"
import { EmptyState } from "@/components/sections"
import { ResultPageSidePanel } from "@/components/sections/result/page-side-panel"
import { ErrorState, ResultPageSkeleton } from "@/components/states"
import { Card, CardContent } from "@/components/ui/card"
import { resolveResultPageScreenshotSet } from "@/features/result/assets"
import { motion } from "@/lib/motion"
import { useResultPageParam } from "@/lib/result-page-param"
import { useResultPageSidePanelState } from "@/lib/result-page-side-panel-state"
import { cn } from "@/lib/utils"
import { useResultHeatmapQuery } from "@/queries"
import type { ResultAgeBand, ResultAgeFilter } from "@/types/view-model/common/result-meta"
import type {
  ResultHeatmapCoordinateMode,
  ResultHeatmapPageViewModel,
  ResultHeatmapPointViewModel,
} from "@/types/view-model/result/result-heatmap"

const ageFilters: ResultAgeFilter[] = [
  "all",
  "10대",
  "20대",
  "30대",
  "40대",
  "50대",
  "60대",
  "70대",
]

const selectableAgeBands = ageFilters.filter(
  (filter): filter is ResultAgeBand => filter !== "all",
)

function buildJetLookup(): Uint8ClampedArray {
  const stops: Array<[number, [number, number, number]]> = [
    [0.0, [10, 10, 130]],
    [0.2, [10, 60, 230]],
    [0.4, [10, 200, 220]],
    [0.55, [40, 220, 60]],
    [0.72, [240, 230, 30]],
    [0.88, [240, 130, 20]],
    [1.0, [220, 30, 30]],
  ]

  const lookup = new Uint8ClampedArray(256 * 3)
  for (let i = 0; i < 256; i += 1) {
    const t = i / 255
    let r = 0
    let g = 0
    let b = 0

    for (let stopIndex = 0; stopIndex < stops.length - 1; stopIndex += 1) {
      const [t0, c0] = stops[stopIndex]
      const [t1, c1] = stops[stopIndex + 1]
      if (t >= t0 && t <= t1) {
        const local = (t - t0) / (t1 - t0)
        r = Math.round(c0[0] + (c1[0] - c0[0]) * local)
        g = Math.round(c0[1] + (c1[1] - c0[1]) * local)
        b = Math.round(c0[2] + (c1[2] - c0[2]) * local)
        break
      }
    }

    lookup[i * 3] = r
    lookup[i * 3 + 1] = g
    lookup[i * 3 + 2] = b
  }

  return lookup
}

const JET_LOOKUP = buildJetLookup()
const BLOB_HEATMAP_RADIUS_SCALE = 0.095
const BLOB_HEATMAP_MIN_RADIUS = 54
const BLOB_HEATMAP_MAX_RADIUS = 118
const BLOB_HEATMAP_AMBIENT_SCALE = 1.28
const BLOB_HEATMAP_CORE_SCALE = 0.64
const BLOB_HEATMAP_CORE_ALPHA = 0.52
const BLOB_HEATMAP_AMBIENT_ALPHA = 0.18
const BLOB_HEATMAP_OUTPUT_ALPHA = 0.72
const BLOB_HEATMAP_ALPHA_GAMMA = 1.08
const BLOB_HEATMAP_LOW_SAMPLE_BOOST = 1.06
const MAX_HEATMAP_RENDER_DIMENSION = 1280
const HEATMAP_PANEL_MAX_HEIGHT_PX = 3200
const HEATMAP_PANEL_MAX_VIEWPORT_RATIO = 1.6

function getDevicePixelRatio() {
  return typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1
}

function getLowSampleVisibilityProfile(pointsCount: number) {
  // 초저샘플: 1-2개 포인트
  if (pointsCount <= 2) {
    return {
      intensityBoost: 1.02,
      intensityFloor: 0.08,
      coreAlphaBonus: 0.03,
      ambientAlphaBonus: 0.02,
      alphaThreshold: 4,
    }
  }

  // 저샘플: 3-4개 포인트 (강도 조정)
  if (pointsCount <= 4) {
    return {
      intensityBoost: 1.0,
      intensityFloor: 0.06,
      coreAlphaBonus: 0.03,
      ambientAlphaBonus: 0.02,
      alphaThreshold: 4,
    }
  }

  if (pointsCount <= 8) {
    return {
      intensityBoost: 1.04,
      intensityFloor: 0.08,
      coreAlphaBonus: 0.03,
      ambientAlphaBonus: 0.02,
      alphaThreshold: 4,
    }
  }

  if (pointsCount <= 12) {
    return {
      intensityBoost: 1.02,
      intensityFloor: 0.07,
      coreAlphaBonus: 0.02,
      ambientAlphaBonus: 0.02,
      alphaThreshold: 4,
    }
  }

  if (pointsCount <= 24) {
    return {
      intensityBoost: BLOB_HEATMAP_LOW_SAMPLE_BOOST,
      intensityFloor: 0.06,
      coreAlphaBonus: 0.02,
      ambientAlphaBonus: 0.02,
      alphaThreshold: 4,
    }
  }

  return {
    intensityBoost: 1,
    intensityFloor: 0,
    coreAlphaBonus: 0,
    ambientAlphaBonus: 0,
    alphaThreshold: Math.max(4, Math.round(9 / getDevicePixelRatio())),
  }
}

function clampUnit(value: number) {
  if (!Number.isFinite(value)) return 0
  return Math.max(0, Math.min(1, value))
}

function getPointBadgeVariant(point: ResultHeatmapPointViewModel) {
  const tone = point.severity.tone
  return tone === "neutral" ? "info" : tone
}

function getMarkerColor(point: ResultHeatmapPointViewModel) {
  void point
  return "bg-slate-950/78"
}

function formatPercent(value: number) {
  return `${Math.round(value)}%`
}

interface RenderedImageMetrics {
  displayWidth: number
  displayHeight: number
  naturalWidth: number
  naturalHeight: number
}

function areImageMetricsEqual(
  left: RenderedImageMetrics | null,
  right: RenderedImageMetrics,
) {
  return (
    left?.displayWidth === right.displayWidth &&
    left?.displayHeight === right.displayHeight &&
    left?.naturalWidth === right.naturalWidth &&
    left?.naturalHeight === right.naturalHeight
  )
}

function clampRatio(value: number) {
  if (!Number.isFinite(value)) return 0
  return Math.max(0, Math.min(1, value))
}

function resolvePointRatios(
  point: Pick<ResultHeatmapPointViewModel, "x" | "y">,
  metrics: RenderedImageMetrics,
  coordinateMode: ResultHeatmapCoordinateMode,
) {
  const { x, y } = point

  if (coordinateMode === "ratio") {
    return {
      xRatio: clampRatio(x),
      yRatio: clampRatio(y),
    }
  }

  if (coordinateMode === "percent") {
    return {
      xRatio: clampRatio(x / 100),
      yRatio: clampRatio(y / 100),
    }
  }

  if (
    coordinateMode === "pixel-scaled-thousand" &&
    metrics.naturalWidth > 0 &&
    metrics.naturalHeight > 0
  ) {
    return {
      xRatio: clampRatio((x * 1000) / metrics.naturalWidth),
      yRatio: clampRatio((y * 1000) / metrics.naturalHeight),
    }
  }

  if (coordinateMode === "pixel" && metrics.naturalWidth > 0 && metrics.naturalHeight > 0) {
    return {
      xRatio: clampRatio(x / metrics.naturalWidth),
      yRatio: clampRatio(y / metrics.naturalHeight),
    }
  }

  return {
    xRatio: 0,
    yRatio: 0,
  }
}

function resolvePointPixels(
  point: Pick<ResultHeatmapPointViewModel, "x" | "y">,
  metrics: RenderedImageMetrics,
  coordinateMode: ResultHeatmapCoordinateMode,
) {
  const { xRatio, yRatio } = resolvePointRatios(point, metrics, coordinateMode)

  return {
    xRatio,
    yRatio,
    left: xRatio * metrics.displayWidth,
    top: yRatio * metrics.displayHeight,
  }
}

function getSeverityWeight(point: ResultHeatmapPointViewModel) {
  const rank = point.severity?.rank ?? 0
  if (rank >= 4) return 1.5
  if (rank >= 2) return 1.0
  return 0.6
}

function getPointIntensity(point: ResultHeatmapPointViewModel) {
  return point.count * getSeverityWeight(point)
}

function getPercentile(sortedValues: number[], percentile: number) {
  if (!sortedValues.length) {
    return 0
  }

  const clampedPercentile = Math.max(0, Math.min(1, percentile))
  const index = Math.min(
    sortedValues.length - 1,
    Math.floor((sortedValues.length - 1) * clampedPercentile),
  )

  return sortedValues[index] ?? 0
}

function getPointDensityFactors(
  points: ResultHeatmapPointViewModel[],
  metrics: RenderedImageMetrics,
  coordinateMode: ResultHeatmapCoordinateMode,
  baseRadius: number,
) {
  const positions = points.map((point) =>
    resolvePointPixels(point, metrics, coordinateMode)
  )
  const influenceDistance = baseRadius * 1.85
  const bucketSize = Math.max(24, Math.round(influenceDistance))
  const buckets = new Map<string, number[]>()

  positions.forEach((position, index) => {
    const bucketX = Math.floor(position.left / bucketSize)
    const bucketY = Math.floor(position.top / bucketSize)
    const bucketKey = `${bucketX}:${bucketY}`
    const bucket = buckets.get(bucketKey) ?? []
    bucket.push(index)
    buckets.set(bucketKey, bucket)
  })

  const densities = positions.map((position, currentIndex) => {
    let accumulatedDensity = 0

    const currentBucketX = Math.floor(position.left / bucketSize)
    const currentBucketY = Math.floor(position.top / bucketSize)

    for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
      for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
        const neighborBucket = buckets.get(
          `${currentBucketX + offsetX}:${currentBucketY + offsetY}`,
        )
        if (!neighborBucket) continue

        for (const compareIndex of neighborBucket) {
          if (compareIndex === currentIndex) continue

          const comparePosition = positions[compareIndex]
          const distanceX = position.left - comparePosition.left
          const distanceY = position.top - comparePosition.top
          const distance = Math.hypot(distanceX, distanceY)

          if (distance > influenceDistance) continue

          const normalizedDistance = distance / influenceDistance
          accumulatedDensity += Math.exp(-(normalizedDistance * normalizedDistance) * 3.1)
        }
      }
    }

    return clampUnit(accumulatedDensity / 2.4)
  })

  return { positions, densities }
}

function drawHeatmapLayer(
  canvas: HTMLCanvasElement,
  metrics: RenderedImageMetrics,
  coordinateMode: ResultHeatmapCoordinateMode,
  points: ResultHeatmapPointViewModel[],
) {
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  const cssWidth = metrics.displayWidth
  const cssHeight = metrics.displayHeight
  if (cssWidth <= 0 || cssHeight <= 0) return

  const renderScale = Math.min(
    getDevicePixelRatio(),
    MAX_HEATMAP_RENDER_DIMENSION / Math.max(cssWidth, cssHeight, 1),
  )
  canvas.style.width = `${cssWidth}px`
  canvas.style.height = `${cssHeight}px`
  canvas.width = Math.max(1, Math.round(cssWidth * renderScale))
  canvas.height = Math.max(1, Math.round(cssHeight * renderScale))

  ctx.setTransform(renderScale, 0, 0, renderScale, 0, 0)
  ctx.clearRect(0, 0, cssWidth, cssHeight)
  if (!points.length) return

  const baseRadius = Math.max(
    BLOB_HEATMAP_MIN_RADIUS,
    Math.min(BLOB_HEATMAP_MAX_RADIUS, cssWidth * BLOB_HEATMAP_RADIUS_SCALE),
  )
  const intensities = points.map(getPointIntensity)
  const maxIntensity = Math.max(...intensities, 1)
  const sortedIntensities = [...intensities].sort((left, right) => left - right)
  const medianIntensity = getPercentile(sortedIntensities, 0.5)
  const upperQuartileIntensity = getPercentile(sortedIntensities, 0.75)
  const referenceIntensity = Math.max(
    1,
    maxIntensity * 1.35,
    medianIntensity * 2,
    upperQuartileIntensity * 1.7,
  )
  const visibilityProfile = getLowSampleVisibilityProfile(points.length)
  const { positions, densities } = getPointDensityFactors(
    points,
    metrics,
    coordinateMode,
    baseRadius,
  )

  ctx.globalCompositeOperation = "lighter"
  for (let index = 0; index < points.length; index += 1) {
    const { left, top } = positions[index]
    const normalized = clampUnit(intensities[index] / referenceIntensity)
    const density = densities[index]
    const softened = clampUnit(
      Math.max(
        visibilityProfile.intensityFloor,
        Math.pow(normalized, 1.18) * visibilityProfile.intensityBoost,
      ),
    )
    const radius = baseRadius * (0.84 + density * 0.1 + softened * 0.04)
    const ambientRadius = radius * (BLOB_HEATMAP_AMBIENT_SCALE + density * 0.05)
    const coreRadius = radius * Math.max(0.58, BLOB_HEATMAP_CORE_SCALE - density * 0.04)
    const coreAlpha = Math.min(
      0.52,
      visibilityProfile.coreAlphaBonus +
        softened * (BLOB_HEATMAP_CORE_ALPHA - density * 0.04),
    )
    const ambientAlpha = Math.min(
      0.22,
      visibilityProfile.ambientAlphaBonus +
        softened * (BLOB_HEATMAP_AMBIENT_ALPHA + density * 0.03),
    )

    const ambientGradient = ctx.createRadialGradient(
      left,
      top,
      0,
      left,
      top,
      ambientRadius,
    )
    ambientGradient.addColorStop(0.0, `rgba(0, 0, 0, ${ambientAlpha})`)
    ambientGradient.addColorStop(0.45, `rgba(0, 0, 0, ${ambientAlpha * 0.82})`)
    ambientGradient.addColorStop(0.78, `rgba(0, 0, 0, ${ambientAlpha * 0.3})`)
    ambientGradient.addColorStop(1.0, "rgba(0, 0, 0, 0)")

    ctx.fillStyle = ambientGradient
    ctx.fillRect(
      left - ambientRadius,
      top - ambientRadius,
      ambientRadius * 2,
      ambientRadius * 2,
    )

    const coreGradient = ctx.createRadialGradient(left, top, 0, left, top, coreRadius)
    coreGradient.addColorStop(0.0, `rgba(0, 0, 0, ${coreAlpha * 0.94})`)
    coreGradient.addColorStop(0.14, `rgba(0, 0, 0, ${coreAlpha * 0.76})`)
    coreGradient.addColorStop(0.42, `rgba(0, 0, 0, ${coreAlpha * 0.26})`)
    coreGradient.addColorStop(1.0, "rgba(0, 0, 0, 0)")

    ctx.fillStyle = coreGradient
    ctx.fillRect(left - coreRadius, top - coreRadius, coreRadius * 2, coreRadius * 2)
  }
  ctx.globalCompositeOperation = "source-over"

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const { data } = imageData
  const alphaThreshold =
    visibilityProfile.alphaThreshold ?? Math.max(4, Math.round(9 / renderScale))

  for (let index = 0; index < data.length; index += 4) {
    const alpha = data[index + 3]
    if (alpha < alphaThreshold) {
      data[index + 3] = 0
      continue
    }

    const normalizedAlpha = Math.pow(alpha / 255, BLOB_HEATMAP_ALPHA_GAMMA)
    const lookupAlpha = Math.max(0, Math.min(255, Math.round(normalizedAlpha * 255)))
    const lookupIndex = lookupAlpha * 3
    data[index] = JET_LOOKUP[lookupIndex]
    data[index + 1] = JET_LOOKUP[lookupIndex + 1]
    data[index + 2] = JET_LOOKUP[lookupIndex + 2]
    data[index + 3] = Math.min(
      255,
      Math.round(lookupAlpha * BLOB_HEATMAP_OUTPUT_ALPHA),
    )
  }

  ctx.putImageData(imageData, 0, 0)
}

function HeatmapCanvas({
  page,
  isPinpointMode,
  selectedMarkerId,
  onSelectPoint,
  hoveredMarkerId,
  onHoverPoint,
}: {
  page: ResultHeatmapPageViewModel
  isPinpointMode: boolean
  selectedMarkerId: string | null
  onSelectPoint: (markerId: string) => void
  hoveredMarkerId: string | null
  onHoverPoint: (markerId: string | null) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // screenshotSet을 먼저 계산해 activeScreenshotUrl 초기값으로 사용
  const screenshotSet = useMemo(
    () =>
      resolveResultPageScreenshotSet({
        pageId: page.pageId,
        screenshotUrl: page.screenshotUrl,
      }),
    [page.pageId, page.screenshotUrl],
  )
  const [failedScreenshotUrl, setFailedScreenshotUrl] = useState<string | null>(null)
  const [activeScreenshotUrl, setActiveScreenshotUrl] = useState<string | null>(
    () => screenshotSet.fullUrl ?? screenshotSet.originalUrl ?? null,
  )
  const [imageMetrics, setImageMetrics] = useState<RenderedImageMetrics | null>(null)
  const [hoveredTooltipState, setHoveredTooltipState] = useState<{
    markerId: string
    position: { x: number; y: number }
  } | null>(null)
  const [panelMaxHeight, setPanelMaxHeight] = useState(() =>
    Math.min(
      HEATMAP_PANEL_MAX_HEIGHT_PX,
      Math.round(window.innerHeight * HEATMAP_PANEL_MAX_VIEWPORT_RATIO),
    ),
  )

  useEffect(() => {
    const updatePanelMaxHeight = () => {
      setPanelMaxHeight(
        Math.min(
          HEATMAP_PANEL_MAX_HEIGHT_PX,
          Math.round(window.innerHeight * HEATMAP_PANEL_MAX_VIEWPORT_RATIO),
        ),
      )
    }

    updatePanelMaxHeight()
    window.addEventListener("resize", updatePanelMaxHeight)

    return () => {
      window.removeEventListener("resize", updatePanelMaxHeight)
    }
  }, [])

  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const image = event.currentTarget
    const hasExpectedDimensions =
      image.naturalWidth > 0 &&
      image.naturalHeight > 0 &&
      image.naturalWidth === screenshotSet.expectedNaturalWidth &&
      image.naturalHeight === screenshotSet.expectedNaturalHeight

    const canFallbackToOriginal =
      activeScreenshotUrl === screenshotSet.fullUrl &&
      screenshotSet.originalUrl &&
      screenshotSet.originalUrl !== screenshotSet.fullUrl

    if (
      screenshotSet.expectedNaturalWidth &&
      screenshotSet.expectedNaturalHeight &&
      !hasExpectedDimensions
    ) {
      if (canFallbackToOriginal) {
        setActiveScreenshotUrl(screenshotSet.originalUrl ?? null)
        return
      }

      if (import.meta.env.DEV) {
        console.warn("[heatmap] screenshot dimension mismatch", {
          pageId: page.pageId,
          currentUrl: activeScreenshotUrl,
          expectedWidth: screenshotSet.expectedNaturalWidth,
          expectedHeight: screenshotSet.expectedNaturalHeight,
          actualWidth: image.naturalWidth,
          actualHeight: image.naturalHeight,
        })
      }
    }

    const nextMetrics = {
      displayWidth: image.clientWidth,
      displayHeight: image.clientHeight,
      naturalWidth: image.naturalWidth,
      naturalHeight: image.naturalHeight,
    }

    setImageMetrics((prev) => (
      areImageMetricsEqual(prev, nextMetrics) ? prev : nextMetrics
    ))
  }

  useEffect(() => {
    const updateMetrics = () => {
      const image = imageRef.current
      if (!image) return

      const nextMetrics = {
        displayWidth: image.clientWidth,
        displayHeight: image.clientHeight,
        naturalWidth: image.naturalWidth,
        naturalHeight: image.naturalHeight,
      }

      setImageMetrics((prev) => (
        areImageMetricsEqual(prev, nextMetrics) ? prev : nextMetrics
      ))
    }

    updateMetrics()

    const image = imageRef.current
    if (!image || typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateMetrics)
      return () => {
        window.removeEventListener("resize", updateMetrics)
      }
    }

    const resizeObserver = new ResizeObserver(() => {
      updateMetrics()
    })

    resizeObserver.observe(image)
    window.addEventListener("resize", updateMetrics)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener("resize", updateMetrics)
    }
  }, [page.pageId])

  useEffect(() => {
    if (!canvasRef.current || !imageMetrics) return
    if (imageMetrics.displayWidth <= 0 || imageMetrics.displayHeight <= 0) return

    let rafId: number | null = null
    const scheduleDraw = () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
      }

      rafId = requestAnimationFrame(() => {
        if (!canvasRef.current) return

        drawHeatmapLayer(
          canvasRef.current,
          imageMetrics,
          page.coordinateMode,
          page.points,
        )
        rafId = null
      })
    }

    scheduleDraw()

    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
      }
    }
  }, [imageMetrics, page.coordinateMode, page.points])

  const getTooltipPosition = useCallback(
    (point: Pick<ResultHeatmapPointViewModel, "x" | "y">) => {
      const image = imageRef.current
      if (!image || !imageMetrics) {
        return { x: 0, y: 0 }
      }

      const imageRect = image.getBoundingClientRect()
      const { left, top } = resolvePointPixels(point, imageMetrics, page.coordinateMode)

      return {
        x: imageRect.left + left,
        y: imageRect.top + top,
      }
    },
    [imageMetrics, page.coordinateMode],
  )

  useEffect(() => {
    const scrollContainer = containerRef.current
    if (!scrollContainer || !hoveredTooltipState || !imageMetrics) return

    const syncHoveredTooltip = () => {
      const hoveredPoint = page.points.find(
        (point) => point.markerId === hoveredTooltipState.markerId,
      )

      if (!hoveredPoint) {
        setHoveredTooltipState(null)
        return
      }

      setHoveredTooltipState((prev) => {
        if (!prev || prev.markerId !== hoveredPoint.markerId) return prev

        return {
          markerId: hoveredPoint.markerId,
          position: getTooltipPosition(hoveredPoint),
        }
      })
    }

    scrollContainer.addEventListener("scroll", syncHoveredTooltip, { passive: true })
    window.addEventListener("resize", syncHoveredTooltip)

    return () => {
      scrollContainer.removeEventListener("scroll", syncHoveredTooltip)
      window.removeEventListener("resize", syncHoveredTooltip)
    }
  }, [getTooltipPosition, hoveredTooltipState, imageMetrics, page.points])

  const shouldConstrainHeight =
    imageMetrics !== null && imageMetrics.displayHeight > panelMaxHeight

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative rounded-2xl border border-border-strong bg-card",
        shouldConstrainHeight ? "overflow-y-auto overscroll-contain" : "overflow-hidden",
      )}
      style={{
        maxHeight: shouldConstrainHeight ? `${panelMaxHeight}px` : undefined,
      }}
    >
      {activeScreenshotUrl && failedScreenshotUrl !== activeScreenshotUrl ? (
        <div className="relative w-full">
          <div className="relative w-full">
            <img
              ref={imageRef}
              src={activeScreenshotUrl}
              alt={page.pageName}
              className="block w-full h-auto"
              decoding="async"
              fetchPriority="low"
              onLoad={handleImageLoad}
              onError={() => {
                if (
                  activeScreenshotUrl === screenshotSet.fullUrl &&
                  screenshotSet.originalUrl &&
                  screenshotSet.originalUrl !== screenshotSet.fullUrl
                ) {
                  setActiveScreenshotUrl(screenshotSet.originalUrl ?? null)
                  return
                }

                setFailedScreenshotUrl(activeScreenshotUrl)
              }}
            />

            {imageMetrics ? (
              <canvas
                ref={canvasRef}
                className="pointer-events-none absolute left-0 top-0 z-[1] opacity-100"
                style={{
                  width: `${imageMetrics.displayWidth}px`,
                  height: `${imageMetrics.displayHeight}px`,
                }}
              />
            ) : null}

            {imageMetrics && isPinpointMode ? (
              <div
                className="pointer-events-none absolute left-0 top-0 z-[3]"
                style={{
                  width: `${imageMetrics.displayWidth}px`,
                  height: `${imageMetrics.displayHeight}px`,
                }}
              >
                {page.points.map((point, index) => {
                  const isSelected = point.markerId === selectedMarkerId
                  const isHovered = point.markerId === hoveredMarkerId
                  const uniqueKey = point.markerId || `${page.pageUrl}-${point.issueId}-${index}`
                  const position = resolvePointPixels(point, imageMetrics, page.coordinateMode)

                  return (
                    <div key={uniqueKey}>
                      <div
                        className={cn(
                          "absolute rounded-full blur-[14px] transition-opacity duration-300",
                          getMarkerColor(point),
                          "opacity-14",
                        )}
                        style={{
                          left: `${position.left}px`,
                          top: `${position.top}px`,
                          width: `${10 + point.count * 2}px`,
                          height: `${10 + point.count * 2}px`,
                          transform: "translate(-50%, -50%)",
                          zIndex: isHovered ? 9 : 0,
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => onSelectPoint(point.markerId)}
                        onMouseEnter={() => {
                          onHoverPoint(point.markerId)
                          setHoveredTooltipState({
                            markerId: point.markerId,
                            position: getTooltipPosition(point),
                          })
                        }}
                        onMouseLeave={() => {
                          onHoverPoint(null)
                          setHoveredTooltipState(null)
                        }}
                        className={cn(
                          "pointer-events-auto absolute grid size-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/55 text-[11px] font-semibold text-white shadow-[0_6px_16px_rgba(15,23,42,0.32)] backdrop-blur-sm transition-all duration-300",
                          getMarkerColor(point),
                          isSelected ? "ring-3 ring-white/65" : "",
                          isHovered
                            ? "scale-110 ring-4 ring-white/90 shadow-2xl"
                            : "hover:scale-105",
                          "opacity-92",
                        )}
                        style={{
                          left: `${position.left}px`,
                          top: `${position.top}px`,
                          zIndex: isHovered ? 10 : 1,
                        }}
                        aria-label={`${point.issueId} ${point.description}`}
                      >
                        {point.count}
                      </button>

                      {isHovered && hoveredTooltipState?.markerId === point.markerId ? (
                        <MarkerTooltip point={point} position={hoveredTooltipState.position} />
                      ) : null}
                    </div>
                  )
                })}
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="grid w-full place-items-center py-12">
          <p className="text-caption-12-regular text-text-muted">
            스크린샷이 없습니다
          </p>
        </div>
      )}
    </div>
  )
}

function MarkerTooltip({
  point,
  position,
}: {
  point: ResultHeatmapPointViewModel
  position: { x: number; y: number }
}) {
  const [tooltipRect, setTooltipRect] = useState<DOMRect | null>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (tooltipRef.current) {
      setTooltipRect(tooltipRef.current.getBoundingClientRect())
    }
  }, [point.issueId])

  let left = position.x + 12
  let top = position.y - 50

  const tooltipWidth = tooltipRect?.width ?? 280
  const tooltipHeight = tooltipRect?.height ?? 100
  const viewportWidth =
    typeof window !== "undefined" ? window.innerWidth : Number.POSITIVE_INFINITY
  const viewportHeight =
    typeof window !== "undefined" ? window.innerHeight : Number.POSITIVE_INFINITY
  const padding = 16

  if (left + tooltipWidth > viewportWidth - padding) {
    left = position.x - tooltipWidth - 12
  }

  if (top < padding) {
    top = position.y + 12
  }

  if (top + tooltipHeight > viewportHeight - padding) {
    top = position.y - tooltipHeight - 12
  }

  if (left < padding) {
    left = position.x + 12
  }

  return (
    <div
      ref={tooltipRef}
      className="pointer-events-none fixed z-70 w-72 rounded-xl border border-border-strong bg-white p-3 shadow-lg"
      style={{
        left: `${left}px`,
        top: `${top}px`,
      }}
    >
      <div className="grid gap-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-start gap-2">
            <IssueBadge variant={getPointBadgeVariant(point)} size="sm" className="shrink-0">
              {point.errorType}
            </IssueBadge>
          </div>
          <p className="text-body-12-medium text-text-body break-words">{point.errorType}</p>
        </div>
        <p className="text-body-14-medium text-text-body">{point.issueId}</p>
        <p className="text-caption-12-regular text-text-muted">{point.description}</p>
      </div>
    </div>
  )
}

function PointDetail({ point }: { point: ResultHeatmapPointViewModel | null }) {
  if (!point) {
    return (
      <EmptyState
        title="선택된 오류 포인트가 없습니다"
        description="스크린샷의 마커 또는 아래 목록에서 오류 포인트를 선택해 주세요."
      />
    )
  }

  return (
    <Card
      className={cn(
        "rounded-2xl border border-border-strong bg-card shadow-none",
        motion.card,
      )}
    >
      <CardContent className="grid gap-4 px-6 py-5">
        <div className="grid gap-3">
          <div>
            <p className="text-body-14-medium text-text-body">오류 상세 정보</p>
            <p className="mt-1 text-caption-12-regular text-text-muted">
              선택한 히트맵 포인트의 오류 상황과 분석 결과입니다. 차단율,
              반복 발생 횟수, 오류 타입 분포를 통해 문제의 심각도를 파악할 수
              있습니다.
            </p>
          </div>
        </div>

        <div className="grid gap-3">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <IssueBadge variant={getPointBadgeVariant(point)} size="sm">
                {point.errorType}
              </IssueBadge>
              <p className="text-body-14-medium text-text-body">{point.issueId}</p>
            </div>
            <p className="mb-2 text-caption-12-regular text-text-muted">
              {point.description}
            </p>
            <div className="flex items-center justify-between">
              <p className="text-caption-12-medium text-text-secondary">
                포함 연령대 {point.ageBand === "all" ? "전체" : point.ageBand}
              </p>
              <div className="whitespace-nowrap rounded-xl bg-surface-subtle px-3 py-2 text-caption-12-medium text-text-secondary">
                영향 사용자 {point.affectedUsersCount}명
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-border-subtle bg-surface-subtle px-4 py-3">
            <p className="text-caption-12-regular text-text-muted">차단율</p>
            <p className="mt-1 text-body-14-medium text-text-body">
              {formatPercent(point.blockRate)}
            </p>
          </div>
          <div className="rounded-2xl border border-border-subtle bg-surface-subtle px-4 py-3">
            <p className="text-caption-12-regular text-text-muted">반복 발생</p>
            <p className="mt-1 text-body-14-medium text-text-body">
              {point.repeatCount.toFixed(1)}회
            </p>
          </div>
          <div className="rounded-2xl border border-border-subtle bg-surface-subtle px-4 py-3">
            <p className="text-caption-12-regular text-text-muted">오류 수</p>
            <p className="mt-1 text-body-14-medium text-text-body">{point.count}건</p>
          </div>
        </div>

        <div className="grid gap-2">
          <p className="text-caption-12-medium text-text-secondary">오류 분포</p>
          <div className="grid gap-2 md:grid-cols-3">
            <div className="rounded-2xl border border-border-subtle bg-card px-4 py-3">
              <p className="text-caption-12-regular text-text-muted">Timeout</p>
              <p className="mt-1 text-body-14-medium text-text-body">
                {point.errorBreakdown.timeout}건
              </p>
            </div>
            <div className="rounded-2xl border border-border-subtle bg-card px-4 py-3">
              <p className="text-caption-12-regular text-text-muted">Network</p>
              <p className="mt-1 text-body-14-medium text-text-body">
                {point.errorBreakdown.network}건
              </p>
            </div>
            <div className="rounded-2xl border border-border-subtle bg-card px-4 py-3">
              <p className="text-caption-12-regular text-text-muted">Console</p>
              <p className="mt-1 text-body-14-medium text-text-body">
                {point.errorBreakdown.console}건
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

void PointDetail

function ResultHeatmapPage() {
  const { simulationId } = useParams()
  const resolvedId = simulationId ?? "unknown"
  const [selectedAgeBands, setSelectedAgeBands] =
    useState<ResultAgeBand[]>(selectableAgeBands)
  const [hasUserClearedAll, setHasUserClearedAll] = useState(false)

  // 선택된 연령대가 비워지면 hasUserClearedAll 자동 업데이트
  useEffect(() => {
    setHasUserClearedAll(selectedAgeBands.length === 0)
  }, [selectedAgeBands])
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [isPinpointMode, setIsPinpointMode] = useState(true)
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null)
  const [hoveredMarkerId, setHoveredMarkerId] = useState<string | null>(null)
  const isAllAgesSelected = selectedAgeBands.length === selectableAgeBands.length
  const activeAgeFilterLabel: ResultAgeFilter =
    isAllAgesSelected ? "all" : (selectedAgeBands[0] ?? "all")
  const { data, isLoading, isError, refetch } = useResultHeatmapQuery({
    simulationId: resolvedId,
    ageGroups: selectedAgeBands,
    page: currentPageIndex,
    size: 12,
  })
  const pages = useMemo(() => data?.pages ?? [], [data])
  const pageIds = pages.map((page) => page.pageId)
  const { selectedPageId, setSelectedPageId } = useResultPageParam({
    availablePageIds: pageIds,
    defaultPageId: pageIds[0],
  })
  const { expandedPageIds, expandPage, togglePage } = useResultPageSidePanelState(
    selectedPageId,
    pageIds,
  )

  const selectedPage = useMemo<ResultHeatmapPageViewModel | null>(
    () => pages.find((page) => page.pageId === selectedPageId) ?? pages[0] ?? null,
    [pages, selectedPageId],
  )
  const selectedPoint = useMemo(() => {
    if (!isPinpointMode) {
      return selectedPage?.points[0] ?? null
    }

    if (hoveredMarkerId) {
      return (
        selectedPage?.points.find((point) => point.markerId === hoveredMarkerId) ??
        null
      )
    }

    return (
      selectedPage?.points.find((point) => point.markerId === selectedMarkerId) ??
      selectedPage?.points[0] ??
      null
    )
  }, [hoveredMarkerId, isPinpointMode, selectedMarkerId, selectedPage])

  const togglePinpointMode = useCallback(() => {
    setIsPinpointMode((prev) => {
      const next = !prev
      if (!next) {
        setSelectedMarkerId(null)
        setHoveredMarkerId(null)
      }
      return next
    })
  }, [])

  const resetHeatmapSelection = useCallback(() => {
    setCurrentPageIndex(0)
    setSelectedMarkerId(null)
    setHoveredMarkerId(null)
  }, [])

  const toggleAgeFilter = useCallback((filter: ResultAgeFilter) => {
    setSelectedAgeBands((prev) => {
      if (filter === "all") {
        // "all" 클릭 시 모든 연령대 선택
        return selectableAgeBands
      }

      const isCurrentlySelected = prev.includes(filter)

      if (isCurrentlySelected) {
        // 이미 선택된 연령대 제거
        return prev.filter((ageBand) => ageBand !== filter)
      } else {
        // 새로운 연령대 선택
        const nextAgeBands = [...prev, filter]
        return selectableAgeBands.filter((ageBand) => nextAgeBands.includes(ageBand))
      }
    })
    resetHeatmapSelection()
  }, [resetHeatmapSelection])

  const clearAllAgeFilters = useCallback(() => {
    setSelectedAgeBands([])
    resetHeatmapSelection()
  }, [resetHeatmapSelection])

  const resetAgeFilters = useCallback(() => {
    setSelectedAgeBands(selectableAgeBands)
    resetHeatmapSelection()
  }, [resetHeatmapSelection])

  const sidePages = useMemo(
    () =>
      pages.map((page) => {
        const screenshotSet = resolveResultPageScreenshotSet({
          pageId: page.pageId,
          screenshotUrl: page.screenshotUrl,
        })

        return {
          id: page.pageId,
          name: page.pageName,
          url: page.pageUrl,
          previewUrl: screenshotSet.previewUrl,
        }
      }),
    [pages],
  )

  if (isLoading) {
    return <ResultPageSkeleton />
  }

  if (isError) {
    return (
      <ErrorState
        title="히트맵 데이터를 불러오지 못했습니다"
        description="잠시 후 다시 시도해 주세요."
        actionLabel="다시 시도"
        onAction={() => {
          void refetch()
        }}
      />
    )
  }

  if (!pages.length) {
    return (
      <EmptyState
        title="히트맵 데이터가 없습니다"
        description="선택한 시뮬레이션에 연결된 히트맵 데이터가 아직 없습니다."
      />
    )
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)] h-full min-h-0">
      <ResultPageSidePanel
        pages={sidePages}
        selectedPageId={selectedPageId}
        expandedPageIds={expandedPageIds}
        onSelectPage={(pageId) => {
          setSelectedPageId(pageId)
          setSelectedMarkerId(null)
          setHoveredMarkerId(null)
          expandPage(pageId)
        }}
        onTogglePage={togglePage}
      />

      <div className="grid gap-4 min-h-0 overflow-y-auto">
        <Card
          className={cn(
            "rounded-2xl border border-border-strong bg-card shadow-none",
            motion.card,
          )}
        >
          <CardContent className="grid gap-4 px-6 py-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="grid gap-1">
                <p className="text-body-14-medium text-text-body">히트맵 필터</p>
                <p className="text-caption-12-regular text-text-muted">
                  연령대와 페이지 데이터를 기준으로 집중된 오류 포인트를 확인합니다.
                </p>
              </div>
              <div className="rounded-xl bg-surface-subtle px-3 py-2 text-caption-12-medium text-text-secondary">
                {selectedPage?.metaText ?? "오류 포인트"}
              </div>
            </div>

            <p className="text-caption-12-regular text-text-muted">
              선택된 연령대: {activeAgeFilterLabel === "all" ? "전체" : selectedAgeBands.join(", ")}
            </p>

            <div className="flex flex-wrap gap-2">
              {ageFilters.map((filter) => {
                const active =
                  filter === "all"
                    ? isAllAgesSelected
                    : selectedAgeBands.includes(filter)
                return (
                  <button
                    key={filter}
                    type="button"
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-caption-12-medium transition-colors",
                      active
                        ? "border-border-focus bg-brand-subtle text-text-link"
                        : "border-border-soft bg-card text-text-secondary hover:bg-surface-subtle",
                    )}
                    onClick={() => {
                      toggleAgeFilter(filter)
                    }}
                  >
                    {filter === "all" ? "전체" : filter}
                  </button>
                )
              })}
              <button
                type="button"
                onClick={clearAllAgeFilters}
                disabled={selectedAgeBands.length === 0}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-caption-12-medium transition-colors",
                  selectedAgeBands.length === 0
                    ? "border-border-soft bg-card text-text-secondary opacity-50 cursor-not-allowed"
                    : "border-border-soft bg-card text-text-secondary hover:bg-surface-subtle",
                )}
              >
                모두 해제
              </button>
              {hasUserClearedAll && (
                <button
                  type="button"
                  onClick={resetAgeFilters}
                  className="rounded-full border border-border-soft bg-card px-3 py-1.5 text-caption-12-medium text-text-secondary transition-colors hover:bg-surface-subtle"
                >
                  초기화
                </button>
              )}
              <button
                type="button"
                onClick={togglePinpointMode}
                aria-pressed={isPinpointMode}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-caption-12-medium transition-colors",
                  isPinpointMode
                    ? "border-border-focus bg-brand-subtle text-text-link"
                    : "border-border-soft bg-card text-text-secondary hover:bg-surface-subtle",
                )}
              >
                핀포인트 {isPinpointMode ? "ON" : "OFF"}
              </button>
            </div>
          </CardContent>
        </Card>

        {!selectedPage ? (
          <EmptyState
            title="히트맵 데이터가 없습니다"
            description="선택한 페이지에 연결된 히트맵 데이터가 아직 없습니다."
          />
        ) : (
          <>
            <HeatmapCanvas
              key={`${selectedPage.pageId}:${selectedPage.screenshotUrl ?? ""}`}
              page={selectedPage}
              isPinpointMode={isPinpointMode}
              selectedMarkerId={isPinpointMode ? selectedPoint?.markerId ?? null : null}
              onSelectPoint={setSelectedMarkerId}
              hoveredMarkerId={isPinpointMode ? hoveredMarkerId : null}
              onHoverPoint={setHoveredMarkerId}
            />

            <Card
              className={cn(
                "rounded-2xl border border-border-strong bg-card shadow-none",
                motion.card,
              )}
              style={{ display: "none" }}
            >
              <CardContent className="grid gap-4 px-6 py-5">
                <div className="flex items-center gap-2">
                  <Info className="size-4 text-text-muted" />
                  <p className="text-body-14-medium text-text-body">오류 포인트 목록</p>
                </div>

                {selectedPage.points.length > 0 ? (
                  <div className="grid gap-3">
                    {selectedPage.points.map((point, index) => {
                      const uniqueKey = `${selectedPage.pageUrl}-${point.issueId}-${index}`

                      return (
                        <button
                          key={uniqueKey}
                          type="button"
                          onClick={() => setSelectedMarkerId(point.markerId)}
                          className={cn(
                            "rounded-2xl border px-4 py-3 text-left transition-colors",
                            selectedPoint?.markerId === point.markerId
                              ? "border-border-focus bg-card"
                              : "border-border-soft bg-surface-subtle hover:bg-card",
                          )}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <IssueBadge variant={getPointBadgeVariant(point)} size="sm">
                                {point.errorType}
                              </IssueBadge>
                              <p className="text-body-14-medium text-text-body">
                                {point.issueId}
                              </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-1 text-caption-12-medium text-text-secondary">
                              <span>
                                연령대 {point.ageBand === "all" ? "전체" : point.ageBand}
                              </span>
                              <span>쨌</span>
                              <span>영향 {point.affectedUsersCount}명</span>
                              <span>쨌</span>
                              <span>차단율 {formatPercent(point.blockRate)}</span>
                            </div>
                          </div>
                          <p className="mt-2 text-caption-12-regular text-text-muted">
                            {point.description}
                          </p>
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <EmptyState
                    title="표시할 오류 포인트가 없습니다"
                    description="현재 필터 조건에 맞는 히트맵 포인트가 없습니다."
                  />
                )}

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    className="rounded-xl border border-border-soft bg-card px-3 py-2 text-caption-12-medium text-text-secondary disabled:opacity-50"
                    onClick={() => {
                      setCurrentPageIndex((prev) => Math.max(0, prev - 1))
                      setSelectedMarkerId(null)
                      setHoveredMarkerId(null)
                    }}
                    disabled={currentPageIndex <= 0}
                  >
                    이전 페이지
                  </button>
                  <div className="rounded-xl bg-surface-subtle px-3 py-2 text-caption-12-medium text-text-secondary">
                    페이지 {selectedPage.pagination.currentPage + 1}
                  </div>
                  <button
                    type="button"
                    className="rounded-xl border border-border-soft bg-card px-3 py-2 text-caption-12-medium text-text-secondary disabled:opacity-50"
                    onClick={() => {
                      setCurrentPageIndex((prev) => prev + 1)
                      setSelectedMarkerId(null)
                      setHoveredMarkerId(null)
                    }}
                    disabled={!selectedPage.pagination.hasMore}
                  >
                    다음 페이지
                  </button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}

export default ResultHeatmapPage
