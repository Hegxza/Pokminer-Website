const VERSION_URL = "https://raw.githubusercontent.com/Hegxza/PokMiner-Version/refs/heads/main/version.json";
const PLATFORM_NAMES = {
  "windows-x64": "Windows 64-bit",
  "windows-x86": "Windows 32-bit",
  "macos-x64": "macOS Intel",
  "macos-arm64": "macOS Apple Silicon",
  "linux-x64": "Linux 64-bit",
};

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

function showNews(news) {
  if (news) {
    document.getElementById("news-text").textContent = news;
    document.getElementById("news").hidden = false;
  }
}

function versionDownloads(entry) {
  if ("downloads" in entry) {
    if (!entry.downloads || typeof entry.downloads !== "object" || Array.isArray(entry.downloads)) {
      console.warn("Invalid platform downloads for:", entry.id);
      return [];
    }

    return Object.entries(entry.downloads).flatMap(([platform, download]) => {
      const url = safeUrl(download?.url);
      if (!url) {
        console.warn("Invalid download URL for:", entry.id, platform);
        return [];
      }
      return [{ label: PLATFORM_NAMES[platform] || platform, url }];
    });
  }

  const url = safeUrl(entry.download_url);
  if (!url) {
    console.warn("Invalid download URL for:", entry.id);
    return [];
  }
  return [{ label: "Windows", url }];
}

function showVersions(versions, latestId) {
  const list = document.getElementById("version-list");
  const items = [];

  for (const entry of versions) {
    if (!entry || typeof entry !== "object") {
      console.warn("Invalid version entry:", entry);
      continue;
    }
    const downloads = versionDownloads(entry);
    if (!downloads.length) {
      continue;
    }
    const item = document.createElement("li");

    const version = prettyVersion(entry.version || entry.id);
    const name = document.createElement("span");
    name.className = "version-name";
    name.textContent = version;
    if (entry.id === latestId) {
      const tag = document.createElement("span");
      tag.className = "version-tag";
      tag.textContent = "LATEST";
      name.append(tag);
    }

    const links = downloads.map(({ label, url }) => {
      const link = document.createElement("a");
      link.className = "version-link";
      link.href = url;
      link.textContent = label;
      link.setAttribute("aria-label", `Download ${version} for ${label}`);
      return link;
    });

    if (links.length === 1) {
      links[0].textContent += " download";
      item.append(name, links[0]);
    } else {
      const details = document.createElement("details");
      details.className = "version-downloads";
      const summary = document.createElement("summary");
      summary.textContent = "Platform downloads";
      summary.setAttribute("aria-label", `Downloads for ${version}`);
      const options = document.createElement("div");
      options.className = "version-platforms";
      options.append(...links);
      details.append(summary, options);
      item.append(name, details);
    }
    items.push(item);
  }

  if (items.length) {
    list.replaceChildren(...items);
  } else {
    console.warn("No valid PokMiner version downloads were found.");
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

  showNews(data.news);
  showVersions(versions, latest.id);
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
