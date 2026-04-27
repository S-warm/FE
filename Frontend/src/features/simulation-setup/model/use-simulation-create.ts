import { useEffect, useRef, useState } from "react"

import type { PersonaDevice } from "@/constants/persona-device"
import { HttpError } from "@/shared/api/http-client"
import type { ApiErrorResponse } from "@/shared/api/error-response"
import { getApiUserId, setApiUserId } from "@/shared/config/session"
import type { BackendSimulationCreateResponse } from "@/shared/types/backend-api"

import { buildSimulationCreateRequest, validateSimulationCreateRequest } from "./backend-contract"
import { createSimulation } from "./simulation-api"
import type { AgeRatios, DigitalLiteracyLevel } from "./types"

interface UseSimulationCreateOptions {
  onSuccess: (simulation: BackendSimulationCreateResponse) => void
}

interface SimulationCreateInput {
  projectTitle: string
  targetUrl: string
  personaCount: number
  digitalLiteracy: DigitalLiteracyLevel
  successCondition: string
  personaDevice: PersonaDevice
  ageRatios: AgeRatios
  visionImpairment: number | null
  attentionLevel: number | null
}

export function useSimulationCreate({ onSuccess }: UseSimulationCreateOptions) {
  const [submitError, setSubmitError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort()
      abortControllerRef.current = null
    }
  }, [])

  const submitSimulation = async (input: SimulationCreateInput) => {
    if (isSubmitting) return

    const userId = getApiUserId()
    setApiUserId(userId)

    const request = buildSimulationCreateRequest(input)
    const validationError = validateSimulationCreateRequest(request)

    if (validationError) {
      setSubmitError(validationError)
      return
    }

    abortControllerRef.current?.abort()
    const abortController = new AbortController()
    abortControllerRef.current = abortController

    setSubmitError("")
    setIsSubmitting(true)

    try {
      const createdSimulation = await createSimulation(userId, request, abortController.signal)
      onSuccess(createdSimulation)
    } catch (error) {
      if (abortController.signal.aborted) {
        return
      }

      if (error instanceof HttpError) {
        const apiError = error.body as ApiErrorResponse | undefined
        setSubmitError(apiError?.message || "시뮬레이션 생성에 실패했습니다.")
        return
      }

      setSubmitError("시뮬레이션 생성 중 오류가 발생했습니다.")
    } finally {
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null
      }
      setIsSubmitting(false)
    }
  }

  return {
    isSubmitting,
    submitError,
    submitSimulation,
  }
}
