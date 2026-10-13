(() => {
  const ready = fn => document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', fn, { once:true })
    : fn();

  ready(() => {
    const footer = document.querySelector('.footer');

    if (footer) {
      let raf = 0;
      const syncFooterState = () => {
        raf = 0;
        const rect = footer.getBoundingClientRect();
        const visible = rect.top < window.innerHeight - 12 && rect.bottom > 0;
        document.body.classList.toggle('footer-in-view', visible);
      };

      const schedule = () => {
        if (raf) return;
        raf = requestAnimationFrame(syncFooterState);
      };

      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(([entry]) => {
          document.body.classList.toggle('footer-in-view', entry.isIntersecting);
        }, {
          root:null,
          rootMargin:'0px 0px 24px 0px',
          threshold:[0,0.01,0.2]
        });
        observer.observe(footer);
      }

      addEventListener('scroll', schedule, { passive:true });
      addEventListener('resize', schedule, { passive:true });
      syncFooterState();
    }

    /*
      Desktop Chromium/Linux select stabilization.
      Some native <select> popups open on pointerdown and immediately collapse on
      the same interaction inside a fixed modal. On supported desktop Chromium,
      explicitly invoke showPicker() from the trusted pointerdown and cancel the
      browser's competing default open action. Mobile/touch and unsupported
      browsers keep their normal native picker behavior.
    */
    const form = document.querySelector('#applicationForm');
    const finePointer = matchMedia('(hover:hover) and (pointer:fine)');

    if (form) {
      form.addEventListener('pointerdown', event => {
        const select = event.target instanceof Element ? event.target.closest('select') : null;
        if (!select || !form.contains(select) || select.disabled) return;
        if (!finePointer.matches || event.pointerType !== 'mouse' || event.button !== 0) return;
        if (typeof select.showPicker !== 'function') return;

        event.preventDefault();
        event.stopPropagation();
        select.focus({ preventScroll:true });

        try {
          select.showPicker();
        } catch (_) {
          /* If the browser rejects showPicker(), let keyboard/native fallback remain available. */
        }
      }, true);
    }
  });
})();
