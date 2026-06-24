const fileInput = document.getElementById("pdfUpload");
const viewer = document.getElementById("viewer");

let editingCategory = null;
let editingIndex = null;

fileInput.addEventListener("change", function (event) {
    const file = event.target.files[0];

    if (!file) return;

    const fileURL = URL.createObjectURL(file);

    viewer.innerHTML = `<iframe src="${fileURL}"></iframe>`;
});

function formatText(command) {
    document.execCommand(command, false, null);
}

function saveNote() {
    const category = document.getElementById("category").value;
    const noteInput = document.getElementById("noteInput");
    const noteText = noteInput.innerHTML.trim();

    if (!noteText) {
        alert("Please enter a note.");
        return;
    }

    let notes = JSON.parse(localStorage.getItem("researchNotes")) || {};

    if (editingCategory !== null && editingIndex !== null) {
        notes[editingCategory][editingIndex] = noteText;
        resetEditMode();
    } else {
        if (!notes[category]) {
            notes[category] = [];
        }

        notes[category].push(noteText);
    }

    localStorage.setItem("researchNotes", JSON.stringify(notes));

    noteInput.innerHTML = "";

    displayNotes();
}

function displayNotes() {
    const notesList = document.getElementById("notesList");
    const notes = JSON.parse(localStorage.getItem("researchNotes")) || {};

    notesList.innerHTML = "";

    for (const category in notes) {
        const section = document.createElement("div");
        section.className = "note-card";

        section.innerHTML = `<h4>${category}</h4>`;

        notes[category].forEach((note, index) => {
            const savedNote = document.createElement("div");
            savedNote.className = "saved-note";

            savedNote.innerHTML = `
                <div>${note}</div>

                <div class="note-actions">
                    <button class="edit-btn" onclick="editNote('${category}', ${index})">Edit</button>
                    <button class="delete-note-btn" onclick="deleteNote('${category}', ${index})">Delete</button>
                </div>
            `;

            section.appendChild(savedNote);
        });

        notesList.appendChild(section);
    }
}

function editNote(category, index) {
    const notes = JSON.parse(localStorage.getItem("researchNotes")) || {};
    const noteInput = document.getElementById("noteInput");

    noteInput.innerHTML = notes[category][index];

    document.getElementById("category").value = category;
    document.getElementById("saveNoteBtn").innerText = "Update Note";
    document.getElementById("cancelEditBtn").style.display = "block";

    editingCategory = category;
    editingIndex = index;

    noteInput.scrollIntoView({ behavior: "smooth" });
}

function deleteNote(category, index) {
    let notes = JSON.parse(localStorage.getItem("researchNotes")) || {};

    if (!confirm("Delete this note?")) {
        return;
    }

    notes[category].splice(index, 1);

    if (notes[category].length === 0) {
        delete notes[category];
    }

    localStorage.setItem("researchNotes", JSON.stringify(notes));

    displayNotes();
}

function cancelEdit() {
    document.getElementById("noteInput").innerHTML = "";
    resetEditMode();
}

function resetEditMode() {
    editingCategory = null;
    editingIndex = null;

    document.getElementById("saveNoteBtn").innerText = "Save Note";
    document.getElementById("cancelEditBtn").style.display = "none";
}

function clearNotes() {
    if (confirm("Clear all notes?")) {
        localStorage.removeItem("researchNotes");
        document.getElementById("noteInput").innerHTML = "";
        resetEditMode();
        displayNotes();
    }
}

function addMatrixEntry() {
    const author = document.getElementById("author").value.trim();
    const year = document.getElementById("year").value.trim();
    const purpose = document.getElementById("purpose").value.trim();
    const method = document.getElementById("method").value.trim();
    const findings = document.getElementById("findings").value.trim();
    const relevance = document.getElementById("relevance").value.trim();

    if (!author) {
        alert("Please enter an author.");
        return;
    }

    let matrix = JSON.parse(localStorage.getItem("researchMatrix")) || [];

    matrix.push({
        author,
        year,
        purpose,
        method,
        findings,
        relevance
    });

    localStorage.setItem("researchMatrix", JSON.stringify(matrix));

    document.getElementById("author").value = "";
    document.getElementById("year").value = "";
    document.getElementById("purpose").value = "";
    document.getElementById("method").value = "";
    document.getElementById("findings").value = "";
    document.getElementById("relevance").value = "";

    displayMatrix();
}

function displayMatrix() {
    const tbody = document.querySelector("#matrixTable tbody");

    if (!tbody) return;

    const matrix = JSON.parse(localStorage.getItem("researchMatrix")) || [];
    const searchBox = document.getElementById("matrixSearch");
    const searchText = searchBox ? searchBox.value.toLowerCase() : "";

    tbody.innerHTML = "";

    matrix
        .filter(item => {
            return (
                String(item.author || "").toLowerCase().includes(searchText) ||
                String(item.year || "").toLowerCase().includes(searchText) ||
                String(item.purpose || "").toLowerCase().includes(searchText) ||
                String(item.method || "").toLowerCase().includes(searchText) ||
                String(item.findings || "").toLowerCase().includes(searchText) ||
                String(item.relevance || "").toLowerCase().includes(searchText)
            );
        })
        .forEach((item, index) => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${item.author}</td>
                <td>${item.year}</td>
                <td>${item.purpose}</td>
                <td>${item.method}</td>
                <td>${item.findings}</td>
                <td>${item.relevance}</td>
                <td>
                    <button onclick="deleteMatrixEntry(${index})">Delete</button>
                </td>
            `;

            tbody.appendChild(row);
        });
}

function deleteMatrixEntry(index) {
    let matrix = JSON.parse(localStorage.getItem("researchMatrix")) || [];

    if (confirm("Delete this matrix entry?")) {
        matrix.splice(index, 1);
        localStorage.setItem("researchMatrix", JSON.stringify(matrix));
        displayMatrix();
    }
}

function clearMatrix() {
    if (confirm("Delete all matrix entries?")) {
        localStorage.removeItem("researchMatrix");
        displayMatrix();
    }
}

function sortMatrixByAuthor() {
    let matrix = JSON.parse(localStorage.getItem("researchMatrix")) || [];

    matrix.sort((a, b) => {
        return String(a.author || "").localeCompare(String(b.author || ""));
    });

    localStorage.setItem("researchMatrix", JSON.stringify(matrix));

    displayMatrix();
}

function sortMatrixByYear() {
    let matrix = JSON.parse(localStorage.getItem("researchMatrix")) || [];

    matrix.sort((a, b) => {
        return Number(a.year || 0) - Number(b.year || 0);
    });

    localStorage.setItem("researchMatrix", JSON.stringify(matrix));

    displayMatrix();
}

async function exportData() {
    const notes = JSON.parse(localStorage.getItem("researchNotes")) || {};
    const matrix = JSON.parse(localStorage.getItem("researchMatrix")) || [];

    const {
        Document,
        Packer,
        Paragraph,
        TextRun,
        Table,
        TableRow,
        TableCell,
        WidthType
    } = docx;

    const children = [];

    children.push(
        new Paragraph({
            children: [
                new TextRun({
                    text: "Research Notebook Export",
                    bold: true,
                    size: 32
                })
            ]
        })
    );

    children.push(new Paragraph(" "));

    children.push(
        new Paragraph({
            children: [
                new TextRun({
                    text: "Research Notes",
                    bold: true,
                    size: 28
                })
            ]
        })
    );

    for (const category in notes) {
        children.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: category,
                        bold: true,
                        size: 24
                    })
                ]
            })
        );

        notes[category].forEach(note => {
            const plainNote = note.replace(/<[^>]*>?/gm, " ");

            children.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: "• " + plainNote,
                            size: 22
                        })
                    ]
                })
            );
        });

        children.push(new Paragraph(" "));
    }

    children.push(
        new Paragraph({
            children: [
                new TextRun({
                    text: "Research Matrix",
                    bold: true,
                    size: 28
                })
            ]
        })
    );

    const tableRows = [];

    tableRows.push(
        new TableRow({
            children: [
                "Author",
                "Year",
                "Purpose",
                "Method",
                "Findings",
                "Relevance"
            ].map(header =>
                new TableCell({
                    children: [
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: header,
                                    bold: true
                                })
                            ]
                        })
                    ]
                })
            )
        })
    );

    matrix.forEach(item => {
        tableRows.push(
            new TableRow({
                children: [
                    item.author,
                    item.year,
                    item.purpose,
                    item.method,
                    item.findings,
                    item.relevance
                ].map(text =>
                    new TableCell({
                        children: [
                            new Paragraph(String(text || ""))
                        ]
                    })
                )
            })
        );
    });

    children.push(
        new Table({
            width: {
                size: 100,
                type: WidthType.PERCENTAGE
            },
            rows: tableRows
        })
    );

    const doc = new Document({
        sections: [
            {
                children: children
            }
        ]
    });

    const blob = await Packer.toBlob(doc);

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "ResearchNotebook.docx";
    link.click();
}

function generateCitation() {
    const author = document.getElementById("citeAuthor").value;
    const year = document.getElementById("citeYear").value;
    const title = document.getElementById("citeTitle").value;
    const journal = document.getElementById("citeJournal").value;
    const volume = document.getElementById("citeVolume").value;
    const issue = document.getElementById("citeIssue").value;
    const pages = document.getElementById("citePages").value;
    const doi = document.getElementById("citeDOI").value;

    const citation =
        `${author} (${year}). ${title}. ${journal}, ${volume}(${issue}), ${pages}. ${doi}`;

    document.getElementById("citationOutput").value = citation;
}

displayNotes();
displayMatrix();
