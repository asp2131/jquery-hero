import assert from "node:assert/strict";
import test from "node:test";
import { getSyntaxDiagnostics } from "./editor-syntax.js";

test("literal punctuation is not mistaken for unclosed code", () => {
  const source = [
    'const text = "})]";',
    'const pattern = /[(){}\\[\\]]/;',
    '// unmatched-looking ({[ in a comment',
    '/* })] */',
    'const template = `({[ ${`nested ${[1, 2].join(")")}`} })]`;',
    'return template;',
  ].join("\n");
  assert.deepEqual(getSyntaxDiagnostics(source), []);
});

test("missing nested delimiters point to the opener until repaired", () => {
  const source = 'function cast() {\n  $("#hero").text("Ready"';
  const [parenthesis] = getSyntaxDiagnostics(source);
  assert.match(parenthesis.message, /Missing '\)'/);
  assert.equal(source[parenthesis.from], "(");
  assert.equal(parenthesis.line, 2);

  const [brace] = getSyntaxDiagnostics(source + ");");
  assert.match(brace.message, /Missing '}'/);
  assert.equal(source[brace.from], "{");
  assert.equal(brace.line, 1);
  assert.deepEqual(getSyntaxDiagnostics(source + ");\n}"), []);
});

test("a mismatched closer reports what was expected at the error", () => {
  const source = 'const allies = ["hero", "slime");';
  const [diagnostic] = getSyntaxDiagnostics(source);
  assert.match(diagnostic.message, /Expected '\]'.*found '\)'/);
  assert.equal(source.slice(diagnostic.from, diagnostic.to), ")");
  assert.deepEqual(getSyntaxDiagnostics(source.replace(")", "]")), []);
});

test("balanced brackets do not hide other syntax errors", () => {
  const source = 'const name = ;\n$("#hero").text(name);';
  const [diagnostic] = getSyntaxDiagnostics(source);
  assert.equal(source.slice(diagnostic.from, diagnostic.to), ";");
  assert.match(diagnostic.message, /Unexpected/);
  assert.deepEqual(getSyntaxDiagnostics(source.replace("= ;", '= "Ready";')), []);
});

test("an unfinished string reports its missing quote, not its literal brackets", () => {
  const [diagnostic] = getSyntaxDiagnostics('const message = "ready ({[');
  assert.match(diagnostic.message, /closing quote/);
  assert.equal(diagnostic.from, 16);
});
