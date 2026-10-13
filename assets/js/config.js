/*
  GITHUB PAGES LAUNCH CONFIGURATION

  Runtime configuration stays here. Small presentation helpers are loaded from
  their own module so the main app/recruitment logic stays untouched.
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
  const script = document.createElement("script");
  script.src = "./assets/js/ui-polish.js?v=20261013social1";
  script.defer = true;
  document.head.appendChild(script);
})();
