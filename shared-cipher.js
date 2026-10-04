// ============================================================
//  SHARED CIPHER MODULE (server-side only!)
//  Used by api/verify.js and adduser.js
//  ⚠️ These exact SAME keys/alphabet must exist inside your
//     roblox-client.lua — if you change them here, change them there.
// ============================================================

const CIPHER_KEY = "X7_kW9_mZ2_Qp4_Vn8"; // <-- CHANGE THIS (request cipher key)
const TOKEN_KEY  = "T0k_3n_S3cr3t_K3y_88"; // <-- CHANGE THIS (token cipher key)
const PREFIX     = "PremiumUsername";        // token plaintext prefix

const ALPHABET = "kgRVPacDA5SBuziUnf8M97Ex4p0r3TmWsohO-jdeF2QKJL1IZvHY_NbGlwtXy6qC";
const PAD = "~";

// -------------- custom cipher: repeating-key XOR --------------
function xorBytes(str, key) {
  let out = "";
  for (let i = 0; i < str.length; i++) {
    out += String.fromCharCode(str.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return out;
}

// -------------- custom encoding: Base64 w/ shuffled URL-safe alphabet --------------
function b64encode(data) {
  let out = "";
  for (let i = 0; i < data.length; i += 3) {
    const b1 = data.charCodeAt(i);
    const b2 = i + 1 < data.length ? data.charCodeAt(i + 1) : null;
    const b3 = i + 2 < data.length ? data.charCodeAt(i + 2) : null;

    const c1 = b1 >> 2;
    let c2 = (b1 & 3) << 4;

    if (b2 === null) {
      out += ALPHABET[c1] + ALPHABET[c2] + PAD + PAD;
    } else if (b3 === null) {
      c2 |= b2 >> 4;
      const c3 = (b2 & 15) << 2;
      out += ALPHABET[c1] + ALPHABET[c2] + ALPHABET[c3] + PAD;
    } else {
      c2 |= b2 >> 4;
      const c3 = ((b2 & 15) << 2) | (b3 >> 6);
      const c4 = b3 & 63;
      out += ALPHABET[c1] + ALPHABET[c2] + ALPHABET[c3] + ALPHABET[c4];
    }
  }
  return out;
}

const REV = {};
for (let i = 0; i < ALPHABET.length; i++) REV[ALPHABET[i]] = i;

function b64decode(data) {
  let out = "";
  for (let i = 0; i < data.length; i += 4) {
    const c1 = REV[data[i]], c2 = REV[data[i + 1]];
    if (c1 === undefined || c2 === undefined) return null;
    out += String.fromCharCode((c1 << 2) | (c2 >> 4));
    const ch3 = data[i + 2];
    if (ch3 === undefined || ch3 === PAD) continue;
    const c3 = REV[ch3];
    if (c3 === undefined) return null;
    out += String.fromCharCode(((c2 & 15) << 4) | (c3 >> 2));
    const ch4 = data[i + 3];
    if (ch4 === undefined || ch4 === PAD) continue;
    const c4 = REV[ch4];
    if (c4 === undefined) return null;
    out += String.fromCharCode(((c3 & 3) << 6) | c4);
  }
  return out;
}

// -------------- high-level helpers --------------
// what the Roblox client sends: username -> cipher -> encoding
function encodeUsername(username) {
  return b64encode(xorBytes(username, CIPHER_KEY));
}
function decodeUsername(encoded) {
  const d = b64decode(encoded);
  if (d === null) return null;
  return xorBytes(d, CIPHER_KEY);
}

// token: "PremiumUsername" + reversed username -> cipher -> encoding
function reverse(s) { return s.split("").reverse().join(""); }
function makeToken(username) {
  return b64encode(xorBytes(PREFIX + reverse(username), TOKEN_KEY));
}
function decodeToken(token) {
  const d = b64decode(token);
  if (d === null) return null;
  return xorBytes(d, TOKEN_KEY);
}

module.exports = {
  CIPHER_KEY, TOKEN_KEY, PREFIX, ALPHABET, PAD,
  encodeUsername, decodeUsername, makeToken, decodeToken,
};
