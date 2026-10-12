# QuickNotes Production REST API Specification

This document details the production REST API specification for QuickNotes.

## 1. Endpoints Overview

| Method | Path | Description | Success Status |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/notes` | List all notes for the authenticated user (supports pagination) | `200 OK` |
| `GET` | `/api/v1/notes/:id` | Retrieve details of a specific note by ID | `200 OK` |
| `POST` | `/api/v1/notes` | Create a new note | `201 Created` |
| `PUT` | `/api/v1/notes/:id` | Replace/update an existing note | `200 OK` |
| `DELETE` | `/api/v1/notes/:id` | Remove a note | `204 No Content` |
| `GET` | `/api/v1/notes/search` | Search notes by query string (`?q=term`) | `200 OK` |

## 2. Conventions

- All endpoints use the `/api/v1` base path and exchange JSON, except `DELETE`,
  which returns no response body.
- Requests that include a body must use `Content-Type: application/json`.
- All endpoints require an authenticated user. Send the access token as
  `Authorization: Bearer <token>`. The server derives note ownership from the
  authenticated identity; clients must not send or choose an owner ID.
- IDs and `tagIds` are positive integers. Timestamps are UTC ISO 8601 strings.
- Notes are scoped to their owner. A request for another user's note is reported
  as `404 Not Found`.

### Note resource

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | integer | Server-generated note identifier |
| `userId` | integer | Server-assigned identifier of the note's owner |
| `title` | string | Required; trimmed and 1–100 characters |
| `body` | string | Optional text; defaults to an empty string |
| `tags` | object array | Tags associated with the note; each object contains an `id` and `name` |
| `createdAt` | string | Server-generated creation timestamp |
| `updatedAt` | string | Server-generated last-update timestamp |

### Pagination and ordering

List and search accept `page` and `limit` query parameters. `page` defaults
to `1`; `limit` defaults to `20` and has a maximum of `100`. Both must be
positive integers. Results are ordered by `createdAt` descending, then `id`
descending to make ordering stable.

List and search responses return the requested page, the effective limit, the
total number of matching notes, and the page's `data` array:

```json
{
  "page": 1,
  "limit": 20,
  "total": 0,
  "data": []
}
```

## 3. Request & Response JSON Examples

### A. List Notes (`GET /api/v1/notes?page=1&limit=2`)

**Response — `200 OK`:**

```json
{
  "page": 1,
  "limit": 2,
  "total": 12,
  "data": [
    {
      "id": 101,
      "title": "System Architecture Review",
      "body": "Finalize docs before Day 8 capstone presentation.",
      "createdAt": "2026-10-12T14:30:00Z"
    },
    {
      "id": 100,
      "title": "Grocery List",
      "body": "Milk, eggs, and bread.",
      "createdAt": "2026-10-11T09:15:00Z"
    }
  ]
}
```

Each list item contains the note's `id`, `title`, `body`, and `createdAt`.
Use `GET /api/v1/notes/:id` to retrieve the full note, including `userId`,
`tags`, and `updatedAt`.

An individual note response uses this shape:

```json
{
  "id": 101,
  "userId": 42,
  "title": "System Architecture Review",
  "body": "Finalize docs before Day 8 capstone presentation.",
  "tags": [
    { "id": 1, "name": "Work" },
    { "id": 3, "name": "Important" }
  ],
  "createdAt": "2026-10-12T14:30:00Z",
  "updatedAt": "2026-10-12T14:30:00Z"
}
```

### B. Retrieve a Note (`GET /api/v1/notes/42`)

**Response — `200 OK`:**

```json
{
  "id": 42,
  "userId": 42,
  "title": "System Architecture Review",
  "body": "Finalize docs before Day 8 capstone presentation.",
  "tags": [
    { "id": 1, "name": "Work" },
    { "id": 3, "name": "Important" }
  ],
  "createdAt": "2026-10-12T12:30:00Z",
  "updatedAt": "2026-10-12T12:30:00Z"
}
```

### C. Create Note (`POST /api/v1/notes`)

**Request Body:**

```json
{
  "title": "System Architecture Review",
  "body": "Finalize docs before Day 8 capstone presentation.",
  "tagIds": [1, 3]
}
```

`title` is required. `body` and `tagIds` are optional; omitted values default
to `""` and `[]`, respectively. The request must not include server-managed
fields such as `id`, `createdAt`, or `updatedAt`.

**Response — `201 Created`:**

```json
{
  "id": 101,
  "userId": 42,
  "title": "System Architecture Review",
  "body": "Finalize docs before Day 8 capstone presentation.",
  "tags": [
    { "id": 1, "name": "Work" },
    { "id": 3, "name": "Important" }
  ],
  "createdAt": "2026-10-12T14:30:00Z",
  "updatedAt": "2026-10-12T14:30:00Z"
}
```

The response includes a `Location: /api/v1/notes/101` header.

### D. Replace a Note (`PUT /api/v1/notes/42`)

`PUT` replaces the note's mutable fields. The request must include `title`,
`body`, and `tagIds`; send `""` or `[]` to clear optional content or tags.
Server-managed fields and unknown fields are not accepted.

**Request Body:**

```json
{
  "title": "Architecture Review — Final",
  "body": "Presentation materials are ready.",
  "tagIds": [3]
}
```

**Response — `200 OK`:**

```json
{
  "id": 42,
  "userId": 42,
  "title": "Architecture Review — Final",
  "body": "Presentation materials are ready.",
  "tags": [
    { "id": 3, "name": "Important" }
  ],
  "createdAt": "2026-10-12T12:30:00Z",
  "updatedAt": "2026-10-12T13:00:00Z"
}
```

### E. Delete a Note (`DELETE /api/v1/notes/42`)

On success, the server returns `204 No Content` with an empty response body.
Deleting a note that does not exist or is not owned by the authenticated user
returns `404 Not Found`.

### F. Search Notes (`GET /api/v1/notes/search?q=architecture&page=1&limit=20`)

`q` is required and must contain between 1 and 100 characters after trimming.
Search is case-insensitive and matches the query as a substring of a note's
title or body. Results are restricted to the authenticated user's notes and
use the standard pagination response shape.

**Response — `200 OK`:** Uses the same `{ "page", "limit", "total", "data" }`
pagination envelope as the list endpoint. Each item has the list-item shape
shown above.

Register the static `/notes/search` route before `/notes/:id` in routers that
match routes by declaration order.

## 4. Error Status Codes & Response Format

All error responses adhere to this standardized JSON format:

```json
{
  "error": {
    "code": "BAD_REQUEST",
    "message": "Validation failed: 'title' field is required and cannot exceed 100 characters."
  }
}
```

| Status | Error code | Meaning |
| :--- | :--- | :--- |
| `400 Bad Request` | `BAD_REQUEST` | Request body contains invalid data, required fields are missing, or a request parameter is invalid |
| `401 Unauthorized` | `UNAUTHORIZED` | Authentication token is missing or invalid |
| `403 Forbidden` | `FORBIDDEN` | An authenticated user attempts to access or modify a note owned by another user |
| `404 Not Found` | `NOT_FOUND` | The requested note ID does not exist |
| `500 Internal Server Error` | `INTERNAL_SERVER_ERROR` | An unexpected server-side exception occurs |

Error responses do not expose stack traces, database details, or other internal
implementation information. The `message` describes the failure; field-specific
validation details are included in that message rather than a separate property.
When a note belongs to another user, the API returns `403 Forbidden`; a
non-existent note returns `404 Not Found`.

## 5. Validation Rules

- `title` is a string, trimmed by the server, and must contain 1–100 characters.
- `body` is a string no longer than 10,000 characters; an empty string is valid.
- `tagIds` is an array of positive integers with no duplicate values.
- `page` and `limit` must be positive integers; `limit` cannot exceed 100.
- Unknown request fields are rejected rather than silently persisted.