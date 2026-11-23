const VERSION_URL = "https://raw.githubusercontent.com/Hegxza/PokMiner-Version/refs/heads/main/version.json";
const RELEASES_API = "https://api.github.com/repos/Hegxza/Pokminer-Releases/releases?per_page=100";

function safeUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

function prettyVersion(version) {
  return String(version).replace(/^alpha[_ ]/i, "Alpha ");
}

function formatSize(bytes) {
  return `${Math.round(bytes / (1024 * 1024))} MB`;
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function showLatest(latest, news) {
  const url = safeUrl(latest.download_url);
  if (url) {
    document.getElementById("download-button").href = url;
  }
  document.getElementById("download-label").textContent = `Download ${prettyVersion(latest.version || latest.id)}`;

  if (news) {
    document.getElementById("news-text").textContent = news;
    document.getElementById("news").hidden = false;
  }
}

function showVersions(versions, latestId) {
  const list = document.getElementById("version-list");
  list.replaceChildren();

  for (const entry of versions) {
    const url = safeUrl(entry.download_url);
    if (!url) {
      continue;
    }
    const item = document.createElement("li");

    const name = document.createElement("span");
    name.className = "version-name";
    name.textContent = prettyVersion(entry.version || entry.id);
    if (entry.id === latestId) {
      const tag = document.createElement("span");
      tag.className = "version-tag";
      tag.textContent = "LATEST";
      name.append(tag);
    }

    const link = document.createElement("a");
    link.className = "version-link";
    link.href = url;
    link.textContent = "Download";

    item.append(name, link);
    list.append(item);
  }
}

async function showReleaseDetails(downloadUrl) {
  const response = await fetch(RELEASES_API);
  if (!response.ok) {
    return;
  }
  const releases = await response.json();
  for (const release of releases) {
    const asset = (release.assets || []).find((a) => a.browser_download_url === downloadUrl);
    if (asset) {
      const parts = ["Windows 10 / 11", formatSize(asset.size), formatDate(release.published_at)];
      document.getElementById("download-meta").textContent = parts.join(" · ");
      return;
    }
  }
}

async function loadVersions() {
  const response = await fetch(VERSION_URL, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`version.json: HTTP ${response.status}`);
  }
  const data = await response.json();
  const versions = Array.isArray(data.versions) ? data.versions : [];
  const latest = versions.find((v) => v.id === data.latest) || versions[0];
  if (!latest) {
    return;
  }

  showLatest(latest, data.news);
  showVersions(versions, latest.id);
  showReleaseDetails(latest.download_url).catch(() => {});
}

function setupViewer() {
  const viewer = document.getElementById("viewer");
  const image = document.getElementById("viewer-image");

  for (const shot of document.querySelectorAll(".shot")) {
    shot.addEventListener("click", () => {
      const thumb = shot.querySelector("img");
      image.src = shot.dataset.full;
      image.alt = thumb.alt;
      viewer.showModal();
    });
  }

  viewer.addEventListener("click", () => viewer.close());
}

setupViewer();
loadVersions().catch((error) => console.warn("Could not load PokMiner versions:", error));
