'use client';
import { useCallback, useEffect, useState } from 'react';

// Wraps the Fullscreen API with the webkit-prefixed fallback Safari/iOS still
// needs. Safari on iPhone only supports element fullscreen from iOS 16.4+;
// on older versions requestFullscreen() silently rejects, so callers should
// treat the toggle as best-effort, not guaranteed.
export function useFullscreen(targetRef: React.RefObject<HTMLElement | null>) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onChange = () => {
      const fsEl = document.fullscreenElement || (document as any).webkitFullscreenElement;
      setIsFullscreen(!!fsEl);
    };
    document.addEventListener('fullscreenchange', onChange);
    document.addEventListener('webkitfullscreenchange', onChange);
    return () => {
      document.removeEventListener('fullscreenchange', onChange);
      document.removeEventListener('webkitfullscreenchange', onChange);
    };
  }, []);

  const toggle = useCallback(() => {
    const el = targetRef.current || document.documentElement;
    const fsEl = document.fullscreenElement || (document as any).webkitFullscreenElement;
    if (fsEl) {
      if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
      else if ((document as any).webkitExitFullscreen) (document as any).webkitExitFullscreen();
    } else {
      if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
      else if ((el as any).webkitRequestFullscreen) (el as any).webkitRequestFullscreen();
    }
  }, [targetRef]);

  return { isFullscreen, toggle };
}
