import { format } from "date-fns";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { ColumnChart } from "@/components/charts/column-chart";
import { CHART_SERIES } from "@/components/charts/palette";
import type { MonthlyActivity } from "../queries";

function toColumns(activity: MonthlyActivity[], key: "posts" | "uploads") {
  return activity.map((entry) => {
    const date = new Date(`${entry.month}-01T00:00:00Z`);
    return { label: format(date, "MMM"), tooltipLabel: format(date, "MMMM yyyy"), value: entry[key] };
  });
}

/** Two single-series charts side by side (small multiples) instead of one dual-measure chart. */
export function ActivityCard({ activity }: { activity: MonthlyActivity[] }) {
  return (
    <Card>
      <CardHeader title="Activity" description="Last 6 months" />
      <CardBody className="grid gap-8 sm:grid-cols-2">
        <div>
          <p className="mb-4 text-[13px] font-bold text-ink">Posts written</p>
          <ColumnChart data={toColumns(activity, "posts")} measure="posts" color={CHART_SERIES[0]} />
        </div>
        <div>
          <p className="mb-4 text-[13px] font-bold text-ink">Files uploaded</p>
          <ColumnChart data={toColumns(activity, "uploads")} measure="files" color={CHART_SERIES[0]} />
        </div>
      </CardBody>
    </Card>
  );
}
