"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getInitialCalendarShowDone,
  getInitialCalendarView,
  getInitialProjectsView,
  getInitialTasksShowDone,
  getInitialTasksView,
  loadUserPreferences,
  persistCalendarShowDone,
  persistCalendarView,
  persistProjectsView,
  persistTasksShowDone,
  persistTasksView,
  subscribeUserPreferences,
  type UserAppPreferences,
} from "@/lib/settings-user-prefs";

export function useProjectsViewPreference() {
  const [view, setViewState] = useState<"grid" | "list">(() =>
    typeof window !== "undefined" ? getInitialProjectsView() : "grid"
  );

  useEffect(
    () =>
      subscribeUserPreferences((prefs) => {
        setViewState(prefs.defaultProjectsView);
      }),
    []
  );

  const setView = useCallback((next: "grid" | "list") => {
    setViewState(next);
    persistProjectsView(next);
  }, []);

  return [view, setView] as const;
}

export function useTasksViewPreference() {
  const [view, setViewState] = useState<"list" | "board">(() =>
    typeof window !== "undefined" ? getInitialTasksView() : "list"
  );

  useEffect(
    () =>
      subscribeUserPreferences((prefs) => {
        setViewState(prefs.defaultTasksView);
      }),
    []
  );

  const setView = useCallback((next: "list" | "board") => {
    setViewState(next);
    persistTasksView(next);
  }, []);

  return [view, setView] as const;
}

export function useTasksShowDonePreference() {
  const [showDone, setShowDoneState] = useState(() =>
    typeof window !== "undefined" ? getInitialTasksShowDone() : false
  );

  useEffect(
    () =>
      subscribeUserPreferences((prefs) => {
        setShowDoneState(prefs.showDoneTasksByDefault);
      }),
    []
  );

  const setShowDone = useCallback((next: boolean) => {
    setShowDoneState(next);
    persistTasksShowDone(next);
  }, []);

  return [showDone, setShowDone] as const;
}

export function useCalendarViewPreference() {
  const [view, setViewState] = useState<UserAppPreferences["defaultCalendarView"]>(
    () => (typeof window !== "undefined" ? getInitialCalendarView() : "month")
  );

  useEffect(
    () =>
      subscribeUserPreferences((prefs) => {
        setViewState(prefs.defaultCalendarView);
      }),
    []
  );

  const setView = useCallback(
    (next: UserAppPreferences["defaultCalendarView"]) => {
      setViewState(next);
      persistCalendarView(next);
    },
    []
  );

  return [view, setView] as const;
}

export function useCalendarShowDonePreference() {
  const [showDone, setShowDoneState] = useState(() =>
    typeof window !== "undefined" ? getInitialCalendarShowDone() : false
  );

  useEffect(
    () =>
      subscribeUserPreferences((prefs) => {
        setShowDoneState(prefs.showDoneCalendarByDefault);
      }),
    []
  );

  const setShowDone = useCallback((next: boolean) => {
    setShowDoneState(next);
    persistCalendarShowDone(next);
  }, []);

  return [showDone, setShowDone] as const;
}

export function useSyncedUserPreferences() {
  const [prefs, setPrefs] = useState<UserAppPreferences>(() =>
    typeof window !== "undefined" ? loadUserPreferences() : loadUserPreferences()
  );

  useEffect(
    () =>
      subscribeUserPreferences((next) => {
        setPrefs(next);
      }),
    []
  );

  return prefs;
}
