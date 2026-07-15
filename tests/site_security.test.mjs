import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { describe, it } from "node:test";


const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");


describe("site DOM construction", () => {
  const app = read("app.js");

  it("does not use HTML parsing as a clearing or rendering primitive", () => {
    assert.doesNotMatch(app, /\.innerHTML\s*=/);
  });

  it("builds runlog and marquee text through inert DOM text nodes", () => {
    assert.match(app, /runlog\.replaceChildren\(fragment\)/);
    assert.match(app, /document\.createTextNode\(' ' \+ event\[2\]\)/);
    assert.match(app, /mq\.replaceChildren\(fragment\)/);
    assert.match(app, /slug\.textContent = tile\.slug/);
    assert.match(app, /line\.textContent = tile\.line/);
  });

  it("clears SVG cables without invoking the HTML parser", () => {
    assert.match(app, /cables\.replaceChildren\(\)/);
  });
});


describe("orphaned asset ownership", () => {
  it("does not ship the unused 3D payload or loader copies", () => {
    for (const path of [
      "avatar-3d.js",
      "head.glb",
      "vendor/three/loaders/GLTFLoader.js",
      "vendor/three/three.module.js",
      "vendor/three/utils/BufferGeometryUtils.js",
    ]) {
      assert.equal(existsSync(new URL(`../${path}`, import.meta.url)), false, path);
    }
  });

  it("does not copy removed assets into the public container", () => {
    const dockerfile = read("Dockerfile");
    assert.doesNotMatch(dockerfile, /avatar-3d\.js|head\.glb/);
  });

  it("keeps the user-facing spelling correction", () => {
    assert.match(read("index.html"), /Your self-improving agent,/);
  });
});


describe("release-token ownership", () => {
  const releaseCheck = read("scripts/check-security-release-surface.mjs");

  it("fails if current release identity is also declared stale", () => {
    assert.match(releaseCheck, /!staleTokens\.includes\(sparkCliRef\)/);
    assert.match(releaseCheck, /!staleTokens\.includes\(sparkCliCommit\)/);
  });

  it("keeps a nonempty retired release-ref history", () => {
    assert.match(releaseCheck, /staleTokens\.length > 0/);
    assert.match(releaseCheck, /token\.startsWith\("spark-cli-public-installer-"\)/);
  });
});
