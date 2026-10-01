import { getLineInfo, parse } from "acorn";
import { closeBrackets, closeBracketsKeymap } from "@codemirror/autocomplete";
import { bracketMatching } from "@codemirror/language";
import { linter, lintGutter, lintKeymap } from "@codemirror/lint";
import { Prec } from "@codemirror/state";
import { keymap, ViewPlugin } from "@codemirror/view";

const closingDelimiter = { "(": ")", "[": "]", "{": "}", "${": "}" };

// Only consumed parser tokens count as delimiters. Literal text, comments,
// regular expressions, and template text never enter this stack.
export function getSyntaxDiagnostics(source) {
  const openers = [];
  try {
    parse(source, {
      ecmaVersion: "latest",
      sourceType: "script",
      allowReturnOutsideFunction: true,
      locations: true,
      onToken(token) {
        const label = token.type.label;
        if (Object.hasOwn(closingDelimiter, label)) {
          openers.push(token);
        } else if (label === ")" || label === "]" || label === "}") {
          if (closingDelimiter[openers.at(-1)?.type.label] === label) {
            openers.pop();
          }
        }
      },
    });
    return [];
  } catch (error) {
    if (!(error instanceof SyntaxError)) throw error;

    let from = Math.max(0, Math.min(error.pos ?? 0, source.length));
    let message = error.message.replace(/ \(\d+:\d+\)$/, "");
    const opener = openers.at(-1);
    const found = source[from];
    const unexpected = message === "Unexpected token";

    if (unexpected && from === source.length && opener) {
      const label = opener.type.label;
      message = `Missing '${closingDelimiter[label]}' to close '${label}' opened on line ${opener.loc.start.line}.`;
      from = opener.start;
    } else if (unexpected && (found === ")" || found === "]" || found === "}")) {
      if (!opener) {
        message = `Unexpected '${found}': there is no matching opening delimiter.`;
      } else if (closingDelimiter[opener.type.label] !== found) {
        message = `Expected '${closingDelimiter[opener.type.label]}' to close '${opener.type.label}' from line ${opener.loc.start.line}, but found '${found}'.`;
      } else {
        message = `Unexpected '${found}'. Check for a missing value or expression before it.`;
      }
    } else if (unexpected) {
      message = from === source.length
        ? "This statement is incomplete. Check for a missing value or expression."
        : `Unexpected '${found}'. Check the expression just before it.`;
    } else if (message === "Unterminated string constant") {
      message = "This string is missing its closing quote.";
    } else if (message === "Unterminated template") {
      message = "This template string is missing its closing backtick (`).";
    } else if (message === "Unterminated comment") {
      message = "This comment is missing its closing */.";
    }

    // At EOF, mark an opener above when possible, otherwise the final character.
    if (from === source.length && from > 0) from--;
    const location = getLineInfo(source, from);
    return [{
      from,
      to: Math.min(from + 1, source.length),
      severity: "error",
      message,
      line: location.line,
      column: location.column + 1,
    }];
  }
}

export function syntaxSupport(onStatus) {
  const statusPlugin = ViewPlugin.fromClass(class {
    constructor(view) {
      this.view = view;
      this.active = true;
      this.report({ state: "checking" });
    }

    report(status) {
      const doc = this.view.state.doc;
      // Constructors and update hooks run inside CodeMirror's update cycle.
      // Defer callbacks so a consumer may safely dispatch (for example to jump).
      queueMicrotask(() => {
        if (this.active && this.view.state.doc === doc) onStatus(status);
      });
    }

    update(update) {
      if (update.docChanged) this.report({ state: "checking" });
    }

    destroy() {
      this.active = false;
    }
  });

  return [
    bracketMatching(),
    closeBrackets(),
    Prec.high(keymap.of([...closeBracketsKeymap, ...lintKeymap])),
    statusPlugin,
    lintGutter(),
    linter((view) => {
      const diagnostics = getSyntaxDiagnostics(view.state.doc.toString());
      const first = diagnostics[0];
      const status = first
        ? {
          state: "error",
          diagnostic: {
            from: first.from,
            to: first.to,
            message: first.message,
            line: first.line,
            column: first.column,
          },
        }
        : { state: "valid" };
      view.plugin(statusPlugin)?.report(status);
      return diagnostics;
    }, { delay: 350 }),
  ];
}
