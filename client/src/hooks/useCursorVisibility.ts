import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Hides the mouse cursor after a period of inactivity and brings it back on interaction.
 */
export const useCursorVisibility = (timeoutMs = 5000) => {
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
    cursorTimeoutRef.current = setTimeout(hideCursor, timeoutMs);
  }, [hideCursor, showCursor, timeoutMs]);

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
