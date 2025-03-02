document.addEventListener("DOMContentLoaded", function() {
    const newNoteBtn = document.getElementById("new-note-btn");
    const notesList = document.getElementById("notes-list");
    const noteTitle = document.getElementById("note-title");
    const noteContent = document.getElementById("note-content");
    const deleteNoteBtn = document.getElementById("delete-note-btn");

    let notes = JSON.parse(localStorage.getItem("notes")) || [];
    let activeNoteId = null;

    function saveNotes() {
        localStorage.setItem("notes", JSON.stringify(notes));
    }

    function renderNotesList() {
        notesList.innerHTML = "";
        notes.forEach(note => {
            const noteItem = document.createElement("div");
            noteItem.className = "note-title-item";
            noteItem.dataset.id = note.id;
            noteItem.textContent = note.title;
            noteItem.addEventListener("click", () => selectNote(note.id));
            if (note.id === activeNoteId) {
                noteItem.classList.add("active");
            }
            notesList.appendChild(noteItem);
        });
    }

    function selectNote(id) {
        const note = notes.find(n => n.id === id);
        if (note) {
            activeNoteId = id;
            noteTitle.value = note.title;
            noteContent.value = note.content;
            noteTitle.disabled = false;
            noteContent.disabled = false;
            deleteNoteBtn.disabled = false;
            adjustTitleInputWidth();
            renderNotesList();
        }
    }

    function createNote() {
        const newNote = {
            id: Date.now(),
            title: "Nouvelle note",
            content: ""
        };
        notes.push(newNote);
        saveNotes();
        renderNotesList();
        selectNote(newNote.id);
    }

    function updateNote() {
        if (activeNoteId !== null) {
            const note = notes.find(n => n.id === activeNoteId);
            if (note) {
                note.title = noteTitle.value.trim() || "Nouvelle note";
                note.content = noteContent.value;
                saveNotes();
                renderNotesList();
                adjustTitleInputWidth();
            }
        }
    }

    function deleteNote() {
        if (activeNoteId !== null) {
            notes = notes.filter(n => n.id !== activeNoteId);
            saveNotes();
            renderNotesList();
            if (notes.length > 0) {
                selectNote(notes[0].id);
            } else {
                activeNoteId = null;
                noteTitle.value = "";
                noteContent.value = "";
                noteTitle.disabled = true;
                noteContent.disabled = true;
                deleteNoteBtn.disabled = true;
            }
        }
    }

    function adjustTitleInputWidth() {
        noteTitle.style.width = (noteTitle.value.length + 1) + "ch";
    }

    newNoteBtn.addEventListener("click", createNote);
    noteTitle.addEventListener("input", () => {
        setTimeout(updateNote, 500);
        adjustTitleInputWidth();
    });
    noteContent.addEventListener("input", () => setTimeout(updateNote, 500));
    deleteNoteBtn.addEventListener("click", deleteNote);

    renderNotesList();
    if (notes.length > 0) {
        selectNote(notes[0].id);
    }
});
