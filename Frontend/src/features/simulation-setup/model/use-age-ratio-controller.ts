import { useEffect, useMemo, useRef, useState } from "react"

import type { AgeRatioKey, AgeRatios } from "@/features/simulation-setup/model/types"

const DEFAULT_AGE_RATIOS: AgeRatios = {
  teen: 25,
  fifty: 25,
  eighty: 50,
}

const EQUAL_AGE_RATIOS: AgeRatios = {
  teen: 34,
  fifty: 33,
  eighty: 33,
}

function clampPercent(value: number) {
  return Math.min(100, Math.max(0, Math.round(value)))
}

export function useAgeRatioController(initialState: AgeRatios = DEFAULT_AGE_RATIOS) {
  const [ageRatios, setAgeRatios] = useState(initialState)
  const [displayAgeRatios, setDisplayAgeRatios] = useState(initialState)
  const animationFrameRef = useRef<number | null>(null)
  const displayAgeRatiosRef = useRef(displayAgeRatios)

  useEffect(() => {
    displayAgeRatiosRef.current = displayAgeRatios
  }, [displayAgeRatios])

  const redistributeAgeRatio = (changedKey: AgeRatioKey, nextValue: number) => {
    const clamped = clampPercent(nextValue)
    const otherKeys = (Object.keys(ageRatios) as AgeRatioKey[]).filter((key) => key !== changedKey)
    const remaining = 100 - clamped
    const nextState = { ...ageRatios, [changedKey]: clamped }

    if (remaining <= 0) {
      otherKeys.forEach((key) => {
        nextState[key] = 0
      })
      setAgeRatios(nextState)
      return
    }

    const weights = otherKeys.map((key) => ageRatios[key])
    const weightTotal = weights.reduce((sum, value) => sum + value, 0)

    if (weightTotal <= 0) {
      const split = Math.floor(remaining / otherKeys.length)
      const rest = remaining - split * otherKeys.length
      otherKeys.forEach((key, index) => {
        nextState[key] = split + (index < rest ? 1 : 0)
      })
      setAgeRatios(nextState)
      return
    }

    const raw = weights.map((weight) => (weight / weightTotal) * remaining)
    const floors = raw.map((value) => Math.floor(value))
    const allocated = floors.reduce((sum, value) => sum + value, 0)
    const leftover = remaining - allocated
    const order = raw
      .map((value, index) => ({ index, frac: value - floors[index] }))
      .sort((a, b) => b.frac - a.frac)

    for (let index = 0; index < leftover; index += 1) {
      const target = order[index % order.length]?.index
      if (target === undefined) break
      floors[target] += 1
    }

    otherKeys.forEach((key, index) => {
      nextState[key] = floors[index]
    })

    setAgeRatios(nextState)
  }

  useEffect(() => {
    if (animationFrameRef.current) {
      window.cancelAnimationFrame(animationFrameRef.current)
    }

    const start = performance.now()
    const from = displayAgeRatiosRef.current
    const to = ageRatios
    const duration = 300

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - (1 - progress) ** 3

      setDisplayAgeRatios({
        teen: from.teen + (to.teen - from.teen) * eased,
        fifty: from.fifty + (to.fifty - from.fifty) * eased,
        eighty: from.eighty + (to.eighty - from.eighty) * eased,
      })

      if (progress < 1) {
        animationFrameRef.current = window.requestAnimationFrame(tick)
      }
    }

    animationFrameRef.current = window.requestAnimationFrame(tick)

    return () => {
      if (animationFrameRef.current) {
        window.cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [ageRatios])

  const ageRatioTotal = useMemo(
    () => ageRatios.teen + ageRatios.fifty + ageRatios.eighty,
    [ageRatios]
  )

  return {
    ageRatios,
    displayAgeRatios,
    ageRatioTotal,
    redistributeAgeRatio,
    resetEqualDistribution: () => setAgeRatios(EQUAL_AGE_RATIOS),
  }
}
