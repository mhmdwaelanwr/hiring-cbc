(() => {
  const qs = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => Array.from(r.querySelectorAll(s));
  const normalize = v => String(v || '').toLowerCase().trim();
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!qs('link[data-cbc-mobile-menu]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = './mobile-menu.css?v=20261012r4';
    link.dataset.cbcMobileMenu = 'true';
    document.head.appendChild(link);
  }

  const modal = qs('#modal');
  const modalCard = qs('.modal-card');
  const closeModal = qs('#closeModal');
  const closeSuccess = qs('#closeSuccess');
  const success = qs('#success');
  const form = qs('#applicationForm');
  const nextBtn = qs('#nextBtn');
  const teamFirst = qs('#teamFirst');
  const teamSearch = qs('#teamSearch');
  const resultCount = qs('#teamResultCount');
  const rolesGrid = qs('#rolesGrid');
  const draftStatus = qs('#draftStatus');
  const nav = qs('.nav');
  const navContainer = qs('.nav-links');
  const hero = qs('.hero');
  const heroStatus = qs('#heroStatus');
  const themeToggle = qs('#themeToggle');
  let lastFocused = null;

  function initMobileMenu() {
    if (!navContainer || qs('.mobile-menu-toggle')) return;

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'mobile-menu-toggle';
    toggle.setAttribute('aria-label', 'Open navigation menu');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', 'mobileMenu');
    toggle.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path class="menu-line" d="M4 6h16"/><path class="menu-line" d="M4 12h16"/><path class="menu-line" d="M4 18h16"/></svg>';
    navContainer.insertBefore(toggle, qs('.nav-apply', navContainer) || null);

    const shell = document.createElement('div');
    shell.className = 'mobile-menu-shell';
    shell.id = 'mobileMenu';
    shell.setAttribute('aria-hidden', 'true');
    shell.innerHTML = `
      <button class="mobile-menu-backdrop" type="button" aria-label="Close navigation menu"></button>
      <aside class="mobile-menu-panel" role="dialog" aria-modal="true" aria-label="Mobile navigation">
        <div class="mobile-menu-head">
          <div class="mobile-menu-brand"><span class="mobile-menu-mark" aria-hidden="true"></span><span><strong>Claude Builder Club</strong><small>AOU Egypt · Founding Team</small></span></div>
          <button class="mobile-menu-close" type="button" aria-label="Close navigation menu">×</button>
        </div>
        <div class="mobile-menu-status">Applications opening soon</div>
        <nav class="mobile-menu-nav" aria-label="Mobile navigation links">
          <a href="#top">Home</a><a href="#about">About</a><a href="#teams">Teams</a><a href="#process">Process</a><a href="#community">Community</a>
        </nav>
        <div class="mobile-menu-divider" aria-hidden="true"></div>
        <div class="mobile-menu-socials">
          <a class="mobile-menu-social facebook" href="https://www.facebook.com/claudeaouclub" target="_blank" rel="noopener noreferrer"><svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M13.6 22v-9h3l.45-3.5H13.6V7.27c0-1.01.28-1.7 1.74-1.7H17.2V2.44A24.8 24.8 0 0 0 14.5 2c-2.67 0-4.5 1.63-4.5 4.62V9.5H7V13h3v9h3.6Z"/></svg><span>Facebook</span></a>
          <a class="mobile-menu-social whatsapp" href="https://chat.whatsapp.com/GwiXzxyBXTBDsBqeenPYP8" target="_blank" rel="noopener noreferrer"><svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M20.52 3.48A11.82 11.82 0 0 0 12.06 0C5.47 0 .11 5.36.11 11.95c0 2.1.55 4.16 1.6 5.96L0 24l6.24-1.64a11.93 11.93 0 0 0 5.81 1.48h.01c6.59 0 11.95-5.36 11.95-11.95 0-3.19-1.24-6.19-3.49-8.41Z"/></svg><span>WhatsApp</span></a>
        </div>
        <button class="mobile-menu-theme" type="button"><span>Appearance</span><span data-mobile-theme>System</span></button>
        <div class="mobile-menu-actions"><button class="mobile-menu-apply" type="button">Start application</button></div>
      </aside>`;
    document.body.appendChild(shell);

    const panel = qs('.mobile-menu-panel', shell);
    const closeBtn = qs('.mobile-menu-close', shell);
    const backdrop = qs('.mobile-menu-backdrop', shell);
    const drawerApply = qs('.mobile-menu-apply', shell);
    const drawerTheme = qs('.mobile-menu-theme', shell);
    const themeLabel = qs('[data-mobile-theme]', shell);
    const drawerStatus = qs('.mobile-menu-status', shell);
    const viewport = matchMedia('(max-width: 760px)');
    let menuFocus = null;

    const sync = () => {
      if (drawerStatus && heroStatus) {
        drawerStatus.textContent = heroStatus.textContent || 'Applications opening soon';
        drawerStatus.classList.toggle('live', heroStatus.classList.contains('live'));
      }
      if (themeLabel) {
        const pref = document.documentElement.dataset.themePreference || 'system';
        themeLabel.textContent = pref === 'system' ? 'System' : pref[0].toUpperCase() + pref.slice(1);
      }
      if (drawerApply) drawerApply.hidden = !qs('.js-apply:not([hidden])');
    };

    const focusables = () => qsa('a[href],button:not([disabled]):not([hidden])', panel).filter(el => el.offsetParent !== null);
    const open = () => {
      if (!viewport.matches || modal?.classList.contains('open')) return;
      menuFocus = document.activeElement;
      sync();
      shell.classList.add('is-open');
      shell.setAttribute('aria-hidden', 'false');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Close navigation menu');
      document.body.classList.add('mobile-menu-open');
      setTimeout(() => closeBtn?.focus({ preventScroll: true }), reduced ? 0 : 70);
    };
    const close = (restore = true) => {
      shell.classList.remove('is-open');
      shell.setAttribute('aria-hidden', 'true');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open navigation menu');
      document.body.classList.remove('mobile-menu-open');
      if (restore && menuFocus instanceof HTMLElement) menuFocus.focus?.({ preventScroll: true });
      menuFocus = null;
    };

    toggle.addEventListener('click', () => shell.classList.contains('is-open') ? close() : open());
    closeBtn?.addEventListener('click', () => close());
    backdrop?.addEventListener('click', () => close());
    qsa('.mobile-menu-nav a,.mobile-menu-social', shell).forEach(el => el.addEventListener('click', () => close(false)));
    drawerTheme?.addEventListener('click', () => { themeToggle?.click(); setTimeout(sync, 0); });
    drawerApply?.addEventListener('click', () => {
      close(false);
      const trigger = qs('.hero .js-apply:not([hidden])') || qs('.js-apply:not([hidden])');
      setTimeout(() => trigger?.click(), reduced ? 0 : 70);
    });

    document.addEventListener('keydown', e => {
      if (!shell.classList.contains('is-open')) return;
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key !== 'Tab') return;
      const list = focusables();
      if (!list.length) return;
      const first = list[0], last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    viewport.addEventListener?.('change', e => { if (!e.matches) close(false); });
    if (heroStatus && 'MutationObserver' in window) new MutationObserver(sync).observe(heroStatus, { childList:true, subtree:true, attributes:true, attributeFilter:['class'] });
    if ('MutationObserver' in window) new MutationObserver(sync).observe(document.documentElement, { attributes:true, attributeFilter:['data-theme','data-theme-preference'] });
    sync();
  }
  initMobileMenu();

  const groupFor = c => {
    const v = normalize(c);
    if (['technical','build'].includes(v)) return 'technical';
    if (['leadership','governance','finance','execution'].includes(v)) return 'operations';
    if (['brand','external'].includes(v)) return 'brand';
    if (['people','people ops','general'].includes(v)) return 'people';
    return 'other';
  };
  const cards = () => qsa('#rolesGrid .role');
  function focusActiveField(){
    qs('.form-page.active input:not([type="hidden"]):not([disabled]),.form-page.active select:not([disabled]),.form-page.active textarea:not([disabled]),.form-page.active button:not([disabled])', form)?.focus?.({ preventScroll:true });
  }
  cards().forEach(card => {
    const title = qs('h3', card)?.textContent?.trim();
    if (!title) return;
    card.dataset.teamName = title;
    card.dataset.teamGroup = groupFor(qs('small', card)?.textContent);
    if (qs('.role-apply', card)) return;
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'role-apply';
    button.innerHTML = '<span>Apply to this team</span><span aria-hidden="true">→</span>';
    button.setAttribute('aria-label', `Apply to ${title}`);
    button.addEventListener('click', () => {
      if (teamFirst) { teamFirst.value = title; teamFirst.dispatchEvent(new Event('change', { bubbles:true })); }
      (qs('.hero .js-apply') || qs('.js-apply'))?.click();
      setTimeout(focusActiveField, 90);
    });
    card.appendChild(button);
  });

  let activeFilter = 'all';
  function filterTeams(){
    const query = normalize(teamSearch?.value); let visible = 0;
    cards().forEach(card => {
      const show = (activeFilter === 'all' || card.dataset.teamGroup === activeFilter) && (!query || normalize(card.textContent).includes(query));
      card.hidden = !show; if (show) visible++;
    });
    if (resultCount) resultCount.textContent = `${visible} ${visible === 1 ? 'team' : 'teams'} shown`;
    let empty = qs('#teamEmpty');
    if (!visible && rolesGrid) {
      if (!empty) { empty = document.createElement('div'); empty.id='teamEmpty'; empty.className='team-empty'; empty.textContent='No teams match that search. Try another keyword or filter.'; rolesGrid.appendChild(empty); }
      empty.hidden = false;
    } else if (empty) empty.hidden = true;
  }
  qsa('[data-team-filter]').forEach(btn => btn.addEventListener('click', () => {
    activeFilter = btn.dataset.teamFilter || 'all';
    qsa('[data-team-filter]').forEach(x => { const on = x === btn; x.classList.toggle('active', on); x.setAttribute('aria-pressed', String(on)); });
    filterTeams();
  }));
  teamSearch?.addEventListener('input', filterTeams, { passive:true });

  let draftTimer = 0;
  const setDraft = saving => {
    if (!draftStatus) return;
    draftStatus.textContent = saving ? 'Saving draft…' : 'Draft saved on this device';
    draftStatus.classList.toggle('saving', saving);
  };
  if (form && draftStatus) {
    const activity = () => { setDraft(true); clearTimeout(draftTimer); draftTimer = setTimeout(() => setDraft(false), 420); };
    form.addEventListener('input', activity, { passive:true }); form.addEventListener('change', activity, { passive:true }); setDraft(false);
  }

  const value = name => { const f = form?.elements?.namedItem?.(name); return f && 'value' in f ? String(f.value || '').trim() : ''; };
  function ensureReview(){
    const page = qs('.form-page[data-page="5"]', form); if (!page) return null;
    let box = qs('.review-summary', page); if (box) return box;
    box = document.createElement('div'); box.className='preference-card review-summary';
    box.innerHTML='<div class="success-kicker">APPLICATION REVIEW</div><p>Check your key details before submitting.</p><div class="success-summary review-summary-grid"><div><span>Name</span><strong data-review="name">—</strong></div><div><span>AOU email</span><strong data-review="email">—</strong></div><div><span>First preference</span><strong data-review="first">—</strong></div><div><span>Second preference</span><strong data-review="second">—</strong></div><div><span>Availability</span><strong data-review="availability">—</strong></div><div><span>In-person</span><strong data-review="in-person">—</strong></div></div>';
    page.querySelector(':scope > p')?.insertAdjacentElement('afterend', box); return box;
  }
  function updateReview(){
    const page = qs('.form-page[data-page="5"]', form); if (!page?.classList.contains('active')) return;
    const box = ensureReview();
    const set = (k,v) => { const el = qs(`[data-review="${k}"]`, box); if (el) el.textContent = v || '—'; };
    set('name', value('full_name')); set('email', value('university_email'));
    set('first', [value('team_first'), value('preferred_role')].filter(Boolean).join(' · '));
    set('second', [value('team_second'), value('second_preferred_role')].filter(Boolean).join(' · '));
    set('availability', value('availability')); set('in-person', value('in_person'));
  }
  const reviewPage = qs('.form-page[data-page="5"]', form);
  if (reviewPage && 'MutationObserver' in window) new MutationObserver(updateReview).observe(reviewPage, { attributes:true, attributeFilter:['class'] });
  nextBtn?.addEventListener('click', () => setTimeout(updateReview, 0));
  form?.addEventListener('input', updateReview, { passive:true }); form?.addEventListener('change', updateReview, { passive:true });

  function makeDock(){
    if (qs('.mobile-dock')) return qs('.mobile-dock');
    const dock = document.createElement('div'); dock.className='mobile-dock'; dock.hidden=true;
    dock.innerHTML='<button type="button" class="dock-apply">Start application</button><a class="dock-updates" href="https://chat.whatsapp.com/GwiXzxyBXTBDsBqeenPYP8" target="_blank" rel="noopener noreferrer" aria-label="Recruitment updates on WhatsApp"><svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M20.52 3.48A11.82 11.82 0 0 0 12.06 0C5.47 0 .11 5.36.11 11.95c0 2.1.55 4.16 1.6 5.96L0 24l6.24-1.64a11.93 11.93 0 0 0 5.81 1.48h.01c6.59 0 11.95-5.36 11.95-11.95 0-3.19-1.24-6.19-3.49-8.41Z"/></svg></a>';
    document.body.appendChild(dock);
    qs('.dock-apply', dock)?.addEventListener('click', () => (qs('.hero .js-apply:not([hidden])') || qs('.js-apply:not([hidden])'))?.click());
    return dock;
  }
  const mobileDock = makeDock();
  const mobile = matchMedia('(max-width:620px)');
  function updateDock(heroVisible = null){
    if (!mobileDock) return;
    if (!mobile.matches || modal?.classList.contains('open') || document.body.classList.contains('mobile-menu-open') || !qs('.js-apply:not([hidden])')) { mobileDock.hidden=true; return; }
    mobileDock.hidden = heroVisible === null ? (hero ? hero.getBoundingClientRect().bottom > innerHeight*.82 : false) : heroVisible;
  }
  if (hero && 'IntersectionObserver' in window) new IntersectionObserver(([e]) => updateDock(e.isIntersecting && e.intersectionRatio>.18), { threshold:[0,.18,.45] }).observe(hero); else updateDock();
  mobile.addEventListener?.('change', () => updateDock());

  function syncModal(){
    const open = !!modal?.classList.contains('open'); document.body.classList.toggle('modal-open', open); updateDock(open ? true : null);
    if (open) { if (!lastFocused) lastFocused=document.activeElement; setTimeout(focusActiveField,80); }
    else if (lastFocused instanceof HTMLElement) { lastFocused.focus?.({ preventScroll:true }); lastFocused=null; }
  }
  if (modal && 'MutationObserver' in window) new MutationObserver(syncModal).observe(modal, { attributes:true, attributeFilter:['class'] });
  const modalFocusables = () => qsa('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])', modalCard).filter(el => !el.hidden && el.offsetParent !== null);
  document.addEventListener('keydown', e => {
    if (!modal?.classList.contains('open')) return;
    if (e.key === 'Escape') { e.preventDefault(); success?.classList.contains('show') ? closeSuccess?.click() : closeModal?.click(); return; }
    if (e.key !== 'Tab') return; const list=modalFocusables(); if (!list.length) return; const first=list[0], last=list[list.length-1];
    if (e.shiftKey && document.activeElement===first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement===last) { e.preventDefault(); first.focus(); }
  });
  closeModal?.addEventListener('click', () => { if (success?.classList.contains('show')) setTimeout(() => closeSuccess?.click(),0); });

  qsa('.faq-list details').forEach(d => d.addEventListener('toggle', () => { if (d.open) qsa('.faq-list details').forEach(o => { if (o!==d) o.open=false; }); }));

  const navLinks = qsa('.nav-links a[href^="#"]');
  const sections = navLinks.map(l => qs(l.getAttribute('href'))).filter(Boolean);
  if (sections.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      const v = entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0]; if (!v) return;
      navLinks.forEach(l => l.classList.toggle('is-active', l.getAttribute('href')===`#${v.target.id}`));
    }, { rootMargin:'-25% 0px -58% 0px', threshold:[0,.1,.35] });
    sections.forEach(s => observer.observe(s));
  }
  let ticking=false;
  addEventListener('scroll', () => { if (ticking) return; ticking=true; requestAnimationFrame(() => { nav?.classList.toggle('scrolled', scrollY>8); if (!('IntersectionObserver' in window)) updateDock(); ticking=false; }); }, { passive:true });
  nav?.classList.toggle('scrolled', scrollY>8);

  function reveals(){
    const els=qsa('.value-card,.role,.steps>div,.faq-list details,.community-card,.cta');
    if (reduced || !('IntersectionObserver' in window)) { els.forEach(e=>e.classList.add('is-visible')); return; }
    els.forEach(e=>e.classList.add('reveal-ready'));
    const o=new IntersectionObserver(entries => entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('is-visible'); o.unobserve(e.target); } }), { rootMargin:'0px 0px -8% 0px', threshold:.08 });
    els.forEach(e=>o.observe(e));
  }

  qsa('.js-apply').forEach(b => b.addEventListener('click', () => setTimeout(focusActiveField,90)));
  const year=qs('#footerYear'); if(year) year.textContent=new Date().getFullYear();
  filterTeams(); ensureReview(); syncModal();
  (window.requestIdleCallback || (cb => setTimeout(cb, 1)))(reveals);
})();
