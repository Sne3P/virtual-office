document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("new-note-btn").addEventListener("click", function() {
        fetch("/notepad/save/", { method: "POST", body: new FormData() })
        .then(response => response.json())
        .then(data => {
            let note = document.createElement("div");
            note.classList.add("note");
            note.dataset.id = data.id;
            note.innerHTML = `
                <input class="note-title" value="${data.title}">
                <textarea class="note-content"></textarea>
                <button class="delete-note">🗑 Supprimer</button>
            `;
            document.getElementById("notes-list").appendChild(note);
        });
    });

    document.addEventListener("click", function(e) {
        if (e.target.classList.contains("delete-note")) {
            let note = e.target.closest(".note");
            fetch(`/notepad/delete/${note.dataset.id}/`, { method: "POST" })
            .then(() => note.remove());
        }
    });

    document.addEventListener("input", function(e) {
        if (e.target.classList.contains("note-title") || e.target.classList.contains("note-content")) {
            let note = e.target.closest(".note");
            let formData = new FormData();
            formData.append("title", note.querySelector(".note-title").value);
            formData.append("content", note.querySelector(".note-content").value);
            fetch(`/notepad/update/${note.dataset.id}/`, { method: "POST", body: formData });
        }
    });
});
