# BFHL – Tree Hierarchy Analyzer

A full-stack application that parses directed edge relationships (e.g. `A->B`), validates input, detects cycles, removes duplicates, and builds visualizable tree hierarchies.

**Backend:** Node.js + Express  
**Frontend:** React (Vite) + Tailwind CSS

---

## Quick Start

```bash
# 1. Install all dependencies
npm run install:all

# 2. Install root dev dependency
npm install

# 3. Run both server and client
npm run dev
```

- **Backend** runs at `http://localhost:3001`
- **Frontend** runs at `http://localhost:5173`

### Run Individually

```bash
# Server only
npm run dev:server

# Client only
npm run dev:client
```

---

## API

### `POST /bfhl`

**Request:**
```json
{
  "data": ["A->B", "A->C", "B->D", "X->Y", "Y->Z", "Z->X", "hello"]
}
```

**Response:**
```json
{
  "is_success": true,
  "user_id": "lovansh_tewatia_1245",
  "email_id": "lt4750@srmist.edu.in",
  "college_roll_number": "RA2311027010106",
  "hierarchies": [
    { "root": "A", "tree": { "A": { "B": { "D": {} }, "C": {} } }, "depth": 3 },
    { "root": "X", "tree": {}, "has_cycle": true }
  ],
  "invalid_entries": ["hello"],
  "duplicate_edges": [],
  "summary": {
    "total_trees": 1,
    "total_cycles": 1,
    "largest_tree_root": "A"
  }
}
```

### Processing Rules

1. **Validation** — each entry must match `[A-Z]->[A-Z]`, no self-loops
2. **Deduplication** — first occurrence wins, extras go to `duplicate_edges`
3. **Multi-parent** — first parent wins, subsequent edges discarded silently
4. **Tree construction** — root = node never appearing as a child
5. **Cycle detection** — groups with no root are cycles (lex smallest node as root)
6. **Depth** — longest root-to-leaf path (node count), only for non-cyclic trees

---

## Project Structure

```
├── server/
│   ├── index.js          # Express app, CORS, routes
│   ├── processor.js      # Core logic: validation, dedup, trees, cycles
│   └── package.json
├── client/
│   ├── src/
│   │   ├── App.jsx       # Main UI component
│   │   ├── main.jsx      # React entry point
│   │   ├── index.css     # Tailwind + custom styles
│   │   └── components/
│   │       └── TreeView.jsx  # Recursive tree renderer
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
├── package.json          # Root scripts (concurrently)
├── .gitignore
└── README.md
```

---

## Deployment

### Backend (Render / Railway)

1. Set **Root Directory** to `server`
2. **Build Command:** `npm install`
3. **Start Command:** `npm start`
4. Set environment variable `PORT` (Render auto-sets this)

### Frontend (Vercel / Netlify)

1. Set **Root Directory** to `client`
2. **Build Command:** `npm run build`
3. **Output Directory:** `dist`
4. Set environment variable `VITE_API_URL` to your deployed backend URL (e.g. `https://your-backend.onrender.com`)

> CORS is already enabled for all origins on the backend — no additional config needed.

---

## Tech Stack

| Layer    | Technology             |
| -------- | ---------------------- |
| Backend  | Node.js, Express, CORS |
| Frontend | React 18, Vite 5       |
| Styling  | Tailwind CSS 3         |
| Dev      | Nodemon, Concurrently  |
