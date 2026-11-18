(()=>{
  function bindFinalStaffLogin(){
    const old=document.querySelector('#adminLoginBtn');
    if(!old || old.dataset.finalStaffLogin) return;
    const b=old.cloneNode(true);
    b.dataset.finalStaffLogin='1';
    old.replaceWith(b);
    b.onclick=(e)=>{
      e.preventDefault();
      const role=document.querySelector('#loginRole')?.value;
      const u=document.querySelector('#adminUsername')?.value.trim();
      const p=document.querySelector('#adminPassword')?.value;
      let users=[];
      try{ users=JSON.parse(localStorage.getItem('customStaffUsers')||'[]'); }catch{}
      const validAdmin=role==='admin' && u==='souvikmaitism' && p==='31102006ms@';
      const validStaff=role==='staff' && ((u==='sagarstaff' && p==='Staff@31102006') || users.some(x=>x.username===u && x.password===p));
      if(!validAdmin && !validStaff){
        if(typeof window.toast==='function') window.toast('Incorrect credentials');
        return;
      }
      sessionStorage.owner='yes';
      sessionStorage.role=role;
      sessionStorage.staffUsername=role==='staff'?u:'';
      const login=document.querySelector('#adminLogin');
      const dashboard=document.querySelector('#adminDashboard');
      if(login) login.hidden=true;
      if(dashboard) dashboard.hidden=false;
      if(typeof window.initAdmin==='function') window.initAdmin();
      setTimeout(()=>{
        window.sagarRoyalStaff?.ensureStaffSummary();
        window.sagarRoyalStaff?.renderStaffMenu();
      },250);
    };
  }
  function boot(){ bindFinalStaffLogin(); setInterval(bindFinalStaffLogin,700); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
})();
