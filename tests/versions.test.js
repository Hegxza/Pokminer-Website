const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

class Element {
  constructor(tagName) {
    this.tagName = tagName;
    this.children = [];
    this.attributes = {};
    this.textContent = "";
  }

  append(...children) {
    this.children.push(...children);
  }

  replaceChildren(...children) {
    this.children = children;
  }

  setAttribute(name, value) {
    this.attributes[name] = value;
  }

  addEventListener() {}
}

function loadSite() {
  const list = new Element("ul");
  const fallback = new Element("li");
  list.append(fallback);
  const elements = {
    "version-list": list,
    viewer: new Element("dialog"),
    "viewer-image": new Element("img"),
  };
  const warnings = [];
  const context = vm.createContext({
    URL,
    console: { warn: (...args) => warnings.push(args) },
    document: {
      getElementById: (id) => elements[id],
      createElement: (tag) => new Element(tag),
      querySelectorAll: () => [],
    },
    fetch: async () => ({ ok: true, json: async () => ({ versions: [] }) }),
  });
  const source = fs.readFileSync(path.join(__dirname, "..", "main.js"), "utf8");
  vm.runInContext(source, context);
  return { context, list, fallback, warnings };
}

test("renders platform downloads for a modern release", () => {
  const { context, list } = loadSite();
  const entry = {
    id: "alpha_1.3.8",
    version: "Alpha 1.3.8",
    downloads: {
      "windows-x64": { url: "https://example.test/windows-x64.zip" },
      "windows-x86": { url: "https://example.test/windows-x86.zip" },
      "macos-x64": { url: "https://example.test/macos-x64.zip" },
      "macos-arm64": { url: "https://example.test/macos-arm64.zip" },
      "linux-x64": { url: "https://example.test/linux-x64.zip" },
    },
  };
  context.showVersions([entry], entry.id);

  const [name, details] = list.children[0].children;
  assert.equal(name.textContent, "Alpha 1.3.8");
  assert.equal(name.children[0].textContent, "LATEST");
  assert.equal(details.tagName, "details");
  const links = details.children[1].children;
  assert.deepEqual(links.map((link) => link.textContent), [
    "Windows 64-bit",
    "Windows 32-bit",
    "macOS Intel",
    "macOS Apple Silicon",
    "Linux 64-bit",
  ]);
  assert.equal(links[3].href, "https://example.test/macos-arm64.zip");
  assert.equal(links[3].attributes["aria-label"], "Download Alpha 1.3.8 for macOS Apple Silicon");
});

test("keeps older Windows-only versions as direct downloads", () => {
  const { context, list } = loadSite();
  context.showVersions([{
    id: "alpha_1.3.7",
    version: "alpha_1.3.7",
    download_url: "https://example.test/legacy.exe",
  }], "alpha_1.3.8");

  const [name, link] = list.children[0].children;
  assert.equal(name.textContent, "Alpha 1.3.7");
  assert.equal(link.textContent, "Windows download");
  assert.equal(link.href, "https://example.test/legacy.exe");
});

test("rejects unsafe platform URLs and keeps the release-list fallback", () => {
  const { context, list, fallback, warnings } = loadSite();
  context.showVersions([{
    id: "invalid",
    download_url: "https://example.test/wrong-platform.exe",
    downloads: { "macos-arm64": { url: "javascript:alert(1)" } },
  }], "invalid");

  assert.equal(list.children[0], fallback);
  assert.ok(warnings.length > 0);
});
