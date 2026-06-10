"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckSquare,
  FileText,
  FolderKanban,
  ReceiptText,
  Search,
  Users,
  X,
} from "lucide-react";
import { useGlobalSearch } from "@/hooks/useSearch";
import { cn } from "@/lib/utils";
import {
  dropdownItem,
  dropdownItemInactive,
  dropdownSectionLabel,
  glassDropdownPlain,
} from "@/lib/glass-styles";
import {
  headerSearchInput,
  headerSearchInputMobile,
  headerSearchKbd,
  headerSearchWrap,
} from "./header-ui";

function SearchGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="py-1">
      <p className={dropdownSectionLabel}>{title}</p>
      {children}
    </div>
  );
}

export default function GlobalSearch({
  onMobileExpandChange,
}: {
  onMobileExpandChange?: (expanded: boolean) => void;
}) {
  const [query, setQuery] = useState("");
  const [panelOpen, setPanelOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { data, isFetching } = useGlobalSearch(query);

  const trimmed = query.trim();
  const showPanel = panelOpen && trimmed.length >= 2;

  const setExpanded = (expanded: boolean) => {
    setMobileExpanded(expanded);
    onMobileExpandChange?.(expanded);
  };

  useEffect(() => {
    return () => onMobileExpandChange?.(false);
  }, [onMobileExpandChange]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setPanelOpen(false);
        setExpanded(false);
      }
    };
    const onKeydown = (e: KeyboardEvent) => {
      const key = e.key?.toLowerCase();
      const isK = key === "k";
      const meta = e.metaKey || e.ctrlKey;
      if (meta && isK) {
        e.preventDefault();
        setExpanded(true);
        setPanelOpen(trimmed.length >= 2);
        requestAnimationFrame(() => {
          inputRef.current?.focus();
          inputRef.current?.select();
        });
      }
      if (key === "escape") {
        setPanelOpen(false);
        setExpanded(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKeydown);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKeydown);
    };
  }, [trimmed.length]);

  const go = (href: string) => {
    setPanelOpen(false);
    setExpanded(false);
    setQuery("");
    router.push(href);
  };

  const hasResults =
    (data?.projects?.length ?? 0) +
      (data?.clients?.length ?? 0) +
      (data?.documents?.length ?? 0) +
      (data?.tasks?.length ?? 0) +
      (data?.finances?.length ?? 0) >
    0;

  const resultBtn = cn(
    dropdownItem,
    dropdownItemInactive,
    "flex items-center gap-2.5 py-2 pr-3 hover:bg-[color:var(--glass-bg-hover)]"
  );

  const resultsPanel = showPanel && (
    <div
      className={cn(
        glassDropdownPlain,
        "absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-y-auto py-2"
      )}
    >
      {isFetching && (
        <p className="px-4 py-3 text-[13px] text-glass-muted">Recherche…</p>
      )}
      {!isFetching && !hasResults && (
        <p className="px-4 py-3 text-[13px] text-glass-muted">Aucun résultat</p>
      )}

      {(data?.projects?.length ?? 0) > 0 && (
        <SearchGroup title="Projets">
          {data?.projects?.slice(0, 3).map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => go(`/projects/${p.id}`)}
              className={resultBtn}
            >
              <FolderKanban className="h-3.5 w-3.5 shrink-0 text-studio-light/50" />
              <span className="truncate">{p.name}</span>
            </button>
          ))}
        </SearchGroup>
      )}

      {(data?.clients?.length ?? 0) > 0 && (
        <SearchGroup title="Clients">
          {data?.clients?.slice(0, 3).map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => go("/clients")}
              className={resultBtn}
            >
              <Users className="h-3.5 w-3.5 shrink-0 text-studio-light/50" />
              <span className="truncate">{c.name}</span>
            </button>
          ))}
        </SearchGroup>
      )}

      {(data?.documents?.length ?? 0) > 0 && (
        <SearchGroup title="Documents">
          {data?.documents?.slice(0, 3).map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => go(`/projects/${d.projectId}?tab=documents`)}
              className={resultBtn}
            >
              <FileText className="h-3.5 w-3.5 shrink-0 text-studio-light/50" />
              <span className="truncate">
                {d.name}
                {d.project?.name && (
                  <span className="text-glass-muted"> · {d.project.name}</span>
                )}
              </span>
            </button>
          ))}
        </SearchGroup>
      )}

      {(data?.tasks?.length ?? 0) > 0 && (
        <SearchGroup title="Tâches">
          {data?.tasks?.slice(0, 3).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() =>
                go(t.projectId ? `/projects/${t.projectId}?tab=tasks` : "/tasks")
              }
              className={resultBtn}
            >
              <CheckSquare className="h-3.5 w-3.5 shrink-0 text-studio-light/50" />
              <span className="truncate">{t.title}</span>
            </button>
          ))}
        </SearchGroup>
      )}

      {(data?.finances?.length ?? 0) > 0 && (
        <SearchGroup title="Finance">
          {data?.finances?.slice(0, 3).map((f) => (
            <button
              key={`${f.kind}-${f.id}`}
              type="button"
              onClick={() => go(f.href)}
              className={resultBtn}
            >
              <ReceiptText className="h-3.5 w-3.5 shrink-0 text-studio-light/50" />
              <span className="truncate">{f.label}</span>
            </button>
          ))}
        </SearchGroup>
      )}
    </div>
  );

  const searchInput = (
    <>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-studio-light/55"
        strokeWidth={1.75}
      />
      <input
        ref={inputRef}
        type="search"
        placeholder={mobileExpanded ? "Rechercher…" : "Rechercher projets, clients, tâches…"}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setPanelOpen(e.target.value.trim().length >= 2);
        }}
        onFocus={() => trimmed.length >= 2 && setPanelOpen(true)}
        className={cn(
          headerSearchInput,
          mobileExpanded && headerSearchInputMobile
        )}
        aria-label="Recherche globale"
      />
      <kbd className={headerSearchKbd} aria-hidden>
        ⌘K
      </kbd>
      {resultsPanel}
    </>
  );

  return (
    <div
      ref={ref}
      className={cn(
        headerSearchWrap,
        mobileExpanded &&
          "absolute inset-y-0 left-11 right-0 z-20 flex min-w-0 flex-1 items-center md:relative md:inset-auto md:left-auto md:right-auto md:z-auto"
      )}
    >
      {!mobileExpanded && (
        <button
          type="button"
          onClick={() => {
            setExpanded(true);
            requestAnimationFrame(() => inputRef.current?.focus());
          }}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[color:var(--glass-input-border)] bg-[color:var(--glass-input-bg)] text-glass-secondary shadow-[var(--glass-input-shadow)] transition hover:bg-[color:var(--glass-bg-hover)] hover:text-studio-light md:hidden"
          aria-label="Rechercher"
        >
          <Search className="h-4 w-4" strokeWidth={1.75} />
        </button>
      )}

      <div
        className={cn(
          "relative w-full min-w-0",
          mobileExpanded
            ? "flex min-w-0 flex-1 items-center gap-1"
            : "hidden md:block"
        )}
      >
        {mobileExpanded ? (
          <div className="relative min-w-0 flex-1">{searchInput}</div>
        ) : (
          searchInput
        )}
        {mobileExpanded && (
          <button
            type="button"
            onClick={() => {
              setExpanded(false);
              setPanelOpen(false);
              setQuery("");
            }}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-glass-muted hover:bg-[color:var(--glass-bg-hover)] hover:text-studio-light md:hidden"
            aria-label="Fermer la recherche"
          >
            <X className="h-4 w-4" strokeWidth={1.75} />
          </button>
        )}
      </div>
    </div>
  );
}
