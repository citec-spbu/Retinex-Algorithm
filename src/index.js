import { initSliderHandlers } from "./utils.js";
import { init } from "./init.js";
import { draw } from "./draw.js";
import {tune} from "./helpers/tuning/tune.js"
import { renderImageArray } from './helpers/webgl/renderImageArray.js';
function configure(){
    tune(draw);
 }
 
document.getElementById("configure").onclick= configure;
document.getElementById("video").onclick= renderImageArray;


window.onload = () => {
    init();
    initSliderHandlers(draw);
};
