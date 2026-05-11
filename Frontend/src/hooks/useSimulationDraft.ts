import { useShallow } from "zustand/react/shallow"
import { useSimulationDraftStore } from "@/store/simulation-draft.store"

/**
 * 시뮬레이션 초안 상태 관리 Hook
 *
 * Zustand store의 10개 필드를 통합하여
 * 컴포넌트에서 간편하게 접근할 수 있도록 함
 *
 * @returns 시뮬레이션 초안 상태 및 업데이터 함수
 */
export function useSimulationDraft() {
  return useSimulationDraftStore(
    useShallow((state: ReturnType<typeof useSimulationDraftStore.getState>) => ({
      targetUrl: state.targetUrl,
      setTargetUrl: state.setTargetUrl,
      endUrl: state.endUrl,
      setEndUrl: state.setEndUrl,
      projectTitle: state.projectTitle,
      setProjectTitle: state.setProjectTitle,
      startedAt: state.startedAt,
      setStartedAt: state.setStartedAt,
      personaDevice: state.personaDevice,
      setPersonaDevice: state.setPersonaDevice,
    }))
  )
}
