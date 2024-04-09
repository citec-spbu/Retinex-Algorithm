import {init, gl} from "./main.js"
export const card=document.querySelector('.card');
export const mainPhoto=document.querySelector('.main-photo');
export const restPhotos=document.querySelector('.rest-photos');
async function upload(selector, options={}){
    function bytesToSize(bytes){
        const sizes=['Bytes', 'KB', 'MB','GB','TB'];
        if(bytes==0) return '0 Bytes';
        const i = parseInt(Math.floor(Math.log(bytes)/Math.log(1024)));
        return Math.round(bytes/Math.pow(1024, i)) + ' '+ sizes[i];
    }
    function element(tag, classes=[], content){
        const node=document.createElement(tag);
        if(classes.length){
            node.classList.add(...classes)
        }
        if(content){
            node.textContent=content;
        }
        return node;
    
    }
    const canvas = document.getElementById("canvas");
    const reduce=document.querySelector('.reduce');
    const increase=document.querySelector('.increase');
    const restInput=document.querySelector('.restInput');
    const preview=element('div', ['preview']);
    let files = [];
    const input=document.querySelector(selector);
    const explanationText=document.querySelector(".explanationText");
    const open=element('button',['btn'], 'Открыть')
    const upload=element('button',['btn', 'primary'], 'Загрузить')
    upload.style.display='none';
    if (options.multi==true){
        input.setAttribute('multiple', true); // возможность загружать несколько файлов сразу
    }
    if (options.accept && Array.isArray(options.accept)){
        input.setAttribute('accept', options.accept.join(','));
    }
    input.insertAdjacentElement('afterend', preview)
    input.insertAdjacentElement('afterend', upload)
    input.insertAdjacentElement('afterend', open)
    const triggerInput=()=>{
        input.click();
    }

    card.addEventListener('dragover', function(e) {
        e.preventDefault(); // Предотвращаем стандартное поведение браузера
    });

    card.addEventListener('drop', function(e) {
        e.preventDefault(); // Предотвращаем стандартное поведение браузера
        explanationText.classList.add("noneDisplay")
        upload.style.display='inline'
        var datas = e.dataTransfer.files; // Получаем URL картинки из браузера
        for (var i = 0; i < datas.length; i++) {
            const data=datas[i];
            if (data.type.match('image.*')) { // Проверяем, что файл является изображением
                var reader = new FileReader();
                reader.onload = function(e) {
                    let src = e.target.result;
                    preview.insertAdjacentHTML('afterbegin',
                        `<div class="preview-image">
                        <div class="preview-remove" data-name="${data.name}">&times;</div> 
                        <img src="${src}" alt="${data.name}"/>
                        <div class="preview-info">
                            <span>${data.name}</span>
                            ${bytesToSize(data.size)}
                        </div>

                    </div>`)
                    }
                reader.readAsDataURL(data);
            }
        }
    });
    const changeHandler=event=>{
        if(!event.target.files.length){
            return
        }
        explanationText.classList.add("noneDisplay")
        files=Array.from(event.target.files)
        upload.style.display='inline'
        files.forEach(file=>{
            if(!file.type.match('image')){
                return
            }
            const reader = new FileReader();
            reader.onload=ev=>{
                const src=ev.target.result;
                //&times;-крестик
                preview.insertAdjacentHTML('afterbegin',
                `<div class="preview-image">
                <div class="preview-remove" data-name="${file.name}">&times;</div> 
                <img src="${src}" alt="${file.name}"/>
                <div class="preview-info">
                    <span>${file.name}</span>
                    ${bytesToSize(file.size)}
                </div>

                </div>`)
            }
            reader.readAsDataURL(file)
        })


    }
    const changeRestHandler=event=>{
        if(!event.target.files.length){
            return
        }
        files=Array.from(event.target.files)
        files.forEach(file=>{
            const reader = new FileReader();
            reader.onload=ev=>{
                const src=ev.target.result;
                const divImage=document.createElement('div');
                divImage.classList.add('imageContainer');
                divImage.insertAdjacentHTML('afterbegin', `
                    <div class="rest-image">
                        <div class="rest-remove" data-name="${file.name}">&times;</div> 

                        <img src="${src}" alt="${file.name}"/>
                    </div> 
                `);
                const lastChild = restPhotos.lastElementChild;
                restPhotos.insertBefore(divImage, lastChild);
            }
            reader.readAsDataURL(file);
        })

    }
    const removeHandler=event=>{
        if(!event.target.dataset.name){return }
        const {name}=event.target.dataset;
        files=files.filter(file=>file.name!==name);
        if(!files.length){
            upload.style.display='none';
            explanationText.classList.remove("noneDisplay");
        }
        const block=preview.querySelector(`[data-name="${name}"]`).closest(".preview-image");
        block.classList.add('removing');
        setTimeout(()=>block.remove(), 300)
        
    }
    
    const uploadHandler=()=>{
        preview.querySelectorAll('.preview-remove').forEach(e=>e.remove())
        const images=preview.querySelectorAll('img');
        PhotosAreUploaded(images)
    }

    restPhotos.insertAdjacentHTML('beforeend', `<div class="restPhotosAddImage">
        <div class="addImage">Добавить изображение</div>
    </div>`)
    function PhotosAreUploaded(files){
        mainPhoto.classList.remove('noneDisplay');
        restPhotos.classList.remove('noneDisplay');
        card.classList.add('noneDisplay');
        let firstSrc=null;
        files.forEach(file=>{
            const divImage=document.createElement('div');//фото должно быть обернуто в divImage, чтобы отобразиться в restPhotos
            divImage.classList.add('imageContainer');
            const src=file.src;
            if(firstSrc===null){
                firstSrc=src;
                init(firstSrc)
            }
            divImage.insertAdjacentHTML('afterbegin', `
                <div class="rest-image">
                    <div class="rest-remove" data-name="${file.name}">&times;</div> 

                    <img src="${src}" alt="${file.name}"/>
                </div> 
            `);
            restPhotos.insertAdjacentElement('afterbegin', divImage);
        });

        return firstSrc;
        
    }
    restPhotos.addEventListener('click', (e)=>{    
        const images = restPhotos.querySelectorAll('img');
        images.forEach(image => {
            image.classList.remove('greenBorder')
        });
        if (e.target.tagName === 'IMG') {
            e.target.classList.add('greenBorder');
            init(e.target.src)
        }
        
        if (e.target.classList.contains('addImage')) {
            restInput.click();
        }
        if(e.target.classList.contains('rest-remove')){
            let el=null
            if(e.target.closest('.rest-photos').childElementCount==2){
                e.target.closest('.imageContainer').remove();
                gl.clearColor(1.0, 1.0, 1.0, 1.0); // устанавливаем цвет очистки (белый)
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                gl.bindTexture(gl.TEXTURE_2D, null);//Отвязываю изображение от текстуры. Теперь canvas-белый
                //gl.deleteTexture();//удаляю текстуру
                mainPhoto.classList.add('noneDisplay');
                restPhotos.classList.add('noneDisplay');
                card.classList.remove('noneDisplay');
                preview.innerHTML="";
                explanationText.classList.remove("noneDisplay");
                upload.style.display='none';  
            }
            else if (e.target.closest('.imageContainer').previousElementSibling){
                el=e.target.closest('.imageContainer').previousElementSibling;
                const elImage=el.querySelector("img");
                init(elImage.src);
                e.target.closest('.imageContainer').remove();
            }
            else if(e.target.closest('.imageContainer').nextElementSibling){
                el=e.target.closest('.imageContainer').nextElementSibling;
                const elImage=el.querySelector("img");
                init(elImage.src);
                e.target.closest('.imageContainer').remove();
            }
        }
    })
    open.addEventListener('click', triggerInput);
    input.addEventListener('change', changeHandler);
    restInput.addEventListener('change', changeRestHandler);
    preview.addEventListener('click', removeHandler);
    upload.addEventListener('click', uploadHandler);
    
    reduce.addEventListener('click', (e)=>{
        canvas.height = canvas.getBoundingClientRect().height*0.8;
        canvas.width = canvas.getBoundingClientRect().width*0.8;
    })
    increase.addEventListener('click', (e)=>{
        canvas.height = canvas.getBoundingClientRect().height*1.2;
        canvas.width = canvas.getBoundingClientRect().width*1.2;
    })

}
upload('#file',{
    multi:true,// возможность загружать несколько файлов сразу
    accept: ['.png', '.jpeg', '.jpg', '.gif', '.svg'], //типы загружаемых файлов
});
