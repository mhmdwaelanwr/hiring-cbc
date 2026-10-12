(() => {
  const modal = document.querySelector('#modal');
  const closeModal = document.querySelector('#closeModal');
  const closeSuccess = document.querySelector('#closeSuccess');
  const success = document.querySelector('#success');
  const form = document.querySelector('#applicationForm');
  const nextBtn = document.querySelector('#nextBtn');
  const teamFirst = document.querySelector('#teamFirst');
  const teamSearch = document.querySelector('#teamSearch');
  const resultCount = document.querySelector('#teamResultCount');
  const rolesGrid = document.querySelector('#rolesGrid');
  const draftStatus = document.querySelector('#draftStatus');
  const nav = document.querySelector('.nav');

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function filterGroup(category) {
    const cat = normalize(category);
    if (['technical', 'build'].includes(cat)) return 'technical';
    if (['leadership', 'governance', 'finance', 'execution'].includes(cat)) return 'operations';
    if (['brand', 'external'].includes(cat)) return 'brand';
    if (['people', 'people ops', 'general'].includes(cat)) return 'people';
    return 'other';
  }

  function getCards() {
    return Array.from(document.querySelectorAll('#rolesGrid .role'));
  }

  function focusActiveField() {
    const field = form?.querySelector('.form-page.active input:not([type="hidden"]), .form-page.active select, .form-page.active textarea');
    field?.focus?.({ preventScroll: true });
  }

  function enhanceCards() {
    getCards().forEach(card => {
      if (card.querySelector('.role-apply')) return;
      const title = card.querySelector('h3')?.textContent?.trim();
      const category = card.querySelector('small')?.textContent?.trim();
      if (!title) return;

      card.dataset.teamName = title;
      card.dataset.teamGroup = filterGroup(category);

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
        const trigger = document.querySelector('.hero .js-apply') || document.querySelector('.js-apply');
        trigger?.click();
        window.setTimeout(focusActiveField, 120);
      });
      card.appendChild(button);
    });
  }

  let activeFilter = 'all';

  function applyTeamFilter() {
    const query = normalize(teamSearch?.value);
    let visible = 0;

    getCards().forEach(card => {
      const haystack = normalize(card.textContent);
      const groupMatches = activeFilter === 'all' || card.dataset.teamGroup === activeFilter;
      const searchMatches = !query || haystack.includes(query);
      const show = groupMatches && searchMatches;
      card.hidden = !show;
      if (show) visible += 1;
    });

    if (resultCount) {
      resultCount.textContent = visible === 1 ? '1 team shown' : `${visible} teams shown`;
    }

    let empty = document.querySelector('#teamEmpty');
    if (!visible) {
      if (!empty && rolesGrid) {
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

  document.querySelectorAll('[data-team-filter]').forEach(button => {
    button.addEventListener('click', () => {
      activeFilter = button.dataset.teamFilter || 'all';
      document.querySelectorAll('[data-team-filter]').forEach(item => {
        item.classList.toggle('active', item === button);
        item.setAttribute('aria-pressed', item === button ? 'true' : 'false');
      });
      applyTeamFilter();
    });
  });

  teamSearch?.addEventListener('input', applyTeamFilter);

  function updateDraftStatus(state) {
    if (!draftStatus) return;
    if (state === 'saving') {
      draftStatus.textContent = 'Saving draft…';
      draftStatus.classList.add('saving');
      return;
    }
    draftStatus.textContent = 'Draft saved on this device';
    draftStatus.classList.remove('saving');
  }

  let saveTimer = null;
  if (form && draftStatus) {
    const handleDraftActivity = () => {
      updateDraftStatus('saving');
      window.clearTimeout(saveTimer);
      saveTimer = window.setTimeout(() => updateDraftStatus('saved'), 450);
    };
    form.addEventListener('input', handleDraftActivity);
    form.addEventListener('change', handleDraftActivity);
    updateDraftStatus('saved');
  }

  function formValue(name) {
    const field = form?.elements?.namedItem?.(name);
    return field && 'value' in field ? String(field.value || '').trim() : '';
  }

  function ensureReviewSummary() {
    const page = form?.querySelector('.form-page[data-page="5"]');
    if (!page) return null;
    let summary = page.querySelector('.review-summary');
    if (summary) return summary;

    summary = document.createElement('div');
    summary.className = 'review-summary';
    summary.innerHTML = `
      <div class="review-summary-head">
        <span>APPLICATION REVIEW</span>
        <strong>Check your key details before submitting.</strong>
      </div>
      <div class="review-summary-grid">
        <div><span>Name</span><strong data-review="name">—</strong></div>
        <div><span>AOU email</span><strong data-review="email">—</strong></div>
        <div><span>First preference</span><strong data-review="first">—</strong></div>
        <div><span>Second preference</span><strong data-review="second">—</strong></div>
        <div><span>Availability</span><strong data-review="availability">—</strong></div>
        <div><span>In-person</span><strong data-review="in-person">—</strong></div>
      </div>
    `;

    const intro = page.querySelector(':scope > p');
    intro?.insertAdjacentElement('afterend', summary);
    return summary;
  }

  function setReviewValue(summary, key, value) {
    const target = summary?.querySelector(`[data-review="${key}"]`);
    if (target) target.textContent = value || '—';
  }

  function updateReviewSummary() {
    const page = form?.querySelector('.form-page[data-page="5"]');
    if (!page?.classList.contains('active')) return;

    const summary = ensureReviewSummary();
    const firstTeam = formValue('team_first');
    const firstRole = formValue('preferred_role');
    const secondTeam = formValue('team_second');
    const secondRole = formValue('second_preferred_role');

    setReviewValue(summary, 'name', formValue('full_name'));
    setReviewValue(summary, 'email', formValue('university_email'));
    setReviewValue(summary, 'first', [firstTeam, firstRole].filter(Boolean).join(' · '));
    setReviewValue(summary, 'second', [secondTeam, secondRole].filter(Boolean).join(' · '));
    setReviewValue(summary, 'availability', formValue('availability'));
    setReviewValue(summary, 'in-person', formValue('in_person'));
  }

  const reviewPage = form?.querySelector('.form-page[data-page="5"]');
  if (reviewPage) {
    const observer = new MutationObserver(updateReviewSummary);
    observer.observe(reviewPage, { attributes: true, attributeFilter: ['class'] });
  }
  nextBtn?.addEventListener('click', () => window.setTimeout(updateReviewSummary, 0));
  form?.addEventListener('change', updateReviewSummary);
  form?.addEventListener('input', updateReviewSummary);

  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || !modal?.classList.contains('open')) return;
    if (success?.classList.contains('show')) closeSuccess?.click();
    else closeModal?.click();
  });

  closeModal?.addEventListener('click', () => {
    if (success?.classList.contains('show')) {
      window.setTimeout(() => closeSuccess?.click(), 0);
    }
  });

  document.querySelectorAll('.js-apply').forEach(button => {
    button.addEventListener('click', () => {
      window.setTimeout(() => {
        if (modal?.classList.contains('open')) focusActiveField();
      }, 120);
    });
  });

  function syncNavState() {
    nav?.classList.toggle('scrolled', window.scrollY > 8);
  }
  syncNavState();
  window.addEventListener('scroll', syncNavState, { passive: true });

  const year = document.querySelector('#footerYear');
  if (year) year.textContent = new Date().getFullYear();

  enhanceCards();
  applyTeamFilter();
  ensureReviewSummary();
})();
