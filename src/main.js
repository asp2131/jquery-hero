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
  indentOnInput,
} from "@codemirror/language";
import { tags } from "@lezer/highlight";
import { lessons } from "./lessons.js";
import { createArena } from "./arena.js";
import { syntaxSupport } from "./editor-syntax.js";

const $ = (id) => document.getElementById(id);
// v2: battle lessons. v1 progress carries over; its drafts are old island code.
const STORAGE_KEY = "jquery-quest-v2";
const number = (n) => String(n + 1).padStart(2, "0");
const escapeHTML = (text) =>
  String(text).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
// Prettier-style layout for the read-only index.html tab, coloured like VS Code Dark+.
// ponytail: approximates Prettier (80 cols, 2-space indent, breaks select/nested
// blocks) without reformatting style attributes; fixtures are small and trusted.
const VOID_TAG = /^(area|base|br|col|embed|hr|img|input|link|meta|source|track|wbr)$/;
const plain = (_, text) => text;
const colored = (cls, text) =>
  cls ? `<span class="${cls}">${escapeHTML(text)}</span>` : escapeHTML(text);
const openTag = (el, tok) =>
  tok("hl-punct", "<") +
  tok("hl-tag", el.localName) +
  [...el.attributes]
    .map((a) => ` ${tok("hl-attr", a.name)}=${tok("hl-value", `"${a.value}"`)}`)
    .join("") +
  tok("hl-punct", VOID_TAG.test(el.localName) ? " />" : ">");
const closeTag = (el, tok) =>
  VOID_TAG.test(el.localName)
    ? ""
    : tok("hl-punct", "</") + tok("hl-tag", el.localName) + tok("hl-punct", ">");
const inlineHTML = (node, tok) =>
  node.nodeType === Node.TEXT_NODE
    ? tok("", node.textContent.replace(/\s+/g, " "))
    : openTag(node, tok) +
      [...node.childNodes].map((child) => inlineHTML(child, tok)).join("") +
      closeTag(node, tok);
const blockHTML = (node, pad) => {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent.trim();
    return text ? [pad + colored("", text)] : [];
  }
  const mustBreak =
    /^(select|ul|ol)$/.test(node.localName) ||
    [...node.children].some((child) => child.children.length);
  if (!mustBreak && pad.length + inlineHTML(node, plain).length <= 80)
    return [pad + inlineHTML(node, colored)];
  return [
    pad + openTag(node, colored),
    ...[...node.childNodes].flatMap((child) => blockHTML(child, pad + "  ")),
    pad + closeTag(node, colored),
  ];
};
function formatHTML(html) {
  const template = document.createElement("template");
  template.innerHTML = html;
  return [...template.content.childNodes].flatMap((node) => blockHTML(node, "")).join("\n");
}
let storageAvailable = true;
let state = {
  active: 0,
  completed: [],
  drafts: {},
  sound: false,
};
try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") ?? {
    ...JSON.parse(localStorage.getItem("jquery-quest-v1") || "null"),
    drafts: {},
  };
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
let hintCount = 0;
let currentResult = null;
let toastTimer;
let activeHelp = null;
let syntaxDiagnostic = null;
const runShortcut = /Mac|iPhone|iPad/.test(navigator.platform)
  ? "⌘ Enter"
  : "Ctrl + Enter";
let audio;
const currentLesson = () => lessons[state.active];

function save() {
  const wasAvailable = storageAvailable;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    storageAvailable = true;
  } catch {
    storageAvailable = false;
  }
  if (wasAvailable && !storageAvailable)
    toast(
      "Progress can't be saved in this browser. It lasts this session only.",
    );
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
  { tag: tags.comment, color: "#6c819a", fontStyle: "italic" },
  { tag: tags.string, color: "#ff8a95" },
  { tag: tags.keyword, color: "#c7a2ff" },
  { tag: tags.function(tags.variableName), color: "#34d8f2" },
  { tag: [tags.propertyName, tags.function(tags.propertyName)], color: "#ffd166" },
  { tag: tags.number, color: "#f7a26c" },
  { tag: tags.operator, color: "#c4d0de" },
  { tag: tags.punctuation, color: "#c4d0de" },
  { tag: tags.variableName, color: "#34d8f2" },
]);
function renderSyntaxStatus({ state: status, diagnostic }) {
  syntaxDiagnostic = diagnostic || null;
  const button = $("syntax-status");
  button.dataset.state = status;
  button.disabled = !diagnostic;
  button.textContent = diagnostic
    ? `Line ${diagnostic.line}: ${diagnostic.message}`
    : status === "checking"
      ? "Checking syntax…"
      : "No syntax errors";
  button.title = diagnostic
    ? `${button.textContent} Click to jump to the error.`
    : "Syntax checks only. Run your spell to check the quest.";
  button.setAttribute("aria-label", diagnostic
    ? `${button.textContent} Jump to the error.`
    : button.textContent);
}
const editorExtensions = [
  lineNumbers(),
  highlightActiveLine(),
  highlightActiveLineGutter(),
  drawSelection(),
  history(),
  javascript(),
  ...syntaxSupport(renderSyntaxStatus),
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
    }
  }),
  EditorView.theme(
    { "&": { color: "#e6edf5", backgroundColor: "#0b1a2c" } },
    { dark: true },
  ),
];
const editor = new EditorView({
  state: EditorState.create({ doc: "", extensions: editorExtensions }),
  parent: $("editor"),
});
const arena = createArena($("arena"));
function isUnlocked(index) {
  return (
    index >= 0 && index < lessons.length && index <= state.completed.length
  );
}
function renderProgress() {
  $("crystal-value").textContent = state.completed.reduce(
    (sum, index) => sum + lessons[index].reward,
    0,
  );
  $("progress-value").textContent =
    `${state.completed.length} / ${lessons.length}`;
  $("quest-dots").replaceChildren(
    ...lessons.map((lesson, index) => {
      const li = document.createElement("li");
      const dot = document.createElement("button");
      dot.classList.toggle("done", state.completed.includes(index));
      if (index === state.active)
        dot.setAttribute("aria-current", "step");
      dot.disabled = !isUnlocked(index) || running;
      dot.title = `Quest ${index + 1}: ${lesson.title}`;
      dot.setAttribute("aria-label", dot.title);
      dot.onclick = () => selectLesson(index);
      li.append(dot);
      return li;
    }),
  );
}
function renderTests() {
  const tests = currentResult?.tests || currentLesson().tests;
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
  // The objectives already describe the goal; checkpoints only matter after a run.
  $("test-section").hidden = !currentResult;
  const passedCount = currentResult?.tests.filter((test) => test.passed).length || 0;
  const passed = !!currentResult && !currentResult.error &&
    tests.length > 0 && passedCount === tests.length;
  $("test-section").open = !!currentResult && !passed;
  $("test-section").dataset.state = passed ? "pass" : "fail";
  $("run-caption").textContent = currentResult?.error
    ? "Your spell hit an error"
    : passed
      ? `All ${tests.length} checks passed`
      : `${passedCount} / ${tests.length} checks passed`;
  $("run-error").hidden = !currentResult?.error;
  $("run-error").textContent = currentResult?.error || "";
  // FreeCodeCamp style: Next quest unlocks only after the tests just passed for this attempt.
  const complete =
    state.completed.includes(state.active) &&
    !!currentResult &&
    !currentResult.error &&
    currentResult.tests.length > 0 &&
    currentResult.tests.every((test) => test.passed);
  $("continue-button").disabled = !complete;
  $("continue-button").hidden = !complete;
  $("continue-button").title = complete
    ? ""
    : "Complete the quest: write your code, run the spell, pass every check.";
  // Once a quest is done, moving on becomes the primary action.
  document
    .querySelector(".run-section")
    .classList.toggle("complete", complete);
  $("continue-button").innerHTML = complete
    ? `${state.active === lessons.length - 1 ? "See your adventure" : "Next quest"} <span>→</span>`
    : "Next quest";
}
function setScene(lesson, html, animate = false) {
  // DOMParser never runs scripts; the arena reads only text, inline styles, classes, and attributes.
  const doc = new DOMParser().parseFromString(html, "text/html");
  const matched = lesson.scene.map(() => 0);
  const actors = [];
  for (const el of doc.body.querySelectorAll("*")) {
    const rule = lesson.scene.findIndex(([selector]) => el.matches(selector));
    if (rule < 0) continue;
    const [, kind, spawns, on = () => false] = lesson.scene[rule];
    const n = matched[rule]++;
    // ponytail: extra matches line up behind the last spawn point; fine for a stray append or two.
    const [sx, sy, level = 0] = spawns[n] ?? [spawns.at(-1)[0], spawns.at(-1)[1] + n - spawns.length + 1];
    // Inline left/top (from .css("left", px)) walk a piece from its spawn point, 50px per tile.
    const x = sx + (parseFloat(el.style.left) || 0) / 50;
    const y = sy + (parseFloat(el.style.top) || 0) / 50;
    let hidden = false;
    for (let node = el; node; node = node.parentElement)
      if (node.style.display === "none") hidden = true;
    actors.push({
      key: el.id || `${rule}:${n}`,
      kind,
      x,
      y,
      level,
      on: on(el),
      hidden,
      tag: el.id ? `#${el.id}` : `.${el.classList[0]}`,
      classes: [...el.classList],
      text: el.children.length ? "" : el.textContent.trim(),
      color: el.style.color,
      background: el.style.backgroundColor,
    });
  }
  arena.setScene(actors, animate);
}
function setHud(status, headline, message) {
  $("battle-hud").dataset.status = status;
  $("battle-headline").textContent = headline;
  $("battle-status").textContent = message;
}
function selectTab(name) {
  for (const tab of ["js", "html"]) {
    const selected = name === tab;
    $(`tab-${tab}`).classList.toggle("selected", selected);
    $(`tab-${tab}`).setAttribute("aria-selected", String(selected));
    $(`tab-${tab}`).tabIndex = selected ? 0 : -1;
    $(`panel-${tab}`).hidden = !selected;
  }
  $("syntax-status").hidden = name !== "js";
  $("editor-shortcut").textContent =
    name === "js" ? runShortcut : "Read-only reference";
  if (name === "js") editor.requestMeasure();
}
function renderLesson(lesson, key) {
  hintCount = 0;
  setHelp(null);
  document.querySelector(".guide-note").open = false;
  renderSyntaxStatus({ state: "checking" });
  currentResult = null;
  loadingLesson = true;
  editor.setState(
    EditorState.create({
      doc: state.drafts[key] ?? lesson.starter,
      extensions: editorExtensions,
    }),
  );
  loadingLesson = false;
  $("mission-number").textContent = `QUEST ${number(state.active)} / ${lessons.length}`;
  $("hud-chapter").textContent = lesson.chapter;
  $("hud-quest").textContent = `Quest ${number(state.active)} / ${lessons.length} · ${lesson.title}`;
  setHud("playing", "Your move", "Write your spell in quest.js, then press Run spell.");
  $("mission-concept").textContent = lesson.concept;
  $("mission-title").textContent = lesson.title;
  $("mission-description").textContent = lesson.description;
  $("guide-note").textContent = lesson.explanation;
  $("source-label").textContent = lesson.source;
  for (const [id, items] of [["objectives", lesson.objectives], ["coding-steps", lesson.steps]]) {
    $(id).replaceChildren(...items.map((text) => {
      const li = document.createElement("li");
      li.textContent = text;
      return li;
    }));
  }
  $("syntax-example").textContent = lesson.syntax;
  $("html-source").innerHTML = formatHTML(lesson.html);
  $("run-label").textContent = "Run spell";
  selectTab("js");
  renderTests();
  renderProgress();
}

function selectLesson(index) {
  if (!isUnlocked(index) || running) return;
  state.active = index;
  renderLesson(lessons[index], index);
  setScene(lessons[index], lessons[index].html);
  save();
}

async function execute() {
  if (running) return;
  setHelp(null);
  running = true;
  const index = state.active;
  const lesson = lessons[index];
  const submittedCode = editor.state.doc.toString();
  $("run-button").disabled = true;
  $("reset-code").disabled = true;
  $("run-label").textContent = "Casting…";
  setHud("playing", "Casting…", "Your spell is running against the battlefield.");
  $("continue-button").disabled = true;
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
    // Replay every spell from the starting battlefield so the arena shows exactly what this code did.
    setScene(lesson, lesson.html);
    setScene(lesson, result.html || lesson.html, true);
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
      }
      setHud(
        "won",
        "Spell successful",
        `${result.tests.length} / ${result.tests.length} checks passed${firstPass ? ` · +${lesson.reward} crystals` : ""}`,
      );
      if (state.completed.length === lessons.length && firstPass)
        showCompletion();
    } else {
      const passedCount = result.tests.filter((test) => test.passed).length;
      setHud(
        "lost",
        result.error ? "Spell fizzled" : "Not quite",
        result.error
          ? "Your code hit an error. Fix it and cast again."
          : `${passedCount} / ${result.tests.length} checks passed. Tweak your spell and try again.`,
      );
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
    setHud("lost", "Spell fizzled", "Your code hit an error. Fix it and cast again.");
    renderTests();
  } finally {
    running = false;
    $("run-button").disabled = false;
    $("reset-code").disabled = false;
    $("run-label").textContent = "Run spell";
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
    "Choose your next challenge.",
    `${lessons.length} BATTLES`,
    `<p class="dialog-copy">Each battle teaches one new skill. They unlock in order.</p><div class="quest-list">${lessons.map((lesson) => `<button class="quest-choice" data-quest="${lesson.id}" ${!isUnlocked(lesson.id) || running ? "disabled" : ""}><span>${state.completed.includes(lesson.id) ? "✓" : number(lesson.id)}</span><div><strong>${escapeHTML(lesson.title)}</strong><small>${!isUnlocked(lesson.id) ? "LOCKED · COMPLETE THE PREVIOUS QUEST" : escapeHTML(lesson.concept)}</small></div></button>`).join("")}</div>`,
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
      "Your code is your move",
      '$(".goblin").addClass("hit");',
      "Every character in the arena is an element in index.html. The cyan tag under it is its selector: a dot means a shared class, # means one ID. Edit quest.js, then Run spell (or Cmd/Ctrl + Enter). The hero casts at everything your code changed, so you can see exactly what you selected.",
    ],
    [
      "01 · A library, not a new language",
      '$("selector").action();',
      "jQuery is JavaScript with a helpful toolbox for HTML and CSS. It is already imported here. In your own page, load a pinned jQuery script before your application script.",
    ],
    [
      "02 · Find the right element",
      '$("p")        // all paragraph elements\n$(".secret")  // every element with this class\n$("#hero")    // the element with this ID',
      "A selector finds existing elements. An action changes them. Each instruction card tells you which selector and method to use; index.html is only a reference for the starting elements.",
    ],
    [
      "03 · Change what the arena sees",
      '$("#hero").text("Ready");\n$(".secret").show();\n$(".smoke").hide();\n$("#hero").css("color", "green");\n$("#hero").addClass("ready").removeClass("sleepy");',
      'Calling .text() or .css("color") without a new value reads the current value. Most setters return the jQuery collection, so you can chain actions.',
    ],
    [
      "04 · Build, move, and clear",
      'const $sign = $("<p>");\n$sign.attr("id", "sign").text("Home");\n$sign.appendTo("#camp");\n$("#rubble").empty();\n$("#bridge").detach().appendTo("#river");',
      "Angle brackets create an element. It is not on the page until you append it. .empty() removes children; .detach() removes the selected element and preserves its data and event handlers for reuse. A $ prefix on variables is a useful naming convention, not a requirement.",
    ],
    [
      "05 · Let the player take a turn",
      'function wake() {\n  $("#hero").text("Ready");\n}\n$("#button").on("click", wake);',
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
    `<p class="dialog-copy">No need to memorize everything. Keep experimenting. Your progress is saved in this browser; no account or server is involved.</p>${sections.map(([title, code, text]) => `<section class="reference-section"><h3>${title}</h3><code>${escapeHTML(code)}</code><p>${escapeHTML(text)}</p></section>`).join("")}<section class="reference-section"><h3>Editor keys</h3><p>Tab indents. Cmd/Ctrl + Enter runs your spell.</p></section>`,
  );
}
function showCompletion() {
  showDialog(
    "The fortress is yours.",
    "CAMPAIGN COMPLETE",
    `<div class="completion-art">{ ✧ }</div><p class="completion-copy">${lessons.length} battles won.<br>You built a whole battlefield with real jQuery, then taught it to make decisions.</p><div class="completion-stats"><span>${lessons.reduce((sum, lesson) => sum + lesson.reward, 0)} crystals</span></div><div class="dialog-actions"><button id="completion-map" class="primary">Revisit the quests</button></div>`,
  );
  $("completion-map").onclick = showMap;
}
const helpTitles = {
  brief: "Quest brief",
  hint: "A little nudge",
  steps: "Walkthrough",
};

function setHelp(name, restoreFocus = false) {
  const previous = activeHelp;
  activeHelp = name;
  $("help-drawer").hidden = !name;
  for (const key of Object.keys(helpTitles)) {
    $(`${key}-button`).setAttribute("aria-expanded", String(key === name));
    $(`${key}-panel`).hidden = key !== name;
  }
  if (name) {
    $("help-title").textContent = helpTitles[name];
    $("help-drawer").scrollTop = 0;
  }
  if (restoreFocus && previous) $(`${previous}-button`).focus();
}

function showHints() {
  const hints = currentLesson().hints;
  hintCount = Math.max(1, Math.min(hintCount, hints.length));
  const paragraph = document.createElement("p");
  paragraph.textContent = hints[hintCount - 1];
  $("hint-content").replaceChildren(paragraph);
  $("hint-position").textContent = `${hintCount} of ${hints.length}`;
  $("previous-hint").disabled = hintCount <= 1;
  $("next-hint").disabled = hintCount >= hints.length;
  $("solution-button").hidden = hintCount < hints.length;
}
function confirmReset() {
  showDialog(
    "A fresh page in your spellbook?",
    "RESET THIS EXERCISE",
    `<p class="dialog-copy">This replaces the current exercise’s code with its starter and resets the battlefield. Your completed quests, crystals, and other drafts are kept.</p><div class="dialog-actions"><button id="confirm-reset" class="primary">Reset this code</button><button id="cancel-reset">Keep writing</button></div>`,
  );
  $("confirm-reset").onclick = () => {
    $("game-dialog").close();
    editor.dispatch({
      changes: {
        from: 0,
        to: editor.state.doc.length,
        insert: currentLesson().starter,
      },
    });
    currentResult = null;
    renderTests();
    setScene(currentLesson(), currentLesson().html);
    setHud("playing", "Your move", "Write your spell in quest.js, then press Run spell.");
    selectTab("js");
    editor.focus();
  };
  $("cancel-reset").onclick = () => $("game-dialog").close();
}
$("run-button").onclick = execute;
$("continue-button").onclick = () => {
  if (running || $("continue-button").disabled) return;
  state.active === lessons.length - 1
    ? showCompletion()
    : selectLesson(state.active + 1);
};
$("map-button").onclick = showMap;
$("guide-button").onclick = showGuide;
for (const name of Object.keys(helpTitles)) {
  $(`${name}-button`).onclick = () => {
    if (activeHelp === name) setHelp(null);
    else {
      if (name === "hint") showHints();
      setHelp(name);
    }
  };
}
$("close-help").onclick = () => setHelp(null, true);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && activeHelp) {
    event.preventDefault();
    setHelp(null, true);
  }
});
for (const eventName of ["pointerdown", "focusin"]) {
  document.addEventListener(eventName, (event) => {
    if (activeHelp && !event.target.closest(".help-section")) setHelp(null);
  });
}
$("previous-hint").onclick = () => {
  hintCount--;
  showHints();
};
$("next-hint").onclick = () => {
  hintCount++;
  showHints();
};
$("syntax-status").onclick = () => {
  if (!syntaxDiagnostic) return;
  const { from, to } = syntaxDiagnostic;
  editor.dispatch({
    selection: { anchor: from, head: to },
    scrollIntoView: true,
  });
  editor.focus();
};
$("solution-button").onclick = () => {
  const lesson = currentLesson();
  setHelp(null);
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
for (const name of ["js", "html"]) {
  $(`tab-${name}`).onclick = () => selectTab(name);
  $(`tab-${name}`).onkeydown = (event) => {
    const tabs = ["js", "html"];
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const next =
      tabs[
        (tabs.indexOf(name) +
          (event.key === "ArrowRight" ? 1 : tabs.length - 1)) %
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
$("run-button").title = `Run spell (${runShortcut})`;
selectLesson(state.active);
renderSound();
if (import.meta.hot)
  import.meta.hot.dispose(() => {
    arena.destroy();
    editor.destroy();
    audio?.close();
    clearTimeout(toastTimer);
  });
