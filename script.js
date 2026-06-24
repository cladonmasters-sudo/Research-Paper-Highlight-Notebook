const fileInput = document.getElementById("pdfUpload");
const viewer = document.getElementById("viewer");

let editingCategory = null;
let editingIndex = null;

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
    document.querySelectorAll(".tab-content").forEach(tab => {
        tab.classList.remove("active");
    });

    document.getElementById(tabId).classList.add("active");
}

function updateDashboard() {
    const notes = JSON.parse(localStorage.getItem("researchNotes")) || {};
    const matrix = JSON.parse(localStorage.getItem("researchMatrix")) || [];
    const citations = JSON.parse(localStorage.getItem("savedCitations")) || [];
    const articlesReviewed = Number(localStorage.getItem("articlesReviewed")) || 0;

    let notesCount = 0;

    for (const category in notes) {
        notesCount += notes[category].length;
    }

    const favoritesCount = matrix.filter(item => item.favorite).length;
    const progress = Math.min(Math.round((matrix.length / 30) * 100), 100);

    document.getElementById("articlesCount").innerText = articlesReviewed;
    document.getElementById("notesCount").innerText = notesCount;
    document.getElementById("matrixCount").innerText = matrix.length;
    document.getElementById("favoritesCount").innerText = favoritesCount;
    document.getElementById("citationsCount").innerText = citations.length;
    document.getElementById("progressCount").innerText = progress + "%";
}

function formatText(command) {
    document.execCommand(command, false, null);
}

function saveNote() {
    const category = document.getElementById("category").value;
    const highlightType = document.getElementById("highlightType").value;
    const noteInput = document.getElementById("noteInput");
    const noteText = noteInput.innerHTML.trim();

    if (!noteText) {
        alert("Please enter a note.");
        return;
    }

    let notes = JSON.parse(localStorage.getItem("researchNotes")) || {};

    const noteObject = {
        text: noteText,
        type: highlightType
    };

    if (editingCategory !== null && editingIndex !== null) {
        notes[editingCategory][editingIndex] = noteObject;
        resetEditMode();
    } else {
        if (!notes[category]) notes[category] = [];
        notes[category].push(noteObject);
    }

    localStorage.setItem("researchNotes", JSON.stringify(notes));

    noteInput.innerHTML = "";
    displayNotes();
    updateDashboard();
}

function normalizeNote(note) {
    if (typeof note === "string") {
        return { text: note, type: "normal" };
    }

    return note;
}

function displayNotes() {
    const notesList = document.getElementById("notesList");
    const notes = JSON.parse(localStorage.getItem("researchNotes")) || {};

    notesList.innerHTML = "";

    for (const category in notes) {
        const section = document.createElement("div");
        section.className = "note-card";
        section.innerHTML = `<h4>${category}</h4>`;

        notes[category].forEach((rawNote, index) => {
            const note = normalizeNote(rawNote);

            const savedNote = document.createElement("div");
            savedNote.className = `saved-note note-${note.type}`;

            savedNote.innerHTML = `
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
    const noteInput = document.getElementById("noteInput");

    noteInput.innerHTML = note.text;
    document.getElementById("highlightType").value = note.type;
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

    if (!confirm("Delete this note?")) return;

    notes[category].splice(index, 1);

    if (notes[category].length === 0) {
        delete notes[category];
    }

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
        document.getElementById("noteInput").innerHTML = "";
        resetEditMode();
        displayNotes();
        updateDashboard();
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
        relevance,
        favorite: false
    });

    localStorage.setItem("researchMatrix", JSON.stringify(matrix));

    document.getElementById("author").value = "";
    document.getElementById("year").value = "";
    document.getElementById("purpose").value = "";
    document.getElementById("method").value = "";
    document.getElementById("findings").value = "";
    document.getElementById("relevance").value = "";

    displayMatrix();
    displayFavorites();
    updateDashboard();
}

function displayMatrix() {
    const tbody = document.querySelector("#matrixTable tbody");
    if (!tbody) return;

    const matrix = JSON.parse(localStorage.getItem("researchMatrix")) || [];
    const searchBox = document.getElementById("matrixSearch");
    const searchText = searchBox ? searchBox.value.toLowerCase() : "";

    tbody.innerHTML = "";

    matrix
        .map((item, originalIndex) => ({ item, originalIndex }))
        .filter(({ item }) => {
            return (
                String(item.author || "").toLowerCase().includes(searchText) ||
                String(item.year || "").toLowerCase().includes(searchText) ||
                String(item.purpose || "").toLowerCase().includes(searchText) ||
                String(item.method || "").toLowerCase().includes(searchText) ||
                String(item.findings || "").toLowerCase().includes(searchText) ||
                String(item.relevance || "").toLowerCase().includes(searchText)
            );
        })
        .forEach(({ item, originalIndex }) => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td><button class="favorite-btn" onclick="toggleFavorite(${originalIndex})">${item.favorite ? "★" : "☆"}</button></td>
                <td>${item.author}</td>
                <td>${item.year}</td>
                <td>${item.purpose}</td>
                <td>${item.method}</td>
                <td>${item.findings}</td>
                <td>${item.relevance}</td>
                <td>
                    <button onclick="fillAPAFromMatrix(${originalIndex})">APA</button>
                    <button onclick="deleteMatrixEntry(${originalIndex})">Delete</button>
                </td>
            `;

            tbody.appendChild(row);
        });
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

function toggleFavorite(index) {
    let matrix = JSON.parse(localStorage.getItem("researchMatrix")) || [];
    matrix[index].favorite = !matrix[index].favorite;

    localStorage.setItem("researchMatrix", JSON.stringify(matrix));

    displayMatrix();
    displayFavorites();
    updateDashboard();
}

function displayFavorites() {
    const favoritesList = document.getElementById("favoritesList");
    if (!favoritesList) return;

    const matrix = JSON.parse(localStorage.getItem("researchMatrix")) || [];
    const favorites = matrix.filter(item => item.favorite);

    favoritesList.innerHTML = "";

    if (favorites.length === 0) {
        favoritesList.innerHTML = "<p>No favorite articles yet. Click the star beside a matrix entry.</p>";
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

        favoritesList.appendChild(card);
    });
}

function deleteMatrixEntry(index) {
    let matrix = JSON.parse(localStorage.getItem("researchMatrix")) || [];

    if (confirm("Delete this matrix entry?")) {
        matrix.splice(index, 1);
        localStorage.setItem("researchMatrix", JSON.stringify(matrix));
        displayMatrix();
        displayFavorites();
        updateDashboard();
    }
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
    displayFavorites();
}

function sortMatrixByYear() {
    let matrix = JSON.parse(localStorage.getItem("researchMatrix")) || [];
    matrix.sort((a, b) => Number(a.year || 0) - Number(b.year || 0));
    localStorage.setItem("researchMatrix", JSON.stringify(matrix));
    displayMatrix();
    displayFavorites();
}

async function exportData() {
    alert("Word export is still available in the previous version. We can improve this next.");
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

    return { referenceAuthor, shortAuthor, year, title, journal, volume, issue, pages, doi, quote, page };
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
    const author = data.shortAuthor || "[Author]";
    const year = data.year || "n.d.";
    const pagePart = data.page ? ` (p. ${data.page})` : "";
    const idea = data.quote || "[insert paraphrased idea here]";

    document.getElementById("citationOutput").value =
        `${author} (${year}) stated that ${idea}${pagePart}.`;
}

function generateParentheticalCitation() {
    const data = getCitationFields();
    const author = data.shortAuthor || "[Author]";
    const year = data.year || "n.d.";
    const pagePart = data.page ? `, p. ${data.page}` : "";
    const idea = data.quote || "[insert paraphrased idea here]";

    document.getElementById("citationOutput").value =
        `${idea} (${author}, ${year}${pagePart}).`;
}

function generateDirectQuoteCitation() {
    const data = getCitationFields();
    const author = data.shortAuthor || "[Author]";
    const year = data.year || "n.d.";
    const pagePart = data.page ? `, p. ${data.page}` : "";
    const quote = data.quote || "Insert exact quote here";

    document.getElementById("citationOutput").value =
        `"${quote}" (${author}, ${year}${pagePart}).`;
}

function saveCitation() {
    const citationText = document.getElementById("citationOutput").value.trim();

    if (!citationText) {
        alert("Generate a citation first.");
        return;
    }

    let savedCitations = JSON.parse(localStorage.getItem("savedCitations")) || [];
    savedCitations.push(citationText);

    localStorage.setItem("savedCitations", JSON.stringify(savedCitations));

    displaySavedCitations();
    updateDashboard();
    openTab("citationsTab");
}

function displaySavedCitations() {
    const list = document.getElementById("savedCitationsList");
    if (!list) return;

    const savedCitations = JSON.parse(localStorage.getItem("savedCitations")) || [];
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
    const savedCitations = JSON.parse(localStorage.getItem("savedCitations")) || [];
    navigator.clipboard.writeText(savedCitations[index]);
    alert("Citation copied.");
}

function deleteCitation(index) {
    let savedCitations = JSON.parse(localStorage.getItem("savedCitations")) || [];
    if (!confirm("Delete this citation?")) return;

    savedCitations.splice(index, 1);
    localStorage.setItem("savedCitations", JSON.stringify(savedCitations));

    displaySavedCitations();
    updateDashboard();
}

function clearSavedCitations() {
    if (confirm("Delete all saved citations?")) {
        localStorage.removeItem("savedCitations");
        displaySavedCitations();
        updateDashboard();
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

function generateLiteratureReview() {
    const matrix = JSON.parse(localStorage.getItem("researchMatrix")) || [];
    const favorites = matrix.filter(item => item.favorite);
    const sourceData = favorites.length > 0 ? favorites : matrix;

    if (sourceData.length === 0) {
        alert("Add matrix entries first.");
        return;
    }

    let draft = "Literature Review Draft\n\n";
    draft += "Several studies have examined topics related to the present research.\n\n";

    sourceData.forEach(item => {
        draft += `${item.author} (${item.year}) examined ${item.purpose || "a related educational issue"}. `;

        if (item.method) draft += `The study used ${item.method} as its research method. `;
        if (item.findings) draft += `The findings showed that ${item.findings}. `;
        if (item.relevance) draft += `This is relevant to the present study because ${item.relevance}. `;

        draft += "\n\n";
    });

    draft += "Overall, these studies provide useful background for understanding the research problem. However, further investigation may still be needed to address the specific context, participants, and learning needs examined in the present study.";

    document.getElementById("literatureReviewOutput").value = draft;
}

function generateSynthesis() {
    const matrix = JSON.parse(localStorage.getItem("researchMatrix")) || [];

    if (matrix.length === 0) {
        alert("Add matrix entries first.");
        return;
    }

    let draft = "Research Synthesis\n\n";
    draft += "The reviewed studies show several recurring patterns. ";

    const methods = [...new Set(matrix.map(item => item.method).filter(Boolean))];

    if (methods.length > 0) {
        draft += `Common research methods include ${methods.join(", ")}. `;
    }

    draft += "Across the studies, the findings suggest that the topic is influenced by context, teaching practices, learner needs, and institutional support. ";

    draft += "These patterns may help strengthen the foundation of the present study and support the development of the research problem.\n\n";

    matrix.forEach(item => {
        if (item.relevance) {
            draft += `The study by ${item.author} (${item.year}) is useful because ${item.relevance}.\n`;
        }
    });

    document.getElementById("literatureReviewOutput").value = draft;
}

function copyLiteratureReview() {
    const draft = document.getElementById("literatureReviewOutput").value;

    if (!draft.trim()) {
        alert("Generate a literature review first.");
        return;
    }

    navigator.clipboard.writeText(draft);
    alert("Literature review draft copied.");
}

function clearLiteratureReview() {
    document.getElementById("literatureReviewOutput").value = "";
}

function saveChapterOrganizer() {
    const organizer = {
        theoreticalFramework: document.getElementById("theoreticalFramework").value,
        conceptualFramework: document.getElementById("conceptualFramework").value,
        relatedLiterature: document.getElementById("relatedLiterature").value,
        relatedStudies: document.getElementById("relatedStudies").value,
        gapAnalysis: document.getElementById("gapAnalysis").value
    };

    localStorage.setItem("chapterOrganizer", JSON.stringify(organizer));
    alert("Chapter 2 organizer saved.");
}

function loadChapterOrganizer() {
    const organizer = JSON.parse(localStorage.getItem("chapterOrganizer")) || {};

    document.getElementById("theoreticalFramework").value = organizer.theoreticalFramework || "";
    document.getElementById("conceptualFramework").value = organizer.conceptualFramework || "";
    document.getElementById("relatedLiterature").value = organizer.relatedLiterature || "";
    document.getElementById("relatedStudies").value = organizer.relatedStudies || "";
    document.getElementById("gapAnalysis").value = organizer.gapAnalysis || "";
}

function copyChapterOrganizer() {
    const content =
`THEORETICAL FRAMEWORK

${document.getElementById("theoreticalFramework").value}

CONCEPTUAL FRAMEWORK

${document.getElementById("conceptualFramework").value}

RELATED LITERATURE

${document.getElementById("relatedLiterature").value}

RELATED STUDIES

${document.getElementById("relatedStudies").value}

GAP ANALYSIS

${document.getElementById("gapAnalysis").value}`;

    navigator.clipboard.writeText(content);
    alert("Chapter 2 organizer copied.");
}

function clearChapterOrganizer() {
    if (confirm("Clear Chapter 2 organizer?")) {
        localStorage.removeItem("chapterOrganizer");
        loadChapterOrganizer();
    }
}

function generateResearchGap() {
    const topic = document.getElementById("studyTopic").value.trim();
    const matrix = JSON.parse(localStorage.getItem("researchMatrix")) || [];

    if (!topic) {
        alert("Please enter your study topic.");
        return;
    }

    let gap = "Possible Research Gap\n\n";

    gap += `The present study focuses on ${topic}.\n\n`;

    if (matrix.length > 0) {
        gap += "Based on the reviewed studies, existing research has already examined several related areas. ";

        const methods = [...new Set(matrix.map(item => item.method).filter(Boolean))];

        if (methods.length > 0) {
            gap += `Many of the studies used methods such as ${methods.join(", ")}. `;
        }

        gap += "However, the reviewed studies may not fully address the specific context, learner population, or classroom situation targeted in the present study.\n\n";
    }

    gap += "This suggests a possible research gap: while previous studies provide useful background, there appears to be a need for further investigation into the specific challenges, experiences, and instructional needs related to this topic.\n\n";

    gap += "Therefore, the present study may contribute by providing context-specific insights that can help educators, administrators, and future researchers better understand the issue.";

    document.getElementById("researchGapOutput").value = gap;
    document.getElementById("gapAnalysis").value = gap;
    saveChapterOrganizer();
}

function copyResearchGap() {
    const gap = document.getElementById("researchGapOutput").value;

    if (!gap.trim()) {
        alert("Generate a research gap first.");
        return;
    }

    navigator.clipboard.writeText(gap);
    alert("Research gap copied.");
}

displayNotes();
displayMatrix();
displayFavorites();
displaySavedCitations();
loadChapterOrganizer();
updateDashboard();
