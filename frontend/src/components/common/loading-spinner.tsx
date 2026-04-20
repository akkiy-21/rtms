import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { MESSAGE_FORMATTER } from "@/localization/utils/message-formatter";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
}

/**
 * LoadingSpinner コンポーネント
 * 
 * ローディング表示を提供します。
 * textプロパティが指定されない場合は、デフォルトの日本語ローディングメッセージを表示します。
 * 
 * @param size - スピナーのサイズ（デフォルト: "md"）
 * @param className - 追加のCSSクラス
 * @param text - ローディングテキスト（オプション、未指定時はデフォルトの日本語メッセージを使用）
 * 
 * @example
 * ```tsx
 * // デフォルトの日本語メッセージを使用
 * <LoadingSpinner size="lg" />
 * 
 * // カスタムメッセージを使用
 * <LoadingSpinner size="lg" text={MESSAGE_FORMATTER.SAVING()} />
 * ```
 */
export function LoadingSpinner({
  size = "md",
  className,
  text,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  // textが指定されていない場合はデフォルトの日本語ローディングメッセージを使用
  const displayText = text || MESSAGE_FORMATTER.LOADING();

  return (
    <div className={cn("flex flex-col items-center justify-center gap-2", className)} data-testid="loading-spinner">
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      <p className="text-sm text-muted-foreground">{displayText}</p>
    </div>
  );
}
