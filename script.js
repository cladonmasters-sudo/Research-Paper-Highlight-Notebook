const fileInput = document.getElementById("pdfUpload");
const viewer = document.getElementById("viewer");

fileInput.addEventListener("change", function (event) {
    const file = event.target.files[0];

    if (!file) return;

    const fileURL = URL.createObjectURL(file);

    viewer.innerHTML = `
        <iframe src="${fileURL}"></iframe>
    `;
});

function saveNote() {
    const category = document.getElementById("category").value;
    const noteText = document.getElementById("noteInput").value.trim();

    if (!noteText) {
        alert("Please enter a note.");
        return;
    }

    let notes = JSON.parse(localStorage.getItem("researchNotes")) || {};

    if (!notes[category]) {
        notes[category] = [];
    }

    notes[category].push(noteText);

    localStorage.setItem("researchNotes", JSON.stringify(notes));

    document.getElementById("noteInput").value = "";

    displayNotes();
}

function displayNotes() {
    const notesList = document.getElementById("notesList");
    const notes = JSON.parse(localStorage.getItem("researchNotes")) || {};

    notesList.innerHTML = "";

    for (const category in notes) {
        const section = document.createElement("div");
        section.className = "note-card";

        let items = notes[category]
            .map(note => `<li>${note}</li>`)
            .join("");

        section.innerHTML = `
            <h4>${category}</h4>
            <ul>${items}</ul>
        `;

        notesList.appendChild(section);
    }
}

function clearNotes() {
    if (confirm("Clear all notes?")) {
        localStorage.removeItem("researchNotes");
        displayNotes();
    }
}

displayNotes();
