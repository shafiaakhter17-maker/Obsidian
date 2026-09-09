/* =====================================================
   OBSIDIAN — MAIN JAVASCRIPT
===================================================== */


/* =====================================================
   STORAGE
===================================================== */

const ENTRY_KEY = "obsidian_entries";
const TODO_KEY = "obsidian_todos";
const MOOD_KEY = "obsidian_moods";
const THEME_KEY = "obsidian_theme";


/* =====================================================
   STATE
===================================================== */

let currentSection = "home";

let editingSection = null;
let editingEntryId = null;


/* =====================================================
   BASIC HELPERS
===================================================== */

function getEntries() {
    try {
        return JSON.parse(localStorage.getItem(ENTRY_KEY)) || [];
    } catch {
        return [];
    }
}


function saveEntries(entries) {
    localStorage.setItem(
        ENTRY_KEY,
        JSON.stringify(entries)
    );
}


function getTodos() {
    try {
        return JSON.parse(localStorage.getItem(TODO_KEY)) || [];
    } catch {
        return [];
    }
}


function saveTodos(todos) {
    localStorage.setItem(
        TODO_KEY,
        JSON.stringify(todos)
    );
}


function getMoods() {
    try {
        return JSON.parse(localStorage.getItem(MOOD_KEY)) || [];
    } catch {
        return [];
    }
}


function saveMoods(moods) {
    localStorage.setItem(
        MOOD_KEY,
        JSON.stringify(moods)
    );
}


/* =====================================================
   SECTION NAVIGATION
===================================================== */

function showSection(sectionName) {

    const target = document.getElementById(sectionName);

    if (!target) {
        console.error("Section not found:", sectionName);
        return;
    }


    /* Hide every section */

    document.querySelectorAll(".page-section").forEach(section => {
        section.classList.remove("active");
    });


    /* Show selected section */

    target.classList.add("active");


    /* Update navigation */

    document.querySelectorAll(".nav-button").forEach(button => {
        button.classList.remove("active");
    });


    const activeButton = document.querySelector(
        `.nav-button[onclick="showSection('${sectionName}')"]`
    );

    if (activeButton) {
        activeButton.classList.add("active");
    }


    currentSection = sectionName;


    /* Update page title */

    const titles = {
        home: "Obsidian",
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


    document.title =
        `${titles[sectionName] || "Obsidian"} — Obsidian`;


    /* Close mobile sidebar */

    closeSidebar();


    /* Refresh content */

    if (sectionName !== "home" &&
        sectionName !== "todo" &&
        sectionName !== "mood" &&
        sectionName !== "settings") {

        loadEntries(sectionName);
    }


    if (sectionName === "todo") {
        loadTodos();
    }


    if (sectionName === "mood") {
        loadMoods();
    }
}


/* =====================================================
   SIDEBAR
===================================================== */

function toggleSidebar() {

    const sidebar =
        document.getElementById("sidebar");

    const overlay =
        document.getElementById("sidebarOverlay");


    if (!sidebar) return;


    sidebar.classList.toggle("open");


    if (overlay) {
        overlay.classList.toggle("show");
    }
}


function closeSidebar() {

    const sidebar =
        document.getElementById("sidebar");

    const overlay =
        document.getElementById("sidebarOverlay");


    if (sidebar) {
        sidebar.classList.remove("open");
    }


    if (overlay) {
        overlay.classList.remove("show");
    }
}


/* =====================================================
   ENTRY EDITOR
===================================================== */

function openEditor(sectionName, entryId = null) {

    const modal =
        document.getElementById("editorModal");

    const titleInput =
        document.getElementById("entryTitle");

    const contentInput =
        document.getElementById("entryContent");

    const editorTitle =
        document.getElementById("editorTitle");

    const editorEyebrow =
        document.getElementById("editorEyebrow");


    if (!modal ||
        !titleInput ||
        !contentInput) {
        return;
    }


    editingSection = sectionName;
    editingEntryId = entryId;


    /* Editing an existing entry */

    if (entryId) {

        const entries = getEntries();

        const entry = entries.find(
            item =>
                item.id === entryId &&
                item.section === sectionName
        );


        if (!entry) return;


        titleInput.value = entry.title;
        contentInput.value = entry.content;


        if (editorTitle) {
            editorTitle.textContent = "Edit";
        }


        if (editorEyebrow) {
            editorEyebrow.textContent = "edit entry";
        }

    }


    /* Creating a new entry */

    else {

        titleInput.value = "";
        contentInput.value = "";


        const names = {
            journal: "Journal",
            notes: "Note",
            hobbies: "Hobby",
            bookshelf: "Book",
            gratitude: "Gratitude",
            ideas: "Idea",
            planner: "Plan"
        };


        if (editorTitle) {
            editorTitle.textContent =
                `New ${names[sectionName] || "Entry"}`;
        }


        if (editorEyebrow) {
            editorEyebrow.textContent = "new entry";
        }
    }


    modal.classList.add("show");


    setTimeout(() => {
        titleInput.focus();
    }, 100);
}


function closeEditor() {

    const modal =
        document.getElementById("editorModal");


    if (modal) {
        modal.classList.remove("show");
    }


    editingSection = null;
    editingEntryId = null;
}


/* =====================================================
   SAVE ENTRY
===================================================== */

function saveEntry() {

    const titleInput =
        document.getElementById("entryTitle");

    const contentInput =
        document.getElementById("entryContent");


    if (!titleInput || !contentInput) {
        return;
    }


    const title =
        titleInput.value.trim();

    const content =
        contentInput.value.trim();


    if (!title && !content) {

        alert("Please write something first.");

        return;
    }


    const entries = getEntries();


    /* EDIT */

    if (editingEntryId) {

        const index = entries.findIndex(
            entry =>
                entry.id === editingEntryId
        );


        if (index !== -1) {

            entries[index].title =
                title || "Untitled";

            entries[index].content =
                content;

            entries[index].updatedAt =
                new Date().toISOString();
        }

    }


    /* NEW */

    else {

        entries.unshift({

            id:
                Date.now().toString(),

            section:
                editingSection,

            title:
                title || "Untitled",

            content:
                content,

            createdAt:
                new Date().toISOString(),

            updatedAt:
                new Date().toISOString()
        });
    }


    saveEntries(entries);


    const sectionToRefresh =
        editingSection;


    closeEditor();


    loadEntries(sectionToRefresh);
}


/* =====================================================
   LOAD ENTRIES
===================================================== */

function loadEntries(sectionName) {

    const container =
        document.getElementById(
            `${sectionName}Entries`
        );


    if (!container) {
        return;
    }


    const entries =
        getEntries().filter(
            entry =>
                entry.section === sectionName
        );


    if (entries.length === 0) {

        const emptyMessages = {

            journal: [
                "fa-feather",
                "No journal entries yet",
                "Tap + to write your first entry."
            ],

            notes: [
                "fa-note-sticky",
                "No notes yet",
                "Write something you want to remember."
            ],

            hobbies: [
                "fa-palette",
                "No hobbies saved",
                "Write about something you enjoy doing."
            ],

            bookshelf: [
                "fa-book",
                "Your bookshelf is empty",
                "Add a book you'd like to remember."
            ],

            gratitude: [
                "fa-heart",
                "Nothing here yet",
                "Write something you're grateful for."
            ],

            ideas: [
                "fa-lightbulb",
                "No ideas yet",
                "Save every interesting thought."
            ],

            planner: [
                "fa-calendar-days",
                "No plans yet",
                "Add a plan or something you want to remember."
            ]
        };


        const message =
            emptyMessages[sectionName] ||
            [
                "fa-feather",
                "Nothing here yet",
                "Tap + to add something."
            ];


        container.innerHTML = `

            <div class="empty-state">

                <i class="fa-solid ${message[0]}"></i>

                <h3>${message[1]}</h3>

                <p>${message[2]}</p>

            </div>

        `;


        return;
    }


    container.innerHTML = "";


    entries.forEach(entry => {

        const card =
            document.createElement("article");

        card.className = "entry-card";


        const safeTitle =
            escapeHTML(entry.title);


        const preview =
            escapeHTML(
                entry.content.length > 160
                    ? entry.content.substring(0, 160) + "..."
                    : entry.content
            );


        const date =
            formatDate(entry.createdAt);


        card.innerHTML = `

            <div class="entry-main">

                <button class="entry-open">

                    <div class="entry-date">
                        ${date}
                    </div>

                    <h3>
                        ${safeTitle}
                    </h3>

                    <p>
                        ${preview}
                    </p>

                </button>


                <div class="entry-actions">

                    <button
                        class="todo-edit"
                        title="Edit">

                        <i class="fa-solid fa-pen"></i>

                    </button>


                    <button
                        class="todo-delete"
                        title="Delete">

                        <i class="fa-solid fa-trash"></i>

                    </button>

                </div>

            </div>

        `;


        const openButton =
            card.querySelector(".entry-open");


        const editButton =
            card.querySelector(".todo-edit");


        const deleteButton =
            card.querySelector(".todo-delete");


        openButton.addEventListener(
            "click",
            () => openEntry(entry.id)
        );


        editButton.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                editEntry(entry.id);
            }
        );


        deleteButton.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                deleteEntry(entry.id);
            }
        );


        container.appendChild(card);
    });
}


/* =====================================================
   OPEN ENTRY
===================================================== */

function openEntry(entryId) {

    const entries =
        getEntries();


    const entry =
        entries.find(
            item =>
                item.id === entryId
        );


    if (!entry) return;


    const modal =
        document.getElementById("viewModal");


    const title =
        document.getElementById("viewTitle");


    const content =
        document.getElementById("viewContent");


    const date =
        document.getElementById("viewDate");


    const editButton =
        document.getElementById("viewEditButton");


    const deleteButton =
        document.getElementById("viewDeleteButton");


    if (!modal) return;


    title.textContent =
        entry.title;


    date.textContent =
        formatDate(entry.createdAt);


    content.innerHTML =
        escapeHTML(entry.content)
            .replace(/\n/g, "<br>");


    editButton.onclick = () => {

        closeView();

        openEditor(
            entry.section,
            entry.id
        );
    };


    deleteButton.onclick = () => {

        closeView();

        deleteEntry(entry.id);
    };


    modal.classList.add("show");
}


/* =====================================================
   CLOSE ENTRY VIEW
===================================================== */

function closeView() {

    const modal =
        document.getElementById("viewModal");


    if (modal) {
        modal.classList.remove("show");
    }
}


/* =====================================================
   EDIT ENTRY
===================================================== */

function editEntry(entryId) {

    const entries =
        getEntries();


    const entry =
        entries.find(
            item =>
                item.id === entryId
        );


    if (!entry) return;


    openEditor(
        entry.section,
        entry.id
    );
}


/* =====================================================
   DELETE ENTRY
===================================================== */

function deleteEntry(entryId) {

    const entries =
        getEntries();


    const entry =
        entries.find(
            item =>
                item.id === entryId
        );


    if (!entry) return;


    const confirmed =
        confirm(
            `Delete "${entry.title}"?`
        );


    if (!confirmed) {
        return;
    }


    const updated =
        entries.filter(
            item =>
                item.id !== entryId
        );


    saveEntries(updated);


    loadEntries(entry.section);
}


/* =====================================================
   TO-DO LIST
===================================================== */

function addTodo() {

    const input =
        document.getElementById("todoInput");


    if (!input) return;


    const text =
        input.value.trim();


    if (!text) return;


    const todos =
        getTodos();


    todos.unshift({

        id:
            Date.now().toString(),

        text:
            text,

        completed:
            false,

        createdAt:
            new Date().toISOString()
    });


    saveTodos(todos);


    input.value = "";


    loadTodos();
}


/* =====================================================
   LOAD TODOS
===================================================== */

function loadTodos() {

    const container =
        document.getElementById("todoList");


    if (!container) return;


    const todos =
        getTodos();


    if (todos.length === 0) {

        container.innerHTML = `

            <div class="empty-state">

                <i class="fa-solid fa-check"></i>

                <h3>Nothing here yet</h3>

                <p>
                    Add something you want to accomplish.
                </p>

            </div>

        `;


        return;
    }


    container.innerHTML = "";


    todos.forEach(todo => {

        const item =
            document.createElement("div");


        item.className =
            "todo-item";


        if (todo.completed) {
            item.classList.add("completed");
        }


        item.innerHTML = `

            <button class="todo-check">

                <i class="fa-solid fa-check"></i>

            </button>


            <span class="todo-text">
                ${escapeHTML(todo.text)}
            </span>


            <div class="todo-actions">

                <button class="todo-edit"
                        title="Edit">

                    <i class="fa-solid fa-pen"></i>

                </button>


                <button class="todo-delete"
                        title="Delete">

                    <i class="fa-solid fa-trash"></i>

                </button>

            </div>

        `;


        const check =
            item.querySelector(".todo-check");


        const edit =
            item.querySelector(".todo-edit");


        const remove =
            item.querySelector(".todo-delete");


        check.onclick = () => {
            toggleTodo(todo.id);
        };


        edit.onclick = () => {
            editTodo(todo.id);
        };


        remove.onclick = () => {
            deleteTodo(todo.id);
        };


        container.appendChild(item);
    });
}


/* =====================================================
   TOGGLE TODO
===================================================== */

function toggleTodo(todoId) {

    const todos =
        getTodos();


    const todo =
        todos.find(
            item =>
                item.id === todoId
        );


    if (!todo) return;


    todo.completed =
        !todo.completed;


    saveTodos(todos);


    loadTodos();
}


/* =====================================================
   EDIT TODO
===================================================== */

function editTodo(todoId) {

    const todos =
        getTodos();


    const todo =
        todos.find(
            item =>
                item.id === todoId
        );


    if (!todo) return;


    const newText =
        prompt(
            "Edit your task:",
            todo.text
        );


    if (newText === null) {
        return;
    }


    const cleanText =
        newText.trim();


    if (!cleanText) return;


    todo.text =
        cleanText;


    saveTodos(todos);


    loadTodos();
}


/* =====================================================
   DELETE TODO
===================================================== */

function deleteTodo(todoId) {

    const confirmed =
        confirm("Delete this task?");


    if (!confirmed) {
        return;
    }


    const todos =
        getTodos().filter(
            todo =>
                todo.id !== todoId
        );


    saveTodos(todos);


    loadTodos();
}


/* =====================================================
   MOOD
===================================================== */

function saveMood(moodName) {

    const moods =
        getMoods();


    moods.unshift({

        id:
            Date.now().toString(),

        mood:
            moodName,

        date:
            new Date().toISOString()
    });


    saveMoods(moods);


    loadMoods();
}


/* =====================================================
   LOAD MOODS
===================================================== */

function loadMoods() {

    const container =
        document.getElementById("moodHistory");


    if (!container) return;


    const moods =
        getMoods();


    if (moods.length === 0) {

        container.innerHTML = `

            <div class="empty-state">

                <i class="fa-solid fa-cloud-moon"></i>

                <h3>No moods recorded</h3>

                <p>Choose a mood above.</p>

            </div>

        `;


        return;
    }


    container.innerHTML = "";


    moods.forEach(item => {

        const row =
            document.createElement("div");


        row.className =
            "mood-history-item";


        row.innerHTML = `

            <div>

                <strong>
                    ${escapeHTML(item.mood)}
                </strong>

                <small>
                    ${formatDate(item.date)}
                </small>

            </div>


            <button
                class="todo-delete"
                title="Delete">

                <i class="fa-solid fa-trash"></i>

            </button>

        `;


        row.querySelector(
            ".todo-delete"
        ).onclick = () => {

            deleteMood(item.id);

        };


        container.appendChild(row);
    });
}


/* =====================================================
   DELETE MOOD
===================================================== */

function deleteMood(moodId) {

    const moods =
        getMoods().filter(
            mood =>
                mood.id !== moodId
        );


    saveMoods(moods);


    loadMoods();
}


/* =====================================================
   THEME
===================================================== */

function toggleTheme() {

    const isLight =
        document.body.classList.toggle(
            "light-mode"
        );


    localStorage.setItem(
        THEME_KEY,
        isLight ? "light" : "dark"
    );
}


/* =====================================================
   LOAD THEME
===================================================== */

function loadTheme() {

    const theme =
        localStorage.getItem(
            THEME_KEY
        );


    if (theme === "light") {

        document.body.classList.add(
            "light-mode"
        );

    } else {

        document.body.classList.remove(
            "light-mode"
        );
    }
}


/* =====================================================
   CLEAR ALL DATA
===================================================== */

function clearAllData() {

    const confirmed =
        confirm(
            "This will delete all your Obsidian entries, tasks and mood history. Continue?"
        );


    if (!confirmed) {
        return;
    }


    localStorage.removeItem(
        ENTRY_KEY
    );


    localStorage.removeItem(
        TODO_KEY
    );


    localStorage.removeItem(
        MOOD_KEY
    );


    alert("All data has been cleared.");


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
    ].forEach(section => {

        loadEntries(section);

    });
}


/* =====================================================
   DATE FORMAT
===================================================== */

function formatDate(dateString) {

    const date =
        new Date(dateString);


    if (Number.isNaN(date.getTime())) {
        return "";
    }


    return date.toLocaleDateString(
        undefined,
        {
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );
}


/* =====================================================
   SECURITY / HTML ESCAPE
===================================================== */

function escapeHTML(value) {

    const div =
        document.createElement("div");


    div.textContent =
        value ?? "";


    return div.innerHTML;
}


/* =====================================================
   CLOSE MODALS
===================================================== */

document.addEventListener(
    "click",
    event => {

        const editor =
            document.getElementById("editorModal");


        const view =
            document.getElementById("viewModal");


        if (event.target === editor) {
            closeEditor();
        }


        if (event.target === view) {
            closeView();
        }
    }
);


/* =====================================================
   KEYBOARD SHORTCUTS
===================================================== */

document.addEventListener(
    "keydown",
    event => {

        if (event.key === "Escape") {

            closeEditor();

            closeView();

            closeSidebar();
        }
    }
);


/* =====================================================
   TODO ENTER KEY
===================================================== */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.target &&
            event.target.id === "todoInput" &&
            event.key === "Enter"
        ) {

            addTodo();
        }
    }
);


/* =====================================================
   INITIALIZE APP
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadTheme();

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
        ].forEach(section => {

            loadEntries(section);

        });


        showSection("home");
    }
);
