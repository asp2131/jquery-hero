import jquerySource from "jquery/dist/jquery.min.js?raw";
import acornSource from "../node_modules/acorn/dist/acorn.js?raw";
import walkSource from "../node_modules/acorn-walk/dist/walk.js?raw";
import magicStringSource from "../node_modules/magic-string/dist/magic-string.umd.js?raw";
import heroSheet from "../IsometricBaseCharacter/Base_SpriteSheet.png?inline";
import slimeSheet from "../animated slime/64x64/Stanby.png?inline";

// Licensed art stays out of git (see .gitignore); builds inline it because the frame's CSP only allows data: images.
const tiles = Object.fromEntries(
  Object.entries(import.meta.glob(
    "../Isometric dungeon tiles 2d by RgsDev/Isometric tiles/{Ground1,Ground2,Ground3,Grass1,Grass3,Wall left,Wall right,Wall corner,Door Left,Wooden box,Chest Left,Barrel}.png",
    { eager: true, query: "?inline", import: "default" },
  )).map(([path, url]) => [path.split("/").pop().slice(0, -4), url]),
);

// Units are real elements: a selector chooses targets and a jQuery method casts the spell.
// Arena tiles are 0..SIZE-1; walls stand on row/column -1 and a grass rim runs along SIZE.
const SIZE = 7;
// Tile art is 256x512 drawn at half size: a 128x64 diamond, 80px per stacked level.
const OX = (SIZE + 1) * 64;
const OY = 96;
const BOARD_W = OX * 2 + 128;
const BOARD_H = SIZE * 64 + OY + 256;
// Props stay on the back edges so nothing ever hides a unit.
const PROPS = [["Wooden box", 1, 0], ["Chest Left", 5, 0], ["Barrel", 0, 3]];

// The battle's HTML, exactly what the learner's jQuery sees.
export const battleHtml = [
  '<div class="unit" id="hero" data-x="2" data-y="2">You</div>',
  '<div class="unit" id="villager" data-x="3" data-y="3">Villager</div>',
  '<div class="unit goblin" id="goblin-1" data-x="6" data-y="3">Goblin</div>',
  '<div class="unit goblin" id="goblin-2" data-x="3" data-y="6">Goblin</div>',
  '<div class="unit goblin" id="goblin-3" data-x="5" data-y="4">Goblin</div>',
  '<div class="unit goblin" id="goblin-4" data-x="4" data-y="5">Goblin</div>',
].join("\n");

// One sheet, many characters: filters recolor the sprite and stacked
// drop-shadows draw a pixel outline around it.
const outline = (c) =>
  `drop-shadow(2px 0 ${c}) drop-shadow(-2px 0 ${c}) drop-shadow(0 2px ${c}) drop-shadow(0 -2px ${c})`;

// Diamond outlines for enemy intent tiles (SVG keeps the dashed edge on an iso diamond).
const diamond = (fill, dash) =>
  `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 128 64'><path d='M64 4 124 32 64 60 4 32z' fill='${fill}' stroke='%23ff7a7a' stroke-width='3' stroke-dasharray='${dash}'/></svg>")`;

const css = `
  * { box-sizing: border-box; }
  html, body { margin: 0; height: 100%; overflow: hidden; }
  body { background: radial-gradient(120% 90% at 50% 58%, #0f4d70, #0a2c4a 48%, #07182c); }
  .stage { position: fixed; inset: 64px 12px 84px; }
  .island { position: absolute; left: 50%; top: 50%; width: ${BOARD_W}px; height: ${BOARD_H}px;
    margin: ${BOARD_H / -2}px 0 0 ${BOARD_W / -2}px; transform: scale(var(--board-scale, .5)); }
  #quest-fixture { display: contents; }
  [data-tile] { position: absolute; width: 128px; height: 256px; background: center / 100% 100% no-repeat; pointer-events: none; }
  ${Object.entries(tiles).map(([name, url]) => `[data-tile="${name}"] { background-image: url("${url}"); }`).join("\n")}
  /* Sprites stand on the top face of their tile; depth sorts by x + y. */
  .unit, .slime, .intent { position: absolute; left: calc((var(--x) - var(--y)) * 64px + ${OX + 64}px);
    top: calc((var(--x) + var(--y)) * 32px + ${OY + 144}px); }
  .intent { width: 128px; height: 64px; margin: -32px 0 0 -64px; z-index: 1;
    background: ${diamond("%23ff5a5a44", "10 7")}; animation: blink 1s ease-in-out infinite alternate; }
  .intent.strike { background: ${diamond("%23ff4a4aaa", "0")}; }
  .unit, .slime { width: var(--w); height: var(--h); margin: calc(var(--h) * -1 + 8px) 0 0 calc(var(--w) / -2);
    z-index: calc((var(--x) + var(--y)) * 4 + 13); }
  .slime { --w: 96px; --h: 96px; image-rendering: pixelated;
    background: url("${slimeSheet}") 0 0 / 1344px 96px; animation: slime 2.4s steps(14) infinite; }
  .unit { --w: 96px; --h: 118px; display: flex; justify-content: center; transition: left .45s, top .45s;
    font: 700 13px/1 monospace; color: #fff; text-shadow: 0 1px 3px #000, 0 0 2px #000; white-space: nowrap; }
  .unit::before { content: ""; position: absolute; left: 0; bottom: 0; width: 96px; height: 96px;
    image-rendering: pixelated; background: url("${heroSheet}") 0 -288px / 384px auto;
    animation: frames .9s steps(4) infinite; }
  #hero::before { filter: hue-rotate(100deg) saturate(1.3) ${outline("#f6eab0")}; }
  #hero.casting::before { background-position-y: -576px; }
  #villager::before { filter: hue-rotate(-70deg) saturate(.8) ${outline("#3b2a17")}; }
  .goblin::before { filter: saturate(1.6) brightness(.85) contrast(1.3) ${outline("#0b2a0e")}; }
  .goblin.moving::before { background-position-y: 0; animation-duration: .45s; }
  .goblin.frozen::before { filter: grayscale(1) sepia(1) hue-rotate(170deg) saturate(3) brightness(1.2) ${outline("#dff6ff")};
    animation-play-state: paused; }
  @keyframes frames { to { background-position-x: -384px; } }
  @keyframes slime { to { background-position-x: -1344px; } }
  @keyframes blink { to { opacity: .45; } }
  @media (prefers-reduced-motion: reduce) {
    .unit { transition: none; }
    .unit::before, .intent, .slime { animation: none; }
  }`;

// Runs inside the frame. Trusted: owns turns, enemy moves, and win/lose.
function engine({ token, guardName }) {
  const $ = window.jQuery;
  const { parse, walk: { simple } } = window.acorn;
  const MagicString = window.MagicString;
  const root = document.getElementById("quest-fixture");
  const board = document.querySelector(".island");
  const stage = document.querySelector(".stage");
  const nativeNow = performance.now.bind(performance);
  const nativeQueueMicrotask = queueMicrotask.bind(window);
  const nativeSetTimeout = setTimeout.bind(window);
  const sendMessage = parent.postMessage.bind(parent);
  const wait = (ms) => new Promise((done) => nativeSetTimeout(done, ms));
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const updateMotion = () => { $.fx.off = motion.matches; };
  updateMotion();
  motion.addEventListener("change", updateMotion);
  const pause = (ms) => wait(motion.matches ? 0 : ms);
  const resize = () => {
    board.style.setProperty("--board-scale", Math.max(.05, Math.min(1, stage.clientWidth / board.offsetWidth, stage.clientHeight / board.offsetHeight)));
  };
  new ResizeObserver(resize).observe(stage);
  resize();
  // Keep the parser, token, and engine source out of the learner's DOM.
  document.querySelectorAll("script, meta[http-equiv]").forEach((element) => element.remove());
  delete window.acorn;
  delete window.MagicString;

  const pos = (el) => [Number(el.dataset.x), Number(el.dataset.y)];
  const alive = (el) => root.contains(el) && $(el).is(":visible");
  const goblins = () => $(".goblin", root).toArray().filter(alive);
  const villager = document.getElementById("villager");
  const hero = document.getElementById("hero");
  const distance = (el) => Math.abs(pos(el)[0] - pos(villager)[0]) + Math.abs(pos(el)[1] - pos(villager)[1]);
  const occupied = (x, y) => $(".unit", root).toArray().some((u) => alive(u) && pos(u)[0] === x && pos(u)[1] === y);
  let turn = 1;
  let over = false;
  let busy = false;
  let runtimeError = "";
  let notifyError;

  const report = (status, message) => sendMessage({
    channel: "jquery-quest-battle", token, status, turn, message,
    error: runtimeError, remaining: goblins().length,
    heroAlive: alive(hero), villagerAlive: alive(villager),
  }, "*");
  const sync = () => $(".unit", root).each((_, u) => { u.style.setProperty("--x", u.dataset.x); u.style.setProperty("--y", u.dataset.y); });
  const recordError = (error) => {
    runtimeError ||= String(error?.message || error || "A JavaScript error stopped your spell.").slice(0, 1200);
    notifyError?.();
  };
  window.addEventListener("error", (event) => {
    if (!busy) return;
    recordError(event.error || event.message);
    event.preventDefault();
  });
  window.addEventListener("unhandledrejection", (event) => {
    if (!busy) return;
    recordError(event.reason);
    event.preventDefault();
  });

  function prepare(code) {
    if (code.length > 50000) throw new Error("This spell is too long. Keep it under 50,000 characters.");
    const tree = parse(code, { ecmaVersion: "latest", sourceType: "script", allowReturnOutsideFunction: true });
    const output = new MagicString(code);
    const guard = `${guardName}();`;
    function guardBlock(block) {
      let position = block.start + 1;
      for (const statement of block.body) {
        if (!statement.directive) break;
        position = statement.end;
      }
      output.appendLeft(position, `;${guard}`);
    }
    function guardLoop(node) {
      if (node.body.type === "BlockStatement") guardBlock(node.body);
      else {
        output.appendLeft(node.body.start, `{${guard}`);
        output.appendLeft(node.body.end, "}");
      }
    }
    function guardFunction(node) {
      if (node.body.type === "BlockStatement") guardBlock(node.body);
      else {
        output.appendLeft(node.body.start, `(${guardName}(), `);
        output.appendLeft(node.body.end, ")");
      }
    }
    simple(tree, {
      ForStatement: guardLoop, ForInStatement: guardLoop, ForOfStatement: guardLoop,
      WhileStatement: guardLoop, DoWhileStatement: guardLoop,
      FunctionDeclaration: guardFunction, FunctionExpression: guardFunction,
      ArrowFunctionExpression: guardFunction,
    });
    return output.toString();
  }

  function makeGuard() {
    let ticks = 0;
    let deadline = 0;
    let inTask = false;
    return () => {
      // A later animation callback gets a fresh time slice, not a stale deadline.
      if (!inTask) {
        inTask = true;
        deadline = nativeNow() + 500;
        nativeQueueMicrotask(() => { inTask = false; });
      }
      if (++ticks > 20000 || nativeNow() > deadline) {
        throw new Error("Your code kept running. Check your loop condition or recursive function, then try again.");
      }
    };
  }

  function nextStep(el) {
    const [x, y] = pos(el);
    const [vx, vy] = pos(villager);
    const dx = Math.sign(vx - x);
    const dy = Math.sign(vy - y);
    const options = Math.abs(vx - x) >= Math.abs(vy - y) ? [[x + dx, y], [x, y + dy]] : [[x, y + dy], [x + dx, y]];
    return options.find(([a, b]) => (a !== x || b !== y) && !occupied(a, b)) || [x, y];
  }

  // Red tiles show the next move; solid red means a goblin will strike.
  function showIntents() {
    $(".intent", board).remove();
    if (over) return;
    for (const g of goblins()) {
      if ($(g).hasClass("frozen")) continue;
      const strike = distance(g) === 1;
      const [x, y] = strike ? pos(villager) : nextStep(g);
      $('<div class="intent">').toggleClass("strike", strike).css({ "--x": x, "--y": y }).appendTo(board);
    }
  }

  function settle() {
    if (!alive(villager) || !alive(hero)) {
      over = true;
      report("lost", alive(hero) ? "The villager fell. Restart the battle to try again." : "Your spell banished the hero. Restart and target only goblins.");
    } else if (!runtimeError && !goblins().length) {
      over = true;
      report("won", `Every goblin banished in ${turn} turn${turn > 1 ? "s" : ""}.`);
    }
    if (over) showIntents();
    return over;
  }

  async function enemyTurn() {
    for (const g of goblins()) {
      if ($(g).hasClass("frozen")) {
        $(g).removeClass("frozen");
        continue;
      }
      if (distance(g) === 1) {
        await $(villager).fadeOut(500).promise();
        return;
      }
      const [x, y] = nextStep(g);
      g.dataset.x = x;
      g.dataset.y = y;
      $(g).addClass("moving");
    }
    sync();
    await pause(500);
    $(".goblin", root).removeClass("moving");
  }

  window.addEventListener("message", async ({ source, data }) => {
    if (source !== parent || over || busy || typeof data?.code !== "string") return;
    if (data.token !== token && !(token === "" && data.token === undefined)) return;
    busy = true;
    runtimeError = "";
    const failed = new Promise((resolve) => { notifyError = resolve; });
    $(hero).addClass("casting");
    try {
      try {
        Function(guardName, prepare(data.code))(makeGuard());
      } catch (error) {
        recordError(error);
      }
      // Errors keep any mutations, but never give goblins an extra turn or award victory.
      if (!runtimeError) {
        await Promise.race([Promise.all([pause(600), $("*", root).promise()]).then(() => pause(300)), failed]);
      }
      if (runtimeError) $("*", root).stop(true, false);
      sync();
      $(hero).removeClass("casting");
      if (settle()) return;
      showIntents();
      if (runtimeError) {
        report("playing", `Spell error: ${runtimeError} Fix your code and cast again; goblins have not moved.`);
        return;
      }
      await enemyTurn();
      if (settle()) return;
      turn += 1;
      showIntents();
      report("playing", `${goblins().length} goblins left. Cast your next spell.`);
    } catch (error) {
      recordError(error);
      report("playing", `Spell error: ${runtimeError} Fix your code and cast again.`);
    } finally {
      $(hero).removeClass("casting");
      busy = false;
      notifyError = undefined;
    }
  });

  sync();
  showIntents();
  report("playing", "Goblins march on the villager. Red tiles show their next move.");
}

const scriptText = (value) => value.replace(/<\/script/gi, "<\\/script");

function boardMarkup() {
  const out = [];
  // Floor tiles share z-index 0 and paint back to front in DOM order; standing pieces sort with units.
  const tile = (name, x, y, level = 0) => out.push(
    `<i data-tile="${name}" style="left:${(x - y) * 64 + OX}px;top:${(x + y) * 32 + OY - level * 80}px;z-index:${level && (x + y) * 4 + 10 + level}"></i>`);
  for (let y = -1; y <= SIZE; y += 1)
    for (let x = -1; x <= SIZE; x += 1)
      tile(x === SIZE || y === SIZE ? `Grass${(x + y) % 3 ? 1 : 3}` : `Ground${[1, 1, 2, 1, 3][(x * 3 + y * 7 + 10) % 5]}`, x, y);
  // Two-high back walls with a door in the middle.
  for (const level of [1, 2]) {
    tile("Wall corner", -1, -1, level);
    for (let i = 0; i < SIZE; i += 1) {
      tile(i === 3 && level === 1 ? "Door Left" : "Wall left", i, -1, level);
      tile("Wall right", -1, i, level);
    }
  }
  for (const [name, x, y] of PROPS) tile(name, x, y, 1);
  out.push(`<div class="slime" style="--x:1;--y:${SIZE}"></div>`);
  return out.join("");
}

/** Build an isolated battlefield; commands and reports share the optional session token. */
export function buildBattleDoc({ token = "" } = {}) {
  const nonce = crypto.randomUUID().replace(/-/g, "");
  const configuration = JSON.stringify({ token, guardName: `__battleGuard_${nonce}` }).replace(/</g, "\\u003c");
  // unsafe-eval lets the engine run each turn's code; the sandbox (no same-origin) is the real boundary.
  const policy = `default-src 'none'; script-src 'nonce-${nonce}' 'unsafe-eval'; style-src 'unsafe-inline'; img-src data:`;
  return (
    '<!doctype html><html><head><meta charset="utf-8">' +
    `<meta http-equiv="Content-Security-Policy" content="${policy}">` +
    `<style>${css}</style></head><body>` +
    `<div class="stage"><div class="island">${boardMarkup()}<main id="quest-fixture">${battleHtml}</main></div></div>` +
    `<script nonce="${nonce}">${scriptText(jquerySource)}</script>` +
    `<script nonce="${nonce}">${scriptText(acornSource)}\n${scriptText(walkSource)}\n${scriptText(magicStringSource)}</script>` +
    `<script nonce="${nonce}">(${engine})(${configuration});</script>` +
    "</body></html>"
  );
}
