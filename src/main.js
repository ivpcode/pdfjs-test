import * as pdfjs from 'pdfjs-dist/build/pdf.mjs';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
import 'pdfjs-dist/web/pdf_viewer.css';
import './main.css'

import PdfPage from './pdf_page';


// This file is intentionally left blank.
var __PDF_DOC,
    __CURRENT_PAGE,
    __TOTAL_PAGES,
    __PAGE_RENDERING_IN_PROGRESS = 0,
    __CANVAS = document.querySelector('#pdf-canvas'),
    __CANVAS_CTX = __CANVAS.getContext('2d');

async function showPDF(pdf_url) {
    document.querySelector("#pdf-loader").style.display = 'block';

    const pdf_doc = await PDFJS.getDocument({ url: pdf_url }).promise
    __PDF_DOC = pdf_doc;
    __TOTAL_PAGES = __PDF_DOC.numPages;

    // Hide the pdf loader and show pdf container in HTML
    document.querySelector("#pdf-loader").style.display = 'none';
    document.querySelector("#pdf-contents").style.display = 'block';
    document.querySelector("#pdf-total-pages").innerText = __TOTAL_PAGES

    document.querySelector("#pdf-loader").style.display = 'block';
    document.querySelector("#pdf-current-page").innerText = 1
    await showPage(1);
    document.querySelector("#pdf-loader").style.display = 'none';
}

async function showPage(page_no) {

    let pdfpage = new PdfPage(__PDF_DOC, page_no);
    document.querySelector("#pdf-contents").appendChild(pdfpage);
    
    /*
    const page = await __PDF_DOC.getPage(page_no)

    const pdf_contents = document.querySelector("#pdf-contents");
    const canvas = document.querySelector("#pdf-canvas");
    const canvas_ctx = canvas.getContext('2d');
    const text_layer = document.querySelector("#text-layer")

    const rc = pdf_contents.getBoundingClientRect()

    canvas.width = rc.width

    let viewport = page.getViewport({ scale: 1 });
    let scale = canvas.width / viewport.width;

    viewport = page.getViewport({ scale: scale });
    canvas.height = viewport.height;

    pdf_contents.style.setProperty('--total-scale-factor', scale);

    var renderContext = {
        canvasContext: canvas_ctx,
        viewport: viewport
    };

    await page.render(renderContext).promise

    text_layer.innerHTML = ""

    const textContentSource = page.streamTextContent({ includeMarkedContent: true });

    const parameters = {
        container: text_layer,
        textContentSource,
        viewport,
    };

    const render_task = new PDFJS.TextLayer(parameters);

    await render_task.render();

    requestAnimationFrame(() => {
        const offset = canvas.getBoundingClientRect()
        const tlrc = text_layer.getBoundingClientRect()
        text_layer.style.left = offset.left + 'px'
        text_layer.style.top = offset.top + 'px'
        if (tlrc.height < canvas.height) {
            text_layer.style.height = canvas.height + 'px'
        }
    })*/

}

document.addEventListener("DOMContentLoaded", () => {

    // Previous page of the PDF
    document.querySelector("#pdf-prev").addEventListener('click', function () {
        if (__CURRENT_PAGE != 1)
            showPage(--__CURRENT_PAGE);
    });

    document.querySelector("#pdf-next").addEventListener('click', function () {
        if (__CURRENT_PAGE != __TOTAL_PAGES)
            showPage(++__CURRENT_PAGE);
    });

    window.PDFJS = pdfjs
    PDFJS.GlobalWorkerOptions.workerSrc = pdfjsWorker //"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.3.31/pdf.worker.mjs"
    showPDF("/247-2025-R-idr.pdf")
})

