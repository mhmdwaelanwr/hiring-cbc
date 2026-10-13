(() => {
  const ready = fn => document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', fn, { once:true })
    : fn();

  ready(() => {
    const footer = document.querySelector('.footer');
    if (!footer) return;

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
  });
})();
