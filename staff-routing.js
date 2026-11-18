(() => {
  const $ = (s) => document.querySelector(s);
  const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); } catch { return fallback; } };
  const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const digits = (v) => String(v || '').replace(/\D/g, '');
  const getProfile = () => read('staffRoutingProfile', { name: '', whatsapp: '', area: '', services: [], notify: '' });
  const setText = (id, value) => { const el = $('#' + id); if (el) el.textContent = value; };

  function routeMarkup() {
    const host = $('#staffView');
    if (!host || $('#staffRoutingPanel')) return;
    const panel = document.createElement('section');
    panel.id = 'staffRoutingPanel';
    panel.className = 'staff-routing-panel';
    panel.innerHTML = `
      <div class="staff-routing-head"><div><p class="kicker">STAFF SERVICE ROUTING</p><h3>Tell us where you work</h3><p>Save your service area, supported work and WhatsApp numbers. New enquiries will use this profile for routing.</p></div><span class="routing-status" id="routingStatus">Not configured</span></div>
      <div class="staff-routing-grid">
        <label>Staff / team name<input id="routeStaffName" maxlength="80" placeholder="e.g. A. Das"></label>
        <label>Staff WhatsApp number<input id="routeStaffWhatsApp" inputmode="tel" maxlength="20" placeholder="e.g. 919876543210"></label>
        <label>Service area<input id="routeStaffArea" maxlength="120" placeholder="e.g. Gangasagar, Rudranagar"></label>
        <label>Owner notification number<input id="routeOwnerNotify" inputmode="tel" maxlength="20" placeholder="e.g. 916294193478"></label>
      </div>
      <label class="routing-services">Services you handle <small>Separate multiple services with commas</small><input id="routeStaffServices" maxlength="240" placeholder="PVC wall panels, False ceiling, UV marble sheets"></label>
      <div class="routing-actions"><button class="gold-btn" id="saveStaffRouting" type="button">Save routing profile</button><button class="ghost-btn" id="clearStaffRouting" type="button">Clear</button></div>
      <div class="routing-preview" id="routingPreview">Complete the profile to preview where new requests will go.</div>`;
    host.insertBefore(panel, host.firstElementChild || null);
    const p = getProfile();
    $('#routeStaffName').value = p.name || '';
    $('#routeStaffWhatsApp').value = p.whatsapp || '';
    $('#routeStaffArea').value = p.area || '';
    $('#routeOwnerNotify').value = p.notify || '';
    $('#routeStaffServices').value = (p.services || []).join(', ');
    const update = () => {
      const name = $('#routeStaffName').value.trim(), phone = digits($('#routeStaffWhatsApp').value), area = $('#routeStaffArea').value.trim(), notify = digits($('#routeOwnerNotify').value), services = $('#routeStaffServices').value.split(',').map(x => x.trim()).filter(Boolean);
      const valid = name && phone.length >= 10 && area && services.length;
      $('#routingStatus').textContent = valid ? 'Ready for routing' : 'Not configured';
      $('#routingStatus').classList.toggle('ready', !!valid);
      $('#routingPreview').textContent = valid ? `${name} will receive ${services.join(', ')} requests for ${area}. Owner copy: ${notify || 'not set'}.` : 'Complete the profile to preview where new requests will go.';
    };
    ['routeStaffName','routeStaffWhatsApp','routeStaffArea','routeOwnerNotify','routeStaffServices'].forEach(id => $('#' + id)?.addEventListener('input', update));
    $('#saveStaffRouting').addEventListener('click', () => {
      const profile = { name: $('#routeStaffName').value.trim(), whatsapp: digits($('#routeStaffWhatsApp').value), area: $('#routeStaffArea').value.trim(), notify: digits($('#routeOwnerNotify').value), services: $('#routeStaffServices').value.split(',').map(x => x.trim()).filter(Boolean) };
      if (!profile.name || profile.whatsapp.length < 10 || !profile.area || !profile.services.length) return window.toast?.('Add name, valid WhatsApp, area and at least one service');
      write('staffRoutingProfile', profile); update(); window.toast?.('Staff routing profile saved');
    });
    $('#clearStaffRouting').addEventListener('click', () => { write('staffRoutingProfile', { name: '', whatsapp: '', area: '', services: [], notify: '' }); ['routeStaffName','routeStaffWhatsApp','routeStaffArea','routeOwnerNotify','routeStaffServices'].forEach(id => $('#' + id).value = ''); update(); window.toast?.('Routing profile cleared'); });
    update();
  }

  function getRoute(booking) {
    const p = getProfile();
    const hay = `${booking.service || ''} ${booking.area || ''}`.toLowerCase();
    const matchesArea = p.area && p.area.toLowerCase().split(',').some(x => x.trim() && hay.includes(x.trim()));
    const matchesService = p.services?.some(x => x.toLowerCase() && hay.includes(x.toLowerCase()));
    return (matchesArea || matchesService) && p.whatsapp ? p : null;
  }

  function bindBookingRouting() {
    const form = $('#bookingForm');
    if (!form || form.dataset.routingBound) return;
    form.dataset.routingBound = '1';
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const fd = new FormData(form);
      const booking = { name: String(fd.get('name') || '').trim(), phone: String(fd.get('phone') || '').trim(), service: String(fd.get('service') || '').trim(), date: String(fd.get('date') || '').trim(), area: String(fd.get('area') || '').trim(), createdAt: new Date().toISOString() };
      const route = getRoute(booking);
      const leads = read('leads', []);
      leads.unshift({ ...booking, status: route ? 'Assigned' : 'New', assignedStaff: route?.name || '', assignedNumber: route?.whatsapp || '', ownerNotify: route?.notify || '' });
      write('leads', leads);
      const message = `Sagar Royal new measurement request\n\nCustomer: ${booking.name}\nPhone: ${booking.phone}\nArea: ${booking.area || 'Not provided'}\nService: ${booking.service}\nPreferred date: ${booking.date}\n\n${route ? `Assigned to: ${route.name}` : 'Please assign a staff member from the portal.'}`;
      const target = route?.whatsapp || digits(window.siteData?.business?.whatsappNumber || '916294193478');
      const url = `https://wa.me/${target}?text=${encodeURIComponent(message)}`;
      const opened = window.open(url, '_blank', 'noopener');
      if (!opened) window.location.href = url;
      const receipt = $('#receiptBody'); if (receipt) receipt.innerHTML = `<p><b>${booking.name}</b><br>${booking.phone}<br>${booking.service}<br>${booking.area || 'Area not provided'}<br>${booking.date}</p><p>Routing: <b>${route ? `Assigned to ${route.name}` : 'Owner review required'}</b></p>`;
      const modal = $('#receiptModal'); if (modal) modal.hidden = false;
      window.toast?.(route ? `Request routed to ${route.name}` : 'Request saved for owner assignment');
    }, true);
  }

  function init() { routeMarkup(); bindBookingRouting(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
