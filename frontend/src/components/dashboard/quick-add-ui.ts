import { cn } from "@/lib/utils";
import { formFieldLabel, glassInput, glassSelect } from "@/lib/glass-styles";

export const quickAddFieldLabel = formFieldLabel;

export const quickAddInput = cn(glassInput, "px-3");

export const quickAddSelect = cn(glassSelect, "w-full px-3 py-2.5");

export const quickAddTextarea = cn(
  quickAddInput,
  "min-h-[72px] resize-y"
);
