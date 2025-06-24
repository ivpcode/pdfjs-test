import * as pdfjs from 'pdfjs-dist/build/pdf.mjs';

import './pdf_page.css'
import 'pdfjs-dist/web/pdf_viewer.css';

export default class PdfPage extends HTMLElement {

    constructor(pdf_doc, page_number) {
        super();

        this.pdf_doc = pdf_doc;
        this.page_number = page_number;

        this.canvas = null;
        this.text_layer = null;
        this.render_active = false

        this._is_rendering = false

        this.render_text = false;
    }

    async connectedCallback() {

        this.RenderPdf()

    }

    disconnectedCallback() {


    }


    async RenderPdf(active) {
        if (active != null)
            this.render_active = active

        if (this.render_active != true) {
            
            if (this.text_layer != null)
                this.text_layer.remove();

            if (this.canvas != null)
                this.canvas.remove();

            this.text_layer = null
            this.canvas = null

            const page = await this.pdf_doc.getPage(this.page_number);

            const rc = this.parentNode.getBoundingClientRect()

            this.style.width = rc.width + 'px'

            let viewport = page.getViewport({ scale: 1 });
            let scale = rc.width / viewport.width;

            viewport = page.getViewport({ scale: scale });
            this.style.height = viewport.height + 'px'

            return
        }

        console.log('RenderPdf')

        if (this.pdf_doc && this.page_number && !this._is_rendering) {
            
            this._is_rendering = true
            try {
                
                if (this.canvas != null)
                    this.canvas.remove();

                if (this.text_layer != null)
                    this.text_layer.remove();

                this.canvas = document.createElement('canvas');
                this.text_layer = document.createElement('div');
                this.text_layer.className = 'textLayer';

                this.appendChild(this.canvas);
                this.appendChild(this.text_layer);

                const page = await this.pdf_doc.getPage(this.page_number);

                const canvas_ctx = this.canvas.getContext('2d');

                const rc = this.parentNode.getBoundingClientRect()

                this.canvas.width = rc.width

                let viewport = page.getViewport({ scale: 1 });
                let scale = this.canvas.width / viewport.width;

                viewport = page.getViewport({ scale: scale });
                this.canvas.height = viewport.height;

                this.style.width = rc.width + 'px'
                this.style.height = viewport.height + 'px'

                this.parentNode.style.setProperty('--total-scale-factor', scale);

                var renderContext = {
                    canvasContext: canvas_ctx,
                    viewport: viewport
                };

                await page.render(renderContext).promise

                if ( this.render_text==true) {
                    const textContentSource = page.streamTextContent({ includeMarkedContent: true });

                    const parameters = {
                        container: this.text_layer,
                        textContentSource,
                        viewport,
                        textDivs: []
                    };

                    const render_task = new pdfjs.TextLayer(parameters);

                    await render_task.render();
                }

            } finally {
                this._is_rendering = false
            }
        }
    }
}

customElements.define('pdf-page', PdfPage);
