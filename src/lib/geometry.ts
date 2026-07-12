import type { Room } from "../types";

export const CELL = 56; // px per grid unit
export const MIN_ROOM = 1.5;

export function roomBounds(rooms: Room[]) {
  if (rooms.length === 0) {
    return { minX: 0, minY: 0, maxX: 12, maxY: 10, width: 12, height: 10 };
  }
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const r of rooms) {
    minX = Math.min(minX, r.x);
    minY = Math.min(minY, r.y);
    maxX = Math.max(maxX, r.x + r.w);
    maxY = Math.max(maxY, r.y + r.h);
  }
  const pad = 0.75;
  return {
    minX: minX - pad,
    minY: minY - pad,
    maxX: maxX + pad,
    maxY: maxY + pad,
    width: maxX - minX + pad * 2,
    height: maxY - minY + pad * 2,
  };
}

export function snap(value: number, step = 0.25): number {
  return Math.round(value / step) * step;
}
