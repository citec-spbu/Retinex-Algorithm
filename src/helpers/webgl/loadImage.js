import { WebGLContext } from "../../WebGLContext.js";
import { draw } from "../../draw.js";

export function loadImage(url) {
    WebGLContext.image = new Image();
    WebGLContext.image.crossOrigin = '';
    WebGLContext.image.onload = () => {
        WebGLContext.gl.bindTexture(WebGLContext.gl.TEXTURE_2D, WebGLContext.imageTexture);
        WebGLContext.gl.texImage2D(WebGLContext.gl.TEXTURE_2D,
             0,
             WebGLContext.gl.RGBA,
             WebGLContext.gl.RGBA,
             WebGLContext.gl.UNSIGNED_BYTE,
              WebGLContext.image
            );
        WebGLContext.canvas.height = WebGLContext.image.height;
        WebGLContext.canvas.width = WebGLContext.image.width;
        draw();
        
    };
    WebGLContext.image.src = url
}