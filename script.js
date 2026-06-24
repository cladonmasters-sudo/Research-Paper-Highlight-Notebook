const fileInput = document.getElementById("pdfUpload");
const viewer = document.getElementById("viewer");

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

fileInput.addEventListener("change", function (event) {
  const file = event.target.files[0];

  if (!file || file.type !== "application/pdf") {
    viewer.innerHTML = "Please upload a valid PDF file.";
    return;
  }

  const reader = new FileReader();

  reader.onload = function () {
    const typedArray = new Uint8Array(this.result);

    pdfjsLib.getDocument(typedArray).promise.then(function (pdf) {
      viewer.innerHTML = "";

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        renderPage(pdf, pageNum);
      }
    });
  };

  reader.readAsArrayBuffer(file);
});

function renderPage(pdf, pageNum) {
  pdf.getPage(pageNum).then(function (page) {
    const scale = 1.3;
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    canvas.className = "pdf-page";

    const context = canvas.getContext("2d");
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    viewer.appendChild(canvas);

    page.render({
      canvasContext: context,
      viewport: viewport
    });
  });
}
