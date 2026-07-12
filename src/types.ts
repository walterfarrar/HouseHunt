export type RoomAccent =
  | "sage"
  | "moss"
  | "teal"
  | "sky"
  | "slate"
  | "mist"
  | "sand"
  | "clay"
  | "peach"
  | "rose"
  | "mustard"
  | "olive";

export type Room = {
  id: string;
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  /** Optional landmark tint key */
  accent?: RoomAccent;
};

/** Door opening between two rooms, or a room and outside (`toRoomId` = "outside"). */
export type Door = {
  id: string;
  x: number;
  y: number;
  length: number;
  orientation: "h" | "v";
  fromRoomId: string;
  /** Room id, or `"outside"` for an exterior door */
  toRoomId: string;
};

export const OUTSIDE_ID = "outside";

export type Item = {
  id: string;
  roomId: string;
  name: string;
  categoryId?: string;
  spot?: string;
  updatedAt: string;
};

export type CatalogCategory = {
  id: string;
  name: string;
  items: string[];
};

export type Catalog = {
  version: 1;
  categories: CatalogCategory[];
  spots: string[];
};

export type HouseData = {
  version: 1;
  /** ISO timestamp — used to sync layout between devices via house.json */
  updatedAt?: string;
  rooms: Room[];
  doors: Door[];
  items: Item[];
};

export type AppMode = "hunt" | "edit";

export type Selection =
  | { kind: "room"; id: string }
  | { kind: "door"; id: string };

export type View =
  | { screen: "map" }
  | { screen: "room"; roomId: string }
  | { screen: "admin" };
