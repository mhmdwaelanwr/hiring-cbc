/*
  Claude Builder Club — application quality layer
  Keeps the recruitment form readable while normalizing data before the
  existing submission transport sees it. No backend/transport logic lives here.
*/
(() => {
  const ready = fn => document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", fn, { once: true })
    : fn();

  ready(() => {
    const form = document.querySelector("#applicationForm");
    if (!form) return;

    const oneLineNames = ["full_name", "student_id", "email", "university_email", "phone"];
    const urlNames = ["linkedin", "portfolio", "design_portfolio", "other_link"];
    const narrativeRules = {
      evidence: { min: 60, max: 1800, label: "Tell us what you actually did — not only the title." },
      motivation: { min: 60, max: 1600, label: "Give us enough context to understand your motivation." },
      scenario: { min: 100, max: 2200, label: "Explain your priorities and what you would do first." },
      campus_impact: { min: 60, max: 1600, label: "Describe a practical change you would like to make." },
      notes: { min: 0, max: 1200, label: "Optional — keep it relevant to your application." }
    };

    const collapseSpaces = value => String(value || "").replace(/\s+/g, " ").trim();
    const digitsOnly = value => String(value || "").replace(/\D+/g, "");

    function normalizePhone(value) {
      let raw = String(value || "").trim();
      if (!raw) return "";
      raw = raw.replace(/[\s().-]+/g, "");
      if (raw.startsWith("00")) raw = "+" + raw.slice(2);
      if (raw.startsWith("+20")) return "+20" + digitsOnly(raw.slice(3));
      const digits = digitsOnly(raw);
      if (/^01\d{9}$/.test(digits)) return "+20" + digits.slice(1);
      if (/^20(1\d{9})$/.test(digits)) return "+" + digits;
      return raw.startsWith("+") ? "+" + digits : digits;
    }

    function normalizeUrl(value) {
      const clean = String(value || "").trim();
      if (!clean) return "";
      if (/^[a-z][a-z0-9+.-]*:\/\//i.test(clean)) return clean;
      if (/^(www\.)?[\w.-]+\.[a-z]{2,}(?:[/?#].*)?$/i.test(clean)) return "https://" + clean;
      return clean;
    }

    function meaningfulLength(value) {
      const text = String(value || "").trim();
      try {
        return (text.match(/[\p{L}\p{N}]/gu) || []).length;
      } catch (_) {
        return text.replace(/[^A-Za-z0-9\u0600-\u06FF]/g, "").length;
      }
    }

    function ensureMeta(control, rule) {
      if (!control || control.dataset.qualityReady === "true") return;
      control.dataset.qualityReady = "true";
      const label = control.closest("label");
      if (!label) return;

      const meta = document.createElement("span");
      meta.className = "form-field-meta";
      const hint = document.createElement("span");
      hint.className = "form-field-hint";
      hint.textContent = rule.label || (rule.min ? `Minimum ${rule.min} meaningful characters.` : "");
      const counter = document.createElement("span");
      counter.className = "form-field-counter";
      counter.setAttribute("aria-live", "polite");
      meta.append(hint, counter);
      label.appendChild(meta);

      const refresh = () => {
        const len = String(control.value || "").length;
        counter.textContent = rule.max ? `${len} / ${rule.max}` : String(len);
        counter.classList.toggle("near-limit", Boolean(rule.max && len >= Math.round(rule.max * .88)));
      };
      control.addEventListener("input", refresh);
      refresh();
    }

    function autosize(textarea) {
      if (!(textarea instanceof HTMLTextAreaElement)) return;
      textarea.style.height = "auto";
      textarea.style.height = Math.min(Math.max(textarea.scrollHeight, 112), 300) + "px";
    }

    function setQualityValidity(control, rule) {
      if (!control) return true;
      control.setCustomValidity("");
      const value = String(control.value || "").trim();
      if (!value && !control.required) return true;
      const meaningful = meaningfulLength(value);
      if (rule.min && meaningful < rule.min) {
        control.setCustomValidity(`Please add a little more detail (${rule.min}+ meaningful characters).`);
        return false;
      }
      if (rule.max && value.length > rule.max) {
        control.setCustomValidity(`Please keep this answer under ${rule.max} characters.`);
        return false;
      }
      return true;
    }

    function prepareNarrative(control, rule) {
      if (!control) return;
      if (rule.max) control.maxLength = rule.max;
      control.dataset.qualityMin = String(rule.min || 0);
      control.dataset.qualityMax = String(rule.max || 0);
      ensureMeta(control, rule);
      if (control instanceof HTMLTextAreaElement) {
        control.addEventListener("input", () => autosize(control));
        requestAnimationFrame(() => autosize(control));
      }
      control.addEventListener("input", () => {
        control.closest("label")?.classList.remove("quality-invalid");
        control.setCustomValidity("");
      });
      control.addEventListener("blur", () => {
        control.dataset.touched = "true";
        const ok = setQualityValidity(control, rule);
        control.closest("label")?.classList.toggle("quality-invalid", !ok);
      });
    }

    function prepareStaticFields() {
      const studentId = form.elements.namedItem("student_id");
      if (studentId) {
        studentId.setAttribute("inputmode", "numeric");
        studentId.setAttribute("autocomplete", "off");
        studentId.setAttribute("pattern", "[0-9]{7,10}");
        studentId.setAttribute("title", "Use your AOU student ID (7–10 digits)." );
      }

      const phone = form.elements.namedItem("phone");
      if (phone) {
        phone.setAttribute("inputmode", "tel");
        phone.setAttribute("placeholder", "+20 1XXXXXXXXX");
      }

      const fullName = form.elements.namedItem("full_name");
      if (fullName) {
        fullName.setAttribute("minlength", "5");
        fullName.setAttribute("maxlength", "90");
      }

      urlNames.forEach(name => {
        const control = form.elements.namedItem(name);
        if (control) {
          control.setAttribute("inputmode", "url");
          control.setAttribute("spellcheck", "false");
        }
      });

      Object.entries(narrativeRules).forEach(([name, rule]) => {
        prepareNarrative(form.elements.namedItem(name), rule);
      });
    }

    function prepareConditionalFields() {
      const conditional = document.querySelector("#conditional");
      if (!conditional) return;
      conditional.querySelectorAll("textarea, input").forEach(control => {
        if (control instanceof HTMLTextAreaElement) {
          prepareNarrative(control, {
            min: 40,
            max: 1400,
            label: "Give a concrete answer relevant to your first-choice team."
          });
        } else {
          control.minLength = 5;
          control.maxLength = 300;
        }
      });
    }

    function normalizeAll() {
      const fullName = form.elements.namedItem("full_name");
      if (fullName) fullName.value = collapseSpaces(fullName.value);

      const studentId = form.elements.namedItem("student_id");
      if (studentId) studentId.value = digitsOnly(studentId.value);

      ["email", "university_email"].forEach(name => {
        const control = form.elements.namedItem(name);
        if (control) control.value = String(control.value || "").trim().toLowerCase();
      });

      const phone = form.elements.namedItem("phone");
      if (phone) phone.value = normalizePhone(phone.value);

      urlNames.forEach(name => {
        const control = form.elements.namedItem(name);
        if (control) control.value = normalizeUrl(control.value);
      });

      oneLineNames.forEach(name => {
        const control = form.elements.namedItem(name);
        if (control && !["student_id", "email", "university_email", "phone", "full_name"].includes(name)) {
          control.value = collapseSpaces(control.value);
        }
      });
    }

    function validateActiveQuality() {
      const active = form.querySelector(".form-page.active");
      if (!active) return true;
      let firstInvalid = null;
      active.querySelectorAll("textarea[data-quality-min]").forEach(control => {
        const rule = {
          min: Number(control.dataset.qualityMin || 0),
          max: Number(control.dataset.qualityMax || 0)
        };
        const ok = setQualityValidity(control, rule);
        control.closest("label")?.classList.toggle("quality-invalid", !ok);
        if (!ok && !firstInvalid) firstInvalid = control;
      });
      if (firstInvalid) {
        firstInvalid.reportValidity();
        firstInvalid.focus({ preventScroll: true });
        firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
        return false;
      }
      return true;
    }

    form.addEventListener("focusout", event => {
      const control = event.target;
      if (!(control instanceof HTMLInputElement || control instanceof HTMLTextAreaElement)) return;
      if (control.name === "full_name") control.value = collapseSpaces(control.value);
      if (control.name === "student_id") control.value = digitsOnly(control.value);
      if (control.name === "phone") control.value = normalizePhone(control.value);
      if (["email", "university_email"].includes(control.name)) control.value = String(control.value || "").trim().toLowerCase();
      if (urlNames.includes(control.name)) control.value = normalizeUrl(control.value);
    });

    // This listener is on document capture so it runs before app.js / submission-hotfix
    // listeners attached directly to #nextBtn.
    document.addEventListener("click", event => {
      const next = event.target.closest?.("#nextBtn");
      if (!next) return;
      normalizeAll();
      if (!validateActiveQuality()) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    }, true);

    const conditional = document.querySelector("#conditional");
    if (conditional && "MutationObserver" in window) {
      new MutationObserver(() => prepareConditionalFields())
        .observe(conditional, { childList: true, subtree: true });
    }

    prepareStaticFields();
    prepareConditionalFields();
    window.normalizeCBCForm = normalizeAll;
  });
})();
