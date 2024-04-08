export function createShader(gl, type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
        return shader;
    }

    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}


export function createProgram(gl, vertexShader, fragmentShader) {
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
        return program;
    }

    console.error(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}
export const options = {
    contrast : 0.3,
    retinexScale:0.62,
    sigma:1
}
export function initSliderHandlers(draw){


    const contrastInput = document.getElementById('contrast-range');
    const contrastOutput = document.getElementById('contrast-output');

    const scaleInput = document.getElementById('retinex-scale-range');
    const scaleOutput = document.getElementById('retinex-scale-output');

    const sigmaInput = document.getElementById('sigma-range');
    const sigmaOutput = document.getElementById('sigma-range-output');

    contrastInput.addEventListener('input', function() {
        contrastOutput.textContent = contrastInput.value;
        options.contrast = contrastInput.value;
        draw(options.contrast,options.retinexScale,options.sigma);
        
    });
    scaleInput.addEventListener('input', function() {
        scaleOutput.textContent = scaleInput.value;
        options.retinexScale = scaleInput.value;
        draw(options.contrast,options.retinexScale,options.sigma);
        
    });
    sigmaInput.addEventListener('input', function() {
        sigmaOutput.textContent = sigmaInput.value;
        options.sigma = sigmaInput.value;
        draw(options.contrast,options.retinexScale,options.sigma);
        
    });
    
}
