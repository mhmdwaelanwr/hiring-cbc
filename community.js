(() => {
  const FACEBOOK_URL = "https://www.facebook.com/claudeaouclub";
  const WHATSAPP_URL = "https://chat.whatsapp.com/GwiXzxyBXTBDsBqeenPYP8";
  const CONTACT_EMAIL = window.CLUB_CONFIG?.CONTACT_EMAIL || "claudebuilder.aou@gmail.com";

  const facebookIcon = `
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M13.6 22v-9h3l.45-3.5H13.6V7.27c0-1.01.28-1.7 1.74-1.7H17.2V2.44A24.8 24.8 0 0 0 14.5 2c-2.67 0-4.5 1.63-4.5 4.62V9.5H7V13h3v9h3.6Z"/>
    </svg>`;
  const whatsappIcon = `
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M20.52 3.48A11.82 11.82 0 0 0 12.06 0C5.47 0 .11 5.36.11 11.95c0 2.1.55 4.16 1.6 5.96L0 24l6.24-1.64a11.93 11.93 0 0 0 5.81 1.48h.01c6.59 0 11.95-5.36 11.95-11.95 0-3.19-1.24-6.19-3.49-8.41Zm-8.46 18.34h-.01a9.92 9.92 0 0 1-5.06-1.38l-.36-.21-3.7.97.99-3.61-.23-.37a9.9 9.9 0 0 1-1.52-5.27C2.17 6.47 6.58 2.05 12.06 2.05c2.64 0 5.13 1.03 7 2.9a9.83 9.83 0 0 1 2.9 7c0 5.47-4.43 9.87-9.9 9.87Zm5.42-7.4c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.46a8.93 8.93 0 0 1-1.65-2.05c-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.27.49 1.7.63.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.41.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35Z"/>
    </svg>`;
  const mailIcon = `
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>
    </svg>`;

  const externalLink = (href, className, label, icon = "") => {
    const a = document.createElement("a");
    a.href = href;
    a.className = className;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.innerHTML = `${icon}<span>${label}</span>`;
    return a;
  };

  function enhanceNav() {
    const nav = document.querySelector(".nav-links");
    if (!nav || nav.querySelector(".nav-facebook")) return;

    const facebook = externalLink(
      FACEBOOK_URL,
      "nav-facebook",
      "Facebook",
      facebookIcon
    );
    facebook.setAttribute("aria-label", "Open Claude Builder Club — AOU Egypt on Facebook");

    const whatsapp = nav.querySelector(".nav-whatsapp");
    nav.insertBefore(facebook, whatsapp || nav.firstChild);
  }

  function enhanceHero() {
    const actions = document.querySelector(".hero-actions");
    if (!actions || document.querySelector(".community-proof")) return;

    const proof = document.createElement("div");
    proof.className = "community-proof";
    proof.innerHTML = `
      <span><i class="proof-dot" aria-hidden="true"></i> Student-led at AOU Egypt</span>
      <a class="proof-facebook" href="${FACEBOOK_URL}" target="_blank" rel="noopener noreferrer">${facebookIcon}<span>Follow our Facebook page</span></a>
    `;
    actions.insertAdjacentElement("afterend", proof);
  }

  function addCommunitySection() {
    if (document.querySelector(".community-section")) return;

    const main = document.querySelector("main");
    if (!main) return;

    const section = document.createElement("section");
    section.className = "community-section";
    section.setAttribute("aria-labelledby", "communityTitle");
    section.innerHTML = `
      <div class="wrap">
        <div class="community-card">
          <div class="community-copy">
            <div class="community-kicker">Stay connected</div>
            <h2 id="communityTitle">Build with the community, not alone.</h2>
            <p>Follow Claude Builder Club — AOU Egypt for recruitment updates, workshops, build sessions, announcements and upcoming opportunities.</p>
          </div>
          <div class="community-actions" aria-label="Community channels">
            <a class="community-link facebook" href="${FACEBOOK_URL}" target="_blank" rel="noopener noreferrer">${facebookIcon}<span>Facebook</span></a>
            <a class="community-link whatsapp" href="${WHATSAPP_URL}" target="_blank" rel="noopener noreferrer">${whatsappIcon}<span>WhatsApp updates</span></a>
            <a class="community-link email" href="mailto:${CONTACT_EMAIL}">${mailIcon}<span>Email us</span></a>
          </div>
        </div>
      </div>
    `;

    main.appendChild(section);
  }

  function enhanceFooter() {
    const footer = document.querySelector(".footer");
    if (!footer || footer.querySelector(".footer-social")) return;

    const social = document.createElement("div");
    social.className = "footer-social";
    social.append(
      externalLink(FACEBOOK_URL, "", "Facebook", facebookIcon),
      externalLink(WHATSAPP_URL, "", "WhatsApp", whatsappIcon)
    );

    const email = document.createElement("a");
    email.href = `mailto:${CONTACT_EMAIL}`;
    email.innerHTML = `${mailIcon}<span>${CONTACT_EMAIL}</span>`;
    social.appendChild(email);
    footer.appendChild(social);
  }

  function enhanceSuccess() {
    const follow = document.querySelector(".whatsapp-follow");
    if (!follow || document.querySelector(".social-after-submit")) return;

    const card = document.createElement("div");
    card.className = "social-after-submit";
    card.innerHTML = `
      <div>
        <strong>Follow the club on Facebook</strong>
        <span>See announcements, events and community updates from Claude Builder Club — AOU Egypt.</span>
      </div>
      <a href="${FACEBOOK_URL}" target="_blank" rel="noopener noreferrer">${facebookIcon}<span>Follow page</span></a>
    `;
    follow.insertAdjacentElement("afterend", card);
  }

  function applyEnhancements() {
    enhanceNav();
    enhanceHero();
    addCommunitySection();
    enhanceFooter();
    enhanceSuccess();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyEnhancements, { once: true });
  } else {
    applyEnhancements();
  }
})();
