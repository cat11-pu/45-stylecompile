// app.js：渲染结果
import { compile } from "./compile.js";
import { recompile } from "./invalidate.js";

export function render(spec) {
  const full = compile(spec.rules, spec.elements);
  const grown = recompile(spec.rules, spec.elements, spec.changed_rule, spec.budget);
  const same = JSON.stringify(grown.matched) === JSON.stringify(full.matched);
  return { matched: full.matched, recompiled: grown.recompiled, invalidated: grown.invalidated,
           budget_used: grown.used, consistent: same, order: full.order };
}
