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
    "./brand.css?v=20261011d",
    "./community.css?v=20261012a"
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

  const loadScriptOnce = (src, marker) => {
    if (document.querySelector(`script[data-${marker}]`)) return;
    const script = document.createElement("script");
    script.src = src;
    script.async = false;
    script.dataset[marker.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = "true";
    document.body.appendChild(script);
  };

  const loadEnhancements = () => {
    loadScriptOnce("./submission-hotfix.js?v=20261012", "cbc-submission-hotfix");
    loadScriptOnce("./community.js?v=20261012a", "cbc-community");
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadEnhancements, { once: true });
  } else {
    loadEnhancements();
  }
})();
