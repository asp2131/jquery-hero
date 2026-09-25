import Phaser from "phaser";
import heroSheet from "../IsometricBaseCharacter/Base_SpriteSheet.png";
import slimeSheet from "../animated slime/64x64/Stanby.png";

// Licensed art is gitignored; Vite bundles only these files into builds.
const tiles = Object.fromEntries(
  Object.entries(
    import.meta.glob(
      "../Isometric dungeon tiles 2d by RgsDev/Isometric tiles/{Ground1,Ground2,Ground3,Grass1,Grass3,Wall left,Wall right,Wall corner,Door Left,Wooden box,Chest Left,Barrel,Jail Bar Left,Jail Bar Right,Lever Left}.png",
      { eager: true, query: "?url", import: "default" },
    ),
  ).map(([path, url]) => [path.split("/").pop().slice(0, -4), url]),
);

// Floor is 0..SIZE-1. Walls stand on row/column -1; grass rims the front and the open left side.
const SIZE = 7;
const HERO_SPAWN = [2, 4];
// A 256×512 tile drawn at half size: its top-face centre sits 144px below the image top.
const iso = (x, y, level = 0) => [(x - y) * 64, (x + y) * 32 - level * 80];
const depthOf = (x, y, level = 0) => 10 + (x + y) * 4 + level;

// One character sheet, three looks: hue shifts turn the green base into hero and villager.
const KINDS = {
  hero: { hue: 100 },
  villager: { hue: -70, bar: 0x5be37d },
  goblin: { bar: 0xff6b7a, enemy: true },
  boss: { bar: 0xff6b7a, enemy: true, scale: 1.4 },
  slime: {},
  smoke: {},
  label: {},
  jail: { tile: "Jail Bar Left" },
  gate: { tile: "Jail Bar Left" },
  lever: { tile: "Lever Left" },
};

const palette = document.createElement("canvas").getContext("2d");
const colorInt = (css) => {
  palette.fillStyle = "#000";
  palette.fillStyle = css;
  return palette.fillStyle.startsWith("#") ? parseInt(palette.fillStyle.slice(1), 16) : 0xffffff;
};
const calm = matchMedia("(prefers-reduced-motion: reduce)");

class ArenaScene extends Phaser.Scene {
  actors = new Map();
  pending = null;

  preload() {
    for (const [name, url] of Object.entries(tiles)) this.load.image(name, url);
    this.load.spritesheet("hero", heroSheet, { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet("slime", slimeSheet, { frameWidth: 64, frameHeight: 64 });
  }

  create() {
    for (const key of ["hero", "slime"])
      this.textures.get(key).setFilter(Phaser.Textures.FilterMode.NEAREST);
    const frames = (key, start, end) => this.anims.generateFrameNumbers(key, { start, end });
    this.anims.create({ key: "idle", frames: frames("hero", 12, 15), frameRate: 5, repeat: -1 });
    this.anims.create({ key: "cast", frames: frames("hero", 24, 27), frameRate: 10, repeat: 2 });
    this.anims.create({ key: "walk", frames: frames("hero", 0, 3), frameRate: 10, repeat: -1 });
    this.anims.create({ key: "slime", frames: frames("slime", 0, 13), frameRate: 7, repeat: -1 });
    this.add.graphics().fillStyle(0xffffff).fillCircle(4, 4, 4).generateTexture("dot", 8, 8).destroy();
    this.board();
    this.scale.on("resize", () => this.fit());
    this.fit();
    if (this.pending) this.render(...this.pending);
  }

  // Selector tags ride above every sprite so bars and neighbours never hide them.
  update() {
    for (const box of this.children.list) box.tag?.setPosition(box.x, box.y + box.tagY).setAlpha(box.alpha);
  }

  fit() {
    const { width, height } = this.scale;
    this.cameras.main.setZoom(Math.min(width / 1260, height / 840)).centerOn(-32, 170);
  }

  tile(name, x, y, level = 0, depth = level ? depthOf(x, y, level) : -100 + (x + y) / 100) {
    const [sx, sy] = iso(x, y, level);
    return this.add.image(sx, sy - 144, name).setOrigin(0.5, 0).setScale(0.5).setDepth(depth);
  }

  board() {
    for (let y = -1; y <= SIZE; y += 1)
      for (let x = -2; x <= SIZE; x += 1) {
        if (x === -2 && y < 3) continue;
        const grass = x === SIZE || y === SIZE || (x < 0 && y >= 3);
        this.tile(grass ? `Grass${(x + y) % 3 ? 1 : 3}` : `Ground${[1, 1, 2, 1, 3][(x * 3 + y * 7 + 20) % 5]}`, x, y);
      }
    for (const level of [1, 2]) {
      this.tile("Wall corner", -1, -1, level);
      for (let i = 0; i < SIZE; i += 1) this.tile(i === 4 && level === 1 ? "Door Left" : "Wall left", i, -1, level);
      for (let i = 0; i < 3; i += 1) this.tile("Wall right", -1, i, level);
    }
    // The villager's lookout block and a little decoration.
    this.tile("Grass1", -1, 4, 1);
    this.tile("Grass3", -2, 6, 1);
    this.tile("Wooden box", 1, 0, 1);
    this.tile("Chest Left", 6, 0, 1);
    this.tile("Barrel", 0, 0, 1);
  }

  spawn(a) {
    const kind = KINDS[a.kind];
    const [sx, sy] = iso(a.x, a.y, a.level);
    // Props sort just in front of a character on the same tile, so a cage's bars cover its prisoner.
    const box = this.add.container(sx, sy).setDepth(depthOf(a.x, a.y, a.level) + (kind.tile ? 3.5 : 3));
    const g = this.add.graphics();
    const diamond = (w) => [new Phaser.Math.Vector2(0, -w / 4), new Phaser.Math.Vector2(w / 2, 0), new Phaser.Math.Vector2(0, w / 4), new Phaser.Math.Vector2(-w / 2, 0)];
    // background-color paints the ground under a character; color makes it glow.
    if (a.background) g.fillStyle(colorInt(a.background), 0.7).fillPoints(diamond(120), true);
    if (kind.enemy) g.lineStyle(3, 0x22d6f2, 0.9).strokePoints(diamond(104), true);
    box.add(g);
    let body;
    if (kind.tile) {
      body = this.add.image(0, -224, kind.tile).setOrigin(0.5, 0).setScale(0.5);
      if (a.kind === "gate" && a.on) body.setAlpha(0.15);
      if (a.kind === "jail") box.add(this.add.image(0, -224, "Jail Bar Right").setOrigin(0.5, 0).setScale(0.5));
    } else if (a.kind === "smoke") {
      body = this.add.container(0, -30);
      for (const [x, y, r] of [[-26, 0, 26], [22, -4, 30], [0, -26, 30], [-4, 10, 24]])
        body.add(this.add.circle(x, y, r, 0xb8c4d0, 0.8));
    } else if (a.kind === "slime") {
      g.fillStyle(0x000000, 0.3).fillEllipse(0, 0, 60, 18);
      body = this.add.sprite(0, 10, "slime").setOrigin(0.5, 1).setScale(1.5).play({ key: "slime", startFrame: Phaser.Math.Between(0, 13) });
    } else if (a.kind !== "label") {
      g.fillStyle(0x000000, 0.3).fillEllipse(0, 0, 70, 22);
      body = this.add.sprite(0, 6, "hero").setOrigin(0.5, 1).setScale(4 * (kind.scale || 1)).play({ key: "idle", startFrame: Phaser.Math.Between(0, 3) });
      if (kind.hue) body.preFX?.addColorMatrix().hue(kind.hue);
    }
    if (body) box.add(body);
    if (a.color && body?.preFX) body.preFX.addGlow(colorInt(a.color), 6, 0, false, 0.1, 12);
    if (a.kind === "slime" && a.on && body?.preFX) body.preFX.addGlow(0x22d6f2, 4, 0, false, 0.1, 12);
    if (a.kind === "hero" && a.on && body?.preFX) body.preFX.addGlow(0x22d6f2, 5, 0, false, 0.1, 12);
    if (a.classes.includes("shielded"))
      box.add(this.add.circle(0, -64, 70, 0x22d6f2, 0.14).setStrokeStyle(3, 0x7ef0ff, 0.9));
    const top = kind.tile ? -150 : a.kind === "label" ? 0 : -140 * (kind.scale || 1);
    if (kind.bar) {
      const hp = kind.enemy && a.on ? 0.35 : 1;
      box.add(this.add.rectangle(-26, top, 52, 8, 0x07182c).setOrigin(0, 0.5));
      box.add(this.add.rectangle(-24, top, 48 * hp, 4, kind.bar).setOrigin(0, 0.5));
    }
    const label = (text, y, style) => box.add(this.add.text(0, y, text, { resolution: 2, ...style }).setOrigin(0.5, 1));
    if (a.text) label(a.text, top - 10, { fontFamily: "'Space Mono', monospace", fontSize: "20px", fontStyle: "bold", color: "#fff", backgroundColor: "#07182cdd", padding: { x: 8, y: 4 } });
    box.setAlpha(a.hidden ? 0 : 1);
    // A prop's tag sits a row lower, clear of the tag of whoever stands in it.
    const tag = a.tag && this.add.text(0, 0, a.tag, { resolution: 2, fontFamily: "'DM Mono', monospace", fontSize: "18px", fontStyle: "bold", color: "#7ef0ff", stroke: "#04101e", strokeThickness: 5 }).setOrigin(0.5, 1).setDepth(900);
    if (tag) box.once("destroy", () => tag.destroy());
    return Object.assign(box, { a, body, tag, tagY: kind.tile ? 60 : 34 });
  }

  render(list, animate) {
    if (!list.some((a) => a.kind === "hero"))
      list = [...list, { key: "hero", kind: "hero", x: HERO_SPAWN[0], y: HERO_SPAWN[1], level: 0, classes: [] }];
    animate &&= !calm.matches;
    const old = this.actors;
    const changes = [];
    this.actors = new Map();
    for (const a of list) {
      const prev = old.get(a.key);
      old.delete(a.key);
      const sig = JSON.stringify(a);
      if (prev?.sig === sig) {
        this.actors.set(a.key, prev);
        continue;
      }
      prev?.destroy();
      const actor = Object.assign(this.spawn(a), { sig });
      this.actors.set(a.key, actor);
      if (animate) changes.push([actor, prev?.a]);
    }
    for (const gone of old.values()) animate ? changes.push([gone, gone.a, true]) : gone.destroy();
    if (!animate || !changes.length) return;

    const hero = [...this.actors.values()].find((actor) => actor.a.kind === "hero");
    hero.body.play("cast").chain("idle");
    changes.forEach(([actor, before, removed], i) => {
      // Hold the new state until the bolt lands, so the change reads as cause → effect.
      const shown = !actor.a.hidden && !removed;
      if (before) actor.setAlpha(before.hidden ? 0 : 1);
      else actor.setAlpha(0);
      if (before && (before.x !== actor.a.x || before.y !== actor.a.y || before.level !== actor.a.level))
        actor.setPosition(...iso(before.x, before.y, before.level));
      this.time.delayedCall(250 + i * 160, () => {
        if (actor !== hero) this.bolt(hero, actor);
        this.time.delayedCall(220, () => this.land(actor, before, shown, removed));
      });
    });
  }

  bolt(from, to) {
    const [x1, y1, x2, y2] = [from.x + 28, from.y - 80, to.x, to.y - 60];
    const points = Array.from({ length: 9 }, (_, i) => {
      const t = i / 8;
      const jitter = i % 8 ? Phaser.Math.Between(-16, 16) : 0;
      return new Phaser.Math.Vector2(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t + jitter);
    });
    const g = this.add.graphics().setDepth(1000).setBlendMode(Phaser.BlendModes.ADD);
    g.lineStyle(14, 0x22d6f2, 0.3).strokePoints(points).lineStyle(4, 0xc8fbff, 1).strokePoints(points);
    this.tweens.add({ targets: g, alpha: 0, duration: 420, delay: 120, onComplete: () => g.destroy() });
  }

  land(actor, before, shown, removed) {
    const { a } = actor;
    if (removed || (before && !before.hidden && a.hidden)) this.poof(actor);
    if (removed) return this.tweens.add({ targets: actor, alpha: 0, duration: 250, onComplete: () => actor.destroy() });
    const [x, y] = iso(a.x, a.y, a.level);
    if (actor.x !== x || actor.y !== y) {
      const walker = actor.body?.texture?.key === "hero";
      if (walker) actor.body.play("walk");
      this.tweens.add({ targets: actor, x, y, duration: 900, ease: "Sine.inOut", onComplete: () => walker && actor.body.play("idle") });
    }
    if (shown && (!before || before.hidden)) this.poof(actor);
    this.tweens.add({ targets: actor, alpha: shown ? 1 : 0, duration: 300 });
    actor.body?.setTintFill?.(0xffffff);
    this.time.delayedCall(90, () => actor.body?.clearTint?.());
    this.tweens.add({ targets: actor, scale: { from: 1.12, to: 1 }, duration: 260, ease: "Back.out" });
    if (KINDS[a.kind].enemy && a.on) {
      actor.body.setTint(0xff8a95);
      this.time.delayedCall(400, () => actor.body.clearTint());
      const pop = this.add.text(actor.x + 50, actor.y - 140, /^\d+$/.test(a.text) ? `-${a.text}` : "-10", {
        fontFamily: "'Space Mono', monospace", fontSize: "32px", fontStyle: "bold", color: "#ff6b7a", stroke: "#2a0710", strokeThickness: 6, resolution: 2,
      }).setDepth(1001);
      this.tweens.add({ targets: pop, y: pop.y - 50, alpha: 0, duration: 1100, ease: "Cubic.out", onComplete: () => pop.destroy() });
    }
  }

  poof(actor) {
    const burst = this.add.particles(actor.x, actor.y - 40, "dot", {
      speed: { min: 60, max: 180 }, lifespan: 520, scale: { start: 1.4, end: 0 }, tint: [0xcff6ff, 0x22d6f2], emitting: false,
    }).setDepth(1000);
    burst.explode(18);
    this.time.delayedCall(700, () => burst.destroy());
  }
}

/** Phaser battlefield. setScene(actors, animate) diffs against the last scene and animates the spell. */
export function createArena(parent) {
  const scene = new ArenaScene("arena");
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    transparent: true,
    scale: { mode: Phaser.Scale.RESIZE, width: "100%", height: "100%" },
    scene,
    banner: false,
  });
  return {
    setScene(actors, animate = false) {
      if (scene.sys.settings.status >= Phaser.Scenes.RUNNING) scene.render(actors, animate);
      else scene.pending = [actors, false];
    },
    destroy: () => game.destroy(true),
  };
}
