// compile.js：规则编译与匹配（基线：按声明顺序取最后一条命中的）
export function compile(rules, elements) {
  const matched = {};
  for (const element of elements) {
    let winner = null;
    for (const rule of rules) {
      const tagHit = !rule.selector.tag || rule.selector.tag === element.tag;
      const classHit = !rule.selector.classes || rule.selector.classes.every((name) => (element.classes || []).includes(name));
      if (tagHit && classHit) winner = rule.id;
    }
    matched[element.id] = winner;
  }
  return { matched: matched, order: rules.map((rule) => rule.id) };
}
