const {
  previewLeaderboard = window.sparkCompeteData.mockLeaderboard || [],
  systemSurfaces,
  hotfixTags,
  agentWorkflowBrief,
  telegramAgentPrompts
} = window.sparkCompeteData;
const localTeamStorageKey = "spark-compete-teams-v2";

const els = {
  form: document.querySelector("#team-form"),
  formStatus: document.querySelector("#form-status"),
  memberInputs: Array.from(document.querySelectorAll("[data-member-input]")),
  deviceHolder: document.querySelector("#device-holder"),
  leaderboardList: document.querySelector("#leaderboard-list"),
  hotfixTagMarquee: document.querySelector("#hotfix-tag-marquee"),
  surfaceGrid: document.querySelector("#system-surface-grid"),
  promptGrid: document.querySelector("#agent-prompt-grid"),
  agentBrief: document.querySelector("#agent-brief"),
  missionCount: document.querySelector("[data-mission-count]"),
  eventSlideButtons: Array.from(document.querySelectorAll("[data-event-slide]")),
  eventPanels: Array.from(document.querySelectorAll("[data-event-panel]")),
  eventCarousel: document.querySelector("[data-event-carousel]"),
  toast: document.querySelector("#toast"),
  canvas: document.querySelector("#swarm-canvas")
};

init();

function init() {
  bindForm();
  renderHotfixTags();
  renderAgentPlaybook();
  bindCopyControls();
  bindEventCarousel();
  loadAndRenderLeaderboard();
  startCanvas();
}

function bindForm() {
  els.memberInputs.forEach((input) => {
    input.addEventListener("input", updateDeviceOptions);
  });

  updateDeviceOptions();

  els.form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = buildTeamPayload();
    const validation = validatePayload(payload);

    if (validation) {
      setFormStatus(validation, true);
      return;
    }

    setFormStatus("Saving team...", false);

    try {
      const saved = await saveTeam(payload);
      const savedMessage = saved.persisted
        ? "Saved to database. Team registration packet is ready for review."
        : "Saved locally for this preview. Team registration packet is ready.";
      setFormStatus(savedMessage, false, true);
      showToast(savedMessage, "success");
      els.form.reset();
      updateDeviceOptions();
      await loadAndRenderLeaderboard();
    } catch (error) {
      setFormStatus(error.message || "Could not save the team.", true);
    }
  });
}

function buildTeamPayload() {
  const formData = new FormData(els.form);
  return {
    team: {
      name: clean(formData.get("team_name")),
      members: els.memberInputs.map((input) => clean(input.value)),
      llm_device_holder: clean(formData.get("device_holder")),
      llm_provider: clean(formData.get("llm_provider")),
      contact: clean(formData.get("contact"))
    }
  };
}

function validatePayload(payload) {
  const team = payload.team;
  if (!team.name || team.members.some((member) => !member) || !team.contact || !team.llm_provider || !team.llm_device_holder) {
    return "Fill every team field before registering.";
  }

  const normalizedMembers = team.members.map((member) => member.toLowerCase());
  if (new Set(normalizedMembers).size !== 3) {
    return "Use three distinct team members.";
  }

  if (!normalizedMembers.includes(team.llm_device_holder.toLowerCase())) {
    return "Choose the device holder from the three members.";
  }

  if (!isGitHubIdentity(team.contact)) {
    return "Add the LLM device holder's GitHub username or profile link.";
  }

  return "";
}

const RESERVED_GITHUB_NAMES = new Set([
  "about",
  "pricing",
  "features",
  "trending",
  "explore",
  "contact",
  "support",
  "admin",
  "billing",
  "blog",
  "help",
  "jobs",
  "security",
  "settings",
  "status",
  "enterprise",
  "organizations",
  "orgs",
  "site",
  "search",
  "pulls",
  "issues",
  "marketplace",
  "notifications",
  "stars",
  "watching",
  "sponsors",
  "topics",
  "collections",
  "events",
  "nonprofit",
  "customer-stories",
  "readme"
]);

function isGitHubIdentity(value) {
  const raw = clean(value);
  if (!raw) return false;

  const username = raw.startsWith("@") ? raw.slice(1) : raw;
  if (/^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(username)) {
    if (RESERVED_GITHUB_NAMES.has(username.toLowerCase())) return false;
    return true;
  }

  try {
    let urlString = raw;
    if (urlString.startsWith("www.github.com/")) {
      urlString = `https://${urlString}`;
    } else if (urlString.startsWith("github.com/")) {
      urlString = `https://${urlString}`;
    } else if (!/^https?:\/\//i.test(urlString)) {
      urlString = `https://${urlString}`;
    }
    const url = new URL(urlString);
    const host = url.hostname.replace(/^www\./, "").toLowerCase();
    const pathParts = url.pathname.split("/").filter(Boolean);
    return host === "github.com" && pathParts.length === 1 && isGitHubIdentity(pathParts[0]);
  } catch {
    return false;
  }
}

async function saveTeam(payload) {
  if (location.protocol !== "file:") {
    const response = await fetch("/api/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(body.message || "The database rejected this team.");
    }

    return { persisted: true, team: body.team };
  }

  const teams = loadLocalTeams();
  const slug = slugify(payload.team.name);
  const now = new Date().toISOString();
  const existingIndex = teams.findIndex((team) => team.slug === slug);
  const localTeam = {
    schema: "spark-compete-team-v1",
    event: "spark-compete-first-event",
    id: existingIndex >= 0 ? teams[existingIndex].id : `${slug}-${Date.now().toString(36)}`,
    slug,
    registered_at: existingIndex >= 0 ? teams[existingIndex].registered_at : now,
    updated_at: now,
    team: payload.team,
    public_score_band: "Registered",
    public_points: 0,
    status_counts: { merged: 0, accepted: 0, opened: 0 }
  };

  if (existingIndex >= 0) {
    teams[existingIndex] = localTeam;
  } else {
    teams.push(localTeam);
  }

  window.localStorage.setItem(localTeamStorageKey, JSON.stringify(teams));
  return { persisted: false, team: localTeam };
}

async function loadAndRenderLeaderboard() {
  const rows = await loadLeaderboardRows();
  renderLeaderboard(rows);
}

async function loadLeaderboardRows() {
  if (location.protocol !== "file:") {
    try {
      const response = await fetch("/api/leaderboard", { headers: { Accept: "application/json" } });
      if (response.ok) {
        const body = await response.json();
        if (Array.isArray(body.leaderboard) && body.leaderboard.length) {
          return body.leaderboard.map(fromApiTeam);
        }
      }
    } catch {
      // Fall back to local preview rows below.
    }
  }

  const localTeams = loadLocalTeams().map(fromApiTeam);
  const previewTeams = previewLeaderboard.map((team) => ({ ...team, isPreview: true }));
  const combined = [...localTeams, ...previewTeams];
  combined.sort((a, b) => b.points - a.points);
  return combined.map((team, index) => ({ ...team, rank: index + 1 }));
}

function fromApiTeam(team, index) {
  if (!team) {
    return {
      rank: index + 1,
      team: "Registered team",
      points: 0
    };
  }
  return {
    rank: index + 1,
    team: team.team?.name || team.name || "Registered team",
    points: Number(team.public_points ?? team.points ?? 0)
  };
}

function renderLeaderboard(rows) {
  els.leaderboardList.innerHTML = `
    <div class="leaderboard-header-row" aria-hidden="true">
      <span>Rank</span>
      <span>Team name</span>
      <span>Points</span>
    </div>
    ${rows.map((team, index) => `
    <article class="leaderboard-row${team.isPreview ? " is-preview" : ""}">
      <div class="rank-cell">${team.rank || index + 1}</div>
      <div class="team-cell">
        <strong>${escapeHtml(team.team)}</strong>
      </div>
      <div class="score-cell">${Number(team.points || 0)} pts</div>
    </article>
  `).join("")}`;
}

function renderHotfixTags() {
  const repeatedTags = [...hotfixTags, ...hotfixTags];
  els.hotfixTagMarquee.innerHTML = `
    <div class="tag-marquee-track" aria-hidden="true">
      ${repeatedTags.map((tag, index) => `
        <span style="--tag-index: ${index % hotfixTags.length}">${escapeHtml(tag)}</span>
      `).join("")}
    </div>
  `;
}

function bindEventCarousel() {
  if (!els.eventSlideButtons.length || !els.eventPanels.length) return;

  let activeIndex = 0;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const selectSlide = (nextIndex) => {
    activeIndex = (nextIndex + els.eventPanels.length) % els.eventPanels.length;

    els.eventSlideButtons.forEach((button, index) => {
      const isActive = index === activeIndex;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-selected", String(isActive));
    });

    els.eventPanels.forEach((panel, index) => {
      const isActive = index === activeIndex;
      panel.hidden = !isActive;
      panel.classList.toggle("is-active", isActive);
    });
  };

  els.eventSlideButtons.forEach((button) => {
    button.addEventListener("click", () => {
      selectSlide(Number(button.dataset.eventSlide || 0));
      if (!reduceMotion) {
        resume(); // Clear and reset auto-rotation timer on manual slide click
      }
    });
  });

  if (reduceMotion) return;

  let timer = window.setInterval(() => selectSlide(activeIndex + 1), 7000);
  const pause = () => window.clearInterval(timer);
  const resume = () => {
    window.clearInterval(timer);
    timer = window.setInterval(() => selectSlide(activeIndex + 1), 7000);
  };

  els.eventCarousel?.addEventListener("pointerenter", pause);
  els.eventCarousel?.addEventListener("pointerleave", resume);
  els.eventCarousel?.addEventListener("focusin", pause);
  els.eventCarousel?.addEventListener("focusout", resume);
}

function renderAgentPlaybook() {
  els.agentBrief.textContent = agentWorkflowBrief;
  if (els.missionCount) {
    els.missionCount.textContent = String(telegramAgentPrompts.length);
  }

  els.surfaceGrid.innerHTML = systemSurfaces.map((surface) => `
    <article class="surface-card">
      <span>${escapeHtml(surface.kind)}</span>
      <strong>${escapeHtml(surface.label)}</strong>
      <small>${escapeHtml(surface.detail)}</small>
    </article>
  `).join("");

  els.promptGrid.innerHTML = telegramAgentPrompts.map((prompt, index) => `
    <article class="prompt-card">
      <div class="prompt-head">
        <span>mission ${String(index + 1).padStart(2, "0")}</span>
        <button class="ghost-button mini-button" type="button" data-copy-prompt="${index}">Copy</button>
      </div>
      <p>${escapeHtml(prompt)}</p>
    </article>
  `).join("");
}

function bindCopyControls() {
  document.addEventListener("click", (event) => {
    const promptButton = event.target.closest("[data-copy-prompt]");
    if (promptButton) {
      const prompt = telegramAgentPrompts[Number(promptButton.dataset.copyPrompt)];
      copyText(prompt)
        .then(() => showToast("Telegram QA mission copied."))
        .catch(() => showToast("Copy failed. Select the mission manually."));
      return;
    }

    const allButton = event.target.closest("[data-copy-all-prompts]");
    if (allButton) {
      copyText(telegramAgentPrompts.map((prompt, index) => `${index + 1}. ${prompt}`).join("\n\n"))
        .then(() => showToast("All Telegram missions copied."))
        .catch(() => showToast("Copy failed. Select the missions manually."));
      return;
    }

    const surfaceButton = event.target.closest("[data-copy-surface-batch]");
    if (surfaceButton) {
      copyText(systemSurfaces.map((surface) => `${surface.kind}\n${surface.label}\n${surface.detail}`).join("\n\n"))
        .then(() => showToast("Track list copied."))
        .catch(() => showToast("Copy failed. Select the track list manually."));
      return;
    }

    const workflowButton = event.target.closest("[data-copy-workflow]");
    if (workflowButton) {
      copyText(agentWorkflowBrief)
        .then(() => showToast("Hotfix workflow brief copied."))
        .catch(() => showToast("Copy failed. Select the brief manually."));
    }
  });
}

function updateDeviceOptions() {
  const members = els.memberInputs.map((input) => clean(input.value)).filter(Boolean);
  const current = els.deviceHolder.value;

  els.deviceHolder.innerHTML = "";
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = members.length ? "Choose member" : "Add members first";
  els.deviceHolder.append(placeholder);

  members.forEach((member) => {
    const option = document.createElement("option");
    option.value = member;
    option.textContent = member;
    els.deviceHolder.append(option);
  });

  if (members.includes(current)) {
    els.deviceHolder.value = current;
  }
}

function loadLocalTeams() {
  try {
    const teams = JSON.parse(window.localStorage.getItem(localTeamStorageKey) || "[]");
    return Array.isArray(teams) ? teams : [];
  } catch {
    return [];
  }
}

function setFormStatus(message, isError, isSuccess = false) {
  els.formStatus.textContent = message;
  els.formStatus.classList.toggle("is-error", isError);
  els.formStatus.classList.toggle("is-success", isSuccess);
}

function clean(value) {
  return String(value || "").trim();
}

function slugify(value) {
  return clean(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "team";
}

async function copyText(value) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return;
    } catch {
      // File URLs and strict browser contexts often need the legacy path.
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.append(textarea);
  textarea.select();

  const copied = document.execCommand("copy");
  textarea.remove();
  if (!copied) throw new Error("copy failed");
}

function showToast(message, tone = "default") {
  els.toast.textContent = message;
  els.toast.dataset.tone = tone;
  els.toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => els.toast.classList.remove("show"), tone === "success" ? 4600 : 3000);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function startCanvas() {
  const ctx = els.canvas.getContext("2d");
  const nodes = Array.from({ length: 42 }, () => ({
    x: Math.random(),
    y: Math.random(),
    vx: (Math.random() - 0.5) * 0.00032,
    vy: (Math.random() - 0.5) * 0.00032,
    size: 1 + Math.random() * 1.6
  }));

  function resize() {
    const ratio = window.devicePixelRatio || 1;
    els.canvas.width = Math.floor(window.innerWidth * ratio);
    els.canvas.height = Math.floor(window.innerHeight * ratio);
    els.canvas.style.width = `${window.innerWidth}px`;
    els.canvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function draw() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    ctx.clearRect(0, 0, width, height);

    nodes.forEach((node) => {
      node.x += node.vx;
      node.y += node.vy;
      if (node.x < 0 || node.x > 1) node.vx *= -1;
      if (node.y < 0 || node.y > 1) node.vy *= -1;
    });

    for (let i = 0; i < nodes.length; i += 1) {
      for (let j = i + 1; j < nodes.length; j += 1) {
        const a = nodes[i];
        const b = nodes[j];
        const dx = (a.x - b.x) * width;
        const dy = (a.y - b.y) * height;
        const distance = Math.hypot(dx, dy);
        if (distance < 170) {
          ctx.strokeStyle = `rgba(47, 202, 148, ${0.12 * (1 - distance / 170)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x * width, a.y * height);
          ctx.lineTo(b.x * width, b.y * height);
          ctx.stroke();
        }
      }
    }

    nodes.forEach((node) => {
      ctx.fillStyle = "rgba(47, 202, 148, 0.62)";
      ctx.beginPath();
      ctx.arc(node.x * width, node.y * height, node.size, 0, Math.PI * 2);
      ctx.fill();
    });

    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      requestAnimationFrame(draw);
    }
  }

  window.addEventListener("resize", resize);
  resize();
  draw();
}

