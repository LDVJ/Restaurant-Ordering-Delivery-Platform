import { useEffect, useRef } from 'react';

/**
 * usePolling Hook
 * Periodically calls an async callback without flickering UI.
 * Rules:
 * 1. Must refresh silently (no loading skeletons/spinners).
 * 2. Must not start a new request while one is still running.
 * 3. Must always call the latest version of the callback.
 * 4. Pauses automatically when tab is hidden, resumes on tab focus.
 * 5. Cleans up intervals and event listeners on unmount.
 */
export function usePolling(callback, intervalMs = 20000, enabled = true) {
  const callbackRef = useRef(callback);
  const isRunningRef = useRef(false);

  // Keep latest callback reference without restarting timers
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled || intervalMs <= 0) return;

    const executePoll = async () => {
      if (document.hidden || isRunningRef.current) return;
      try {
        isRunningRef.current = true;
        await callbackRef.current?.();
      } catch {
        // Silent error during background poll
      } finally {
        isRunningRef.current = false;
      }
    };

    const intervalId = setInterval(executePoll, intervalMs);

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Tab became visible again: run immediate silent check
        executePoll();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [intervalMs, enabled]);
}

export default usePolling;
