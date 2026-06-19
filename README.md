# AlumniConnect 🎓

**Centralized Alumni Data Management & Engagement System**

A premium, fully client-side SPA for managing alumni data — built with vanilla HTML, CSS, and JavaScript. No frameworks, no backend required.

## ✨ Features

- **📊 Dashboard** — Live stats, batch year chart, activity feed, top companies
- **👥 Alumni Directory** — Search, filter by branch/batch/institution/sector, Add/Edit/Delete
- **🎓 Graduation Data** — Degree, Institution, CGPA, Percentage, Roll No, Honor Class per alumni
- **📅 Events Hub** — RSVP tracking, create events
- **💼 Job Board** — Post & filter jobs by type
- **📈 Analytics** — Institution rankings, degree distribution, sector/company/location charts
- **📥 CSV Export** — Export filtered alumni data
- **💾 localStorage** — All data persists across sessions

## 🚀 Deploy

Deployed on [Vercel](https://vercel.com) as a static site. No build step needed.

## 🛠 Tech Stack

- HTML5 + Vanilla CSS + Vanilla JavaScript
- Google Fonts (Inter)
- localStorage for persistence
- SVG charts (no external libraries)

## 📁 Structure

```
├── index.html
├── vercel.json
├── css/
│   └── style.css
└── js/
    ├── data.js     # Mock data + localStorage persistence
    └── app.js      # Router, pages, CRUD, charts
```
