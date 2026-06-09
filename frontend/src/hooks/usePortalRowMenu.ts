"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";

export type PortalMenuPlacement = "below" | "above";

export type PortalMenuPos = {
  top: number;
  left: number;
  placement: PortalMenuPlacement;
};

export function portalMenuStyle(pos: PortalMenuPos | null): CSSProperties | undefined {
  if (!pos) return undefined;
  return {
    top: pos.top,
    left: pos.left,
    transform: pos.placement === "above" ? "translateY(-100%)" : undefined,
  };
}

export function usePortalRowMenu(menuWidth = 208, estimatedHeight = 200) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<PortalMenuPos | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const updateMenuPosition = useCallback(() => {
    const trigger = ref.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const margin = 6;
    const menuHeight = menuRef.current?.offsetHeight ?? estimatedHeight;
    const spaceBelow = window.innerHeight - rect.bottom - margin;
    const spaceAbove = rect.top - margin;

    const placement: PortalMenuPlacement =
      spaceBelow >= menuHeight || spaceBelow >= spaceAbove ? "below" : "above";

    const top = placement === "below" ? rect.bottom + margin : rect.top - margin;

    let left = rect.right - menuWidth;
    left = Math.max(margin, Math.min(left, window.innerWidth - menuWidth - margin));

    setMenuPos({ top, left, placement });
  }, [menuWidth, estimatedHeight]);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    setMenuPos(null);
  }, []);

  const openMenu = useCallback(() => {
    setMenuOpen(true);
  }, []);

  const toggleMenu = useCallback(() => {
    if (menuOpen) closeMenu();
    else openMenu();
  }, [menuOpen, closeMenu, openMenu]);

  useLayoutEffect(() => {
    if (!menuOpen) return;
    updateMenuPosition();
  }, [menuOpen, updateMenuPosition]);

  useEffect(() => {
    if (!menuOpen) return;
    const onReposition = () => updateMenuPosition();
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);
    return () => {
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [menuOpen, updateMenuPosition]);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (ref.current?.contains(target) || menuRef.current?.contains(target)) return;
      closeMenu();
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen, closeMenu]);

  return {
    ref,
    menuRef,
    menuOpen,
    menuPos,
    openMenu,
    closeMenu,
    toggleMenu,
  };
}
