const API_URL = "https://jsonplaceholder.typicode.com/posts";

// DOM Element Selections
const loadBtn = document.getElementById("load-btn");
const statusP = document.getElementById("status");
const noteForm = document.getElementById("note-form");
const titleInput = document.getElementById("title-input");
const bodyInput = document.getElementById("body-input");
const submitBtn = document.getElementById("submit-btn");
const notesList = document.getElementById("notes-list");

// Local array state to maintain dynamic UI list
let localNotes = [];

// Helper: Set UI Status
function setStatus(message, type = "loading") {
  statusP.textContent = message;
  statusP.className = `status-${type}`;
}

// Reusable async HTTP Request wrapper
async function request(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
  }
  // Return null if HTTP 204 No Content, otherwise return JSON
  if (response.status === 204) return null;
  return await response.json();
}

// Render Notes Array Safely using textContent
function renderNotes() {
  notesList.textContent = "";

  if (localNotes.length === 0) {
    const emptyLi = document.createElement("li");
    emptyLi.textContent = "No notes available. Click 'Load notes' or create one above.";
    emptyLi.style.color = "#64748b";
    emptyLi.style.fontStyle = "italic";
    notesList.appendChild(emptyLi);
    return;
  }

  localNotes.forEach((note) => {
    const li = document.createElement("li");
    li.className = "note-card";

    const contentDiv = document.createElement("div");
    contentDiv.className = "note-content";

    const titleH3 = document.createElement("h3");
    titleH3.textContent = note.title;

    const bodyP = document.createElement("p");
    bodyP.textContent = note.body || "(No body provided)";

    contentDiv.appendChild(titleH3);
    contentDiv.appendChild(bodyP);

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => deleteNote(note.id));

    li.appendChild(contentDiv);
    li.appendChild(deleteBtn);
    notesList.appendChild(li);
  });
}

// Task 1: Load Notes (GET)
async function loadNotes() {
  loadBtn.disabled = true;
  setStatus("Loading notes...", "loading");

  try {
    const data = await request(`${API_URL}?_limit=10`);
    localNotes = data;
    renderNotes();
    setStatus(`Loaded ${localNotes.length} notes from the server.`, "success");
  } catch (error) {
    console.error("Fetch error:", error);
    setStatus("Failed to load notes. Please check your connection.", "error");
  } finally {
    loadBtn.disabled = false;
  }
}

// Task 2: Create Note (POST)
noteForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();

  // Validation Check
  if (!title) {
    setStatus("Title is required.", "error");
    return;
  }
  if (title.length > 100) {
    setStatus("Title must be 100 characters or fewer.", "error");
    return;
  }

  submitBtn.disabled = true;
  setStatus("Creating note...", "loading");

  try {
    const payload = { title, body, userId: 1 };
    const newNote = await request(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    // Prepend newly created note to local array
    localNotes.unshift(newNote);
    renderNotes();

    setStatus(`Note created (status 201, id ${newNote.id}).`, "success");
    noteForm.reset();
  } catch (error) {
    console.error("Create error:", error);
    setStatus("Failed to create note. Please try again.", "error");
  } finally {
    submitBtn.disabled = false;
  }
});

// Task 3: Delete Note (DELETE)
/* NOTE: JSONPlaceholder is a mock REST API that does not actually persist custom created
   notes or remove mock notes from its server database upon a DELETE call. Therefore,
   upon a successful HTTP 200 response from JSONPlaceholder, we manually filter out
   the note from localNotes state in memory and re-render the UI list. */
async function deleteNote(id) {
  const allDeleteButtons = document.querySelectorAll(".delete-btn");
  allDeleteButtons.forEach((btn) => (btn.disabled = true));
  setStatus(`Deleting note ID ${id}...`, "loading");

  try {
    await request(`${API_URL}/${id}`, { method: "DELETE" });

    // Remove note from local array state
    localNotes = localNotes.filter((n) => n.id !== id);
    renderNotes();

    setStatus(`Note ID ${id} deleted successfully.`, "success");
  } catch (error) {
    console.error("Delete error:", error);
    setStatus(`Failed to delete note ID ${id}.`, "error");
  } finally {
    allDeleteButtons.forEach((btn) => (btn.disabled = false));
  }
}

// Event Listeners
loadBtn.addEventListener("click", loadNotes);