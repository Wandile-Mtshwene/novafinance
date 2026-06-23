/**
 * Creates the demo account by calling the live better-auth signup endpoint.
 * Run after deployment: node scripts/seed-demo.mjs
 */

const BASE_URL = process.argv[2] ?? "https://novafinance-umber.vercel.app";

const payload = {
  name: "Demo User",
  email: "demo@novafinance.app",
  password: "demo1234",
};

console.log(`Creating demo account at ${BASE_URL} ...`);

const res = await fetch(`${BASE_URL}/api/auth/sign-up/email`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Origin": BASE_URL,
  },
  body: JSON.stringify(payload),
});

const body = await res.json().catch(() => res.text());

if (res.ok) {
  console.log("Demo account created successfully.");
  console.log("  email:", payload.email);
  console.log("  password:", payload.password);
} else {
  const msg = typeof body === "object" ? body?.message ?? JSON.stringify(body) : body;
  if (typeof msg === "string" && msg.toLowerCase().includes("already")) {
    console.log("Demo account already exists. Nothing to do.");
  } else {
    console.error("Failed:", res.status, msg);
  }
}
