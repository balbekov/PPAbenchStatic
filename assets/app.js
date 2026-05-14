const formatNumber = (value, suffix = "") => {
  if (value === null || value === undefined) return "pending";
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value)}${suffix}`;
};

const formatPercent = (value) => {
  if (value === null || value === undefined) return "pending";
  return `${(value * 100).toFixed(1)}%`;
};

const stageDots = (tier) =>
  Array.from({ length: 6 }, (_, index) => {
    const filled = index < tier ? "filled" : "";
    return `<span class="stage-dot ${filled}" title="Stage ${index + 1}"></span>`;
  }).join("");

const emptyState = (track) => `
  <div class="empty-state">
    <p class="eyebrow">${track.name}</p>
    <h3>Open for first scored submissions</h3>
    <p>${track.target}</p>
  </div>
`;

const entryRow = (entry) => `
  <tr>
    <td class="rank">#${entry.rank}</td>
    <td>
      <strong>${entry.model}</strong>
      <span>${entry.team} · ${entry.scaffold}</span>
    </td>
    <td><span class="status ${entry.signoff ? "passed" : "demo"}">${entry.status}</span></td>
    <td><div class="stage-dots">${stageDots(entry.tier)}</div><span class="tier">${entry.tier}/6</span></td>
    <td>${formatNumber(entry.power_mw, " mW")}</td>
    <td>${entry.performance === null ? "pending" : `${formatNumber(entry.performance, " ns WNS")}`}</td>
    <td>${formatNumber(entry.area_um2, " um²")}</td>
    <td>${formatPercent(entry.ppa_composite)}</td>
  </tr>
  <tr class="note-row">
    <td></td>
    <td colspan="7">${entry.note}</td>
  </tr>
`;

const entryCard = (entry) => `
  <article class="entry-card">
    <div class="entry-card-head">
      <span class="rank">#${entry.rank}</span>
      <span class="status ${entry.signoff ? "passed" : "demo"}">${entry.status}</span>
    </div>
    <h4>${entry.model}</h4>
    <p>${entry.team} · ${entry.scaffold}</p>
    <div class="entry-stage">
      <div class="stage-dots">${stageDots(entry.tier)}</div>
      <span class="tier">${entry.tier}/6 stages</span>
    </div>
    <dl>
      <div><dt>Power</dt><dd>${formatNumber(entry.power_mw, " mW")}</dd></div>
      <div><dt>Performance</dt><dd>${entry.performance === null ? "pending" : `${formatNumber(entry.performance, " ns WNS")}`}</dd></div>
      <div><dt>Area</dt><dd>${formatNumber(entry.area_um2, " um²")}</dd></div>
      <div><dt>PPA score</dt><dd>${formatPercent(entry.ppa_composite)}</dd></div>
    </dl>
    <p class="entry-note">${entry.note}</p>
  </article>
`;

const renderTrack = (data, trackId) => {
  const track = data.tracks.find((item) => item.id === trackId) || data.tracks[0];
  const panel = document.querySelector("#leaderboard-panel");

  if (!track.entries.length) {
    panel.innerHTML = emptyState(track);
    return;
  }

  panel.innerHTML = `
    <div class="track-summary">
      <div>
        <p class="eyebrow">${track.name}</p>
        <h3>${track.headline}</h3>
      </div>
      <p>${track.target}</p>
    </div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Model submission</th>
            <th>Status</th>
            <th>Stage</th>
            <th>Power</th>
            <th>Performance</th>
            <th>Area</th>
            <th>PPA score</th>
          </tr>
        </thead>
        <tbody>${track.entries.map(entryRow).join("")}</tbody>
      </table>
    </div>
    <div class="mobile-entry-list">${track.entries.map(entryCard).join("")}</div>
  `;
};

fetch("data/leaderboard.json")
  .then((response) => response.json())
  .then((data) => {
    renderTrack(data, "socmate_mpw");
    document.querySelectorAll(".track-tab").forEach((button) => {
      button.addEventListener("click", () => {
        document.querySelectorAll(".track-tab").forEach((tab) => {
          tab.classList.remove("active");
          tab.setAttribute("aria-selected", "false");
        });
        button.classList.add("active");
        button.setAttribute("aria-selected", "true");
        renderTrack(data, button.dataset.track);
      });
    });
  });
