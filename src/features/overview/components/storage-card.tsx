import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { StackedBar } from "@/components/charts/stacked-bar";
import { formatBytes } from "@/lib/utils/format";
import type { StorageUsage } from "@/features/media/queries";

const KINDS = [
  { kind: "image", label: "Images" },
  { kind: "video", label: "Videos" },
  { kind: "document", label: "Documents" },
] as const;

export function StorageCard({ storage }: { storage: StorageUsage }) {
  const total = storage.reduce((sum, entry) => sum + entry.bytes, 0);
  const segments = KINDS.map(({ kind, label }) => {
    const entry = storage.find((item) => item.kind === kind);
    return {
      label,
      value: entry?.bytes ?? 0,
      valueLabel: formatBytes(entry?.bytes ?? 0),
      detail: `${entry?.files ?? 0} files`,
    };
  });

  return (
    <Card>
      <CardHeader title="Storage" description="Space used by your media library" />
      <CardBody>
        <p className="mb-5 text-[28px] leading-none font-extrabold tracking-tight text-ink tabular-nums">{formatBytes(total)}</p>
        <StackedBar segments={segments} emptyLabel="Upload files to see your storage breakdown." />
      </CardBody>
    </Card>
  );
}
