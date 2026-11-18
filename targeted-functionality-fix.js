(()=>{
  const $=s=>document.querySelector(s);
  const read=(k,d)=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(d))}catch{return d}};
  const write=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
  const toast=x=>{if(typeof window.toastSafe==='function')window.toastSafe(x);else if(typeof window.toast==='function')window.toast(x)};
  const now=()=>new Date().toLocaleString('en-IN');
  let catalog=[];
  const studioPairs={
    'Charcoal & Wooden Louvers':['assets/studio/segment-bedroom-wood-before.jpg','assets/studio/segment-bedroom-wood-after.jpg'],
    'Imperial Marble UV Sheet':['assets/studio/segment-bedroom-marble-before.jpg','assets/studio/segment-bedroom-marble-after.jpg'],
    'Fluted PVC Wall Panel':['assets/studio/segment-living-fluted-before.jpg','assets/studio/segment-living-fluted-after.jpg'],
    'False Ceiling + Cove Lighting':['assets/studio/segment-ceiling-cove-before.jpg','assets/studio/segment-ceiling-cove-after.jpg']
  };
  function setStudioProduct(product){
    const after=$('#studioAfterImage'),before=$('#studioBeforeImage'),badge=$('#studioProductBadge');
    if(!after||!product)return;
    const categoryPair={
      'WPC Louvers':'Charcoal & Wooden Louvers',
      'UV Marble Sheets':'Imperial Marble UV Sheet',
      'PVC Ceiling':'False Ceiling + Cove Lighting',
      'PVC Wall Panels':'Fluted PVC Wall Panel',
      'UPVC Marble Sheets':'Imperial Marble UV Sheet'
    };
    const pair=studioPairs[product.studioName||categoryPair[product.category]||''];
    if(pair){if(before)before.src=pair[0];after.src=pair[1];}
    else if(product.image && !/sagar-royal-upi-qr|upi-qr/i.test(product.image)){after.src=product.image;}
    if(badge){badge.innerHTML=`<b>Product Used: ${product.name||product.studioName||'Selected finish'}</b><small>Waterproof &amp; Termite Proof</small>`;}
    const studio=$('#studio');if(studio)studio.scrollIntoView({behavior:'smooth',block:'start'});
    sessionStorage.selectedStudioProduct=product.name||product.studioName||'';
  }
  function bindStudioProductSync(){
    const grid=$('#productGrid');
    if(grid&&!grid.dataset.studioSync){
      grid.dataset.studioSync='1';
      grid.addEventListener('click',e=>{
        if(e.target.closest('button,a'))return;
        const card=e.target.closest('.product-card');if(!card)return;
        const name=card.querySelector('h3')?.textContent.trim();const product=catalog.find(p=>p.name===name)||{name};
        setStudioProduct(product);
      });
    }
    const select=$('#materialSelect');
    if(select&&!select.dataset.studioSync){
      select.dataset.studioSync='1';
      select.addEventListener('change',()=>{const p=catalog.find(x=>x.name===select.value);if(p)setStudioProduct(p)});
    }
  }
  async function loadCatalog(){try{catalog=JSON.parse(localStorage.getItem('customProducts')||'null')||await (await fetch('products.json',{cache:'no-store'})).then(r=>r.json()).then(x=>x.products||x);bindStudioProductSync()}catch{catalog=[]}}
  function removePanelOverlay(){document.querySelectorAll('.product-visual .visual-copy').forEach(x=>x.remove());}
  function locationStatus(text){const el=$('#opsGpsStatus');if(el)el.textContent=text;const admin=$('#adminGpsStatus');if(admin)admin.textContent=text;}
  function saveLocation(pos,actor){const projectId=window.currentProject?.()?.id||sessionStorage.activeProject||'admin-check';const data={projectId,actor:actor||sessionStorage.staffUsername||sessionStorage.role||'portal-user',lat:pos.coords.latitude,lng:pos.coords.longitude,accuracy:pos.coords.accuracy,timestamp:new Date().toISOString(),maps:`https://www.google.com/maps?q=${pos.coords.latitude},${pos.coords.longitude}`};const list=read('opsAttendance',[]);write('opsAttendance',[data,...list]);locationStatus(`Location ready · ±${Math.round(pos.coords.accuracy||0)}m`);toast('GPS location captured successfully');return data;}
  function requestLocation(actor='portal-user'){
    if(!navigator.geolocation){locationStatus('This browser does not provide GPS');toast('GPS is unavailable in this browser');return}
    locationStatus('Requesting GPS permission…');navigator.geolocation.getCurrentPosition(p=>saveLocation(p,actor),e=>{const msg=e.code===1?'Location permission denied — allow it in browser settings':e.code===2?'Location unavailable — check device GPS/network':'Location request timed out';locationStatus(msg);toast(msg)},{enableHighAccuracy:true,timeout:20000,maximumAge:0});
  }
  function ensureMediaUI(root,admin=false){
    if(!root||root.querySelector(admin?'#adminCamera':'#opsCamera'))return;
    const host=root.querySelector(admin?'#adminStaffTracker':'#opsMedia')?.closest('.ops-panel')||root;
    const wrap=document.createElement('div');wrap.className='media-tools';wrap.innerHTML=`${admin?'<textarea id="adminRemark" class="media-remark" placeholder="Admin voice note or operations remark..."></textarea>':''}<div class="ops-actions"><button type="button" class="ops-btn secondary" id="${admin?'adminCamera':'opsCamera'}">Camera photo</button><button type="button" class="ops-btn secondary" id="${admin?'adminGpsCheck':'opsGpsCheck'}">Check GPS</button>${admin?'<button type="button" class="ops-btn secondary" id="adminVoice">Mic · Bengali / English</button>':''}</div><video id="${admin?'adminCameraPreview':'opsCameraPreview'}" playsinline muted hidden></video><canvas id="${admin?'adminCameraCanvas':'opsCameraCanvas'}" hidden></canvas>`;host.appendChild(wrap);
    wrap.querySelector(`#${admin?'adminGpsCheck':'opsGpsCheck'}`).onclick=()=>requestLocation(admin?'admin':sessionStorage.staffUsername||'staff');
    wrap.querySelector(`#${admin?'adminCamera':'opsCamera'}`).onclick=()=>openCamera(admin);
  }
  let stream=null;
  async function openCamera(admin=false){
    const video=$(`#${admin?'adminCameraPreview':'opsCameraPreview'}`),canvas=$(`#${admin?'adminCameraCanvas':'opsCameraCanvas'}`),button=$(`#${admin?'adminCamera':'opsCamera'}`);if(!video||!canvas||!button)return;
    try{
      if(stream){canvas.width=video.videoWidth||1280;canvas.height=video.videoHeight||720;canvas.getContext('2d').drawImage(video,0,0,canvas.width,canvas.height);const data=canvas.toDataURL('image/jpeg',.78);video.hidden=true;stream.getTracks().forEach(t=>t.stop());stream=null;button.textContent='Camera photo';const key='opsMedia';const item={name:`camera-${Date.now()}.jpg`,type:'image/jpeg',category:'Camera capture',projectId:sessionStorage.activeProject||'admin-check',data,displayTime:now()};write(key,[item,...read(key,[])]);toast('Camera photo captured and saved');return;
      }
      stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'},audio:false});video.srcObject=stream;video.hidden=false;await video.play();button.textContent='Capture photo';toast('Camera ready — press again to capture');
    }catch(e){toast(e?.name==='NotAllowedError'?'Camera permission denied — allow camera access in browser settings':'Camera could not start in this browser');}
  }
  function bindVoiceFallback(){
    const buttons=['#opsVoice','#adminVoice'].map($).filter(Boolean);buttons.forEach(button=>{if(button.dataset.finalVoice)return;button.dataset.finalVoice='1';button.onclick=async()=>{
      const target=$('#opsRemark')||$('#adminRemark');
      const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
      if(SR){const r=new SR();r.lang=(localStorage.language||'en')==='bn'?'bn-IN':'en-IN';r.interimResults=false;r.onresult=e=>{if(target)target.value+=(target.value?' ':'')+e.results[0][0].transcript;toast('Voice note added to remark')};r.onerror=()=>toast('Microphone stopped — check browser microphone permission');try{r.start();toast('Microphone listening… speak now')}catch{toast('Microphone is already active')}}
      else {toast('Speech recognition is unavailable; starting microphone recording instead');try{const s=await navigator.mediaDevices.getUserMedia({audio:true});const rec=new MediaRecorder(s);const chunks=[];rec.ondataavailable=e=>chunks.push(e.data);rec.onstop=()=>{s.getTracks().forEach(t=>t.stop());const reader=new FileReader();reader.onload=()=>{const item={name:`voice-${Date.now()}.webm`,type:'audio/webm',data:reader.result,projectId:sessionStorage.activeProject||'staff',displayTime:now()};write('opsVoiceNotes',[item,...read('opsVoiceNotes',[])]);toast('Voice recording saved to this project')};reader.readAsDataURL(new Blob(chunks,{type:'audio/webm'}));};rec.start();button.textContent='Stop microphone';button.dataset.recording='1';setTimeout(()=>{if(button.dataset.recording){button.dataset.recording='';button.textContent='Mic · Bengali / English';rec.stop()}},10000)}catch{toast('Microphone permission denied — allow microphone access in browser settings')}}
    };});
  }
  function boot(){
    removePanelOverlay();bindStudioProductSync();loadCatalog();
    const staff=$('#staffView');if(staff)ensureMediaUI(staff,false);
    const admin=$('#adminView');if(admin)ensureMediaUI(admin,true);
    bindVoiceFallback();
    setInterval(()=>{removePanelOverlay();bindStudioProductSync();const staff=$('#staffView');if(staff)ensureMediaUI(staff,false);const admin=$('#adminView');if(admin)ensureMediaUI(admin,true);bindVoiceFallback()},1000);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  window.sagarRoyalMedia={requestLocation,openCamera,setStudioProduct};
})();
