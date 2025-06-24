import * as pdfjs from 'pdfjs-dist/build/pdf.mjs';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
import 'pdfjs-dist/web/pdf_viewer.css';
import PdfPage from './pdf_page.js';

const console = {
    log: (...args) => {
        if (window.location.href.includes('localhost')) {
            console.log(...args);
        }
    },
    error: (...args) => {
        if (window.location.href.includes('localhost')) {
            console.log(...args);
        }
    },
    debug: (...args) => {
        if (window.location.href.includes('localhost')) {
            console.log(...args);
        }
    },
    info: (...args) => {
        if (window.location.href.includes('localhost')) {
            console.log(...args);
        }
    }
}

export default class PdfViewer extends HTMLElement {

    constructor() {
        super();

        //this.attachShadow({ mode: 'open' });
        this._pages = [];
        this.loadedImages = new Set();
        this.observer = null;
        
        this.page_width = 2550;
        this.page_height = 3330;

        this.pdf_doc = null

        this.innerHTML = `
            <style>
                :host {
                    display: block;
                    width: 100%;
                    overflow-y: auto;
                    max-height: 100vh;
                    box-sizing: border-box;
                }
                .page-container {
                    width: 100%;
                    display: flex;
                    justify-content: center;
                    margin-bottom: 10px;
                }
                .page {
                    width: 100%;
                    max-width: 2100px;
                    background-color: #f0f0f0; /* Colore placeholder */
                    background-size: contain; /* Equivalente a object-fit: contain */
                    background-position: center;
                    background-repeat: no-repeat;
                    display: block;
                }
                .page.error {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: red;
                    font-size: 16px;
                }
                .page img {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                    display: block;
                }
                .this_viewer {
                    background-color: #000000; /* Colore di sfondo */
                }
            </style>
            <div class="this_viewer"></div>
        `
        this.viewer = this.querySelector('.this_viewer')

        if (pdfjs.GlobalWorkerOptions.workerSrc == null || pdfjs.GlobalWorkerOptions.workerSrc === '') 
            pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker
    }

    async SetPdfUrl(pdfUrl) {
        this.pdf_doc = await pdfjs.getDocument({ url: pdfUrl }).promise
        this.render()
    }

    connectedCallback() {
        this.setupIntersectionObserver();

        window.addEventListener('resize', this.ResizeHandler.bind(this));
    }

    disconnectedCallback() {
        if (this.observer) {
            this.observer.disconnect()
        }

        if (this.ResizeHandler) {
            window.removeEventListener('resize', this.ResizeHandler);
        }

        if (this._resizeTimeout) {
            clearTimeout(this._resizeTimeout);
        }
    }

    ResizeHandler() {
        clearTimeout(this._resizeTimeout);
        this._resizeTimeout = setTimeout(() => {
            this.querySelectorAll('pdf-page').forEach(page => {
                page.RenderPdf()
            })
        }, 350)
    }

    render() {
        this.viewer.innerHTML = ''
        if (this.pdf_doc == null) 
            return

        for(let i=0;i<this.pdf_doc.numPages;i++) {       

            let pdfpage = new PdfPage(this.pdf_doc, i+1);
            pdfpage.classList.add(`page-${i+1}`)
            if (i < 2) {
                //this.loadImage(page, url, index)
                pdfpage.render_active = true;
            }

            const pageDiv = document.createElement('div')
            pageDiv.className = 'page-container'
            pageDiv.dataset.pageIndex = i

            pageDiv.appendChild(pdfpage)
            this.viewer.appendChild(pageDiv)
        }

        setTimeout(() => {
            this.querySelectorAll('.page-container').forEach(page => {
                this.observer.observe(page)
            });
        },500)
    }

    setupIntersectionObserver() {
        this.observer = new IntersectionObserver(
            (entries) => {
                entries.forEach( async (entry) => {

                    const pageDiv = entry.target;
                    const page = pageDiv.querySelector('pdf-page');

                    if (entry.isIntersecting) {
                        
                        await page.RenderPdf(true)
                        
                    } else {
                        const index = parseInt(pageDiv.dataset.pageIndex)

                        await page.RenderPdf(false)
                    }
                });
            },
            {
                root: null,
                rootMargin: this._rootMargin,
                threshold: 0.01
            }
        );

        setTimeout
        this.querySelectorAll('.page-container').forEach(page => {
            this.observer.observe(page);
        });
    }

    GoToPage(pageNumber) {
        if (!Number.isInteger(pageNumber) || pageNumber < 1 || pageNumber > this.pdf_doc.numPages) {
            console.error(`Errore: Numero di pagina non valido. Deve essere tra 1 e ${this.pdf_doc.numPages}`)
            return;
        }

        const page = this.querySelector(`.page-${pageNumber}`)
        if (page) {
            
            page.scrollIntoView({ behavior: 'auto', block: 'start' })

        } else {
            console.error(`Errore: Contenitore della pagina ${pageNumber} non trovato`)
        }
    }

    RenderText(render) {
        this.querySelectorAll('pdf-page').forEach(page => {
            page.render_text = render
            page.RenderPdf()
        })
    }
}

customElements.define('pdf-viewer', PdfViewer)