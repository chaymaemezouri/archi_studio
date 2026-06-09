import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
}

export default function Card({ children, className, padding = true }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-card border border-dark-border bg-dark-surface",
        padding && "p-6",
        className
      )}
    >
      {children}
    </div>
  );
}
