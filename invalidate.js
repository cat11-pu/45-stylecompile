// invalidate.js：失效与增量（只重编译改动规则本身 + 涉及受影响元素的规则，预算限制条数）
import { compile, matchScore } from "./compile.js";

export function recompile(rules, elements, changedRule, budget) {
  const changed = rules.find((rule) => rule.id === changedRule) || null;

  // 受影响元素：命中改动规则选择器的元素（按声明顺序）
  const invalidated = [];
  if (changed) {
    for (const element of elements) {
      if (matchScore(changed.selector, element) >= 0) invalidated.push(element.id);
    }
  }
  const affected = new Set(invalidated);

  // 待重编译：改动规则本身 + 命中任一受影响元素的规则（按声明顺序）
  const candidates = [];
  if (changed) {
    for (const rule of rules) {
      if (rule === changed) { candidates.push(rule.id); continue; }
      const touches = elements.some(
        (element) => affected.has(element.id) && matchScore(rule.selector, element) >= 0
      );
      if (touches) candidates.push(rule.id);
    }
  }

  // 预算限制条数；预算不足时 used 停在预算上
  const limit = typeof budget === "number" ? Math.max(0, budget) : candidates.length;
  const used = Math.min(candidates.length, limit);
  const recompiled = candidates.slice(0, used);

  // 不变量：胜出规则必须与整份匹配逐项一致
  const full = compile(rules, elements);
  return { matched: full.matched, recompiled: recompiled, invalidated: invalidated, used: used };
}
