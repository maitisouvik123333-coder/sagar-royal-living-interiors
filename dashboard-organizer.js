(() => {
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  let enhanced = false;

  function logout() {
    sessionStorage.removeItem('owner');
    sessionStorage.removeItem('role');
    const modal = $('#adminModal');
    if (modal) modal.hidden = true;
    $('#adminLogin')?.removeAttribute('hidden');
    $('#adminDashboard')?.setAttribute('hidden', '');
    window.toast?.('Logged out successfully');
  }

  function addControlBar() {
    const dash = $('#adminDashboard');
    if (!dash || $('#dashboardControlBar')) return;
    const bar = document.createElement('div');
    bar.id = 'dashboardControlBar';
    bar.className = 'dashboard-control-bar';
    bar.innerHTML = `<div><p class="kicker">SAGAR ROYAL WORKSPACE</p><h3 id="dashboardGreeting">Dashboard control centre</h3><p class="dashboard-subtitle">Use the shortcuts below to jump directly to the area you need.</p></div><div class="dashboard-control-actions"><span class="dashboard-role-chip" id="dashboardRoleChip">Workspace</span><button class="ghost-btn dashboard-logout" type="button">Log out</button></div>`;
    const rolebar = $('.admin-rolebar', dash);
    dash.insertBefore(bar, rolebar || dash.firstElementChild);
    $('.dashboard-logout', bar).addEventListener('click', logout);
    updateRoleLabel();
  }

  function updateRoleLabel() {
    const role = sessionStorage.role || 'admin';
    const name = role === 'staff' ? (JSON.parse(localStorage.getItem('staffRoutingProfile') || '{}').name || 'Staff workspace') : 'Admin workspace';
    const chip = $('#dashboardRoleChip'); if (chip) chip.textContent = role === 'staff' ? `Staff · ${name}` : 'Admin · Full access';
    const greeting = $('#dashboardGreeting'); if (greeting) greeting.textContent = role === 'staff' ? `Welcome, ${name}` : 'Dashboard control centre';
  }

  function addAdminQuickNav() {
    const view = $('#adminView');
    if (!view || $('#adminQuickNav')) return;
    const nav = document.createElement('div');
    nav.id = 'adminQuickNav';
    nav.className = 'dashboard-quick-nav';
    const links = [
      ['adminBusiness','Business','Contact & brand'], ['adminProducts','Products','Rates & photos'], ['adminNewProduct','Add product','Create catalog item'], ['adminCRM','Leads','Customer requests'], ['adminPayment','Payment','QR & payment'], ['adminExport','Export','Backup local data']
    ];
    nav.innerHTML = `<div class="quick-nav-title"><b>Quick control</b><small>Choose a workspace</small></div>${links.map(([id, title, sub], i) => `<button type="button" data-jump="${id}"><span>0${i + 1}</span><b>${title}</b><small>${sub}</small></button>`).join('')}`;
    const layout = $('.admin-layout', view);
    view.insertBefore(nav, layout || view.firstElementChild);
    $$('[data-jump]', nav).forEach(btn => btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.jump);
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      $$('.admin-side-link').forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + btn.dataset.jump));
    }));
  }

  function organizeSections() {
    $$('#adminView .admin-main > section').forEach(section => {
      if (section.dataset.organized) return;
      section.dataset.organized = '1';
      const h = $('h3', section);
      if (h) {
        const wrap = document.createElement('div');
        wrap.className = 'dashboard-section-heading';
        h.parentNode.insertBefore(wrap, h);
        wrap.appendChild(h);
        const text = document.createElement('small');
        text.textContent = ({ adminBusiness: 'Keep the public brand information accurate.', adminProducts: 'Update rates and images without editing code.', adminNewProduct: 'Add a new material to the catalog.', adminCRM: 'Review, search and follow up customer requests.', adminPayment: 'Manage the customer payment reference.', adminExport: 'Download a local backup of your saved data.' }[section.id] || 'Manage this area from one place.');
        wrap.appendChild(text);
      }
    });
  }

  function addStaffQuickNav() {
    const staff = $('#staffView');
    if (!staff || $('#staffQuickNav')) return;
    const nav = document.createElement('div');
    nav.id = 'staffQuickNav';
    nav.className = 'dashboard-quick-nav staff-quick-nav';
    nav.innerHTML = `<div class="quick-nav-title"><b>Staff shortcuts</b><small>Jump to your daily tools</small></div><button type="button" data-staff-jump="staffRoutingPanel"><span>01</span><b>Routing profile</b><small>Area, service & WhatsApp</small></button><button type="button" data-staff-jump="staffProgress"><span>02</span><b>Site update</b><small>Progress & remarks</small></button><button type="button" data-staff-jump="activityLog"><span>03</span><b>Activity log</b><small>Recent site entries</small></button><button type="button" data-staff-jump="fieldCapturePanel"><span>04</span><b>Field capture</b><small>Camera · GPS · mic</small></button>`;
    staff.insertBefore(nav, staff.firstElementChild || null);
    $$('[data-staff-jump]', nav).forEach(btn => btn.addEventListener('click', () => document.getElementById(btn.dataset.staffJump)?.scrollIntoView({ behavior: 'smooth', block: 'start' })));
  }

  function enhance() {
    const dash = $('#adminDashboard');
    if (!dash || dash.hidden) return;
    addControlBar();
    updateRoleLabel();
    if ((sessionStorage.role || 'admin') === 'admin') { addAdminQuickNav(); organizeSections(); }
    addStaffQuickNav();
    enhanced = true;
  }

  const observer = new MutationObserver(enhance);
  const start = () => { const root = $('#adminModal') || document.body; observer.observe(root, { attributes: true, subtree: true, attributeFilter: ['hidden', 'class'] }); setInterval(enhance, 2000); enhance(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
