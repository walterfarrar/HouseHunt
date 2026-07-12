/**
 * Emoji palette + keyword search + a "guess an icon from a name" helper.
 *
 * Icons are plain emoji characters. They render natively on any phone, tablet,
 * or desktop with no extra font/package, and serialise cleanly into
 * `catalog.json` for the GitHub Pages sync. Admins can also paste any emoji
 * their device keyboard produces, so the full system emoji set is available on
 * top of this curated palette.
 */

export type EmojiGroup = {
  id: string;
  label: string;
  emojis: string[];
};

/** Grouped palette shown in the picker. */
export const EMOJI_GROUPS: EmojiGroup[] = [
  {
    id: "tools",
    label: "Tools & hardware",
    emojis: [
      "🔧", "🔨", "🛠️", "🪛", "🪚", "🪓", "⛏️", "🔩", "⚙️", "🧰",
      "📏", "📐", "🔗", "⛓️", "🪝", "🧲", "🪤", "🪜", "🧯", "🔦",
    ],
  },
  {
    id: "power",
    label: "Power & cables",
    emojis: [
      "🔌", "⚡", "🔋", "🪫", "💡", "🕯️", "📡", "🛰️", "🖲️", "🎛️",
    ],
  },
  {
    id: "electronics",
    label: "Electronics",
    emojis: [
      "📺", "📻", "🎮", "🕹️", "💻", "🖥️", "⌨️", "🖱️", "🖨️", "📷",
      "📸", "📹", "🎥", "📽️", "☎️", "📞", "📱", "⌚", "🎧", "🎙️",
      "🔊", "🔉", "💾", "💿", "📀", "💽", "🧮", "📟",
    ],
  },
  {
    id: "kitchen",
    label: "Kitchen & home",
    emojis: [
      "🍴", "🥄", "🔪", "🍳", "🥘", "🍲", "🫕", "🧂", "🧊", "☕",
      "🫖", "🍽️", "🥣", "🧴", "🧻", "🧺", "🧷", "🪣", "🧽", "🧹",
      "🪥", "🚽", "🚿", "🛁", "🪑", "🛋️", "🛏️", "🪟", "🚪", "🪞",
      "🖼️", "🕰️", "⏰", "🌡️", "🧸", "🪆", "🎀", "🕶️", "👓",
    ],
  },
  {
    id: "health",
    label: "Health & first aid",
    emojis: [
      "💊", "🩹", "🩺", "🌡️", "🧴", "🧪", "🧫", "💉", "🩸", "🦽",
      "🩼", "🧬", "🫁", "🦷", "👂", "🧠",
    ],
  },
  {
    id: "keys",
    label: "Keys & money",
    emojis: [
      "🔑", "🗝️", "🔐", "🔒", "🔓", "👛", "👜", "💼", "🎒", "💳",
      "💵", "💰", "🪙", "🧾", "🏷️",
    ],
  },
  {
    id: "office",
    label: "Paper & office",
    emojis: [
      "✉️", "📧", "📨", "📩", "📦", "📮", "📪", "📫", "📬", "📭",
      "📄", "📃", "📑", "📊", "📈", "📉", "🗒️", "📝", "✏️", "🖊️",
      "🖋️", "✒️", "🖌️", "🖍️", "📌", "📍", "📎", "🖇️", "✂️", "📏",
      "📐", "🗂️", "📁", "📂", "🗃️", "🗄️", "📚", "📖", "🔖", "📇",
      "📆", "📅", "🗓️", "📋", "🧷", "🖊",
    ],
  },
  {
    id: "clothing",
    label: "Clothing & weather",
    emojis: [
      "☂️", "🌂", "🧥", "🧤", "🧣", "🧦", "👕", "👖", "👗", "🥼",
      "🥾", "👟", "🧢", "🎩", "👒", "🕶️", "🧴", "☀️", "🌧️", "❄️",
      "🌊", "🔥", "🎁", "🛍️", "🧳", "🪭",
    ],
  },
  {
    id: "nature",
    label: "Nature & pets",
    emojis: [
      "🌱", "🪴", "🌵", "🌳", "🌲", "🍀", "🌸", "🌼", "🐶", "🐱",
      "🐟", "🐦", "🦴", "🐾", "🥕", "🍎", "🥫", "🍞", "🥛", "🍬",
    ],
  },
  {
    id: "symbols",
    label: "Symbols & colours",
    emojis: [
      "⭐", "🌟", "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍",
      "🔴", "🟠", "🟡", "🟢", "🔵", "🟣", "⚫", "⚪", "🟤", "❓",
      "❗", "✅", "⚠️", "♻️", "🔔", "🏠", "🏡", "🚗", "🚲", "🧭",
    ],
  },
];

/** Flat, de-duplicated list of every emoji in the palette. */
export const ALL_EMOJIS: string[] = Array.from(
  new Set(EMOJI_GROUPS.flatMap((g) => g.emojis)),
);

/**
 * Keyword → emoji suggestions. Order matters: more specific keywords first.
 * Used both to seed default icons and to suggest an icon for custom items.
 */
const KEYWORD_ICONS: Array<[string, string]> = [
  // Tools
  ["phillips", "🪛"],
  ["screwdriver", "🪛"],
  ["hammer", "🔨"],
  ["plier", "🛠️"],
  ["wrench", "🔧"],
  ["allen key", "🔧"],
  ["hex key", "🔧"],
  ["tape measure", "📏"],
  ["measuring tape", "📏"],
  ["level", "📐"],
  ["ruler", "📏"],
  ["utility knife", "🔪"],
  ["box cutter", "🔪"],
  ["knife", "🔪"],
  ["scissor", "✂️"],
  ["flashlight", "🔦"],
  ["torch", "🔦"],
  ["duct tape", "🧻"],
  ["painter", "🎨"],
  ["tape", "🧷"],
  ["glue", "🧴"],
  ["nail", "📌"],
  ["screw", "🔩"],
  ["bolt", "🔩"],
  ["drill", "🛠️"],
  ["saw", "🪚"],
  ["ladder", "🪜"],
  ["toolbox", "🧰"],
  ["tool", "🛠️"],
  ["magnet", "🧲"],

  // Power & cables
  ["phone charger", "🔌"],
  ["laptop charger", "🔌"],
  ["wall adapter", "🔌"],
  ["adapter", "🔌"],
  ["charger", "🔌"],
  ["power strip", "🔌"],
  ["extension cord", "🔌"],
  ["usb", "🔌"],
  ["hdmi", "🔌"],
  ["ethernet", "🔌"],
  ["lightning cable", "🔌"],
  ["audio cable", "🔌"],
  ["cable", "🔌"],
  ["cord", "🔌"],
  ["9v", "🔋"],
  ["aa batter", "🔋"],
  ["aaa batter", "🔋"],
  ["batter", "🔋"],
  ["led bulb", "💡"],
  ["light bulb", "💡"],
  ["night light", "💡"],
  ["bulb", "💡"],
  ["candle", "🕯️"],

  // Electronics
  ["tv remote", "📺"],
  ["streaming remote", "📺"],
  ["spare remote", "📺"],
  ["remote", "📺"],
  ["television", "📺"],
  ["tv", "📺"],
  ["router", "📡"],
  ["modem", "📡"],
  ["headphone", "🎧"],
  ["earbud", "🎧"],
  ["tablet", "📱"],
  ["phone", "📱"],
  ["camera", "📷"],
  ["thumb drive", "💾"],
  ["flash drive", "💾"],
  ["usb drive", "💾"],
  ["sd card", "💾"],
  ["laptop", "💻"],
  ["computer", "🖥️"],
  ["keyboard", "⌨️"],
  ["mouse", "🖱️"],
  ["watch", "⌚"],
  ["speaker", "🔊"],

  // Kitchen
  ["can opener", "🥫"],
  ["bottle opener", "🍾"],
  ["measuring cup", "🥤"],
  ["mixing bowl", "🥣"],
  ["cutting board", "🔪"],
  ["tupperware", "🍱"],
  ["aluminum foil", "🧻"],
  ["plastic wrap", "🧻"],
  ["ziploc", "🛍️"],
  ["coffee filter", "☕"],
  ["coffee", "☕"],
  ["dish towel", "🧻"],
  ["towel", "🧻"],
  ["oven mitt", "🧤"],
  ["spoon", "🥄"],
  ["fork", "🍴"],
  ["plate", "🍽️"],
  ["mug", "☕"],
  ["pan", "🍳"],
  ["pot", "🍲"],

  // Health
  ["prescription", "💊"],
  ["pain reliever", "💊"],
  ["vitamin", "💊"],
  ["pill", "💊"],
  ["band-aid", "🩹"],
  ["bandaid", "🩹"],
  ["band aid", "🩹"],
  ["bandage", "🩹"],
  ["ointment", "🧴"],
  ["thermometer", "🌡️"],
  ["ice pack", "🧊"],
  ["heating pad", "🔥"],
  ["first aid", "🩺"],
  ["medicine", "💊"],
  ["med", "💊"],

  // Cleaning
  ["paper towel", "🧻"],
  ["trash bag", "🗑️"],
  ["garbage", "🗑️"],
  ["wipe", "🧻"],
  ["cleaner", "🧴"],
  ["vacuum", "🧹"],
  ["broom", "🧹"],
  ["dustpan", "🧹"],
  ["mop", "🧽"],
  ["detergent", "🧴"],
  ["dryer sheet", "🧺"],
  ["laundry", "🧺"],
  ["sponge", "🧽"],
  ["soap", "🧼"],
  ["bucket", "🪣"],

  // Keys & wallets
  ["house key", "🔑"],
  ["car key", "🔑"],
  ["spare key", "🗝️"],
  ["mailbox key", "🗝️"],
  ["keychain", "🔑"],
  ["garage remote", "🎛️"],
  ["key", "🔑"],
  ["wallet", "👛"],
  ["purse", "👜"],
  ["card", "💳"],
  ["money", "💵"],
  ["cash", "💵"],

  // Paper & mail
  ["mail", "✉️"],
  ["envelope", "✉️"],
  ["stamp", "📮"],
  ["package", "📦"],
  ["parcel", "📦"],
  ["important paper", "📄"],
  ["document", "📄"],
  ["paper", "📄"],
  ["notebook", "📓"],
  ["notepad", "📝"],
  ["pen", "🖊️"],
  ["pencil", "✏️"],
  ["marker", "🖍️"],
  ["book", "📚"],
  ["folder", "📁"],

  // Seasonal & clothing
  ["umbrella", "☂️"],
  ["jacket", "🧥"],
  ["coat", "🧥"],
  ["glove", "🧤"],
  ["hat", "🎩"],
  ["cap", "🧢"],
  ["sunglass", "🕶️"],
  ["glasses", "👓"],
  ["sunscreen", "🧴"],
  ["holiday decoration", "🎁"],
  ["decoration", "🎉"],
  ["gift wrap", "🎁"],
  ["gift", "🎁"],
  ["shopping bag", "🛍️"],
  ["bag", "🛍️"],
  ["water bottle", "🧴"],
  ["bottle", "🍾"],
  ["scarf", "🧣"],
  ["boot", "🥾"],
  ["shoe", "👟"],
  ["sock", "🧦"],
];

const CATEGORY_ICONS: Array<[string, string]> = [
  ["tool", "🔧"],
  ["cable", "🔌"],
  ["charger", "🔌"],
  ["kitchen", "🍴"],
  ["remote", "📺"],
  ["electronic", "📺"],
  ["key", "🔑"],
  ["wallet", "👛"],
  ["med", "💊"],
  ["first aid", "🩺"],
  ["clean", "🧹"],
  ["batter", "🔋"],
  ["bulb", "💡"],
  ["paper", "✉️"],
  ["mail", "✉️"],
  ["season", "☂️"],
  ["misc", "📦"],
];

/** Best-guess emoji for an item name (used to seed a default when adding). */
export function guessItemIcon(name: string): string | undefined {
  const n = name.toLowerCase().trim();
  if (!n) return undefined;
  for (const [keyword, icon] of KEYWORD_ICONS) {
    if (n.includes(keyword)) return icon;
  }
  return undefined;
}

/** Best-guess emoji for a category name. */
export function guessCategoryIcon(name: string): string | undefined {
  const n = name.toLowerCase().trim();
  if (!n) return undefined;
  for (const [keyword, icon] of CATEGORY_ICONS) {
    if (n.includes(keyword)) return icon;
  }
  return guessItemIcon(name);
}
