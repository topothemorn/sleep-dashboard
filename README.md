# Sleep Guide

A quick, interactive sleep-science reference for the sales floor. Open `index.html` in any browser — no build step, no internet connection needed.

## What's in it

- **Explore a night** — interactive hypnogram. Drag across it to see the stage at each time; switch between a healthy night, pressure & motion disruptions, and sleeping hot to compare sleep stats.
- **The four stages** — what the brain and body are doing in N1, N2, N3 and REM, with an animated brain-wave trace and a "say it like this" line for customers.
- **Customer fit helper** — pick a sleep position and the customer's complaints to get the sleep science, what to look for, and suggested wording. Flags when something should go to a doctor.
- **What drives sleep** — sleep pressure, body clock, temperature, plus a caffeine calculator.
- **Sleep by age, good vs poor sleep benchmarks, myths vs facts, sleep disorders, sleep tracking, glossary.**
- Search (press `/`), light/dark theme, works on phones and tablets.

## Editing content

All text and numbers live in `data.js`. Edit that file to change facts, talking points, myths or the glossary — `app.js` renders whatever is there.

## Publishing changes

The site is served by GitHub Pages from `main`. After editing `style.css`, `app.js` or `data.js`, bump the `?v=` number on its link in `index.html` (e.g. `?v=2` → `?v=3`) so phones don't keep using a cached old copy.
