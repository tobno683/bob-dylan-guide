# The Bob Dylan Fan Guide

An independent, non-commercial fan guide to Bob Dylan — the records, the songs, the tours, the interviews, the stories, the people and the clothes. Sixty-five years of work, sorted.

Static HTML, CSS and vanilla JavaScript. No frameworks, no build step, no dependencies, no tracking.

## Pages

| Page | What's in it |
|---|---|
| `index.html` | Hub, quick facts, "this month in Dylan history" |
| `biography.html` | The life in ten eras, long-form |
| `timeline.html` | Year-by-year chronology, 1941 to now |
| `discography.html` | All 40 studio albums, live records, all 18 Bootleg Series volumes, compilations, side projects |
| `songs.html` | Annotated index of the essential songs |
| `tours.html` | Touring history, from the folk circuit to the current run |
| `stories.html` | Anecdotes, legends and disputed history |
| `interviews.html` | Major interviews, press conferences, documentaries, speeches |
| `quotes.html` | Sourced quotations — spoken and written, never lyrics |
| `style.html` | What he wore, era by era, plus instruments and artefacts |
| `people.html` | Family, bands, producers, collaborators, chroniclers |
| `covers.html` | Other people singing his songs |
| `library.html` | Books and films, by him and about him |
| `honors.html` | Awards, prizes and medals |
| `resources.html` | Official sources, archives, reference works |

## How it's built

All content lives in plain data files under `assets/data/` — one per section, each assigning an array to `window.DYLAN`. The HTML pages are thin shells that render those arrays. To correct a fact or add an entry, edit the data file; you never need to touch page code.

```
assets/
  css/style.css        design system, light + dark
  js/site.js           nav, theme, global search, filter component
  data/*.js            all content (14 files)
  favicon.svg
```

Shared features on every page:

- **Global search** across every dataset — click the ⌕ or press <kbd>/</kbd>
- **Per-page filtering** by category, plus free-text filter
- **Light and dark themes**, following your system setting, toggleable in the header
- Responsive down to phone width; prints cleanly

## Editing content

Each data file is a flat array of objects. For example, `assets/data/albums.js`:

```js
window.DYLAN.albums = [
  { n:15, year:1975, date:"20 January 1975", title:"Blood on the Tracks",
    type:"Studio", producer:"Bob Dylan",
    key:["Tangled Up in Blue", "Idiot Wind"],
    note:"…" },
  // …
];
```

The `type` / `era` / `tag` / `kind` / `group` / `category` field on each record is what drives that page's filter chips. Add a new value and a new chip appears automatically.

## Running it locally

It's static — open `index.html` in a browser, or serve the folder:

```bash
python -m http.server 8080
```

## Deploying

Push to GitHub and enable Pages on the default branch, root folder. `.nojekyll` is included so GitHub serves the files as-is.

## Scope and limitations

- **No lyrics.** Dylan's lyrics are under copyright. This guide quotes only short fragments as commentary and links to the official lyrics at [bobdylan.com](https://www.bobdylan.com/songs/).
- **No photographs.** The images are owned by the photographers who took them. The style page describes the looks rather than reproducing them.
- **The song index is selective**, not complete. He has written more than 600 songs; this covers the ones that matter with a note on each.
- **Tour dates go stale.** Anything current should be checked against [bobdylan.com/on-tour](https://www.bobdylan.com/on-tour/).
- **Some facts are genuinely disputed** — often because Dylan disputed them himself. Where that's true, the guide says so instead of picking the better story.

## Corrections

Open an issue or a pull request against the relevant file in `assets/data/`.

## Disclaimer

Not affiliated with Bob Dylan, his management, Columbia Records, Sony Music or Universal Music Publishing. All trademarks and copyrights belong to their respective owners. Made by a fan, for fans.
