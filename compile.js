// compile.js：规则编译与匹配（tag 命中记 1 分，每个 class 命中各记 1 分，
// 得分最高者胜，同分按声明顺序取靠后的；不认识的 selector 写法报 E_UNKNOWN_SELECTOR）
const KNOWN_SELECTOR_KEYS = new Set(["tag", "classes"]);

export function unknownSelectorError(detail) {
  const error = new Error("E_UNKNOWN_SELECTOR: 不认识的 selector 写法 " + detail);
  error.code = "E_UNKNOWN_SELECTOR";
  return error;
}

export function validateSelector(selector) {
  if (!selector || typeof selector !== "object" || Array.isArray(selector)) {
    throw unknownSelectorError(JSON.stringify(selector));
  }
  for (const key of Object.keys(selector)) {
    if (!KNOWN_SELECTOR_KEYS.has(key)) throw unknownSelectorError(key);
  }
  if (selector.tag !== undefined && typeof selector.tag !== "string") {
    throw unknownSelectorError("tag=" + JSON.stringify(selector.tag));
  }
  if (selector.classes !== undefined) {
    const bad = !Array.isArray(selector.classes) || selector.classes.some((name) => typeof name !== "string");
    if (bad) throw unknownSelectorError("classes=" + JSON.stringify(selector.classes));
  }
}

// 命中返回得分（tag 1 分 + 每个 class 各 1 分），未命中返回 -1
export function matchScore(selector, element) {
  validateSelector(selector);
  const classes = element.classes || [];
  let score = 0;
  if (selector.tag !== undefined) {
    if (selector.tag !== element.tag) return -1;
    score += 1;
  }
  if (selector.classes !== undefined) {
    for (const name of selector.classes) {
      if (!classes.includes(name)) return -1;
      score += 1;
    }
  }
  return score;
}

export function compile(rules, elements) {
  const matched = {};
  for (const element of elements) {
    let winner = null;
    let best = -1;
    for (const rule of rules) {
      const score = matchScore(rule.selector, element);
      if (score >= 0 && score >= best) {
        winner = rule.id;
        best = score;
      }
    }
    matched[element.id] = winner;
  }
  return { matched: matched, order: rules.map((rule) => rule.id) };
}
