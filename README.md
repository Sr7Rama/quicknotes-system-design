# QuickNotes System Design & Architecture

A complete system architecture blueprint and live frontend API client
implementation for QuickNotes, built for scale up to 1 million users.

## 📁 Repository Structure

```text
quicknotes-system-design/
├── docs/
│   ├── api-design.md       # Production REST API specification
│   ├── architecture.md    # Architecture, capacity, and scaling plan
│   └── data-model.md      # Relational schema and example queries
├── api.js                  # JSONPlaceholder API client and UI behavior
├── index.html              # QuickNotes client page
├── style.css               # Client styles
└── README.md
```

## Frontend API Client

The browser client demonstrates loading, creating, and deleting notes through
the [JSONPlaceholder](https://jsonplaceholder.typicode.com/) practice API.
Created and deleted data is not persisted by JSONPlaceholder; the page updates
its current in-memory list after successful requests.

### Run locally

Open `index.html` in a browser while connected to the internet. If your browser
restricts requests from local files, serve this directory with a local static
HTTP server and open the served page instead.

## Documentation

- [Production REST API specification](docs/api-design.md) — endpoints,
  authentication, request and response formats, pagination, and errors.
- [Relational data model](docs/data-model.md) — users, notes, tags, join table,
  DDL, and example SQL queries.
- [System architecture and scaling plan](docs/architecture.md) — requirements,
  capacity estimates, architecture diagram, request flows, scaling, and
  reliability considerations.

The production API specification and scaling plan describe a proposed backend
architecture. The included browser client is a practice frontend and does not
connect to that production API.