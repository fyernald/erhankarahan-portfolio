export type Paginated<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  pageCount: number;
};

export function toPage(value: unknown, fallback = 1): number {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 && page < 10_000 ? page : fallback;
}

export function paginate<T>(items: T[], total: number, page: number, pageSize: number): Paginated<T> {
  return { items, page, pageSize, total, pageCount: Math.max(1, Math.ceil(total / pageSize)) };
}
