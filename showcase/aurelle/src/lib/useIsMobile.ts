import { useEffect, useState } from "react";

/** True below the breakpoint where pinned/scrubbed scenes get replaced with
 *  a simpler stacked composition (see ScrollScene.tsx). Re-evaluates live. */
export function useIsMobile(breakpoint = 760): boolean {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth <= breakpoint,
  );

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const onChange = () => setIsMobile(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [breakpoint]);

  return isMobile;
}
