import type { HouseData } from "../types";

/** Digitized from the hand-drawn floor plan — rename/move in Edit mode. */
export const initialHouse: HouseData = {
  version: 1,
  rooms: [
    // Detached structures (left)
    { id: "r-a", name: "Outbuilding", x: 0.5, y: 0.5, w: 3.5, h: 3.2, accent: "sand" },
    { id: "r-b", name: "Garage", x: 0.5, y: 8.2, w: 5.2, h: 3.4, accent: "slate" },

    // Left wing of main house
    { id: "r-c", name: "Room C", x: 6.2, y: 1.8, w: 2.6, h: 3.6 },
    { id: "r-d", name: "Room D", x: 6.2, y: 5.5, w: 2.6, h: 2.4 },

    // Top / center corridor cluster
    { id: "r-e", name: "Room E", x: 9.0, y: 1.2, w: 2.8, h: 2.6 },
    { id: "r-f", name: "Room F", x: 11.9, y: 1.2, w: 2.4, h: 2.6 },

    // Large central room (mark in sketch ≈ fireplace / island)
    {
      id: "r-g",
      name: "Great Room",
      x: 9.0,
      y: 4.0,
      w: 5.3,
      h: 5.5,
      accent: "sage",
    },

    // Right wing stack
    { id: "r-h", name: "Room H", x: 14.5, y: 1.0, w: 3.2, h: 1.9 },
    { id: "r-i", name: "Room I", x: 14.5, y: 3.0, w: 3.2, h: 1.9 },
    { id: "r-j", name: "Room J", x: 14.5, y: 5.0, w: 3.2, h: 1.9 },
    { id: "r-k", name: "Room K", x: 14.5, y: 7.0, w: 3.2, h: 1.9 },
    { id: "r-l", name: "Room L", x: 14.5, y: 9.0, w: 3.2, h: 1.9 },
  ],
  items: [],
  doors: [],
};
