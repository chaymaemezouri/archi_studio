"use client";

import { useEffect, useState } from "react";

export type ProjectsBreakpoint = "mobile" | "tablet" | "desktop";

const QUERIES: Record<ProjectsBreakpoint, string> = {
  mobile: "(max-width: 767px)",
  tablet: "(min-width: 768px) and (max-width: 1023px)",
  desktop: "(min-width: 1024px)",
};

function getBreakpoint(): ProjectsBreakpoint {
  if (typeof window === "undefined") return "desktop";
  if (window.matchMedia(QUERIES.mobile).matches) return "mobile";
  if (window.matchMedia(QUERIES.tablet).matches) return "tablet";
  return "desktop";
}

export function useProjectsBreakpoint(): ProjectsBreakpoint {
  const [breakpoint, setBreakpoint] = useState<ProjectsBreakpoint>("desktop");

  useEffect(() => {
    const update = () => setBreakpoint(getBreakpoint());
    update();

    const mqs = Object.values(QUERIES).map((q) => window.matchMedia(q));
    mqs.forEach((mq) => mq.addEventListener("change", update));
    return () => mqs.forEach((mq) => mq.removeEventListener("change", update));
  }, []);

  return breakpoint;
}

export function getProjectsPageSize(
  view: "grid" | "list",
  breakpoint: ProjectsBreakpoint
): number {
  if (view === "grid") {
    if (breakpoint === "mobile") return 4;
    if (breakpoint === "tablet") return 6;
    return 8;
  }

  if (breakpoint === "mobile") return 4;
  if (breakpoint === "tablet") return 6;
  return 10;
}
