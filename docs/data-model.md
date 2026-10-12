# QuickNotes Relational Data Model Specification

## 1. Entities & Schema Definition

### `users`

| Column | Type | Constraints |
| :--- | :--- | :--- |
| `user_id` | `INTEGER` | Primary key, auto-increment |
| `email` | `VARCHAR(255)` | Not null, unique |
| `password_hash` | `VARCHAR(255)` | Not null |
| `created_at` | `TIMESTAMP` | Defaults to current timestamp |

### `notes`

| Column | Type | Constraints |
| :--- | :--- | :--- |
| `note_id` | `INTEGER` | Primary key, auto-increment |
| `user_id` | `INTEGER` | Not null, foreign key to `users.user_id` |
| `title` | `VARCHAR(100)` | Not null |
| `body` | `TEXT` | Nullable |
| `created_at` | `TIMESTAMP` | Defaults to current timestamp |
| `updated_at` | `TIMESTAMP` | Defaults to current timestamp |

### `tags`

| Column | Type | Constraints |
| :--- | :--- | :--- |
| `tag_id` | `INTEGER` | Primary key, auto-increment |
| `name` | `VARCHAR(50)` | Not null, unique |

### `note_tags` (join table)

| Column | Type | Constraints |
| :--- | :--- | :--- |
| `note_id` | `INTEGER` | Not null, foreign key to `notes.note_id` |
| `tag_id` | `INTEGER` | Not null, foreign key to `tags.tag_id` |

The composite primary key for `note_tags` is `(note_id, tag_id)`.

## 2. Relationships

- **`users` to `notes` (one-to-many):** One user can own multiple notes; every
  note belongs to exactly one user.
- **`notes` to `tags` (many-to-many):** A note can have multiple tags, and a
  tag can be applied to multiple notes. The `note_tags` table joins them.

## 3. DDL (CREATE TABLE Statements)

```sql
CREATE TABLE users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notes (
    note_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title VARCHAR(100) NOT NULL,
    body TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE tags (
    tag_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE note_tags (
    note_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (note_id, tag_id),
    FOREIGN KEY (note_id) REFERENCES notes(note_id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(tag_id) ON DELETE CASCADE
);

CREATE INDEX idx_notes_user_id ON notes(user_id);
```

## 4. Example Queries

### Fetch a user's notes, newest first

```sql
SELECT note_id, title, body, created_at
FROM notes
WHERE user_id = 42
ORDER BY created_at DESC;
```

### Retrieve a note with its associated tags

```sql
SELECT n.note_id, n.title, n.body, t.name AS tag_name
FROM notes n
JOIN note_tags nt ON n.note_id = nt.note_id
JOIN tags t ON nt.tag_id = t.tag_id
WHERE n.note_id = 101;
```

This inner join returns one row per associated tag and does not return notes
that have no tags.

### Count notes per user

```sql
SELECT user_id, COUNT(note_id) AS total_notes
FROM notes
GROUP BY user_id;
```