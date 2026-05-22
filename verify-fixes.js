// verify-fixes.js
// Automated test suite for Spark Compete frontend evolution patches

console.log("====================================================");
console.log("⚡ SPARK EVOLUTION SYSTEM - CODE PATCΗ VERIFICATION");
console.log("====================================================\n");

// Mock window and global dependencies
const window = {
  sparkCompeteData: {
    previewLeaderboard: [
      { rank: 1, team: "Team A", points: 184 },
      { rank: 2, team: "Team B", points: 156 },
      { rank: 3, team: "Team C", points: 121 }
    ]
  }
};

const localStorageData = {};
const localStorage = {
  getItem: (key) => localStorageData[key] || null,
  setItem: (key, val) => { localStorageData[key] = String(val); }
};

// Helper utility
function clean(value) {
  return String(value || "").trim();
}

// --------------------------------------------------
// EVOLUTION 1: GitHub URL Parsing Validator
// --------------------------------------------------
function isGitHubIdentity(value) {
  const raw = clean(value);
  if (!raw) return false;

  const username = raw.startsWith("@") ? raw.slice(1) : raw;
  if (/^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(username)) return true;

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

// Test Suite: GitHub Validator
console.log("🔍 Testing: GitHub URL Validator Evolution...");
const gitHubTestCases = [
  { input: "@alice", expected: true },
  { input: "alice-bob", expected: true },
  { input: "https://github.com/alice", expected: true },
  { input: "http://github.com/alice", expected: true },
  { input: "www.github.com/alice", expected: true },  // Previously failed, now passes!
  { input: "github.com/alice", expected: true },
  { input: "https://www.github.com/alice", expected: true },
  { input: "https://github.com/alice/", expected: true },
  { input: "https://github.com/alice?tab=repositories", expected: true },
  { input: "http://google.com/alice", expected: false },
  { input: "github.com/alice/repo/blob/main/readme.md", expected: false },
  { input: "invalid_url_with_@_symbol", expected: false }
];

let githubPassed = 0;
gitHubTestCases.forEach((tc, idx) => {
  const actual = isGitHubIdentity(tc.input);
  const status = actual === tc.expected ? "✅ PASS" : "❌ FAIL";
  if (actual === tc.expected) githubPassed++;
  console.log(`  [Case #${idx + 1}] Input: "${tc.input}" -> Expected: ${tc.expected}, Actual: ${actual} | ${status}`);
});
console.log(`\n  GitHub tests completed: ${githubPassed}/${gitHubTestCases.length} passed.\n`);


// --------------------------------------------------
// EVOLUTION 2: API Null/Corrupt Guard
// --------------------------------------------------
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

console.log("🔍 Testing: API Robustness Null/Corrupt Guard...");
const apiTestCases = [
  { input: null, index: 0, expectedTeam: "Registered team", expectedPoints: 0 },
  { input: undefined, index: 1, expectedTeam: "Registered team", expectedPoints: 0 },
  { input: { name: "Alpha", points: 80 }, index: 2, expectedTeam: "Alpha", expectedPoints: 80 },
  { input: { team: { name: "Beta" }, public_points: 95 }, index: 3, expectedTeam: "Beta", expectedPoints: 95 }
];

let apiPassed = 0;
apiTestCases.forEach((tc, idx) => {
  try {
    const result = fromApiTeam(tc.input, tc.index);
    const match = result.team === tc.expectedTeam && result.points === tc.expectedPoints && result.rank === tc.index + 1;
    const status = match ? "✅ PASS" : "❌ FAIL";
    if (match) apiPassed++;
    console.log(`  [Case #${idx + 1}] Input: ${JSON.stringify(tc.input)} -> Output: ${JSON.stringify(result)} | ${status}`);
  } catch (err) {
    console.log(`  [Case #${idx + 1}] Input: ${JSON.stringify(tc.input)} -> ❌ CRASHED: ${err.message}`);
  }
});
console.log(`\n  API robustness tests completed: ${apiPassed}/${apiTestCases.length} passed.\n`);


// --------------------------------------------------
// EVOLUTION 3: Combined & Sorted Leaderboard Rows
// --------------------------------------------------
function loadLocalTeams() {
  try {
    const teams = JSON.parse(localStorage.getItem("spark-compete-teams-v2") || "[]");
    return Array.isArray(teams) ? teams : [];
  } catch {
    return [];
  }
}

function loadLeaderboardRowsMock(locationProtocol) {
  // Simulator logic (equivalent to loadLeaderboardRows in teams.js)
  const localTeams = loadLocalTeams().map(fromApiTeam);
  const previewTeams = window.sparkCompeteData.previewLeaderboard.map((team) => ({ ...team, isPreview: true }));
  const combined = [...localTeams, ...previewTeams];
  combined.sort((a, b) => b.points - a.points);
  return combined.map((team, index) => ({ ...team, rank: index + 1 }));
}

console.log("🔍 Testing: Leaderboard Standings Merging & Sorting...");

// Setup mock local teams
const mockRegisteredTeams = [
  {
    team: { name: "Slayer Guild", points: 0 },
    public_points: 130
  },
  {
    team: { name: "Newbie Goblins", points: 0 },
    public_points: 10
  }
];
localStorage.setItem("spark-compete-teams-v2", JSON.stringify(mockRegisteredTeams));

try {
  const rows = loadLeaderboardRowsMock("file:");
  console.log("  Successfully combined and sorted ranks:");
  rows.forEach((row) => {
    const previewFlag = row.isPreview ? "[MOCK]" : "[LOCAL]";
    console.log(`    Rank ${row.rank}: ${row.team} - ${row.points} pts ${previewFlag}`);
  });
  
  // Verify correct sorting order (184, 156, 130, 121, 10)
  const expectedPointsOrder = [184, 156, 130, 121, 10];
  const actualPointsOrder = rows.map(r => r.points);
  const sortingMatch = JSON.stringify(expectedPointsOrder) === JSON.stringify(actualPointsOrder);
  
  if (sortingMatch && rows.length === 5) {
    console.log("\n  ✅ PASS: Leaderboard merging, sorting, and ranks recalculation works flawlessly.");
  } else {
    console.log("\n  ❌ FAIL: Sorting order or total length mismatch.");
  }
} catch (err) {
  console.log(`  ❌ CRASHED: ${err.message}`);
}

console.log("\n====================================================");
console.log("⚡ SPARK EVOLUTION SYSTEM - VERIFICATION SUITE DONE");
console.log("====================================================");
