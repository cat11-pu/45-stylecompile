// invalidate.js：失效与增量。
// 只重编译受影响的部分：改动规则本身，加上涉及受影响元素（命中改动规则的元素）的规则；
// 预算限制重编译条数，超出的按声明顺序截断，实际消耗反映在 used 上。
import { matchAll } from "./compile.js";

export function recompile(rules, elements, changedRule, budget) {
  // 一次线性匹配，胜出规则与命中集合都来自这一遍，保证与整份匹配逐项一致。
  const { matched, hits } = matchAll(rules, elements);
  const changed = rules.find((rule) => rule.id === changedRule) || null;

  const invalidated = [];
  if (changed) {
    for (const element of elements) {
      if (hits[element.id].includes(changed.id)) invalidated.push(element.id);
    }
  }

  const affected = new Set();
  if (changed) affected.add(changed.id);
  for (const elementId of invalidated) {
    for (const ruleId of hits[elementId]) affected.add(ruleId);
  }

  const limit = budget === undefined || budget === null ? affected.size : Math.max(0, budget);
  const recompiled = [];
  for (const rule of rules) {
    if (recompiled.length >= limit) break;
    if (affected.has(rule.id)) recompiled.push(rule.id);
  }

  return { matched: matched, recompiled: recompiled, invalidated: invalidated, used: recompiled.length };
}
