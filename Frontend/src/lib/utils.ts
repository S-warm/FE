import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// className 문자열을 안전하게 합치고, Tailwind 충돌 클래스를 정리합니다.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
