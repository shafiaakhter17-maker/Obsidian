/* =====================================================
   OBSIDIAN — MAIN JAVASCRIPT
===================================================== */

"use strict";


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
   STORAGE HELPERS
===================================================== */

function getEntries() {
    try {
        return JSON.parse(
            localStorage.getItem(ENTRY_KEY)
        ) || {};
    } catch {
        return {};
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
        return JSON.parse(
            localStorage.getItem(TODO_KEY)
        ) || [];
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
        return JSON.parse(
            localStorage.getItem(MOOD_KEY)
        ) || [];
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
   NAVIGATION
===================================================== */

function showSection(section) {

    const target =
        document.getElementById(section);

    if (!target) {
        console.error(
            "Section not found:",
            section
        );
        return;
    }


    currentSection = section;


    /* Hide every section */

    document
        .querySelectorAll(".page-section")
        .forEach(function(page) {

            page.classList.remove("active");

        });


    /* Show selected section */

    target.classList.add("active");


    /* Update navigation */

    document
        .querySelectorAll(".nav-item")
        .forEach(function(button) {

            button.classList.remove("active");

        });


    const activeButton =
        document.querySelector(
            '.nav-item[data-section="' +
            section +
            '"]'
        );


    if (activeButton) {
        activeButton.classList.add("active");
    }


    /* Update heading */

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


    const title =
        document.getElementById("page-title");


    if (title) {
        title.textContent =
            names[section] || "Obsidian";
    }


    /* Close mobile sidebar */

    closeSidebar();


    /* Refresh section data */

    if (
        section === "journal" ||
        section === "notes" ||
        section === "hobbies" ||
        section === "bookshelf" ||
        section === "gratitude" ||
        section === "ideas" ||
        section === "planner"
    ) {
        loadEntries(section);
    }


    if (section === "todo") {
        loadTodos();
    }


    if (section === "mood") {
        loadMoods();
    }
}


/* =====================================================
   MOBILE SIDEBAR
===================================================== */

function toggleSidebar() {

    const sidebar =
        document.querySelector(".sidebar");

    if (sidebar) {
        sidebar.classList.toggle("open");
    }
}


function closeSidebar() {

    const sidebar =
        document.querySelector(".sidebar");

    if (sidebar) {
        sidebar.classList.remove("open");
    }
}


/* =====================================================
   EDITOR
===================================================== */

function openEditor(section, id = null) {

    const modal =
        document.getElementById("editor-modal");

    const titleInput =
        document.getElementById("entry-title");

    const contentInput =
        document.getElementById("entry-content");


    if (
        !modal ||
        !titleInput ||
        !contentInput
    ) {
        console.error(
            "Editor elements are missing."
        );

        return;
    }


    editingSection = section;
    editingEntryId = id;


    /* Empty by default */

    titleInput.value = "";
    contentInput.value = "";


    /* Editing an existing entry */

    if (id !== null) {

        const entries = getEntries();

        const list =
            entries[section] || [];


        const entry =
            list.find(function(item) {

                return item.id === id;

            });


        if (entry) {

            titleInput.value =
                entry.title || "";

            contentInput.value =
                entry.content || "";
        }
    }


    modal.classList.add("show");


    setTimeout(function() {

        titleInput.focus();

    }, 100);
}


function closeEditor() {

    const modal =
        document.getElementById("editor-modal");

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
        document.getElementById("entry-title");

    const contentInput =
        document.getElementById("entry-content");


    if (
        !titleInput ||
        !contentInput
    ) {
        return;
    }


    const title =
        titleInput.value.trim();

    const content =
        contentInput.value.trim();


    if (!title && !content) {

        alert(
            "Write something first."
        );

        return;
    }


    const entries =
        getEntries();


    if (!entries[editingSection]) {

        entries[editingSection] = [];

    }


    /* EDIT */

    if (editingEntryId !== null) {

        const index =
            entries[editingSection]
                .findIndex(function(item) {

                    return (
                        item.id ===
                        editingEntryId
                    );

                });


        if (index !== -1) {

            entries[editingSection][index]
                .title =
                title || "Untitled";


            entries[editingSection][index]
                .content =
                content;


            entries[editingSection][index]
                .updated =
                new Date().toISOString();
        }

    }


    /* NEW */

    else {

        entries[editingSection].unshift({

            id: Date.now(),

            title:
                title || "Untitled",

            content:
                content,

            date:
                new Date().toISOString(),

            updated:
                new Date().toISOString()

        });

    }


    saveEntries(entries);


    const sectionToReload =
        editingSection;


    closeEditor();


    loadEntries(sectionToReload);
}


/* =====================================================
   LOAD ENTRIES
===================================================== */

function loadEntries(section) {

    const sectionElement =
        document.getElementById(section);


    if (!sectionElement) {
        return;
    }


    const container =
        sectionElement.querySelector(
            ".entries-list"
        );


    if (!container) {
        return;
    }


    const entries =
        getEntries();


    const list =
        entries[section] || [];


    container.innerHTML = "";


    /* Empty */

    if (list.length === 0) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    ✦
                </div>

                <h3>
                    Nothing here yet
                </h3>

                <p>
                    Start writing something beautiful.
                </p>

            </div>

        `;

        return;
    }


    /* Entries */

    list.forEach(function(entry) {

        const card =
            document.createElement("div");


        card.className =
            "entry-card";


        const main =
            document.createElement("button");


        main.className =
            "entry-main";


        main.type =
            "button";


        main.innerHTML = `

            <div class="entry-title">
                ${escapeHTML(
                    entry.title || "Untitled"
                )}
            </div>

            <div class="entry-preview">
                ${escapeHTML(
                    (entry.content || "")
                        .substring(0, 150)
                )}
            </div>

            <small>
                ${formatDate(entry.date)}
            </small>

        `;


        main.addEventListener(
            "click",
            function() {

                openEntry(
                    section,
                    entry.id
                );

            }
        );


        const actions =
            document.createElement("div");


        actions.className =
            "entry-actions";


        const editButton =
            document.createElement("button");


        editButton.type =
            "button";

        editButton.className =
            "edit-btn";

        editButton.textContent =
            "✎";

        editButton.title =
            "Edit";


        editButton.addEventListener(
            "click",
            function(event) {

                event.stopPropagation();

                editEntry(
                    section,
                    entry.id
                );

            }
        );


        const deleteButton =
            document.createElement("button");


        deleteButton.type =
            "button";

        deleteButton.className =
            "delete-btn";

        deleteButton.textContent =
            "×";

        deleteButton.title =
            "Delete";


        deleteButton.addEventListener(
            "click",
            function(event) {

                event.stopPropagation();

                deleteEntry(
                    section,
                    entry.id
                );

            }
        );


        actions.appendChild(editButton);
        actions.appendChild(deleteButton);


        card.appendChild(main);
        card.appendChild(actions);


        container.appendChild(card);

    });
}


/* =====================================================
   OPEN SAVED ENTRY
===================================================== */

function openEntry(section, id) {

    const entries =
        getEntries();


    const list =
        entries[section] || [];


    const entry =
        list.find(function(item) {

            return item.id === id;

        });


    if (!entry) {
        return;
    }


    const modal =
        document.getElementById("view-modal");


    const title =
        document.getElementById("view-title");


    const content =
        document.getElementById("view-content");


    if (
        !modal ||
        !title ||
        !content
    ) {
        return;
    }


    title.textContent =
        entry.title || "Untitled";


    content.textContent =
        entry.content || "";


    const editButton =
        document.getElementById(
            "view-edit"
        );


    const deleteButton =
        document.getElementById(
            "view-delete"
        );


    if (editButton) {

        editButton.onclick =
            function() {

                closeView();

                openEditor(
                    section,
                    id
                );

            };
    }


    if (deleteButton) {

        deleteButton.onclick =
            function() {

                closeView();

                deleteEntry(
                    section,
                    id
                );

            };
    }


    modal.classList.add("show");
}


function closeView() {

    const modal =
        document.getElementById(
            "view-modal"
        );


    if (modal) {
        modal.classList.remove("show");
    }
}


/* =====================================================
   EDIT / DELETE ENTRY
===================================================== */

function editEntry(section, id) {

    openEditor(
        section,
        id
    );
}


function deleteEntry(section, id) {

    const entries =
        getEntries();


    if (!entries[section]) {
        return;
    }


    if (
        !confirm(
            "Delete this entry?"
        )
    ) {
        return;
    }


    entries[section] =
        entries[section].filter(
            function(item) {

                return item.id !== id;

            }
        );


    saveEntries(entries);


    loadEntries(section);
}


/* =====================================================
   TODO LIST
===================================================== */

function addTodo() {

    const input =
        document.getElementById(
            "todo-input"
        );


    if (!input) {
        return;
    }


    const text =
        input.value.trim();


    if (!text) {
        return;
    }


    const todos =
        getTodos();


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
        document.getElementById(
            "todo-list"
        );


    if (!container) {
        return;
    }


    const todos =
        getTodos();


    container.innerHTML = "";


    if (todos.length === 0) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    ✓
                </div>

                <h3>
                    No tasks yet
                </h3>

                <p>
                    Add something you need to do.
                </p>

            </div>

        `;

        return;
    }


    todos.forEach(function(todo) {

        const item =
            document.createElement("div");


        item.className =
            "todo-item";


        if (todo.completed) {
            item.classList.add(
                "completed"
            );
        }


        const check =
            document.createElement("button");


        check.type =
            "button";

        check.className =
            "todo-check";

        check.textContent =
            todo.completed ? "✓" : "";


        check.addEventListener(
            "click",
            function() {

                toggleTodo(todo.id);

            }
        );


        const text =
            document.createElement("span");


        text.className =
            "todo-text";

        text.textContent =
            todo.text;


        const edit =
            document.createElement("button");


        edit.type =
            "button";

        edit.className =
            "todo-edit";

        edit.textContent =
            "✎";


        edit.addEventListener(
            "click",
            function() {

                editTodo(todo.id);

            }
        );


        const remove =
            document.createElement("button");


        remove.type =
            "button";

        remove.className =
            "todo-delete";

        remove.textContent =
            "×";


        remove.addEventListener(
            "click",
            function() {

                deleteTodo(todo.id);

            }
        );


        item.appendChild(check);
        item.appendChild(text);
        item.appendChild(edit);
        item.appendChild(remove);


        container.appendChild(item);

    });
}


function toggleTodo(id) {

    const todos =
        getTodos();


    const todo =
        todos.find(function(item) {

            return item.id === id;

        });


    if (!todo) {
        return;
    }


    todo.completed =
        !todo.completed;


    saveTodos(todos);


    loadTodos();
}


function editTodo(id) {

    const todos =
        getTodos();


    const todo =
        todos.find(function(item) {

            return item.id === id;

        });


    if (!todo) {
        return;
    }


    const newText =
        prompt(
            "Edit task:",
            todo.text
        );


    if (newText === null) {
        return;
    }


    const clean =
        newText.trim();


    if (!clean) {
        return;
    }


    todo.text =
        clean;


    saveTodos(todos);


    loadTodos();
}


function deleteTodo(id) {

    if (
        !confirm(
            "Delete this task?"
        )
    ) {
        return;
    }


    const todos =
        getTodos();


    saveTodos(
        todos.filter(
            function(item) {

                return item.id !== id;

            }
        )
    );


    loadTodos();
}


/* =====================================================
   MOOD
===================================================== */

function saveMood(mood) {

    const moods =
        getMoods();


    moods.unshift({

        id: Date.now(),

        mood: mood,

        date:
            new Date().toISOString()

    });


    saveMoods(moods);


    loadMoods();
}


function loadMoods() {

    const container =
        document.getElementById(
            "mood-history"
        );


    if (!container) {
        return;
    }


    const moods =
        getMoods();


    container.innerHTML = "";


    if (moods.length === 0) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    ☾
                </div>

                <h3>
                    No mood entries yet
                </h3>

                <p>
                    Choose a mood above.
                </p>

            </div>

        `;

        return;
    }


    moods.forEach(function(item) {

        const row =
            document.createElement("div");


        row.className =
            "mood-history-item";


        const mood =
            document.createElement("span");


        mood.textContent =
            item.mood;


        const date =
            document.createElement("small");


        date.textContent =
            formatDate(item.date);


        const remove =
            document.createElement("button");


        remove.type =
            "button";

        remove.textContent =
            "×";


        remove.addEventListener(
            "click",
            function() {

                deleteMood(item.id);

            }
        );


        row.appendChild(mood);
        row.appendChild(date);
        row.appendChild(remove);


        container.appendChild(row);

    });
}


function deleteMood(id) {

    if (
        !confirm(
            "Delete this mood entry?"
        )
    ) {
        return;
    }


    const moods =
        getMoods();


    saveMoods(
        moods.filter(
            function(item) {

                return item.id !== id;

            }
        )
    );


    loadMoods();
}


/* =====================================================
   THEME
===================================================== */

function toggleTheme() {

    document.body.classList.toggle(
        "light-mode"
    );


    const light =
        document.body.classList.contains(
            "light-mode"
       );

    }
}


/* =====================================================
   CLEAR EVERYTHING
===================================================== */

function clearAllData() {

    if (
        !confirm(
            "Delete all your Obsidian data?"
        )
    ) {
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


    location.reload();
}


/* =====================================================
   DATE
===================================================== */

function showTodayDate() {

    const element =
        document.getElementById(
            "today-date"
        );


    if (!element) {
        return;
    }


    const today =
        new Date();


    element.textContent =
        today.toLocaleDateString(
            undefined,
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );
}


function formatDate(dateString) {

    if (!dateString) {
        return "";
    }


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


/* =====================================================
   SAFE TEXT
===================================================== */

function escapeHTML(text) {

    const div =
        document.createElement("div");


    div.textContent =
        text || "";


    return div.innerHTML;
}


/* =====================================================
   MODAL CLICK OUTSIDE
===================================================== */

window.addEventListener(
    "click",
    function(event) {

        const editor =
            document.getElementById(
                "editor-modal"
            );


        const viewer =
            document.getElementById(
                "view-modal"
            );


        if (
            editor &&
            event.target === editor
        ) {
            closeEditor();
        }


        if (
            viewer &&
            event.target === viewer
        ) {
            closeView();
        }

    }
);


/* =====================================================
   ESCAPE KEY
===================================================== */

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Escape"
        ) {

            closeEditor();

            closeView();

        }

    }
);


/* =====================================================
   START APP
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        loadTheme();

        showTodayDate();

        loadTodos();

        loadMoods();


        const sections = [

            "journal",
            "notes",
            "hobbies",
            "bookshelf",
            "gratitude",
            "ideas",
            "planner"

        ];


        sections.forEach(
            function(section) {

                loadEntries(section);

            }
        );


        showSection("home");

    }
);
