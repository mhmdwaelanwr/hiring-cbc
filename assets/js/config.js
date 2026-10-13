/*
  GITHUB PAGES LAUNCH CONFIGURATION

  Runtime configuration stays here. Small presentation/data-quality helpers are
  loaded as isolated modules so the main recruitment transport stays untouched.
*/
window.CLUB_CONFIG = {
  IS_LIVE: true,

  // Public Google Apps Script Web App endpoint used by the application form.
  SUBMISSION_ENDPOINT: "https://script.google.com/macros/s/AKfycbzH7s_5RU_h40YDqd57pbPo1jMJ-FOMXtFRvHTFHhLJXQrbvoqf3N3gq1L-VmwTK2i83Q/exec",

  // Optional ISO timestamp. Leave blank if applications should stay open manually.
  APPLICATIONS_CLOSE_AT: "",

  // Official club contact email.
  CONTACT_EMAIL: "claudebuilder.aou@gmail.com"
};

(() => {
  [
    ["./assets/js/ui-polish.js?v=20261013selectstable2", "cbc-ui-polish"],
    ["./assets/js/form-quality.js?v=20261013quality1", "cbc-form-quality"],
    ["./assets/js/select-enhancer.js?v=20261013selectstable2", "cbc-select-enhancer"]
  ].forEach(([src, marker]) => {
    if (document.querySelector(`script[data-module="${marker}"]`)) return;
    const script = document.createElement("script");
    script.src = src;
    script.defer = true;
    script.dataset.module = marker;
    document.head.appendChild(script);
  });
})();
