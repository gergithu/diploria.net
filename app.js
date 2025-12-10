(() => {
  const toast = (() => {
    const el = document.createElement("div");
    el.className = "toast";
    document.body.appendChild(el);
    let t = null;
    return (msg) => {
      el.textContent = msg;
      el.classList.add("show");
      clearTimeout(t);
      t = setTimeout(() => el.classList.remove("show"), 1600);
    };
  })();

  // Share button: Web Share API if available, else copy URL.
  document.querySelectorAll("[data-share]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const url = window.location.href;
      try {
        if (navigator.share) {
          await navigator.share({ title: document.title, url });
          return;
        }
      } catch (_) { /* user cancelled; ignore */ }

      try {
        await navigator.clipboard.writeText(url);
        toast("Link copied.");
      } catch (_) {
        // last-ditch fallback
        const tmp = document.createElement("input");
        tmp.value = url;
        document.body.appendChild(tmp);
        tmp.select();
        document.execCommand("copy");
        tmp.remove();
        toast("Link copied.");
      }
    });
  });

  // Rail: active section highlight (only for in-page anchors)
  const railLinks = Array.from(document.querySelectorAll(".rail-link"))
    .filter(a => (a.getAttribute("href") || "").startsWith("#"));

  const sections = railLinks
    .map(a => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  if (sections.length) {
    const setActive = (id) => {
      railLinks.forEach(a => {
        const href = a.getAttribute("href");
        a.classList.toggle("active", href === `#${id}`);
      });
    };

    const obs = new IntersectionObserver((entries) => {
      // pick the most visible section in view
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (visible?.target?.id) setActive(visible.target.id);
    }, { root: null, threshold: [0.15, 0.25, 0.35, 0.5] });

    sections.forEach(s => obs.observe(s));
  }

  // Bottom dock close (remembered)
  const dock = document.querySelector("[data-dock]");
  const closeBtn = document.querySelector("[data-dock-close]");
  if (dock && closeBtn) {
    if (localStorage.getItem("diploriaDockClosed") === "1") {
      dock.style.display = "none";
    }
    closeBtn.addEventListener("click", () => {
      dock.style.display = "none";
      localStorage.setItem("diploriaDockClosed", "1");
      toast("Dock hidden.");
    });
  }
})();