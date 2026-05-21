/* global React */
// ============================================================
// DEADSTOCK — Product data
// ============================================================

const PRODUCTS = {
  broadman: {
    id: "broadman",
    name: "Broadman",
    archetype: "SINGLE-CUT",
    serial: "DS-BRD-001",
    year: "MMXXVI",
    price: "$7,000",
    finish: "Nitro / Shell Pink",
    pickups: "Handwound A2 Single Coils",
    lede: "Raw, honest, punchy. A working instrument that earns its scratches. Built like a tank, plays like a memory.",
    swatches: [
      { name: "Shell Pink", hex: "#F2B8BC" },
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
      solution: "The Broadman is utilitarian by design. The body is locally‑sourced alder — the nitro finish is kept thin so the wood can breathe and age. The pickups are wound a quarter‑turn hotter than spec.",
      pull: "It's not a tribute. It's the guitar that should have been built all along.",
    },
    specs: {
      body: [
        { k: "Wood",        v: "Locally sourced Alder" },
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
        { k: "Bridge PU",   v: "Deadstock A2 'Iron Lung' — 42 AWG plain enamel, 8.6kΩ" },
        { k: "Neck PU",     v: "Deadstock A5 'Whisper' — Formvar, lacquer‑dipped, 7.1kΩ" },
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
    serial: "DS-WAY-001",
    year: "MMXXVI",
    price: "$7,000",
    finish: "Nitro / Sunburst",
    pickups: "Handwound A5 Single Coils",
    lede: "Ergonomic, fluid, versatile. The road‑tested partner — built to disappear in your hands so the song doesn't.",
    swatches: [
      { name: "Sunburst", hex: "#7A3B10" },
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
        { k: "Wood",         v: "Locally sourced Alder" },
        { k: "Finish",       v: "Nitrocellulose, 7 thin coats — Sunburst" },
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
    serial: "DS-BRD-001",
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
    serial: "DS-WAY-001",
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
    blurb: "A premium offset, in development. Carved top, bolt-on neck, a pair of handwound humbuckers wound for clarity.",
    swatches: ["#3B2A1E", "#D28400"],
    status: "COMING-SOON",
    image: null,
  },
];

window.PRODUCTS = PRODUCTS;
window.SOURCES = SOURCES;
window.LINEUP = LINEUP;
