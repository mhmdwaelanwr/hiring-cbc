(() => {
  const qs = (selector, root = document) => root.querySelector(selector);
  const qsa = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const normalize = value => String(value || '').toLowerCase().trim();
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
  const hero = qs('.hero');

  let lastFocusedElement = null;

  /* ---------- Team discovery ---------- */
  function filterGroup(category) {
    const cat = normalize(category);
    if (['technical', 'build'].includes(cat)) return 'technical';
    if (['leadership', 'governance', 'finance', 'execution'].includes(cat)) return 'operations';
    if (['brand', 'external'].includes(cat)) return 'brand';
    if (['people', 'people ops', 'general'].includes(cat)) return 'people';
    return 'other';
  }

  function getCards() {
    return qsa('#rolesGrid .role');
  }

  function focusActiveField() {
    const activePage = qs('.form-page.active', form);
    const field = activePage?.querySelector('input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled])');
    field?.focus?.({ preventScroll: true });
  }

  function enhanceCards() {
    getCards().forEach(card => {
      const title = qs('h3', card)?.textContent?.trim();
      const category = qs('small', card)?.textContent?.trim();
      if (!title) return;

      card.dataset.teamName = title;
      card.dataset.teamGroup = filterGroup(category);

      if (qs('.role-apply', card)) return;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'role-apply';
      button.innerHTML = '<span>Apply to this team</span><span aria-hidden="true">→</span>';
      button.setAttribute('aria-label', `Apply to ${title}`);
      button.addEventListener('click', () => {
        if (teamFirst) {
          teamFirst.value = title;
          teamFirst.dispatchEvent(new Event('change', { bubbles: true }));
        }
        const trigger = qs('.hero .js-apply') || qs('.js-apply');
        trigger?.click();
        window.setTimeout(focusActiveField, 90);
      });
      card.appendChild(button);
    });
  }

  let activeFilter = 'all';

  function applyTeamFilter() {
    const query = normalize(teamSearch?.value);
    let visible = 0;

    getCards().forEach(card => {
      const groupMatches = activeFilter === 'all' || card.dataset.teamGroup === activeFilter;
      const searchMatches = !query || normalize(card.textContent).includes(query);
      const show = groupMatches && searchMatches;
      card.hidden = !show;
      if (show) visible += 1;
    });

    if (resultCount) resultCount.textContent = `${visible} ${visible === 1 ? 'team' : 'teams'} shown`;

    let empty = qs('#teamEmpty');
    if (!visible && rolesGrid) {
      if (!empty) {
        empty = document.createElement('div');
        empty.id = 'teamEmpty';
        empty.className = 'team-empty';
        empty.textContent = 'No teams match that search. Try another keyword or filter.';
        rolesGrid.appendChild(empty);
      }
      empty.hidden = false;
    } else if (empty) {
      empty.hidden = true;
    }
  }

  qsa('[data-team-filter]').forEach(button => {
    button.addEventListener('click', () => {
      activeFilter = button.dataset.teamFilter || 'all';
      qsa('[data-team-filter]').forEach(item => {
        const active = item === button;
        item.classList.toggle('active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      applyTeamFilter();
    });
  });

  teamSearch?.addEventListener('input', applyTeamFilter, { passive: true });

  /* ---------- Draft feedback ---------- */
  function setDraftStatus(saving) {
    if (!draftStatus) return;
    draftStatus.textContent = saving ? 'Saving draft…' : 'Draft saved on this device';
    draftStatus.classList.toggle('saving', saving);
  }

  let draftTimer = 0;
  if (form && draftStatus) {
    const onDraftChange = () => {
      setDraftStatus(true);
      window.clearTimeout(draftTimer);
      draftTimer = window.setTimeout(() => setDraftStatus(false), 420);
    };
    form.addEventListener('input', onDraftChange, { passive: true });
    form.addEventListener('change', onDraftChange, { passive: true });
    setDraftStatus(false);
  }

  /* ---------- Review summary ---------- */
  function formValue(name) {
    const field = form?.elements?.namedItem?.(name);
    return field && 'value' in field ? String(field.value || '').trim() : '';
  }

  function ensureReviewSummary() {
    const page = qs('.form-page[data-page="5"]', form);
    if (!page) return null;
    let summary = qs('.review-summary', page);
    if (summary) return summary;

    summary = document.createElement('div');
    summary.className = 'preference-card review-summary';
    summary.innerHTML = `
      <div class="success-kicker">APPLICATION REVIEW</div>
      <p>Check your key details before submitting.</p>
      <div class="success-summary review-summary-grid">
        <div><span>Name</span><strong data-review="name">—</strong></div>
        <div><span>AOU email</span><strong data-review="email">—</strong></div>
        <div><span>First preference</span><strong data-review="first">—</strong></div>
        <div><span>Second preference</span><strong data-review="second">—</strong></div>
        <div><span>Availability</span><strong data-review="availability">—</strong></div>
        <div><span>In-person</span><strong data-review="in-person">—</strong></div>
      </div>`;

    const intro = page.querySelector(':scope > p');
    intro?.insertAdjacentElement('afterend', summary);
    return summary;
  }

  function setReviewValue(summary, key, value) {
    const target = summary?.querySelector(`[data-review="${key}"]`);
    if (target) target.textContent = value || '—';
  }

  function updateReviewSummary() {
    const page = qs('.form-page[data-page="5"]', form);
    if (!page?.classList.contains('active')) return;

    const summary = ensureReviewSummary();
    const first = [formValue('team_first'), formValue('preferred_role')].filter(Boolean).join(' · ');
    const second = [formValue('team_second'), formValue('second_preferred_role')].filter(Boolean).join(' · ');
    setReviewValue(summary, 'name', formValue('full_name'));
    setReviewValue(summary, 'email', formValue('university_email'));
    setReviewValue(summary, 'first', first);
    setReviewValue(summary, 'second', second);
    setReviewValue(summary, 'availability', formValue('availability'));
    setReviewValue(summary, 'in-person', formValue('in_person'));
  }

  const reviewPage = qs('.form-page[data-page="5"]', form);
  if (reviewPage && 'MutationObserver' in window) {
    new MutationObserver(updateReviewSummary).observe(reviewPage, { attributes: true, attributeFilter: ['class'] });
  }
  nextBtn?.addEventListener('click', () => window.setTimeout(updateReviewSummary, 0));
  form?.addEventListener('change', updateReviewSummary, { passive: true });
  form?.addEventListener('input', updateReviewSummary, { passive: true });

  /* ---------- Mobile action dock ---------- */
  function createMobileDock() {
    if (qs('.mobile-dock')) return qs('.mobile-dock');

    const dock = document.createElement('div');
    dock.className = 'mobile-dock';
    dock.hidden = true;
    dock.innerHTML = `
      <button type="button" class="dock-apply">Start application</button>
      <a class="dock-updates" href="https://chat.whatsapp.com/GwiXzxyBXTBDsBqeenPYP8" target="_blank" rel="noopener noreferrer" aria-label="Recruitment updates on WhatsApp">
        <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M20.52 3.48A11.82 11.82 0 0 0 12.06 0C5.47 0 .11 5.36.11 11.95c0 2.1.55 4.16 1.6 5.96L0 24l6.24-1.64a11.93 11.93 0 0 0 5.81 1.48h.01c6.59 0 11.95-5.36 11.95-11.95 0-3.19-1.24-6.19-3.49-8.41Z"/></svg>
      </a>`;
    document.body.appendChild(dock);

    qs('.dock-apply', dock)?.addEventListener('click', () => {
      const trigger = qs('.hero .js-apply:not([hidden])') || qs('.js-apply:not([hidden])');
      trigger?.click();
    });
    return dock;
  }

  const mobileDock = createMobileDock();
  const mobileQuery = window.matchMedia('(max-width: 620px)');

  function updateDockVisibility(heroVisible = null) {
    if (!mobileDock) return;
    if (!mobileQuery.matches || modal?.classList.contains('open')) {
      mobileDock.hidden = true;
      return;
    }

    const applyAvailable = Boolean(qs('.js-apply:not([hidden])'));
    if (!applyAvailable) {
      mobileDock.hidden = true;
      return;
    }

    const shouldHideForHero = heroVisible === null
      ? (hero ? hero.getBoundingClientRect().bottom > window.innerHeight * .82 : false)
      : heroVisible;
    mobileDock.hidden = shouldHideForHero;
  }

  if (hero && 'IntersectionObserver' in window) {
    const heroObserver = new IntersectionObserver(entries => {
      const entry = entries[0];
      updateDockVisibility(entry.isIntersecting && entry.intersectionRatio > .18);
    }, { threshold: [0, .18, .45] });
    heroObserver.observe(hero);
  } else {
    updateDockVisibility();
  }
  mobileQuery.addEventListener?.('change', () => updateDockVisibility());

  /* ---------- Modal state / keyboard accessibility ---------- */
  function syncModalState() {
    const open = Boolean(modal?.classList.contains('open'));
    document.body.classList.toggle('modal-open', open);
    updateDockVisibility(open ? true : null);

    if (open) {
      if (!lastFocusedElement) lastFocusedElement = document.activeElement;
      window.setTimeout(focusActiveField, 80);
    } else if (lastFocusedElement instanceof HTMLElement) {
      lastFocusedElement.focus?.({ preventScroll: true });
      lastFocusedElement = null;
    }
  }

  if (modal && 'MutationObserver' in window) {
    new MutationObserver(syncModalState).observe(modal, { attributes: true, attributeFilter: ['class'] });
  }

  function getFocusable() {
    if (!modalCard) return [];
    return qsa('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])', modalCard)
      .filter(el => !el.hidden && el.offsetParent !== null);
  }

  document.addEventListener('keydown', event => {
    if (!modal?.classList.contains('open')) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      if (success?.classList.contains('show')) closeSuccess?.click();
      else closeModal?.click();
      return;
    }

    if (event.key === 'Tab') {
      const focusable = getFocusable();
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  closeModal?.addEventListener('click', () => {
    if (success?.classList.contains('show')) window.setTimeout(() => closeSuccess?.click(), 0);
  });

  /* ---------- FAQ ---------- */
  qsa('.faq-list details').forEach(detail => {
    detail.addEventListener('toggle', () => {
      if (!detail.open) return;
      qsa('.faq-list details').forEach(other => {
        if (other !== detail) other.open = false;
      });
    });
  });

  /* ---------- Active navigation + scroll state ---------- */
  const navLinks = qsa('.nav-links a[href^="#"]');
  const sections = navLinks
    .map(link => qs(link.getAttribute('href')))
    .filter(Boolean);

  if (sections.length && 'IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(entries => {
      const visible = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      navLinks.forEach(link => link.classList.toggle('is-active', link.getAttribute('href') === `#${visible.target.id}`));
    }, { rootMargin: '-25% 0px -58% 0px', threshold: [0, .1, .35] });
    sections.forEach(section => sectionObserver.observe(section));
  }

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      nav?.classList.toggle('scrolled', window.scrollY > 8);
      if (!('IntersectionObserver' in window)) updateDockVisibility();
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Lightweight reveal motion ---------- */
  function setupReveals() {
    const elements = qsa('.value-card,.role,.steps>div,.faq-list details,.community-card,.cta');
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      elements.forEach(el => el.classList.add('is-visible'));
      return;
    }

    elements.forEach(el => el.classList.add('reveal-ready'));
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
    elements.forEach(el => observer.observe(el));
  }

  /* ---------- Apply triggers ---------- */
  qsa('.js-apply').forEach(button => {
    button.addEventListener('click', () => window.setTimeout(focusActiveField, 90));
  });

  const year = qs('#footerYear');
  if (year) year.textContent = new Date().getFullYear();

  enhanceCards();
  applyTeamFilter();
  ensureReviewSummary();
  syncModalState();

  const idle = window.requestIdleCallback || (callback => window.setTimeout(callback, 1));
  idle(setupReveals);
})();
