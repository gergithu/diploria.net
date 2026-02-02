(function () {
  const form = document.getElementById("intakeForm");
  const ok = document.getElementById("statusSuccess");
  const err = document.getElementById("statusError");

  function show(el){ el.style.display = "block"; }
  function hide(el){ el.style.display = "none"; }

  // Show status if query params exist (optional)
  const params = new URLSearchParams(window.location.search);
  if (params.get("submitted") === "1") show(ok);
  if (params.get("error") === "1") show(err);

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    // If there is no action, let browser do its thing (or fallback)
    const action = form.getAttribute("action");
    if (!action) {
      // minimal fallback: allow normal submit (which will do nothing useful on static)
      // Better: prompt user to email
      e.preventDefault();
      show(err);
      return;
    }

    e.preventDefault();
    hide(ok); hide(err);

    const data = new FormData(form);

    try {
      const res = await fetch(action, {
        method: "POST",
        body: data,
        headers: { "Accept": "application/json" }
      });

      if (!res.ok) throw new Error("Bad response");

      form.reset();
      show(ok);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (ex) {
      show(err);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });
})();