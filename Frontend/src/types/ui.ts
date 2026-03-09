import type { VariantProps } from "class-variance-authority"

// 컴포넌트 상태를 공통으로 표현할 때 사용하는 기본 타입입니다.
export type InteractionState = "default" | "hover" | "active" | "disabled" | "error"
export type ComponentState = InteractionState | "loading"

// cva로 만든 variant 타입을 다른 파일에서 재사용하기 위한 유틸 타입입니다.
export type VariantOf<T extends (...args: any[]) => string> = VariantProps<T>
