const STORAGE_KEY = "researchNotebookV2";

function getInput(id) {
  return document.getElementById(id).value.trim();
}

function setInput(id, value) {
  document.getElementById(id).value = value || "";
}

function showStatus(message) {
  const status = document.getElementById("status");
  status.textContent = message;
  status.style.display = "block";
}

function getArticles() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function saveArticles(articles) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
}

function getCurrentArticle() {
  return {
    id: getInput("title").toLowerCase().replace(/\s+/g, "-") || Date.now().toString(),
    title: getInput("title"),
    authors: getInput("authors"),
    year: getInput("year"),
    journal: getInput("journal"),
    url: getInput("url"),
    tags: getInput("tags"),
    summary: getInput("summary"),
    findings: getInput("findings"),
    quotes: getInput("quotes"),
    reflection: getInput("reflection"),
    useInResearch: getInput("useInResearch"),
    apa: getInput("apa"),
    savedAt: new Date().toLocaleString()
  };
}

function saveArticle() {
  const article = getCurrentArticle();

  if (!article.title) {
    alert("Please enter the article title first.");
    return;
  }

  let articles = getArticles();
  const existingIndex = articles.findIndex(item => item.id === article.id);

  if (existingIndex >= 0) {
    articles[existingIndex] = article;
  } else {
    articles.push(article);
  }

  saveArticles(articles);
  showStatus("Article notes saved successfully.");
}

function loadArticle() {
  const title = getInput("title");

  if (!title) {
    alert("Type the article title first, then click Load Saved Notes.");
    return;
  }

  const id = title.toLowerCase().replace(/\s+/g, "-");
  const articles = getArticles();
  const article = articles.find(item => item.id === id);

  if (!article) {
    alert("No saved notes found for this title.");
    return;
  }

  setInput("authors", article.authors);
  setInput("year", article.year);
  setInput("journal", article.journal);
  setInput("url", article.url);
  setInput("tags", article.tags);
  setInput("summary", article.summary);
  setInput("findings", article.findings);
  setInput("quotes", article.quotes);
  setInput("reflection", article.reflection);
  setInput("useInResearch", article.useInResearch);
  setInput("apa", article.apa);

  showStatus("Saved notes loaded.");
}

function createWordContent(articles) {
  let content = `
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.5; }
        h1 { color: #2f2f2f; }
        h2 { margin-top: 30px; color: #4b3f32; }
        h3 { color: #5c4a38; }
        p { margin-bottom: 10px; }
        .article { page-break-after: always; }
      </style>
    </head>
    <body>
      <h1>Research Reading Notes</h1>
  `;

  articles.forEach((article, index) => {
    content += `
      <div class="article">
        <h2>${index + 1}. ${article.title || "Untitled Article"}</h2>

        <p><strong>Author/s:</strong> ${article.authors || ""}</p>
        <p><strong>Year:</strong> ${article.year || ""}</p>
        <p><strong>Journal / Source:</strong> ${article.journal || ""}</p>
        <p><strong>DOI / URL:</strong> ${article.url || ""}</p>
        <p><strong>Tags:</strong> ${article.tags || ""}</p>
        <p><strong>Saved:</strong> ${article.savedAt || ""}</p>

        <h3>Summary</h3>
        <p>${formatText(article.summary)}</p>

        <h3>Important Findings</h3>
        <p>${formatText(article.findings)}</p>

        <h3>Direct Quotes</h3>
        <p>${formatText(article.quotes)}</p>

        <h3>Reflection / My Understanding</h3>
        <p>${formatText(article.reflection)}</p>

        <h3>Possible Use in My Research</h3>
        <p>${formatText(article.useInResearch)}</p>

        <h3>APA 7 Citation</h3>
        <p>${formatText(article.apa)}</p>
      </div>
    `;
  });

  content += `
    </body>
    </html>
  `;

  return content;
}

function formatText(text) {
  if (!text) return "";
  return text.replace(/\n/g, "<br>");
}

function downloadWord(filename, content) {
  const blob = new Blob(["\ufeff", content], {
    type: "application/msword"
  });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

function exportCurrentWord() {
  const article = getCurrentArticle();

  if (!article.title) {
    alert("Please enter the article title before exporting.");
    return;
  }

  const content = createWordContent([article]);
  downloadWord(`${article.title || "research-notes"}.doc`, content);
}

function exportAllWord() {
  const articles = getArticles();

  if (articles.length === 0) {
    alert("No saved articles found.");
    return;
  }

  const content = createWordContent(articles);
  downloadWord("all-research-reading-notes.doc", content);
}

function exportBackup() {
  const articles = getArticles();

  const blob = new Blob([JSON.stringify(articles, null, 2)], {
    type: "application/json"
  });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "research-notebook-backup.json";
  link.click();
}

function recoverOldNotes() {
  let recovered = [];
  const existingArticles = getArticles();

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const value = localStorage.getItem(key);

    if (key === STORAGE_KEY) continue;

    if (
      value &&
      value.length > 20 &&
      (
        key.toLowerCase().includes("note") ||
        key.toLowerCase().includes("journal") ||
        key.toLowerCase().includes("article") ||
        key.toLowerCase().includes("research")
      )
    ) {
      recovered.push({
        id: "recovered-" + Date.now() + "-" + i,
        title: "Recovered Note from " + key,
        authors: "",
        year: "",
        journal: "",
        url: "",
        tags: "recovered old notes",
        summary: "",
        findings: "",
        quotes: "",
        reflection: value,
        useInResearch: "",
        apa: "",
        savedAt: new Date().toLocaleString()
      });
    }
  }

  if (recovered.length === 0) {
    alert("No old notes were found in localStorage.");
    return;
  }

  saveArticles([...existingArticles, ...recovered]);
  alert(recovered.length + " old note/s recovered. Click Export All Notes to Word.");
}
