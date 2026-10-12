(() => {
  /*
    Final responsive guardrails.
    These rules intentionally load after every CSS layer so older visual layers
    cannot re-introduce mobile overflow or override the HTML hidden attribute.
  */
  const responsiveStyle = document.createElement('style');
  responsiveStyle.id = 'cbc-responsive-guardrails';
  responsiveStyle.textContent = `
    [hidden]{display:none!important}
    html,body{max-width:100%;overflow-x:hidden}
    .nav-inner,.hero,.stats,.section,.footer,.community-card,.cta{min-width:0}

    @media(max-width:760px){
      .nav-links>a{display:none!important}
      .nav-status{display:none!important}
      .nav-links .theme-toggle,.nav-links .nav-apply{display:inline-flex!important}
    }

    @media(max-width:620px){
      html{scroll-padding-top:72px}
      body{padding-bottom:66px!important}

      .nav{overflow:visible}
      .nav-inner{
        width:100%!important;
        min-height:64px!important;
        padding:0 12px!important;
        gap:8px!important;
      }
      .brand{
        flex:1 1 auto!important;
        min-width:0!important;
        max-width:calc(100% - 116px)!important;
        gap:8px!important;
        overflow:hidden;
      }
      .brand::before{
        width:38px!important;
        height:38px!important;
        flex:0 0 38px!important;
        border-radius:12px!important;
        background-size:21px 21px!important;
      }
      .brand-copy{
        min-width:0!important;
        overflow:hidden!important;
      }
      .brand-copy strong{
        display:block!important;
        max-width:100%!important;
        overflow:hidden!important;
        text-overflow:ellipsis!important;
        white-space:nowrap!important;
        font-size:12px!important;
        line-height:1.15!important;
      }
      .brand-copy small{display:none!important}

      .nav-links{
        flex:0 0 auto!important;
        gap:7px!important;
        min-width:auto!important;
      }
      .nav-links>a,.nav-facebook,.nav-whatsapp,.nav-status{display:none!important}
      .theme-toggle{
        display:inline-grid!important;
        place-items:center!important;
        width:36px!important;
        height:36px!important;
        min-height:36px!important;
        padding:0!important;
        border-radius:50%!important;
        flex:0 0 36px!important;
      }
      .theme-toggle .theme-label{display:none!important}
      .theme-toggle .theme-icon{
        width:auto!important;
        height:auto!important;
        background:transparent!important;
        font-size:15px!important;
      }
      .nav-apply{
        display:inline-flex!important;
        min-width:68px!important;
        min-height:40px!important;
        padding:10px 14px!important;
        border-radius:13px!important;
        font-size:12px!important;
        line-height:1!important;
        white-space:nowrap!important;
      }

      .hero{
        width:min(92%,1180px)!important;
        min-height:0!important;
        padding:36px 0 36px!important;
        gap:24px!important;
      }
      .hero-status{
        margin:0 0 18px!important;
        padding:7px 10px!important;
        font-size:10.5px!important;
      }
      .hero .eyebrow{
        margin-bottom:12px!important;
        font-size:9.5px!important;
        letter-spacing:.13em!important;
      }
      .hero h1{
        max-width:100%!important;
        font-size:clamp(42px,12.2vw,54px)!important;
        line-height:.94!important;
        letter-spacing:-.045em!important;
        overflow-wrap:normal!important;
      }
      .hero-club-name{
        margin:14px 0 17px!important;
        gap:8px!important;
        font-size:24px!important;
        line-height:1.08!important;
      }
      .hero-club-name::before{
        width:25px!important;
        height:25px!important;
        flex-basis:25px!important;
        border-radius:8px!important;
        background-size:14px 14px!important;
      }
      .lead{
        max-width:100%!important;
        font-size:15.5px!important;
        line-height:1.62!important;
      }
      .hero-actions{
        display:grid!important;
        grid-template-columns:1fr!important;
        gap:9px!important;
        margin-top:22px!important;
      }
      .hero-actions .btn,
      .hero-actions a{
        width:100%!important;
        min-height:50px!important;
        padding:13px 16px!important;
        border-radius:14px!important;
        font-size:15px!important;
        line-height:1.2!important;
        text-align:center!important;
        justify-content:center!important;
      }
      .hero-actions svg{width:16px!important;height:16px!important;flex:0 0 16px!important}

      .community-proof{
        display:flex!important;
        flex-direction:row!important;
        align-items:center!important;
        justify-content:flex-start!important;
        flex-wrap:wrap!important;
        gap:7px!important;
        margin-top:14px!important;
      }
      .community-proof span,
      .community-proof a{
        width:auto!important;
        min-height:30px!important;
        padding:6px 9px!important;
        justify-content:flex-start!important;
        border-radius:999px!important;
        font-size:9.5px!important;
        line-height:1.2!important;
      }
      .community-proof svg{width:13px!important;height:13px!important;flex:0 0 13px!important}
      .community-proof .proof-facebook{display:none!important}

      .hero-panel,
      .hero-panel.hero-brief{
        width:100%!important;
        min-height:0!important;
        padding:23px!important;
        border-radius:20px!important;
      }
      .hero-panel h2,.hero-panel.hero-brief h2{
        font-size:29px!important;
        line-height:1.08!important;
      }
      .hero-panel li,.hero-panel.hero-brief li{font-size:13px!important;line-height:1.5!important}

      .stats{
        grid-template-columns:1fr 1fr!important;
        gap:9px!important;
        margin-bottom:50px!important;
      }
      .stats div{min-height:82px!important;padding:14px!important}
      .stats strong{font-size:25px!important}
      .stats span{font-size:9px!important}

      .section{padding:54px 0!important}
      .section-head{margin-bottom:22px!important}
      .section-head h2{font-size:34px!important;line-height:1.03!important}
      .section-head p{font-size:14px!important;line-height:1.6!important}

      .role{padding:20px!important;border-radius:16px!important}
      .role h3{font-size:20px!important}
      .role p{font-size:13px!important}
      .role-apply{min-height:44px!important;font-size:11px!important}

      .community-card{
        grid-template-columns:1fr!important;
        gap:20px!important;
        padding:22px 19px!important;
        border-radius:18px!important;
      }
      .community-card h2{font-size:32px!important}
      .community-card p{font-size:13.5px!important}
      .community-actions{
        display:grid!important;
        grid-template-columns:1fr!important;
        width:100%!important;
        gap:8px!important;
      }
      .community-link{
        width:100%!important;
        min-height:46px!important;
        padding:11px 13px!important;
        font-size:12px!important;
      }
      .community-link svg{width:16px!important;height:16px!important}

      .cta{
        min-height:0!important;
        padding:26px 22px!important;
        border-radius:19px!important;
      }
      .cta h2{font-size:31px!important}
      .cta .btn{width:100%!important;min-height:48px!important;font-size:14px!important}

      .floating-whatsapp{
        left:auto!important;
        right:12px!important;
        bottom:calc(10px + env(safe-area-inset-bottom))!important;
        width:auto!important;
        max-width:138px!important;
        min-height:46px!important;
        padding:9px 13px!important;
        gap:8px!important;
        border-radius:999px!important;
        justify-content:flex-start!important;
      }
      .floating-whatsapp .wa-dot{
        width:10px!important;
        height:10px!important;
        flex:0 0 10px!important;
      }
      .floating-whatsapp strong{
        font-size:0!important;
        white-space:nowrap!important;
      }
      .floating-whatsapp strong::after{
        content:"Updates";
        font-size:11.5px;
      }
      .floating-whatsapp small{display:none!important}

      .footer{
        padding:26px 0 82px!important;
        gap:14px!important;
      }
      .footer-social{gap:5px!important}
      .footer-social a{font-size:10.5px!important}

      .modal-head{padding-right:60px!important}
      .modal-head h2{font-size:17px!important}
      .form-page h3{font-size:28px!important}
      input,select,textarea{font-size:16px!important}
    }

    @media(max-width:390px){
      .nav-inner{padding-inline:10px!important}
      .brand{max-width:calc(100% - 110px)!important}
      .brand::before{width:34px!important;height:34px!important;flex-basis:34px!important;background-size:19px 19px!important}
      .brand-copy strong{font-size:11px!important}
      .theme-toggle{width:34px!important;height:34px!important;min-height:34px!important;flex-basis:34px!important}
      .nav-apply{min-width:64px!important;min-height:38px!important;padding-inline:12px!important}
      .hero h1{font-size:clamp(39px,12.5vw,48px)!important}
      .hero-club-name{font-size:21px!important}
      .team-filters{grid-template-columns:1fr!important}
    }
  `;
  document.head.appendChild(responsiveStyle);

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