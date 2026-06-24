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

function openTab(tabId) {
    const tabs = document.querySelectorAll(".tab-content");

    tabs.forEach(tab => {
        tab.classList.remove("active");
    });

    document.getElementById(tabId).classList.add("active");
}

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

    openTab("notesTab");
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

function getCitationFields() {
    const referenceAuthor = document.getElementById("citeAuthor").value.trim();
    const shortAuthor = document.getElementById("citeShortAuthor").value.trim();
    const year = document.getElementById("citeYear").value.trim().replace(/[()]/g, "");
    const title = document.getElementById("citeTitle").value.trim();
    const journal = document.getElementById("citeJournal").value.trim();
    const volume = document.getElementById("citeVolume").value.trim();
    const issue = document.getElementById("citeIssue").value.trim();
    let pages = document.getElementById("citePages").value.trim();
    const doi = document.getElementById("citeDOI").value.trim();
    const quote = document.getElementById("quoteText").value.trim();
    const page = document.getElementById("citePage").value.trim();

    if (pages.toLowerCase().startsWith("pp.")) {
        pages = pages.replace(/pp\./i, "").trim();
    }

    return {
        referenceAuthor,
        shortAuthor,
        year,
        title,
        journal,
        volume,
        issue,
        pages,
        doi,
        quote,
        page
    };
}

function generateReferenceCitation() {
    const data = getCitationFields();

    let citation = "";

    citation += data.referenceAuthor ? data.referenceAuthor + " " : "";
    citation += data.year ? "(" + data.year + "). " : "(n.d.). ";
    citation += data.title ? data.title.replace(/\.+$/, "") + ". " : "";
    citation += data.journal ? data.journal.replace(/\.+$/, "") : "";

    if (data.volume) {
        citation += ", " + data.volume;

        if (data.issue) {
            citation += "(" + data.issue + ")";
        }
    }

    if (data.pages) {
        citation += ", " + data.pages;
    }

    citation += ".";

    if (data.doi) {
        citation += " " + data.doi;
    }

    document.getElementById("citationOutput").value = citation;
}

function generateNarrativeCitation() {
    const data = getCitationFields();

    const author = data.shortAuthor || "[Author]";
    const year = data.year || "n.d.";
    const pagePart = data.page ? ` (p. ${data.page})` : "";
    const idea = data.quote || "[insert paraphrased idea here]";

    const citation =
        `${author} (${year}) stated that ${idea}${pagePart}.`;

    document.getElementById("citationOutput").value = citation;
}

function generateParentheticalCitation() {
    const data = getCitationFields();

    const author = data.shortAuthor || "[Author]";
    const year = data.year || "n.d.";
    const pagePart = data.page ? `, p. ${data.page}` : "";
    const idea = data.quote || "[insert paraphrased idea here]";

    const citation =
        `${idea} (${author}, ${year}${pagePart}).`;

    document.getElementById("citationOutput").value = citation;
}

function generateDirectQuoteCitation() {
    const data = getCitationFields();

    const author = data.shortAuthor || "[Author]";
    const year = data.year || "n.d.";
    const pagePart = data.page ? `, p. ${data.page}` : "";
    const quote = data.quote || "Insert exact quote here";

    const citation =
        `"${quote}" (${author}, ${year}${pagePart}).`;

    document.getElementById("citationOutput").value = citation;
}

function saveCitation() {
    const citationText = document.getElementById("citationOutput").value.trim();

    if (!citationText) {
        alert("Generate a citation first.");
        return;
    }

    let savedCitations =
        JSON.parse(localStorage.getItem("savedCitations")) || [];

    savedCitations.push(citationText);

    localStorage.setItem(
        "savedCitations",
        JSON.stringify(savedCitations)
    );

    displaySavedCitations();
    openTab("citationsTab");
}

function displaySavedCitations() {
    const list = document.getElementById("savedCitationsList");

    if (!list) return;

    const savedCitations =
        JSON.parse(localStorage.getItem("savedCitations")) || [];

    list.innerHTML = "";

    savedCitations.forEach((citation, index) => {
        const card = document.createElement("div");
        card.className = "citation-card";

        card.innerHTML = `
            <div>${citation}</div>

            <div class="citation-actions">
                <button onclick="copyCitation(${index})">Copy</button>
                <button onclick="deleteCitation(${index})">Delete</button>
            </div>
        `;

        list.appendChild(card);
    });
}

function copyCitation(index) {
    const savedCitations =
        JSON.parse(localStorage.getItem("savedCitations")) || [];

    navigator.clipboard.writeText(savedCitations[index]);

    alert("Citation copied.");
}

function deleteCitation(index) {
    let savedCitations =
        JSON.parse(localStorage.getItem("savedCitations")) || [];

    if (!confirm("Delete this citation?")) {
        return;
    }

    savedCitations.splice(index, 1);

    localStorage.setItem(
        "savedCitations",
        JSON.stringify(savedCitations)
    );

    displaySavedCitations();
}

function clearSavedCitations() {
    if (confirm("Delete all saved citations?")) {
        localStorage.removeItem("savedCitations");
        displaySavedCitations();
    }
}

function clearCitationFields() {
    document.getElementById("citeAuthor").value = "";
    document.getElementById("citeShortAuthor").value = "";
    document.getElementById("citeYear").value = "";
    document.getElementById("citeTitle").value = "";
    document.getElementById("citeJournal").value = "";
    document.getElementById("citeVolume").value = "";
    document.getElementById("citeIssue").value = "";
    document.getElementById("citePages").value = "";
    document.getElementById("citeDOI").value = "";
    document.getElementById("quoteText").value = "";
    document.getElementById("citePage").value = "";
    document.getElementById("citationOutput").value = "";
}

displayNotes();
displayMatrix();
displaySavedCitations();
