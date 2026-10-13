(() => {
  const ready = fn => document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', fn, { once:true })
    : fn();

  ready(() => {
    const form = document.querySelector('#applicationForm');
    if (!form) return;

    const desktop = matchMedia('(min-width: 761px) and (hover:hover) and (pointer:fine)');
    const states = new Map();
    let openState = null;
    let idSeed = 0;

    const optionSignature = select => Array.from(select.options)
      .map(o => `${o.value}\u0001${o.textContent}\u0001${o.disabled ? 1 : 0}`)
      .join('\u0002');

    const selectedText = select => {
      const option = select.options[select.selectedIndex];
      return option ? option.textContent : 'Select an option';
    };

    function close(state = openState, restoreFocus = false) {
      if (!state || !state.open) return;
      state.open = false;
      state.root.classList.remove('is-open');
      state.trigger.setAttribute('aria-expanded', 'false');
      state.menu.hidden = true;
      state.activeIndex = -1;
      if (openState === state) openState = null;
      if (restoreFocus) state.trigger.focus({ preventScroll:true });
    }

    function positionMenu(state) {
      if (!state.open || state.menu.hidden) return;
      const rect = state.trigger.getBoundingClientRect();
      const gap = 6;
      const edge = 12;
      const below = window.innerHeight - rect.bottom - edge;
      const above = rect.top - edge;
      const preferAbove = below < 190 && above > below;
      const maxHeight = Math.max(150, Math.min(330, (preferAbove ? above : below) - gap));
      const width = Math.max(rect.width, 220);
      const left = Math.min(Math.max(edge, rect.left), Math.max(edge, window.innerWidth - width - edge));

      state.menu.style.width = `${width}px`;
      state.menu.style.maxHeight = `${maxHeight}px`;
      state.menu.style.left = `${left}px`;

      if (preferAbove) {
        state.menu.style.top = 'auto';
        state.menu.style.bottom = `${Math.max(edge, window.innerHeight - rect.top + gap)}px`;
        state.menu.dataset.placement = 'top';
      } else {
        state.menu.style.bottom = 'auto';
        state.menu.style.top = `${Math.min(window.innerHeight - edge, rect.bottom + gap)}px`;
        state.menu.dataset.placement = 'bottom';
      }
    }

    function setActive(state, index, focusIntoView = true) {
      const items = Array.from(state.menu.querySelectorAll('[role="option"]'));
      if (!items.length) return;
      index = Math.max(0, Math.min(items.length - 1, index));
      while (items[index]?.getAttribute('aria-disabled') === 'true') {
        const next = index + 1 < items.length ? index + 1 : index - 1;
        if (next === index || next < 0) return;
        index = next;
      }
      state.activeIndex = index;
      items.forEach((item, i) => item.classList.toggle('is-active', i === index));
      const active = items[index];
      if (active) {
        state.trigger.setAttribute('aria-activedescendant', active.id);
        if (focusIntoView) active.scrollIntoView({ block:'nearest' });
      }
    }

    function sync(state, force = false) {
      const { select, trigger, menu } = state;
      const signature = optionSignature(select);
      const changed = force || signature !== state.signature;
      state.signature = signature;

      trigger.disabled = select.disabled;
      trigger.classList.toggle('is-disabled', select.disabled);
      trigger.querySelector('.cbc-select-value').textContent = selectedText(select);
      trigger.classList.toggle('is-placeholder', !select.value);

      if (!changed) {
        menu.querySelectorAll('[role="option"]').forEach((item, index) => {
          const option = select.options[index];
          item.setAttribute('aria-selected', String(Boolean(option?.selected)));
          item.classList.toggle('is-selected', Boolean(option?.selected));
        });
        return;
      }

      menu.textContent = '';
      Array.from(select.options).forEach((option, index) => {
        const item = document.createElement('div');
        item.id = `${state.id}-option-${index}`;
        item.className = 'cbc-select-option';
        item.setAttribute('role', 'option');
        item.setAttribute('aria-selected', String(option.selected));
        item.setAttribute('aria-disabled', String(option.disabled));
        item.dataset.index = String(index);
        item.dataset.value = option.value;
        item.textContent = option.textContent;
        item.classList.toggle('is-selected', option.selected);
        item.classList.toggle('is-placeholder', option.value === '');
        item.classList.toggle('is-disabled', option.disabled);
        menu.appendChild(item);
      });
    }

    function choose(state, index) {
      const option = state.select.options[index];
      if (!option || option.disabled) return;
      const previous = state.select.value;
      state.select.selectedIndex = index;
      sync(state);
      close(state, true);
      if (state.select.value !== previous) {
        state.select.dispatchEvent(new Event('input', { bubbles:true }));
        state.select.dispatchEvent(new Event('change', { bubbles:true }));
      }
    }

    function open(state) {
      if (!desktop.matches || state.select.disabled) return;
      if (openState && openState !== state) close(openState);
      sync(state);
      state.open = true;
      openState = state;
      state.root.classList.add('is-open');
      state.trigger.setAttribute('aria-expanded', 'true');
      state.menu.hidden = false;
      positionMenu(state);
      const selected = Math.max(0, state.select.selectedIndex);
      setActive(state, selected, false);
      requestAnimationFrame(() => {
        positionMenu(state);
        const active = state.menu.querySelector('.is-active');
        active?.scrollIntoView({ block:'nearest' });
      });
    }

    function enhance(select) {
      if (states.has(select)) return states.get(select);

      const id = `cbc-select-${++idSeed}`;
      const root = document.createElement('span');
      root.className = 'cbc-select';
      root.dataset.enhancedSelect = '';

      const trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.className = 'cbc-select-trigger';
      trigger.id = `${id}-trigger`;
      trigger.setAttribute('aria-haspopup', 'listbox');
      trigger.setAttribute('aria-expanded', 'false');
      trigger.setAttribute('aria-controls', `${id}-menu`);
      trigger.innerHTML = '<span class="cbc-select-value"></span><span class="cbc-select-chevron" aria-hidden="true"></span>';

      const menu = document.createElement('div');
      menu.className = 'cbc-select-menu';
      menu.id = `${id}-menu`;
      menu.setAttribute('role', 'listbox');
      menu.setAttribute('aria-labelledby', trigger.id);
      menu.hidden = true;
      document.body.appendChild(menu);

      select.parentNode.insertBefore(root, select);
      root.appendChild(select);
      root.appendChild(trigger);
      select.classList.add('cbc-select-native');

      const state = {
        id, select, root, trigger, menu,
        signature:'', activeIndex:-1, open:false, observer:null
      };
      states.set(select, state);

      sync(state, true);

      trigger.addEventListener('click', event => {
        event.preventDefault();
        state.open ? close(state, true) : open(state);
      });

      trigger.addEventListener('keydown', event => {
        const items = () => Array.from(menu.querySelectorAll('[role="option"]'));
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault();
          if (!state.open) open(state);
          const list = items();
          if (!list.length) return;
          const delta = event.key === 'ArrowDown' ? 1 : -1;
          let next = state.activeIndex < 0 ? Math.max(0, select.selectedIndex) : state.activeIndex + delta;
          next = Math.max(0, Math.min(list.length - 1, next));
          setActive(state, next);
          return;
        }
        if (event.key === 'Home' && state.open) {
          event.preventDefault();
          setActive(state, 0);
          return;
        }
        if (event.key === 'End' && state.open) {
          event.preventDefault();
          setActive(state, items().length - 1);
          return;
        }
        if ((event.key === 'Enter' || event.key === ' ') && state.open) {
          event.preventDefault();
          if (state.activeIndex >= 0) choose(state, state.activeIndex);
          return;
        }
        if (event.key === 'Escape' && state.open) {
          event.preventDefault();
          close(state, true);
          return;
        }
        if (event.key === 'Tab' && state.open) close(state);
      });

      menu.addEventListener('pointerdown', event => {
        const item = event.target.closest('[role="option"]');
        if (!item || item.getAttribute('aria-disabled') === 'true') return;
        event.preventDefault();
        choose(state, Number(item.dataset.index));
      });

      menu.addEventListener('pointermove', event => {
        const item = event.target.closest('[role="option"]');
        if (!item || item.getAttribute('aria-disabled') === 'true') return;
        setActive(state, Number(item.dataset.index), false);
      });

      select.addEventListener('change', () => sync(state));
      select.addEventListener('input', () => sync(state));
      select.addEventListener('focus', () => {
        if (desktop.matches) requestAnimationFrame(() => trigger.focus({ preventScroll:true }));
      });
      select.addEventListener('invalid', () => {
        trigger.classList.add('is-invalid');
        requestAnimationFrame(() => trigger.focus({ preventScroll:true }));
      });
      trigger.addEventListener('focus', () => trigger.classList.remove('is-invalid'));

      state.observer = new MutationObserver(() => {
        sync(state, true);
        if (state.open) positionMenu(state);
      });
      state.observer.observe(select, {
        childList:true,
        subtree:true,
        attributes:true,
        attributeFilter:['disabled','label','value','selected']
      });

      return state;
    }

    function syncMode() {
      form.querySelectorAll('select').forEach(select => {
        const state = enhance(select);
        state.root.classList.toggle('is-custom-active', desktop.matches);
        if (!desktop.matches) close(state);
        sync(state, true);
      });
      document.documentElement.classList.toggle('cbc-custom-selects', desktop.matches);
    }

    document.addEventListener('pointerdown', event => {
      if (!openState) return;
      if (openState.root.contains(event.target) || openState.menu.contains(event.target)) return;
      close(openState);
    }, true);

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && openState) close(openState, true);
    });

    addEventListener('resize', () => {
      if (openState) positionMenu(openState);
    }, { passive:true });

    addEventListener('scroll', () => {
      if (openState) positionMenu(openState);
    }, { passive:true, capture:true });

    desktop.addEventListener?.('change', syncMode);
    syncMode();

    // App code can populate/restore selects immediately after page load. Re-sync
    // after those initial mutations/value assignments without polling forever.
    requestAnimationFrame(() => states.forEach(state => sync(state, true)));
    setTimeout(() => states.forEach(state => sync(state, true)), 120);
    setTimeout(() => states.forEach(state => sync(state, true)), 600);
  });
})();
