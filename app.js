/* Diploria shared behavior (all pages) */
(() => {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    wireShareButtons();
    wireRailSectionTracking();
    wireAnchorSmoothScroll();
    initCostChartIfPresent();
  });

  // ---------------------------
  // Share button (data-share)
  // ---------------------------
  function wireShareButtons() {
    const buttons = document.querySelectorAll("[data-share]");
    if (!buttons.length) return;

    buttons.forEach((btn) => {
      btn.addEventListener("click", async () => {
        const url = window.location.href;
        const title = document.title || "Diploria";

        // Prefer Web Share API (mobile + some desktop browsers)
        if (navigator.share) {
          try {
            await navigator.share({ title, url });
            return;
          } catch {
            // user cancelled or not allowed — fall back to copy
          }
        }

        // Clipboard fallback
        const ok = await copyToClipboard(url);
        toast(ok ? "Link copied." : "Couldn’t copy. Select + copy from the address bar.");
      });
    });
  }

  async function copyToClipboard(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {
      // fall through
    }

    // Fallback for older browsers
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.top = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }

  // ---------------------------
  // Rail: highlight section in view
  // ---------------------------
  function wireRailSectionTracking() {
    const railLinks = Array.from(document.querySelectorAll(".rail-link[href^='#']"));
    if (!railLinks.length) return;

    const targets = railLinks
      .map((a) => {
        const id = a.getAttribute("href").slice(1);
        const el = document.getElementById(id);
        return el ? { id, el, a } : null;
      })
      .filter(Boolean);

    if (!targets.length) return;

    const setActive = (id) => {
      targets.forEach(({ id: tid, a }) => {
        a.classList.toggle("active", tid === id);
      });
    };

    // IntersectionObserver is smoother than scroll handlers
    const io = new IntersectionObserver(
      (entries) => {
        // pick the most visible entry
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible && visible.target && visible.target.id) {
          setActive(visible.target.id);
        }
      },
      {
        root: null,
        // bias to activate when the section header is in the upper half
        rootMargin: "-15% 0px -70% 0px",
        threshold: [0.1, 0.2, 0.35, 0.5, 0.75],
      }
    );

    targets.forEach(({ el }) => io.observe(el));

    // If arriving with a hash, mark it active
    if (window.location.hash) {
      const id = window.location.hash.slice(1);
      const match = targets.find((t) => t.id === id);
      if (match) setActive(id);
    }
  }

  // ---------------------------
  // Smooth scrolling for in-page anchors
  // ---------------------------
  function wireAnchorSmoothScroll() {
    const anchors = document.querySelectorAll("a[href^='#']");
    if (!anchors.length) return;

    anchors.forEach((a) => {
      a.addEventListener("click", (e) => {
        const href = a.getAttribute("href");
        if (!href || href.length < 2) return;

        const id = href.slice(1);
        const target = document.getElementById(id);
        if (!target) return;

        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });

        // update URL without jumping
        history.replaceState(null, "", `#${id}`);
      });
    });
  }

  // ---------------------------
  // Chart init (methodology page only)
  // ---------------------------
  function initCostChartIfPresent() {
    const canvas = document.getElementById("costChart");
    if (!canvas) return;

    // prevent double-initialization if you still have an inline chart script somewhere
    if (canvas.dataset.chartInit === "1") return;
    canvas.dataset.chartInit = "1";

    // Chart.js must be loaded on the page that has this canvas
    if (!window.Chart) return;

    const ctx = canvas.getContext("2d");
    new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["AI subscription (example)", "Avoided professional fees (illustrative)"],
        datasets: [
          {
            data: [360, 45000],
            backgroundColor: ["#c96a3c", "#e1e1da"],
            borderColor: "#ffffff",
            borderWidth: 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "70%",
        plugins: { legend: { position: "bottom" } },
      },
    });
  }

  // ---------------------------
  // Minimal toast (no CSS dependency)
  // ---------------------------
  let toastTimer = null;
  function toast(message) {
    clearTimeout(toastTimer);

    let el = document.getElementById("diploria-toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "diploria-toast";
      el.style.position = "fixed";
      el.style.left = "50%";
      el.style.bottom = "92px";
      el.style.transform = "translateX(-50%)";
      el.style.padding = "10px 12px";
      el.style.borderRadius = "12px";
      el.style.border = "1px solid rgba(225,225,218,0.9)";
      el.style.background = "rgba(255,255,255,0.92)";
      el.style.boxShadow = "0 14px 30px rgba(0,0,0,0.14)";
      el.style.fontFamily = "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif";
      el.style.fontSize = "0.9rem";
      el.style.color = "rgba(32,32,30,0.9)";
      el.style.zIndex = "9999";
      el.style.opacity = "0";
      el.style.transition = "opacity 160ms ease, transform 160ms ease";
      document.body.appendChild(el);
    }

    el.textContent = message;
    el.style.opacity = "1";
    el.style.transform = "translateX(-50%) translateY(-2px)";

    toastTimer = setTimeout(() => {
      el.style.opacity = "0";
      el.style.transform = "translateX(-50%) translateY(6px)";
    }, 1400);
  }
})();