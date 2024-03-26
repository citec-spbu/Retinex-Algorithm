const ranges=document.querySelector('.ranges');
const icon=document.querySelector('.chevron-icon');
const pictures=document.querySelector('.pictures');
const rectangle=document.querySelector('.rectangle');
icon.addEventListener('click', (e)=>{
    ranges.classList.toggle('unvisible');
    icon.classList.toggle('right-pointed-arrow');
    pictures.classList.toggle('full-width');
    rectangle.classList.toggle('rectangle-to-left');
})
console.log(window.innerWidth)