export default class CanvasController {
    constructor(genotypeCanvas) {
        this.genotypeCanvas = genotypeCanvas;
        this.dragStartX = null;
        this.dragStartY = null;
        this.draggingCanvas = false;
        this.draggingVerticalScrollbar = false;
        this.draggingHorizontalScrollbar = false;
        this.contextMenuY = null;

        this.genotypeCanvas.canvas.addEventListener('mousedown', (e) => {
            // The following block of code is used to determine if we are scrolling
            // using the scrollbar widget, rather than grabbing the canvas
            const rect = this.genotypeCanvas.canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left) / (rect.right - rect.left) * this.genotypeCanvas.backBuffer.width;
            const y = (e.clientY - rect.top) / (rect.bottom - rect.top) * this.genotypeCanvas.backBuffer.height;

            const { verticalScrollbar, horizontalScrollbar } = this.genotypeCanvas;

            if (this.isOverVerticalScrollbar(x, verticalScrollbar)) {
                // Flag to remember that the scrollbar widget was initially clicked on
                // which prevents mouse drift prematurely stopping scrolling from happening
                this.draggingVerticalScrollbar = true;
                this.dragVerticalScrollbar(e.clientY);
            } else if (this.isOverHorizontalScrollbar(y, horizontalScrollbar)) {
                // Flag to remember that the scrollbar widget was initially clicked on
                // which prevents mouse drift prematurely stopping scrolling from happening
                this.draggingHorizontalScrollbar = true;
                this.dragHorizontalScrollbar(e.clientX);
            }
        });

        this.genotypeCanvas.canvas.addEventListener('mousemove', (e) => {
            const mousePos = this.getCanvasMouseLocation(e.clientX, e.clientY);
            this.genotypeCanvas.mouseOver(mousePos.x, mousePos.y);
        });

        this.genotypeCanvas.canvas.addEventListener('mouseleave', () => {
            this.genotypeCanvas.mouseOver(undefined, undefined);
        });

        window.addEventListener('mouseup', () => {
            this.draggingCanvas = false;
            this.draggingVerticalScrollbar = false;
            this.draggingHorizontalScrollbar = false;
        });

        window.addEventListener('mousemove', (e) => {
            if (this.draggingVerticalScrollbar) {
                this.dragVerticalScrollbar(e.clientY);
            } else if (this.draggingHorizontalScrollbar) {
                this.dragHorizontalScrollbar(e.clientX);
            } else if (this.draggingCanvas) {
                this.dragCanvas(e.pageX, e.pageY);
            }
        });

    }

    getCanvasMouseLocation(clientX, clientY) {
        const rect = this.genotypeCanvas.canvas.getBoundingClientRect();
        const x = (clientX - rect.left) / (rect.right - rect.left) * this.genotypeCanvas.backBuffer.width;
        const y = (clientY - rect.top) / (rect.bottom - rect.top) * this.genotypeCanvas.backBuffer.height;

        return { x, y };
    }

    isOverVerticalScrollbar(x, verticalScrollbar) {
        return x >= verticalScrollbar.x && x <= verticalScrollbar.x + verticalScrollbar.widget.width;
    }

    isOverHorizontalScrollbar(y, horizontalScrollbar) {
        return y >= horizontalScrollbar.y && y <= horizontalScrollbar.y + horizontalScrollbar.widget.height;
    }

    dragVerticalScrollbar(clientY) {
        // Grab various variables which allow us to calculate the y coordinate
        // relative to the allele canvas
        const rect = this.genotypeCanvas.canvas.getBoundingClientRect();
        const alleleCanvasHeight = this.genotypeCanvas.alleleCanvasHeight();
        const { mapCanvasHeight } = this.genotypeCanvas;
        const rectTop = (rect.top + mapCanvasHeight);
        // Calculate the y coordinate of the mouse on the allele canvas
        const y = (clientY - rectTop) / (rect.bottom - rectTop) * alleleCanvasHeight;
        // Move the vertical scrollbar to coorodinate y
        this.genotypeCanvas.dragVerticalScrollbar(y);
    }

    dragHorizontalScrollbar(clientX) {
        // Grab various variables which allow us to calculate the x coordinate
        // relative to the allele canvas
        const rect = this.genotypeCanvas.canvas.getBoundingClientRect();
        const alleleCanvasWidth = this.genotypeCanvas.alleleCanvasWidth();
        const { nameCanvasWidth } = this.genotypeCanvas;
        const rectLeft = (rect.left + nameCanvasWidth);
        // Calculate the x coordinate of the mouse on the allele canvas
        const x = (clientX - rectLeft) / (rect.right - rectLeft) * alleleCanvasWidth;
        // Move the vertical scrollbar to coorodinate x
        this.genotypeCanvas.dragHorizontalScrollbar(x);
    }

    dragCanvas(x, y) {
        const diffX = x - this.dragStartX;
        const diffY = y - this.dragStartY;
        this.dragStartX = x;
        this.dragStartY = y;

        this.genotypeCanvas.move(diffX, diffY);
    }
}