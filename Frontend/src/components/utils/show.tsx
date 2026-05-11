import type { PropsWithChildren } from "react"

/**
 * 조건부 렌더링 헬퍼 Props
 */
export interface ShowProps extends PropsWithChildren {
  when: boolean
}

/**
 * 조건부 렌더링 헬퍼 컴포넌트
 *
 * 삼항 연산자(? :) 대신 더 선언적인 방식으로
 * 조건에 따라 자식 요소를 렌더링합니다.
 *
 * @param when - 렌더링 여부를 결정하는 boolean
 * @param children - when이 true일 때 렌더링할 요소
 * @returns when이 true면 children, 아니면 null
 *
 * @example
 * <Show when={isLoading}>
 *   <Spinner />
 * </Show>
 *
 * @example
 * <Show when={!!submitError}>
 *   <ErrorState
 *     title="오류"
 *     description={submitError}
 *   />
 * </Show>
 */
export function Show({ when, children }: ShowProps) {
  return when ? children : null
}

/**
 * Fragment 반환 버전의 조건부 렌더링 헬퍼
 *
 * Show와 동일하지만 Fragment를 반환하므로
 * 여러 요소를 감싸야 할 때 유용합니다.
 *
 * @param when - 렌더링 여부를 결정하는 boolean
 * @param children - when이 true일 때 렌더링할 요소들
 *
 * @example
 * <ShowFragment when={hasMultipleErrors}>
 *   <Error message={error1} />
 *   <Error message={error2} />
 * </ShowFragment>
 */
export function ShowFragment({ when, children }: ShowProps) {
  return when ? <>{children}</> : null
}
