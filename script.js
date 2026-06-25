const fileInput = document.getElementById("pdfUpload");
const viewer = document.getElementById("viewer");

let editingCategory = null;
let editingIndex = null;
let currentNoteFilter = "all";

fileInput.addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (!file) return;

    const fileURL = URL.createObjectURL(file);
    viewer.innerHTML = `<iframe src="${fileURL}"></iframe>`;

    let articlesReviewed = Number(localStorage.getItem("articlesReviewed")) || 0;
    articlesReviewed++;
    localStorage.setItem("articlesReviewed", articlesReviewed);

    updateDashboard();
});

function openTab(tabId) {
    document.querySelectorAll(".tab-content").forEach(tab => tab.classList.remove("active"));
    document.getElementById(tabId).classList.add("active");
}

function updateDashboard() {
    const notes = JSON.parse(localStorage.getItem("researchNotes")) || {};
    const matrix = JSON.parse(localStorage.getItem("researchMatrix")) || [];
    const citations = JSON.parse(localStorage.getItem("savedCitations")) || [];
    const articlesReviewed = Number(localStorage.getItem("articlesReviewed")) || 0;

    let notesCount = 0;
    for (const category in notes) notesCount += notes[category].length;

    document.getElementById("articlesCount").innerText = articlesReviewed;
    document.getElementById("notesCount").innerText = notesCount;
    document.getElementById("matrixCount").innerText = matrix.length;
    document.getElementById("favoritesCount").innerText = matrix.filter(item => item.favorite).length;
    document.getElementById("citationsCount").innerText = citations.length;
}

function formatText(command) {
    document.execCommand(command, false, null);
}

function normalizeNote(note) {
    if (typeof note === "string") {
        return {
            text: note,
            color: "general",
            article: "",
            page: "",
            tags: "",
            date: new Date().toLocaleDateString()
        };
    }

    return note;
}

function saveNote() {
    const category = document.getElementById("category").value;
    const noteInput = document.getElementById("noteInput");
    const noteText = noteInput.innerHTML.trim();

    if (!noteText) {
        alert("Please enter a note.");
        return;
    }

    const noteObject = {
        text: noteText,
        color: document.getElementById("noteColor").value,
        article: document.getElementById("noteArticle").value.trim(),
        page: document.getElementById("notePage").value.trim(),
        tags: document.getElementById("noteTags").value.trim(),
        date: new Date().toLocaleDateString()
    };

    let notes = JSON.parse(localStorage.getItem("researchNotes")) || {};

    if (editingCategory !== null && editingIndex !== null) {
        notes[editingCategory][editingIndex] = noteObject;
        resetEditMode();
    } else {
        if (!notes[category]) notes[category] = [];
        notes[category].push(noteObject);
    }

    localStorage.setItem("researchNotes", JSON.stringify(notes));

    noteInput.innerHTML = "";
    document.getElementById("noteArticle").value = "";
    document.getElementById("notePage").value = "";
    document.getElementById("noteTags").value = "";

    displayNotes();
    updateDashboard();
}

function setNoteFilter(filter) {
    currentNoteFilter = filter;
    displayNotes();
}

function displayNotes() {
    const notesList = document.getElementById("notesList");
    const notes = JSON.parse(localStorage.getItem("researchNotes")) || {};
    const search = document.getElementById("noteSearch")?.value.toLowerCase() || "";

    notesList.innerHTML = "";

    for (const category in notes) {
        const filteredNotes = notes[category]
            .map((rawNote, index) => ({ note: normalizeNote(rawNote), index }))
            .filter(({ note }) => {
                const textMatch =
                    note.text.toLowerCase().includes(search) ||
                    note.article.toLowerCase().includes(search) ||
                    note.tags.toLowerCase().includes(search);

                const colorMatch =
                    currentNoteFilter === "all" || note.color === currentNoteFilter;

                return textMatch && colorMatch;
            });

        if (filteredNotes.length === 0) continue;

        const section = document.createElement("div");
        section.className = "note-card";
        section.innerHTML = `<h4>${category} (${filteredNotes.length})</h4>`;

        filteredNotes.forEach(({ note, index }) => {
            const savedNote = document.createElement("div");
            savedNote.className = `saved-note note-${note.color}`;

            savedNote.innerHTML = `
                <div class="note-meta">
                    <strong>Article:</strong> ${note.article || "Not specified"}<br>
                    <strong>Page:</strong> ${note.page || "N/A"}<br>
                    <strong>Tags:</strong> ${note.tags || "None"}<br>
                    <strong>Date:</strong> ${note.date || ""}
                </div>

                <div>${note.text}</div>

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
    const note = normalizeNote(notes[category][index]);

    document.getElementById("noteInput").innerHTML = note.text;
    document.getElementById("noteColor").value = note.color;
    document.getElementById("noteArticle").value = note.article;
    document.getElementById("notePage").value = note.page;
    document.getElementById("noteTags").value = note.tags;
    document.getElementById("category").value = category;

    document.getElementById("saveNoteBtn").innerText = "Update Note";
    document.getElementById("cancelEditBtn").style.display = "block";

    editingCategory = category;
    editingIndex = index;

    openTab("notesTab");
}

function deleteNote(category, index) {
    let notes = JSON.parse(localStorage.getItem("researchNotes")) || {};

    if (!confirm("Delete this note?")) return;

    notes[category].splice(index, 1);
    if (notes[category].length === 0) delete notes[category];

    localStorage.setItem("researchNotes", JSON.stringify(notes));

    displayNotes();
    updateDashboard();
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
        displayNotes();
        updateDashboard();
    }
}

function addMatrixEntry() {
    const author = document.getElementById("author").value.trim();
    const year = document.getElementById("year").value.trim();

    if (!author) {
        alert("Please enter an author.");
        return;
    }

    let matrix = JSON.parse(localStorage.getItem("researchMatrix")) || [];

    matrix.push({
        author,
        year,
        purpose: document.getElementById("purpose").value.trim(),
        method: document.getElementById("method").value.trim(),
        findings: document.getElementById("findings").value.trim(),
        relevance: document.getElementById("relevance").value.trim(),
        favorite: false
    });

    localStorage.setItem("researchMatrix", JSON.stringify(matrix));

    ["author", "year", "purpose", "method", "findings", "relevance"].forEach(id => {
        document.getElementById(id).value = "";
    });

    displayMatrix();
    displayFavorites();
    updateDashboard();
}

function displayMatrix() {
    const tbody = document.querySelector("#matrixTable tbody");
    if (!tbody) return;

    const matrix = JSON.parse(localStorage.getItem("researchMatrix")) || [];
    const search = document.getElementById("matrixSearch")?.value.toLowerCase() || "";

    tbody.innerHTML = "";

    matrix
        .map((item, index) => ({ item, index }))
        .filter(({ item }) =>
            Object.values(item).join(" ").toLowerCase().includes(search)
        )
        .forEach(({ item, index }) => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td><button onclick="toggleFavorite(${index})">${item.favorite ? "★" : "☆"}</button></td>
                <td>${item.author}</td>
                <td>${item.year}</td>
                <td>${item.purpose}</td>
                <td>${item.method}</td>
                <td>${item.findings}</td>
                <td>${item.relevance}</td>
                <td>
                    <button onclick="fillAPAFromMatrix(${index})">APA</button>
                    <button onclick="deleteMatrixEntry(${index})">Delete</button>
                </td>
            `;

            tbody.appendChild(row);
        });
}

function toggleFavorite(index) {
    let matrix = JSON.parse(localStorage.getItem("researchMatrix")) || [];
    matrix[index].favorite = !matrix[index].favorite;
    localStorage.setItem("researchMatrix", JSON.stringify(matrix));

    displayMatrix();
    displayFavorites();
    updateDashboard();
}

function displayFavorites() {
    const list = document.getElementById("favoritesList");
    if (!list) return;

    const matrix = JSON.parse(localStorage.getItem("researchMatrix")) || [];
    const favorites = matrix.filter(item => item.favorite);

    list.innerHTML = "";

    if (favorites.length === 0) {
        list.innerHTML = "<p>No favorite articles yet.</p>";
        return;
    }

    favorites.forEach(item => {
        const card = document.createElement("div");
        card.className = "favorite-card";

        card.innerHTML = `
            <h4>${item.author} (${item.year})</h4>
            <p><strong>Purpose:</strong> ${item.purpose}</p>
            <p><strong>Method:</strong> ${item.method}</p>
            <p><strong>Findings:</strong> ${item.findings}</p>
            <p><strong>Relevance:</strong> ${item.relevance}</p>
        `;

        list.appendChild(card);
    });
}

function deleteMatrixEntry(index) {
    let matrix = JSON.parse(localStorage.getItem("researchMatrix")) || [];

    if (!confirm("Delete this matrix entry?")) return;

    matrix.splice(index, 1);
    localStorage.setItem("researchMatrix", JSON.stringify(matrix));

    displayMatrix();
    displayFavorites();
    updateDashboard();
}

function clearMatrix() {
    if (confirm("Delete all matrix entries?")) {
        localStorage.removeItem("researchMatrix");
        displayMatrix();
        displayFavorites();
        updateDashboard();
    }
}

function sortMatrixByAuthor() {
    let matrix = JSON.parse(localStorage.getItem("researchMatrix")) || [];
    matrix.sort((a, b) => String(a.author || "").localeCompare(String(b.author || "")));
    localStorage.setItem("researchMatrix", JSON.stringify(matrix));
    displayMatrix();
}

function sortMatrixByYear() {
    let matrix = JSON.parse(localStorage.getItem("researchMatrix")) || [];
    matrix.sort((a, b) => Number(a.year || 0) - Number(b.year || 0));
    localStorage.setItem("researchMatrix", JSON.stringify(matrix));
    displayMatrix();
}

function fillAPAFromMatrix(index) {
    const matrix = JSON.parse(localStorage.getItem("researchMatrix")) || [];
    const item = matrix[index];

    document.getElementById("citeAuthor").value = item.author || "";
    document.getElementById("citeShortAuthor").value = item.author || "";
    document.getElementById("citeYear").value = item.year || "";
    document.getElementById("citeTitle").value = item.purpose || "";

    openTab("apaTab");
}

async function exportData() {
    alert("Export is temporarily paused in this version. We can restore Word export next.");
}

function getCitationFields() {
    let pages = document.getElementById("citePages").value.trim();

    if (pages.toLowerCase().startsWith("pp.")) {
        pages = pages.replace(/pp\./i, "").trim();
    }

    return {
        referenceAuthor: document.getElementById("citeAuthor").value.trim(),
        shortAuthor: document.getElementById("citeShortAuthor").value.trim(),
        year: document.getElementById("citeYear").value.trim().replace(/[()]/g, ""),
        title: document.getElementById("citeTitle").value.trim(),
        journal: document.getElementById("citeJournal").value.trim(),
        volume: document.getElementById("citeVolume").value.trim(),
        issue: document.getElementById("citeIssue").value.trim(),
        pages,
        doi: document.getElementById("citeDOI").value.trim(),
        quote: document.getElementById("quoteText").value.trim(),
        page: document.getElementById("citePage").value.trim()
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
        if (data.issue) citation += "(" + data.issue + ")";
    }

    if (data.pages) citation += ", " + data.pages;
    citation += ".";
    if (data.doi) citation += " " + data.doi;

    document.getElementById("citationOutput").value = citation;
}

function generateNarrativeCitation() {
    const data = getCitationFields();
    const pagePart = data.page ? ` (p. ${data.page})` : "";

    document.getElementById("citationOutput").value =
        `${data.shortAuthor || "[Author]"} (${data.year || "n.d."}) stated that ${data.quote || "[insert paraphrased idea here]"}${pagePart}.`;
}

function generateParentheticalCitation() {
    const data = getCitationFields();
    const pagePart = data.page ? `, p. ${data.page}` : "";

    document.getElementById("citationOutput").value =
        `${data.quote || "[insert paraphrased idea here]"} (${data.shortAuthor || "[Author]"}, ${data.year || "n.d."}${pagePart}).`;
}

function generateDirectQuoteCitation() {
    const data = getCitationFields();
    const pagePart = data.page ? `, p. ${data.page}` : "";

    document.getElementById("citationOutput").value =
        `"${data.quote || "Insert exact quote here"}" (${data.shortAuthor || "[Author]"}, ${data.year || "n.d."}${pagePart}).`;
}

function saveCitation() {
    const citation = document.getElementById("citationOutput").value.trim();

    if (!citation) {
        alert("Generate a citation first.");
        return;
    }

    let saved = JSON.parse(localStorage.getItem("savedCitations")) || [];
    saved.push(citation);
    localStorage.setItem("savedCitations", JSON.stringify(saved));

    displaySavedCitations();
    updateDashboard();
    openTab("citationsTab");
}

function displaySavedCitations() {
    const list = document.getElementById("savedCitationsList");
    if (!list) return;

    const saved = JSON.parse(localStorage.getItem("savedCitations")) || [];
    list.innerHTML = "";

    saved.forEach((citation, index) => {
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
    const saved = JSON.parse(localStorage.getItem("savedCitations")) || [];
    navigator.clipboard.writeText(saved[index]);
    alert("Citation copied.");
}

function deleteCitation(index) {
    let saved = JSON.parse(localStorage.getItem("savedCitations")) || [];
    saved.splice(index, 1);
    localStorage.setItem("savedCitations", JSON.stringify(saved));
    displaySavedCitations();
    updateDashboard();
}

function clearSavedCitations() {
    localStorage.removeItem("savedCitations");
    displaySavedCitations();
    updateDashboard();
}

function clearCitationFields() {
    [
        "citeAuthor", "citeShortAuthor", "citeYear", "citeTitle",
        "citeJournal", "citeVolume", "citeIssue", "citePages",
        "citeDOI", "quoteText", "citePage", "citationOutput"
    ].forEach(id => document.getElementById(id).value = "");
}

function generateLiteratureReview() {
    const matrix = JSON.parse(localStorage.getItem("researchMatrix")) || [];
    const favorites = matrix.filter(item => item.favorite);
    const source = favorites.length ? favorites : matrix;

    if (source.length === 0) {
        alert("Add matrix entries first.");
        return;
    }

    let draft = "Literature Review Draft\n\n";

    source.forEach(item => {
        draft += `${item.author} (${item.year}) examined ${item.purpose || "a related topic"}. `;

        if (item.method) draft += `The study used ${item.method}. `;
        if (item.findings) draft += `The findings showed that ${item.findings}. `;
        if (item.relevance) draft += `This is relevant because ${item.relevance}. `;

        draft += "\n\n";
    });

    document.getElementById("literatureReviewOutput").value = draft;
}

function generateSynthesis() {
    const matrix = JSON.parse(localStorage.getItem("researchMatrix")) || [];

    let draft = "Research Synthesis\n\n";
    draft += "The reviewed studies show recurring patterns related to the research topic. ";

    matrix.forEach(item => {
        if (item.relevance) {
            draft += `${item.author} (${item.year}) is useful because ${item.relevance}. `;
        }
    });

    document.getElementById("literatureReviewOutput").value = draft;
}

function copyLiteratureReview() {
    const draft = document.getElementById("literatureReviewOutput").value;
    navigator.clipboard.writeText(draft);
    alert("Draft copied.");
}

function clearLiteratureReview() {
    document.getElementById("literatureReviewOutput").value = "";
}

function generateResearchGap() {
    const topic = document.getElementById("studyTopic").value.trim();
    const matrix = JSON.parse(localStorage.getItem("researchMatrix")) || [];

    if (!topic) {
        alert("Please enter your study topic.");
        return;
    }

    let gap = `Possible Research Gap\n\nThe present study focuses on ${topic}.\n\n`;

    if (matrix.length > 0) {
        gap += "The reviewed studies provide useful background, but they may not fully address the specific context, learners, and instructional challenges targeted in the present study.\n\n";
    }

    gap += "This suggests a need for further investigation into the specific experiences, challenges, and support needs related to this topic.";

    document.getElementById("researchGapOutput").value = gap;
}

function copyResearchGap() {
    const gap = document.getElementById("researchGapOutput").value;
    navigator.clipboard.writeText(gap);
    alert("Research gap copied.");
}

displayNotes();
displayMatrix();
displayFavorites();
displaySavedCitations();
updateDashboard();
