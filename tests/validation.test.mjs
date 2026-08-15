import test from "node:test";
import assert from "node:assert/strict";
import { validateOrder, validateQuantity, accessRequiresAuthorisation, sanitizeText } from "../assets/js/validation.mjs";
import { SITE, PRODUCTS } from "../src/data.mjs";

const FEES = SITE.pricing.accessFees;
const good = { productId: "P2", colour: "BLACK", quantity: 2, access: "OPEN_WITH_KEY", district: "52", authorised: false };
const coloursP2 = PRODUCTS.find((p) => p.id === "P2").colours;

test("valid privacy-minimal payload passes", () => {
  assert.equal(validateOrder(good, { validColours: coloursP2 }).valid, true);
});

test("postal district must be exactly 2 digits", () => {
  assert.equal(validateOrder({ ...good, district: "5" }, { validColours: coloursP2 }).valid, false);
  assert.equal(validateOrder({ ...good, district: "520" }, { validColours: coloursP2 }).valid, false);
});

test("product & colour selection validated together", () => {
  // colour not offered by P2
  assert.equal(validateOrder({ ...good, colour: "SILVER" }, { validColours: coloursP2 }).valid, false);
  // invalid product id
  assert.equal(validateOrder({ ...good, productId: "P99" }, { validColours: coloursP2 }).valid, false);
});

test("quantity rejects zero, negative, fractional, excessive, non-numeric", () => {
  for (const q of ["0", "-1", "2.5", "1000", "abc", "", "  ", "1e3", "+2"]) {
    assert.equal(validateQuantity(q).ok, false, `should reject ${JSON.stringify(q)}`);
  }
  for (const q of ["1", "2", "100"]) {
    assert.equal(validateQuantity(q).ok, true, `should accept ${q}`);
  }
});

test("authorisation required only for unlock jobs", () => {
  assert.equal(accessRequiresAuthorisation("OPEN_WITH_KEY", FEES), false);
  assert.equal(accessRequiresAuthorisation("NEW_MAILBOX", FEES), false);
  assert.equal(accessRequiresAuthorisation("LOST_KEY_LOCKED", FEES), true);
  assert.equal(accessRequiresAuthorisation("DAMAGED_OR_JAMMED", FEES), true);

  const locked = { ...good, access: "LOST_KEY_LOCKED" };
  assert.equal(validateOrder(locked, { validColours: coloursP2, requireAuthorisation: true }).valid, false);
  assert.equal(validateOrder({ ...locked, authorised: true }, { validColours: coloursP2, requireAuthorisation: true }).valid, true);
});

test("sanitizeText strips control chars and trims to length", () => {
  assert.equal(sanitizeText("  hi\u0007there  ", 100), "hithere");
  assert.equal(sanitizeText("abcdef", 3), "abc");
});
