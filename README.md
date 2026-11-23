# PokMiner Website

Download page for PokMiner, hosted with GitHub Pages.

The download button and version list come from
[PokMiner-Version/version.json](https://github.com/Hegxza/PokMiner-Version/blob/main/version.json),
the same file the game and launcher use. Update that file and the site updates itself.

## Deploy

1. Make this repository public (GitHub Pages on private repos needs a paid plan).
2. Settings → Pages → Source: **Deploy from a branch**, branch **main**, folder **/ (root)**.
3. The site goes live at https://hegxza.github.io/Pokminer-Website/

## Run locally

```
python -m http.server 8000
```

Then open http://localhost:8000

## Files

- `index.html`, `style.css`, `main.js` – the page
- `assets/shots/` – screenshots (1280×720)
- `assets/icons/` – item textures from the game
- `assets/fonts/` – Press Start 2P, licensed under the SIL Open Font License (`OFL.txt`)
