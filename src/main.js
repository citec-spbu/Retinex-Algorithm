import { createShader, createProgram, initSliderHandlers, options } from './utils.js';
import {tune} from './helpers/tuning/tune.js';
import {calculateFit} from './helpers/tuning/calculateFit.js';
import {card, mainPhoto,restPhotos} from './upload.js';

export const WebGLContext = {
    gl: null,
    image: null,
    program: null,
    imageTexture: null,
    positionBuffer: null,
    positionLocation: null,
    contrastLocation: null,
    retinexScaleLocation: null,
    sigmaLocation: null,
    canvas: document.getElementById('canvas'),
    msDisplay: document.querySelector('#ms'),
    positions: new Float32Array([
        -1, -1,
        1, -1,
        -1,  1,
        -1,  1,
        1, -1,
        1,  1,
    ])
}

async function loadShaderSource(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to load shader source from ${url}`);
    }
    return await response.text();
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





function draw(contrast = 0.3, retinexScale = 0.62, sigma = 1, isConfiguring = false) {
    const startTime = performance.now();

    WebGLContext.gl.viewport(0, 0, WebGLContext.gl.canvas.width, WebGLContext.gl.canvas.height);
    WebGLContext.gl.clearColor(0, 0, 0, 0);
    WebGLContext.gl.clear(WebGLContext.gl.COLOR_BUFFER_BIT);

    WebGLContext.gl.useProgram(WebGLContext.program);

    WebGLContext.gl.uniform1f(WebGLContext.contrastLocation, contrast);
    WebGLContext.gl.uniform1f(WebGLContext.retinexScaleLocation, retinexScale);
    WebGLContext.gl.uniform1f(WebGLContext.sigmaLocation, sigma);

    WebGLContext.gl.drawArrays(WebGLContext.gl.TRIANGLES, 0, 6);
    let fit;
    if (isConfiguring) fit = calculateFit(WebGLContext.gl);

    const endTime = performance.now();
    const executionTime = endTime - startTime;
    WebGLContext.msDisplay.innerHTML = `Execution time: ${Math.floor(executionTime)} milliseconds`

    return fit;
}
function configure(){
   tune(draw);
}

export async function renderImageArray(){
    mainPhoto.classList.remove('noneDisplay');
    restPhotos.classList.remove('noneDisplay');
    card.classList.add('noneDisplay');

    const response = await fetch('fileNames.json')
    const files = await response.json();

    for (let fileName of files){
        await init("/our485/low/"+fileName)   
    }
}

document.getElementById("configure").onclick= configure;
document.getElementById("video").onclick= renderImageArray;

window.onload = () => {
    init();
    initSliderHandlers(draw);
};
