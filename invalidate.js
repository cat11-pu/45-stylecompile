// invalidate.js：失效与增量（基线：全部重编译）
import { compile } from "./compile.js";

export function recompile(rules, elements, changedRule, budget) {
  const full = compile(rules, elements);
  return { matched: full.matched, recompiled: rules.map((rule) => rule.id),
           invalidated: elements.map((element) => element.id), used: rules.length };
}
