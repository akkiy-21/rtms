import { useCallback, useEffect, useRef, useState } from 'react';

const CURSOR_HIDDEN_CLASS = 'app-cursor-hidden';
const INTERACTION_EVENTS: Array<keyof WindowEventMap> = [
  'pointermove',
  'pointerdown',
  'touchstart',
  'mousemove',
  'mousedown',
  'wheel',
  'keydown'
];

/**
 * Hides the mouse cursor after a period of inactivity and brings it back on interaction.
 * @param timeoutMs - Milliseconds of inactivity before cursor is hidden (default: 5000)
 * @param isDialogOpen - When true, cursor is always shown regardless of inactivity (default: false)
 */
export const useCursorVisibility = (timeoutMs = 5000, isDialogOpen = false) => {
  const [isCursorVisible, setIsCursorVisible] = useState(true);
  const cursorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const applyCursorClass = useCallback((hidden: boolean) => {
    if (typeof document === 'undefined') return;

    document.documentElement.classList.toggle(CURSOR_HIDDEN_CLASS, hidden);
    document.body.classList.toggle(CURSOR_HIDDEN_CLASS, hidden);
    document.body.style.cursor = hidden ? 'none' : '';
  }, []);

  const hideCursor = useCallback(() => {
    if (typeof document === 'undefined') return;
    setIsCursorVisible(false);
    applyCursorClass(true);
  }, [applyCursorClass]);

  const showCursor = useCallback(() => {
    if (typeof document === 'undefined') return;
    setIsCursorVisible(true);
    applyCursorClass(false);
  }, [applyCursorClass]);

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
      resetCursorTimer();
    }
  }, [isDialogOpen, hideCursor, resetCursorTimer, showCursor, timeoutMs]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    resetCursorTimer();

    for (const eventName of INTERACTION_EVENTS) {
      window.addEventListener(eventName, resetCursorTimer, { passive: true });
    }

    return () => {
      for (const eventName of INTERACTION_EVENTS) {
        window.removeEventListener(eventName, resetCursorTimer);
      }

      if (cursorTimeoutRef.current) {
        clearTimeout(cursorTimeoutRef.current);
      }

      showCursor();
    };
  }, [resetCursorTimer, showCursor]);

  return { isCursorVisible };
};
