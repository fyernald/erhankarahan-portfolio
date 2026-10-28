"use client";

import { useState } from "react";
import { CHART_SERIES } from "./palette";

export type StackedSegment = { label: string; value: number; valueLabel: string; detail?: string };

/**
 * Part-to-whole bar: segments separated by a 2px surface gap, with a legend that
 * always names each segment and carries its value (identity is never colour-only).
 */
export function StackedBar({ segments, emptyLabel = "No data yet" }: { segments: StackedSegment[]; emptyLabel?: string }) {
  const [active, setActive] = useState<number | null>(null);
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);

  return (
    <div>
      <div className="flex h-3 w-full gap-[2px] overflow-hidden rounded-full bg-canvas" role="img" aria-label={segments.map((s) => `${s.label} ${s.valueLabel}`).join(", ")}>
        {total > 0 &&
          segments
            .filter((segment) => segment.value > 0)
            .map((segment) => {
              const index = segments.indexOf(segment);
              return (
                <div
                  key={segment.label}
                  className="h-full transition-opacity first:rounded-l-full last:rounded-r-full"
                  style={{
                    width: `${Math.max(1.5, (segment.value / total) * 100)}%`,
                    backgroundColor: CHART_SERIES[index],
                    opacity: active === null || active === index ? 1 : 0.4,
                  }}
                  onMouseEnter={() => setActive(index)}
                  onMouseLeave={() => setActive(null)}
                />
              );
            })}
      </div>
      {total === 0 && <p className="mt-2 text-xs text-muted">{emptyLabel}</p>}
      <ul className="mt-5 flex flex-col gap-3">
        {segments.map((segment, index) => (
          <li
            key={segment.label}
            className="flex items-center gap-3 rounded-lg text-sm"
            onMouseEnter={() => setActive(index)}
            onMouseLeave={() => setActive(null)}
          >
            <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: CHART_SERIES[index] }} aria-hidden />
            <span className="flex-1 font-semibold text-ink">{segment.label}</span>
            {segment.detail && <span className="text-xs text-muted">{segment.detail}</span>}
            <span className="w-20 text-right font-bold text-ink tabular-nums">{segment.valueLabel}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
