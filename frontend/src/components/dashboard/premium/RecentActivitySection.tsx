"use client";

import DashboardActivity from "../DashboardActivity";

export default function RecentActivitySection(
  props: React.ComponentProps<typeof DashboardActivity>
) {
  return (
    <div className="opacity-95">
      <DashboardActivity {...props} />
    </div>
  );
}
