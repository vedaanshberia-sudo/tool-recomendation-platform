// Run with:  node test.js
// Calls the backend 100 times and checks every answer.
const assert = require("assert");
const fn = require("./netlify/functions/recommend.js");

const cats = ["any"].concat(Object.keys(fn.CATEGORIES));
const opts = {
  field: ["any", "ai", "nonai"], budget: ["free", "paid", "either"],
  priority: ["best", "cost", "easy", "power"], experience: ["beginner", "intermediate", "advanced"],
  billing: ["monthly", "annual", "compare"],
};
const pick = (arr, i) => arr[i % arr.length];

(async () => {
  let passed = 0;
  for (let i = 0; i < 100; i++) {
    const input = { category: pick(cats, i), field: pick(opts.field, i * 7 + 1), budget: pick(opts.budget, i * 3 + 2),
      priority: pick(opts.priority, i * 5), experience: pick(opts.experience, i * 11), billing: pick(opts.billing, i * 13 + 1) };
    // Real HTTP-style call through the handler
    const res = await fn.handler({ httpMethod: "POST", body: JSON.stringify(input) });
    assert.strictEqual(res.statusCode, 200);
    const out = JSON.parse(res.body);
    assert.strictEqual(out.ok, true);
    assert.ok(out.results.length <= 5);
    assert.deepStrictEqual(JSON.parse((await fn.handler({ httpMethod: "POST", body: JSON.stringify(input) })).body), out); // same input -> same output
    for (let k = 0; k < out.results.length; k++) {
      const r = out.results[k];
      assert.ok(r.score >= 0 && r.score <= 100);
      if (k > 0) assert.ok(out.results[k - 1].score >= r.score);
      if (input.budget === "free") { assert.ok(r.free); assert.strictEqual(r.paid, null); }
      if (input.budget === "paid") { assert.ok(r.paid); assert.strictEqual(r.free, null); }
      if (input.field === "ai") assert.strictEqual(r.field, "AI");
      if (input.field === "nonai") assert.notStrictEqual(r.field, "AI");
      if (r.paid && r.paid.monthly && r.paid.annual) {
        assert.strictEqual(r.paid.savings, r.paid.monthly * 12 - r.paid.annual);
        if (input.billing === "annual") assert.strictEqual(r.paid.recommended, "annual");
        if (input.billing === "monthly") assert.strictEqual(r.paid.recommended, "monthly");
      }
    }
    assert.strictEqual(out.table.length, out.results.length);
    passed++;
  }
  // Error handling
  assert.strictEqual((await fn.handler({ httpMethod: "POST", body: "{bad" })).statusCode, 400);
  assert.strictEqual((await fn.handler({ httpMethod: "POST", body: JSON.stringify({ budget: "x" }) })).statusCode, 400);
  assert.strictEqual((await fn.handler({ httpMethod: "POST", body: JSON.stringify({ category: "nope" }) })).statusCode, 400);
  assert.strictEqual((await fn.handler({ httpMethod: "GET" })).statusCode, 200);
  assert.strictEqual((await fn.handler({ httpMethod: "PUT" })).statusCode, 405);
  assert.strictEqual((await fn.handler({ httpMethod: "OPTIONS" })).statusCode, 204);
  console.log(passed + "/100 backend runs passed, plus 6 error-handling checks passed.");
  // Example config from the brief:
  const ex = fn.recommend({ category: "any", budget: "either", priority: "best", experience: "beginner", billing: "compare" });
  ex.results.forEach(r => console.log(r.rank, r.name, r.score, r.paid ? r.paid.recommended : "free"));
})().catch(e => { console.error("FAILED:", e.message); process.exit(1); });
