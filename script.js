function exportData() {
    const notes = JSON.parse(localStorage.getItem("researchNotes")) || {};
    const matrix = JSON.parse(localStorage.getItem("researchMatrix")) || [];

    let content = `
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Research Notebook Export</title>
        </head>
        <body>
            <h1>Research Notebook Export</h1>
            <h2>Research Notes</h2>
    `;

    for (const category in notes) {
        content += `<h3>${category}</h3><ul>`;

        notes[category].forEach(note => {
            content += `<li>${note}</li>`;
        });

        content += `</ul>`;
    }

    content += `
        <h2>Research Matrix</h2>
        <table border="1" cellspacing="0" cellpadding="6">
            <tr>
                <th>Author</th>
                <th>Year</th>
                <th>Purpose</th>
                <th>Method</th>
                <th>Findings</th>
                <th>Relevance</th>
            </tr>
    `;

    matrix.forEach(item => {
        content += `
            <tr>
                <td>${item.author}</td>
                <td>${item.year}</td>
                <td>${item.purpose}</td>
                <td>${item.method}</td>
                <td>${item.findings}</td>
                <td>${item.relevance}</td>
            </tr>
        `;
    });

    content += `
        </table>
        </body>
        </html>
    `;

    const blob = new Blob([content], {
        type: "application/msword"
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "ResearchNotebook.doc";
    link.click();
}
