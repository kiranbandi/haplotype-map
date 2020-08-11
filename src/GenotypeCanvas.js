import ScrollBar from './ScrollBar';

export default class GenotypeCanvas {
    constructor(width, height, boxSize) {
        this.canvas = document.createElement('canvas');
        this.canvas.width = width;
        this.canvas.height = height;
        this.drawingContext = this.canvas.getContext('2d');

        this.backBuffer = document.createElement('canvas');
        this.backBuffer.width = width;
        this.backBuffer.height = height;
        this.backContext = this.backBuffer.getContext('2d');
        this.mapCanvasHeight = 60;
        this.nameCanvasWidth = 100;

        this.scrollbarWidth = 10;
        this.scrollbarHeight = 10;

        this.backContext.lineWidth = 1;

        this.boxSize = boxSize;
        this.fontSize = 100;
        this.font = undefined;

        this.verticalScrollbar = new ScrollBar(width, this.alleleCanvasHeight() + this.scrollbarHeight,
            this.scrollbarWidth, this.alleleCanvasHeight(), true);
        this.horizontalScrollbar = new ScrollBar(this.alleleCanvasWidth(),
            height, this.alleleCanvasWidth(), this.scrollbarHeight, false);

        this.translatedX = 0;
        this.translatedY = 0;
        this.colorScheme = undefined;

        this.markerUnderMouse = undefined;
        this.markerIndexUnderMouse = undefined;
        this.chromosomeUnderMouse = -1;
        this.lineUnderMouse = undefined;
        this.markerNameFont = '10px sans-serif';

        this.dataSet = undefined;

        // Visual start and end points for each chromosome
        this.chromosomeStarts = [];
        this.chromosomeEnds = [];

        this.chromosomeGapSize = 50;

        this.comparisonLineIndex = 0;
    }

    totalChromosomeGap() {
        return (this.dataSet.genomeMap.chromosomes.length - 1) * this.chromosomeGapSize;
    }

    maxCanvasWidth() {
        return Math.max((this.dataSet.markerCount() * this.boxSize) +
            this.totalChromosomeGap(), this.alleleCanvasWidth());
    }

    maxCanvasHeight() {
        return Math.max(this.dataSet.lineCount() * this.boxSize, this.alleleCanvasHeight());
    }

    alleleCanvasWidth() {
        return this.canvas.width - this.nameCanvasWidth - this.scrollbarWidth;
    }

    alleleCanvasHeight() {
        return this.canvas.height - this.mapCanvasHeight - this.scrollbarHeight;
    }

    maxDataHeight() {
        return this.dataSet.lineCount() * this.boxSize;
    }

    maxDataWidth() {
        return (this.dataSet.markerCount() * this.boxSize) + ((this.dataSet.chromosomeCount() - 1) * this.chromosomeGapSize);
    }

    chromosomeOffset(xPos) {
        let chromStart = 0;
        this.chromosomeEnds.forEach((end, index) => {
            if (xPos > end) {
                chromStart = (index + 1) * this.chromosomeGapSize;
            }
        });

        return chromStart;
    }

    chromosomeIndexFor(xPos) {
        let chrIndex = -1;
        this.chromosomeEnds.forEach((end, index) => {
            const start = this.chromosomeStarts[index];
            if (xPos >= start && xPos <= end) {
                chrIndex = index;
            }
        });

        return chrIndex;
    }

    init(dataSet, colorScheme) {
        this.dataSet = dataSet;
        this.colorScheme = colorScheme;
        this.font = this.updateFontSize();
        this.updateVisualPositions();
        this.colorScheme.setupColorStamps(this.boxSize, this.font, this.fontSize);
        this.zoom(this.boxSize);
    }

    prerender(redraw) {
        this.drawingContext.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (redraw) {
            // We need to calculate an offset because the gaps between chromosomes
            // aren't part of the data model
            const dataWidth = Math.ceil((this.alleleCanvasWidth()) / this.boxSize);

            const offset = this.chromosomeOffset(this.translatedX);

            const markerStart = Math.floor((this.translatedX - offset) / this.boxSize);
            const markerEnd = Math.min(markerStart + dataWidth, this.dataSet.markerCount());

            const germplasmStart = Math.floor(this.translatedY / this.boxSize);
            const germplasmEnd = Math.min(germplasmStart +
                Math.floor(this.canvas.height / this.boxSize), this.dataSet.lineCount());

            const yWiggle = this.translatedY - (germplasmStart * this.boxSize);

            this.render(germplasmStart, germplasmEnd, markerStart, markerEnd, yWiggle);
        }

        this.drawingContext.drawImage(this.backBuffer, 0, 0);
    }

    calcMapMarkerPos(marker, firstMarkerPos, mapScaleFactor, drawStart) {
        let mapMarkerPos = ((marker.position - firstMarkerPos) * (mapScaleFactor));
        mapMarkerPos = drawStart > 0 ? mapMarkerPos + drawStart : mapMarkerPos;

        return mapMarkerPos;
    }


    render(germplasmStart, germplasmEnd, markerStart, markerEnd, yWiggle) {
        this.backContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.renderGermplasmNames(germplasmStart, germplasmEnd, yWiggle);
        this.renderGermplasm(germplasmStart, germplasmEnd, markerStart, markerEnd, yWiggle);
        this.renderScrollbars();
    }

    renderMarker(mapCanvas, marker, genoMarkerPos, firstMarkerPos, mapScaleFactor, drawStart) {
        const mapMarkerPos = this.calcMapMarkerPos(marker, firstMarkerPos, mapScaleFactor, drawStart);
        // console.log(drawStart, firstMarkerPos, marker.position, mapMarkerPos);
        mapCanvas.beginPath();
        // Draw vertical line on top of map rectangle
        mapCanvas.moveTo(mapMarkerPos, 0);
        mapCanvas.lineTo(mapMarkerPos, 10);
        // Draw diagonal line to marker position on the genotype canvas
        mapCanvas.lineTo(genoMarkerPos, 30);
        // Draw a vertical line down to the genotype canvas
        mapCanvas.lineTo(genoMarkerPos, 40);
        mapCanvas.stroke();
    }

    renderMarkers(renderData) {
        renderData.forEach((chr) => {
            const chrStart = this.chromosomeStarts[chr.chromosomeIndex];
            const chrEnd = this.chromosomeEnds[chr.chromosomeIndex];
            const drawStart = chrStart - this.translatedX;

            const chromosome = this.dataSet.genomeMap.chromosomes[chr.chromosomeIndex];

            const potentialWidth = drawStart > 0 ? this.alleleCanvasWidth() - drawStart : this.alleleCanvasWidth();
            const chromosomeWidth = Math.min(chrEnd - this.translatedX, potentialWidth, chrEnd - chrStart);

            // The data array can have too many markers in it due to the gaps between
            // chromosomes, this is a fudge to ensure we don't try to draw too many markers
            const chromosomeMarkerWidth = Math.max(0, Math.floor(chromosomeWidth / this.boxSize));
            const dataWidth = Math.min(chr.lastMarker - chr.firstMarker, chromosomeMarkerWidth);

            const firstMarkerPos = chromosome.markers[chr.firstMarker].position;
            const lastMarkerPos = chromosome.markers[chr.firstMarker + dataWidth].position;
            const dist = (lastMarkerPos - firstMarkerPos);
            const scaleFactor = chromosomeWidth / dist;

            for (let markerIndex = chr.firstMarker; markerIndex <= chr.lastMarker; markerIndex += 1) {
                const marker = this.dataSet.genomeMap.chromosomes[chr.chromosomeIndex].markers[markerIndex];
                let xPos = drawStart + (markerIndex * this.boxSize);
                xPos += (this.boxSize / 2);
                this.renderMarker(this.backContext, marker, xPos, firstMarkerPos, scaleFactor, drawStart);
            }
        });
    }

    renderChromosomes(chromosomeData) {
        chromosomeData.forEach((chr) => {
            const chrStart = this.chromosomeStarts[chr.chromosomeIndex];
            const chrEnd = this.chromosomeEnds[chr.chromosomeIndex];
            const drawStart = chrStart - this.translatedX;
            this.backContext.strokeRect(drawStart, 1, chrEnd - chrStart, 10);
        });
    }

    renderMap(markerStart, markerEnd) {
        this.backContext.save();
        // Set the line style for drawing the map and markers
        this.backContext.lineWidth = 1;
        this.backContext.strokeStyle = 'gray';

        // Create a clipping region so that lineNames can't creep up above the line
        // name canvas
        const region = new Path2D();
        region.rect(this.nameCanvasWidth, 0, this.alleleCanvasWidth(), this.mapCanvasHeight);
        this.backContext.clip(region);

        // Translate to the correct position to draw the map
        this.backContext.translate(this.nameCanvasWidth, 10);

        const renderData = this.dataSet.markersToRender(markerStart, markerEnd);

        this.renderChromosomes(renderData);
        this.renderMarkers(renderData);

        this.backContext.restore();
    }

    renderGermplasmNames(germplasmStart, germplasmEnd, yWiggle) {
        this.backContext.save();

        // Create a clipping region so that lineNames can't creep up above the line
        // name canvas
        const region = new Path2D();
        // We need to take account of the scrollbar potentially disappearing when
        //zoomed out
        const clipHeight = this.canScrollX() ? this.alleleCanvasHeight() : this.canvas.height;
        region.rect(0, this.mapCanvasHeight, this.nameCanvasWidth,
            clipHeight);
        this.backContext.clip(region);

        const lineNames = this.dataSet.germplasmFor(germplasmStart, germplasmEnd)
            .map(germplasm => germplasm.name);

        this.backContext.fillStyle = '#333';
        this.backContext.font = this.font;
        this.backContext.translate(0, this.mapCanvasHeight);

        lineNames.forEach((name, idx) => {
            const y = (idx * this.boxSize) - yWiggle + (this.boxSize - (this.fontSize / 2));
            this.backContext.fillText(name, 0, y);
        });
        this.backContext.restore();
    }

    renderGermplasm(germplasmStart, germplasmEnd, markerStart, markerEnd, yWiggle) {
        this.backContext.save();

        const renderData = this.dataSet.markersToRender(markerStart, markerEnd);

        // Clip so that we can only draw into the region that is intended to be the
        // genotype canvas
        const region = new Path2D();
        region.rect(this.nameCanvasWidth, this.mapCanvasHeight, this.canvas.width, this.canvas.height);
        this.backContext.clip(region);

        this.backContext.translate(this.nameCanvasWidth, this.mapCanvasHeight);

        for (let germplasm = germplasmStart, line = 0; germplasm < germplasmEnd; germplasm += 1, line += 1) {
            const yPos = (line * this.boxSize) - yWiggle;

            renderData.forEach((chr) => {
                const chrStart = this.chromosomeStarts[chr.chromosomeIndex] - this.translatedX;
                for (let marker = chr.firstMarker; marker <= chr.lastMarker; marker += 1) {
                    const xPos = chrStart + (marker * this.boxSize);

                    const stamp = this.colorScheme.getState(germplasm, chr.chromosomeIndex, marker);

                    this.backContext.drawImage(stamp, xPos, yPos);
                }
            });
        }
        this.backContext.restore();
    }

    renderScrollbars() {
        this.backContext.save();
        if (this.canScrollY()) {
            this.backContext.translate(0, this.mapCanvasHeight);
            this.verticalScrollbar.render(this.backContext);
        }
        this.backContext.restore();
        this.backContext.save();
        if (this.canScrollX()) {
            this.backContext.translate(this.nameCanvasWidth, 0);
            this.horizontalScrollbar.render(this.backContext);
        }
        this.backContext.restore();

        this.backContext.save();
        if (this.canScrollX() || this.canScrollY()) {
            this.backContext.translate(this.nameCanvasWidth, this.mapCanvasHeight);
            this.backContext.fillStyle = '#aaa';
            this.backContext.strokeRect(this.alleleCanvasWidth(), this.alleleCanvasHeight(), this.scrollbarWidth, this.scrollbarHeight);
            this.backContext.fillRect(this.alleleCanvasWidth(), this.alleleCanvasHeight(), this.scrollbarWidth, this.scrollbarHeight);
        }
        this.backContext.restore();
    }

    mapToRange(num, inMin, inMax, outMin, outMax) {
        return (num - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
    };

    // We can only scroll horizontally if the render size of our data horizontally
    // is wider than the canvas itself
    canScrollX() {
        return this.maxCanvasWidth() > this.alleleCanvasWidth();
    }

    canScrollY() {
        return this.maxCanvasHeight() > this.alleleCanvasHeight();
    }

    moveX(diffX) {
        const xScrollMax = this.maxCanvasWidth() - this.alleleCanvasWidth();

        if (this.canScrollX()) {
            this.translatedX -= diffX;

            // Prevent scrolling beyond start or end of data
            if (this.translatedX < 0) {
                this.translatedX = 0;
            } else if (this.translatedX >= xScrollMax) {
                this.translatedX = xScrollMax;
            }

            const scrollWidth = this.alleleCanvasWidth() - this.horizontalScrollbar.widget.width;
            const scrollX = Math.floor(this.mapToRange(this.translatedX, 0, xScrollMax, 0, scrollWidth));
            this.horizontalScrollbar.move(scrollX, this.horizontalScrollbar.y);
        }
    }

    moveY(diffY) {
        const yScrollMax = this.maxCanvasHeight() - this.alleleCanvasHeight();

        if (this.canScrollY()) {
            this.translatedY -= diffY;

            // Prevent scrolling beyond start or end of data
            if (this.translatedY < 0) {
                this.translatedY = 0;
            } else if (this.translatedY >= yScrollMax) {
                this.translatedY = yScrollMax;
            }

            const scrollHeight = this.alleleCanvasHeight() - this.verticalScrollbar.widget.height;
            const scrollY = Math.floor(this.mapToRange(this.translatedY, 0, yScrollMax, 0, scrollHeight));
            this.verticalScrollbar.move(this.verticalScrollbar.x, scrollY);
        }
    }

    dragVerticalScrollbar(y) {
        if (this.canScrollY()) {
            const yScrollMax = this.maxCanvasHeight() - this.alleleCanvasHeight();

            this.translatedY = (y / this.verticalScrollbar.height) * yScrollMax;

            // Prevent scrolling beyond start or end of data
            if (this.translatedY < 0) {
                this.translatedY = 0;
            } else if (this.translatedY >= yScrollMax) {
                this.translatedY = yScrollMax;
            }

            const scrollHeight = this.alleleCanvasHeight() - this.verticalScrollbar.widget.height;
            const scrollY = Math.floor(this.mapToRange(this.translatedY, 0, yScrollMax, 0, scrollHeight));
            this.verticalScrollbar.move(this.verticalScrollbar.x, scrollY);
        }

        this.prerender(true);
    }

    dragHorizontalScrollbar(x) {
        if (this.canScrollX()) {
            const xScrollMax = this.maxCanvasWidth() - this.alleleCanvasWidth();

            this.translatedX = (x / this.horizontalScrollbar.width) * xScrollMax;

            // Prevent scrolling beyond start or end of data
            if (this.translatedX < 0) {
                this.translatedX = 0;
            } else if (this.translatedX >= xScrollMax) {
                this.translatedX = xScrollMax;
            }

            const scrollWidth = this.alleleCanvasWidth() - this.horizontalScrollbar.widget.width;
            const scrollX = Math.floor(this.mapToRange(this.translatedX, 0, xScrollMax, 0, scrollWidth));
            this.horizontalScrollbar.move(scrollX, this.horizontalScrollbar.y);
        }

        this.prerender(true);
    }

    move(diffX, diffY) {
        this.moveX(diffX);
        this.moveY(diffY);

        this.prerender(true);
    }

    mouseOver(x, y) {
        // We need to calculate an offset because the gaps between chromosomes
        // aren't part of the data model
        const mouseXPos = x - this.nameCanvasWidth;
        const mouseXPosCanvas = this.translatedX + mouseXPos;
        const mouseYPos = y - this.mapCanvasHeight;

        if (mouseXPos > 0 && mouseXPos < this.alleleCanvasWidth() && mouseXPos < this.maxDataWidth()) {
            // Calculate the marker's index in the dataset and get the marker data
            const offset = this.chromosomeOffset(mouseXPosCanvas);
            const markerIndex = Math.floor((this.translatedX - offset + mouseXPos) / this.boxSize);
            const marker = this.dataSet.markerAt(markerIndex);
            this.markerUnderMouse = marker.marker;
            this.markerIndexUnderMouse = marker.markerIndex;
        } else {
            this.markerUnderMouse = undefined;
            this.markerIndexUnderMouse = undefined;
            this.lineUnderMouse = undefined;
        }

        // Used as a flag to not render the crosshair when the mouse is between
        // chromosomes
        this.chromosomeUnderMouse = this.chromosomeIndexFor(mouseXPosCanvas);

        if (mouseYPos > 0 && mouseYPos < this.alleleCanvasHeight() && mouseYPos < this.maxDataHeight()) {
            this.lineUnderMouse = Math.max(0, Math.floor(mouseYPos / this.boxSize));
            this.lineIndexUnderMouse = this.lineUnderMouse + Math.floor(this.translatedY / this.boxSize);
        } else {
            this.markerUnderMouse = undefined;
            this.markerIndexUnderMouse = undefined;
            this.lineUnderMouse = undefined;
        }

        this.prerender(false);
    }

    updateFontSize() {
        // TODO: need some code to iteratively find the "widest" text, currently
        // testing indicated C/G was the widest for standard diploid genotypes.
        const text = 'C/G';
        const fontface = 'sans-serif';
        const fontCanvas = document.createElement('canvas');
        fontCanvas.width = this.boxSize;
        fontCanvas.height = this.boxSize;
        const fontContext = fontCanvas.getContext('2d');

        this.fontSize = 100;
        fontContext.font = `${this.fontSize}px ${fontface}`;

        // Iteratrively reduce the font size until the sample text fits in the
        // canvas width
        while (fontContext.measureText(text).width > fontCanvas.width) {
            this.fontSize -= 1;
            fontContext.font = `${this.fontSize}px ${fontface}`;
        }

        this.font = fontContext.font;
        this.backContext.font = this.font;
    }

    updateCanvasWidths() {
        // Find the longest germplasm name and adjust the width of the germplasm name
        // rendering area accordingly
        const germplasm = this.dataSet.germplasmList;
        const longestName = Math.max(...germplasm.map(g => this.backContext.measureText(g.name).width));
        this.nameCanvasWidth = longestName;

        this.horizontalScrollbar.updateWidth(this.alleleCanvasWidth());
    }

    updateVisualPositions() {
        this.chromosomeStarts = Array.from(this.dataSet.genomeMap.chromosomeStarts.values()).map((v, idx) => v * this.boxSize + (idx * this.chromosomeGapSize));
        this.chromosomeEnds = [];
        this.dataSet.genomeMap.chromosomes.forEach((chr, idx) => {
            this.chromosomeEnds.push(this.chromosomeStarts[idx] + (chr.markerCount() * this.boxSize));
        });
    }

    updateScrollBarSizes() {
        const screenWidthPerc = this.alleleCanvasWidth() / this.maxCanvasWidth();
        const hScrollWidgetWidth = Math.ceil(this.alleleCanvasWidth() * screenWidthPerc);
        this.horizontalScrollbar.resizeWidgetWidth(hScrollWidgetWidth);

        const screenHeightPerc = this.alleleCanvasHeight() / this.maxCanvasHeight();
        const vScrollWidgetHeight = Math.ceil(this.alleleCanvasHeight() * screenHeightPerc);
        this.verticalScrollbar.resizeWidgetHeight(vScrollWidgetHeight);
    }

    zoom(size) {
        this.boxSize = size;
        this.updateFontSize();
        this.colorScheme.setupColorStamps(this.boxSize, this.font, this.fontSize);
        this.updateCanvasWidths();
        this.updateVisualPositions();
        this.updateScrollBarSizes();

        // If zooming out means the genotypes don't take up the full canvas, return
        // the display to its horizontal origin
        if (!this.canScrollX()) {
            this.translatedX = 0;
            this.horizontalScrollbar.move(0, this.horizontalScrollbar.y);
        }

        // If zooming out means the genotypes don't take up the full canvas, return
        // the display to its vertical origin
        if (!this.canScrollY()) {
            this.translatedY = 0;
            this.verticalScrollbar.move(this.verticalScrollbar.x, 0);
        }

        this.prerender(true);
    }

    setComparisonLineIndex(newIndex) {
        this.comparisonLineIndex = newIndex;
        this.colorScheme.setComparisonLineIndex(newIndex);
        this.prerender(true);
    }
}