import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { AdminLoginModal } from "./components/AdminLoginModal";
import { EditToolbar } from "./components/EditToolbar";
import { MapView } from "./components/MapView";
import { RoomScreen } from "./components/RoomScreen";
import { SearchOverlay } from "./components/SearchOverlay";
import { fetchCatalog, getCachedCatalog, isAdminUnlocked, lockAdmin } from "./catalog";
import { doorBetweenRooms, doorToOutside, type OutsideEdge } from "./lib/doors";
import { roomBounds } from "./lib/geometry";
import { exportHouseJson, loadHouse, resetHouse, saveHouse } from "./storage";
import type { AppMode, Catalog, Door, HouseData, Room, Selection, View } from "./types";
import { OUTSIDE_ID } from "./types";
import "./App.css";

const AdminScreen = lazy(() =>
  import("./components/AdminScreen").then((m) => ({ default: m.AdminScreen })),
);

function newId() {
  return crypto.randomUUID();
}

type LoginIntent = "admin" | null;

export default function App() {
  const [house, setHouse] = useState<HouseData>(() => loadHouse());
  const [catalog, setCatalog] = useState<Catalog>(() => getCachedCatalog());
  const [mode, setMode] = useState<AppMode>("hunt");
  const [view, setView] = useState<View>({ screen: "map" });
  const [selection, setSelection] = useState<Selection | null>(null);
  const [placingDoor, setPlacingDoor] = useState(false);
  const [doorPickFirstId, setDoorPickFirstId] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [adminUnlocked, setAdminUnlocked] = useState(() => isAdminUnlocked());
  const [loginIntent, setLoginIntent] = useState<LoginIntent>(null);

  useEffect(() => {
    saveHouse(house);
  }, [house]);

  useEffect(() => {
    let cancelled = false;
    fetchCatalog().then((remote) => {
      if (!cancelled) setCatalog(remote);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (window.location.hash === "#admin") {
      if (isAdminUnlocked()) {
        setAdminUnlocked(true);
        setView({ screen: "admin" });
      } else {
        setLoginIntent("admin");
      }
    }
  }, []);

  const enterEdit = () => {
    setMode("edit");
    setView({ screen: "map" });
  };

  const openAdmin = () => {
    if (!adminUnlocked && !isAdminUnlocked()) {
      setLoginIntent("admin");
      return;
    }
    setAdminUnlocked(true);
    setMode("hunt");
    setSelection(null);
    cancelDoorPick();
    setView({ screen: "admin" });
    window.location.hash = "admin";
  };

  const onLoginSuccess = () => {
    setAdminUnlocked(true);
    setLoginIntent(null);
    setMode("hunt");
    setSelection(null);
    cancelDoorPick();
    setView({ screen: "admin" });
    window.location.hash = "admin";
  };

  const leaveAdmin = () => {
    setView({ screen: "map" });
    if (window.location.hash === "#admin") {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  };

  const lockAndExitAdminTools = () => {
    lockAdmin();
    setAdminUnlocked(false);
    setMode("hunt");
    setSelection(null);
    cancelDoorPick();
    leaveAdmin();
  };

  const itemCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of house.items) {
      counts[item.roomId] = (counts[item.roomId] ?? 0) + 1;
    }
    return counts;
  }, [house.items]);

  const selectedRoom =
    selection?.kind === "room"
      ? (house.rooms.find((r) => r.id === selection.id) ?? null)
      : null;

  const selectedDoor =
    selection?.kind === "door"
      ? (house.doors.find((d) => d.id === selection.id) ?? null)
      : null;

  const activeRoom =
    view.screen === "room"
      ? (house.rooms.find((r) => r.id === view.roomId) ?? null)
      : null;

  const updateRoom = (room: Room) => {
    setHouse((h) => ({
      ...h,
      rooms: h.rooms.map((r) => (r.id === room.id ? room : r)),
    }));
  };

  const updateDoor = (door: Door) => {
    setHouse((h) => ({
      ...h,
      doors: h.doors.map((d) => (d.id === door.id ? door : d)),
    }));
  };

  const addRoom = () => {
    const bounds = roomBounds(house.rooms);
    const room: Room = {
      id: newId(),
      name: "New room",
      x: bounds.minX + 1,
      y: bounds.minY + 1,
      w: 3,
      h: 2.5,
    };
    setHouse((h) => ({ ...h, rooms: [...h.rooms, room] }));
    setSelection({ kind: "room", id: room.id });
  };

  const startAddDoor = () => {
    setPlacingDoor(true);
    setDoorPickFirstId(null);
    setSelection(null);
  };

  const cancelDoorPick = () => {
    setPlacingDoor(false);
    setDoorPickFirstId(null);
  };

  const onRoomPickedForDoor = (roomId: string) => {
    if (!placingDoor) return;
    if (!doorPickFirstId) {
      setDoorPickFirstId(roomId);
      return;
    }
    if (doorPickFirstId === roomId) return;

    const a = house.rooms.find((r) => r.id === doorPickFirstId);
    const b = house.rooms.find((r) => r.id === roomId);
    if (!a || !b) return;

    const placed = doorBetweenRooms(a, b);
    const door: Door = {
      id: newId(),
      fromRoomId: a.id,
      toRoomId: b.id,
      ...placed,
    };
    setHouse((h) => ({ ...h, doors: [...h.doors, door] }));
    setPlacingDoor(false);
    setDoorPickFirstId(null);
    setSelection({ kind: "door", id: door.id });
  };

  const onDoorToOutside = (edge: OutsideEdge) => {
    if (!placingDoor || !doorPickFirstId) return;
    const room = house.rooms.find((r) => r.id === doorPickFirstId);
    if (!room) return;
    const placed = doorToOutside(room, edge);
    const door: Door = {
      id: newId(),
      fromRoomId: room.id,
      toRoomId: OUTSIDE_ID,
      ...placed,
    };
    setHouse((h) => ({ ...h, doors: [...h.doors, door] }));
    setPlacingDoor(false);
    setDoorPickFirstId(null);
    setSelection({ kind: "door", id: door.id });
  };

  const deleteRoom = () => {
    if (selection?.kind !== "room") return;
    const id = selection.id;
    if (!confirm("Delete this room, its doors, and its items?")) return;
    setHouse((h) => ({
      ...h,
      rooms: h.rooms.filter((r) => r.id !== id),
      doors: h.doors.filter((d) => d.fromRoomId !== id && d.toRoomId !== id),
      items: h.items.filter((i) => i.roomId !== id),
    }));
    setSelection(null);
  };

  const deleteDoor = () => {
    if (selection?.kind !== "door") return;
    const id = selection.id;
    setHouse((h) => ({ ...h, doors: h.doors.filter((d) => d.id !== id) }));
    setSelection(null);
  };

  const doReset = () => {
    if (!confirm("Reset map to the starter floor plan? Items and doors will be cleared.")) return;
    setHouse(resetHouse());
    setSelection(null);
    cancelDoorPick();
  };

  const doExport = () => {
    const blob = new Blob([exportHouseJson(house)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "house-hunt-layout.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Safety: never stay in edit mode without an unlock for this tab.
  useEffect(() => {
    if (mode === "edit" && !adminUnlocked && !isAdminUnlocked()) {
      setMode("hunt");
      setSelection(null);
      cancelDoorPick();
    }
  }, [mode, adminUnlocked]);

  if (view.screen === "admin") {
    return (
      <div className="app">
        <Suspense fallback={<p className="lede" style={{ padding: "1.25rem" }}>Loading admin…</p>}>
          <AdminScreen
            catalog={catalog}
            onCatalogChange={(next) => {
              setCatalog(next);
            }}
            onBack={leaveAdmin}
            onEditMap={() => {
              leaveAdmin();
              setAdminUnlocked(true);
              enterEdit();
            }}
            onLock={() => {
              lockAndExitAdminTools();
            }}
          />
        </Suspense>
      </div>
    );
  }

  if (activeRoom && mode === "hunt") {
    const roomItems = house.items.filter((i) => i.roomId === activeRoom.id);
    return (
      <div className="app">
        <RoomScreen
          room={activeRoom}
          items={roomItems}
          catalog={catalog}
          onBack={() => setView({ screen: "map" })}
          onAddItem={(name, meta) => {
            setHouse((h) => ({
              ...h,
              items: [
                ...h.items,
                {
                  id: newId(),
                  roomId: activeRoom.id,
                  name,
                  categoryId: meta.categoryId,
                  spot: meta.spot,
                  updatedAt: new Date().toISOString(),
                },
              ],
            }));
          }}
          onDeleteItem={(id) => {
            setHouse((h) => ({ ...h, items: h.items.filter((i) => i.id !== id) }));
          }}
        />
        {loginIntent && (
          <AdminLoginModal
            title="Admin login"
            onSuccess={onLoginSuccess}
            onCancel={() => setLoginIntent(null)}
          />
        )}
      </div>
    );
  }

  return (
    <div className={`app ${mode === "edit" ? "app--edit" : ""}`}>
      <header className="topbar">
        <div className="brand">
          <p className="brand__name">House Hunt</p>
          <p className="brand__tag">Tap a room · log what you find</p>
        </div>

        {mode === "hunt" && (
          <div className="topbar__tools">
            <label className="search-field">
              <span className="sr-only">Search</span>
              <input
                type="search"
                placeholder="Search the house…"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => setSearchOpen(true)}
              />
            </label>
            <button type="button" className="btn btn--ghost" onClick={openAdmin}>
              Admin
            </button>
          </div>
        )}
      </header>

      <div className="workspace">
        <MapView
          rooms={house.rooms}
          doors={house.doors}
          mode={adminUnlocked && mode === "edit" ? "edit" : "hunt"}
          selection={adminUnlocked && mode === "edit" ? selection : null}
          itemCounts={itemCounts}
          doorPickFirstId={placingDoor ? doorPickFirstId : null}
          placingDoor={placingDoor}
          onSelectRoom={(id) => setView({ screen: "room", roomId: id })}
          onChangeRooms={(rooms) => setHouse((h) => ({ ...h, rooms }))}
          onChangeDoors={(doors) => setHouse((h) => ({ ...h, doors }))}
          onSelect={setSelection}
          onRoomPickedForDoor={onRoomPickedForDoor}
        />

        {adminUnlocked && mode === "edit" && (
          <EditToolbar
            room={selectedRoom}
            door={selectedDoor}
            rooms={house.rooms}
            placingDoor={placingDoor}
            doorPickFirstId={doorPickFirstId}
            onUpdateRoom={updateRoom}
            onUpdateDoor={updateDoor}
            onAddRoom={addRoom}
            onAddDoor={startAddDoor}
            onCancelDoorPick={cancelDoorPick}
            onDoorToOutside={onDoorToOutside}
            onDeleteRoom={deleteRoom}
            onDeleteDoor={deleteDoor}
            onReset={doReset}
            onExport={doExport}
            onOpenAdmin={openAdmin}
            onDone={() => {
              setMode("hunt");
              setSelection(null);
              cancelDoorPick();
            }}
          />
        )}
      </div>

      {searchOpen && mode === "hunt" && (
        <SearchOverlay
          house={house}
          query={query}
          onClose={() => setSearchOpen(false)}
          onOpenRoom={(roomId) => setView({ screen: "room", roomId })}
        />
      )}

      {loginIntent && (
        <AdminLoginModal
          title="Admin login"
          onSuccess={onLoginSuccess}
          onCancel={() => setLoginIntent(null)}
        />
      )}
    </div>
  );
}
