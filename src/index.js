import { initSliderHandlers } from "./utils.js";
import { init } from "./init.js";
import { draw } from "./draw.js";
import { renderImageArray } from './helpers/webgl/renderImageArray.js';
import { tune } from "./helpers/tuning/tune.js";

function configure(){
    setTimeout(function() {
        tune(draw);
    }, 0);
}


document.getElementById("configure").onclick = configure;
document.getElementById("configure").onclick= configure;
document.getElementById("video").onclick= renderImageArray;


window.onload = () => {
    init();
    initSliderHandlers(draw);
};
