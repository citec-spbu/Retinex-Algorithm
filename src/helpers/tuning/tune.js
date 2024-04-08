import { geneticAlgorithm } from "./geneticAlgorithm.js";
export function tune(draw){
    const startTime = performance.now();
    let {scale,sigma} = geneticAlgorithm(draw,10, 3, 1, 0.1, 20);
    const scaleInput = document.getElementById('retinex-scale-range');
    const scaleOutput = document.getElementById('retinex-scale-output');
    scaleOutput.innerText = scale.toFixed(1);
    scaleInput.value = scale.toFixed(1);
    const sigmaInput = document.getElementById('sigma-range');
    const sigmaOutput = document.getElementById('sigma-range-output');
    sigmaInput.value = sigma.toFixed(1);
    sigmaOutput.innerText = sigma.toFixed(1);
    draw(0.3,scale,sigma);

    const endTime = performance.now();
    const elapsedTime = endTime - startTime;
    const msDisplay = document.getElementById('ms');
    msDisplay.innerHTML = `Execution time: ${Math.floor(elapsedTime)} milliseconds`;
}