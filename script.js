let currentSection = "home";

let editingSection = "";
let editingEntryId = null;

let entries = JSON.parse(
    localStorage.getItem("myLittleNotesEntries")
) || [];

let todos = JSON.parse(
    localStorage.getItem("myLittleNotesTodos")
) || [];

let moods = JSON.parse(
    localStorage.getItem("myLittleNotesMoods")
) || [];

let viewingEntryId = null;
let viewingSection = null;


/* =========================
   SECTION NAMES
========================= */

const sectionNames = {
    journal: "Journal",
    notes: "Notes",
    hobbies: "Hobbies",
    bookshelf: "Bookshelf",
    gratitude: "Gratitude",
    ideas: "Ideas",
    planner: "Planner"
};


/* =========================
   NAVIGATION
========================= */

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

    if (sectionName === "mood") {
        loadMoods();
    }

    if (window.innerWidth <= 850) {
        document
            .getElementById("sidebar")
            ?.classList.remove("sidebar-open");
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


/* =========================
   DATE
========================= */

function showTodayDate() {

    const dateElement =
        document.getElementById("todayDate");

    if (!dateElement) return;

    const today = new Date();

    dateElement.textContent =
        today.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric"
        });
}


function formatDate(dateString) {

    const date = new Date(dateString);

    return date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}


/* =========================
   WRITING EDITOR
========================= */

function openEditor(sectionName, entryId = null) {

    editingSection = sectionName;
    editingEntryId = entryId;

    const modal =
        document.getElementById("editorModal");

    const title =
        document.getElementById("entryTitle");

    const content =
        document.getElementById("entryContent");

    if (!modal || !title || !content) return;


    /* EDIT */

    if (entryId !== null) {

        const entry = entries.find(
            item =>
                item.id === entryId &&
                item.section === sectionName
        );

        if (!entry) return;

        title.value = entry.title;
        content.value = entry.content;

        const heading =
            modal.querySelector(".modal-title");

        if (heading) {
            heading.textContent = "Edit Entry";
        }
    }


    /* NEW */

    else {

        title.value = "";
        content.value = "";

        const heading =
            modal.querySelector(".modal-title");

        if (heading) {
            heading.textContent = "New Entry";
        }
    }


    modal.classList.add("show");

    setTimeout(() => {
        title.focus();
    }, 100);
}


function closeEditor() {

    const modal =
        document.getElementById("editorModal");

    if (modal) {
        modal.classList.remove("show");
    }

    editingSection = "";
    editingEntryId = null;
}


/* =========================
   SAVE / UPDATE WRITING
========================= */

function saveEntry() {

    const titleInput =
        document.getElementById("entryTitle");

    const contentInput =
        document.getElementById("entryContent");

    if (!titleInput || !contentInput) return;

    const title =
        titleInput.value.trim();

    const content =
        contentInput.value.trim();


    if (!content) {

        alert("Write something before saving ♡");

        contentInput.focus();

        return;
    }


    /* UPDATE */

    if (editingEntryId !== null) {

        const entry = entries.find(
            item =>
                item.id === editingEntryId &&
                item.section === editingSection
        );

        if (entry) {

            entry.title =
                title || "Untitled";

            entry.content =
                content;

            localStorage.setItem(
                "myLittleNotesEntries",
                JSON.stringify(entries)
            );
        }
    }


    /* CREATE */

    else {

        entries.unshift({

            id: Date.now(),

            section: editingSection,

            title:
                title || "Untitled",

            content:
                content,

            date:
                new Date().toISOString()
        });

        localStorage.setItem(
            "myLittleNotesEntries",
            JSON.stringify(entries)
        );
    }


    const section =
        editingSection;

    closeEditor();

    loadEntries(section);

    showSection(section);
}


/* =========================
   LOAD ALL WRITING
========================= */

function loadAllEntries() {

    Object.keys(sectionNames).forEach(section => {
        loadEntries(section);
    });
}


/* =========================
   LOAD WRITING SECTION
========================= */

function loadEntries(sectionName) {

    const container =
        document.getElementById(
            `${sectionName}Entries`
        );

    if (!container) return;

    container.innerHTML = "";


    const sectionEntries =
        entries.filter(
            entry =>
                entry.section === sectionName
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

        const card =
            document.createElement("div");

        card.className =
            "entry-card";


        const preview =
            entry.content.length > 150
                ? entry.content.substring(0, 150) + "..."
                : entry.content;


        card.innerHTML = `

            <button
                class="entry-main"
                type="button"
            >

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

            </button>

            <div class="entry-actions">

                <button
                    type="button"
                    class="entry-edit-button"
                    onclick="editEntry('${sectionName}', ${entry.id})"
                >
                    ✎ Edit
                </button>

                <button
                    type="button"
                    class="entry-delete-button"
                    onclick="deleteEntry('${sectionName}', ${entry.id})"
                >
                    × Delete
                </button>

            </div>
        `;


        const mainButton =
            card.querySelector(".entry-main");

        mainButton.onclick = function () {

            openEntry(
                sectionName,
                entry.id
            );
        };


        container.appendChild(card);
    });
}


/* =========================
   EDIT ENTRY
========================= */

function editEntry(sectionName, entryId) {

    openEditor(
        sectionName,
        entryId
    );
}


/* =========================
   DELETE ENTRY
========================= */

function deleteEntry(sectionName, entryId) {

    const entry =
        entries.find(
            item =>
                item.id === entryId &&
                item.section === sectionName
        );

    if (!entry) return;


    const confirmed =
        confirm(
            `Delete "${entry.title}" permanently?`
        );


    if (!confirmed) return;


    entries =
        entries.filter(
            item =>
                !(
                    item.id === entryId &&
                    item.section === sectionName
                )
        );


    localStorage.setItem(
        "myLittleNotesEntries",
        JSON.stringify(entries)
    );


    loadEntries(sectionName);


    if (currentSection === "home") {
        loadAllEntries();
    }
}


/* =========================
   VIEW ENTRY
========================= */

function openEntry(sectionName, entryId) {

    const entry =
        entries.find(
            item =>
                item.id === entryId &&
                item.section === sectionName
        );

    if (!entry) return;


    viewingEntryId =
        entryId;

    viewingSection =
        sectionName;


    const modal =
        document.getElementById(
            "viewModal"
        );

    const title =
        document.getElementById(
            "viewTitle"
        );

    const content =
        document.getElementById(
            "viewContent"
        );

    const date =
        document.getElementById(
            "viewDate"
        );


    if (
        !modal ||
        !title ||
        !content ||
        !date
    ) return;


    title.textContent =
        entry.title;

    date.textContent =
        formatDate(entry.date);


    content.innerHTML =
        escapeHTML(entry.content)
            .split("\n")
            .map(
                paragraph =>
                    `<p>${paragraph}</p>`
            )
            .join("");


    addViewButtons();

    modal.classList.add("show");
}


/* =========================
   VIEW BUTTONS
========================= */

function addViewButtons() {

    const content =
        document.getElementById(
            "viewContent"
        );

    if (!content) return;


    let actions =
        document.getElementById(
            "viewEntryActions"
        );


    if (!actions) {

        actions =
            document.createElement("div");

        actions.id =
            "viewEntryActions";

        actions.style.cssText = `
            display:flex;
            gap:10px;
            margin-top:25px;
        `;


        const editButton =
            document.createElement("button");

        editButton.type =
            "button";

        editButton.textContent =
            "✎ Edit";

        editButton.style.cssText = `
            flex:1;
            padding:13px;
            border:none;
            border-radius:12px;
            background:#242424;
            color:white;
            cursor:pointer;
            font-size:14px;
        `;


        editButton.onclick =
            function () {

                const section =
                    viewingSection;

                const id =
                    viewingEntryId;

                closeView();

                openEditor(
                    section,
                    id
                );
            };


        const deleteButton =
            document.createElement("button");

        deleteButton.type =
            "button";

        deleteButton.textContent =
            "× Delete";

        deleteButton.style.cssText = `
            flex:1;
            padding:13px;
            border:none;
            border-radius:12px;
            background:#242424;
            color:white;
            cursor:pointer;
            font-size:14px;
        `;


        deleteButton.onclick =
            function () {

                if (
                    viewingEntryId === null ||
                    viewingSection === null
                ) return;


                const section =
                    viewingSection;

                const id =
                    viewingEntryId;


                closeView();

                deleteEntry(
                    section,
                    id
                );
            };


        actions.appendChild(
            editButton
        );

        actions.appendChild(
            deleteButton
        );


        content.parentElement.appendChild(
            actions
        );
    }
}


/* =========================
   CLOSE ENTRY
========================= */

function closeView() {

    const modal =
        document.getElementById(
            "viewModal"
        );

    if (modal) {
        modal.classList.remove("show");
    }

    viewingEntryId = null;
    viewingSection = null;
}


/* =========================
   TO-DO LIST
========================= */

function addTodo() {

    const input =
        document.getElementById(
            "todoInput"
        );

    if (input) {
        input.focus();
    }
}


function addTodoFromInput() {

    const input =
        document.getElementById(
            "todoInput"
        );

    if (!input) return;


    const text =
        input.value.trim();


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

    const list =
        document.getElementById(
            "todoList"
        );

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

        const item =
            document.createElement("div");

        item.className =
            "todo-item";


        if (todo.completed) {
            item.classList.add(
                "completed"
            );
        }


        item.innerHTML = `

            <button
                class="todo-check"
                onclick="toggleTodo(${todo.id})"
            >
                ${todo.completed ? "✓" : ""}
            </button>

            <span class="todo-text">
                ${escapeHTML(todo.text)}
            </span>

            <button
                class="todo-edit"
                onclick="editTodo(${todo.id})"
            >
                ✎
            </button>

            <button
                class="todo-delete"
                onclick="deleteTodo(${todo.id})"
            >
                ×
            </button>
        `;


        list.appendChild(item);
    });
}


function toggleTodo(id) {

    const todo =
        todos.find(
            item =>
                item.id === id
        );

    if (!todo) return;


    todo.completed =
        !todo.completed;


    saveTodos();

    loadTodos();
}


function editTodo(id) {

    const todo =
        todos.find(
            item =>
                item.id === id
        );

    if (!todo) return;


    const newText =
        prompt(
            "Edit your task:",
            todo.text
        );


    if (newText === null) return;


    const cleaned =
        newText.trim();


    if (!cleaned) return;


    todo.text =
        cleaned;


    saveTodos();

    loadTodos();
}


function deleteTodo(id) {

    const confirmed =
        confirm(
            "Delete this task?"
        );


    if (!confirmed) return;


    todos =
        todos.filter(
            item =>
                item.id !== id
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

        id: Date.now(),

        mood: mood,

        date:
            new Date().toISOString()
    });


    localStorage.setItem(
        "myLittleNotesMoods",
        JSON.stringify(moods)
    );


    loadMoods();
}


/* =========================
   LOAD MOODS
========================= */

function loadMoods() {

    const history =
        document.getElementById(
            "moodHistory"
        );

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


    moods.slice(0, 10)
        .forEach(item => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "mood-history-item";


            row.innerHTML = `

                <div class="mood-history-main">

                    <span>
                        ${escapeHTML(item.mood)}
                    </span>

                    <small>
                        ${formatDate(item.date)}
                    </small>

                </div>

                <div class="mood-actions">

                    <button
                        type="button"
                        onclick="editMood(${item.id})"
                    >
                        ✎
                    </button>

                    <button
                        type="button"
                        onclick="deleteMood(${item.id})"
                    >
                        ×
                    </button>

                </div>
            `;


            history.appendChild(row);
        });
}


/* =========================
   EDIT MOOD
========================= */

function editMood(id) {

    const mood =
        moods.find(
            item =>
                item.id === id
        );

    if (!mood) return;


    const newMood =
        prompt(
            "Edit your mood:",
            mood.mood
        );


    if (newMood === null) return;


    const cleaned =
        newMood.trim();


    if (!cleaned) return;


    mood.mood =
        cleaned;


    localStorage.setItem(
        "myLittleNotesMoods",
        JSON.stringify(moods)
    );


    loadMoods();
}


/* =========================
   DELETE MOOD
========================= */

function deleteMood(id) {

    const confirmed =
        confirm(
            "Delete this mood entry?"
        );


    if (!confirmed) return;


    moods =
        moods.filter(
            item =>
                item.id !== id
        );


    localStorage.setItem(
        "myLittleNotesMoods",
        JSON.stringify(moods)
    );


    loadMoods();
}


/* =========================
   THEME
========================= */

function toggleTheme() {

    document.body.classList.toggle(
        "light-mode"
    );


    const isLight =
        document.body.classList.contains(
            "light-mode"
        );


    localStorage.setItem(
        "myLittleNotesTheme",
        isLight
            ? "light"
            : "dark"
    );
    
