import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Hides the mouse cursor after a period of inactivity and brings it back on interaction.
 * @param timeoutMs - Milliseconds of inactivity before cursor is hidden (default: 5000)
 * @param isDialogOpen - When true, cursor is always shown regardless of inactivity (default: false)
 */
export const useCursorVisibility = (timeoutMs = 5000, isDialogOpen = false) => {
  const [isCursorVisible, setIsCursorVisible] = useState(true);
  const cursorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const hideCursor = useCallback(() => {
    if (typeof document === 'undefined') return;
    setIsCursorVisible(false);
    document.body.style.cursor = 'none';
  }, []);

  const showCursor = useCallback(() => {
    if (typeof document === 'undefined') return;
    setIsCursorVisible(true);
    document.body.style.cursor = 'default';
  }, []);

  const resetCursorTimer = useCallback(() => {
    if (cursorTimeoutRef.current) {
      clearTimeout(cursorTimeoutRef.current);
    }
    showCursor();
    // ダイアログ表示中は非表示タイマーを開始しない
    if (!isDialogOpen) {
      cursorTimeoutRef.current = setTimeout(hideCursor, timeoutMs);
    }
  }, [hideCursor, showCursor, timeoutMs, isDialogOpen]);

  // ダイアログ開閉に合わせてカーソル状態を制御
  useEffect(() => {
    if (isDialogOpen) {
      // ダイアログが開いたら非表示タイマーをキャンセルしてカーソルを常時表示
      if (cursorTimeoutRef.current) {
        clearTimeout(cursorTimeoutRef.current);
        cursorTimeoutRef.current = null;
      }
      showCursor();
    } else {
      // ダイアログが閉じたらタイマーを再開
      cursorTimeoutRef.current = setTimeout(hideCursor, timeoutMs);
    }
  }, [isDialogOpen, hideCursor, showCursor, timeoutMs]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.addEventListener('mousemove', resetCursorTimer);
    window.addEventListener('mousedown', resetCursorTimer);

    return () => {
      window.removeEventListener('mousemove', resetCursorTimer);
      window.removeEventListener('mousedown', resetCursorTimer);
      if (cursorTimeoutRef.current) {
        clearTimeout(cursorTimeoutRef.current);
      }
      showCursor();
    };
  }, [resetCursorTimer, showCursor]);

  return { isCursorVisible };
};
