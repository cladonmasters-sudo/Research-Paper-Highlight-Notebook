const fileInput = document.getElementById("pdfUpload");
const viewer = document.getElementById("viewer");
const notesList = document.getElementById("notesList");

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

    const note = document.createElement("div");
    note.className = "note-card";

    note.innerHTML = `
        <strong>${category}</strong>
        <p>${noteText}</p>
    `;

    notesList.appendChild(note);

    localStorage.setItem(
        "researchNotes",
        notesList.innerHTML
    );

    document.getElementById("noteInput").value = "";
}

function clearNotes() {
    if (confirm("Clear all notes?")) {
        notesList.innerHTML = "";
        localStorage.removeItem("researchNotes");
    }
}

window.onload = function () {
    const savedNotes =
        localStorage.getItem("researchNotes");

    if (savedNotes) {
        notesList.innerHTML = savedNotes;
    }
};
