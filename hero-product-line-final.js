(()=>{
const fallback='Premium Interior Solutions: PVC, UPVC, False Ceiling, Modular Kitchen & Luxury Fittings.';
function stored(){try{return JSON.parse(localStorage.getItem('customBusiness')||'{}')}catch{return {}}}
function render(){const b=stored();const line=b.heroProductLine||b.productLine||b.description||fallback;const lead=document.querySelector('.hero .lead');if(lead)lead.textContent=line;const field=document.querySelector('#businessProductLineEdit');if(field&&!field.matches(':focus'))field.value=line}
function bind(){const save=document.querySelector('#saveBusinessSettings');if(save&&!save.dataset.heroProductFinalBound){save.dataset.heroProductFinalBound='1';save.addEventListener('click',()=>{setTimeout(()=>{const field=document.querySelector('#businessProductLineEdit');if(!field)return;const b=stored();b.heroProductLine=field.value.trim()||b.heroProductLine||b.description||fallback;b.description=b.heroProductLine;localStorage.setItem('customBusiness',JSON.stringify(b));render();if(typeof window.toast==='function')window.toast('Hero product description saved successfully')},0)})}render()}
function boot(){bind();setTimeout(bind,400);setTimeout(bind,1200)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
