let currentSection = "home";
let editingSection = "";

let entries = JSON.parse(localStorage.getItem("myLittleNotesEntries")) || [];
let todos = JSON.parse(localStorage.getItem("myLittleNotesTodos")) || [];
let moods = JSON.parse(localStorage.getItem("myLittleNotesMoods")) || [];

const sectionNames = {
    journal: "Journal",
    notes: "Notes",
    hobbies: "Hobbies",
    bookshelf: "Bookshelf",
    gratitude: "Gratitude",
    ideas: "Ideas",
    planner: "Planner"
};

function showSection(sectionName) {
    document.querySelectorAll(".page-section").forEach(section => {
        section.classList.remove("active-section");
    });

    const target = document.getElementById(sectionName);

    if (target) {
        target.classList.add("active-section");
        currentSection = sectionName;
    }

    document.querySelectorAll(".nav-item").forEach(button => {
        button.classList.remove("active");
    });

    const activeButton = document.querySelector(
        `.nav-item[onclick="showSection('${sectionName}')"]`
    );

    if (activeButton) {
        activeButton.classList.add("active");
    }

    if (sectionName === "home") {
        loadAllEntries();
        loadTodos();
        loadMoods();
    }

    if (sectionNames[sectionName]) {
        loadEntries(sectionName);
    }

    if (window.innerWidth <= 850) {
        document.getElementById("sidebar")?.classList.remove("sidebar-open");
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");

    if (!sidebar) return;

    sidebar.classList.toggle("sidebar-open");
}

function showTodayDate() {
    const dateElement = document.getElementById("todayDate");

    if (!dateElement) return;

    const today = new Date();

    dateElement.textContent = today.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric"
    });
}

/* =========================
   WRITING / NOTES
========================= */

function openEditor(sectionName) {
    editingSection = sectionName;

    const modal = document.getElementById("editorModal");
    const title = document.getElementById("entryTitle");
    const content = document.getElementById("entryContent");

    if (!modal || !title || !content) return;

    title.value = "";
    content.value = "";

    modal.classList.add("show");

    setTimeout(() => {
        title.focus();
    }, 100);
}

function closeEditor() {
    const modal = document.getElementById("editorModal");

    if (modal) {
        modal.classList.remove("show");
    }
}

function saveEntry() {
    const titleInput = document.getElementById("entryTitle");
    const contentInput = document.getElementById("entryContent");

    if (!titleInput || !contentInput) return;

    const title = titleInput.value.trim();
    const content = contentInput.value.trim();

    if (!content) {
        alert("Write something before saving ♡");
        contentInput.focus();
        return;
    }

    const newEntry = {
        id: Date.now(),
        section: editingSection,
        title: title || "Untitled",
        content: content,
        date: new Date().toISOString()
    };

    entries.unshift(newEntry);

    localStorage.setItem(
        "myLittleNotesEntries",
        JSON.stringify(entries)
    );

    closeEditor();

    loadEntries(editingSection);

    showSection(editingSection);
}

function loadAllEntries() {
    Object.keys(sectionNames).forEach(section => {
        loadEntries(section);
    });
}

function loadEntries(sectionName) {
    const container = document.getElementById(
        `${sectionName}Entries`
    );

    if (!container) return;

    container.innerHTML = "";

    const sectionEntries = entries.filter(
        entry => entry.section === sectionName
    );

    if (sectionEntries.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">✦</div>
                <h3>Nothing here yet</h3>
                <p>Tap + to write something.</p>
            </div>
        `;

        return;
    }

    sectionEntries.forEach((entry, index) => {
        const card = document.createElement("button");

        card.className = "entry-card";

        card.onclick = function () {
            openEntry(sectionName, entry.id);
        };

        const preview =
            entry.content.length > 150
                ? entry.content.substring(0, 150) + "..."
                : entry.content;

        card.innerHTML = `
            <div class="entry-number">
                ${String(index + 1).padStart(2, "0")}
            </div>

            <div class="entry-info">
                <span class="entry-date">
                    ${formatDate(entry.date)}
                </span>

                <h3>
                    ${escapeHTML(entry.title)}
                </h3>

                <p>
                    ${escapeHTML(preview)}
                </p>
            </div>

            <div class="entry-arrow">
                →
            </div>
        `;

        container.appendChild(card);
    });
}

/* =========================
   VIEW SAVED ENTRY
========================= */

function openEntry(sectionName, entryId) {
    const entry = entries.find(
        item =>
            item.id === entryId &&
            item.section === sectionName
    );

    if (!entry) return;

    const modal = document.getElementById("viewModal");
    const title = document.getElementById("viewTitle");
    const content = document.getElementById("viewContent");
    const date = document.getElementById("viewDate");

    if (!modal || !title || !content || !date) return;

    title.textContent = entry.title;

    date.textContent = formatDate(entry.date);

    content.innerHTML = escapeHTML(entry.content)
        .split("\n")
        .map(paragraph => `<p>${paragraph}</p>`)
        .join("");

    modal.classList.add("show");
}

function closeView() {
    const modal = document.getElementById("viewModal");

    if (modal) {
        modal.classList.remove("show");
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);

    return date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

function escapeHTML(text) {
    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}

/* =========================
   TO-DO LIST
========================= */

function addTodo() {
    const input = document.getElementById("todoInput");

    if (input) {
        input.focus();
    }
}

function addTodoFromInput() {
    const input = document.getElementById("todoInput");

    if (!input) return;

    const text = input.value.trim();

    if (!text) {
        input.focus();
        return;
    }

    todos.unshift({
        id: Date.now(),
        text: text,
        completed: false
    });

    saveTodos();

    input.value = "";

    input.focus();

    loadTodos();
}

function loadTodos() {
    const list = document.getElementById("todoList");

    if (!list) return;

    list.innerHTML = "";

    if (todos.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">☑</div>
                <h3>No tasks yet</h3>
                <p>Add something small to get started.</p>
            </div>
        `;

        return;
    }

    todos.forEach(todo => {
        const item = document.createElement("div");

        item.className = "todo-item";

        if (todo.completed) {
            item.classList.add("completed");
        }

        item.innerHTML = `
            <button
                class="todo-check"
                onclick="toggleTodo(${todo.id})"
                aria-label="Complete task"
            >
                ${todo.completed ? "✓" : ""}
            </button>

            <span class="todo-text">
                ${escapeHTML(todo.text)}
            </span>

            <button
                class="todo-edit"
                onclick="editTodo(${todo.id})"
                aria-label="Edit task"
            >
                ✎
            </button>

            <button
                class="todo-delete"
                onclick="deleteTodo(${todo.id})"
                aria-label="Delete task"
            >
                ×
            </button>
        `;

        list.appendChild(item);
    });
}

function toggleTodo(id) {
    const todo = todos.find(item => item.id === id);

    if (!todo) return;

    todo.completed = !todo.completed;

    saveTodos();

    loadTodos();
}

function editTodo(id) {
    const todo = todos.find(item => item.id === id);

    if (!todo) return;

    const newText = prompt(
        "Edit your task:",
        todo.text
    );

    if (newText === null) return;

    const cleaned = newText.trim();

    if (!cleaned) return;

    todo.text = cleaned;

    saveTodos();

    loadTodos();
}

function deleteTodo(id) {
    todos = todos.filter(
        item => item.id !== id
    );

    saveTodos();

    loadTodos();
}

function saveTodos() {
    localStorage.setItem(
        "myLittleNotesTodos",
        JSON.stringify(todos)
    );
}

/* =========================
   MOOD
========================= */

function saveMood(mood) {
    moods.unshift({
        mood: mood,
        date: new Date().toISOString()
    });

    localStorage.setItem(
        "myLittleNotesMoods",
        JSON.stringify(moods)
    );

    loadMoods();
}

function loadMoods() {
    const history =
        document.getElementById("moodHistory");

    if (!history) return;

    history.innerHTML = "";

    if (moods.length === 0) {
        history.innerHTML = `
            <div class="mood-empty">
                Your mood history will appear here ♡
            </div>
        `;

        return;
    }

    moods.slice(0, 10).forEach(item => {
        const row = document.createElement("div");

        row.className = "mood-history-item";

        row.innerHTML = `
            <span>
                ${escapeHTML(item.mood)}
            </span>

            <small>
                ${formatDate(item.date)}
            </small>
        `;

        history.appendChild(row);
    });
}

/* =========================
   THEME
========================= */

function toggleTheme() {
    document.body.classList.toggle("light-mode");

    const isLight =
        document.body.classList.contains("light-mode");

    localStorage.setItem(
        "myLittleNotesTheme",
        isLight ? "light" : "dark"
    );

    updateThemeIcon();
}

function loadTheme() {
    const savedTheme =
        localStorage.getItem("myLittleNotesTheme");

    if (savedTheme === "light") {
        document.body.classList.add("light-mode");
    }

    updateThemeIcon();
}

function updateThemeIcon() {
    const isLight =
        document.body.classList.contains("light-mode");

    document
        .querySelectorAll(
            ".theme-button, .mobile-theme-button"
        )
        .forEach(button => {
            button.textContent =
                isLight ? "☀" : "☾";
        });
}

/* =========================
   CLEAR DATA
========================= */

function clearAllData() {
    const confirmed = confirm(
        "Are you sure you want to remove all your saved notes, tasks and moods?"
    );

    if (!confirmed) return;

    entries = [];
    todos = [];
    moods = [];

    localStorage.removeItem(
        "myLittleNotesEntries"
    );

    localStorage.removeItem(
        "myLittleNotesTodos"
    );

    localStorage.removeItem(
        "myLittleNotesMoods"
    );

    loadAllEntries();
    loadTodos();
    loadMoods();

    alert("Your saved data has been cleared.");
}

/* =========================
   MODALS
========================= */

document.addEventListener("click", function (event) {
    const editorModal =
        document.getElementById("editorModal");

    const viewModal =
        document.getElementById("viewModal");

    if (event.target === editorModal) {
        closeEditor();
    }

    if (event.target === viewModal) {
        closeView();
    }
});

/* =========================
   KEYBOARD
========================= */

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        closeEditor();
        closeView();
    }

    if (
        event.key === "Enter" &&
        event.target.id === "todoInput"
    ) {
        addTodoFromInput();
    }
});

/* =========================
   START APP
========================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {
        showTodayDate();

        loadTheme();

        loadAllEntries();

        loadTodos();

        loadMoods();

        showSection("home");
    }
);
