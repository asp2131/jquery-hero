const HERO_URL = new URL(
  "../IsometricBaseCharacter/Base_SpriteSheet.png",
  import.meta.url,
).href;
const TERRAIN_URL = new URL(
  "../20260111_101746_792bb9d2 (1) (1).png",
  import.meta.url,
).href;
const HALF_WIDTH = 24;
const HALF_HEIGHT = 12;
const STEP_TIME = 165;
const LANDMARKS = [
  [1, 8],
  [2, 6],
  [4, 5],
  [4, 2],
  [7, 2],
  [9, 3],
  [11, 5],
  [10, 7],
  [9, 10],
  [6, 10],
  [5, 8],
  [7, 7],
];
const DIRECTIONS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
const KEY_DIRECTIONS = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  w: "up",
  s: "down",
  a: "left",
  d: "right",
};
const keyOf = (x, y) => `${x},${y}`;
const project = (x, y) => ({
  x: (x - y) * HALF_WIDTH,
  y: (x + y) * HALF_HEIGHT,
});
const noise = (x, y, seed = 0) => {
  const value = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453;
  return value - Math.floor(value);
};
const validIndices = (values) =>
  new Set(
    (Array.isArray(values) ? values : []).filter(
      (value) =>
        Number.isInteger(value) && value >= 0 && value < LANDMARKS.length,
    ),
  );

function makeIsland() {
  const tiles = new Map();
  const trail = new Map();
  const lobes = [
    [2, 7, 3.1, 3],
    [5, 2, 3.5, 2.1],
    [10, 5, 3, 3.2],
    [8, 10, 3.5, 2.4],
    [6, 8, 2.4, 2.4],
  ];
  const isLand = (x, y) =>
    lobes.some(
      ([cx, cy, rx, ry]) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 < 1,
    );
  let [x, y] = LANDMARKS[0];
  trail.set(keyOf(x, y), { x, y, stage: 0 });
  LANDMARKS.slice(1).forEach(([targetX, targetY], offset) => {
    const stage = offset + 1;
    const axes = stage % 2 ? ["y", "x"] : ["x", "y"];
    for (const axis of axes) {
      while ((axis === "x" ? x : y) !== (axis === "x" ? targetX : targetY)) {
        if (axis === "x") x += Math.sign(targetX - x);
        else y += Math.sign(targetY - y);
        const key = keyOf(x, y);
        if (!trail.has(key)) trail.set(key, { x, y, stage });
      }
    }
  });
  for (let ty = 0; ty <= 12; ty += 1) {
    for (let tx = -1; tx <= 13; tx += 1) {
      const key = keyOf(tx, ty);
      if (!isLand(tx, ty) && !trail.has(key)) continue;
      let closest = null;
      let distance = Infinity;
      for (const point of trail.values()) {
        const nextDistance = Math.abs(point.x - tx) + Math.abs(point.y - ty);
        if (
          nextDistance < distance ||
          (nextDistance === distance && point.stage < closest.stage)
        ) {
          closest = point;
          distance = nextDistance;
        }
      }
      tiles.set(key, {
        x: tx,
        y: ty,
        stage: closest.stage,
        path: trail.has(key),
        bridge: !isLand(tx, ty),
        variant: noise(tx, ty),
        obstacle: false,
      });
    }
  }
  const reserved = new Set(LANDMARKS.map(([lx, ly]) => keyOf(lx, ly)));
  const rewards = LANDMARKS.map(([lx, ly], index) => {
    const candidates = [
      [1, 0],
      [0, 1],
      [-1, 0],
      [0, -1],
      [1, 1],
      [-1, 1],
      [1, -1],
      [-1, -1],
    ];
    const offset = candidates.find(([dx, dy]) => {
      const tile = tiles.get(keyOf(lx + dx, ly + dy));
      return (
        tile &&
        !tile.path &&
        !tile.bridge &&
        !reserved.has(keyOf(tile.x, tile.y))
      );
    });
    const [dx, dy] = offset || [0, 1];
    const reward = { x: lx + dx, y: ly + dy, index };
    const key = keyOf(reward.x, reward.y);
    if (!tiles.has(key))
      tiles.set(key, {
        ...reward,
        stage: index,
        path: false,
        bridge: false,
        variant: 0.5,
        obstacle: false,
      });
    tiles.get(key).stage = Math.min(tiles.get(key).stage, index);
    reserved.add(key);
    return reward;
  });
  const scenery = [];
  for (const tile of tiles.values()) {
    if (tile.path || reserved.has(keyOf(tile.x, tile.y))) continue;
    const sample = noise(tile.x, tile.y, 3);
    if (sample > 0.64) {
      tile.obstacle = true;
      scenery.push({ ...tile, type: sample > 0.89 ? "ruin" : "tree" });
    } else if (sample > 0.43) scenery.push({ ...tile, type: "flowers" });
    else if (sample < 0.17) scenery.push({ ...tile, type: "shrub" });
  }
  LANDMARKS.forEach(([lx, ly], index) =>
    scenery.push({ x: lx, y: ly, type: "beacon", index }),
  );
  rewards.forEach((reward) => scenery.push({ ...reward, type: "crystal" }));
  scenery.sort((a, b) => a.x + a.y - b.x - b.y || a.x - b.x);
  return {
    tiles,
    scenery,
    rewards,
    sortedTiles: [...tiles.values()].sort(
      (a, b) => a.x + a.y - b.x - b.y || a.x - b.x,
    ),
  };
}

/** A self-contained island. Progress is supplied by the app; rewards require a walking visit. */
export function createWorld(
  canvas,
  { onCollect = () => {}, onReach = () => {} } = {},
) {
  const ctx = canvas.getContext("2d");
  if (!ctx)
    throw new Error("The island needs a browser with Canvas 2D support.");
  const { tiles, scenery, rewards, sortedTiles } = makeIsland();
  const backdrop = document.createElement("canvas");
  const backgroundContext = backdrop.getContext("2d");
  const heroImage = new Image();
  const terrainImage = new Image();
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const originalTabIndex = canvas.getAttribute("tabindex");
  const originalLabel = canvas.getAttribute("aria-label");
  const originalCursor = canvas.style.cursor;
  canvas.tabIndex = 0;
  canvas.setAttribute(
    "aria-label",
    "Quest island. In explore mode, use arrow keys or W A S D to walk, or click a tile. Walk onto golden crystals to collect them.",
  );
  let completed = new Set();
  let collected = new Set();
  const pendingCollections = new Set();
  let frontier = 0;
  let active = 0;
  let exploring = false;
  let destroyed = false;
  let hero = { x: LANDMARKS[0][0], y: LANDMARKS[0][1], facing: 0 };
  let route = [];
  let step = null;
  let lastReached = null;
  let width = 1;
  let height = 1;
  let dpr = 1;
  let camera = { x: 0, y: 0, scale: 1 };
  let islandCamera = camera;
  let props = [];
  let propTiles = new Set();
  let placedProps = [];
  let animationId = 0;
  let lastFrame = 0;
  let destination = null;
  let collectionBurst = null;
  let focused = false;

  const unlocked = (index) =>
    Number.isInteger(index) &&
    index >= 0 &&
    index < LANDMARKS.length &&
    index <= frontier;
  const passable = (x, y) => {
    const tile = tiles.get(keyOf(x, y));
    return !!tile && tile.stage <= frontier && !tile.obstacle;
  };
  const availableReward = (index) =>
    completed.has(index) &&
    !collected.has(index) &&
    !pendingCollections.has(index);

  function polygon(context, points, fill, stroke) {
    context.beginPath();
    context.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i += 1)
      context.lineTo(points[i][0], points[i][1]);
    context.closePath();
    if (fill) {
      context.fillStyle = fill;
      context.fill();
    }
    if (stroke) {
      context.strokeStyle = stroke;
      context.stroke();
    }
  }

  function diamond(context, x, y, w, h, fill, stroke) {
    polygon(
      context,
      [
        [x, y - h],
        [x + w, y],
        [x, y + h],
        [x - w, y],
      ],
      fill,
      stroke,
    );
  }

  function ellipse(context, x, y, rx, ry, color) {
    context.beginPath();
    context.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    context.fillStyle = color;
    context.fill();
  }

  function worldTransform(context) {
    context.translate(camera.x, camera.y);
    context.scale(camera.scale, camera.scale);
  }

  function drawTile(context, tile) {
    const { x, y } = project(tile.x, tile.y);
    const alive = tile.stage <= frontier;
    if (tile.bridge) {
      context.globalAlpha = alive ? 1 : 0.3;
      diamond(context, x + 2, y + 12, 22, 10, "#071d29");
      diamond(context, x, y + 3, 22, 10, "#634d3d");
      diamond(context, x, y, 23, 11, alive ? "#bea272" : "#577071");
      for (let plank = -2; plank <= 2; plank += 1) {
        context.beginPath();
        context.moveTo(x - 18 + plank * 4, y + 9 + plank * 2);
        context.lineTo(x + 18 + plank * 4, y - 9 + plank * 2);
        context.strokeStyle = "#75654d";
        context.lineWidth = 1.5;
        context.stroke();
      }
      for (const side of [-1, 1]) {
        context.fillStyle = alive ? "#ceb17c" : "#69807b";
        context.fillRect(x + side * 18 - 1, y - 12, 3, 18);
        context.fillRect(x + side * 18 - 1, y - 13, 4, 3);
      }
      context.globalAlpha = 1;
      return;
    }
    const depth = 21 + Math.floor(tile.variant * 7);
    const top = alive
      ? ["#74aa78", "#81b680", "#8cba83", "#78af7b"][
          Math.floor(tile.variant * 4)
        ]
      : ["#3f6561", "#456e66", "#486d64", "#3d625f"][
          Math.floor(tile.variant * 4)
        ];
    const left = alive ? "#5b7761" : "#294b49";
    const right = alive ? "#3f6055" : "#233f40";
    polygon(
      context,
      [
        [x - 24, y],
        [x, y + 12],
        [x, y + 12 + depth],
        [x - 24, y + depth],
      ],
      left,
    );
    polygon(
      context,
      [
        [x, y + 12],
        [x + 24, y],
        [x + 24, y + depth],
        [x, y + 12 + depth],
      ],
      right,
    );
    if (!tiles.has(keyOf(tile.x, tile.y + 1))) {
      polygon(
        context,
        [
          [x - 24, y + 7],
          [x, y + 19],
          [x, y + 22],
          [x - 24, y + 10],
        ],
        alive ? "#a09272" : "#4a6158",
      );
      polygon(
        context,
        [
          [x - 17, y + depth],
          [x - 8, y + depth + 5],
          [x - 13, y + depth + 18],
        ],
        "#2b4c48",
      );
    }
    if (!tiles.has(keyOf(tile.x + 1, tile.y))) {
      polygon(
        context,
        [
          [x, y + 19],
          [x + 24, y + 7],
          [x + 24, y + 10],
          [x, y + 22],
        ],
        alive ? "#7c8166" : "#3f5850",
      );
    }
    diamond(context, x, y, 24.4, 12.2, top);
    context.lineWidth = 0.7;
    context.beginPath();
    context.moveTo(x - 23, y - 0.5);
    context.lineTo(x, y - 12);
    context.lineTo(x + 23, y - 0.5);
    context.strokeStyle = alive ? "#acd09266" : "#91ba8c20";
    context.stroke();
    if (tile.path) {
      diamond(context, x, y + 0.3, 17, 8.1, alive ? "#c0c2a0" : "#758781");
      diamond(context, x - 6, y - 1, 6, 3, alive ? "#d8d2ae" : "#8b9890");
      diamond(context, x + 6, y + 3, 6, 3, alive ? "#abae92" : "#647b75");
      context.fillStyle = alive ? "#8d9e7c" : "#48645e";
      context.fillRect(x - 1, y - 6, 1, 5);
      context.fillRect(x + 3, y + 1, 1, 4);
    } else if (tile.variant > 0.45) {
      context.strokeStyle = alive ? "#d0d99870" : "#8eb19c25";
      context.lineWidth = 1;
      for (let i = 0; i < 3; i += 1) {
        const gx = x - 12 + noise(tile.x, tile.y, i + 7) * 24;
        const gy = y - 3 + noise(tile.x, tile.y, i + 11) * 6;
        context.beginPath();
        context.moveTo(gx, gy);
        context.lineTo(gx - 1, gy - 3);
        context.stroke();
      }
    }
  }

  function paintBackdrop() {
    backdrop.width = canvas.width;
    backdrop.height = canvas.height;
    const context = backgroundContext;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    const sea = context.createLinearGradient(0, 0, width, height);
    sea.addColorStop(0, "#0e2634");
    sea.addColorStop(0.5, "#123942");
    sea.addColorStop(1, "#0b2836");
    context.fillStyle = sea;
    context.fillRect(0, 0, width, height);
    const glow = context.createRadialGradient(
      width * 0.52,
      height * 0.5,
      5,
      width * 0.52,
      height * 0.5,
      width * 0.6,
    );
    glow.addColorStop(0, "#29685c35");
    glow.addColorStop(1, "#29685c00");
    context.fillStyle = glow;
    context.fillRect(0, 0, width, height);
    for (let i = 0; i < 55; i += 1) {
      const sx = noise(i, 2) * width;
      const sy = noise(i, 4) * height;
      context.strokeStyle = i % 4 === 0 ? "#75bcac1c" : "#7dc9c00b";
      context.lineWidth = 1;
      context.beginPath();
      context.ellipse(sx, sy, 8 + noise(i, 3) * 20, 2, 0, 0, Math.PI);
      context.stroke();
    }
    context.save();
    worldTransform(context);
    ellipse(context, 8, 202, 244, 107, "#0518243b");
    ellipse(context, 6, 204, 206, 87, "#061b2638");
    for (const tile of sortedTiles) drawTile(context, tile);
    // The tiny drifting outcrops make the traversable islands feel suspended over water.
    for (const [rx, ry, size] of [
      [-218, 238, 13],
      [211, 117, 12],
      [87, 329, 9],
    ]) {
      polygon(
        context,
        [
          [rx - size, ry],
          [rx, ry + size * 1.4],
          [rx + size, ry],
        ],
        "#36584f",
      );
      diamond(context, rx, ry, size, size * 0.48, "#78956b");
      diamond(context, rx - 2, ry - 3, size * 0.45, size * 0.21, "#92ad78");
    }
    context.restore();
  }

  function drawTree(object) {
    const { x, y } = project(object.x, object.y);
    const alive = object.stage <= frontier;
    const size = 0.78 + object.variant * 0.4;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(size, size);
    ellipse(ctx, 3, 3, 17, 7, "#173e4050");
    ctx.fillStyle = alive ? "#806c51" : "#465e55";
    ctx.fillRect(-3, -24, 6, 27);
    ctx.fillStyle = "#c2aa753f";
    ctx.fillRect(-3, -22, 2, 24);
    polygon(
      ctx,
      [
        [0, -61],
        [21, -28],
        [14, -17],
        [-17, -18],
        [-23, -28],
      ],
      alive ? "#2f735b" : "#31594f",
    );
    polygon(
      ctx,
      [
        [0, -61],
        [0, -21],
        [-17, -18],
        [-23, -28],
      ],
      alive ? "#428969" : "#3b6658",
    );
    polygon(
      ctx,
      [
        [0, -61],
        [21, -28],
        [8, -32],
      ],
      alive ? "#62a67b" : "#48735f",
    );
    polygon(
      ctx,
      [
        [-5, -51],
        [-18, -32],
        [-7, -34],
      ],
      alive ? "#7ab785" : "#548068",
    );
    polygon(
      ctx,
      [
        [-14, -23],
        [0, -29],
        [13, -21],
        [0, -17],
      ],
      alive ? "#3f8865" : "#3a6557",
    );
    if (alive && object.variant > 0.78) {
      ctx.fillStyle = "#e7c681";
      ctx.fillRect(-9, -31, 3, 3);
      ctx.fillRect(10, -25, 3, 3);
    }
    ctx.restore();
  }

  function drawRuin(object) {
    const { x, y } = project(object.x, object.y);
    const alive = object.stage <= frontier;
    ellipse(ctx, x + 3, y + 3, 16, 6, "#193c3b55");
    polygon(
      ctx,
      [
        [x - 10, y - 4],
        [x, y + 1],
        [x, y - 29],
        [x - 10, y - 34],
      ],
      alive ? "#9ba88e" : "#526e64",
    );
    polygon(
      ctx,
      [
        [x, y + 1],
        [x + 9, y - 4],
        [x + 9, y - 34],
        [x, y - 29],
      ],
      alive ? "#6a8877" : "#36564f",
    );
    diamond(ctx, x, y - 34, 10, 5, alive ? "#bec4a3" : "#6c8373");
    ctx.strokeStyle = alive ? "#546e6266" : "#263f4066";
    ctx.lineWidth = 1.5;
    for (const line of [10, 19]) {
      ctx.beginPath();
      ctx.moveTo(x - 10, y - line);
      ctx.lineTo(x, y - line + 5);
      ctx.lineTo(x + 9, y - line);
      ctx.stroke();
    }
    diamond(ctx, x + 12, y + 2, 8, 4, alive ? "#a9af90" : "#5b7266");
    if (alive) {
      ctx.strokeStyle = "#78a67a";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x + 7, y - 32);
      ctx.lineTo(x + 3, y - 20);
      ctx.lineTo(x + 7, y - 10);
      ctx.stroke();
      ellipse(ctx, x + 4, y - 22, 4, 2, "#99bc82");
    }
  }

  function drawFlowers(object) {
    const { x, y } = project(object.x, object.y);
    const alive = object.stage <= frontier;
    if (object.variant > 0.55) {
      for (let i = 0; i < 3; i += 1) {
        const fx = x - 9 + i * 8;
        const fy = y - 2 + (i % 2) * 3;
        ctx.fillStyle = alive ? "#c8be8e" : "#55736b";
        ctx.fillRect(fx, fy - 6, 2, 7);
        ellipse(
          ctx,
          fx + 1,
          fy - 7,
          4,
          2.8,
          alive ? (i % 2 ? "#e2b58c" : "#da8670") : "#65847a",
        );
        if (alive) {
          ctx.fillStyle = "#f9dbad";
          ctx.fillRect(fx, fy - 9, 2, 2);
        }
      }
    } else {
      for (let i = 0; i < 4; i += 1) {
        const fx = x - 11 + i * 7;
        const fy = y + (i % 2) * 4;
        ctx.strokeStyle = alive ? "#45775b" : "#365e54";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(fx, fy);
        ctx.lineTo(fx + 1, fy - 8);
        ctx.stroke();
        ellipse(
          ctx,
          fx + 1,
          fy - 8,
          2.5,
          2.5,
          alive ? ["#f3cc8e", "#edb1a0", "#dce8b9", "#f3cc8e"][i] : "#759687",
        );
      }
    }
  }

  function drawShrub(object) {
    const { x, y } = project(object.x, object.y);
    ctx.globalAlpha = object.stage <= frontier ? 0.9 : 0.36;
    if (terrainImage.complete && terrainImage.naturalWidth) {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(terrainImage, 0, 96, 16, 16, x - 13, y - 17, 26, 26);
      ctx.imageSmoothingEnabled = true;
    }
    ctx.globalAlpha = 1;
  }

  function drawBeacon(object, time) {
    const { x, y } = project(object.x, object.y);
    const open = unlocked(object.index);
    const done = completed.has(object.index);
    const selected = object.index === active;
    const next = object.index === frontier && !done;
    const pulse = reducedMotion.matches ? 0.5 : (Math.sin(time / 600) + 1) / 2;
    if (open && (selected || next)) {
      ellipse(ctx, x, y, 22 + pulse * 3, 10 + pulse, "#ccebb31c");
      ctx.strokeStyle = "#d5eaa75c";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(x, y, 19 + pulse * 3, 9 + pulse, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    diamond(ctx, x, y + 2, 12, 6, open ? "#5d8678" : "#3b5754");
    diamond(ctx, x, y - 1, 11, 5, open ? "#b8c7a0" : "#7a8c79");
    ctx.fillStyle = open ? "#c4c6a1" : "#698276";
    ctx.fillRect(x - 2, y - 27, 4, 25);
    if (done) {
      polygon(
        ctx,
        [
          [x + 2, y - 27],
          [x + 15, y - 25],
          [x + 12, y - 17],
          [x + 2, y - 18],
        ],
        "#9ec48c",
      );
      ctx.strokeStyle = "#244f48";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(x + 5, y - 23);
      ctx.lineTo(x + 7, y - 20);
      ctx.lineTo(x + 11, y - 24);
      ctx.stroke();
    } else if (open) {
      const light = ctx.createRadialGradient(x, y - 27, 0, x, y - 27, 17);
      light.addColorStop(0, "#e4e9a64d");
      light.addColorStop(1, "#e4e9a600");
      ctx.fillStyle = light;
      ctx.fillRect(x - 17, y - 44, 34, 34);
      diamond(ctx, x, y - 28, 5, 8, "#e5eabb");
      diamond(ctx, x - 1, y - 29, 2, 5, "#fff4ca");
    } else {
      diamond(ctx, x, y - 27, 4, 6, "#94a18a");
    }
    if (!exploring && !selected) return;
    const radius = Math.max(10, Math.min(13, 9.5 / camera.scale));
    const labelY = y - 46;
    ellipse(
      ctx,
      x,
      labelY,
      radius + 1,
      radius + 1,
      selected && open ? "#e3e8bc" : open ? "#9dbb94" : "#5d7b70",
    );
    ellipse(ctx, x, labelY, radius, radius, open ? "#163a3d" : "#254442");
    ctx.fillStyle = open ? "#f0efd1" : "#9bb2a2";
    ctx.font = `600 ${Math.max(10, Math.min(14, 10 / camera.scale))}px ui-monospace, SFMono-Regular, monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(object.index + 1).padStart(2, "0"), x, labelY + 0.5);
  }

  function drawCrystal(object, time) {
    if (!availableReward(object.index)) return;
    const point = project(object.x, object.y);
    const bob = reducedMotion.matches
      ? 0
      : Math.sin(time / 400 + object.index) * 2;
    drawGem(point.x, point.y, bob);
  }

  function drawGem(px, py, bob = 0) {
    const x = px;
    const y = py - 10 + bob;
    ellipse(ctx, x, py + 1, 9, 4, "#f2cc7440");
    const glow = ctx.createRadialGradient(x, y, 0, x, y, 21);
    glow.addColorStop(0, "#ffd56a45");
    glow.addColorStop(1, "#ffd56a00");
    ctx.fillStyle = glow;
    ctx.fillRect(x - 21, y - 21, 42, 42);
    polygon(
      ctx,
      [
        [x, y - 12],
        [x + 7, y - 3],
        [x + 5, y + 5],
        [x, y + 11],
        [x - 6, y + 3],
        [x - 7, y - 4],
      ],
      "#efb957",
      "#fff0af",
    );
    polygon(
      ctx,
      [
        [x, y - 12],
        [x, y + 11],
        [x - 6, y + 3],
        [x - 7, y - 4],
      ],
      "#ffe293",
    );
    polygon(
      ctx,
      [
        [x, y - 12],
        [x + 7, y - 3],
        [x, y + 1],
      ],
      "#fff2b0",
    );
    ctx.fillStyle = "#fff2be";
    ctx.fillRect(x + 12, y - 10, 1, 5);
    ctx.fillRect(x + 10, y - 8, 5, 1);
  }

  // Scene props mirror the quest's DOM: each mapped element becomes one object near the beacon.
  function placeProps() {
    const [lx, ly] = LANDMARKS[active];
    const reserved = new Set([
      ...LANDMARKS.map(([x, y]) => keyOf(x, y)),
      ...rewards.map(({ x, y }) => keyOf(x, y)),
    ]);
    const slots = [];
    for (let dy = -3; dy <= 3; dy += 1)
      for (let dx = -3; dx <= 3; dx += 1) {
        const tile = tiles.get(keyOf(lx + dx, ly + dy));
        if (tile && !tile.bridge && !reserved.has(keyOf(tile.x, tile.y)))
          slots.push({
            x: tile.x,
            y: tile.y,
            // Nearest first, off the trail first, and toward the camera so labels stay clear.
            rank: Math.max(Math.abs(dx), Math.abs(dy)) * 10 + (tile.path ? 5 : 0) - (dx + dy) * 0.1,
          });
      }
    slots.sort((a, b) => a.rank - b.rank);
    const visible = props.slice(0, slots.length);
    propTiles = new Set(visible.map((_, i) => keyOf(slots[i].x, slots[i].y)));
    placedProps = visible.map((prop, i) => ({
      x: slots[i].x,
      y: slots[i].y,
      type: "prop",
      prop,
      row: i,
    }));
  }

  // Tall scenery near the active quest would hide its props while coding.
  function onStage(object) {
    if (exploring || (object.type !== "tree" && object.type !== "ruin"))
      return false;
    const [lx, ly] = LANDMARKS[active];
    return Math.max(Math.abs(object.x - lx), Math.abs(object.y - ly)) <= 3;
  }

  function setScene(nextProps) {
    props = Array.isArray(nextProps) ? nextProps : [];
    placeProps();
    render();
    requestFrame();
  }

  function drawLabel(text, x, y, color) {
    if (!text) return;
    const label = text.length > 18 ? `${text.slice(0, 17)}…` : text;
    ctx.font = "600 7px ui-monospace, SFMono-Regular, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const w = ctx.measureText(label).width + 8;
    ctx.fillStyle = "#132e2ce6";
    ctx.fillRect(x - w / 2, y - 6, w, 12);
    ctx.fillStyle = "#9dbb94";
    ctx.fillRect(x - w / 2, y + 5, w, 1);
    ctx.fillStyle = color || "#f0efd1";
    ctx.fillText(label, x, y + 0.5);
  }

  function drawProp(object, time) {
    const { prop } = object;
    if (prop.hidden) return;
    const { x, y } = project(object.x, object.y);
    const lit = prop.lit;
    const base = { x: object.x, y: object.y, stage: 0, variant: 0.6 };
    let top = y - 30;
    if (prop.kind === "beacon") {
      diamond(ctx, x, y + 2, 10, 5, "#5d8678");
      ctx.fillStyle = "#c4c6a1";
      ctx.fillRect(x - 2, y - 24, 4, 24);
      if (lit) {
        const glow = ctx.createRadialGradient(x, y - 26, 0, x, y - 26, 16);
        glow.addColorStop(0, "#ffe7a060");
        glow.addColorStop(1, "#ffe7a000");
        ctx.fillStyle = glow;
        ctx.fillRect(x - 16, y - 42, 32, 32);
        diamond(ctx, x, y - 27, 5, 8, prop.color || "#ffe293");
        diamond(ctx, x - 1, y - 28, 2, 5, "#fff4ca");
      } else diamond(ctx, x, y - 26, 4, 5, "#7a8c79");
      top = y - 44;
    } else if (prop.kind === "tree") {
      if (lit) {
        drawTree(base);
        top = y - 56;
      } else {
        ctx.fillStyle = "#806c51";
        ctx.fillRect(x - 1, y - 9, 2, 9);
        ellipse(ctx, x - 4, y - 9, 4, 2, "#62a67b");
        ellipse(ctx, x + 4, y - 11, 4, 2, "#7ab785");
        top = y - 22;
      }
    } else if (prop.kind === "flowers") {
      drawFlowers(base);
      top = y - 20;
    } else if (prop.kind === "ruin") {
      drawRuin(base);
      top = y - 44;
    } else if (prop.kind === "crystal") {
      drawGem(x, y, reducedMotion.matches ? 0 : Math.sin(time / 400) * 2);
      top = y - 30;
    } else if (prop.kind === "patch") {
      diamond(ctx, x, y + 1, 19, 9.5, prop.background || "#6b5a48", "#132e2c55");
      top = y - 14;
    } else if (prop.kind === "fog") {
      ctx.save();
      ctx.translate(x, y - 14);
      ctx.scale(0.42, 0.42);
      for (const [dx, alpha] of [[0, 0.8], [-8, 0.5]]) {
        ctx.fillStyle = `rgba(200, 222, 214, ${alpha})`;
        ctx.beginPath();
        ctx.ellipse(dx, 0, 44, 16, 0, 0, Math.PI * 2);
        ctx.ellipse(dx - 12, -12, 20, 14, 0, 0, Math.PI * 2);
        ctx.ellipse(dx + 14, -10, 18, 12, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      top = y - 30;
    } else if (prop.kind === "boat") {
      ellipse(ctx, x, y + 3, 17, 5, "#0a353a70");
      polygon(ctx, [[x - 16, y - 4], [x + 16, y - 4], [x + 10, y + 3], [x - 11, y + 3]], "#806c51");
      ctx.fillStyle = "#c4c6a1";
      ctx.fillRect(x - 1, y - 30, 2, 26);
      polygon(ctx, [[x + 1, y - 29], [x + 13, y - 8], [x + 1, y - 7]], prop.color || "#e8e2c4");
      top = y - 40;
    } else if (prop.kind === "bridge") {
      diamond(ctx, x, y + 3, 20, 9, "#634d3d");
      if (lit) diamond(ctx, x, y, 20, 9, "#bea272");
      else {
        polygon(ctx, [[x - 20, y], [x - 4, y - 8], [x - 1, y - 5], [x - 17, y + 3]], "#8b7a5c");
        polygon(ctx, [[x + 3, y + 5], [x + 19, y - 3], [x + 16, y + 1], [x + 1, y + 9]], "#8b7a5c");
      }
      for (const side of [-1, 1]) {
        ctx.fillStyle = "#ceb17c";
        ctx.fillRect(x + side * 16 - 1, y - 12, 3, 14);
      }
      top = y - 24;
    } else if (prop.kind === "gate") {
      ctx.fillStyle = "#806c51";
      ctx.fillRect(x - 14, y - 20, 4, 22);
      ctx.fillRect(x + 10, y - 20, 4, 22);
      ctx.fillStyle = "#bea272";
      if (lit) ctx.fillRect(x + 6, y - 30, 3, 20);
      else {
        ctx.fillRect(x - 10, y - 16, 20, 3);
        ctx.fillRect(x - 10, y - 8, 20, 3);
      }
      top = y - 34;
    } else {
      // Default "sign": a post whose board is the element's text.
      ctx.fillStyle = "#806c51";
      ctx.fillRect(x - 1, y - 18, 3, 19);
      ellipse(ctx, x, y + 1, 6, 3, "#0a353a50");
      top = y - 22;
    }
    // Alternate label heights so neighbours' text does not collide.
    drawLabel(prop.text, x, top - (object.row % 2) * 9, prop.color);
  }

  function heroPosition(now) {
    if (!step || reducedMotion.matches) return step ? step.to : hero;
    const progress = Math.min(1, (now - step.start) / STEP_TIME);
    return {
      x: step.from.x + (step.to.x - step.from.x) * progress,
      y: step.from.y + (step.to.y - step.from.y) * progress,
    };
  }

  function drawHero(position, now) {
    const { x, y } = project(position.x, position.y);
    ellipse(ctx, x, y + 1, 11, 5, "#0a353a70");
    if (exploring) {
      ctx.strokeStyle = focused ? "#f0e7acbb" : "#ddedc55c";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(x, y + 1, 14, 7, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    if (heroImage.complete && heroImage.naturalWidth) {
      const frame =
        step && !reducedMotion.matches ? Math.floor(now / 95) % 4 : 0;
      const row = hero.facing === 1 ? 1 : hero.facing === 2 ? 2 : 0;
      ctx.imageSmoothingEnabled = false;
      ctx.save();
      ctx.translate(x, y - 20);
      if (hero.facing === 3) ctx.scale(-1, 1);
      ctx.drawImage(heroImage, frame * 32, row * 32, 32, 32, -24, -24, 48, 48);
      ctx.restore();
      ctx.imageSmoothingEnabled = true;
    }
  }

  function drawCloud(x, y, scale, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.fillStyle = `rgba(174, 208, 192, ${alpha})`;
    ctx.beginPath();
    ctx.moveTo(-40, 7);
    ctx.bezierCurveTo(-60, 7, -55, -10, -36, -9);
    ctx.bezierCurveTo(-40, -30, -3, -38, 4, -16);
    ctx.bezierCurveTo(24, -30, 48, -17, 42, -2);
    ctx.bezierCurveTo(62, -5, 65, 11, 41, 13);
    ctx.bezierCurveTo(9, 20, -17, 14, -40, 7);
    ctx.fill();
    ctx.restore();
  }

  function render(now = performance.now()) {
    if (destroyed) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(backdrop, 0, 0);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const motionTime = reducedMotion.matches ? 0 : now;
    for (let i = 0; i < 15; i += 1) {
      const sx = noise(i, 17) * width;
      const sy = noise(i, 19) * height;
      const alpha = 0.12 + (Math.sin(motionTime / 1600 + i * 2) + 1) * 0.08;
      ctx.fillStyle = `rgba(193, 225, 204, ${alpha})`;
      ctx.fillRect(sx, sy, i % 3 === 0 ? 7 : 3, 1);
      if (i % 3 === 0) ctx.fillRect(sx + 3, sy - 2, 1, 5);
    }
    ctx.save();
    worldTransform(ctx);
    if (destination && exploring) {
      const point = project(destination.x, destination.y);
      ctx.lineWidth = 1.5 / camera.scale;
      diamond(ctx, point.x, point.y, 17, 8, "#f6eab023", "#f2e0a799");
    }
    const position = heroPosition(now);
    const depth = position.x + position.y;
    let heroDrawn = false;
    const objects = placedProps.length
      ? [
          ...scenery.filter((o) => !propTiles.has(keyOf(o.x, o.y)) && !onStage(o)),
          ...placedProps,
        ].sort((a, b) => a.x + a.y - b.x - b.y || a.x - b.x)
      : scenery;
    for (const object of objects) {
      if (!heroDrawn && object.x + object.y > depth) {
        drawHero(position, now);
        heroDrawn = true;
      }
      if (object.type === "tree") drawTree(object);
      else if (object.type === "ruin") drawRuin(object);
      else if (object.type === "flowers") drawFlowers(object);
      else if (object.type === "shrub") drawShrub(object);
      else if (object.type === "beacon") drawBeacon(object, motionTime);
      else if (object.type === "prop") drawProp(object, motionTime);
      else drawCrystal(object, motionTime);
    }
    if (!heroDrawn) drawHero(position, now);
    if (collectionBurst && !reducedMotion.matches) {
      const elapsed = (now - collectionBurst.start) / 700;
      if (elapsed >= 1) collectionBurst = null;
      else {
        const point = project(collectionBurst.x, collectionBurst.y);
        ctx.globalAlpha = 1 - elapsed;
        for (let i = 0; i < 8; i += 1) {
          const angle = (i * Math.PI) / 4;
          const radius = 10 + elapsed * 28;
          diamond(
            ctx,
            point.x + Math.cos(angle) * radius,
            point.y - 16 + Math.sin(angle) * radius * 0.65 - elapsed * 15,
            2,
            3,
            "#ffe19b",
          );
        }
        ctx.globalAlpha = 1;
      }
    }
    ctx.restore();
    const drift = Math.sin(motionTime / 9000) * 7;
    drawCloud(width * 0.84 + drift, height * 0.19, 0.65, 0.055);
    drawCloud(width * 0.09 - drift, height * 0.69, 0.6, 0.055);
    drawCloud(width * 0.86 - drift, height * 0.84, 0.82, 0.04);
  }

  function requestFrame() {
    if (!destroyed && !animationId && !document.hidden)
      animationId = requestAnimationFrame(tick);
  }

  function reachCurrentTile(collectReward) {
    if (collectReward) {
      for (const reward of rewards) {
        if (
          reward.x !== hero.x ||
          reward.y !== hero.y ||
          !availableReward(reward.index)
        )
          continue;
        pendingCollections.add(reward.index);
        collectionBurst = { x: hero.x, y: hero.y, start: performance.now() };
        onCollect(reward.index);
      }
    }
    const index = LANDMARKS.findIndex(([x, y]) => x === hero.x && y === hero.y);
    if (index !== -1 && unlocked(index)) {
      if (lastReached !== index) {
        lastReached = index;
        onReach(index);
      }
    } else lastReached = null;
  }

  function beginStep(now) {
    if (!exploring || step || !route.length) return;
    const next = route.shift();
    if (!passable(next.x, next.y)) {
      route = [];
      destination = null;
      return;
    }
    if (next.y < hero.y) hero.facing = 1;
    else if (next.x > hero.x) hero.facing = 2;
    else if (next.x < hero.x) hero.facing = 3;
    else hero.facing = 0;
    step = { from: { x: hero.x, y: hero.y }, to: next, start: now };
  }

  function tick(now) {
    animationId = 0;
    if (destroyed || document.hidden) return;
    if (step && now - step.start >= STEP_TIME) {
      hero.x = step.to.x;
      hero.y = step.to.y;
      step = null;
      if (!route.length) destination = null;
      reachCurrentTile(true);
    }
    beginStep(now);
    if (now - lastFrame >= 32 || reducedMotion.matches) {
      render(now);
      lastFrame = now;
    }
    if (!reducedMotion.matches || step || route.length) requestFrame();
  }

  function findRoute(targetX, targetY) {
    if (!passable(targetX, targetY)) return null;
    const start = step ? step.to : hero;
    const startKey = keyOf(start.x, start.y);
    const targetKey = keyOf(targetX, targetY);
    const queue = [{ x: start.x, y: start.y }];
    const previous = new Map([[startKey, null]]);
    for (let cursor = 0; cursor < queue.length; cursor += 1) {
      const current = queue[cursor];
      if (keyOf(current.x, current.y) === targetKey) {
        const result = [];
        let point = current;
        while (keyOf(point.x, point.y) !== startKey) {
          result.push(point);
          point = previous.get(keyOf(point.x, point.y));
        }
        return result.reverse();
      }
      for (const [dx, dy] of Object.values(DIRECTIONS)) {
        const x = current.x + dx;
        const y = current.y + dy;
        const key = keyOf(x, y);
        if (!passable(x, y) || previous.has(key)) continue;
        previous.set(key, current);
        queue.push({ x, y });
      }
    }
    return null;
  }

  function navigate(x, y) {
    const nextRoute = findRoute(x, y);
    if (nextRoute === null) return false;
    route = nextRoute;
    destination = route.length ? { x, y } : null;
    if (!route.length && !step) reachCurrentTile(true);
    beginStep(performance.now());
    requestFrame();
    render();
    return true;
  }

  function move(direction) {
    if (!exploring || destroyed || !DIRECTIONS[direction]) return false;
    const [dx, dy] = DIRECTIONS[direction];
    const origin = step ? step.to : hero;
    const x = origin.x + dx;
    const y = origin.y + dy;
    route = [];
    if (!passable(x, y)) {
      destination = null;
      return false;
    }
    route = [{ x, y }];
    destination = { x, y };
    beginStep(performance.now());
    requestFrame();
    return true;
  }

  function onKeyDown(event) {
    if (
      !exploring ||
      document.activeElement !== canvas ||
      event.altKey ||
      event.metaKey ||
      event.ctrlKey
    )
      return;
    const direction =
      KEY_DIRECTIONS[event.key] || KEY_DIRECTIONS[event.key.toLowerCase()];
    if (!direction) return;
    event.preventDefault();
    move(direction);
  }

  function onPointerDown(event) {
    if (!exploring || event.button !== 0) return;
    canvas.focus({ preventScroll: true });
    const bounds = canvas.getBoundingClientRect();
    const localX = ((event.clientX - bounds.left) * width) / bounds.width;
    const localY = ((event.clientY - bounds.top) * height) / bounds.height;
    const x = (localX - camera.x) / camera.scale;
    const y = (localY - camera.y) / camera.scale;
    for (const reward of rewards) {
      if (!availableReward(reward.index)) continue;
      const point = project(reward.x, reward.y);
      if (Math.abs(x - point.x) < 13 && Math.abs(y - (point.y - 10)) < 20) {
        navigate(reward.x, reward.y);
        return;
      }
    }
    for (let index = 0; index < LANDMARKS.length; index += 1) {
      const [tx, ty] = LANDMARKS[index];
      const point = project(tx, ty);
      if (Math.hypot(x - point.x, y - point.y + 46) < 16) {
        if (unlocked(index)) navigate(tx, ty);
        return;
      }
    }
    const tileX = Math.round((x / HALF_WIDTH + y / HALF_HEIGHT) / 2);
    const tileY = Math.round((y / HALF_HEIGHT - x / HALF_WIDTH) / 2);
    navigate(tileX, tileY);
  }

  function resize() {
    if (destroyed) return;
    const bounds = canvas.getBoundingClientRect();
    width = Math.max(1, bounds.width);
    height = Math.max(1, bounds.height);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    const topMargin = width < 430 ? 70 : 74;
    const bottomMargin = width < 430 ? 49 : 47;
    const minX = -274;
    const maxX = 274;
    const minY = -35;
    const maxY = 352;
    const scale = Math.max(
      0.15,
      Math.min(
        (width - 22) / (maxX - minX),
        (height - topMargin - bottomMargin) / (maxY - minY),
      ),
    );
    islandCamera = {
      scale,
      x: width / 2,
      y:
        topMargin +
        (height - topMargin - bottomMargin - (maxY - minY) * scale) / 2 -
        minY * scale,
    };
    frameCamera();
  }

  // While coding, zoom onto the active quest so its scene props read as the preview.
  function frameCamera() {
    if (exploring) camera = islandCamera;
    else {
      const [lx, ly] = LANDMARKS[active];
      const point = project(lx, ly);
      const scale = Math.min(islandCamera.scale * 3.6, 3);
      camera = {
        scale,
        x: width / 2 - point.x * scale,
        y: height * 0.56 - point.y * scale,
      };
    }
    paintBackdrop();
    render();
    requestFrame();
  }

  function setProgress({
    completed: nextCompleted = [],
    active: nextActive = 0,
    collected: nextCollected = [],
  } = {}) {
    completed = validIndices(nextCompleted);
    collected = validIndices(nextCollected);
    for (const index of pendingCollections)
      if (!completed.has(index) || collected.has(index))
        pendingCollections.delete(index);
    frontier = 0;
    while (frontier < LANDMARKS.length - 1 && completed.has(frontier))
      frontier += 1;
    active = unlocked(nextActive) ? nextActive : frontier;
    if (!passable(hero.x, hero.y)) {
      const [x, y] = LANDMARKS[active];
      hero = { x, y, facing: 0 };
      step = null;
      route = [];
      destination = null;
      lastReached = null;
    }
    if (step && !passable(step.to.x, step.to.y)) {
      step = null;
      route = [];
      destination = null;
    }
    placeProps();
    frameCamera();
  }

  function travelTo(index) {
    if (destroyed || !unlocked(index)) return false;
    const [x, y] = LANDMARKS[index];
    if (exploring) return navigate(x, y);
    route = [];
    step = null;
    destination = null;
    hero.x = x;
    hero.y = y;
    reachCurrentTile(false);
    render();
    requestFrame();
    return true;
  }

  function setExploring(value) {
    exploring = Boolean(value);
    canvas.style.cursor = exploring ? "crosshair" : "default";
    if (!exploring) {
      route = [];
      step = null;
      destination = null;
    }
    frameCamera();
  }

  const onFocus = () => {
    focused = true;
    render();
  };
  const onBlur = () => {
    focused = false;
    route = [];
    destination = null;
    render();
  };
  const onMotionChange = () => {
    render();
    requestFrame();
  };
  const onVisibilityChange = () => {
    if (document.hidden) {
      cancelAnimationFrame(animationId);
      animationId = 0;
    } else {
      if (step) step.start = performance.now();
      requestFrame();
    }
  };
  const onImageLoad = () => {
    if (!destroyed) {
      render();
      requestFrame();
    }
  };
  heroImage.addEventListener("load", onImageLoad);
  terrainImage.addEventListener("load", onImageLoad);
  heroImage.src = HERO_URL;
  terrainImage.src = TERRAIN_URL;
  canvas.addEventListener("keydown", onKeyDown);
  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("focus", onFocus);
  canvas.addEventListener("blur", onBlur);
  reducedMotion.addEventListener("change", onMotionChange);
  document.addEventListener("visibilitychange", onVisibilityChange);
  window.addEventListener("resize", resize);
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  resize();

  return {
    setProgress,
    setScene,
    travelTo,
    setExploring,
    move,
    focus() {
      if (!destroyed) canvas.focus({ preventScroll: true });
    },
    destroy() {
      destroyed = true;
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("keydown", onKeyDown);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("focus", onFocus);
      canvas.removeEventListener("blur", onBlur);
      reducedMotion.removeEventListener("change", onMotionChange);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      heroImage.removeEventListener("load", onImageLoad);
      terrainImage.removeEventListener("load", onImageLoad);
      if (originalTabIndex === null) canvas.removeAttribute("tabindex");
      else canvas.setAttribute("tabindex", originalTabIndex);
      if (originalLabel === null) canvas.removeAttribute("aria-label");
      else canvas.setAttribute("aria-label", originalLabel);
      canvas.style.cursor = originalCursor;
      route = [];
      step = null;
    },
  };
}
