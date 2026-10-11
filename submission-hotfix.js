/*
  Reliable GitHub Pages submission transport.

  The Apps Script backend already supports an iframe + postMessage response when
  `_transport: "iframe"` and `_nonce` are present. The original frontend only
  watched the iframe load event, which cannot distinguish success from a backend
  validation/error response. This patch only takes over the final Submit click on
  the official GitHub Pages origin; every earlier form step stays owned by app.js.
*/
(() => {
  const OFFICIAL_ORIGIN = "https://mhmdwaelanwr.github.io";
  const DRAFT_KEY = "cbc-aou-hiring-draft-v1";
  const CFG = window.CLUB_CONFIG || {};

  const form = document.querySelector("#applicationForm");
  const nextBtn = document.querySelector("#nextBtn");
  const success = document.querySelector("#success");
  const modalCard = document.querySelector(".modal-card");
  const downloadCopy = document.querySelector("#downloadCopy");
  const closeSuccess = document.querySelector("#closeSuccess");

  if (!form || !nextBtn || !success) return;

  let latestVerifiedSubmission = null;

  function isOfficialGitHubPages() {
    return window.location.origin === OFFICIAL_ORIGIN;
  }

  function recruitmentOpen() {
    if (!CFG.IS_LIVE || !CFG.SUBMISSION_ENDPOINT) return false;
    if (CFG.APPLICATIONS_CLOSE_AT) {
      const close = new Date(CFG.APPLICATIONS_CLOSE_AT);
      if (!Number.isNaN(close.valueOf()) && Date.now() > close.valueOf()) return false;
    }
    return true;
  }

  function isFinalStep() {
    return form.querySelector('.form-page.active')?.dataset.page === "5";
  }

  function validateFinalStep() {
    const page = form.querySelector('.form-page.active[data-page="5"]');
    if (!page) return false;

    for (const el of page.querySelectorAll("[required]")) {
      if (!el.checkValidity()) {
        el.reportValidity();
        el.focus();
        return false;
      }
    }
    return true;
  }

  function formObject() {
    const fd = new FormData(form);
    const data = {};

    for (const [key, value] of fd.entries()) {
      data[key] = value === "on" ? true : String(value).trim();
    }

    const faculty = data.faculty || "";
    const major = data.major || "";
    const firstRole = data.preferred_role || "";
    const secondRole = data.second_preferred_role || "";

    data.major = faculty && major ? `${faculty} — ${major}` : major;
    data.preferred_role = secondRole
      ? `1st: ${firstRole} | 2nd: ${secondRole}`
      : firstRole;

    data.faculty = faculty;
    data.programme_major = major;
    data.preferred_role_first = firstRole;
    data.preferred_role_second = secondRole;
    data.client_submitted_at = new Date().toISOString();
    data.user_agent = navigator.userAgent;
    data.form_version = "CBC-AOU-Founding-Team-v4";

    return data;
  }

  function makeNonce() {
    if (window.crypto?.randomUUID) return window.crypto.randomUUID();
    return `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
  }

  function makeSubmissionReference() {
    return (
      "CBC-" +
      new Date().toISOString().slice(0, 10).replaceAll("-", "") +
      "-" +
      Math.random().toString(36).slice(2, 8).toUpperCase()
    );
  }

  function setBusy(busy) {
    nextBtn.disabled = busy;
    nextBtn.classList.toggle("is-loading", busy);
    nextBtn.textContent = busy ? "Submitting" : "Submit application →";
  }

  function showVerifiedSuccess(result, payload, fallbackReference) {
    try { localStorage.removeItem(DRAFT_KEY); } catch (_) {}

    latestVerifiedSubmission = { ...payload };
    form.style.display = "none";
    success.classList.add("show");

    const reference = result.application_id || fallbackReference;
    const firstRole = payload.preferred_role_first || "";
    const firstTeam = payload.team_first || "";

    const referenceEl = document.querySelector("#submissionReference");
    const teamEl = document.querySelector("#successTeam");
    const messageEl = document.querySelector("#successMessage");

    if (referenceEl) referenceEl.textContent = reference;
    if (teamEl) teamEl.textContent = firstRole ? `${firstTeam} · ${firstRole}` : firstTeam;
    if (messageEl) {
      messageEl.textContent = result.updated
        ? "Your existing application was updated successfully."
        : "Your application to the Claude Builder Club — AOU Egypt founding team has been received successfully.";
    }

    if (modalCard) modalCard.scrollTop = 0;
  }

  async function submitVerified() {
    if (!recruitmentOpen()) {
      alert("Applications are not open.");
      return;
    }

    setBusy(true);

    const cleanPayload = formObject();
    const fallbackReference = makeSubmissionReference();
    const nonce = makeNonce();
    const transportPayload = {
      ...cleanPayload,
      submission_reference: fallbackReference,
      _transport: "iframe",
      _nonce: nonce
    };

    let iframe = null;
    let transportForm = null;
    let timer = null;
    let settled = false;

    const cleanup = () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener("message", onMessage);
      if (transportForm) transportForm.remove();
      if (iframe) iframe.remove();
    };

    const finishWithError = message => {
      if (settled) return;
      settled = true;
      cleanup();
      setBusy(false);
      alert(message || "We could not submit your application. Your draft is still saved on this device.");
    };

    const onMessage = event => {
      const data = event.data;
      if (
        settled ||
        !iframe ||
        event.source !== iframe.contentWindow ||
        !data ||
        data.type !== "CBC_APPLICATION_RESULT" ||
        String(data.nonce || "") !== nonce
      ) {
        return;
      }

      settled = true;
      cleanup();
      setBusy(false);

      if (data.ok) {
        showVerifiedSuccess(data, cleanPayload, fallbackReference);
      } else {
        alert(data.message || "The application service rejected the submission. Your draft is still saved.");
      }
    };

    try {
      iframe = document.createElement("iframe");
      iframe.name = "cbc-submit-verified-" + Date.now();
      iframe.hidden = true;
      iframe.setAttribute("aria-hidden", "true");
      document.body.appendChild(iframe);

      window.addEventListener("message", onMessage);

      transportForm = document.createElement("form");
      transportForm.method = "POST";
      transportForm.action = CFG.SUBMISSION_ENDPOINT;
      transportForm.target = iframe.name;
      transportForm.hidden = true;

      const input = document.createElement("input");
      input.type = "hidden";
      input.name = "application_payload";
      input.value = JSON.stringify(transportPayload);
      transportForm.appendChild(input);
      document.body.appendChild(transportForm);

      timer = setTimeout(() => {
        finishWithError("The server did not confirm the submission in time. Your draft is saved, so you can try again without retyping.");
      }, 20000);

      transportForm.submit();
    } catch (error) {
      console.error("Verified submission failed:", error);
      finishWithError("We could not send your application. Your draft is saved on this device—please check your connection and try again.");
    }
  }

  /*
    Capture only the final Submit click on the official GitHub Pages origin.
    On localhost/Vercel/other mirrors, app.js remains untouched and keeps its
    existing transport behavior.
  */
  nextBtn.addEventListener("click", event => {
    if (!isOfficialGitHubPages() || !isFinalStep()) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    if (!validateFinalStep()) return;
    submitVerified();
  }, true);

  if (downloadCopy) {
    downloadCopy.addEventListener("click", event => {
      if (!latestVerifiedSubmission) return;

      event.preventDefault();
      event.stopImmediatePropagation();

      const safeName = (latestVerifiedSubmission.full_name || "application")
        .replace(/[^a-z0-9_-]+/gi, "_");
      const blob = new Blob(
        [JSON.stringify(latestVerifiedSubmission, null, 2)],
        { type: "application/json" }
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${safeName}_application.json`;
      a.click();
      URL.revokeObjectURL(url);
    }, true);
  }

  if (closeSuccess) {
    closeSuccess.addEventListener("click", () => {
      latestVerifiedSubmission = null;
    });
  }
})();
