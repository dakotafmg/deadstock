/* global React */
// ============================================================
// DEADSTOCK — Product data
// ============================================================

const PRODUCTS = {
  broadman: {
    id: "broadman",
    name: "Broadman",
    archetype: "SINGLE-CUT",
    serial: "DS26001",
    year: "MMXXVI",
    price: "$7,000",
    finish: "Nitro",
    pickups: "Handwound A3 Single Coils",
    lede: "Raw, honest, punchy. A working instrument that earns its scratches. Built like a tank, plays like a memory.",
    swatches: [
      { name: "Shell Pink",    hex: "#F2B8BC" },
      { name: "Black",         hex: "#1C1C1C" },
      { name: "Sunburst",      hex: "#7A3B10" },
      { name: "Butterscotch",  hex: "#D4A029" },
      { name: "Sonic Blue",    hex: "#6DB3BD" },
      { name: "Seafoam Green", hex: "#93C5B5" },
      { name: "Blonde",        hex: "#F2E0A6" },
    ],
    images: [
      "assets/PinkBroadman-1.jpg",
      "assets/PinkBroadman-2.jpg",
      "assets/PinkBroadman-3.jpg",
      "assets/PinkBroadman-4.jpg",
      "assets/PinkBroadman-5.jpg",
      "assets/PinkBroadman-6.jpg",
      "assets/PinkBroadman-7.jpg",
      "assets/PinkBroadman-8.jpg",
      "assets/PinkBroadman-9.jpg",
      "assets/PinkBroadman-10.jpg",
    ],
    story: {
      heading: "Built for the players who never stopped playing.",
      problem: "Big brands sand the edges off until everything sounds the same. Polished, predictable, polite. We wanted the opposite — a guitar that pushes back, with the chime and snap a single-cut was supposed to have before quality control became a focus group.",
      solution: "The Broadman is utilitarian by design. The body is 2‑piece Swamp Ash with a solid Swamp Ash top — the nitro finish is kept thin so the wood can breathe and age. The pickups are wound a quarter‑turn hotter than spec.",
      pull: "It's not a tribute. It's the guitar that should have been built all along.",
    },
    specs: {
      body: [
        { k: "Wood",        v: "2‑piece Swamp Ash, solid top — Ohio, USA" },
        { k: "Finish",      v: "Nitrocellulose, 8 thin coats" },
        { k: "Construction",v: "Bolt‑on, 4 screws + neck plate" },
        { k: "Contour",     v: "Flat top, vintage edge radius" },
      ],
      neck: [
        { k: "Profile",     v: "Soft 'V' to medium 'C' — taper" },
        { k: "Wood",        v: "Quarter‑sawn Hard Maple" },
        { k: "Fretboard",   v: "9.5\" radius / Maple, one piece" },
        { k: "Frets",       v: "21 / Medium‑Jumbo Nickel Silver" },
        { k: "Nut",         v: "Unbleached Bone, hand cut" },
        { k: "Scale",       v: "25.5\"" },
      ],
      electronics: [
        { k: "Bridge PU",   v: "Deadstock A3 'Iron Lung' — 42 AWG plain enamel, 8.6kΩ" },
        { k: "Neck PU",     v: "Deadstock A3 'Whisper' — Formvar, lacquer‑dipped, 7.1kΩ" },
        { k: "Wiring",      v: "Cloth‑covered, 50s style — CTS 250k pots, .047uF Jensen paper‑in‑oil" },
        { k: "Switching",   v: "CRL 3‑way, treble bleed" },
        { k: "Output Jack", v: "Pure Tone mono" },
      ],
      hardware: [
        { k: "Bridge",       v: "Steel ashtray, 3 brass saddles — aged in‑house" },
        { k: "Tuners",       v: "Kluson‑style, vintage‑oval — 15:1 ratio" },
        { k: "Knobs",        v: "Dome — knurled steel" },
        { k: "Strap Buttons",v: "Locking, satin nickel" },
        { k: "Plate",        v: "Engraved serial + builder mark" },
      ],
    },
    build: {
      run: "Built 2026 · Fortville, IN",
    }
  },

  wayfarer: {
    id: "wayfarer",
    name: "Wayfarer",
    archetype: "DOUBLE-CUT",
    serial: "DS26002",
    year: "MMXXVI",
    price: "$7,000",
    finish: "Nitro",
    pickups: "Handwound A5 Single Coils",
    lede: "Ergonomic, fluid, versatile. The road‑tested partner built to disappear in your hands so the song doesn't.",
    swatches: [
      { name: "Sunburst",       hex: "#7A3B10" },
      { name: "Black",          hex: "#1C1C1C" },
      { name: "Olympic White",  hex: "#F2F0E6" },
      { name: "Mary Kay",       hex: "#E8D5A3" },
      { name: "Lake Placid Blue", hex: "#699FB8" },
      { name: "Shell Pink",     hex: "#F2B8BC" },
      { name: "Aztec Gold",     hex: "#C4893A" },
      { name: "2-Tone Sunburst", hex: "#5C2800" },
    ],
    images: [
      "assets/Wayfarer-1.jpg",
      "assets/Wayfarer-2.jpg",
      "assets/Wayfarer-3.jpg",
      "assets/Wayfarer-4.jpg",
      "assets/Wayfarer-5.jpg",
      "assets/Wayfarer-6.jpg",
      "assets/Wayfarer-7.jpg",
    ],
    story: {
      heading: "A double‑cut that gets out of your way.",
      problem: "Most modern double-cuts are precise to the point of cold. We love the architecture — the contours, the trio of pickups, the long sustain. We just wanted one that felt loved before you opened the case.",
      solution: "The Wayfarer's contours are deeper than spec. The neck heel is rolled back so your hand can live at the 17th fret. The trem is hand‑set and floats true. The middle pickup is reverse‑wound; positions 2 and 4 hum‑cancel without losing the bell.",
      pull: "The road shouldn't take more from you than it gives back. This one gives back.",
    },
    specs: {
      body: [
        { k: "Wood",         v: "Locally sourced — Ohio, USA" },
        { k: "Finish",       v: "Nitrocellulose" },
        { k: "Construction", v: "Bolt‑on, contoured heel" },
        { k: "Contour",      v: "Deep belly + forearm" },
      ],
      neck: [
        { k: "Profile",     v: "Modern 'C' — 21.3mm → 23.9mm" },
        { k: "Wood",        v: "Roasted Flame Maple" },
        { k: "Fretboard",   v: "12\" radius / Indian Rosewood" },
        { k: "Frets",       v: "22 / Stainless Steel, jumbo" },
        { k: "Nut",         v: "Unbleached Bone, hand cut" },
        { k: "Scale",       v: "25.5\"" },
      ],
      electronics: [
        { k: "Bridge PU",   v: "Deadstock A5 'Highway' — Heavy formvar, 6.4kΩ" },
        { k: "Middle PU",   v: "Deadstock A5 'Atlas' RW/RP — reverse‑wound, reverse‑polarity" },
        { k: "Neck PU",     v: "Deadstock A2 'Lantern' — 42 AWG plain enamel, 5.8kΩ" },
        { k: "Wiring",      v: "Vintage cloth, modern shielding — CTS 250k, 0.047uF Sprague Orange Drop" },
        { k: "Switching",   v: "5‑way + treble bleed" },
      ],
      hardware: [
        { k: "Bridge",       v: "Vintage 6‑screw tremolo, cold‑rolled steel block" },
        { k: "Tuners",       v: "Locking, staggered post — 18:1 ratio" },
        { k: "Knobs",        v: "Aged ivoroid, knurled" },
        { k: "Strap Buttons",v: "Locking, satin nickel" },
        { k: "Plate",        v: "Engraved serial + builder mark" },
      ],
    },
    build: {
      run: "Built 2026 · Fortville, IN",
    }
  }
};

// Sources table for transparency block
const SOURCES = [
  { what: "Northern Ash",        who: "Pavlik Lumber Co.",    where: "Saxonburg, PA",    miles: "112 mi",  cat: "WOOD" },
  { what: "Quarter-sawn Maple",  who: "North River Hardwoods", where: "Cooperstown, NY",  miles: "284 mi",  cat: "WOOD" },
  { what: "Indian Rosewood",     who: "Allied Lutherie",       where: "Healdsburg, CA",   miles: "2,680 mi", cat: "WOOD" },
  { what: "Handwound A2/A5 PUs", who: "M. Halloran",           where: "Pittsburgh, PA",   miles: "38 mi",   cat: "ELECTRONICS" },
  { what: "Cloth-covered Wire",  who: "Gavitt Wire & Cable",   where: "Brookfield, MA",   miles: "496 mi",  cat: "ELECTRONICS" },
  { what: "Bone Nut Blanks",     who: "Stewart-MacDonald",     where: "Athens, OH",       miles: "188 mi",  cat: "TACTILE" },
  { what: "Steel Tremolo Blocks",who: "Callaham Guitars",      where: "Winchester, VA",   miles: "302 mi",  cat: "HARDWARE" },
];

// Models for the lineup grid
const LINEUP = [
  {
    id: "broadman",
    name: "Broadman",
    archetype: "SINGLE-CUT",
    serial: "DS26001",
    price: "$7,000",
    blurb: "Raw, honest, punchy. A working instrument that earns its scratches. Built like a tank.",
    swatches: ["#F2B8BC"],
    status: "AVAILABLE",
    image: "assets/PinkBroadman-1.jpg",
    imagePos: "55% 50%",
  },
  {
    id: "wayfarer",
    name: "Wayfarer",
    archetype: "DOUBLE-CUT",
    serial: "DS26002",
    price: "$7,000",
    blurb: "Ergonomic, fluid, versatile. The road-tested partner — built to disappear in your hands so the song doesn't.",
    swatches: [],
    status: "AVAILABLE",
    image: "assets/Wayfarer-1.jpg",
    imagePos: "55% 55%",
  },
  {
    id: "monarch",
    name: "Monarch",
    archetype: "OFFSET / IN DEVELOPMENT",
    serial: "DS-MON-001",
    price: "Coming soon",
    blurb: "A premium offset, in development. Carved top, back bolt-on neck, a pair of handwound humbuckers wound for clarity.",
    swatches: ["#3B2A1E", "#D28400"],
    status: "COMING-SOON",
    image: null,
  },
];

// ============================================================
// PICKUP PRODUCTS
// ============================================================
const PICKUPS = {
  tele52: {
    id: "tele52",
    name: "'52 Tele Set",
    type: "SINGLE-COIL / TELE",
    serial: "DS-PU-T52",
    year: "MMXXVI",
    price: "$270",
    magnet: "A3 neck / A5 bridge",
    wind: "Plain enamel, flat-pole, hand-scatter wound",
    images: [
      "assets/Tele52-1.jpg",
      "assets/Tele52-2.jpg",
      "assets/Tele52-3.jpg",
      "assets/Tele52-4.jpg",
      "assets/Tele52-5.jpg",
    ],
    lede: "The pickup that started it all. Flat-pole design, low output between 6k–7k — wound to bring your Tele back to its 1952 glory.",
    story: {
      heading: "The pickup that haunts you in your sleep.",
      problem: "Our head luthier has owned every variation of the Telecaster you can think of — original no-casters to modern Tele Pros. The sound of the flat-pole Tele pickup is the one he keeps chasing. No modern mass-wound pickup gets there.",
      solution: "This is as close to his original 1952 Telecaster as we can wind. Flat-pole design, low output between 6k–7k, hand-scatter wound. Not hot. Not scooped. Just the real thing.",
      pull: "Tired of your Tele sounding like a Tele-shaped object? This is the fix.",
    },
    specs: {
      bridge: [
        { k: "Magnet",        v: "Alnico V rods, flat-pole" },
        { k: "Wire",          v: "42 AWG plain enamel" },
        { k: "DC Resistance", v: "6k–7k Ω" },
        { k: "Wind",          v: "Hand-scatter wound" },
        { k: "Bobbin",        v: "Fiber, period-correct" },
        { k: "Cover",         v: "Brass, aged in-house" },
      ],
      neck: [
        { k: "Magnet",        v: "Alnico III rods, flat-pole" },
        { k: "Wire",          v: "42 AWG plain enamel" },
        { k: "DC Resistance", v: "6k–7k Ω" },
        { k: "Wind",          v: "Hand-scatter wound" },
        { k: "Bobbin",        v: "Fiber, period-correct" },
        { k: "Cover",         v: "Aged nickel" },
      ],
    },
    foundIn: "broadman",
  },

  strat62: {
    id: "strat62",
    name: "'62 Strat Set",
    type: "SINGLE-COIL / STRAT",
    serial: "DS-PU-S62",
    year: "MMXXVI",
    price: "$290",
    magnet: "A5 — Alnico V",
    wind: "Formvar, hand-scatter wound",
    images: [
      "assets/Strat62-1.jpg",
      "assets/Strat62-2.jpg",
      "assets/Strat62-3.jpg",
    ],
    lede: "Slightly scooped mids, excited highs, full lows. The pre-CBS Strat sound that everyone talks about — tested against slab-board Strats to get it right.",
    story: {
      heading: "All the glorious things you hear about the early '60s.",
      problem: "If you're tired of your Strat feeling a little bland — here's your wake-up call. Most modern sets chase 'vintage' but miss what made pre-CBS pickups special: those slightly scooped mids, the excited highs, the low end that doesn't disappear.",
      solution: "We tested this design against several slab-board Strats over the years. A5 rods throughout, Formvar wire for that glassy top, RWRP middle for hum-cancelling positions 2 and 4. It falls perfectly into a '62.",
      pull: "Let us fix it.",
    },
    specs: {
      bridge: [
        { k: "Magnet",        v: "Alnico V rods" },
        { k: "Wire",          v: "42 AWG Formvar" },
        { k: "DC Resistance", v: "~6.5 kΩ" },
        { k: "Wind",          v: "Hand-scatter wound" },
        { k: "Polarity",      v: "Standard" },
      ],
      middle: [
        { k: "Magnet",        v: "Alnico V rods" },
        { k: "Wire",          v: "42 AWG Formvar" },
        { k: "DC Resistance", v: "~6.2 kΩ" },
        { k: "Wind",          v: "Hand-scatter wound, RWRP" },
        { k: "Polarity",      v: "Reverse-wound / reverse-polarity" },
      ],
      neck: [
        { k: "Magnet",        v: "Alnico V rods" },
        { k: "Wire",          v: "42 AWG Formvar" },
        { k: "DC Resistance", v: "~5.8 kΩ" },
        { k: "Wind",          v: "Hand-scatter wound" },
        { k: "Polarity",      v: "Standard" },
      ],
    },
    foundIn: "wayfarer",
  },

  paf: {
    id: "paf",
    name: "PAF Set",
    type: "HUMBUCKER",
    serial: "DS-PU-PAF",
    year: "MMXXVI",
    price: "$350",
    magnet: "A2 — Alnico II",
    wind: "Plain enamel, hand-scatter wound",
    images: [
      "assets/PAF-1.jpg",
      "assets/PAF-2.jpg",
      "assets/PAF-3.jpg",
    ],
    lede: "One of the most coveted pickups on earth. Original PAFs run thousands — if you can find one. Our faithful recreation gets you there.",
    story: {
      heading: "Welcome to the most coveted pickup on earth.",
      problem: "Original PAFs run thousands of dollars if you can even find one. Most 'recreations' get the output right and miss everything else — the scatter, the variation between coils, the way they breathe.",
      solution: "A2 bar magnets, hand-scatter wound on a slow machine with mismatched coil winds — the same variation the originals had. Nickel covers that will age on the guitar. Wound to archive the PAF goal in a more reasonable fashion.",
      pull: "You don't have to spend thousands to hear what all the fuss is about.",
    },
    specs: {
      bridge: [
        { k: "Magnet",        v: "Alnico II bar" },
        { k: "Wire",          v: "42 AWG plain enamel" },
        { k: "DC Resistance", v: "~8.5 kΩ" },
        { k: "Wind",          v: "Hand-scatter, mismatched coils" },
        { k: "Cover",         v: "Aged nickel, no potting" },
      ],
      neck: [
        { k: "Magnet",        v: "Alnico II bar" },
        { k: "Wire",          v: "42 AWG plain enamel" },
        { k: "DC Resistance", v: "~7.8 kΩ" },
        { k: "Wind",          v: "Hand-scatter, mismatched coils" },
        { k: "Cover",         v: "Aged nickel, no potting" },
      ],
    },
    foundIn: "monarch",
  },
};

const PICKUP_LINEUP = [
  {
    id: "tele52",
    name: "'52 Tele Set",
    type: "SINGLE-COIL / TELE",
    price: "$270",
    blurb: "Flat-pole design, 6k–7k output. As close to an original '52 Tele as we can wind it.",
    magnet: "A3 neck / A5 bridge",
    thumb: "assets/Tele52-1.jpg",
    foundIn: "broadman",
  },
  {
    id: "strat62",
    name: "'62 Strat Set",
    type: "SINGLE-COIL / STRAT",
    price: "$290",
    blurb: "Slightly scooped mids, excited highs, full lows. The pre-CBS Strat sound — tested against slab-board Strats.",
    magnet: "Alnico V",
    thumb: "assets/Strat62-1.jpg",
    foundIn: "wayfarer",
  },
  {
    id: "paf",
    name: "PAF Set",
    type: "HUMBUCKER",
    price: "$350",
    blurb: "One of the most coveted pickups on earth. Faithful recreation. A2 bar magnets, mismatched coils, aged nickel covers.",
    magnet: "Alnico II",
    thumb: "assets/PAF-1.jpg",
    foundIn: "monarch",
  },
];

window.PRODUCTS = PRODUCTS;
window.SOURCES = SOURCES;
window.LINEUP = LINEUP;
window.PICKUPS = PICKUPS;
window.PICKUP_LINEUP = PICKUP_LINEUP;
