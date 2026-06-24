const fileInput = document.getElementById("pdfUpload");
const viewer = document.getElementById("viewer");
const notesList = document.getElementById("notesList");

fileInput.addEventListener("change", function (event) {
  const file = event.target.files[0];

  if (!file) {
    viewer.innerHTML = "No file selected.";
    return;
  }

  const fileURL = URL.createObjectURL(file);

  viewer.innerHTML = `
    <iframe src="${fileURL}"></iframe>
  `;
});

function saveNote() {
  const category = document.getElementById("category").value;
  const noteInput = document.getElementById("noteInput");
  const noteText = noteInput.value.trim();

  if (!noteText) {
    alert("Please type or paste a note first.");
    return;
  }

  const note = document.createElement("div");
  note.className = "note-card";
  note.innerHTML = `<strong>${category}</strong><p>${noteText}</p>`;

  notesList.appendChild(note);

  saveToLocalStorage();

  noteInput.value = "";
}

function saveToLocalStorage() {
  localStorage.setItem("researchNotes", notesList.innerHTML);
}

function loadNotes() {
  const savedNotes = localStorage.getItem("researchNotes");

  if (savedNotes) {
    notesList.innerHTML = savedNotes;
  }
}

function clearNotes() {
  if (confirm("Are you sure you want to clear all notes?")) {
    notesList.innerHTML = "";
    localStorage.removeItem("researchNotes");
  }
}

loadNotes();
