import {card, mainPhoto,restPhotos} from '../../upload.js';
import { init } from '../../init.js';
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