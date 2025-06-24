import './main.css'

import PdfViewer from './pdf_viewer';

document.addEventListener("DOMContentLoaded", () => {

    //const el = document.createElement("pdf-viewer")
    const el = new PdfViewer()
    document.getElementById('pdf-main-container').appendChild(el)

    el.SetPdfUrl('/247-2025-R-idr.pdf')

})

