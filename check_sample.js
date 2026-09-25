import fs from "node:fs";
import { compile } from "./compile.js";
import { recompile } from "./invalidate.js";
import { render } from "./app.js";

// 验收断言：上面每条值收进 emit，最后与期望值逐项比对，不符就非零退出。
const __lines = [];
function emit(label, value) { __lines.push([String(label).replace(/ =$/, ""), value]); }


const spec = JSON.parse(fs.readFileSync(process.argv[2] || "sample/styles.json", "utf8"));
const full = compile(spec.rules, spec.elements);
const grown = recompile(spec.rules, spec.elements, spec.changed_rule, spec.budget);
const view = render(spec);

emit("每个元素的胜出规则 =", JSON.stringify(full.matched));
emit("重编译的规则 =", JSON.stringify(grown.recompiled));
emit("受影响的元素 =", JSON.stringify(grown.invalidated));
emit("预算消耗 =", grown.used);
emit("增量是否与全量一致 =", view.consistent);
emit("未知选择器的错误码 =", spec.unknown_code);


// ---- 期望值（参考模型算出，与题面给的验收数值一致）----
const EXPECTED = {
  "每个元素的胜出规则": {
    "e0": "r0",
    "e1": "r2",
    "e2": "r3",
    "e3": null
  },
  "重编译的规则": [
    "r0",
    "r1",
    "r2"
  ],
  "受影响的元素": [
    "e1",
    "e2"
  ],
  "预算消耗": 3,
  "增量是否与全量一致": true,
  "未知选择器的错误码": "E_UNKNOWN_SELECTOR"
};
let __bad = 0;
for (const [label, want] of Object.entries(EXPECTED)) {
  const found = __lines.find((pair) => pair[0] === label);
  if (!found) { __bad += 1; console.log("缺失验收项 " + label); continue; }
  const got = found[1];
  if (JSON.stringify(got) === JSON.stringify(want)) { console.log("一致 " + label + " = " + JSON.stringify(got)); }
  else { __bad += 1; console.log("不一致 " + label + " 期望 " + JSON.stringify(want) + " 实际 " + JSON.stringify(got)); }
}
console.log("验收项 " + (Object.keys(EXPECTED).length - __bad) + "/" + Object.keys(EXPECTED).length + " 通过");
process.exit(__bad === 0 ? 0 : 1);
