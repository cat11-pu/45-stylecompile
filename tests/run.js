import assert from "node:assert";
import { compile } from "../compile.js";
import { recompile } from "../invalidate.js";
import { render } from "../app.js";

let total = 0;
let failed = 0;
function check(name, fn) {
  total += 1;
  try { fn(); console.log("ok " + name); } catch (e) { failed += 1; console.log("FAIL " + name + " :: " + e.message); }
}

const rules = [{ id: "r0", selector: { tag: "p" }, props: { bg: "red" } }];
const elements = [{ id: "e0", tag: "p", classes: [] }];

check("compile returns matched map", () => {
  assert.strictEqual(typeof compile(rules, elements).matched, "object");
});

check("compile returns order", () => {
  assert.ok(Array.isArray(compile(rules, elements).order));
});

check("recompile reports used", () => {
  assert.strictEqual(typeof recompile(rules, elements, "r0", 4).used, "number");
});

check("recompile reports invalidated", () => {
  assert.ok(Array.isArray(recompile(rules, elements, "r0", 4).invalidated));
});

check("render exposes consistent flag", () => {
  assert.strictEqual(typeof render({ rules: rules, elements: elements, changed_rule: "r0", budget: 4 }).consistent, "boolean");
});

check("compile rejects unknown selector with E_UNKNOWN_SELECTOR", () => {
  assert.throws(
    () => compile([{ id: "rx", selector: { weird: true } }], elements),
    (error) => error.code === "E_UNKNOWN_SELECTOR"
  );
});

console.log(total + " cases, " + failed + " failed");
process.exit(failed === 0 ? 0 : 1);
