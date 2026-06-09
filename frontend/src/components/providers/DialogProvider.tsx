"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import PromptDialog from "@/components/ui/PromptDialog";

export type ConfirmOptions = {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "danger";
};

export type PromptOptions = {
  title?: string;
  message?: string;
  label?: string;
  defaultValue?: string;
  placeholder?: string;
  confirmLabel?: string;
  cancelLabel?: string;
};

type DialogContextValue = {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  prompt: (options: PromptOptions) => Promise<string | null>;
};

const DialogContext = createContext<DialogContextValue | null>(null);

export function useDialog(): DialogContextValue {
  const ctx = useContext(DialogContext);
  if (!ctx) {
    throw new Error("useDialog must be used within DialogProvider");
  }
  return ctx;
}

export default function DialogProvider({ children }: { children: ReactNode }) {
  const [confirmState, setConfirmState] = useState<{
    options: ConfirmOptions;
    resolve: (value: boolean) => void;
  } | null>(null);

  const [promptState, setPromptState] = useState<{
    options: PromptOptions;
    resolve: (value: string | null) => void;
  } | null>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setConfirmState({ options, resolve });
    });
  }, []);

  const prompt = useCallback((options: PromptOptions) => {
    return new Promise<string | null>((resolve) => {
      setPromptState({ options, resolve });
    });
  }, []);

  const closeConfirm = useCallback((value: boolean) => {
    setConfirmState((current) => {
      current?.resolve(value);
      return null;
    });
  }, []);

  const closePrompt = useCallback((value: string | null) => {
    setPromptState((current) => {
      current?.resolve(value);
      return null;
    });
  }, []);

  const value = useMemo(() => ({ confirm, prompt }), [confirm, prompt]);

  return (
    <DialogContext.Provider value={value}>
      {children}
      <ConfirmDialog
        open={!!confirmState}
        title={confirmState?.options.title}
        message={confirmState?.options.message ?? ""}
        confirmLabel={confirmState?.options.confirmLabel}
        cancelLabel={confirmState?.options.cancelLabel}
        variant={confirmState?.options.variant}
        onConfirm={() => closeConfirm(true)}
        onCancel={() => closeConfirm(false)}
      />
      <PromptDialog
        open={!!promptState}
        title={promptState?.options.title}
        message={promptState?.options.message}
        label={promptState?.options.label}
        defaultValue={promptState?.options.defaultValue}
        placeholder={promptState?.options.placeholder}
        confirmLabel={promptState?.options.confirmLabel}
        cancelLabel={promptState?.options.cancelLabel}
        onConfirm={(val) => closePrompt(val)}
        onCancel={() => closePrompt(null)}
      />
    </DialogContext.Provider>
  );
}
