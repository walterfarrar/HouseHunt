import { useRef, useState } from "react";
import type { Door, Room } from "../types";
import { OUTSIDE_ID } from "../types";
import type { OutsideEdge } from "../lib/doors";
import { loadGithubSettings } from "../lib/github";
import { ROOM_COLOR_OPTIONS, ROOM_COLORS } from "./RoomButton";

type Props = {
  room: Room | null;
  door: Door | null;
  rooms: Room[];
  placingDoor: boolean;
  doorPickFirstId: string | null;
  syncStatus: string | null;
  onUpdateRoom: (room: Room) => void;
  onUpdateDoor: (door: Door) => void;
  onAddRoom: () => void;
  onAddDoor: () => void;
  onCancelDoorPick: () => void;
  onDoorToOutside: (edge: OutsideEdge) => void;
  onDeleteRoom: () => void;
  onDeleteDoor: () => void;
  onReset: () => void;
  onExport: () => void;
  onImportFile: (file: File) => void;
  onPublishLayout: (token: string) => Promise<void>;
  onOpenAdmin: () => void;
  onDone: () => void;
};

export function EditToolbar({
  room,
  door,
  rooms,
  placingDoor,
  doorPickFirstId,
  syncStatus,
  onUpdateRoom,
  onUpdateDoor,
  onAddRoom,
  onAddDoor,
  onCancelDoorPick,
  onDoorToOutside,
  onDeleteRoom,
  onDeleteDoor,
  onReset,
  onExport,
  onImportFile,
  onPublishLayout,
  onOpenAdmin,
  onDone,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [token, setToken] = useState("");
  const [publishing, setPublishing] = useState(false);
  const gh = loadGithubSettings();

  return (
    <aside className="edit-panel">
      <header className="edit-panel__head">
        <h2>Edit map</h2>
        <button type="button" className="btn btn--primary" onClick={onDone}>
          Done
        </button>
      </header>

      <div className="edit-panel__actions">
        <button type="button" className="btn" onClick={onAddRoom} disabled={placingDoor}>
          Add room
        </button>
        <button
          type="button"
          className={`btn ${placingDoor ? "btn--primary" : ""}`}
          onClick={placingDoor ? onCancelDoorPick : onAddDoor}
        >
          {placingDoor ? "Cancel door" : "Add door"}
        </button>
        <button type="button" className="btn" onClick={onExport} disabled={placingDoor}>
          Download layout
        </button>
        <button
          type="button"
          className="btn"
          disabled={placingDoor}
          onClick={() => fileRef.current?.click()}
        >
          Import layout
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onImportFile(file);
            e.target.value = "";
          }}
        />
        <button type="button" className="btn btn--danger" onClick={onReset} disabled={placingDoor}>
          Reset layout
        </button>
        <button type="button" className="btn" onClick={onOpenAdmin} disabled={placingDoor}>
          Admin lists
        </button>
      </div>

      {!placingDoor && (
        <div className="edit-panel__form">
          <h3 className="edit-panel__sub">Share this house</h3>
          <p className="hint">
            Localhost and GitHub Pages do not share browser storage. Publish your floor plan, then
            run <code>npm run deploy</code> so every device loads it.
          </p>
          <label className="field">
            <span>GitHub token (Contents: read/write)</span>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="ghp_…"
              autoComplete="off"
            />
          </label>
          <p className="hint">
            Target: {gh.owner || "walterfarrar"}/{gh.repo || "HouseHunt"} — public/house.json
          </p>
          <button
            type="button"
            className="btn btn--primary"
            disabled={placingDoor || publishing || !token}
            onClick={async () => {
              setPublishing(true);
              await onPublishLayout(token);
              setPublishing(false);
            }}
          >
            {publishing ? "Publishing…" : "Publish layout to GitHub"}
          </button>
          {syncStatus && <p className="hint hint--emphasis">{syncStatus}</p>}
        </div>
      )}

      {placingDoor && (
        <div
          className="hint hint--emphasis"
          style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
        >
          <p style={{ margin: 0 }}>
            {doorPickFirstId
              ? "Tap another room, or pick an outside wall below."
              : "Tap the room this door belongs to."}
          </p>
          {doorPickFirstId && (
            <div className="find-form__row">
              <button type="button" className="btn btn--primary" onClick={() => onDoorToOutside("s")}>
                Outside (bottom)
              </button>
              <button type="button" className="btn" onClick={() => onDoorToOutside("n")}>
                Outside (top)
              </button>
              <button type="button" className="btn" onClick={() => onDoorToOutside("w")}>
                Outside (left)
              </button>
              <button type="button" className="btn" onClick={() => onDoorToOutside("e")}>
                Outside (right)
              </button>
            </div>
          )}
        </div>
      )}

      {!placingDoor && door && (
        <div className="edit-panel__form">
          <h3 className="edit-panel__sub">Door</h3>

          <label className="field">
            <span>From room</span>
            <select
              value={door.fromRoomId}
              onChange={(e) => onUpdateDoor({ ...door, fromRoomId: e.target.value })}
            >
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>To</span>
            <select
              value={door.toRoomId}
              onChange={(e) => onUpdateDoor({ ...door, toRoomId: e.target.value })}
            >
              <option value={OUTSIDE_ID}>Outside</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Orientation</span>
            <div className="find-form__row">
              <button
                type="button"
                className={`btn ${door.orientation === "h" ? "btn--primary" : ""}`}
                onClick={() => onUpdateDoor({ ...door, orientation: "h" })}
              >
                Horizontal wall
              </button>
              <button
                type="button"
                className={`btn ${door.orientation === "v" ? "btn--primary" : ""}`}
                onClick={() => onUpdateDoor({ ...door, orientation: "v" })}
              >
                Vertical wall
              </button>
            </div>
          </label>

          <label className="field">
            <span>Opening size</span>
            <input
              type="number"
              step={0.25}
              min={0.5}
              value={door.length}
              onChange={(e) =>
                onUpdateDoor({ ...door, length: Math.max(0.5, Number(e.target.value)) })
              }
            />
          </label>

          <button type="button" className="btn btn--danger" onClick={onDeleteDoor}>
            Delete door
          </button>
          <p className="hint">Drag the door on the map to slide it along the wall.</p>
        </div>
      )}

      {!placingDoor && room && !door && (
        <div className="edit-panel__form">
          <label className="field">
            <span>Name</span>
            <input
              type="text"
              value={room.name}
              onChange={(e) => onUpdateRoom({ ...room, name: e.target.value })}
              autoComplete="off"
            />
          </label>

          <fieldset className="field color-field">
            <legend>Color</legend>
            <div className="color-swatches" role="listbox" aria-label="Room color">
              {ROOM_COLOR_OPTIONS.map(({ id, label }) => {
                const selected = (room.accent ?? null) === id;
                return (
                  <button
                    key={label}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    title={label}
                    className={`color-swatch ${selected ? "color-swatch--selected" : ""}`}
                    style={{
                      background: id ? ROOM_COLORS[id] : "var(--room-default)",
                    }}
                    onClick={() =>
                      onUpdateRoom({
                        ...room,
                        accent: id ?? undefined,
                      })
                    }
                  >
                    <span className="sr-only">{label}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="field-row">
            <label className="field">
              <span>X</span>
              <input
                type="number"
                step={0.25}
                value={room.x}
                onChange={(e) => onUpdateRoom({ ...room, x: Number(e.target.value) })}
              />
            </label>
            <label className="field">
              <span>Y</span>
              <input
                type="number"
                step={0.25}
                value={room.y}
                onChange={(e) => onUpdateRoom({ ...room, y: Number(e.target.value) })}
              />
            </label>
          </div>
          <div className="field-row">
            <label className="field">
              <span>W</span>
              <input
                type="number"
                step={0.25}
                min={1.5}
                value={room.w}
                onChange={(e) => onUpdateRoom({ ...room, w: Number(e.target.value) })}
              />
            </label>
            <label className="field">
              <span>H</span>
              <input
                type="number"
                step={0.25}
                min={1.5}
                value={room.h}
                onChange={(e) => onUpdateRoom({ ...room, h: Number(e.target.value) })}
              />
            </label>
          </div>

          <button type="button" className="btn btn--danger" onClick={onDeleteRoom}>
            Delete room
          </button>
          <p className="hint">
            Drag a room to move. Drag a side edge to resize — the opposite side stays put.
          </p>
        </div>
      )}

      {!placingDoor && !room && !door && (
        <p className="hint">
          Tap a room to edit it, or tap a door. Use <strong>Add door</strong>, then tap another room
          — or choose an <strong>Outside</strong> wall.
        </p>
      )}
    </aside>
  );
}
