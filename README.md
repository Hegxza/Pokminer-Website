# PokMiner Website

Download page for PokMiner, hosted with GitHub Pages.

The Alpha 1.3.8 download table links directly to the game and launcher files
for Windows, macOS and Linux on the
[1.3.8 GitHub release](https://github.com/Hegxza/Pokminer-Releases/releases/tag/alpha-1.3.8).
Update the links in `index.html` when featuring another release.

The news and version list come from
[PokMiner-Version/version.json](https://github.com/Hegxza/PokMiner-Version/blob/main/version.json),
the same file the game and launcher use. Version entries can have platform-specific
`downloads`; older entries with only `download_url` are shown as Windows downloads.

## Run locally

```
python -m http.server 8000
```

Then open http://localhost:8000

## Test

Run `node --test tests/versions.test.js` to check version download rendering.

## Files

- `index.html`, `style.css`, `main.js` – the page
- `assets/shots/` – screenshots (1280×720)
- `assets/icons/` – item textures from the game
- `assets/fonts/` – Press Start 2P, licensed under the SIL Open Font License (`OFL.txt`)
