import { createShader, createProgram } from './utils.js';
import { draw } from './draw.js';
import { WebGLContext } from './WebGLContext.js';
import { loadShaderSource } from './helpers/webgl/loadShaderSource.js';

function loadImage(url) {
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

export async function init(src) {
    WebGLContext.gl = WebGLContext.canvas.getContext("webgl");
    if (!WebGLContext.gl) {
        console.error("WebGL not supported");
        return;
    }

    const vertexShaderSource = await loadShaderSource('webgl/vertexShader.glsl');
    const fragmentShaderSource = await loadShaderSource('webgl/fragmentShader.glsl');

    const vertexShader = createShader(WebGLContext.gl, WebGLContext.gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(WebGLContext.gl, WebGLContext.gl.FRAGMENT_SHADER, fragmentShaderSource);

    WebGLContext.program = createProgram(WebGLContext.gl, vertexShader, fragmentShader);

    WebGLContext.positionLocation = WebGLContext.gl.getAttribLocation(WebGLContext.program, "a_position");

    WebGLContext.imageTexture = WebGLContext.gl.createTexture();
    WebGLContext.gl.bindTexture(WebGLContext.gl.TEXTURE_2D, WebGLContext.imageTexture);
    WebGLContext.gl.texParameteri(WebGLContext.gl.TEXTURE_2D, WebGLContext.gl.TEXTURE_WRAP_S, WebGLContext.gl.CLAMP_TO_EDGE);
    WebGLContext.gl.texParameteri(WebGLContext.gl.TEXTURE_2D, WebGLContext.gl.TEXTURE_WRAP_T, WebGLContext.gl.CLAMP_TO_EDGE);
    WebGLContext.gl.texParameteri(WebGLContext.gl.TEXTURE_2D, WebGLContext.gl.TEXTURE_MIN_FILTER, WebGLContext.gl.LINEAR);
    WebGLContext.gl.texParameteri(WebGLContext.gl.TEXTURE_2D, WebGLContext.gl.TEXTURE_MAG_FILTER, WebGLContext.gl.LINEAR);

    const textureSizeLocation = WebGLContext.gl.getUniformLocation(WebGLContext.program, "u_textureSize");
    const textureWidth = 360;
    const textureHeight = 236;    
    WebGLContext.gl.uniform2f(textureSizeLocation, textureWidth, textureHeight);

    WebGLContext.positionBuffer = WebGLContext.gl.createBuffer();
    WebGLContext.gl.bindBuffer(WebGLContext.gl.ARRAY_BUFFER, WebGLContext.positionBuffer);
    WebGLContext.gl.bufferData(WebGLContext.gl.ARRAY_BUFFER, WebGLContext.positions, WebGLContext.gl.STATIC_DRAW);

    WebGLContext.positionLocation = WebGLContext.gl.getAttribLocation(WebGLContext.program, "a_position");
    WebGLContext.gl.enableVertexAttribArray(WebGLContext.positionLocation);
    WebGLContext.gl.vertexAttribPointer(WebGLContext.positionLocation, 2, WebGLContext.gl.FLOAT, false, 0, 0);


    WebGLContext.contrastLocation = WebGLContext.gl.getUniformLocation(WebGLContext.program, "u_contrast");
    WebGLContext.retinexScaleLocation = WebGLContext.gl.getUniformLocation(WebGLContext.program, "u_retinex_scale");
    WebGLContext.sigmaLocation = WebGLContext.gl.getUniformLocation(WebGLContext.program, "u_sigma");

    loadImage(src);
}