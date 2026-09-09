/* =========================
   OBSIDIAN - MAIN JAVASCRIPT
========================= */

let currentSection = "home";
let editingSection = null;
let editingEntryId = null;

/* ---------- STORAGE ---------- */

const ENTRY_KEY = "obsidian_entries";
const TODO_KEY = "obsidian_todos";
const MOOD_KEY = "obsidian_moods";

function getEntries() {
    return JSON.parse(localStorage.getItem(ENTRY_KEY)) || {};
}

function saveEntries(data) {
    localStorage.setItem(ENTRY_KEY, JSON.stringify(data));
}

function getTodos() {
    return JSON.parse(localStorage.getItem(TODO_KEY)) || [];
}

function saveTodos(data) {
    localStorage.setItem(TODO_KEY, JSON.stringify(data));
}

function getMoods() {
    return JSON.parse(localStorage.getItem(MOOD_KEY)) || [];
}

function saveMoods(data) {
    localStorage.setItem(MOOD_KEY, JSON.stringify(data));
}


/* =========================
   SECTION NAVIGATION
========================= */

function showSection(section) {

    currentSection = section;

    document.querySelectorAll(".page-section").forEach(function (page) {
        page.classList.remove("active");
    });

    const selected = document.getElementById(section);

    if (selected) {
        selected.classList.add("active");
    }

    document.querySelectorAll(".nav-item").forEach(function (button) {
        button.classList.remove("active");
    });

    const activeButton = document.querySelector(
        '.nav-item[data-section="' + section + '"]'
    );

    if (activeButton) {
        activeButton.classList.add("active");
    }

    const title = document.getElementById("page-title");

    if (title) {
        const names = {
            home: "Welcome back",
            journal: "Journal",
            todo: "To-Do List",
            notes: "Notes",
            hobbies: "Hobbies",
            mood: "Mood",
            bookshelf: "Bookshelf",
            gratitude: "Gratitude",
            ideas: "Ideas",
            planner: "Planner",
            settings: "Settings"
        };

        title.textContent = names[section] || "Obsidian";
    }

    closeSidebar();
}


/* ---------- MOBILE SIDEBAR ---------- */

function toggleSidebar() {
    const sidebar = document.querySelector(".sidebar");

    if (sidebar) {
        sidebar.classList.toggle("open");
    }
}

function closeSidebar() {
    const sidebar = document.querySelector(".sidebar");

    if (sidebar) {
        sidebar.classList.remove("open");
    }
}


/* =========================
   EDITOR
========================= */

function openEditor(section, id = null) {

    editingSection = section;
    editingEntryId = id;

    const modal = document.getElementById("editor-modal");

    if (!modal) return;

    const titleInput = document.getElementById("entry-title");
    const contentInput = document.getElementById("entry-content");

    if (!titleInput || !contentInput) return;

    titleInput.value = "";
    contentInput.value = "";

    if (id !== null) {

        const entries = getEntries();
        const list = entries[section] || [];

        const entry = list.find(function (item) {
            return item.id === id;
        });

        if (entry) {
            titleInput.value = entry.title;
            contentInput.value = entry.content;
        }
    }

    modal.classList.add("show");

    setTimeout(function () {
        titleInput.focus();
    }, 100);
}


function closeEditor() {

    const modal = document.getElementById("editor-modal");

    if (modal) {
        modal.classList.remove("show");
    }

    editingSection = null;
    editingEntryId = null;
}


/* =========================
   SAVE ENTRY
========================= */

function saveEntry() {

    const titleInput = document.getElementById("entry-title");
    const contentInput = document.getElementById("entry-content");

    if (!titleInput || !contentInput) return;

    const title = titleInput.value.trim();
    const content = contentInput.value.trim();

    if (!title && !content) {
        alert("Write something first.");
        return;
    }

    const entries = getEntries();

    if (!entries[editingSection]) {
        entries[editingSection] = [];
    }

    if (editingEntryId !== null) {

        const index = entries[editingSection].findIndex(function (item) {
            return item.id === editingEntryId;
        });

        if (index !== -1) {

            entries[editingSection][index].title =
                title || "Untitled";

            entries[editingSection][index].content =
                content;

            entries[editingSection][index].updated =
                new Date().toISOString();
        }

    } else {

        entries[editingSection].unshift({

            id: Date.now(),

            title: title || "Untitled",

            content: content,

            date: new Date().toISOString(),

            updated: new Date().toISOString()
        });
    }

    saveEntries(entries);

    closeEditor();

    loadEntries(editingSection);
}


/* =========================
   LOAD ENTRIES
========================= */

function loadEntries(section) {

    const container =
        document.querySelector(
            "#" + section + " .entries-list"
        );

    if (!container) return;

    const entries = getEntries();
    const list = entries[section] || [];

    container.innerHTML = "";

    if (list.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">✦</div>
                <h3>Nothing here yet</h3>
                <p>Start writing something beautiful.</p>
            </div>
        `;

        return;
    }

    list.forEach(function (entry) {

        const card = document.createElement("div");

        card.className = "entry-card";

        card.innerHTML = `

            <button class="entry-main">

                <div class="entry-title">
                    ${escapeHTML(entry.title)}
                </div>

                <div class="entry-preview">
                    ${escapeHTML(
                        entry.content.substring(0, 140)
                    )}
                </div>

                <small>
                    ${formatDate(entry.date)}
                </small>

            </button>

            <div class="entry-actions">

                <button
                    class="edit-btn"
                    onclick="editEntry('${section}', ${entry.id})">
                    ✎
                </button>

                <button
                    class="delete-btn"
                    onclick="deleteEntry('${section}', ${entry.id})">
                    ×
                </button>

            </div>
        `;

        const main = card.querySelector(".entry-main");

        main.onclick = function () {
            openEntry(section, entry.id);
        };

        container.appendChild(card);
    });
}


/* =========================
   OPEN ENTRY
========================= */

function openEntry(section, id) {

    const entries = getEntries();
    const list = entries[section] || [];

    const entry = list.find(function (item) {
        return item.id === id;
    });

    if (!entry) return;

    const modal = document.getElementById("view-modal");

    if (!modal) return;

    document.getElementById("view-title").textContent =
        entry.title;

    document.getElementById("view-content").textContent =
        entry.content;

    const editButton =
        document.getElementById("view-edit");

    const deleteButton =
        document.getElementById("view-delete");

    if (editButton) {
        editButton.onclick = function () {
            closeView();
            openEditor(section, id);
        };
    }

    if (deleteButton) {
        deleteButton.onclick = function () {
            closeView();
            deleteEntry(section, id);
        };
    }

    modal.classList.add("show");
}


function closeView() {

    const modal = document.getElementById("view-modal");

    if (modal) {
        modal.classList.remove("show");
    }
}


/* =========================
   EDIT / DELETE
========================= */

function editEntry(section, id) {
    openEditor(section, id);
}


function deleteEntry(section, id) {

    if (!confirm("Delete this entry?")) return;

    const entries = getEntries();

    if (!entries[section]) return;

    entries[section] =
        entries[section].filter(function (item) {
            return item.id !== id;
        });

    saveEntries(entries);

    loadEntries(section);
}


/* =========================
   TODO LIST
========================= */

function addTodo() {

    const input =
        document.getElementById("todo-input");

    if (!input) return;

    const text = input.value.trim();

    if (!text) return;

    const todos = getTodos();

    todos.unshift({
        id: Date.now(),
        text: text,
        completed: false
    });

    saveTodos(todos);

    input.value = "";

    loadTodos();
}


function loadTodos() {

    const container =
        document.getElementById("todo-list");

    if (!container) return;

    const todos = getTodos();

    container.innerHTML = "";

    if (todos.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">✓</div>
                <h3>No tasks yet</h3>
                <p>Add something you need to do.</p>
            </div>
        `;

        return;
    }

    todos.forEach(function (todo) {

        const item =
            document.createElement("div");

        item.className =
            "todo-item " +
            (todo.completed ? "completed" : "");

        item.innerHTML = `

            <button
                class="todo-check"
                onclick="toggleTodo(${todo.id})">
                ${todo.completed ? "✓" : ""}
            </button>

            <span class="todo-text">
                ${escapeHTML(todo.text)}
            </span>

            <button
                class="todo-edit"
                onclick="editTodo(${todo.id})">
                ✎
            </button>

            <button
                class="todo-delete"
                onclick="deleteTodo(${todo.id})">
                ×
            </button>
        `;

        container.appendChild(item);
    });
}


function toggleTodo(id) {

    const todos = getTodos();

    const todo =
        todos.find(function (item) {
            return item.id === id;
        });

    if (!todo) return;

    todo.completed = !todo.completed;

    saveTodos(todos);

    loadTodos();
}


function editTodo(id) {

    const todos = getTodos();

    const todo =
        todos.find(function (item) {
            return item.id === id;
        });

    if (!todo) return;

    const newText =
        prompt("Edit task:", todo.text);

    if (newText === null) return;

    const clean =
        newText.trim();

    if (!clean) return;

    todo.text = clean;

    saveTodos(todos);

    loadTodos();
}


function deleteTodo(id) {

    const todos = getTodos();

    saveTodos(
        todos.filter(function (item) {
            return item.id !== id;
        })
    );

    loadTodos();
}


/* =========================
   MOOD
========================= */

function saveMood(mood) {

    const moods = getMoods();

    moods.unshift({
        id: Date.now(),
        mood: mood,
        date: new Date().toISOString()
    });

    saveMoods(moods);

    loadMoods();
}


function loadMoods() {

    const container =
        document.getElementById("mood-history");

    if (!container) return;

    const moods = getMoods();

    container.innerHTML = "";

    moods.forEach(function (item) {

        const div =
            document.createElement("div");

        div.className = "mood-history-item";

        div.innerHTML = `
            <span>${escapeHTML(item.mood)}</span>

            <small>
                ${formatDate(item.date)}
            </small>

            <button onclick="deleteMood(${item.id})">
                ×
            </button>
        `;

        container.appendChild(div);
    });
}


function deleteMood(id) {

    const moods = getMoods();

    saveMoods(
        moods.filter(function (item) {
            return item.id !== id;
        })
    );

    loadMoods();
}


/* =========================
   DARK / LIGHT MODE
========================= */

function toggleTheme() {

    document.body.classList.toggle("light-mode");

    const isLight =
        document.body.classList.contains("light-mode");

    localStorage.setItem(
        "obsidian_theme",
        isLight ? "light" : "dark"
    );
}


function loadTheme() {

    const theme =
        localStorage.getItem("obsidian_theme");

    if (theme === "light") {
        document.body.classList.add("light-mode");
    }
}


/* =========================
   CLEAR DATA
========================= */

function clearAllData() {

    if (!confirm(
        "Are you sure you want to delete all your Obsidian data?"
    )) {
        return;
    }

    localStorage.removeItem(ENTRY_KEY);
    localStorage.removeItem(TODO_KEY);
    localStorage.removeItem(MOOD_KEY);

    location.reload();
}


/* =========================
   DATE
========================= */

function formatDate(dateString) {

    const date =
        new Date(dateString);

    return date.toLocaleDateString(
        undefined,
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );
}


function showTodayDate() {

    const element =
        document.getElementById("today-date");

    if (!element) return;

    const now = new Date();

    element.textContent =
        now.toLocaleDateString(
            undefined,
            {
                weekday: "long",
                day: "numeric",
                month: "long"
            }
        );
}


/* =========================
   SECURITY / TEXT
========================= */

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


/* =========================
   MODAL CLICK OUTSIDE
========================= */

window.addEventListener("click", function (event) {

    const editor =
        document.getElementById("editor-modal");

    const viewer =
        document.getElementById("view-modal");

    if (
        event.target === editor
    ) {
        closeEditor();
    }

    if (
        event.target === viewer
    ) {
        closeView();
    }
});


/* =========================
   ESCAPE KEY
========================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (event.key !== "Escape") return;

        closeEditor();
        closeView();
    }
);


/* =========================
   START APP
========================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadTheme();

        showTodayDate();

        loadTodos();

        loadMoods();

        [
            "journal",
            "notes",
            "hobbies",
            "bookshelf",
            "gratitude",
            "ideas",
            "planner"
        ].forEach(function (section) {
            loadEntries(section);
        });

        showSection("home");
    }
);
