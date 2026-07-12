import type { Door, Room } from "../types";
import { snap } from "./geometry";

export type OutsideEdge = "n" | "s" | "e" | "w";

const TOUCH = 1.25; // how close edges must be to count as shared

type Candidate = {
  orientation: "h" | "v";
  x: number;
  y: number;
  length: number;
  gap: number;
};

function overlapLen(a0: number, a1: number, b0: number, b1: number): { start: number; end: number; len: number } {
  const start = Math.max(a0, b0);
  const end = Math.min(a1, b1);
  return { start, end, len: end - start };
}

/** Place a door on an exterior wall of a room (defaults to the south / bottom edge). */
export function doorToOutside(
  room: Room,
  edge: OutsideEdge = "s",
): Pick<Door, "x" | "y" | "length" | "orientation"> {
  const length = snap(Math.min(Math.max(Math.min(room.w, room.h) * 0.35, 0.75), 1.5));
  switch (edge) {
    case "n":
      return { x: snap(room.x + room.w / 2), y: snap(room.y), length, orientation: "h" };
    case "s":
      return {
        x: snap(room.x + room.w / 2),
        y: snap(room.y + room.h),
        length,
        orientation: "h",
      };
    case "w":
      return { x: snap(room.x), y: snap(room.y + room.h / 2), length, orientation: "v" };
    case "e":
      return {
        x: snap(room.x + room.w),
        y: snap(room.y + room.h / 2),
        length,
        orientation: "v",
      };
  }
}

/** Place a door on the closest facing edges between two rooms. */
export function doorBetweenRooms(a: Room, b: Room): Pick<Door, "x" | "y" | "length" | "orientation"> {
  const candidates: Candidate[] = [];

  {
    const gap = Math.abs(b.x - (a.x + a.w));
    const ov = overlapLen(a.y, a.y + a.h, b.y, b.y + b.h);
    if (gap <= TOUCH && ov.len > 0.4) {
      candidates.push({
        orientation: "v",
        x: (a.x + a.w + b.x) / 2,
        y: (ov.start + ov.end) / 2,
        length: Math.min(Math.max(ov.len * 0.45, 0.75), 1.5),
        gap,
      });
    }
  }
  {
    const gap = Math.abs(a.x - (b.x + b.w));
    const ov = overlapLen(a.y, a.y + a.h, b.y, b.y + b.h);
    if (gap <= TOUCH && ov.len > 0.4) {
      candidates.push({
        orientation: "v",
        x: (b.x + b.w + a.x) / 2,
        y: (ov.start + ov.end) / 2,
        length: Math.min(Math.max(ov.len * 0.45, 0.75), 1.5),
        gap,
      });
    }
  }
  {
    const gap = Math.abs(b.y - (a.y + a.h));
    const ov = overlapLen(a.x, a.x + a.w, b.x, b.x + b.w);
    if (gap <= TOUCH && ov.len > 0.4) {
      candidates.push({
        orientation: "h",
        x: (ov.start + ov.end) / 2,
        y: (a.y + a.h + b.y) / 2,
        length: Math.min(Math.max(ov.len * 0.45, 0.75), 1.5),
        gap,
      });
    }
  }
  {
    const gap = Math.abs(a.y - (b.y + b.h));
    const ov = overlapLen(a.x, a.x + a.w, b.x, b.x + b.w);
    if (gap <= TOUCH && ov.len > 0.4) {
      candidates.push({
        orientation: "h",
        x: (ov.start + ov.end) / 2,
        y: (b.y + b.h + a.y) / 2,
        length: Math.min(Math.max(ov.len * 0.45, 0.75), 1.5),
        gap,
      });
    }
  }

  if (candidates.length > 0) {
    candidates.sort((c, d) => c.gap - d.gap || d.length - c.length);
    const best = candidates[0];
    return {
      x: snap(best.x),
      y: snap(best.y),
      length: snap(best.length),
      orientation: best.orientation,
    };
  }

  return {
    x: snap((a.x + a.w / 2 + b.x + b.w / 2) / 2),
    y: snap((a.y + a.h / 2 + b.y + b.h / 2) / 2),
    length: 1,
    orientation: Math.abs(a.x + a.w / 2 - (b.x + b.w / 2)) > Math.abs(a.y + a.h / 2 - (b.y + b.h / 2))
      ? "v"
      : "h",
  };
}
