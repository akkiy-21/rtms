import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * cn関数 - Tailwind CSSのクラス名を結合してマージする
 * 
 * clsxとtailwind-mergeを組み合わせて、条件付きクラス名と
 * Tailwindクラスの競合を解決します。
 * 
 * @param inputs - クラス名の配列または条件付きクラス名
 * @returns マージされたクラス名文字列
 * 
 * @example
 * ```tsx
 * cn("px-2 py-1", condition && "bg-blue-500")
 * cn("px-2", "px-4") // "px-4" (後のクラスが優先)
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
