import ScrollBarWidget from './ScrollBarWidget';

export default class ScrollBar {
    constructor(parentWidth, parentHeight, width, height, vertical) {
        this.parentWidth = parentWidth;
        this.parentHeight = parentHeight;
        this.width = width;
        this.height = height;
        this.vertical = vertical;

        this.x = vertical ? parentWidth - width : 0;
        this.y = vertical ? 0 : parentHeight - height;

        this.widget = new ScrollBarWidget(this.x, this.y, this.vertical ? this.width : 20, this.vertical ? 20 : this.height);
    }

    render(ctx) {
        ctx.fillStyle = '#eee';
        ctx.strokeStyle = '#eee';

        ctx.fillRect(this.x, this.y, this.width, this.height);

        this.widget.render(ctx);
    }

    move(newX, newY) {
        this.widget.move(newX, newY);
    }

    // The width of the horizontal scrollbar can change depending on the width
    // of the germplasmNameCanvas
    updateWidth(newWidth) {
        if (!this.vertical) {
            this.width = newWidth;
        }
    }

    resizeWidgetWidth(newWidth) {
        if (!this.vertical) {
            this.widget.resizeWidth(newWidth);
        }
    }

    resizeWidgetHeight(newHeight) {
        if (this.vertical) {
            this.widget.resizeHeight(newHeight);
        }
    }
}