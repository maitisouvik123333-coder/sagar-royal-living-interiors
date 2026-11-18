(()=>{
const defaultLine='Premium Interior Solutions: PVC, UPVC, False Ceiling, Modular Kitchen & Luxury Fittings.';
function business(){try{const saved=JSON.parse(localStorage.getItem('customBusiness')||'null');if(saved&&typeof saved==='object')return saved}catch{}return window.siteData?.business||{}}
function currentLine(){const b=business();return b.heroProductLine||b.productLine||b.description||defaultLine}
function renderHeroProductLine(){const lead=document.querySelector('.hero .lead');if(lead)lead.textContent=currentLine()}
function fillHeroProductField(){const field=document.querySelector('#businessProductLineEdit');if(field&&!field.dataset.heroProductFilled) {field.value=currentLine();field.dataset.heroProductFilled='1'}}
function bindHeroProductLine(){fillHeroProductField();renderHeroProductLine();const save=document.querySelector('#saveBusinessSettings');if(save&&!save.dataset.heroProductLineBound){save.dataset.heroProductLineBound='1';save.addEventListener('click',()=>{const field=document.querySelector('#businessProductLineEdit');if(!field)return;const value=field.value.trim();const b={...business()};b.heroProductLine=value||currentLine();b.description=b.heroProductLine;window.siteData=window.siteData||{};window.siteData.business={...(window.siteData.business||{}),...b};localStorage.setItem('customBusiness',JSON.stringify(window.siteData.business));renderHeroProductLine();if(typeof window.toast==='function')window.toast('Hero product description updated on the website')})}}
function boot(){bindHeroProductLine();setTimeout(bindHeroProductLine,350);setTimeout(bindHeroProductLine,1000)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
