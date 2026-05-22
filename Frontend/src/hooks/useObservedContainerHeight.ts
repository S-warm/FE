import { useEffect, useRef, useState } from "react"

export function useObservedContainerHeight(
  minimumHeight: number,
) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(minimumHeight)

  useEffect(() => {
    const updateHeight = () => {
      const container = containerRef.current
      if (!container) return

      const nextHeight = Math.max(
        minimumHeight,
        Math.round(container.getBoundingClientRect().height),
      )
      setHeight((prev) => (prev === nextHeight ? prev : nextHeight))
    }

    updateHeight()

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateHeight)
      return () => {
        window.removeEventListener("resize", updateHeight)
      }
    }

    const resizeObserver = new ResizeObserver(updateHeight)
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }
    window.addEventListener("resize", updateHeight)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener("resize", updateHeight)
    }
  }, [minimumHeight])

  return {
    containerRef,
    height,
  }
}
