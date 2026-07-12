import type { Catalog, CatalogCategory } from "../types";
import { guessItemIcon } from "./emoji";

/**
 * Source definition for the built-in catalog. Item icons are filled in from the
 * keyword guesser so every default item ships with a sensible emoji, while
 * admins can still override any of them (or add their own) in the Admin screen.
 */
type CategorySeed = {
  id: string;
  name: string;
  icon: string;
  items: string[];
};

const seeds: CategorySeed[] = [
  {
    id: "tools",
    name: "Tools",
    icon: "🔧",
    items: [
      "Screwdriver",
      "Phillips screwdriver",
      "Hammer",
      "Pliers",
      "Wrench",
      "Tape measure",
      "Level",
      "Utility knife",
      "Flashlight",
      "Batteries",
      "Duct tape",
      "Painter's tape",
      "Glue",
      "Nails",
      "Screws",
      "Allen keys",
    ],
  },
  {
    id: "cables",
    name: "Cables & Chargers",
    icon: "🔌",
    items: [
      "Phone charger",
      "USB-C cable",
      "Lightning cable",
      "HDMI cable",
      "Extension cord",
      "Power strip",
      "Laptop charger",
      "Wall adapter",
      "Ethernet cable",
      "Audio cable",
      "TV remote batteries",
    ],
  },
  {
    id: "kitchen",
    name: "Kitchen",
    icon: "🍴",
    items: [
      "Can opener",
      "Bottle opener",
      "Scissors",
      "Measuring cups",
      "Mixing bowl",
      "Cutting board",
      "Tupperware",
      "Aluminum foil",
      "Plastic wrap",
      "Ziploc bags",
      "Coffee filters",
      "Dish towels",
      "Oven mitts",
    ],
  },
  {
    id: "electronics",
    name: "Remotes & Electronics",
    icon: "📺",
    items: [
      "TV remote",
      "Streaming remote",
      "Spare remote",
      "Headphones",
      "Earbuds",
      "Tablet",
      "Camera",
      "Thumb drive",
      "SD card",
      "Router",
      "Modem",
    ],
  },
  {
    id: "keys",
    name: "Keys & Wallets",
    icon: "🔑",
    items: [
      "House keys",
      "Car keys",
      "Spare key",
      "Wallet",
      "Purse",
      "Keychain",
      "Garage remote",
      "Mailbox key",
    ],
  },
  {
    id: "meds",
    name: "Meds & First Aid",
    icon: "💊",
    items: [
      "Prescription bottle",
      "Pain reliever",
      "Band-Aids",
      "Antibiotic ointment",
      "Thermometer",
      "Ice pack",
      "Heating pad",
      "Vitamins",
      "Pill organizer",
      "First aid kit",
    ],
  },
  {
    id: "cleaning",
    name: "Cleaning",
    icon: "🧹",
    items: [
      "Paper towels",
      "Trash bags",
      "Disinfecting wipes",
      "All-purpose cleaner",
      "Glass cleaner",
      "Vacuum",
      "Broom",
      "Dustpan",
      "Mop",
      "Laundry detergent",
      "Dryer sheets",
    ],
  },
  {
    id: "bulbs",
    name: "Batteries & Bulbs",
    icon: "🔋",
    items: [
      "AA batteries",
      "AAA batteries",
      "9V battery",
      "Light bulb",
      "LED bulb",
      "Night light",
    ],
  },
  {
    id: "paper",
    name: "Paper & Mail",
    icon: "✉️",
    items: [
      "Mail",
      "Package",
      "Important papers",
      "Notebook",
      "Pens",
      "Stamps",
      "Envelopes",
      "Tape",
      "Scissors",
    ],
  },
  {
    id: "seasonal",
    name: "Seasonal & Misc",
    icon: "☂️",
    items: [
      "Umbrella",
      "Jacket",
      "Gloves",
      "Hat",
      "Sunglasses",
      "Sunscreen",
      "Holiday decorations",
      "Gift wrap",
      "Shopping bags",
      "Water bottle",
    ],
  },
];

function buildCategory(seed: CategorySeed): CatalogCategory {
  return {
    id: seed.id,
    name: seed.name,
    icon: seed.icon,
    items: seed.items.map((name) => ({
      name,
      icon: guessItemIcon(name) ?? seed.icon,
    })),
  };
}

/** Built-in catalog — also shipped as public/catalog.json for GitHub Pages. */
export const defaultCatalog: Catalog = {
  version: 1,
  categories: seeds.map(buildCategory),
  spots: [
    "Shelf",
    "Drawer",
    "Cabinet",
    "Counter",
    "Table",
    "Desk",
    "Floor",
    "Closet",
    "Box",
    "Hook",
    "Near door",
    "Other",
  ],
};
