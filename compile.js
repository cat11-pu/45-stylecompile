// compile.js：规则编译与匹配。
// 计分：tag 命中记一分、每个 class 命中各记一分，得分最高者胜，同分取声明顺序靠后的。
export const E_UNKNOWN_SELECTOR = "E_UNKNOWN_SELECTOR";

function unknownSelector(detail) {
  const error = new Error(E_UNKNOWN_SELECTOR + ": " + detail);
  error.code = E_UNKNOWN_SELECTOR;
  return error;
}

// 只认识 { tag, classes } 两种键，其余写法一律报 E_UNKNOWN_SELECTOR，不静默当成不匹配。
function checkSelector(rule) {
  const selector = rule && rule.selector;
  if (selector === null || typeof selector !== "object" || Array.isArray(selector)) {
    throw unknownSelector("rule " + (rule && rule.id) + " 的 selector 不是对象写法");
  }
  for (const key of Object.keys(selector)) {
    if (key !== "tag" && key !== "classes") {
      throw unknownSelector("rule " + rule.id + " 的 selector 含不认识的键 " + key);
    }
  }
  if (selector.tag !== undefined && typeof selector.tag !== "string") {
    throw unknownSelector("rule " + rule.id + " 的 tag 不是字符串");
  }
  if (selector.classes !== undefined &&
      (!Array.isArray(selector.classes) || selector.classes.some((name) => typeof name !== "string"))) {
    throw unknownSelector("rule " + rule.id + " 的 classes 不是字符串数组");
  }
}

// 单条规则对单个元素的得分：任一约束不命中返回 -1，否则 tag 一分加每个 class 一分。
export function matchScore(selector, element) {
  const elementClasses = element.classes || [];
  let score = 0;
  if (selector.tag !== undefined) {
    if (selector.tag !== element.tag) return -1;
    score += 1;
  }
  if (selector.classes !== undefined) {
    for (const name of selector.classes) {
      if (!elementClasses.includes(name)) return -1;
      score += 1;
    }
  }
  return score;
}

// 一次线性匹配：同时算出每个元素的胜出规则与命中规则集合，供 compile 与增量复用。
export function matchAll(rules, elements) {
  for (const rule of rules) checkSelector(rule);
  const matched = {};
  const hits = {};
  for (const element of elements) {
    let winner = null;
    let best = -1;
    const elementHits = [];
    for (const rule of rules) {
      const score = matchScore(rule.selector, element);
      if (score < 0) continue;
      elementHits.push(rule.id);
      if (score >= best) {
        best = score;
        winner = rule.id;
      }
    }
    matched[element.id] = winner;
    hits[element.id] = elementHits;
  }
  return { matched: matched, hits: hits };
}

export function compile(rules, elements) {
  const matched = matchAll(rules, elements).matched;
  return { matched: matched, order: rules.map((rule) => rule.id) };
}
