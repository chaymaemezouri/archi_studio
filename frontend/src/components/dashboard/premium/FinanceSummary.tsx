"use client";

import RecentPaymentsWidget from "../RecentPaymentsWidget";

export default function FinanceSummary(
  props: React.ComponentProps<typeof RecentPaymentsWidget>
) {
  return (
    <div className="opacity-95">
      <RecentPaymentsWidget {...props} />
    </div>
  );
}
