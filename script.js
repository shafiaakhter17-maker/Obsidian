/* ============================================
   OBSIDIAN
   Complete App JavaScript
============================================ */


const ENTRY_KEY = "obsidian_entries";
const TODO_KEY = "obsidian_todos";
const MOOD_KEY = "obsidian_moods";
const THEME_KEY = "obsidian_theme";


let currentSection = "home";
let editingEntryId = null;
let editingEntrySection = null;


/* ============================================
   STORAGE HELPERS
============================================ */

function getData(key) {

    try {
        return JSON.parse(localStorage.getItem(key)) || [];
    } catch {
        return [];
    }

}


function saveData(key, data) {

    localStorage.setItem(
        key,
        JSON.stringify(data)
    );

}


/* ============================================
   NAVIGATION
============================================ */

function showSection(section) {

    const target =
        document.getElementById(section);

    if (!target) return;


    document.querySelectorAll(".page-section")
        .forEach(sectionElement => {

            sectionElement.style.display = "none";

        });


    target.style.display = "block";


    document.querySelectorAll(".nav-item")
        .forEach(item => {

            item.classList.remove("active");

            if (
                item.dataset.section === section
            ) {
                item.classList.add("active");
            }

        });


    currentSection = section;


    history.replaceState(
        null,
        "",
        "#" + section
    );


    closeSidebar();


    if (section !== "home" &&
        section !== "todo" &&
        section !== "mood" &&
        section !== "settings") {

        loadEntries(section);

    }


    if (section === "todo") {
        loadTodos();
    }

    if (section === "mood") {
        loadMoods();
    }

}


function handleNavigation() {

    const hash =
        location.hash.replace("#", "");


    const validSections = [
        "home",
        "journal",
        "todo",
        "notes",
        "hobbies",
        "mood",
        "bookshelf",
        "gratitude",
        "ideas",
        "planner",
        "settings"
    ];


    if (
        hash &&
        validSections.includes(hash)
    ) {

        showSection(hash);

    } else {

        showSection("home");

    }

}


/* ============================================
   SIDEBAR
============================================ */

const sidebar =
    document.getElementById("sidebar");

const overlay =
    document.getElementById("overlay");

const menuButton =
    document.getElementById("menuButton");


if (menuButton) {

    menuButton.addEventListener(
        "click",
        function () {

            sidebar.classList.toggle("open");
            overlay.classList.toggle("show");

        }
    );

}


if (overlay) {

    overlay.addEventListener(
        "click",
        closeSidebar
    );

}


function closeSidebar() {

    if (sidebar) {
        sidebar.classList.remove("open");
    }

    if (overlay) {
        overlay.classList.remove("show");
    }

}


/* ============================================
   NAV ITEMS
============================================ */

document.querySelectorAll(".nav-item")
    .forEach(item => {

        item.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                showSection(
                    item.dataset.section
                );

            }
        );

    });


document.querySelectorAll(".feature-card")
    .forEach(card => {

        card.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                showSection(
                    card.dataset.section
                );

            }
        );

    });


document.querySelectorAll(".back-button")
    .forEach(button => {

        button.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                showSection("home");

            }
        );

    });


window.addEventListener(
    "hashchange",
    handleNavigation
);


/* ============================================
   DATE
============================================ */

function updateDate() {

    const dateElement =
        document.getElementById("homeDate");

    if (!dateElement) return;


    const now = new Date();


    dateElement.textContent =
        now.toLocaleDateString(
            undefined,
            {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric"
            }
        );

}


/* ============================================
   EDITOR
============================================ */

function openEditor(section, entryId = null) {

    const modal =
        document.getElementById("editorModal");

    const title =
        document.getElementById("entryTitle");

    const content =
        document.getElementById("entryContent");

    const heading =
        document.getElementById("editorHeading");

    const label =
        document.getElementById("editorLabel");


    editingEntryId = entryId;
    editingEntrySection = section;


    if (entryId) {

        const entries =
            getData(ENTRY_KEY);

        const entry =
            entries.find(
                item => item.id === entryId
            );


        if (!entry) return;


        title.value = entry.title;
        content.value = entry.content;

        heading.textContent = "Edit entry";
        label.textContent = "EDIT ENTRY";

    } else {

        title.value = "";
        content.value = "";

        const names = {

            journal: "Journal",
            notes: "Note",
            hobbies: "Hobby",
            bookshelf: "Book",
            gratitude: "Gratitude",
            ideas: "Idea",
            planner: "Plan"

        };


        heading.textContent =
            "New " +
            (names[section] || "Entry");

        label.textContent = "NEW ENTRY";

    }


    modal.classList.add("show");

    setTimeout(
        () => title.focus(),
        100
    );

}


function closeEditor() {

    document
        .getElementById("editorModal")
        .classList.remove("show");

    editingEntryId = null;
    editingEntrySection = null;

}


/* ============================================
   PLUS BUTTONS
============================================ */

document.querySelectorAll("[data-add]")
    .forEach(button => {

        button.addEventListener(
            "click",
            function () {

                openEditor(
                    button.dataset.add
                );

            }
        );

    });


/* ============================================
   SAVE ENTRY
============================================ */

function saveEntry() {

    const titleInput =
        document.getElementById("entryTitle");

    const contentInput =
        document.getElementById("entryContent");


    const title =
        titleInput.value.trim();

    const content =
        contentInput.value.trim();


    if (!title && !content) {

        alert("Please write something first.");

        return;

    }


    const entries =
        getData(ENTRY_KEY);


    if (editingEntryId) {

        const entry =
            entries.find(
                item =>
                    item.id === editingEntryId
            );


        if (entry) {

            entry.title =
                title || "Untitled";

            entry.content =
                content;

            entry.updatedAt =
                new Date().toISOString();

        }

    } else {

        entries.unshift({

            id:
                Date.now().toString(),

            section:
                editingEntrySection,

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


    saveData(
        ENTRY_KEY,
        entries
    );


    const section =
        editingEntrySection;


    closeEditor();

    loadEntries(section);

}


/* ============================================
   LOAD ENTRIES
============================================ */

function loadEntries(section) {

    const container =
        document.getElementById(
            section + "Entries"
        );


    if (!container) return;


    const entries =
        getData(ENTRY_KEY)
            .filter(
                entry =>
                    entry.section === section
            );


    if (entries.length === 0) {

        const names = {

            journal: "journal entry",
            notes: "note",
            hobbies: "hobby",
            bookshelf: "book",
            gratitude: "gratitude entry",
            ideas: "idea",
            planner: "plan"

        };


        container.innerHTML = `

            <div class="empty">

                <div class="empty-icon">♡</div>

                <h3>No ${names[section] || "entries"} yet</h3>

                <p>
                    Tap + to write your first one.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML = "";


    entries.forEach(
        (entry, index) => {

            const card =
                document.createElement("article");

            card.className =
                "entry-card";


            const number =
                document.createElement("div");

            number.className =
                "entry-number";

            number.textContent =
                index + 1;


            const main =
                document.createElement("div");

            main.className =
                "entry-main";


            const open =
                document.createElement("button");

            open.className =
                "entry-open-button";


            const heading =
                document.createElement("h3");

            heading.textContent =
                entry.title;


            const date =
                document.createElement("div");

            date.className =
                "entry-date";

            date.textContent =
                formatDate(entry.createdAt);


            const preview =
                document.createElement("p");

            preview.className =
                "entry-preview";

            preview.textContent =
                entry.content ||
                "No text";


            open.appendChild(heading);
            open.appendChild(date);
            open.appendChild(preview);


            open.addEventListener(
                "click",
                () => openEntry(entry.id)
            );


            main.appendChild(open);


            const actions =
                document.createElement("div");

            actions.className =
                "entry-actions";


            const edit =
                document.createElement("button");

            edit.innerHTML =
                '<i class="fa-solid fa-pen"></i>';

            edit.title =
                "Edit";


            edit.addEventListener(
                "click",
                () => {

                    openEditor(
                        section,
                        entry.id
                    );

                }
            );


            const deleteButton =
                document.createElement("button");

            deleteButton.className =
                "delete-button";

            deleteButton.innerHTML =
                '<i class="fa-solid fa-trash"></i>';

            deleteButton.title =
                "Delete";


            deleteButton.addEventListener(
                "click",
                () => {

                    deleteEntry(
                        entry.id,
                        section
                    );

                }
            );


            actions.appendChild(edit);
            actions.appendChild(deleteButton);


            const arrow =
                document.createElement("div");

            arrow.className =
                "entry-arrow";

            arrow.textContent =
                "→";


            card.appendChild(number);
            card.appendChild(main);
            card.appendChild(actions);


            main.appendChild(arrow);


            container.appendChild(card);

        }
    );

}


/* ============================================
   OPEN ENTRY
============================================ */

function openEntry(id) {

    const entries =
        getData(ENTRY_KEY);


    const entry =
        entries.find(
            item => item.id === id
        );


    if (!entry) return;


    document
        .getElementById("viewTitle")
        .textContent =
        entry.title;


    document
        .getElementById("viewDate")
        .textContent =
        formatDate(entry.createdAt);


    document
        .getElementById("viewContent")
        .innerHTML =
        escapeHTML(entry.content)
            .replace(/\n/g, "<br><br>");


    document
        .getElementById("viewModal")
        .classList.add("show");


    document
        .getElementById("viewEdit")
        .onclick =
        function () {

            closeView();

            openEditor(
                entry.section,
                entry.id
            );

        };


    document
        .getElementById("viewDelete")
        .onclick =
        function () {

            closeView();

            deleteEntry(
                entry.id,
                entry.section
            );

        };

}


function closeView() {

    document
        .getElementById("viewModal")
        .classList.remove("show");

}


/* ============================================
   DELETE ENTRY
============================================ */

function deleteEntry(id, section) {

    const entries =
        getData(ENTRY_KEY);


    const entry =
        entries.find(
            item => item.id === id
        );


    if (!entry) return;


    if (
        !confirm(
            `Delete "${entry.title}"?`
        )
    ) {
        return;
    }


    const updated =
        entries.filter(
            item => item.id !== id
        );


    saveData(
        ENTRY_KEY,
        updated
    );


    loadEntries(section);

}


/* ============================================
   TODO
============================================ */

function addTodo() {

    const input =
        document.getElementById("todoInput");


    const text =
        input.value.trim();


    if (!text) return;


    const todos =
        getData(TODO_KEY);


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


    saveData(
        TODO_KEY,
        todos
    );


    input.value = "";

    loadTodos();

}


document
    .getElementById("addTodoButton")
    .addEventListener(
        "click",
        addTodo
    );


document
    .getElementById("todoInput")
    .addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Enter") {
                addTodo();
            }

        }
    );


function loadTodos() {

    const container =
        document.getElementById("todoList");


    const todos =
        getData(TODO_KEY);


    if (todos.length === 0) {

        container.innerHTML = `

            <div class="empty">

                <div class="empty-icon">✓</div>

                <h3>No tasks yet</h3>

                <p>Add something you want to accomplish.</p>

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


        const check =
            document.createElement("button");

        check.className =
            "todo-check";

        check.innerHTML =
            todo.completed
                ? "✓"
                : "";


        check.onclick =
            function () {

                todo.completed =
                    !todo.completed;

                saveData(
                    TODO_KEY,
                    todos
                );

                loadTodos();

            };


        const text =
            document.createElement("span");

        text.className =
            "todo-text";

        text.textContent =
            todo.text;


        const actions =
            document.createElement("div");

        actions.className =
            "todo-actions";


        const edit =
            document.createElement("button");

        edit.innerHTML =
            '<i class="fa-solid fa-pen"></i>';

        edit.onclick =
            function () {

                const newText =
                    prompt(
                        "Edit task:",
                        todo.text
                    );


                if (
                    newText !== null &&
                    newText.trim()
                ) {

                    todo.text =
                        newText.trim();

                    saveData(
                        TODO_KEY,
                        todos
                    );

                    loadTodos();

                }

            };


        const remove =
            document.createElement("button");

        remove.innerHTML =
            '<i class="fa-solid fa-trash"></i>';

        remove.onclick =
            function () {

                if (
                    !confirm(
                        "Delete this task?"
                    )
                ) return;


                const updated =
                    todos.filter(
                        item =>
                            item.id !== todo.id
                    );


                saveData(
                    TODO_KEY,
                    updated
                );

                loadTodos();

            };


        actions.appendChild(edit);
        actions.appendChild(remove);


        item.appendChild(check);
        item.appendChild(text);
        item.appendChild(actions);


        container.appendChild(item);

    });

}


document
    .getElementById("todoPlus")
    .addEventListener(
        "click",
        function () {

            document
                .getElementById("todoInput")
                .focus();

        }
    );


/* ============================================
   MOOD
============================================ */

document
    .querySelectorAll("[data-mood]")
    .forEach(button => {

        button.addEventListener(
            "click",
            function () {

                saveMood(
                    button.dataset.mood
                );

            }
        );

    });


function saveMood(mood) {

    const moods =
        getData(MOOD_KEY);


    moods.unshift({

        id:
            Date.now().toString(),

        mood:
            mood,

        createdAt:
            new Date().toISOString()

    });


    saveData(
        MOOD_KEY,
        moods
    );


    loadMoods();

}


function loadMoods() {

    const container =
        document.getElementById("moodHistory");


    const moods =
        getData(MOOD_KEY);


    if (moods.length === 0) {

        container.innerHTML = `

            <div class="empty">

                <div class="empty-icon">♡</div>

                <h3>No moods recorded</h3>

                <p>Choose a mood above.</p>

            </div>

        `;

        return;

    }


    container.innerHTML = "";


    moods.forEach(mood => {

        const row =
            document.createElement("div");
row.className =
            "mood-row";


        const info =
            document.createElement("div");


        const title =
            document.createElement("strong");

        title.textContent =
            mood.mood;


        const date =
            document.createElement("small");

        date.textContent =
            formatDate(mood.createdAt);


        info.appendChild(title);
        info.appendChild(date);


        const actions =
            document.createElement("div");

        actions.className =
            "mood-actions";


        const edit =
            document.createElement("button");

        edit.innerHTML =
            '<i class="fa-solid fa-pen"></i>';


        edit.onclick =
            function () {

                const newMood =
                    prompt(
                        "Edit mood:",
                        mood.mood
                    );


                if (
                    newMood !== null &&
                    newMood.trim()
                ) {

                    mood.mood =
                        newMood.trim();

                    saveData(
                        MOOD_KEY,
                        moods
                    );

                    loadMoods();

                }

            };


        const remove =
            document.createElement("button");

        remove.innerHTML =
            '<i class="fa-solid fa-trash"></i>';


        remove.onclick =
            function () {

                if (
                    !confirm(
                        "Delete this mood?"
                    )
                ) return;


                const updated =
                    moods.filter(
                        item =>
                            item.id !== mood.id
                    );


                saveData(
                    MOOD_KEY,
                    updated
                );

                loadMoods();

            };


        actions.appendChild(edit);
        actions.appendChild(remove);


        row.appendChild(info);
        row.appendChild(actions);


        container.appendChild(row);

    });

}


/* ============================================
   SETTINGS / THEME
============================================ */

const themeButton =
    document.getElementById("themeButton");


function loadTheme() {

    const theme =
        localStorage.getItem(
            THEME_KEY
        );


    if (theme === "light") {
        document.body.classList.add("light");
    }

}


function toggleTheme() {

    document.body.classList.toggle("light");


    const theme =
        document.body.classList.contains("light")
            ? "light"
            : "dark";


    localStorage.setItem(
        THEME_KEY,
        theme
    );

}


themeButton.addEventListener(
    "click",
    toggleTheme
);


/* ============================================
   CLEAR DATA
============================================ */

document
    .getElementById("clearButton")
    .addEventListener(
        "click",
        function () {

            if (
                !confirm(
                    "Delete all saved data?"
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
            ].forEach(
                loadEntries
            );

        }
    );


/* ============================================
   MODAL BUTTONS
============================================ */

document
    .getElementById("closeEditor")
    .addEventListener(
        "click",
        closeEditor
    );


document
    .getElementById("cancelEditor")
    .addEventListener(
        "click",
        closeEditor
    );


document
    .getElementById("saveEntry")
    .addEventListener(
        "click",
        saveEntry
    );


document
    .getElementById("closeView")
    .addEventListener(
        "click",
        closeView
    );


document
    .getElementById("editorModal")
    .addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                document.getElementById("editorModal")
            ) {
                closeEditor();
            }

        }
    );


document
    .getElementById("viewModal")
    .addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                document.getElementById("viewModal")
            ) {
                closeView();
            }

        }
    );


document.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Escape") {

            closeEditor();
            closeView();
            closeSidebar();

        }

    }
);


/* ============================================
   HELPERS
============================================ */

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


function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text || "";

    return div.innerHTML;

}


/* ============================================
   START APP
============================================ */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        updateDate();

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
        ].forEach(
            loadEntries
        );


        handleNavigation();


        /* Register PWA service worker */

        if ("serviceWorker" in navigator) {

            navigator.serviceWorker
                .register("./sw.js")
                .catch(
                    error =>
                        console.log(
                            "Service worker:",
                            error
                        )
                );

        }

    }
);
        
