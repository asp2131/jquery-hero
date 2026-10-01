import jquerySource from "jquery/dist/jquery.min.js?raw";
import { parse } from "acorn";
import { simple } from "acorn-walk";
import MagicString from "magic-string";

const FRAME_TIMEOUT = 5000;
const MAX_SOURCE_LENGTH = 50000;

function randomKey() {
  const bytes = new Uint32Array(4);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (part) => part.toString(16).padStart(8, "0")).join(
    "",
  );
}

function instrument(code, guardName) {
  const tree = parse(code, {
    ecmaVersion: "latest",
    sourceType: "script",
    allowReturnOutsideFunction: true,
    locations: true,
  });
  const output = new MagicString(code);
  const guard = `${guardName}();`;

  function guardBlock(block) {
    // Keep a function's directive prologue (for example "use strict") intact.
    let position = block.start + 1;
    for (const statement of block.body) {
      if (!statement.directive) break;
      position = statement.end;
    }
    output.appendLeft(position, `;${guard}`);
  }

  function guardLoop(node) {
    if (node.body.type === "BlockStatement") {
      guardBlock(node.body);
    } else {
      output.appendLeft(node.body.start, `{${guard}`);
      output.appendLeft(node.body.end, "}");
    }
  }

  function guardFunction(node) {
    if (node.body.type === "BlockStatement") {
      guardBlock(node.body);
    } else {
      // A comma expression preserves the return value of a concise arrow.
      output.appendLeft(node.body.start, `(${guardName}(), `);
      output.appendLeft(node.body.end, ")");
    }
  }

  simple(tree, {
    ForStatement: guardLoop,
    ForInStatement: guardLoop,
    ForOfStatement: guardLoop,
    WhileStatement: guardLoop,
    DoWhileStatement: guardLoop,
    FunctionDeclaration: guardFunction,
    FunctionExpression: guardFunction,
    ArrowFunctionExpression: guardFunction,
  });
  return output.toString();
}

// This function is serialized into the opaque-origin frame. It must stay
// self-contained: no teacher functions or test data are published on window.
function sandboxBootstrap(configuration) {
  const { token, nonce, guardName, guardSlot, code, test, targetOrigin } =
    configuration;
  const exposeSlot = `${guardSlot}_expose`;
  const root = document.getElementById("quest-fixture");
  const nativeSetTimeout = window.setTimeout.bind(window);
  const nativeClearTimeout = window.clearTimeout.bind(window);
  const nativeNow = performance.now.bind(performance);
  const nativeQuery = Element.prototype.querySelectorAll;
  const nativeMatches = Element.prototype.matches;
  const nativeGetAttribute = Element.prototype.getAttribute;
  const nativeGetStyle = window.getComputedStyle.bind(window);
  const nativeDispatch = EventTarget.prototype.dispatchEvent;
  const nativeClick = HTMLElement.prototype.click;
  const NativeEvent = window.Event;
  const NativeKeyboardEvent = window.KeyboardEvent;
  const NativeError = window.Error;
  const sendMessage = window.parent.postMessage.bind(window.parent);
  const addListener = window.addEventListener.bind(window);
  const removeListener = window.removeEventListener.bind(window);
  const appendChild = Node.prototype.appendChild;
  const removeChild = Node.prototype.removeChild;
  const innerHTMLGetter = Object.getOwnPropertyDescriptor(
    Element.prototype,
    "innerHTML",
  ).get;
  const textGetter = Object.getOwnPropertyDescriptor(
    Node.prototype,
    "textContent",
  ).get;
  const remembered = new Map();
  // console.log lines, and the functions the tests call by name.
  const logs = [];
  let logStart = 0;
  let exported = {};
  let runtimeError = null;
  let completed = false;
  let checkTimer;
  let ticks = 0;
  let deadline;

  // Remove bootstrap source, jQuery's source, and the nonce-bearing CSP meta
  // before learner code runs. Tests and the message token remain in closures.
  for (const element of document.querySelectorAll("script, meta[http-equiv]")) {
    element.remove();
  }

  function describeError(error) {
    if (!error) return "A JavaScript error stopped your code.";
    const name = typeof error.name === "string" ? error.name : "Error";
    const message =
      typeof error.message === "string" ? error.message : String(error);
    return `${name}: ${message}`.slice(0, 1200);
  }

  function onError(event) {
    runtimeError ||= describeError(
      event.error || { name: "JavaScript error", message: event.message },
    );
    event.preventDefault();
  }

  function onRejection(event) {
    runtimeError ||= describeError(event.reason);
    event.preventDefault();
  }

  addListener("error", onError);
  addListener("unhandledrejection", onRejection);

  function select(selector) {
    return Array.from(nativeQuery.call(root, selector));
  }

  for (const selector of test.remember || []) {
    remembered.set(selector, select(selector)[0]);
  }

  // Install after jQuery has loaded so library initialization never consumes a
  // lesson's deterministic draws. Every test receives a separate fresh frame.
  const draws = test.random?.length ? test.random : [0.25];
  let drawIndex = 0;
  Object.defineProperty(Math, "random", {
    configurable: false,
    writable: false,
    value: () => draws[Math.min(drawIndex++, draws.length - 1)],
  });

  const show = (value) =>
    typeof value === "string"
      ? JSON.stringify(value)
      : value && typeof value === "object"
        ? `{ ${Object.entries(value)
            .map(([key, item]) => `${key}: ${show(item)}`)
            .join(", ")} }`
        : String(value);
  console.log = (...args) => {
    logs[logs.length] = args
      .map((arg) => (typeof arg === "string" ? arg : String(arg)))
      .join(" ")
      .slice(0, 500);
  };
  function learnerFunction(name) {
    if (typeof exported[name] !== "function")
      fail(
        `Cannot find a function named ${name}. Keep its name exactly as in the starter.`,
      );
    return exported[name];
  }

  function guard() {
    ticks += 1;
    if (ticks > 20000 || nativeNow() > deadline) {
      throw new NativeError(
        "Your code kept running without finishing. Check loop conditions and recursive function calls, then try again.",
      );
    }
  }

  function snapshot() {
    return innerHTMLGetter.call(root);
  }

  function finish(passed, detail) {
    if (completed) return;
    completed = true;
    nativeClearTimeout(checkTimer);
    removeListener("error", onError);
    removeListener("unhandledrejection", onRejection);
    sendMessage(
      {
        channel: "jquery-quest-result",
        token,
        passed,
        detail,
        error: runtimeError,
        html: snapshot(),
        logs: logs.slice(0, 200),
      },
      targetOrigin,
    );
  }

  function fail(message) {
    throw new NativeError(message);
  }

  function isVisible(element) {
    // This deliberately checks display/visibility, not pixel dimensions: a
    // perfectly valid empty element may have no painted rectangle yet.
    for (
      let current = element;
      current instanceof Element;
      current = current.parentElement
    ) {
      const style = nativeGetStyle(current);
      if (
        style.display === "none" ||
        style.visibility === "hidden" ||
        style.visibility === "collapse"
      )
        return false;
    }
    return element.isConnected;
  }

  function assertOne(assertion) {
    if (assertion.type === "logs") {
      const actual = logs.slice(logStart);
      const list = (lines) =>
        lines.length ? lines.map((line) => JSON.stringify(line)).join(", ") : "nothing";
      if (
        actual.length !== assertion.value.length ||
        actual.some((line, i) => line !== assertion.value[i])
      )
        fail(
          `The console should show ${list(assertion.value)}, but it showed ${list(actual)}.`,
        );
      return;
    }
    if (assertion.type === "returns") {
      const actual = learnerFunction(assertion.fn)(...assertion.args);
      if (!Object.is(actual, assertion.value))
        fail(
          `${assertion.fn}(${assertion.args.map(show).join(", ")}) should return ${show(assertion.value)}, but it returned ${show(actual)}.`,
        );
      return;
    }
    const elements = select(assertion.selector);
    const expected = assertion.value;
    const quoted = (value) => JSON.stringify(String(value));

    if (assertion.type === "count") {
      if (elements.length !== expected) {
        fail(
          `Expected ${expected} element${expected === 1 ? "" : "s"} matching ${assertion.selector}; found ${elements.length}.`,
        );
      }
      return;
    }
    if (elements.length === 0)
      fail(
        `Cannot find ${assertion.selector}. Keep the required element in the exercise.`,
      );

    for (const element of elements) {
      if (assertion.type === "text") {
        const actual = textGetter.call(element);
        if (actual !== String(expected))
          fail(
            `${assertion.selector} should read ${quoted(expected)}, but reads ${quoted(actual)}.`,
          );
      } else if (assertion.type === "css") {
        const actual = nativeGetStyle(element)
          .getPropertyValue(assertion.property)
          .trim();
        if (actual !== expected)
          fail(
            `${assertion.selector} needs ${assertion.property}: ${expected}; it is currently ${actual || "unset"}.`,
          );
      } else if (assertion.type === "class") {
        const actual = nativeMatches.call(element, `.${expected}`);
        if (actual !== assertion.present)
          fail(
            `${assertion.selector} should ${assertion.present ? "have" : "not have"} the ${quoted(expected)} class.`,
          );
      } else if (assertion.type === "attribute") {
        const actual = nativeGetAttribute.call(element, assertion.name);
        if (actual !== expected)
          fail(
            `${assertion.selector} needs ${assertion.name}=${quoted(expected)}; found ${actual === null ? "no attribute" : quoted(actual)}.`,
          );
      } else if (assertion.type === "visible") {
        if (isVisible(element) !== expected)
          fail(
            `${assertion.selector} should be ${expected ? "visible" : "hidden"}.`,
          );
      } else if (assertion.type === "sameNode") {
        if (element !== remembered.get(assertion.original))
          fail(
            `Move the original ${assertion.original}; do not replace it with a newly created copy.`,
          );
      } else {
        fail(
          "The workshop encountered an unknown check. Please run the exercise again.",
        );
      }
    }
  }

  function assertAll(assertions) {
    for (const assertion of assertions || []) assertOne(assertion);
  }

  function step(action) {
    if (action.type === "check") {
      assertAll(action.assertions);
      return;
    }
    if (action.type === "call") {
      // A logs check after a call looks only at what this call printed.
      logStart = logs.length;
      learnerFunction(action.fn)(...action.args);
      if (runtimeError) fail(runtimeError);
      return;
    }
    const element = select(action.selector)[0];
    if (!element)
      fail(
        `Cannot interact with ${action.selector}; the required control is missing.`,
      );
    if (action.type === "click") {
      nativeClick.call(element);
    } else if (action.type === "value") {
      element.value = action.value;
    } else if (action.type === "event") {
      const event = action.name.startsWith("key")
        ? new NativeKeyboardEvent(action.name, {
            key: action.key || "",
            // jQuery copies event.which straight from the native event.
            keyCode: action.which || 0,
            which: action.which || 0,
            bubbles: true,
            cancelable: true,
          })
        : new NativeEvent(action.name, { bubbles: true, cancelable: true });
      nativeDispatch.call(element, event);
    }
    if (runtimeError) fail(runtimeError);
  }

  try {
    deadline = nativeNow() + 800;
    // A nonce-authorized script, rather than eval/Function, lets CSP reject
    // dynamically compiled strings. The learner closure has access only to
    // its private execution guard, not to this bootstrap's teacher closures.
    Object.defineProperty(window, guardSlot, {
      configurable: true,
      value: guard,
    });
    Object.defineProperty(window, exposeSlot, {
      configurable: true,
      value: (functions) => {
        exported = functions;
      },
    });
    const names = [
      ...new Set(
        [...(test.steps || []), ...(test.assertions || [])]
          .flatMap((item) => [item, ...(item.assertions || [])])
          .filter((item) => item.fn)
          .map((item) => item.fn),
      ),
    ];
    const script = document.createElement("script");
    script.nonce = nonce;
    script.textContent =
      `(function(${guardName}, ${guardName}_expose) {\n` +
      `delete window[${JSON.stringify(guardSlot)}];\n` +
      `delete window[${JSON.stringify(exposeSlot)}];\n` +
      'document.currentScript.removeAttribute("nonce");\n' +
      'document.currentScript.textContent = "";\n' +
      "document.currentScript.remove();\n" +
      `${guardName}();\n` +
      `(function() {\n${code}\n;${guardName}_expose({${names.map((name) => `${name}: typeof ${name} === "function" ? ${name} : undefined`).join(", ")}});\n}).call(window);\n` +
      `})(window[${JSON.stringify(guardSlot)}], window[${JSON.stringify(exposeSlot)}]);`;
    appendChild.call(document.body, script);
    if (script.parentNode) removeChild.call(script.parentNode, script);
    delete window[guardSlot];
    delete window[exposeSlot];

    // Also support the conventional $(function () { ... }) ready wrapper.
    // jQuery queues ready callbacks; allow them to settle before interacting.
    checkTimer = nativeSetTimeout(() => {
      if (runtimeError) {
        finish(false, runtimeError);
        return;
      }
      try {
        // A fresh budget for the tests: a background tab can delay this timer past the first one.
        deadline = nativeNow() + 800;
        for (const action of test.steps || []) step(action);
        assertAll(test.assertions);
        if (runtimeError) finish(false, runtimeError);
        else finish(true, "The island behaves exactly as requested.");
      } catch (error) {
        finish(
          false,
          runtimeError || error.message || "The expected change was not found.",
        );
      }
    }, 40);
  } catch (error) {
    runtimeError = describeError(error);
    finish(false, runtimeError);
  }
}

function htmlScriptText(value) {
  // Prevent a learner's string/comment from closing the host script element.
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

function runCheck(lesson, code, test, guardName) {
  return new Promise((resolve) => {
    const frame = document.createElement("iframe");
    const token = randomKey();
    const nonce = randomKey();
    const guardSlot = `__quest_${randomKey()}`;
    let completed = false;
    let timeout;

    frame.setAttribute("sandbox", "allow-scripts");
    frame.setAttribute("aria-hidden", "true");
    frame.setAttribute("tabindex", "-1");
    frame.setAttribute("title", "Isolated exercise check");
    frame.style.cssText =
      "position:fixed;left:-10000px;top:0;width:640px;height:480px;border:0;pointer-events:none;";

    function finish(result) {
      if (completed) return;
      completed = true;
      clearTimeout(timeout);
      window.removeEventListener("message", onMessage);
      frame.remove();
      resolve(result);
    }

    function onMessage(event) {
      if (event.source !== frame.contentWindow || event.origin !== "null")
        return;
      const data = event.data;
      if (
        !data ||
        data.channel !== "jquery-quest-result" ||
        data.token !== token
      )
        return;
      if (
        typeof data.passed !== "boolean" ||
        typeof data.detail !== "string" ||
        typeof data.html !== "string"
      )
        return;
      if (data.error !== null && typeof data.error !== "string") return;
      if (
        !Array.isArray(data.logs) ||
        !data.logs.every((line) => typeof line === "string")
      )
        return;
      finish({
        passed: data.passed,
        detail: data.detail,
        error: data.error,
        html: data.html,
        logs: data.logs,
      });
    }

    const configuration = {
      token,
      nonce,
      guardName,
      guardSlot,
      code,
      test,
      targetOrigin: window.location.origin,
    };
    const policy = `default-src 'none'; script-src 'nonce-${nonce}'; style-src 'unsafe-inline'; img-src data:; connect-src 'none'; font-src 'none'; media-src 'none'; frame-src 'none'; worker-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'`;
    // The fixture is trusted curriculum HTML, never learner-generated markup.
    // No allow-same-origin: even access to parent.document is forbidden.
    frame.srcdoc =
      '<!doctype html><html><head><meta charset="utf-8">' +
      `<meta http-equiv="Content-Security-Policy" content="${policy}">` +
      "<style>body{font-family:system-ui,sans-serif;padding:20px;color:#20372e;background:#f6f9f0}button,input,select{font:inherit}button{padding:8px 14px}input,select{padding:6px}section{max-width:540px}</style>" +
      `</head><body><main id="quest-fixture">${lesson.html}</main>` +
      `<script nonce="${nonce}">${jquerySource.replace(/<\/script/gi, "<\\/script")}</script>` +
      `<script nonce="${nonce}">(${sandboxBootstrap.toString()})(${htmlScriptText(configuration)});</script>` +
      "</body></html>";

    window.addEventListener("message", onMessage);
    timeout = setTimeout(() => {
      const error =
        "This check took too long. Look for a loop that never ends, a recursive call without a stopping condition, or code that leaves the workshop page.";
      finish({ passed: false, detail: error, error, html: lesson.html });
    }, FRAME_TIMEOUT);
    try {
      document.body.appendChild(frame);
    } catch (error) {
      const message = `The safe workshop could not start: ${error.message}`;
      finish({
        passed: false,
        detail: message,
        error: message,
        html: lesson.html,
      });
    }
  });
}

export async function runExercise(lesson, code) {
  let instrumented;
  const guardName = `__questGuard_${randomKey()}`;
  try {
    if (typeof code !== "string")
      throw new Error(
        "Enter JavaScript in the editor before running the exercise.",
      );
    if (code.length > MAX_SOURCE_LENGTH)
      throw new Error(
        "This workshop accepts up to 50,000 characters. Keep your solution focused on the island task.",
      );
    instrumented = instrument(code, guardName);
  } catch (error) {
    const location = error.loc
      ? ` on line ${error.loc.line}, column ${error.loc.column + 1}`
      : "";
    const detail =
      error instanceof SyntaxError
        ? `JavaScript syntax error${location}: ${error.message.replace(/\s*\(\d+:\d+\)$/, "")}. Check your quotes, brackets, and parentheses.`
        : error.message ||
          "The JavaScript could not be prepared. Please check your code.";
    return {
      tests: lesson.tests.map((test) => ({
        label: test.label,
        passed: false,
        detail: "Fix the JavaScript error before this check can run.",
      })),
      error: detail,
      html: lesson.html,
      logs: [],
    };
  }

  // Console quests also run once with no test driving them, so the console
  // shows exactly what the learner's own code printed.
  const [ownRun, ...results] = await Promise.all(
    [lesson.console ? {} : null, ...lesson.tests].map(
      (test) => test && runCheck(lesson, instrumented, test, guardName),
    ),
  );
  return {
    logs: ownRun?.logs || [],
    tests: results.map((result, index) => ({
      label: lesson.tests[index].label,
      passed: result.passed,
      detail: result.detail,
    })),
    error: results.find((result) => result.error)?.error || null,
    // Show the final independent scenario, including its simulated user input.
    html: results.at(-1)?.html || lesson.html,
  };
}
