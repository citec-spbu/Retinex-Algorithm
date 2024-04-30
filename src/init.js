import { createShader, createProgram } from './utils.js';
import { WebGLContext } from './WebGLContext.js';
import { loadShaderSource } from './helpers/webgl/loadShaderSource.js';
import { loadImage } from './helpers/webgl/loadImage.js';


async function initializeWebGLContext() {
    WebGLContext.gl = WebGLContext.canvas.getContext("webgl");
    if (!WebGLContext.gl) {
        console.error("WebGL not supported");
        return;
    }
}

async function loadShaders() {
    const vertexShaderSource = await loadShaderSource('webgl/vertexShader.glsl');
    const fragmentShaderSource = await loadShaderSource('webgl/fragmentShader.glsl');

    const vertexShader = createShader(WebGLContext.gl, WebGLContext.gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(WebGLContext.gl, WebGLContext.gl.FRAGMENT_SHADER, fragmentShaderSource);

    WebGLContext.program = createProgram(WebGLContext.gl, vertexShader, fragmentShader);
}

function setupTexture() {
    WebGLContext.imageTexture = WebGLContext.gl.createTexture();
    WebGLContext.gl.bindTexture(WebGLContext.gl.TEXTURE_2D, WebGLContext.imageTexture);
    WebGLContext.gl.texParameteri(WebGLContext.gl.TEXTURE_2D, WebGLContext.gl.TEXTURE_WRAP_S, WebGLContext.gl.CLAMP_TO_EDGE);
    WebGLContext.gl.texParameteri(WebGLContext.gl.TEXTURE_2D, WebGLContext.gl.TEXTURE_WRAP_T, WebGLContext.gl.CLAMP_TO_EDGE);
    WebGLContext.gl.texParameteri(WebGLContext.gl.TEXTURE_2D, WebGLContext.gl.TEXTURE_MIN_FILTER, WebGLContext.gl.LINEAR);
    WebGLContext.gl.texParameteri(WebGLContext.gl.TEXTURE_2D, WebGLContext.gl.TEXTURE_MAG_FILTER, WebGLContext.gl.LINEAR);
}

function setTextureSize(textureWidth, textureHeight) {
    const textureSizeLocation = WebGLContext.gl.getUniformLocation(WebGLContext.program, "u_textureSize");
    WebGLContext.gl.uniform2f(textureSizeLocation, textureWidth, textureHeight);
}

function setupPositionBuffer() {
    WebGLContext.positionBuffer = WebGLContext.gl.createBuffer();
    WebGLContext.gl.bindBuffer(WebGLContext.gl.ARRAY_BUFFER, WebGLContext.positionBuffer);
    WebGLContext.gl.bufferData(WebGLContext.gl.ARRAY_BUFFER, WebGLContext.positions, WebGLContext.gl.STATIC_DRAW);
}

function setupPositionAttribute() {
    WebGLContext.positionLocation = WebGLContext.gl.getAttribLocation(WebGLContext.program, "a_position");
    WebGLContext.gl.enableVertexAttribArray(WebGLContext.positionLocation);
    WebGLContext.gl.vertexAttribPointer(WebGLContext.positionLocation, 2, WebGLContext.gl.FLOAT, false, 0, 0);
}

function setupUniformLocations() {
    WebGLContext.contrastLocation = WebGLContext.gl.getUniformLocation(WebGLContext.program, "u_contrast");
    WebGLContext.retinexScaleLocation = WebGLContext.gl.getUniformLocation(WebGLContext.program, "u_retinex_scale");
    WebGLContext.sigmaLocation = WebGLContext.gl.getUniformLocation(WebGLContext.program, "u_sigma");
}


export async function init(src) {
    await initializeWebGLContext();
    await loadShaders();
    setupTexture();
    setTextureSize(360, 236);
    setupPositionBuffer();
    setupPositionAttribute();
    setupUniformLocations();
    loadImage(src);
}