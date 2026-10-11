/*
  GITHUB PAGES LAUNCH CONFIGURATION

  Keep IS_LIVE = false while preparing the club.
  After the Google Apps Script Web App is deployed:
  1) paste its /exec URL into SUBMISSION_ENDPOINT,
  2) test one application,
  3) keep IS_LIVE false until the official launch,
  4) switch IS_LIVE to true on launch day.

  The Apps Script /exec URL is a public web endpoint, not a password or private key.
*/
window.CLUB_CONFIG = {
  IS_LIVE: true,

  // Paste the Google Apps Script Web App URL ending in /exec here.
  SUBMISSION_ENDPOINT: "https://script.google.com/macros/s/AKfycbzH7s_5RU_h40YDqd57pbPo1jMJ-FOMXtFRvHTFHhLJXQrbvoqf3N3gq1L-VmwTK2i83Q/exec",

  // Optional ISO timestamp. Leave blank if you do not want an automatic close.
  APPLICATIONS_CLOSE_AT: "",

  // Official club contact email.
  CONTACT_EMAIL: "claudebuilder.aou@gmail.com"
};

/*
  Progressive UI layers.
  They are kept independent from recruitment logic so presentation fixes can be
  rolled back without touching form fields or the original application flow.
*/
(() => {
  [
    "./polish.css?v=20261011",
    "./hotfix.css?v=20261011b",
    "./brand.css?v=20261011d"
  ].forEach(href => {
    const stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = href;
    document.head.appendChild(stylesheet);
  });

  if (!document.querySelector('link[data-cbc-favicon]')) {
    const favicon = document.createElement("link");
    favicon.rel = "icon";
    favicon.type = "image/svg+xml";
    favicon.href = "./claude-favicon.svg?v=20261011d";
    favicon.dataset.cbcFavicon = "true";
    document.head.appendChild(favicon);
  }

  const loadSubmissionHotfix = () => {
    if (document.querySelector('script[data-cbc-submission-hotfix]')) return;
    const script = document.createElement("script");
    script.src = "./submission-hotfix.js?v=20261011b";
    script.async = false;
    script.dataset.cbcSubmissionHotfix = "true";
    document.body.appendChild(script);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadSubmissionHotfix, { once: true });
  } else {
    loadSubmissionHotfix();
  }
})();
