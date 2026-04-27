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

      // ========== 상세 에러 분석 ==========
      console.error("❌ [Simulation Create Error]", error)

      if (error instanceof HttpError) {
        const apiError = error.body as ApiErrorResponse | undefined
        const errorMessage = apiError?.message || `HTTP ${error.status}: ${error.statusText}`

        // 에러 타입별 상세 분류
        if (error.status === 403) {
          console.error("🔒 [403 Forbidden] JWT/Auth 토큰 문제 or 권한 없음")
          setSubmitError(`[403] 권한 없음: ${apiError?.message || error.statusText}`)
        } else if (error.status === 401) {
          console.error("🔐 [401 Unauthorized] 인증 정보 누락 or 토