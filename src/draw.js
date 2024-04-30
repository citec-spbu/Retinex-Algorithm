import {calculateFit} from './helpers/tuning/calculateFit.js';

import { WebGLContext } from './WebGLContext.js';



export function draw(contrast = 0.3, retinexScale = 0.62, sigma = 1, isConfiguring = false) {
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
