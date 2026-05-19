/* global React */
// ============================================================
// DEADSTOCK — Product data
// ============================================================

const PRODUCTS = {
  broadman: {
    id: "broadman",
    name: "Broadman",
    archetype: "TELE-STYLE / SINGLE-CUT",
    serial: "DS-BRD-001",
    year: "MMXXVI",
    price: "$7,000",
    weight: "7.4 lb",
    finish: "Nitro / Butterscotch",
    pickups: "Handwound A2 Single Coils",
    lede: "Raw, honest, punchy. A working instrument that earns its scratches. Built like a tank, plays like a memory.",
    archetypeLong: "Our take on the '52 archetype — re-cut, re-weighed, re-wound. Nothing is added that wouldn't be missed.",
    swatches: [
      { name: "Butterscotch",     hex: "#C49545" },
      { name: "Walnut Black",     hex: "#2A1D14" },
      { name: "Cream Worn",       hex: "#E8DBB8" },
      { name: "Tobacco Burst",    hex: "#7A4A20" },
    ],
    story: {
      heading: "Built for the players who never stopped playing.",
      problem: "Big brands sand the edges off until everything sounds the same. Polished, predictable, polite. We wanted the opposite — a guitar that pushes back, with the chime and snap a Tele was supposed to have before quality control became a focus group.",
      solution: "The Broadman is utilitarian by design. The body is one piece of locally‑sourced ash whenever the tree gives us one; two pieces only when honesty demands it. The nitro finish is thin so the wood can breathe and age. The pickups are wound a quarter‑turn hotter than spec because that's where the magic lives.",
      pull: "It's not a tribute. It's the guitar that should have been built all along.",
    },
    specs: {
      body: [
        { k: "Wood",        v: "Locally sourced Northern Ash", note: "Single piece when grain allows — 2 piece otherwise. Honest." },
        { k: "Finish",      v: "Nitrocellulose, 8 thin coats",  note: "Hand‑rubbed satin. Designed to wear in, not wear out.", flag: "FUTURE VINTAGE" },
        { k: "Construction",v: "Bolt‑on, 4 screws + neck plate", note: "Vintage spec. Held together by tension and tradition." },
        { k: "Weight",      v: "7.2 – 7.6 lb", note: "Hand‑selected billets. We weigh every blank." },
        { k: "Contour",     v: "Flat top, vintage edge radius", note: "Sits where your forearm wants it." },
      ],
      neck: [
        { k: "Profile",     v: "Soft 'V' to medium 'C' — taper", note: "Thicker at the nut, slimmer at the heel." },
        { k: "Wood",        v: "Quarter‑sawn Hard Maple", note: "Stable. Snappy. Sounds like an old porch." },
        { k: "Fretboard",   v: "9.5\" radius / Maple, one piece", note: "No skunk stripe. Steel rod set from the front, plugged and oiled." },
        { k: "Frets",       v: "21 / Medium‑Jumbo Nickel Silver", note: "Hand‑dressed and crowned." },
        { k: "Nut",         v: "Unbleached Bone, hand cut", note: "Slotted on a per‑guitar basis to a 0.022\" string set.", flag: "TACTILE" },
        { k: "Scale",       v: "25.5\"", note: "Vintage geometry, modern tolerance." },
      ],
      electronics: [
        { k: "Bridge PU",   v: "Deadstock A2 'Iron Lung'", note: "Plain enamel 42 AWG, 8.6k. Wound by hand in Indiana.", flag: "HANDWOUND" },
        { k: "Neck PU",     v: "Deadstock A5 'Whisper'",   note: "Formvar, lacquer‑dipped. 7.1k. Warm but never woolly." },
        { k: "Wiring",      v: "Cloth‑covered, 50s style", note: "CTS 250k pots, .047uF Jensen paper‑in‑oil." },
        { k: "Switching",   v: "CRL 3‑way, treble bleed", note: "Volume sweep keeps its top end. The taper you want." },
        { k: "Output Jack", v: "Pure Tone mono",          note: "Two contact points. No more crackle." },
      ],
      hardware: [
        { k: "Bridge",      v: "Steel ashtray, 3 brass saddles", note: "Aged in‑house. Compensated for modern intonation.", flag: "AGED" },
        { k: "Tuners",      v: "Kluson‑style, vintage‑oval",     note: "15:1 ratio. Quiet. Reliable." },
        { k: "Knobs",       v: "Dome — knurled steel",            note: "Real metal. They get a patina; that's the point." },
        { k: "Strap Buttons",v: "Locking, satin nickel",           note: "We won't ship a guitar that can hit the floor." },
        { k: "Plate",       v: "Engraved serial + builder mark",  note: "Initials of the maker. Year. Hand stamped." },
      ],
    },
    craft: {
      titleA: "The feel of nitro that hasn't lied to you.",
      bodyA: "Thin, hand‑rubbed, slightly soft. Press a thumbnail into the top and it remembers — exactly the way an instrument should. The lacquer breathes with the wood, checks where it wants to, and earns the player's hands over months, not minutes.",
      titleB: "Resonance you can feel through the neck.",
      bodyB: "The bone nut is cut from unbleached stock — never plastic, never composite — and dressed to each string gauge by hand. Open chords ring into the headstock the way they're supposed to. Vibration travels. The guitar tells you it's alive before you plug it in.",
      tactile: [
        { k: "FINISH",      v: "8 thin coats, hand‑rubbed nitro. Designed to wear, check and tell a story." },
        { k: "NUT",         v: "Unbleached bone, slotted per string set." },
        { k: "HARDWARE",    v: "Aged in‑house in saltwater + vinegar. No two are alike." },
        { k: "FRETWORK",    v: "Plek‑checked, then hand‑dressed by a single tech." },
      ],
    },
    build: {
      bench: "Bench 03 — Maker: J. Halberd",
      time: "11 weeks, 60 hours of human work",
      run:  "Built 2026 · Fortville, IN",
    }
  },

  wayfarer: {
    id: "wayfarer",
    name: "Wayfarer",
    archetype: "STRAT-STYLE / DOUBLE-CUT",
    serial: "DS-WAY-001",
    year: "MMXXVI",
    price: "$7,000",
    weight: "7.6 lb",
    finish: "Nitro / Sea Foam Worn",
    pickups: "Handwound A5 Single Coils",
    lede: "Ergonomic, fluid, versatile. The road‑tested partner — built to disappear in your hands so the song doesn't.",
    archetypeLong: "Our take on the double‑cut. Lighter on the lap, deeper in the contour. Made for hours, not minutes.",
    swatches: [
      { name: "Sea Foam Worn",  hex: "#B7C9B5" },
      { name: "Tobacco Burst",  hex: "#7A4A20" },
      { name: "Black Nitro",    hex: "#121212" },
      { name: "Cream Worn",     hex: "#E8DBB8" },
    ],
    story: {
      heading: "A double‑cut that gets out of your way.",
      problem: "Most modern Strats are precise to the point of cold. We love the architecture — the contours, the trio of pickups, the long sustain. We just wanted one that felt loved before you opened the case.",
      solution: "The Wayfarer's contours are deeper than spec. The neck heel is rolled back so your hand can live at the 17th fret. The trem is hand‑set and floats true. The middle pickup is reverse‑wound; positions 2 and 4 hum‑cancel without losing the bell.",
      pull: "The road shouldn't take more from you than it gives back. This one gives back.",
    },
    specs: {
      body: [
        { k: "Wood",         v: "Two‑piece Alder, book‑matched", note: "Light, resonant, transparent. The classic recipe, done right." },
        { k: "Finish",       v: "Nitrocellulose, 7 thin coats",   note: "Sea Foam Worn aged at the bench, by hand.", flag: "FUTURE VINTAGE" },
        { k: "Construction", v: "Bolt‑on, contoured heel",        note: "Rolled for upper‑fret access without losing tone." },
        { k: "Weight",       v: "7.4 – 7.8 lb",                    note: "Selected for sustain, balanced on a strap." },
        { k: "Contour",      v: "Deep belly + forearm",            note: "Half a millimeter past vintage spec. You'll feel it." },
      ],
      neck: [
        { k: "Profile",     v: "Modern 'C' — 21.3mm → 23.9mm", note: "Slim but not skinny. Stays comfortable for hours." },
        { k: "Wood",        v: "Roasted Flame Maple", note: "Torrefied for stability. Dries the sound just slightly." },
        { k: "Fretboard",   v: "12\" radius / Indian Rosewood", note: "Oiled, never lacquered. Lets the wood move." },
        { k: "Frets",       v: "22 / Stainless Steel, jumbo", note: "Polished to a mirror. They'll outlast the wood." },
        { k: "Nut",         v: "Unbleached Bone, hand cut", note: "Cut per string set. Bone, never composite.", flag: "TACTILE" },
        { k: "Scale",       v: "25.5\"", note: "Standard scale. Honest tension." },
      ],
      electronics: [
        { k: "Bridge PU",   v: "Deadstock A5 'Highway'", note: "Heavy formvar, 6.4k. Bell‑like with bite when pushed.", flag: "HANDWOUND" },
        { k: "Middle PU",   v: "Deadstock A5 'Atlas' RW/RP", note: "Reverse‑wound, reverse‑polarity. Quiet in the 2 + 4." },
        { k: "Neck PU",     v: "Deadstock A2 'Lantern'", note: "Plain enamel 42 AWG, 5.8k. Warm, vocal, never muddy." },
        { k: "Wiring",      v: "Vintage cloth, modern shielding", note: "CTS 250k, 0.047uF Sprague Orange Drop." },
        { k: "Switching",   v: "5‑way + treble bleed", note: "Volume keeps its top. No tone roll‑off at full." },
      ],
      hardware: [
        { k: "Bridge",      v: "Vintage 6‑screw tremolo, steel block", note: "Cold‑rolled steel block. Hand‑set float at 2 semitones up.", flag: "AGED" },
        { k: "Tuners",      v: "Locking, staggered post",                note: "18:1 ratio. Faster strings changes, fewer headaches." },
        { k: "Knobs",       v: "Aged ivoroid, knurled",                  note: "Slightly distressed in‑house. They look earned." },
        { k: "Strap Buttons",v: "Locking, satin nickel",                  note: "Never trust an unlocked button on a long flight." },
        { k: "Plate",       v: "Engraved serial + builder mark",         note: "Initials of the maker. Year. Hand stamped." },
      ],
    },
    craft: {
      titleA: "Contours your hand will forget about.",
      bodyA: "We took a half‑millimeter past vintage spec in the forearm and belly cuts. It sounds small. It isn't. Three hours into a set, your shoulder will thank us. The lacquer is rubbed thin where the strap meets the body, so the guitar wears with you, not against you.",
      titleB: "A trem that floats and stays in tune.",
      bodyB: "Hand‑set at the bench, two semitones up. The block is cold‑rolled steel, the screws torqued and broken in before they ship. Bone nut cut to match the string set. Locking staggered tuners. The Wayfarer comes back to pitch — every time, for years.",
      tactile: [
        { k: "FINISH",   v: "Aged at the bench. No two Sea Foams are alike." },
        { k: "NECK",     v: "Roasted, rolled, oiled. Dries the sound; opens the feel." },
        { k: "TREM",     v: "Hand‑floated. Cold‑rolled steel block." },
        { k: "FRETWORK", v: "Stainless steel, mirror polished by hand." },
      ],
    },
    build: {
      bench: "Bench 02 — Maker: A. Reyes",
      time: "13 weeks, 72 hours of human work",
      run:  "Built 2026 · Fortville, IN",
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
    archetype: "TELE-STYLE / SINGLE-CUT",
    serial: "DS-BRD-001",
    price: "FROM $2,890",
    blurb: "Raw, honest, punchy. A working instrument that earns its scratches. Built like a tank.",
    swatches: ["#C49545", "#2A1D14", "#E8DBB8", "#7A4A20"],
    status: "AVAILABLE",
    image: "assets/broadman.jpg",
    imagePos: "55% 50%",
  },
  {
    id: "wayfarer",
    name: "Wayfarer",
    archetype: "STRAT-STYLE / DOUBLE-CUT",
    serial: "DS-WAY-001",
    price: "FROM $3,140",
    blurb: "Ergonomic, fluid, versatile. The road-tested partner — built to disappear in your hands so the song doesn't.",
    swatches: ["#B7C9B5", "#7A4A20", "#121212", "#E8DBB8"],
    status: "AVAILABLE",
    image: "assets/wayfarer.jpg",
    imagePos: "55% 55%",
  },
];

window.PRODUCTS = PRODUCTS;
window.SOURCES = SOURCES;
window.LINEUP = LINEUP;
