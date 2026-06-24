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
function addMatrixEntry() {

    const author = document.getElementById("author").value;
    const year = document.getElementById("year").value;
    const purpose = document.getElementById("purpose").value;
    const method = document.getElementById("method").value;
    const findings = document.getElementById("findings").value;
    const relevance = document.getElementById("relevance").value;

    if (!author) {
        alert("Please enter an author.");
        return;
    }

    const matrix =
        JSON.parse(localStorage.getItem("researchMatrix")) || [];

    matrix.push({
        author,
        year,
        purpose,
        method,
        findings,
        relevance
    });

    localStorage.setItem(
        "researchMatrix",
        JSON.stringify(matrix)
    );

    renderMatrix();

    document.getElementById("author").value = "";
    document.getElementById("year").value = "";
    document.getElementById("purpose").value = "";
    document.getElementById("method").value = "";
    document.getElementById("findings").value = "";
    document.getElementById("relevance").value = "";
}

function renderMatrix() {

    const tbody =
        document.querySelector("#matrixTable tbody");

    tbody.innerHTML = "";

    const matrix =
        JSON.parse(localStorage.getItem("researchMatrix")) || [];

    matrix.forEach(item => {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${item.author}</td>
            <td>${item.year}</td>
            <td>${item.purpose}</td>
            <td>${item.method}</td>
            <td>${item.findings}</td>
            <td>${item.relevance}</td>
        `;

        tbody.appendChild(row);
    });
}

renderMatrix();
function exportData() {

    const notes =
        localStorage.getItem("researchNotes");

    const matrix =
        localStorage.getItem("researchMatrix");

    const content = `
RESEARCH NOTES
========================

${notes}


RESEARCH MATRIX
========================

${matrix}
`;

    const blob = new Blob(
        [content],
        { type: "text/plain" }
    );

    const link =
        document.createElement("a");

    link.href =
        URL.createObjectURL(blob);

    link.download =
        "ResearchNotebook.txt";

    link.click();
}
