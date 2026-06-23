/* ============================================================================
   ILLUSTRATIONS — monochrome line-art emblems (use stroke="currentColor")
   Rendered inside a liquid-glass tile tinted by the track accent.
   Keep viewBox 0 0 100 100 so they scale crisply at any size.
   ============================================================================ */

const ART = {
  charkha: `<circle cx="46" cy="46" r="26"/><line x1="46" y1="20" x2="46" y2="72"/><line x1="20" y1="46" x2="72" y2="46"/><line x1="28" y1="28" x2="64" y2="64"/><line x1="64" y1="28" x2="28" y2="64"/><circle cx="46" cy="46" r="4" fill="currentColor"/><path d="M46 72 L30 84 H80"/>`,
  crescent: `<path d="M64 22a30 30 0 1 0 0 56 24 24 0 1 1 0-56z"/><path d="M76 40l3 8 8 1-6 6 2 8-7-4-7 4 2-8-6-6 8-1z" fill="currentColor" stroke="none"/>`,
  split: `<circle cx="50" cy="16" r="5" fill="currentColor"/><path d="M50 21V44"/><path d="M50 44C50 60 32 62 26 84"/><path d="M50 44C50 60 68 62 74 84"/><circle cx="24" cy="86" r="5" fill="currentColor"/><circle cx="76" cy="86" r="5" fill="currentColor"/>`,
  scroll: `<path d="M32 20h32a6 6 0 0 1 6 6v52a6 6 0 0 1-6 6H32a6 6 0 0 1-6-6V26a6 6 0 0 1 6-6z"/><line x1="38" y1="36" x2="62" y2="36"/><line x1="38" y1="48" x2="62" y2="48"/><line x1="38" y1="60" x2="54" y2="60"/>`,
  train: `<rect x="26" y="22" width="48" height="44" rx="9"/><line x1="26" y1="46" x2="74" y2="46"/><circle cx="38" cy="57" r="4" fill="currentColor"/><circle cx="62" cy="57" r="4" fill="currentColor"/><path d="M34 66l-6 14"/><path d="M66 66l6 14"/><line x1="40" y1="80" x2="60" y2="80"/>`,
  assembly: `<path d="M50 14v22"/><path d="M50 16h22v12H50"/><circle cx="33" cy="52" r="7"/><circle cx="67" cy="52" r="7"/><path d="M21 84v-5a12 12 0 0 1 24 0"/><path d="M55 84v-5a12 12 0 0 1 24 0"/>`,
  link: `<rect x="18" y="40" width="40" height="20" rx="10"/><rect x="42" y="40" width="40" height="20" rx="10"/>`,
  seedling: `<path d="M50 84V46"/><path d="M50 58C36 58 28 47 28 34 44 34 50 45 50 56"/><path d="M50 50C64 50 72 39 72 26 56 26 50 37 50 48"/><path d="M40 84h20"/>`,
  flame: `<path d="M50 16c8 18 24 24 16 46a16 16 0 0 1-32 0C28 50 42 44 50 16z"/><path d="M50 46c4 8 8 10 4 18a8 8 0 0 1-8 0c-3-6 0-10 4-18z" fill="currentColor" stroke="none"/>`,
  fist: `<rect x="34" y="40" width="32" height="30" rx="8"/><path d="M40 40v-8a4 4 0 0 1 8 0v8"/><path d="M48 40V28a4 4 0 0 1 8 0v12"/><path d="M56 40v-8a4 4 0 0 1 8 0v8"/><path d="M34 52h-8a4 4 0 0 0 0 8h8"/><line x1="40" y1="70" x2="60" y2="70"/>`,
  salt: `<path d="M24 70h52"/><path d="M34 70c4-17 12-24 16-24s12 7 16 24"/><circle cx="44" cy="40" r="2.4" fill="currentColor" stroke="none"/><circle cx="56" cy="36" r="2.4" fill="currentColor" stroke="none"/><circle cx="50" cy="30" r="2.4" fill="currentColor" stroke="none"/><path d="M20 82q7-6 14 0t14 0 14 0 14 0"/>`,
  scales: `<path d="M50 18v56"/><path d="M30 74h40"/><line x1="26" y1="32" x2="74" y2="32"/><circle cx="50" cy="26" r="4" fill="currentColor"/><path d="M26 32l-8 16a10 10 0 0 0 16 0z"/><path d="M74 32l-8 16a10 10 0 0 0 16 0z"/>`,
  ballot: `<rect x="28" y="48" width="44" height="30" rx="4"/><rect x="42" y="48" width="16" height="6"/><path d="M50 22v18"/><path d="M44 34l6 6 6-6"/>`,
  flag: `<path d="M34 18v66"/><path d="M34 22c12-8 24 8 36 0v26c-12 8-24-8-36 0z"/><line x1="34" y1="33" x2="68" y2="30"/><line x1="34" y1="45" x2="70" y2="43"/>`,
  constitution: `<path d="M50 30C42 24 30 24 24 28v44c6-4 18-4 26 2 8-6 20-6 26-2V28c-6-4-18-4-26 6z"/><line x1="50" y1="36" x2="50" y2="76"/>`,
  ship: `<path d="M24 64h52l-8 14a6 6 0 0 1-5 3H37a6 6 0 0 1-5-3z"/><path d="M50 64V28"/><path d="M50 32l20 9-20 9z" fill="currentColor" stroke="none"/><line x1="40" y1="64" x2="40" y2="50"/>`,
  rifles: `<line x1="24" y1="76" x2="76" y2="24"/><line x1="76" y1="76" x2="24" y2="24"/><path d="M24 24l8-2"/><path d="M76 24l-8-2"/><circle cx="50" cy="50" r="5"/>`,
  helmet: `<path d="M20 56a30 24 0 0 1 60 0"/><path d="M14 56h72v7H14z"/><line x1="50" y1="30" x2="50" y2="39"/>`,
  redstar: `<path d="M50 16l10 26 28 1-22 17 8 27-24-15-24 15 8-27-22-17 28-1z" fill="currentColor" stroke="none"/>`,
  dove: `<path d="M22 58c12 2 20-3 26-14 3 14 13 19 28 15-7 13-22 19-34 12-4 7-13 9-19 4 5-2 5-7 0-9-5 1-7-4-1-8z"/><circle cx="72" cy="42" r="2" fill="currentColor" stroke="none"/>`,
  globe: `<circle cx="50" cy="50" r="28"/><ellipse cx="50" cy="50" rx="12" ry="28"/><line x1="22" y1="50" x2="78" y2="50"/><path d="M28 36h44"/><path d="M28 64h44"/>`,
  chartdown: `<path d="M24 26v50h52"/><path d="M32 42l14 14 10-8 20 20"/><path d="M76 56v12H64"/>`,
  brokenrifle: `<line x1="22" y1="74" x2="46" y2="48"/><line x1="56" y1="38" x2="78" y2="16"/><path d="M46 48l8 2-4 8z" fill="currentColor" stroke="none"/><line x1="22" y1="74" x2="30" y2="66"/>`,
  umbrella: `<path d="M20 50a30 30 0 0 1 60 0z"/><line x1="50" y1="50" x2="50" y2="76"/><path d="M50 76a7 7 0 0 0 14 0"/>`,
  tank: `<rect x="26" y="48" width="40" height="16" rx="4"/><circle cx="34" cy="72" r="6"/><circle cx="50" cy="72" r="6"/><circle cx="62" cy="72" r="6"/><path d="M40 48v-8h14v8"/><line x1="54" y1="44" x2="82" y2="44"/>`,
  explosion: `<path d="M50 16l7 16 16-9-7 18 18 4-18 7 9 16-18-9-7 16-7-16-18 9 9-16-18-7 18-4-7-18 16 9z" fill="currentColor" stroke="none"/>`,
  snow: `<line x1="50" y1="18" x2="50" y2="82"/><line x1="22" y1="34" x2="78" y2="66"/><line x1="78" y1="34" x2="22" y2="66"/><path d="M50 18l-7 9m7-9l7 9"/><path d="M50 82l-7-9m7 9l7-9"/><path d="M22 34l11-1m-11 1l1 11"/><path d="M78 66l-11 1m11-1l-1-11"/>`
};

/** Return a full <svg> string for an illustration key. */
function svgFor(key) {
  const body = ART[key] || ART.scroll;
  return `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
}

if (typeof module !== "undefined") { module.exports = { ART, svgFor }; }
