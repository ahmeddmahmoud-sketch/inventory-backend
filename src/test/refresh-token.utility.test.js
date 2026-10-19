
import test from "node:test";
import assert from "node:assert/strict";

import {
  generateRefreshToken,
  hashRefreshToken,
} from "../utils/refreshToken.js";

test("generates a secure refresh token", () => {
  const token = generateRefreshToken();

  assert.equal(typeof token, "string");
  assert.equal(token.length, 64);
});

test("generates different tokens", () => {
  const first = generateRefreshToken();
  const second = generateRefreshToken();

  assert.notEqual(first, second);
});

test("hashes the same token consistently", () => {
  const token = generateRefreshToken();

  assert.equal(hashRefreshToken(token), hashRefreshToken(token));
});

test("hash is different from the original token", () => {
  const token = generateRefreshToken();

  assert.notEqual(hashRefreshToken(token), token);
  assert.equal(hashRefreshToken(token).length, 64);
});
