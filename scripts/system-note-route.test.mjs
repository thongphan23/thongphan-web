import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("system note route reads the public note through api.thongphan.com", async () => {
  const page = await readFile(new URL("../app/system-note/page.tsx", import.meta.url), "utf8");
  const client = await readFile(new URL("../components/system-note/SystemNote.tsx", import.meta.url), "utf8");
  assert.match(page, /SystemNote/u);
  assert.match(client, /https:\/\/api\.thongphan\.com\/v1\/public\/notes\/homepage-demo/u);
  assert.match(client, /Dữ liệu đang được đọc qua API Gateway/u);
  assert.doesNotMatch(client, /abc[^a-z].*fallback|fallback.*abc/isu);
});
