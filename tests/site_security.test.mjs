import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
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
  it("does not copy removed assets into the public container", () => {
    const dockerfile = read("Dockerfile");
    assert.doesNotMatch(dockerfile, /avatar-3d\.js|head\.glb|COPY vendor/);
  });

  it("keeps the user-facing spelling correction", () => {
    assert.match(read("index.html"), /Your self-improving agent,/);
  });
});

describe("operator-facing fallbacks", () => {
  const app = read("app.js");

  it("synchronizes the initial theme icon with the effective theme", () => {
    assert.match(app, /const light = document\.documentElement\.dataset\.theme === 'light'/);
    assert.match(app, /themeBtn\.textContent = light \? '◑' : '◐'/);
  });

  it("does not report clipboard success when both copy paths fail", () => {
    assert.match(app, /ok = document\.execCommand\('copy'\)/);
    assert.match(app, /position:fixed;left:-9999px;top:-9999px;opacity:0/);
    assert.match(app, /opt\.classList\.toggle\('copy-failed', !ok\)/);
    assert.match(app, /press ⌘C \/ Ctrl\+C/);
    assert.match(app, /aria-live', 'polite'/);
    assert.match(app, /Copy failed; select the text manually/);
  });

  it("pauses node-field animation frames while their canvas is off-screen", () => {
    assert.match(app, /visible = entry\.isIntersecting/);
    assert.match(app, /cancelAnimationFrame\(frameId\)/);
    assert.match(app, /if \(visible && frameId === 0\) frameId = requestAnimationFrame\(render\)/);
  });

  it("keeps printed legal pages readable without site chrome", () => {
    const css = read("legal.css");
    assert.match(css, /@media print/);
    assert.match(css, /\.topbar,[\s\S]*display: none !important/);
    assert.match(css, /body \{[\s\S]*background: #fff !important;[\s\S]*color: #000 !important/);
  });
});

describe("installer recovery boundaries", () => {
  const installer = read("install.sh");

  it("holds the per-prefix lock before runtime and log writes", () => {
    assert.ok(installer.indexOf("  acquire_install_lock\n  ensure_python_runtime") > 0);
  });

  it("requires complete managed Node and Git checkout identities", () => {
    assert.match(installer, /\[ -x "\$node_dir\/bin\/node" \] && \[ -x "\$node_dir\/bin\/npm" \]/);
    assert.match(installer, /rev-parse --verify --quiet HEAD/);
  });

  it("validates uv versions and selects the native Windows Node architecture", () => {
    assert.match(installer, /Unsafe uv version value/);
    const windowsInstaller = read("install.ps1");
    assert.match(windowsInstaller, /return "win-arm64"/);
    assert.match(windowsInstaller, /node-v\$NodeVersion-\$nodePlatform/);
  });

  it("bounds managed runtime downloads", () => {
    assert.match(installer, /curl -fsSL --connect-timeout 15 --max-time 300/);
  });

  it("runs the published container as nginx", () => {
    assert.match(read("Dockerfile"), /^USER nginx$/m);
    assert.match(read("Dockerfile"), /COPY legal-theme\.js/);
  });
});

describe("accessible navigation state", () => {
  const app = read("app.js");

  it("honors reduced motion across magnetic and loop interactions", () => {
    assert.match(app, /if \(!isTouch && !reduced\)/);
    assert.match(app, /if \(!reduced\) setInterval\(tickStep, 1800\)/);
    assert.match(read("install/install.css"), /html \{ scroll-behavior: auto; \}/);
  });

  it("publishes theme state and anchor history", () => {
    assert.match(app, /themeBtn\.setAttribute\('aria-pressed'/);
    assert.match(app, /window\.history\?\.replaceState\?\./);
  });

  it("preserves legal theme and cookie header semantics", () => {
    assert.match(read("legal-theme.js"), /saved === 'light' \|\| saved === 'dark'/);
    assert.match(read("cookies.html"), /<th scope="col">name<\/th>/);
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
