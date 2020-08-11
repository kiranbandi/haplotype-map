export default class ScrollBarWidget {
    constructor(x, y, width, height) {
        this.widgetX = x;
        this.widgetY = y;
        this.width = width;
        this.height = height;
        this.corner_radius = 5;
    }

    render(ctx) {
        // Set faux rounded corners
        ctx.lineJoin = 'round';
        ctx.lineWidth = this.corner_radius;

        ctx.fillStyle = '#aaa';
        ctx.strokeStyle = '#aaa';

        // Change origin and dimensions to match true size (a stroke makes the shape a bit larger)
        ctx.strokeRect(this.widgetX + (this.corner_radius / 2), this.widgetY + (this.corner_radius / 2),
            this.width - this.corner_radius, this.height - this.corner_radius);
        ctx.fillRect(this.widgetX + (this.corner_radius / 2), this.widgetY + (this.corner_radius / 2),
            this.width - this.corner_radius, this.height - this.corner_radius);
    }

    move(newX, newY) {
        this.widgetX = newX;
        this.widgetY = newY;
    }

    resizeWidth(newWidth) {
        this.width = newWidth > 20 ? newWidth : 20;
    }

    resizeHeight(newHeight) {
        this.height = newHeight > 20 ? newHeight : 20;
    }
}