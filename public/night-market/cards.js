// Night Market: the six characters, their powers and their original card art (shared by the table and the rule book).
export const CHARS = {
  peddler: { name: "Peddler", power: "Take 3 coins from the bank.", hue: "#E8A33D", deep: "#5A2E0A" },
  pickpocket: { name: "Pickpocket", power: "Take up to 2 coins from another stallholder.", hue: "#9A7BFF", deep: "#24124F" },
  lamplighter: { name: "Lamplighter", power: "Take everything in the lantern pot.", hue: "#FF6A3D", deep: "#4F1206" },
  fortune: { name: "Fortune-teller", power: "Name a stallholder and a character. Hit: they pay you 3. Miss: you pay them 1.", hue: "#4FD1C5", deep: "#0A3A38" },
  fence: { name: "Fence", power: "Give one of your cards to another stallholder; take one of theirs at random.", hue: "#8CCB5E", deep: "#1C3A0E" },
  ferryman: { name: "Ferryman", power: "Draw 2 cards, keep any 2 of your 4, return the rest.", hue: "#6FA8FF", deep: "#0E2350" },
};
export const ORDER = ["peddler", "pickpocket", "lamplighter", "fortune", "fence", "ferryman"];

const ART = {
  peddler: (h) => `<path d="M30 112 h100 l-10 30 h-80 Z" fill="#6A3A14"/><path d="M36 112 q44 -40 88 0" fill="none" stroke="#A86A2A" stroke-width="5"/>
    <circle cx="52" cy="104" r="12" fill="#E84A3A"/><circle cx="74" cy="100" r="13" fill="${h}"/><circle cx="96" cy="104" r="12" fill="#8CCB5E"/><circle cx="110" cy="108" r="9" fill="#F2D06B"/>
    <circle cx="50" cy="146" r="9" fill="#2A1A0A" stroke="#A86A2A" stroke-width="3"/><circle cx="110" cy="146" r="9" fill="#2A1A0A" stroke="#A86A2A" stroke-width="3"/>
    <path d="M80 50 v26" stroke="#A86A2A" stroke-width="3"/><path d="M62 76 h36" stroke="#A86A2A" stroke-width="3"/><path d="M62 76 l-8 14 h16 Z M98 76 l-8 14 h16 Z" fill="${h}"/>`,
  pickpocket: (h) => `<path d="M40 140 C 60 120, 70 100, 92 96 C 104 94, 112 104, 104 110 L 86 114" fill="#1A1030" stroke="${h}" stroke-width="3"/>
    <path d="M92 96 l14 -8 M96 100 l16 -4 M98 106 l16 2" stroke="${h}" stroke-width="3" stroke-linecap="round"/>
    <path d="M98 64 q16 -6 30 0 q8 24 -14 32 q-24 -6 -16 -32 Z" fill="#7A4A2A"/><path d="M102 64 q12 -10 22 0" fill="none" stroke="#3A1A0A" stroke-width="3"/>
    <circle cx="114" cy="82" r="6" fill="#F2D06B"/><circle cx="60" cy="60" r="3" fill="${h}"/><circle cx="46" cy="80" r="2" fill="${h}"/><circle cx="130" cy="46" r="2" fill="${h}"/>`,
  lamplighter: (h) => `<path d="M80 150 V60" stroke="#3A2A1A" stroke-width="5"/><path d="M80 60 h26 v10" stroke="#3A2A1A" stroke-width="4" fill="none"/>
    <circle cx="106" cy="98" r="34" fill="${h}" opacity=".18"/><rect x="94" y="72" width="24" height="34" rx="5" fill="#2A1A0A" stroke="#E8C46A" stroke-width="2"/>
    <path d="M106 100 c-8 -8 -2 -16 0 -22 c4 8 10 12 0 22 Z" fill="${h}"/><path d="M106 98 c-3 -3 -1 -7 0 -9 c2 3 4 6 0 9 Z" fill="#FFF2B0"/>
    <path d="M90 72 h32 l-6 -8 h-20 Z" fill="#E8C46A"/><path d="M52 150 h56" stroke="#3A2A1A" stroke-width="5"/>`,
  fortune: (h) => `<circle cx="80" cy="92" r="36" fill="${h}" opacity=".25"/><circle cx="80" cy="92" r="30" fill="#0A2A2A" stroke="${h}" stroke-width="3"/>
    <path d="M66 82 q14 -16 30 -2" fill="none" stroke="#E8FFFA" stroke-width="3" opacity=".6"/><path d="M70 100 l6 -10 l6 10 l8 -14" fill="none" stroke="${h}" stroke-width="2"/>
    <path d="M60 126 h40 l-6 14 h-28 Z" fill="#8A6A3A"/><path d="M50 144 h60" stroke="#8A6A3A" stroke-width="5"/>
    <path d="M40 50 l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3 l7 -3 Z M122 58 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2 l5 -2 Z" fill="#F2D06B"/>`,
  fence: (h) => `<rect x="40" y="86" width="80" height="58" fill="#7A5A30" stroke="#3A2A10" stroke-width="3"/><path d="M40 106 h80 M40 126 h80 M60 86 v58 M100 86 v58" stroke="#3A2A10" stroke-width="2"/>
    <path d="M40 86 l14 -20 h80 l-14 20 Z" fill="#9A7A40" stroke="#3A2A10" stroke-width="3"/><path d="M120 86 l14 -20 v58 l-14 20" fill="#5A4020" stroke="#3A2A10" stroke-width="3"/>
    <circle cx="80" cy="116" r="9" fill="${h}"/><rect x="77" y="116" width="6" height="14" fill="${h}"/><path d="M36 58 q20 -16 40 -4" stroke="${h}" stroke-width="3" fill="none" stroke-dasharray="4 5"/>`,
  ferryman: (h) => `<circle cx="116" cy="50" r="14" fill="#F2E6B0"/><circle cx="122" cy="46" r="13" fill="#0E2350"/>
    <path d="M24 126 q56 24 112 0 l-12 14 q-44 12 -88 0 Z" fill="#3A2A1A"/><path d="M60 126 V92" stroke="#3A2A1A" stroke-width="3"/><circle cx="60" cy="86" r="8" fill="#2A1A3A"/>
    <path d="M52 96 q8 -4 16 0 v26 h-16 Z" fill="#2A1A3A"/><path d="M68 100 L 112 146" stroke="#A86A2A" stroke-width="4"/>
    <path d="M14 146 q20 -8 40 0 t40 0 t40 0 t40 0" fill="none" stroke="${h}" stroke-width="3"/><path d="M4 156 q20 -8 40 0 t40 0 t40 0 t40 0" fill="none" stroke="${h}" stroke-width="2" opacity=".5"/>`,
};

export function card(key, { small = false, cls = "" } = {}) {
  const c = CHARS[key];
  if (!c) return back({ small, cls });
  return `<div class="card ${small ? "sm" : ""} ${cls}" style="--hue:${c.hue};--deep:${c.deep}" data-c="${key}">
    <div class="card-name">${c.name}</div>
    <svg viewBox="0 0 160 170" aria-hidden="true"><rect width="160" height="170" fill="url(#cardsky)"/>${ART[key](c.hue)}</svg>
    ${small ? "" : `<div class="card-power">${c.power}</div>`}</div>`;
}
export function back({ small = false, cls = "" } = {}) {
  return `<div class="card back ${small ? "sm" : ""} ${cls}"><svg viewBox="0 0 160 220" aria-hidden="true"><rect width="160" height="220" rx="8" fill="#1A1430"/>
    <rect x="10" y="10" width="140" height="200" rx="6" fill="none" stroke="#E8C46A" stroke-width="2"/>
    <g transform="translate(80 110)"><circle r="34" fill="#FF6A3D" opacity=".18"/><rect x="-14" y="-22" width="28" height="40" rx="8" fill="#E84A3A"/><path d="M-14 -10 h28 M-14 2 h28" stroke="#9A1A1A" stroke-width="2"/><path d="M-6 -22 v-8 h12 v8" fill="#E8C46A"/></g>
    <text x="80" y="190" text-anchor="middle" fill="#E8C46A" font-size="11" letter-spacing="3" font-family="serif">NIGHT MARKET</text></svg></div>`;
}
export const DEFS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><linearGradient id="cardsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#151A3A"/><stop offset="1" stop-color="#2A1E3A"/></linearGradient></defs></svg>`;
export const CARD_CSS = `
.card { --w: 150px; width: var(--w); border-radius: 12px; padding: 7px; background: linear-gradient(160deg, var(--hue), var(--deep)); box-shadow: 0 10px 24px rgba(0,0,0,.45), inset 0 0 0 2px rgba(255,255,255,.18); display: grid; gap: 6px; color: #FFF7E8; text-align: center; }
.card svg { width: 100%; height: auto; display: block; border-radius: 8px; }
.card-name { font: 700 15px "Cormorant SC", Georgia, serif; letter-spacing: .06em; text-shadow: 0 1px 2px rgba(0,0,0,.6); }
.card-power { font: 12.5px/1.3 "Nunito Sans", system-ui, sans-serif; background: rgba(0,0,0,.35); border-radius: 6px; padding: 6px; min-height: 4.2em; }
.card.sm { --w: 64px; padding: 3px; gap: 2px; border-radius: 7px; } .card.sm .card-name { font-size: 9px; letter-spacing: 0; }
.card.back { padding: 0; background: none; } .card.back svg { border-radius: 10px; }
`;
