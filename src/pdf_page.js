import './pdf_page.css'
import 'pdfjs-dist/web/pdf_viewer.css';

export default class PdfPage extends HTMLElement {

    constructor(pdf_doc, page_number) {
        super();
        // Puoi aggiungere uno shadow DOM se vuoi: this.attachShadow({mode: 'open'});

        this.pdf_doc = pdf_doc;
        this.page_number = page_number;
        //this.attachShadow({ mode: 'open' });
        this.canvas = null;
        this.text_layer = null;
    }

    async connectedCallback() {
        // Crea canvas e text layer
        this.canvas = document.createElement('canvas');

        this.RenderPdf()

        let resizeTimeout;
        window.addEventListener('resize',this.ResizeHandler.bind(this));
    }

    disconnectedCallback() {
        // Rimuovi il listener resize quando il componente viene scollegato dal DOM
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
            this.RenderPdf();
        }, 350)
    }
    async RenderPdf() {
        console.log('RenderPdf')
        // Se pdf_doc e page_number sono validi, renderizza la pagina
        if (this.pdf_doc && this.page_number) {

            if (this.text_layer != null)
                this.text_layer.remove();

            this.text_layer = document.createElement('div');
            this.text_layer.className = 'textLayer';

            // Aggiungi al shadow DOM
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

            this.parentNode.style.setProperty('--total-scale-factor', scale);

            var renderContext = {
                canvasContext: canvas_ctx,
                viewport: viewport
            };

            await page.render(renderContext).promise


            const textContentSource = page.streamTextContent({ includeMarkedContent: true });

            const parameters = {
                container: this.text_layer,
                textContentSource,
                viewport,
                textDivs: []
            };

            const render_task = new PDFJS.TextLayer(parameters);

            await render_task.render();

            // requestAnimationFrame(() => {
            //     const offset = this.canvas.getBoundingClientRect()
            //     const tlrc = this.text_layer.getBoundingClientRect()
            //     this.text_layer.style.left = offset.left + 'px'
            //     this.text_layer.style.top = offset.top + 'px'
            //     if (tlrc.height < this.canvas.height) {
            //         this.text_layer.style.height = this.canvas.height + 'px'
            //     }
            // })
        }
    }

}

customElements.define('pdf-page', PdfPage);
