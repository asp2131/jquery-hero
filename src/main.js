import "./style.css";
import { EditorState } from "@codemirror/state";
import {
  EditorView,
  keymap,
  lineNumbers,
  highlightActiveLine,
  highlightActiveLineGutter,
  drawSelection,
} from "@codemirror/view";
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
} from "@codemirror/commands";
import { javascript } from "@codemirror/lang-javascript";
import {
  syntaxHighlighting,
  HighlightStyle,
  bracketMatching,
  indentOnInput,
} from "@codemirror/language";
import { tags } from "@lezer/highlight";
import { lessons } from "./lessons.js";
import { createWorld } from "./world.js";

const $ = (id) => document.getElementById(id);
const STORAGE_KEY = "jquery-quest-v1";
const number = (n) => String(n + 1).padStart(2, "0");
const escapeHTML = (text) =>
  String(text).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
let storageAvailable = true;
let state = {
  active: 0,
  completed: [],
  collected: [],
  drafts: {},
  sound: false,
};
try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
  if (saved && typeof saved === "object") {
    const validIds = (list) =>
      Array.isArray(list)
        ? [
            ...new Set(
              list.filter(
                (n) => Number.isInteger(n) && n >= 0 && n < lessons.length,
              ),
            ),
          ]
        : [];
    const completed = validIds(saved.completed);
    // A campaign unlock is always a contiguous prefix, even with an old/corrupt save.
    let frontier = 0;
    while (completed.includes(frontier)) frontier++;
    state.completed = Array.from({ length: frontier }, (_, i) => i);
    state.collected = validIds(saved.collected).filter((n) =>
      state.completed.includes(n),
    );
    state.active = Number.isInteger(saved.active)
      ? Math.max(0, Math.min(saved.active, frontier, lessons.length - 1))
      : 0;
    state.sound = saved.sound === true;
    if (saved.drafts && typeof saved.drafts === "object") {
      for (const lesson of lessons)
        if (typeof saved.drafts[lesson.id] === "string")
          state.drafts[lesson.id] = saved.drafts[lesson.id];
    }
  }
} catch {
  storageAvailable = false;
}
let running = false;
let loadingLesson = false;
let exploring = false;
let hintCount = 0;
let currentResult = null;
let toastTimer;
let audio;

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    storageAvailable = true;
  } catch {
    storageAvailable = false;
  }
  $("save-status").textContent = storageAvailable
    ? "Changes saved locally"
    : "Session only · storage unavailable";
}
function toast(message) {
  clearTimeout(toastTimer);
  $("toast").textContent = message;
  $("toast").hidden = false;
  toastTimer = setTimeout(() => {
    $("toast").hidden = true;
  }, 4500);
}
function chime(kind = "pass") {
  if (!state.sound) return;
  try {
    audio ||= new AudioContext();
    audio.resume();
    const notes = kind === "crystal" ? [880, 1320] : [440, 554, 659, 880];
    notes.forEach((freq, i) => {
      const osc = audio.createOscillator();
      const gain = audio.createGain();
      const start = audio.currentTime + i * 0.09;
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.045, start + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.28);
      osc.connect(gain);
      gain.connect(audio.destination);
      osc.start(start);
      osc.stop(start + 0.3);
      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
      };
    });
  } catch {
    /* Audio is optional; gameplay is not. */
  }
}
const highlights = HighlightStyle.define([
  { tag: tags.comment, color: "#6e876f", fontStyle: "italic" },
  { tag: tags.string, color: "#c2da8d" },
  { tag: tags.keyword, color: "#d1a881" },
  { tag: tags.function(tags.variableName), color: "#b4d6bf" },
  { tag: tags.number, color: "#cba384" },
  { tag: tags.operator, color: "#b4bfa2" },
  { tag: tags.punctuation, color: "#9aac98" },
  { tag: tags.variableName, color: "#e0e5ce" },
]);
const editorExtensions = [
  lineNumbers(),
  highlightActiveLine(),
  highlightActiveLineGutter(),
  drawSelection(),
  history(),
  javascript(),
  bracketMatching(),
  indentOnInput(),
  syntaxHighlighting(highlights),
  EditorView.lineWrapping,
  EditorView.contentAttributes.of({
    "aria-label": "JavaScript code editor",
    spellcheck: "false",
    autocapitalize: "off",
    autocorrect: "off",
  }),
  keymap.of([
    {
      key: "Mod-Enter",
      run: () => {
        execute();
        return true;
      },
    },
    indentWithTab,
    ...defaultKeymap,
    ...historyKeymap,
  ]),
  EditorView.updateListener.of((update) => {
    if (!update.docChanged || loadingLesson) return;
    state.drafts[state.active] = update.state.doc.toString();
    save();
    if (currentResult) {
      currentResult = null;
      renderTests();
      $("run-caption").textContent =
        "Code changed. Run again to check this version.";
    }
  }),
  EditorView.theme(
    { "&": { color: "#dbe4ce", backgroundColor: "#172522" } },
    { dark: true },
  ),
];
const editor = new EditorView({
  state: EditorState.create({ doc: "", extensions: editorExtensions }),
  parent: $("editor"),
});
const world = createWorld($("world"), {
  onCollect(index) {
    if (!state.completed.includes(index) || state.collected.includes(index))
      return;
    state.collected.push(index);
    save();
    renderProgress();
    chime("crystal");
    toast(
      state.collected.length === lessons.length
        ? "All 12 crystals found. You restored every corner of the island!"
        : `Crystal found! ${state.collected.length} / ${lessons.length} tucked safely in your pack.`,
    );
  },
  onReach(index) {
    if (index !== state.active && isUnlocked(index) && !running) {
      selectLesson(index, { fromWorld: true });
      toast(`Reached quest ${number(index)}: ${lessons[index].title}`);
    }
  },
});
function isUnlocked(index) {
  return (
    index >= 0 && index < lessons.length && index <= state.completed.length
  );
}
function renderProgress() {
  const total = state.completed.reduce(
    (sum, id) => sum + lessons[id].reward,
    0,
  );
  $("xp-value").textContent = total.toLocaleString();
  $("crystal-value").innerHTML =
    `${state.collected.length}<span>/${lessons.length}</span>`;
  $("progress-value").textContent =
    `${state.completed.length} of ${lessons.length}`;
  $("progress-fill").style.width =
    `${(state.completed.length / lessons.length) * 100}%`;
  $("player-rank").textContent =
    `LEVEL ${String(Math.floor(state.completed.length / 3) + 1).padStart(2, "0")} · ${state.completed.length === 12 ? "ISLAND KEEPER" : "EXPLORER"}`;
  $("world-status").textContent =
    state.completed.length === 12
      ? "Island restored · keep exploring"
      : `${lessons.length - state.completed.length} discoveries ahead`;
  $("quest-path").replaceChildren(
    ...lessons.map((lesson) => {
      const btn = document.createElement("button");
      btn.className = `quest-node${state.active === lesson.id ? " current" : ""}${state.completed.includes(lesson.id) ? " complete" : ""}`;
      btn.textContent = state.completed.includes(lesson.id)
        ? "✓"
        : number(lesson.id);
      btn.disabled = !isUnlocked(lesson.id) || running;
      btn.title = `${number(lesson.id)} · ${lesson.title}${!isUnlocked(lesson.id) ? " · locked" : ""}`;
      btn.setAttribute(
        "aria-label",
        `${lesson.title}, ${state.completed.includes(lesson.id) ? "completed" : !isUnlocked(lesson.id) ? "locked" : "available"}`,
      );
      if (state.active === lesson.id) btn.setAttribute("aria-current", "step");
      btn.onclick = () => selectLesson(lesson.id);
      return btn;
    }),
  );
  world.setProgress({
    completed: state.completed,
    active: state.active,
    collected: state.collected,
  });
}
function renderTests() {
  const tests = currentResult?.tests || lessons[state.active].tests;
  $("test-results").replaceChildren(
    ...tests.map((test) => {
      const row = document.createElement("div");
      const done = !!currentResult;
      row.className = `test-row${done ? (test.passed ? " pass" : " fail") : ""}`;
      const marker = document.createElement("span");
      marker.className = "test-marker";
      marker.textContent = done ? (test.passed ? "✓" : "×") : "·";
      const label = document.createElement("span");
      label.textContent = test.label;
      if (done && !test.passed && test.detail) {
        const detail = document.createElement("span");
        detail.className = "test-detail";
        detail.textContent = test.detail;
        label.append(detail);
      }
      row.append(marker, label);
      return row;
    }),
  );
  const passed = currentResult?.tests.filter((test) => test.passed).length || 0;
  $("test-count").textContent = currentResult
    ? `${passed}/${tests.length}`
    : `${tests.length} TESTS`;
  $("test-state").textContent = currentResult
    ? passed === tests.length && !currentResult.error
      ? "ALL CLEAR"
      : "KEEP EXPLORING"
    : "READY WHEN YOU ARE";
  $("run-error").hidden = !currentResult?.error;
  $("run-error").textContent = currentResult?.error || "";
  $("continue-button").hidden = !state.completed.includes(state.active);
  $("continue-button").innerHTML =
    state.active === lessons.length - 1
      ? "See your adventure <span>→</span>"
      : "On to the next quest <span>→</span>";
}
function setPreview(html) {
  // This frame never executes scripts, and its CSP prevents network loads from user-created markup.
  const doc = new DOMParser().parseFromString(html, "text/html");
  doc
    .querySelectorAll("script,iframe,object,embed,link,meta,base,form")
    .forEach((el) => el.remove());
  doc.querySelectorAll("*").forEach((el) => {
    for (const attribute of [...el.attributes])
      if (
        attribute.name.startsWith("on") ||
        ["href", "src", "srcset", "action", "formaction"].includes(
          attribute.name,
        )
      )
        el.removeAttribute(attribute.name);
  });
  $("dom-preview").srcdoc =
    `<!doctype html><html><head><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'"><style>body{font:14px/1.7 monospace;color:#345039;padding:12px;background:#f6f6eb}button,input{font:inherit;padding:5px 10px;margin:4px;border:1px solid #a3b88c;background:#e8f0da;border-radius:4px}button{pointer-events:none}.hidden{display:none}.lit,.awake{color:#6e9039}.italic{font-style:italic}</style></head><body>${doc.body.innerHTML}</body></html>`;
}
function selectTab(name) {
  for (const tab of ["js", "html", "preview"]) {
    const selected = name === tab;
    $(`tab-${tab}`).classList.toggle("selected", selected);
    $(`tab-${tab}`).setAttribute("aria-selected", String(selected));
    $(`tab-${tab}`).tabIndex = selected ? 0 : -1;
    $(`panel-${tab}`).hidden = !selected;
  }
  if (name === "js") editor.requestMeasure();
}
function selectLesson(index, { fromWorld = false } = {}) {
  if (!isUnlocked(index) || running) return;
  state.active = index;
  hintCount = 0;
  currentResult = null;
  const lesson = lessons[index];
  loadingLesson = true;
  editor.setState(
    EditorState.create({
      doc: state.drafts[index] ?? lesson.starter,
      extensions: editorExtensions,
    }),
  );
  loadingLesson = false;
  $("mission-number").textContent = `QUEST ${number(index)}`;
  $("mission-concept").textContent = lesson.concept.toUpperCase();
  $("mission-title").textContent = lesson.title;
  $("mission-description").textContent = lesson.description;
  $("guide-note").textContent = lesson.explanation;
  $("source-label").textContent = lesson.source;
  $("region-title").textContent = lesson.chapter;
  $("objectives").replaceChildren(
    ...lesson.objectives.map((text) => {
      const li = document.createElement("li");
      li.textContent = text;
      return li;
    }),
  );
  $("html-source").textContent = lesson.html;
  $("hint-panel").hidden = true;
  $("run-caption").textContent = state.completed.includes(index)
    ? "Quest complete. Revisit your code or explore for crystals."
    : "Your code. Real tests. A little island magic.";
  selectTab("js");
  setPreview(lesson.html);
  renderTests();
  renderProgress();
  save();
  if (!fromWorld) {
    setExploring(false);
    world.travelTo(index);
  }
}
function setExploring(value) {
  exploring = value;
  world.setExploring(value);
  $("explore-button").setAttribute("aria-pressed", String(value));
  $("explore-button").innerHTML = value
    ? "Back to coding <span>↙</span>"
    : "Explore island <span>↗</span>";
  $("movement-controls").hidden = !value;
  $("world-tip").innerHTML =
    `<span class="status-dot"></span> ${value ? "Click a tile or use WASD / arrows. Follow the gold crystals." : state.completed.length ? "A little brighter. Your next discovery is just a script away." : "A quiet island. A little jQuery can change that."}`;
  if (value) {
    world.focus();
    $("world").scrollIntoView({ block: "nearest", behavior: "smooth" });
  }
}
async function execute() {
  if (running) return;
  running = true;
  const index = state.active;
  const lesson = lessons[index];
  const submittedCode = editor.state.doc.toString();
  $("run-button").disabled = true;
  $("reset-code").disabled = true;
  $("run-label").textContent = "Checking your spell…";
  $("test-state").textContent = "RUNNING REAL JQUERY";
  $("continue-button").hidden = true;
  renderProgress();
  try {
    const { runExercise } = await import("./runner.js");
    const result = await runExercise(lesson, submittedCode);
    // Editing during a run must not award a different draft or display stale passing tests.
    if (editor.state.doc.toString() !== submittedCode) {
      currentResult = null;
      renderTests();
      toast("Your code changed during the run. Run the latest version again.");
      return;
    }
    currentResult = result;
    setPreview(result.html || lesson.html);
    const passed =
      !result.error &&
      result.tests.length > 0 &&
      result.tests.every((test) => test.passed);
    if (passed) {
      const firstPass = !state.completed.includes(index);
      if (firstPass) {
        state.completed.push(index);
        save();
        chime();
        document.body.classList.remove("celebrate");
        requestAnimationFrame(() => document.body.classList.add("celebrate"));
        setTimeout(() => document.body.classList.remove("celebrate"), 1500);
        toast(
          `Quest complete! +${lesson.reward} XP. A gold crystal is waiting near your beacon.`,
        );
      }
      $("run-caption").textContent =
        "Beautifully done. Your code brought the island to life.";
      $("world-tip").innerHTML =
        '<span class="status-dot"></span> Quest restored! Explore to collect your golden crystal.';
      if (state.completed.length === lessons.length && firstPass)
        showCompletion();
    } else {
      $("run-caption").textContent =
        "Not quite yet. Read the checkpoints, tweak your code, try again.";
    }
    renderTests();
  } catch (error) {
    currentResult = {
      tests: lesson.tests.map((test) => ({
        label: test.label,
        passed: false,
        detail: "Could not finish this run.",
      })),
      error: error.message || String(error),
      html: lesson.html,
    };
    renderTests();
  } finally {
    running = false;
    $("run-button").disabled = false;
    $("reset-code").disabled = false;
    $("run-label").textContent = "Run code";
    renderProgress();
  }
}
function showDialog(title, eyebrow, html) {
  $("dialog-title").textContent = title;
  $("dialog-eyebrow").textContent = eyebrow;
  $("dialog-content").innerHTML = html;
  if (!$("game-dialog").open) $("game-dialog").showModal();
}
function showMap() {
  showDialog(
    "Every island starts with a spark.",
    "YOUR JOURNEY · 12 QUESTS",
    `<p class="dialog-copy">Write a little code, pass the checkpoints, then explore. Each restored beacon reveals a golden crystal. Completed quests are always open for practice.</p><div class="quest-list">${lessons.map((lesson) => `<button class="quest-choice" data-quest="${lesson.id}" ${!isUnlocked(lesson.id) || running ? "disabled" : ""}><span>${state.completed.includes(lesson.id) ? "✓" : number(lesson.id)}</span><div><strong>${escapeHTML(lesson.title)}</strong><small>${!isUnlocked(lesson.id) ? "LOCKED · COMPLETE THE PREVIOUS QUEST" : escapeHTML(lesson.concept)}</small></div></button>`).join("")}</div>`,
  );
  $("dialog-content")
    .querySelectorAll("[data-quest]")
    .forEach((btn) => {
      btn.onclick = () => {
        $("game-dialog").close();
        selectLesson(Number(btn.dataset.quest));
      };
    });
}
function showGuide() {
  const sections = [
    [
      "01 · A library, not a new language",
      '$("selector").action();',
      "jQuery is JavaScript with a helpful toolbox for HTML and CSS. It is already imported here. In your own page, load a pinned jQuery script before your application script.",
    ],
    [
      "02 · Find the right element",
      '$("p")        // all paragraph elements\n$(".secret")  // every element with this class\n$("#beacon")  // the element with this ID',
      "A selector finds existing elements. An action changes them. Check index.html to see the exact IDs, classes, and starting state for each quest.",
    ],
    [
      "03 · Change what the world sees",
      '$("#beacon").text("Awake");\n$(".secret").show();\n$(".fog").hide();\n$("#hero").css("color", "green");\n$("#hero").addClass("ready").removeClass("sleepy");',
      'Calling .text() or .css("color") without a new value reads the current value. Most setters return the jQuery collection, so you can chain actions.',
    ],
    [
      "04 · Build, move, and clear",
      'const $sign = $("<p>");\n$sign.attr("id", "sign").text("Home");\n$sign.appendTo("#camp");\n$("#rubble").empty();\n$("#bridge").detach().appendTo("#river");',
      "Angle brackets create an element. It is not on the page until you append it. .empty() removes children; .detach() removes the selected element and preserves its data and event handlers for reuse. A $ prefix on variables is a useful naming convention, not a requirement.",
    ],
    [
      "05 · Let the player take a turn",
      'function wake() {\n  $("#beacon").text("Awake");\n}\n$("#button").on("click", wake);',
      "Pass the function itself, not wake(). Parentheses call it immediately! Other events include keydown, keyup, change, submit, mouseenter, focus, and blur.",
    ],
    [
      "06 · A little chance",
      'const roll = Math.floor(Math.random() * 6) + 1;\n$("#result").text(roll);',
      "Math.random() returns a number from 0 up to (but not including) 1. Tests check both coin faces and all six dice values with controlled randomness.",
    ],
  ];
  showDialog(
    "A pocket guide to jQuery.",
    "YOUR FIELD GUIDE",
    `<p class="dialog-copy">No need to memorize everything. Keep experimenting. Your progress is saved in this browser; no account or server is involved.</p>${sections.map(([title, code, text]) => `<section class="reference-section"><h3>${title}</h3><code>${escapeHTML(code)}</code><p>${escapeHTML(text)}</p></section>`).join("")}<section class="reference-section"><h3>Explore your island</h3><p>Press Explore island, then use arrow keys, WASD, the on-screen arrows, or click a tile. Walk onto golden crystals near completed beacons to collect them. Paths open as you pass exercises. Click a quest number to revisit it. In the editor, use Tab to indent and Cmd/Ctrl + Enter to run.</p></section>`,
  );
}
function showCompletion() {
  showDialog(
    "You are the island keeper.",
    "CAMPAIGN COMPLETE",
    `<div class="completion-art">{ ✧ }</div><p class="completion-copy">Twelve quests. One island brought back to life.<br>You selected, styled, created, and connected a whole world with real jQuery.</p><div class="completion-stats"><span>1,200 XP</span><span>${state.collected.length} / 12 crystals</span></div><p class="completion-copy">There is still room to wander. Find every crystal or revisit any quest and try a different solution.</p><div class="dialog-actions"><button id="completion-explore" class="primary">Explore your restored island →</button><button id="completion-map">Revisit the quests</button></div>`,
  );
  $("completion-explore").onclick = () => {
    $("game-dialog").close();
    setExploring(true);
  };
  $("completion-map").onclick = showMap;
}
function showHints() {
  const lesson = lessons[state.active];
  hintCount = Math.min(hintCount + 1, lesson.hints.length);
  $("hint-panel").hidden = false;
  $("hint-content").replaceChildren(
    ...lesson.hints.slice(0, hintCount).map((hint, i) => {
      const p = document.createElement("p");
      p.textContent = `${i + 1}. ${hint}`;
      return p;
    }),
  );
  $("next-hint").disabled = hintCount >= lesson.hints.length;
  $("solution-button").hidden = hintCount < lesson.hints.length;
}
function confirmReset() {
  showDialog(
    "A fresh page in your spellbook?",
    "RESET THIS EXERCISE",
    '<p class="dialog-copy">This replaces only the current quest’s code with its starter. Your completed quests, XP, crystals, and other code are kept.</p><div class="dialog-actions"><button id="confirm-reset" class="primary">Reset this code</button><button id="cancel-reset">Keep writing</button></div>',
  );
  $("confirm-reset").onclick = () => {
    $("game-dialog").close();
    editor.dispatch({
      changes: {
        from: 0,
        to: editor.state.doc.length,
        insert: lessons[state.active].starter,
      },
    });
    currentResult = null;
    renderTests();
    setPreview(lessons[state.active].html);
    selectTab("js");
    editor.focus();
  };
  $("cancel-reset").onclick = () => $("game-dialog").close();
}
$("run-button").onclick = execute;
$("continue-button").onclick = () => {
  if (!running)
    state.active === lessons.length - 1
      ? showCompletion()
      : selectLesson(state.active + 1);
};
$("map-button").onclick = showMap;
$("journey-button").onclick = showMap;
$("guide-button").onclick = showGuide;
$("syntax-button").onclick = showGuide;
$("hint-button").onclick = () => {
  if (!$("hint-panel").hidden) $("hint-panel").hidden = true;
  else showHints();
};
$("next-hint").onclick = showHints;
$("solution-button").onclick = () => {
  const lesson = lessons[state.active];
  showDialog(
    "One way through.",
    `QUEST ${number(state.active)} · EXAMPLE SOLUTION`,
    `<p class="dialog-copy">There is more than one valid solution. Read this one, then try writing it yourself.</p><section class="reference-section"><code>${escapeHTML(lesson.solution)}</code></section><div class="dialog-actions"><button id="solution-close" class="primary">Back to my code →</button></div>`,
  );
  $("solution-close").onclick = () => {
    $("game-dialog").close();
    selectTab("js");
    editor.focus();
  };
};
$("reset-code").onclick = confirmReset;
$("explore-button").onclick = () => setExploring(!exploring);
document.querySelectorAll("[data-direction]").forEach((btn) => {
  btn.onclick = () => {
    if (!exploring) setExploring(true);
    world.move(btn.dataset.direction);
  };
});
for (const name of ["js", "html", "preview"]) {
  $(`tab-${name}`).onclick = () => selectTab(name);
  $(`tab-${name}`).onkeydown = (event) => {
    const tabs = ["js", "html", "preview"];
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const next =
      tabs[
        (tabs.indexOf(name) + (event.key === "ArrowRight" ? 1 : 2)) %
          tabs.length
      ];
    selectTab(next);
    $(`tab-${next}`).focus();
  };
}
$("close-dialog").onclick = () => $("game-dialog").close();
$("game-dialog").addEventListener("click", (event) => {
  if (event.target === $("game-dialog")) {
    const rect = $("game-dialog").getBoundingClientRect();
    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    )
      $("game-dialog").close();
  }
});
function renderSound() {
  $("sound-button").setAttribute("aria-pressed", String(state.sound));
  $("sound-button").setAttribute(
    "aria-label",
    state.sound ? "Mute game sounds" : "Enable game sounds",
  );
  $("sound-button").title = state.sound
    ? "Mute game sounds"
    : "Enable game sounds";
  document.querySelector(".sound-off").hidden = state.sound;
}
$("sound-button").onclick = () => {
  state.sound = !state.sound;
  save();
  renderSound();
  if (state.sound) chime("crystal");
};
$("slides-link").href = new URL(
  "../ASD 05 PD - jQuery - Google Slides.pdf",
  import.meta.url,
).href;
selectLesson(state.active);
renderSound();
if (import.meta.hot)
  import.meta.hot.dispose(() => {
    world.destroy();
    editor.destroy();
    audio?.close();
    clearTimeout(toastTimer);
  });
