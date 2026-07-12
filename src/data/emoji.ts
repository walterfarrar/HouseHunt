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
      "🔧", "🔨", "⚒️", "🛠️", "🪛", "🪚", "🪓", "⛏️", "🔩", "⚙️",
      "🧰", "🗜️", "📏", "📐", "🔗", "⛓️", "🪝", "🧲", "🪤", "🪜",
      "🧯", "🔦", "🕯️", "🧱", "🪵", "🪨", "⚖️", "🪞", "🪟", "🚪",
      "🪑", "🛏️", "🛋️", "🚽", "🚿", "🛁", "🧴", "🧹", "🧺", "🧻",
      "🪣", "🧽", "🧯", "🛎️", "🔑", "🗝️", "🔐", "🔒", "🔓",
    ],
  },
  {
    id: "power",
    label: "Power, lights & cables",
    emojis: [
      "🔌", "⚡", "🔋", "🪫", "💡", "🕯️", "🪔", "🏮", "🪩", "🔦",
      "📡", "🛰️", "🖲️", "🎛️", "📻", "📺", "🔆", "🔅", "☀️", "🌙",
      "🌃", "🌆", "🌇", "🌉", "🌠", "🌌",
    ],
  },
  {
    id: "electronics",
    label: "Electronics & gadgets",
    emojis: [
      "📺", "📻", "🎮", "🕹️", "🎰", "💻", "🖥️", "⌨️", "🖱️", "🖨️",
      "📷", "📸", "📹", "🎥", "📽️", "🎞️", "☎️", "📞", "📟", "📠",
      "📱", "📲", "⌚", "⏱️", "⏲️", "⏰", "🕰️", "📡", "🔋", "🔌",
      "🎧", "🎙️", "🎚️", "🎛️", "🔊", "🔉", "🔈", "🔇", "📢", "📣",
      "💾", "💿", "📀", "💽", "🧮", "🖲️", "🧭", "🔭", "🔬", "🧪",
    ],
  },
  {
    id: "kitchen",
    label: "Kitchen & cooking",
    emojis: [
      "🍴", "🍽️", "🥄", "🔪", "🍳", "🥘", "🍲", "🫕", "🥣", "🥗",
      "🧂", "🧊", "☕", "🫖", "🍵", "🧃", "🥤", "🧋", "🍶", "🍾",
      "🍷", "🍸", "🍹", "🍺", "🍻", "🥂", "🥃", "🫗", "🧉", "🥛",
      "🍼", "🍯", "🧈", "🧀", "🥚", "🥓", "🥩", "🍗", "🍖", "🦴",
      "🌭", "🍔", "🍟", "🍕", "🫓", "🥪", "🥙", "🧆", "🌮", "🌯",
      "🫔", "🥫", "🍱", "🍘", "🍙", "🍚", "🍛", "🍜", "🍝", "🍠",
      "🍢", "🍣", "🍤", "🍥", "🥮", "🍡", "🥟", "🥠", "🥡", "🦪",
      "🍦", "🍧", "🍨", "🍩", "🍪", "🎂", "🍰", "🧁", "🥧", "🍫",
      "🍬", "🍭", "🍮", "🍯", "🍎", "🍐", "🍊", "🍋", "🍌", "🍉",
      "🍇", "🍓", "🫐", "🍈", "🍒", "🍑", "🥭", "🍍", "🥥", "🥝",
      "🍅", "🍆", "🥑", "🥦", "🥬", "🥒", "🌶️", "🫑", "🌽", "🥕",
      "🫒", "🧄", "🧅", "🥔", "🍠", "🥐", "🥯", "🍞", "🥖", "🥨",
      "🧀", "🥚", "🍳", "🧇", "🥞", "🧈", "🥓", "🥩",
    ],
  },
  {
    id: "home",
    label: "Home & cleaning",
    emojis: [
      "🏠", "🏡", "🏘️", "🏚️", "🏗️", "🏢", "🏬", "🏭", "🏯", "🏰",
      "💒", "🗼", "🗽", "⛪", "🕌", "🛕", "🕍", "⛩️", "🕋",
      "🪑", "🛋️", "🛏️", "🚪", "🪟", "🪞", "🖼️", "🛁", "🚿", "🚽",
      "🧻", "🧴", "🪥", "🧹", "🧺", "🪣", "🧽", "🧼", "🫧", "🧯",
      "🗑️", "🪒", "🛁", "🧸", "🪆", "🛎️", "🛋️", "🪑",
    ],
  },
  {
    id: "health",
    label: "Health & first aid",
    emojis: [
      "💊", "🩹", "🩺", "🌡️", "🧴", "🧪", "🧫", "💉", "🩸", "🧬",
      "🦠", "🩻", "🦷", "🦴", "🦵", "🦶", "👂", "🦻", "👃", "🧠",
      "🫀", "🫁", "👀", "👁️", "👅", "👄", "🫦", "👶", "🧒", "👧",
      "👦", "🧑", "👩", "👨", "🧓", "👴", "👵", "♿", "🦻", "🦽",
      "🦼", "🦯", "🩼", "🦺", "🏥", "🏨", "🚑", "⚕️", "➕", "🔴",
    ],
  },
  {
    id: "keys",
    label: "Keys, bags & money",
    emojis: [
      "🔑", "🗝️", "🔐", "🔒", "🔓", "🔏", "👛", "👜", "👝", "🛍️",
      "🛒", "🎁", "🎀", "🎊", "🎉", "🎈", "🎂", "💼", "🎒", "🧳",
      "👜", "👛", "💳", "💵", "💴", "💶", "💷", "💰", "💸", "🪙",
      "💎", "🧾", "🏷️", "🏧", "💱", "💲", "🏦", "📈", "📉", "📊",
    ],
  },
  {
    id: "office",
    label: "Paper, mail & office",
    emojis: [
      "✉️", "📧", "📨", "📩", "📤", "📥", "📦", "📯", "📮", "🗳️",
      "📪", "📫", "📬", "📭", "📄", "📃", "📑", "🧾", "📊", "📈",
      "📉", "🗒️", "🗓️", "📆", "📅", "🗑️", "📇", "🗃️", "🗄️", "🗂️",
      "📁", "📂", "📓", "📔", "📒", "📕", "📗", "📘", "📙", "📚",
      "📖", "🔖", "セー", "📎", "🖇️", "📐", "📏", "🧮", "📌", "📍",
      "✂️", "🖊️", "🖋️", "✒️", "🖌️", "🖍️", "📝", "✏️", "🔍", "🔎",
      "🔏", "🔐", "🔒", "🔓", "📋", "🖨️", "🖥️", "⌨️", "🖱️",
    ],
  },
  {
    id: "clothing",
    label: "Clothes & accessories",
    emojis: [
      "👕", "👚", "👖", "🧣", "🧤", "🧥", "🧦", "👗", "👘", "🥻",
      "🩱", "🩲", "🩳", "👙", "👔", "🥼", "🦺", "👚", "🧢", "🎩",
      "👒", "🎓", "⛑️", "🪖", "👑", "💍", "💼", "🎒", "👜", "👝",
      "👛", "👓", "🕶️", "🥽", "🌂", "☂️", "🧵", "🧶", "🪡", "🪢",
      "👟", "🥾", "👠", "👡", "🩰", "👢", "🥿", "👞", "🩴", "🧦",
      "💄", "💅", "💇", "💈", "🧴", "🧷", "🧹",
    ],
  },
  {
    id: "weather",
    label: "Weather & seasons",
    emojis: [
      "☀️", "🌤️", "⛅", "🌥️", "☁️", "🌦️", "🌧️", "⛈️", "🌩️", "🌨️",
      "❄️", "☃️", "⛄", "🌬️", "💨", "🌪️", "🌫️", "🌈", "☔", "⚡",
      "🔥", "💧", "💦", "🌊", "☔", "🌂", "☂️", "🌙", "🌛", "🌜",
      "🌚", "🌝", "🌞", "⭐", "🌟", "✨", "⚡", "☄️", "💫", "🌸",
      "🌺", "🌻", "🌹", "🌷", "🌼", "🍀", "🍁", "🍂", "🍃", "🌱",
    ],
  },
  {
    id: "nature",
    label: "Plants & outdoors",
    emojis: [
      "🌱", "🪴", "🌵", "🎄", "🌲", "🌳", "🌴", "🪵", "🌿", "☘️",
      "🍀", "🎍", "🪴", "🍃", "🍂", "🍁", "🍄", "🌾", "💐", "🌷",
      "🌹", "🥀", "🌺", "🌸", "🌼", "🌻", "🌞", "🌝", "🌛", "🌜",
      "🌚", "🌕", "🌖", "🌗", "🌘", "🌑", "🌒", "🌓", "🌔", "🌙",
      "🌎", "🌍", "🌏", "🌐", "🗺️", "🗾", "🧭", "⛰️", "🏔️", "🗻",
      "🌋", "🏕️", "⛺", "🛖", "🏠", "🏡", "🏞️", "🌅", "🌄", "🌠",
    ],
  },
  {
    id: "animals",
    label: "Animals & pets",
    emojis: [
      "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐻‍❄️", "🐨",
      "🐯", "🦁", "🐮", "🐷", "🐸", "🐵", "🙈", "🙉", "🙊", "🐒",
      "🐔", "🐧", "🐦", "🐤", "🐣", "🐥", "🦆", "🦅", "🦉", "🦇",
      "🐺", "🐗", "🐴", "🦄", "🐝", "🪱", "🐛", "🦋", "🐌", "🐞",
      "🐜", "🪰", "🪲", "🪳", "🦟", "🦗", "🕷️", "🕸️", "🦂", "🐢",
      "🐍", "🦎", "🦖", "🦕", "🐙", "🦑", "🦐", "🦞", "🦀", "🐡",
      "🐠", "🐟", "🐬", "🐳", "🐋", "🦈", "🦭", "🐊", "🐅", "🐆",
      "🦓", "🦍", "🦧", "🦣", "🐘", "🦛", "🦏", "🐪", "🐫", "🦒",
      "🦘", "🦬", "🐃", "🐂", "🐄", "🐎", "🐖", "🐏", "🐑", "🦙",
      "🐐", "🦌", "🐕", "🐩", "🦮", "🐕‍🦺", "🐈", "🐈‍⬛", "🪶", "🪽",
      "🐓", "🦃", "🦤", "🦚", "🦜", "🦢", "🪿", "🦩", "🕊️", "🐇",
      "🦝", "🦨", "🦡", "🦫", "🦦", "🦥", "🐁", "🐀", "🐿️", "🦔",
      "🐾", "🦴", "🦮",
    ],
  },
  {
    id: "people",
    label: "People & activities",
    emojis: [
      "👶", "👧", "🧒", "👦", "👩", "🧑", "👨", "👩‍🦰", "👨‍🦰", "👩‍🦱",
      "👨‍🦱", "👩‍🦳", "👨‍🦳", "👩‍🦲", "👨‍🦲", "🧔", "👵", "🧓", "👴", "👲",
      "👳", "🧕", "👮", "👷", "💂", "🕵️", "👩‍⚕️", "👨‍⚕️", "👩‍🌾", "👨‍🌾",
      "👩‍🍳", "👨‍🍳", "👩‍🔧", "👨‍🔧", "👩‍🏭", "👨‍🏭", "👩‍💼", "👨‍💼", "👩‍🔬", "👨‍🔬",
      "👩‍💻", "👨‍💻", "👩‍🎤", "👨‍🎤", "👩‍🎨", "👨‍🎨", "👩‍🚀", "👨‍🚀", "👩‍🚒", "👨‍🚒",
      "🦸", "🦹", "🧙", "🧚", "🧛", "🧜", "🧝", "🧞", "🧟", "💆",
      "💇", "🚶", "🧍", "🧎", "🏃", "💃", "🕺", "🕴️", "👯", "🧘",
      "🛀", "🛌", "🧑‍🤝‍🧑", "👭", "👫", "👬", "💏", "💑", "👪",
    ],
  },
  {
    id: "sports",
    label: "Sports & games",
    emojis: [
      "⚽", "🏀", "🏈", "⚾", "🥎", "🎾", "🏐", "🏉", "🥏", "🎱",
      "🪀", "🏓", "🏸", "🏒", "🏑", "🥍", "🏏", "🪃", "🥅", "⛳",
      "🪁", "🛝", "🏹", "🎣", "🤿", "🥊", "🥋", "🎽", "🛹", "🛼",
      "🛷", "⛸️", "🥌", "🎿", "⛷️", "🏂", "🪂", "🏋️", "🤼", "🤸",
      "⛹️", "🤺", "🤾", "🏌️", "🏇", "🧘", "🏄", "🏊", "🤽", "🚣",
      "🧗", "🚴", "🚵", "🏆", "🥇", "🥈", "🥉", "🏅", "🎖️", "🏵️",
      "🎗️", "🎫", "🎟️", "🎪", "🤹", "🎭", "🩰", "🎨", "🎬", "🎤",
      "🎧", "🎼", "🎹", "🥁", "🪘", "🎷", "🎺", "🪗", "🎸", "🪕",
      "🎻", "🎲", "♟️", "🎯", "🎳", "🎮", "🎰", "🧩",
    ],
  },
  {
    id: "travel",
    label: "Travel & vehicles",
    emojis: [
      "🚗", "🚕", "🚙", "🚌", "🚎", "🏎️", "🚓", "🚑", "🚒", "🚐",
      "🛻", "🚚", "🚛", "🚜", "🦯", "🦽", "🦼", "🛴", "🚲", "🛵",
      "🏍️", "🛺", "🚨", "🚔", "🚍", "🚘", "🚖", "🚡", "🚠", "🚟",
      "🚃", "🚋", "🚞", "🚝", "🚄", "🚅", "🚈", "🚂", "🚆", "🚇",
      "🚊", "🚉", "✈️", "🛫", "🛬", "🛩️", "💺", "🛰️", "🚀", "🛸",
      "🚁", "🛶", "⛵", "🚤", "🛥️", "🛳️", "⛴️", "🚢", "⚓", "🪝",
      "⛽", "🚧", "🚦", "🚥", "🚏", "🗺️", "🗿", "🗽", "🗼", "🏰",
      "🏯", "🏟️", "🎡", "🎢", "🎠", "⛲", "⛱️", "🏖️", "🏝️", "🏜️",
      "🌋", "⛰️", "🏔️", "🗻", "🏕️", "⛺", "🏠", "🏡", "🏚️",
      "🏗️", "🏭", "🏢", "🏬", "🏣", "🏤", "🏥", "🏦", "🏨", "🏪",
      "🏫", "🏩", "💒", "🏛️", "⛪", "🕌", "🕍", "🛕", "🕋", "⛩️",
      "🛤️", "🛣️", "🗾", "🎑", "🏞️", "🌅", "🌄", "🌠", "🎇", "🎆",
      "🌇", "🌆", "🏙️", "🌃", "🌌", "🌉", "🌁", "🧳", "⛱️", "🏖️",
    ],
  },
  {
    id: "party",
    label: "Party, gifts & holidays",
    emojis: [
      "🎁", "🎀", "🎊", "🎉", "🎈", "🎂", "🍰", "🧁", "🕯️", "🎄",
      "🎅", "🤶", "🧑‍🎄", "🦌", "⛄", "❄️", "🎿", "🧤", "🧣", "🧥",
      "🎃", "👻", "💀", "☠️", "👽", "👾", "🤖", "🎃", "🕷️", "🕸️",
      "🧙", "🧛", "🧟", "🧞", "🧜", "🧚", "🪄", "🔮", "🧿", "🪬",
      "💝", "💖", "💗", "💓", "💞", "💕", "💟", "❣️", "💔", "❤️‍🔥",
      "❤️‍🩹", "❤️", "🧡", "💛", "💚", "💙", "💜", "🤎", "🖤", "🤍",
      "💯", "💢", "💥", "💫", "💦", "💨", "🕳️", "💣", "💬", "👁️‍🗨️",
      "🗨️", "🗯️", "💭", "💤", "💮", "♨️",
    ],
  },
  {
    id: "symbols",
    label: "Symbols & colours",
    emojis: [
      "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔",
      "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟",
      "☮️", "✝️", "☪️", "🕉️", "☸️", "✡️", "🔯", "🕎", "☯️", "☦️",
      "🛐", "⛎", "♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏",
      "♐", "♑", "♒", "♓", "🆔", "⚛️", "🉑", "☢️", "☣️",
      "📴", "📳", "🈶", "🈚", "🈸", "🈺", "🈷️", "✴️", "🆚", "💮",
      "🉐", "㊙️", "㊗️", "🈴", "🈵", "🈹", "🈲", "🅰️", "🅱️", "🆎",
      "🆑", "🅾️", "🆘", "❌", "⭕", "🛑", "⛔", "📛", "🚫", "💯",
      "💢", "♨️", "🚷", "🚯", "🚳", "🚱", "🔞", "📵", "🚭",
      "❗", "❕", "❓", "❔", "‼️", "⁉️", "🔅", "🔆", "〽️", "⚠️",
      "🚸", "🔱", "⚜️", "🔰", "♻️", "✅", "🈯", "💹", "❇️", "✳️",
      "❎", "🌐", "💠", "Ⓜ️", "🌀", "💤", "🏧", "🚾", "♿", "🅿️",
      "🛗", "🛂", "🛃", "🛄", "🛅", "🚹", "🚺", "🚼", "⚧", "🚻",
      "🚮", "🎦", "📶", "🈁", "🔣", "ℹ️", "🔤", "🔡", "🔠", "🆖",
      "🆗", "🆙", "🆒", "🆕", "🆓", "0️⃣", "1️⃣", "2️⃣", "3️⃣", "4️⃣",
      "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟", "🔢", "#️⃣", "*️⃣", "⏏️",
      "▶️", "⏸️", "⏯️", "⏹️", "⏺️", "⏭️", "⏮️", "⏩", "⏪", "⏫",
      "⏬", "◀️", "🔼", "🔽", "➡️", "⬅️", "⬆️", "⬇️", "↗️", "↘️",
      "↙️", "↖️", "↕️", "↔️", "↪️", "↩️", "⤴️", "⤵️", "🔀", "🔁",
      "🔂", "🔄", "🔃", "🎵", "🎶", "➕", "➖", "➗", "✖️", "♾️",
      "💲", "💱", "™️", "©️", "®️", "👁️", "🔚", "🔙", "🔛", "🔝",
      "🔜", "〰️", "➰", "➿", "✔️", "☑️", "🔘", "🔴", "🟠", "🟡",
      "🟢", "🔵", "🟣", "⚫", "⚪", "🟤", "🔺", "🔻", "🔸", "🔹",
      "🔶", "🔷", "🔳", "🔲", "▪️", "▫️", "◾", "◽", "◼️", "◻️",
      "🟥", "🟧", "🟨", "🟩", "🟦", "🟪", "⬛", "⬜", "🟫", "🔈",
      "🔇", "🔉", "🔊", "🔔", "🔕", "📣", "📢", "🗨️", "💭", "🗯️",
      "♠️", "♣️", "♥️", "♦️", "🃏", "🎴", "🀄", "🕐", "🕑", "🕒",
      "🕓", "🕔", "🕕", "🕖", "🕗", "🕘", "🕙", "🕚", "🕛", "🕜",
      "🕝", "🕞", "🕟", "🕠", "🕡", "🕢", "🕣", "🕤", "🕥", "🕦",
      "🕧", "🏳️", "🏴", "🏁", "🚩", "🏳️‍🌈", "⚧️", "🏴‍☠️",
    ],
  },
];

/** Flat, de-duplicated list of every emoji in the palette. */
export const ALL_EMOJIS: string[] = Array.from(
  new Set(EMOJI_GROUPS.flatMap((g) => g.emojis)),
);

/**
 * Search keywords for filtering the picker. Keys are lowercase terms;
 * values are emojis that should match. Multiple keywords can point at the
 * same emoji. Built from the keyword→icon map plus a few extras.
 */
const SEARCH_TERMS: Array<[string, string[]]> = [
  ["tool", ["🔧", "🛠️", "🧰"]],
  ["wrench", ["🔧"]],
  ["hammer", ["🔨", "⚒️"]],
  ["screwdriver", ["🪛"]],
  ["saw", ["🪚"]],
  ["axe", ["🪓"]],
  ["drill", ["🛠️"]],
  ["nut", ["🔩"]],
  ["bolt", ["🔩"]],
  ["gear", ["⚙️"]],
  ["toolbox", ["🧰"]],
  ["ruler", ["📏"]],
  ["level", ["📐"]],
  ["magnet", ["🧲"]],
  ["ladder", ["🪜"]],
  ["flashlight", ["🔦"]],
  ["torch", ["🔦"]],
  ["brick", ["🧱"]],
  ["wood", ["🪵"]],
  ["rock", ["🪨"]],
  ["plug", ["🔌"]],
  ["power", ["🔌", "⚡", "🔋"]],
  ["battery", ["🔋", "🪫"]],
  ["light", ["💡", "🔦", "🕯️"]],
  ["bulb", ["💡"]],
  ["candle", ["🕯️"]],
  ["tv", ["📺"]],
  ["television", ["📺"]],
  ["radio", ["📻"]],
  ["game", ["🎮", "🕹️", "🎲"]],
  ["computer", ["💻", "🖥️"]],
  ["laptop", ["💻"]],
  ["keyboard", ["⌨️"]],
  ["mouse", ["🖱️"]],
  ["printer", ["🖨️"]],
  ["camera", ["📷", "📸", "📹"]],
  ["phone", ["📱", "☎️", "📞"]],
  ["watch", ["⌚"]],
  ["headphone", ["🎧"]],
  ["speaker", ["🔊", "🔉", "🔈"]],
  ["mic", ["🎙️", "🎤"]],
  ["disk", ["💾", "💿", "📀"]],
  ["fork", ["🍴"]],
  ["knife", ["🔪"]],
  ["spoon", ["🥄"]],
  ["plate", ["🍽️"]],
  ["cook", ["🍳", "🥘", "🍲"]],
  ["pan", ["🍳"]],
  ["pot", ["🍲", "🥘"]],
  ["coffee", ["☕"]],
  ["tea", ["🍵", "🫖"]],
  ["drink", ["🧃", "🥤", "🧋", "🍺", "🍷"]],
  ["beer", ["🍺", "🍻"]],
  ["wine", ["🍷"]],
  ["milk", ["🥛"]],
  ["water", ["💧", "🌊", "🚰"]],
  ["ice", ["🧊"]],
  ["food", ["🍔", "🍕", "🍜", "🍱"]],
  ["fruit", ["🍎", "🍌", "🍇", "🍓", "🍊"]],
  ["apple", ["🍎"]],
  ["banana", ["🍌"]],
  ["veg", ["🥕", "🥦", "🥬", "🌽"]],
  ["carrot", ["🥕"]],
  ["bread", ["🍞", "🥖", "🥐"]],
  ["cheese", ["🧀"]],
  ["egg", ["🥚", "🍳"]],
  ["meat", ["🥩", "🍖", "🍗", "🥓"]],
  ["candy", ["🍬", "🍭", "🍫"]],
  ["cake", ["🎂", "🍰", "🧁"]],
  ["house", ["🏠", "🏡"]],
  ["home", ["🏠", "🏡", "🛋️", "🛏️"]],
  ["door", ["🚪"]],
  ["window", ["🪟"]],
  ["mirror", ["🪞"]],
  ["bed", ["🛏️"]],
  ["chair", ["🪑"]],
  ["couch", ["🛋️"]],
  ["bath", ["🛁", "🚿"]],
  ["toilet", ["🚽"]],
  ["clean", ["🧹", "🧽", "🧼", "🫧"]],
  ["broom", ["🧹"]],
  ["soap", ["🧼"]],
  ["sponge", ["🧽"]],
  ["laundry", ["🧺"]],
  ["trash", ["🗑️"]],
  ["bucket", ["🪣"]],
  ["paper", ["🧻", "📄", "📃"]],
  ["towel", ["🧻"]],
  ["medicine", ["💊", "🩹", "🩺"]],
  ["pill", ["💊"]],
  ["bandage", ["🩹"]],
  ["doctor", ["🩺", "💉", "🏥"]],
  ["thermo", ["🌡️"]],
  ["key", ["🔑", "🗝️"]],
  ["lock", ["🔒", "🔓", "🔐"]],
  ["wallet", ["👛"]],
  ["purse", ["👜"]],
  ["bag", ["🛍️", "🎒", "🧳", "👜"]],
  ["money", ["💵", "💰", "🪙", "💳"]],
  ["card", ["💳"]],
  ["mail", ["✉️", "📧", "📮", "📦"]],
  ["letter", ["✉️", "📨"]],
  ["package", ["📦"]],
  ["box", ["📦", "🗃️"]],
  ["book", ["📚", "📖", "📕", "📗", "📘", "📙"]],
  ["notebook", ["📓", "📔", "📒"]],
  ["pen", ["🖊️", "🖋️", "✏️"]],
  ["pencil", ["✏️"]],
  ["scissors", ["✂️"]],
  ["folder", ["📁", "📂"]],
  ["calendar", ["📅", "📆", "🗓️"]],
  ["clip", ["📎", "🖇️"]],
  ["pin", ["📌", "📍"]],
  ["shirt", ["👕"]],
  ["blouse", ["👚"]],
  ["pants", ["👖"]],
  ["jeans", ["👖"]],
  ["coat", ["🧥"]],
  ["jacket", ["🧥"]],
  ["glove", ["🧤"]],
  ["scarf", ["🧣"]],
  ["sock", ["🧦"]],
  ["dress", ["👗"]],
  ["shoe", ["👟", "🥾", "👠", "👞"]],
  ["boot", ["🥾", "👢"]],
  ["hat", ["🧢", "🎩", "👒"]],
  ["glasses", ["👓", "🕶️"]],
  ["umbrella", ["☂️", "🌂"]],
  ["sun", ["☀️", "🌞"]],
  ["cloud", ["☁️", "⛅", "🌤️"]],
  ["rain", ["🌧️", "☔", "💧"]],
  ["snow", ["❄️", "☃️", "⛄", "🌨️"]],
  ["storm", ["⛈️", "🌩️", "🌪️"]],
  ["fire", ["🔥"]],
  ["plant", ["🌱", "🪴", "🌿"]],
  ["tree", ["🌳", "🌲", "🌴", "🎄"]],
  ["flower", ["🌸", "🌺", "🌻", "🌹", "🌷", "🌼"]],
  ["cactus", ["🌵"]],
  ["leaf", ["🍃", "🍂", "🍁"]],
  ["dog", ["🐶", "🐕", "🦮"]],
  ["cat", ["🐱", "🐈"]],
  ["bird", ["🐦", "🐤", "🐧", "🦅", "🦉"]],
  ["fish", ["🐟", "🐠", "🐡"]],
  ["pet", ["🐶", "🐱", "🐾", "🦴"]],
  ["paw", ["🐾"]],
  ["bone", ["🦴"]],
  ["car", ["🚗", "🚕", "🚙"]],
  ["bike", ["🚲"]],
  ["bus", ["🚌"]],
  ["train", ["🚆", "🚄", "🚅"]],
  ["plane", ["✈️"]],
  ["boat", ["⛵", "🚤", "🚢"]],
  ["ship", ["🚢"]],
  ["rocket", ["🚀"]],
  ["gift", ["🎁"]],
  ["party", ["🎉", "🎊", "🎈"]],
  ["balloon", ["🎈"]],
  ["christmas", ["🎄", "🎅", "🦌"]],
  ["halloween", ["🎃", "👻", "💀"]],
  ["heart", ["❤️", "🧡", "💛", "💚", "💙", "💜"]],
  ["star", ["⭐", "🌟", "✨"]],
  ["check", ["✅", "✔️"]],
  ["warning", ["⚠️"]],
  ["question", ["❓", "❔"]],
  ["bell", ["🔔"]],
  ["recycle", ["♻️"]],
  ["sport", ["⚽", "🏀", "🎾", "🏈"]],
  ["ball", ["⚽", "🏀", "⚾", "🎾", "🏐"]],
  ["music", ["🎵", "🎶", "🎸", "🎹", "🥁", "🎤"]],
  ["guitar", ["🎸"]],
  ["art", ["🎨", "🖌️", "🖍️"]],
  ["baby", ["👶", "🍼"]],
  ["kid", ["👧", "👦", "🧒"]],
  ["person", ["🧑", "👩", "👨"]],
];

/** Build a reverse index: emoji → keywords (for display/debug) and term → emojis. */
const TERM_TO_EMOJIS = new Map<string, Set<string>>();
for (const [term, emojis] of SEARCH_TERMS) {
  const set = TERM_TO_EMOJIS.get(term) ?? new Set<string>();
  for (const e of emojis) set.add(e);
  TERM_TO_EMOJIS.set(term, set);
}

/**
 * Filter the palette by a free-text query. Matches group labels, emoji
 * characters themselves, and keyword terms (e.g. "hammer", "dog").
 */
export function filterEmojiGroups(query: string): EmojiGroup[] {
  const q = query.trim().toLowerCase();
  if (!q) return EMOJI_GROUPS;

  // If the query itself is/contains emoji glyphs, match those directly.
  const queryEmojis = Array.from(q).filter((ch) => ch.length > 0 && !/\s|[a-z0-9_-]/i.test(ch));

  const matchedFromTerms = new Set<string>();
  for (const [term, emojis] of TERM_TO_EMOJIS) {
    if (term.includes(q) || q.includes(term)) {
      for (const e of emojis) matchedFromTerms.add(e);
    }
  }

  return EMOJI_GROUPS.map((group) => {
    const labelHit = group.label.toLowerCase().includes(q);
    const emojis = group.emojis.filter((emoji) => {
      if (labelHit) return true;
      if (queryEmojis.some((ge) => emoji.includes(ge))) return true;
      if (matchedFromTerms.has(emoji)) return true;
      if (emoji.includes(q)) return true;
      return false;
    });
    return { ...group, emojis };
  }).filter((g) => g.emojis.length > 0);
}

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

  // Pets / extras common around the house
  ["dog", "🐶"],
  ["cat", "🐱"],
  ["pet food", "🦴"],
  ["leash", "🦮"],
  ["plant", "🪴"],
  ["flower", "🌸"],
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
  ["pet", "🐾"],
  ["animal", "🐾"],
  ["plant", "🪴"],
  ["food", "🍴"],
  ["sport", "⚽"],
  ["travel", "✈️"],
  ["cloth", "👕"],
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