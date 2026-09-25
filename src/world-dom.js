import jquerySource from "jquery/dist/jquery.min.js?raw";
import heroSheet from "../IsometricBaseCharacter/Base_SpriteSheet.png?inline";

// Spike: the quest's own HTML is the diorama. Learner jQuery runs against the
// real elements, so .fadeOut(), .animate(), and .css() play out on the island.
// ponytail: one hand-made island for every quest; per-quest maps if this look wins.
const TILE = 84;
const RISE = 26;
const HEIGHTS = [
  "0111000",
  "1222110",
  "1233211",
  "1233321",
  "0122221",
  "0112110",
  "0011100",
];
// Scene entries (lesson.scene) claim these tiles in order.
const SLOTS = [
  [2, 2],
  [4, 4],
  [2, 4],
  [4, 2],
];
const TREES = [
  [1, 1],
  [4, 1],
  [1, 3],
  [5, 3],
  [2, 5],
];
const HERO = [4, 3];
const TOPS = ["", "#ecd7a4", "#93c96c", "#7ab85b"];
const SIDES = ["", "#c7a46c", "#8b6a47", "#7a5c3d"];

const heightAt = (x, y) => Number(HEIGHTS[y]?.[x] || 0);
const place = (x, y) =>
  `left:${(x + 0.5) * TILE}px;top:${(y + 0.5) * TILE}px;--z:${heightAt(x, y) * RISE}px`;

// Each prop kind is CSS scoped to a curriculum selector; the fixture's markup,
// classes, and inline styles stay exactly what the learner's code sees.
const KINDS = {
  beacon: (s, lit) => `
    ${s} { --w: 70px; --h: 160px; display: flex; align-items: flex-end; justify-content: center;
      padding-bottom: 6px; font: 700 10px/1 "DM Mono", monospace; letter-spacing: .12em;
      text-transform: uppercase; color: #efe6cf;
      background:
        linear-gradient(#5c5853, #4a4643) center bottom / 70px 24px no-repeat,
        linear-gradient(90deg, #a19c95 0 50%, #7d7872 50%) center bottom 24px / 30px 92px no-repeat; }
    ${s}::before { content: ""; position: absolute; left: 17px; top: 10px; width: 30px; height: 32px;
      border: 4px solid #3b3733; border-radius: 6px 6px 2px 2px; background: #33404d;
      transition: background .6s, box-shadow .6s; }
    ${s}::after { content: ""; position: absolute; left: -95px; top: -75px; width: 260px; height: 260px;
      border-radius: 50%; background: radial-gradient(#ffe39a 0, #ffc24a55 30%, transparent 65%);
      opacity: 0; transform: scale(.4); transition: opacity 1.2s, transform 1.2s; pointer-events: none; }
    ${lit} ${s}::before { background: #ffe07a; box-shadow: 0 0 24px 6px #ffc84a, inset 0 0 8px #fff7d0; }
    ${lit} ${s}::after { opacity: 1; transform: scale(1); animation: pulse 2.4s ease-in-out infinite; }`,
  sign: (s) => `
    ${s} { --w: 76px; --h: 66px; display: flex; justify-content: center; padding-top: 10px;
      font: 700 11px/1 "DM Mono", monospace; color: #fff3d6; text-shadow: 0 1px 0 #4a321d;
      background:
        linear-gradient(#b3814f, #8d6039) top / 76px 32px no-repeat,
        linear-gradient(90deg, #5e4027 0 50%, #4a321d 50%) center bottom / 8px 40px no-repeat; }`,
};

function islandCss(scene) {
  const props = scene
    .map(([selector, kind], index) => {
      const [x, y] = SLOTS[index % SLOTS.length];
      const s = `#quest-fixture :is(${selector})`;
      return `${s} { position: absolute; ${place(x, y)}; }\n${(KINDS[kind] || KINDS.sign)(s, `.lit-${index}`)}`;
    })
    .join("\n");
  return `
    * { box-sizing: border-box; }
    html, body { margin: 0; height: 100%; overflow: hidden; }
    body { background: linear-gradient(#10163a, #263667 55%, #3d5c86); }
    body::before { content: ""; position: fixed; inset: 0; opacity: 0; transition: opacity 2s;
      background: linear-gradient(#f5b98f, #fbe2bd 45%, #a7dbd8); }
    body[class*="lit-"]::before { opacity: 1; }
    .night { position: fixed; inset: 0; background: #1d2458; mix-blend-mode: multiply;
      opacity: .5; transition: opacity 2s; pointer-events: none; }
    body[class*="lit-"] .night { opacity: 0; }
    .blur { position: fixed; left: 0; right: 0; height: 22%; backdrop-filter: blur(3px); pointer-events: none; }
    .blur.top { top: 0; mask: linear-gradient(#000, transparent); }
    .blur.bottom { bottom: 0; mask: linear-gradient(transparent, #000); }
    .stage { position: fixed; inset: 0; perspective: 1800px; }
    .island { position: absolute; left: 50%; top: 52%; width: ${TILE * 7}px; height: ${TILE * 7}px;
      margin: ${TILE * -3.5}px; transform-style: preserve-3d; transform: rotateX(58deg) rotateZ(45deg); }
    .island *, #quest-fixture, #quest-fixture section { transform-style: preserve-3d; }
    #quest-fixture, #quest-fixture section { display: contents; }
    .sea { position: absolute; inset: -420px; transform: translateZ(8px);
      mask: radial-gradient(closest-side, #000 55%, transparent);
      background: repeating-linear-gradient(45deg, #ffffff10 0 2px, transparent 2px 28px), #2f7f93;
      animation: tide 6s linear infinite; }
    .block { position: absolute; width: ${TILE}px; height: ${TILE}px; transform: translateZ(var(--z));
      background: linear-gradient(135deg, #ffffff22, #00000014), linear-gradient(var(--tone), var(--tone)), var(--top); }
    .block::before, .block::after { content: ""; position: absolute; background: var(--side); }
    .block::before { left: 0; top: 100%; width: 100%; height: var(--z); transform-origin: top;
      transform: rotateX(-90deg); filter: brightness(.82); }
    .block::after { left: 100%; top: 0; width: var(--z); height: 100%; transform-origin: left;
      transform: rotateY(90deg); }
    /* Billboards stand upright on their tile and face the camera. */
    .tree, .hero, #quest-fixture :is(${scene.map(([selector]) => selector).join(",")}) {
      width: var(--w); height: var(--h); margin: calc(var(--h) * -1) 0 0 calc(var(--w) / -2);
      transform-origin: 50% 100%; transform: translateZ(var(--z)) rotateZ(-45deg) rotateX(-90deg); }
    .tree { position: absolute; --w: 44px; --h: 78px;
      background: linear-gradient(90deg, #5a3d24 0 50%, #463019 50%) center bottom / 6px 16px no-repeat; }
    .tree::before { content: ""; position: absolute; inset: 0 0 12px;
      background: linear-gradient(90deg, #4f9a57 50%, #3b7c47 50%);
      clip-path: polygon(50% 0, 78% 34%, 64% 34%, 90% 64%, 72% 64%, 100% 100%, 0 100%, 28% 64%, 10% 64%, 36% 34%, 22% 34%); }
    .hero { position: absolute; --w: 64px; --h: 64px; image-rendering: pixelated;
      background: url("${heroSheet}") 0 -192px / 256px auto; animation: idle .9s steps(4) infinite; }
    @keyframes idle { to { background-position-x: -256px; } }
    @keyframes tide { to { background-position: 40px 0; } }
    @keyframes pulse { 50% { transform: scale(1.08); opacity: .85; } }
    ${props}`;
}

function islandMarkup() {
  const blocks = HEIGHTS.flatMap((row, y) =>
    [...row].map((cell, x) =>
      cell === "0"
        ? ""
        : `<div class="block" style="${place(x, y)};--tone:${(x * 7 + y * 3) % 4 ? "transparent" : "#0000000f"};--top:${TOPS[cell]};--side:${SIDES[cell]}"></div>`,
    ),
  ).join("");
  const trees = TREES.map(([x, y]) => `<div class="tree" style="${place(x, y)}"></div>`).join("");
  return `<div class="sea"></div>${blocks}${trees}<div class="hero" style="${place(...HERO)}"></div>`;
}

const scriptText = (value) => value.replace(/<\/script/gi, "<\\/script");

/** srcdoc for a sandboxed frame that shows a lesson's HTML as a diorama, then runs `code`. */
export function buildWorldDoc(lesson, code, delay = 800) {
  const nonce = crypto.randomUUID().replace(/-/g, "");
  const policy = `default-src 'none'; script-src 'nonce-${nonce}'; style-src 'unsafe-inline'; img-src data:`;
  // Trusted curriculum predicates light props up; body classes keep the fixture untouched.
  const rules = `[${lesson.scene.map(([selector, , lit]) => `[${JSON.stringify(selector)}, ${lit ? lit.toString() : "null"}]`).join(",")}]`;
  const watcher = `(() => {
    const rules = ${rules};
    const root = document.getElementById("quest-fixture");
    const update = () => rules.forEach(([selector, lit], index) =>
      document.body.classList.toggle("lit-" + index,
        !!lit && [...root.querySelectorAll(selector)].some(lit)));
    new MutationObserver(update).observe(root, { subtree: true, childList: true, characterData: true, attributes: true });
    update();
  })();`;
  return (
    '<!doctype html><html><head><meta charset="utf-8">' +
    `<meta http-equiv="Content-Security-Policy" content="${policy}">` +
    `<style>${islandCss(lesson.scene)}</style></head><body>` +
    `<div class="stage"><div class="island">${islandMarkup()}<main id="quest-fixture">${lesson.html}</main></div></div>` +
    '<div class="night"></div><div class="blur top"></div><div class="blur bottom"></div>' +
    `<script nonce="${nonce}">${scriptText(jquerySource)}</script>` +
    `<script nonce="${nonce}">${scriptText(watcher)}</script>` +
    // ponytail: no loop guard here; in the app, only replay code the hidden checker already finished.
    `<script nonce="${nonce}">setTimeout(function () {\n${scriptText(code)}\n}, ${delay});</script>` +
    "</body></html>"
  );
}
