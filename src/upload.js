import {init} from "./main.js"

export async function upload(selector, options={}){
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
    const card=document.querySelector('.card');
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
        input.click()
    }

    card.addEventListener('dragover', function(e) {
        e.preventDefault(); // Предотвращаем стандартное поведение браузера
    });

    card.addEventListener('drop', function(e) {
        e.preventDefault(); // Предотвращаем стандартное поведение браузера
        explanationText.classList.add("noneDisplay")
        upload.style.display='inline'
        var datas = e.dataTransfer.files; // Получаем URL картинки из браузера
        console.log(datas)
        for (var i = 0; i < datas.length; i++) {
            const data=datas[i];
            if (data.type.match('image.*')) { // Проверяем, что файл является изображением
                
                
                
                var reader = new FileReader();
                reader.onload = function(e) {
                    console.log(e.target)
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
      
        //preview.innerHTML='';// перед новой загрузкой картинок подчищаем все старые
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
    const removeHandler=event=>{
        if(!event.target.dataset.name){return }
        const {name}=event.target.dataset;
        files=files.filter(file=>file.name!==name);
        if(!files.length){
            upload.style.display='none'
        }
        const block=preview.querySelector(`[data-name="${name}"]`).closest(".preview-image");
        block.classList.add('removing');
        setTimeout(()=>block.remove(), 300)
        
    }
    
    const uploadHandler=()=>{
        preview.querySelectorAll('.preview-remove').forEach(e=>e.remove())
        const images=preview.querySelectorAll('img');
        PhotosAreUploaded(images)////
    }
    const mainPhoto=document.querySelector('.main-photo');
    const restPhotos=document.querySelector('.rest-photos');
    function PhotosAreUploaded(files){
        mainPhoto.classList.remove('noneDisplay');
        if(files.length>1){
            restPhotos.classList.remove('noneDisplay');
        }
        
        card.classList.add('noneDisplay');
        let firstSrc=null;
        files.forEach(file=>{
            const divImage=document.createElement('div');
            divImage.classList.add('imageContainer');
            
                const src=file.src;
                if(firstSrc===null){
                    firstSrc=src;
                    console.log(file.width, file.height)
                    init(firstSrc)
                    // mainPhoto.insertAdjacentHTML('afterbegin', `<img src="${firstSrc}" alt="${file.name}"/>`);
                }
                divImage.insertAdjacentHTML('afterbegin', `<img src="${src}" alt="${file.name}"/>`);

                restPhotos.insertAdjacentElement('afterbegin', divImage);
        
            
        });

        return firstSrc;
        
    }
    restPhotos.addEventListener('click', (e)=>{
    
        const clonedElement = e.target.cloneNode(true);
        const images = restPhotos.querySelectorAll('img');
        images.forEach(image => {
            image.classList.remove('greenBorder')
        });
        if (e.target.tagName === 'IMG') {
            e.target.classList.add('greenBorder')
            console.log(e.target)

            init(e.target.src)
            // mainPhoto.innerHTML="";
            // mainPhoto.insertAdjacentElement('afterbegin', clonedElement);
        }

    })
    open.addEventListener('click', triggerInput);
    input.addEventListener('change', changeHandler);
    preview.addEventListener('click', removeHandler);
    upload.addEventListener('click', uploadHandler);

}
upload('#file',{
    multi:true,// возможность загружать несколько файлов сразу
    accept: ['.png', '.jpeg', '.jpg', '.gif', '.svg'], //типы загружаемых файлов
});
