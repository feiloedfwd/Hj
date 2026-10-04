// ============================================================
//  🔒 WHITELIST VERIFICATION ENDPOINT
//  GET /api/verify?data=<encoded username>
//
//  Responds ONLY with:  { "user": true/false, "token": "..." }
//  The whitelist is stored ENCODED — plaintext usernames
//  never appear anywhere, even in this source file.
// ============================================================

const { decodeUsername, makeToken } = require("../shared-cipher");

// ============================================================
//  ⭐ WHITELIST — paste ENCODED usernames here
//  Generate them with:   node adduser.js TheirRobloxName
// ============================================================
const WHITELIST = new Set([
  // "pastedEncodedStringGoesHere",
]);

module.exports = (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "application/json");

  const data = (req.query && typeof req.query.data === "string") ? req.query.data : "";

  // missing/empty data → not a user
  if (!data || data.length > 200) {
    return res.status(200).end(JSON.stringify({ user: false, token: "" }));
  }

  // decode the incoming username
  const username = decodeUsername(data);
  if (!username || !/^[A-Za-z0-9_]{1,20}$/.test(username)) {
    return res.status(200).end(JSON.stringify({ user: false, token: "" }));
  }

  // is the encoded username in the whitelist?
  if (!WHITELIST.has(data)) {
    return res.status(200).end(JSON.stringify({ user: false, token: "" }));
  }

  // ✅ whitelisted → issue token: cipher("PremiumUsername" + reversedUsername)
  return res.status(200).end(JSON.stringify({ user: true, token: makeToken(username) }));
};

module.exports.WHITELIST = WHITELIST; // for local testing only — never sent to clients
