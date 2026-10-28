/**
 * Chart colours, validated with the dataviz palette checker (lightness band, chroma
 * floor, CVD separation). Identity is never colour-only: every chart pairs these with
 * a legend and labels. Slot order is fixed — never cycle or repaint by rank.
 */
export const CHART_SERIES = ["#2a78d6", "#eb6834", "#1baf7a"] as const;
export const CHART_GRID = "#e3e7ea";
