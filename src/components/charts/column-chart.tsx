"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { CHART_GRID, CHART_SERIES } from "./palette";

export type ColumnDatum = { label: string; value: number; tooltipLabel?: string };

type ColumnChartProps = {
  data: ColumnDatum[];
  /** Name of the measure, used in tooltips and the accessible table. */
  measure: string;
  color?: string;
  height?: number;
  className?: string;
};

const MAX_COLUMN_WIDTH = 24;

function niceMax(value: number): number {
  if (value <= 4) return 4;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 2.5, 5, 10].map((factor) => factor * magnitude).find((candidate) => candidate * 4 >= value) ?? value;
  return step * 4;
}

/**
 * Single-series column chart: thin columns with rounded data-ends, hairline grid,
 * the latest value labelled directly and a hover tooltip for every column.
 */
export function ColumnChart({ data, measure, color = CHART_SERIES[0], height = 168, className }: ColumnChartProps) {
  const [active, setActive] = useState<number | null>(null);
  const max = niceMax(Math.max(0, ...data.map((datum) => datum.value)));
  const ticks = [0, max / 2, max];
  const lastIndex = data.length - 1;

  return (
    <figure className={cn("relative", className)}>
      <div className="flex gap-3">
        <div className="relative w-6 shrink-0 text-right text-[11px] text-muted" style={{ height }} aria-hidden>
          {ticks.map((tick) => (
            <span key={tick} className="absolute right-0 -translate-y-1/2" style={{ top: `${100 - (tick / max) * 100}%` }}>
              {tick}
            </span>
          ))}
        </div>
        <div className="relative flex-1" style={{ height }}>
          {ticks.map((tick) => (
            <div
              key={tick}
              className="absolute inset-x-0 h-px"
              style={{ top: `${100 - (tick / max) * 100}%`, backgroundColor: CHART_GRID }}
              aria-hidden
            />
          ))}
          <div className="absolute inset-0 flex items-end justify-around" onMouseLeave={() => setActive(null)}>
            {data.map((datum, index) => {
              const barHeight = max > 0 ? (datum.value / max) * height : 0;
              const showLabel = index === lastIndex || active === index;
              return (
                <div
                  key={datum.label}
                  className="relative flex h-full flex-1 cursor-default items-end justify-center"
                  onMouseEnter={() => setActive(index)}
                  onFocus={() => setActive(index)}
                  tabIndex={0}
                  aria-label={`${datum.tooltipLabel ?? datum.label}: ${datum.value} ${measure}`}
                >
                  {showLabel && (
                    <span
                      className={cn(
                        "absolute text-xs font-bold text-ink transition-opacity",
                        active === index && index !== lastIndex && "rounded-md bg-ink px-2 py-1 text-white shadow-popover",
                      )}
                      style={{ bottom: barHeight + 6 }}
                    >
                      {active === index && index !== lastIndex ? `${datum.value} ${measure}` : datum.value}
                    </span>
                  )}
                  <div
                    className="w-full rounded-t-[4px] transition-[height,opacity] duration-500 ease-out"
                    style={{
                      maxWidth: MAX_COLUMN_WIDTH,
                      height: Math.max(datum.value > 0 ? 2 : 0, barHeight),
                      backgroundColor: color,
                      opacity: active === null || active === index ? 1 : 0.45,
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="mt-2 flex gap-3 pl-9" aria-hidden>
        {data.map((datum) => (
          <span key={datum.label} className="flex-1 text-center text-[11px] text-muted">
            {datum.label}
          </span>
        ))}
      </div>
      <table className="sr-only">
        <caption>{measure}</caption>
        <tbody>
          {data.map((datum) => (
            <tr key={datum.label}>
              <th scope="row">{datum.tooltipLabel ?? datum.label}</th>
              <td>{datum.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
