/*
  Reliable GitHub Pages submission transport.

  The current Apps Script code can return a nonce-based postMessage result, while
  an older deployed Apps Script version may only finish the iframe navigation.
  This transport supports both versions without submitting the application twice:
  - use postMessage when available for a verified server result;
  - otherwise, accept the completed iframe response as the legacy transport result;
  - only show a timeout when no server response loads at all.
*/
(() => {
  const OFFICIAL_ORIGIN = "https://mhmdwaelanwr.github.io";
  const DRAFT_KEY = "cbc-aou-hiring-draft-v1";
  const CFG = window.CLUB_CONFIG || {};
  const HTML2PDF_SRC = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";

  const form = document.querySelector("#applicationForm");
  const nextBtn = document.querySelector("#nextBtn");
  const success = document.querySelector("#success");
  const modalCard = document.querySelector(".modal-card");
  const downloadCopy = document.querySelector("#downloadCopy");
  const closeSuccess = document.querySelector("#closeSuccess");

  if (!form || !nextBtn || !success) return;

  let latestVerifiedSubmission = null;
  let html2PdfLoader = null;

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

  function ensureHtml2Pdf() {
    if (window.html2pdf) return Promise.resolve(window.html2pdf);
    if (html2PdfLoader) return html2PdfLoader;

    html2PdfLoader = new Promise((resolve, reject) => {
      const existing = document.querySelector('script[data-cbc-html2pdf="true"]');
      if (existing) {
        const timeout = setTimeout(() => reject(new Error("PDF library load timed out")), 12000);
        existing.addEventListener("load", () => {
          clearTimeout(timeout);
          window.html2pdf ? resolve(window.html2pdf) : reject(new Error("PDF library unavailable"));
        }, { once: true });
        existing.addEventListener("error", () => {
          clearTimeout(timeout);
          reject(new Error("PDF library failed to load"));
        }, { once: true });
        return;
      }

      const script = document.createElement("script");
      script.src = HTML2PDF_SRC;
      script.async = true;
      script.dataset.cbcHtml2pdf = "true";
      script.referrerPolicy = "no-referrer";

      const timeout = setTimeout(() => {
        script.remove();
        html2PdfLoader = null;
        reject(new Error("PDF library load timed out"));
      }, 12000);

      script.onload = () => {
        clearTimeout(timeout);
        if (window.html2pdf) resolve(window.html2pdf);
        else {
          html2PdfLoader = null;
          reject(new Error("PDF library unavailable"));
        }
      };
      script.onerror = () => {
        clearTimeout(timeout);
        script.remove();
        html2PdfLoader = null;
        reject(new Error("PDF library failed to load"));
      };
      document.head.appendChild(script);
    });

    return html2PdfLoader;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function humanizeKey(key) {
    return String(key || "")
      .replaceAll("_", " ")
      .replace(/\b\w/g, char => char.toUpperCase());
  }

  function formatDate(value) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.valueOf())) return String(value);
    return new Intl.DateTimeFormat("en-GB", {
      dateStyle: "medium",
      timeStyle: "short"
    }).format(date);
  }

  function printableValue(value) {
    if (value === true) return "Confirmed";
    if (value === false) return "No";
    const text = String(value ?? "").trim();
    return text || "—";
  }

  function fieldMarkup(label, value, options = {}) {
    const text = printableValue(value);
    if (!text || text === "—") return "";

    const long = options.long || text.length > 105 || text.includes("\n");
    const isLink = options.link && /^https?:\/\//i.test(text);
    const safeLabel = escapeHtml(label);
    const safeText = escapeHtml(text).replaceAll("\n", "<br>");
    const rendered = isLink
      ? `<a href="${escapeHtml(text)}" target="_blank" rel="noopener noreferrer">${safeText}</a>`
      : safeText;

    return `
      <div class="pdf-field${long ? " pdf-field-wide pdf-field-long" : ""}">
        <div class="pdf-label">${safeLabel}</div>
        <div class="pdf-value" dir="auto">${rendered}</div>
      </div>`;
  }

  function sectionMarkup(title, eyebrow, content) {
    const body = String(content || "").trim();
    if (!body) return "";
    return `
      <section class="pdf-section">
        <div class="pdf-section-head">
          <div>
            <div class="pdf-eyebrow">${escapeHtml(eyebrow)}</div>
            <h2>${escapeHtml(title)}</h2>
          </div>
        </div>
        <div class="pdf-grid">${body}</div>
      </section>`;
  }

  function buildApplicationPdfNode(data) {
    const reference = data.submission_reference ||
      document.querySelector("#submissionReference")?.textContent?.trim() ||
      "Pending reference";
    const submittedAt = formatDate(data.client_submitted_at);
    const firstPreference = [data.team_first, data.preferred_role_first].filter(Boolean).join(" · ") || "—";
    const applicantName = printableValue(data.full_name || "Applicant");

    const profile = [
      fieldMarkup("Full name", data.full_name),
      fieldMarkup("AOU Student ID", data.student_id),
      fieldMarkup("Personal email", data.email),
      fieldMarkup("AOU university email", data.university_email),
      fieldMarkup("Phone / WhatsApp", data.phone),
      fieldMarkup("Faculty", data.faculty),
      fieldMarkup("Programme / Major", data.programme_major),
      fieldMarkup("Academic year", data.academic_year)
    ].join("");

    const preferences = [
      fieldMarkup("First preference team", data.team_first),
      fieldMarkup("First preference role", data.preferred_role_first),
      fieldMarkup("Second preference team", data.team_second),
      fieldMarkup("Second preference role", data.preferred_role_second),
      fieldMarkup("Weekly availability", data.availability),
      fieldMarkup("In-person activities", data.in_person)
    ].join("");

    const evidence = [
      fieldMarkup("LinkedIn", data.linkedin, { link: true }),
      fieldMarkup("GitHub / Portfolio", data.portfolio, { link: true }),
      fieldMarkup("Design / Media portfolio", data.design_portfolio, { link: true }),
      fieldMarkup("Other relevant link", data.other_link, { link: true }),
      fieldMarkup("Something shipped or organized", data.evidence, { long: true })
    ].join("");

    const motivation = [
      fieldMarkup("Why I want to join the founding team", data.motivation, { long: true }),
      fieldMarkup("Scenario response", data.scenario, { long: true }),
      fieldMarkup("What I would improve at AOU", data.campus_impact, { long: true }),
      fieldMarkup("Anything else", data.notes, { long: true })
    ].join("");

    const confirmations = [
      fieldMarkup("Active role commitment", data.commitment),
      fieldMarkup("Information accuracy", data.accuracy),
      fieldMarkup("Recruitment data review", data.privacy)
    ].join("");

    const reserved = new Set([
      "full_name", "student_id", "email", "university_email", "phone", "faculty", "major",
      "programme_major", "academic_year", "team_first", "preferred_role", "preferred_role_first",
      "team_second", "second_preferred_role", "preferred_role_second", "availability", "in_person",
      "linkedin", "portfolio", "design_portfolio", "other_link", "evidence", "motivation", "scenario",
      "campus_impact", "notes", "commitment", "accuracy", "privacy", "website", "client_submitted_at",
      "user_agent", "form_version", "submission_reference", "_transport", "_nonce"
    ]);

    const roleSpecific = Object.entries(data)
      .filter(([key, value]) => !reserved.has(key) && value !== "" && value !== null && value !== undefined && value !== false)
      .map(([key, value]) => fieldMarkup(humanizeKey(key), value, { long: String(value).length > 80 }))
      .join("");

    const root = document.createElement("div");
    root.className = "cbc-application-pdf";
    root.style.position = "absolute";
    root.style.left = "-100000px";
    root.style.top = "0";
    root.style.width = "190mm";
    root.style.background = "#faf9f5";
    root.style.color = "#141413";
    root.style.zIndex = "-1";

    root.innerHTML = `
      <style>
        .cbc-application-pdf,
        .cbc-application-pdf *{box-sizing:border-box}
        .cbc-application-pdf{
          width:190mm;
          font-family:"Fraunces",Georgia,"Times New Roman",serif;
          font-size:11.5px;
          line-height:1.52;
          -webkit-font-smoothing:antialiased;
          text-rendering:geometricPrecision;
        }
        .cbc-application-pdf a{color:#315f8c;text-decoration:none;overflow-wrap:anywhere}
        .pdf-topline{height:4px;border-radius:999px;background:#d97757;margin:0 0 18px}
        .pdf-header{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;padding:0 0 18px;border-bottom:1px solid #d9d6ce}
        .pdf-brand{display:flex;align-items:center;gap:11px;min-width:0}
        .pdf-mark{width:39px;height:39px;object-fit:contain;flex:0 0 39px}
        .pdf-brand-name{font-size:18px;font-weight:650;letter-spacing:-.035em;line-height:1.08}
        .pdf-brand-sub{margin-top:4px;color:#716e67;font-size:9px;font-weight:600;letter-spacing:.08em;text-transform:uppercase}
        .pdf-badge{padding:7px 10px;border:1px solid #d97757;border-radius:999px;color:#a85137;background:#f7e7e1;font-size:8.5px;font-weight:700;letter-spacing:.09em;white-space:nowrap}
        .pdf-hero{padding:22px 0 18px}
        .pdf-kicker{color:#d97757;font-size:9px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;margin-bottom:6px}
        .pdf-hero h1{margin:0;font-size:28px;line-height:1.05;font-weight:650;letter-spacing:-.045em;color:#141413}
        .pdf-hero p{margin:7px 0 0;color:#716e67;font-size:11px}
        .pdf-summary{display:grid;grid-template-columns:1fr 1fr 1.25fr;gap:8px;margin:0 0 20px}
        .pdf-summary-card{padding:10px 11px;border:1px solid #ddd9d0;border-radius:10px;background:#fff;min-width:0}
        .pdf-summary-label{font-size:7.8px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#8b877e;margin-bottom:4px}
        .pdf-summary-value{font-size:10.5px;font-weight:600;line-height:1.35;overflow-wrap:anywhere}
        .pdf-section{margin:0 0 18px}
        .pdf-section-head{display:flex;align-items:end;justify-content:space-between;gap:10px;margin:0 0 8px;padding-bottom:7px;border-bottom:1px solid #ddd9d0;break-after:avoid;page-break-after:avoid}
        .pdf-eyebrow{color:#d97757;font-size:7.8px;font-weight:700;letter-spacing:.11em;text-transform:uppercase;margin-bottom:2px}
        .pdf-section h2{margin:0;font-size:16px;line-height:1.15;font-weight:650;letter-spacing:-.025em}
        .pdf-grid{display:grid;grid-template-columns:1fr 1fr;gap:7px}
        .pdf-field{padding:9px 10px 10px;border:1px solid #e0ddd5;border-radius:9px;background:#fff;min-width:0;break-inside:avoid;page-break-inside:avoid}
        .pdf-field-wide{grid-column:1/-1}
        .pdf-field-long{break-inside:auto;page-break-inside:auto}
        .pdf-label{margin-bottom:4px;color:#8a867e;font-size:7.8px;font-weight:700;letter-spacing:.07em;text-transform:uppercase}
        .pdf-value{color:#24231f;font-size:10.7px;line-height:1.48;font-weight:450;overflow-wrap:anywhere;white-space:normal}
        .pdf-note{margin-top:4px;padding:12px 13px;border:1px solid #ead0c6;border-radius:10px;background:#fbf0ec;color:#6f4a3e;font-size:9.5px;line-height:1.45;break-inside:avoid;page-break-inside:avoid}
        .pdf-note strong{color:#9a4f37}
      </style>
      <div class="pdf-topline"></div>
      <header class="pdf-header">
        <div class="pdf-brand">
          <img class="pdf-mark" src="./assets/brand/logos/claude-spark.svg" alt="" />
          <div>
            <div class="pdf-brand-name">Claude Builder Club</div>
            <div class="pdf-brand-sub">AOU Egypt · Founding Team Recruitment</div>
          </div>
        </div>
        <div class="pdf-badge">APPLICATION COPY</div>
      </header>

      <div class="pdf-hero">
        <div class="pdf-kicker">Submitted application</div>
        <h1 dir="auto">${escapeHtml(applicantName)}</h1>
        <p>This PDF is a personal copy of the information submitted to Claude Builder Club - AOU Egypt.</p>
      </div>

      <div class="pdf-summary">
        <div class="pdf-summary-card">
          <div class="pdf-summary-label">Submission reference</div>
          <div class="pdf-summary-value">${escapeHtml(reference)}</div>
        </div>
        <div class="pdf-summary-card">
          <div class="pdf-summary-label">Submitted</div>
          <div class="pdf-summary-value">${escapeHtml(submittedAt)}</div>
        </div>
        <div class="pdf-summary-card">
          <div class="pdf-summary-label">First preference</div>
          <div class="pdf-summary-value">${escapeHtml(firstPreference)}</div>
        </div>
      </div>

      ${sectionMarkup("Applicant profile", "01 · Profile", profile)}
      ${sectionMarkup("Preferences & availability", "02 · Role fit", preferences)}
      ${sectionMarkup("Role-specific responses", "03 · Team questions", roleSpecific)}
      ${sectionMarkup("Experience & portfolio", "04 · Evidence", evidence)}
      ${sectionMarkup("Motivation & ownership", "05 · Thinking", motivation)}
      ${sectionMarkup("Confirmations", "06 · Final check", confirmations)}

      <div class="pdf-note">
        <strong>For your records.</strong> This document is generated from your submitted application and is not an acceptance letter, membership certificate, or selection decision.
      </div>`;

    document.body.appendChild(root);
    return { root, reference, applicantName };
  }

  async function waitForPdfAssets(root) {
    try { await document.fonts?.ready; } catch (_) {}
    const images = Array.from(root.querySelectorAll("img"));
    await Promise.all(images.map(image => {
      if (image.complete) return Promise.resolve();
      return new Promise(resolve => {
        const done = () => resolve();
        image.addEventListener("load", done, { once: true });
        image.addEventListener("error", done, { once: true });
        setTimeout(done, 2500);
      });
    }));
  }

  async function downloadApplicationPdf(data) {
    if (!data) return;

    const originalLabel = downloadCopy?.textContent || "Download application copy";
    if (downloadCopy) {
      downloadCopy.disabled = true;
      downloadCopy.textContent = "Preparing PDF…";
    }

    let node = null;
    try {
      await ensureHtml2Pdf();
      const built = buildApplicationPdfNode(data);
      node = built.root;
      await waitForPdfAssets(node);

      const safeName = String(built.applicantName || "Applicant")
        .normalize?.("NFKD")
        .replace(/[^a-z0-9_-]+/gi, "_")
        .replace(/^_+|_+$/g, "") || "Applicant";
      const safeReference = String(built.reference || "CBC-Application")
        .replace(/[^a-z0-9_-]+/gi, "_");

      const options = {
        margin: [10, 10, 15, 10],
        filename: `${safeName}_${safeReference}_Application.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          backgroundColor: "#faf9f5",
          logging: false,
          scrollX: 0,
          scrollY: 0,
          windowWidth: 1200
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait", compress: true },
        pagebreak: { mode: ["css", "legacy"] },
        enableLinks: true
      };

      const worker = window.html2pdf().set(options).from(node).toPdf();
      await worker.get("pdf").then(pdf => {
        const totalPages = pdf.internal.getNumberOfPages();
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        try {
          pdf.setProperties({
            title: `${built.applicantName} - CBC AOU Founding Team Application`,
            subject: "Claude Builder Club - AOU Egypt founding team application copy",
            author: "Claude Builder Club - AOU Egypt",
            creator: "Claude Builder Club - AOU Egypt recruitment portal"
          });
        } catch (_) {}

        for (let page = 1; page <= totalPages; page += 1) {
          pdf.setPage(page);
          pdf.setDrawColor(224, 221, 213);
          pdf.setLineWidth(0.2);
          pdf.line(10, pageHeight - 9, pageWidth - 10, pageHeight - 9);
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(7.5);
          pdf.setTextColor(122, 119, 111);
          pdf.text("Claude Builder Club - AOU Egypt", 10, pageHeight - 5.2);
          pdf.text(`Page ${page} of ${totalPages}`, pageWidth - 10, pageHeight - 5.2, { align: "right" });
        }
      });
      await worker.save();
    } catch (error) {
      console.error("Application PDF generation failed:", error);
      alert("We could not generate the PDF right now. Please check your connection and try again.");
    } finally {
      node?.remove();
      if (downloadCopy) {
        downloadCopy.disabled = false;
        downloadCopy.textContent = originalLabel;
      }
    }
  }

  function showSuccessResult(result, payload, fallbackReference, legacyFallback = false) {
    try { localStorage.removeItem(DRAFT_KEY); } catch (_) {}

    form.style.display = "none";
    success.classList.add("show");

    const reference = result.application_id || fallbackReference;
    latestVerifiedSubmission = { ...payload, submission_reference: reference };
    const firstRole = payload.preferred_role_first || "";
    const firstTeam = payload.team_first || "";

    const referenceEl = document.querySelector("#submissionReference");
    const teamEl = document.querySelector("#successTeam");
    const messageEl = document.querySelector("#successMessage");
    const noteEl = document.querySelector(".success-note");

    if (referenceEl) referenceEl.textContent = reference;
    if (teamEl) teamEl.textContent = firstRole ? `${firstTeam} · ${firstRole}` : firstTeam;

    if (messageEl) {
      if (result.updated) {
        messageEl.textContent = "Your existing application was updated successfully.";
      } else if (legacyFallback) {
        messageEl.textContent = "Your application was sent successfully and is being processed.";
      } else {
        messageEl.textContent = "Your application to the Claude Builder Club — AOU Egypt founding team has been received successfully.";
      }
    }

    if (noteEl && legacyFallback) {
      noteEl.textContent = "Keep this submission reference. Your confirmation email may arrive shortly with the official Application ID.";
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
    let responseFallbackTimer = null;
    let settled = false;
    let submitted = false;

    const cleanup = () => {
      if (timer) clearTimeout(timer);
      if (responseFallbackTimer) clearTimeout(responseFallbackTimer);
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

    const finishLegacySuccess = () => {
      if (settled) return;
      settled = true;
      cleanup();
      setBusy(false);
      showSuccessResult({ ok: true }, cleanPayload, fallbackReference, true);
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
        showSuccessResult(data, cleanPayload, fallbackReference, false);
      } else {
        alert(data.message || "The application service rejected the submission. Your draft is still saved.");
      }
    };

    try {
      iframe = document.createElement("iframe");
      iframe.name = "cbc-submit-verified-" + Date.now();
      iframe.srcdoc = "<!doctype html><title>ready</title>";
      iframe.hidden = true;
      iframe.setAttribute("aria-hidden", "true");
      document.body.appendChild(iframe);

      await new Promise(resolve => {
        iframe.addEventListener("load", resolve, { once: true });
        setTimeout(resolve, 300);
      });

      window.addEventListener("message", onMessage);

      // A completed navigation after submit means the Apps Script endpoint replied.
      // Give a modern deployment a short grace period to send postMessage first;
      // otherwise fall back to the legacy response behavior without re-submitting.
      iframe.addEventListener("load", () => {
        if (!submitted || settled) return;
        if (responseFallbackTimer) clearTimeout(responseFallbackTimer);
        responseFallbackTimer = setTimeout(finishLegacySuccess, 1500);
      });

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
        finishWithError("The application service did not respond. Your draft is saved, so please check your connection and try again.");
      }, 45000);

      submitted = true;
      transportForm.submit();
    } catch (error) {
      console.error("Application submission failed:", error);
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
    downloadCopy.addEventListener("click", async event => {
      if (!latestVerifiedSubmission) return;

      event.preventDefault();
      event.stopImmediatePropagation();
      await downloadApplicationPdf(latestVerifiedSubmission);
    }, true);
  }

  if (closeSuccess) {
    closeSuccess.addEventListener("click", () => {
      latestVerifiedSubmission = null;
    });
  }
})();
