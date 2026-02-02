(function () {
  function $(id) { return document.getElementById(id); }

  function setStatus(el, msg, isError) {
    el.classList.toggle("error", !!isError);
    el.textContent = msg || "";
  }

  function v(id) {
    const el = $(id);
    return el ? (el.value || "").trim() : "";
  }

  function getData() {
    return {
      name: v("name"),
      email: v("email"),
      phone: v("phone"),
      objective: v("objective"),
      situation: v("situation"),
      facts: v("facts"),
      unknowns: v("unknowns"),
      constraints: v("constraints"),
      requested_output: v("requested_output"),
      deadline: v("deadline"),
      stake: v("stake")
    };
  }

  function validate(d) {
    if (!d.name || !d.email || !d.objective || !d.situation || !d.requested_output) {
      return "Please complete name, email, objective, situation, and requested output.";
    }
    const agree = $("agree");
    if (!agree || !agree.checked) {
      return "Please confirm the disclaimer checkbox.";
    }
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email);
    if (!emailOk) return "Please enter a valid email address.";
    return null;
  }

  function formatPreview(d) {
    return (
      "Objective:\n" + d.objective + "\n\n" +
      "Situation:\n" + d.situation + "\n\n" +
      (d.facts ? "Facts / inputs:\n" + d.facts + "\n\n" : "") +
      (d.unknowns ? "Unknowns / conflicts:\n" + d.unknowns + "\n\n" : "") +
      (d.constraints ? "Constraints:\n" + d.constraints + "\n\n" : "") +
      "Requested output:\n" + d.requested_output + "\n\n" +
      (d.deadline ? "Deadline / urgency:\n" + d.deadline + "\n\n" : "") +
      (d.stake ? "What’s at stake:\n" + d.stake + "\n\n" : "") +
      "\n(Email/phone hidden in preview.)"
    );
  }

  async function submitToWorker(d, statusEl, formEl) {
    setStatus(statusEl, "Submitting...", false);

    const res = await fetch("/api/intake", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(d)
    });

    let out = {};
    try { out = await res.json(); } catch (e) {}

    const ok = !!(out.ok || out.success);
    const caseId = out.caseId || out.id || out.case_id;

    if (!res.ok || !ok) {
      const msg = out.error || out.message || ("HTTP " + res.status);
      throw new Error(msg);
    }

    setStatus(statusEl, caseId ? ("Submitted. Case ID: " + caseId) : "Submitted.", false);
    formEl.reset();
  }

  function init() {
    const modal = $("reviewModal");
    const reviewContent = $("reviewContent");
    const btnEdit = $("btnEdit");
    const btnConfirm = $("btnConfirm");
    const btnReview = $("reviewBtn");
    const btnClear = $("clearBtn");
    const status = $("status");
    const form = $("intakeForm");

    if (!modal || !reviewContent || !btnEdit || !btnConfirm || !btnReview || !btnClear || !status || !form) {
      return;
    }

    function openModal(text) {
      reviewContent.textContent = text;
      modal.style.display = "block";
    }
    function closeModal() {
      modal.style.display = "none";
    }

    btnReview.addEventListener("click", function () {
      setStatus(status, "", false);
      const d = getData();
      const err = validate(d);
      if (err) { setStatus(status, err, true); return; }
      openModal(formatPreview(d));
    });

    btnClear.addEventListener("click", function () {
      form.reset();
      setStatus(status, "", false);
    });

    btnEdit.addEventListener("click", function () {
      closeModal();
    });

    btnConfirm.addEventListener("click", async function () {
      try {
        btnConfirm.disabled = true;
        const d = getData();
        const err = validate(d);
        if (err) { setStatus(status, err, true); closeModal(); return; }
        await submitToWorker(d, status, form);
        closeModal();
      } catch (ex) {
        setStatus(status, ex && ex.message ? ex.message : "Submission failed.", true);
        closeModal();
      } finally {
        btnConfirm.disabled = false;
      }
    });

    modal.addEventListener("click", function (e) {
      if (e.target === modal) closeModal();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();