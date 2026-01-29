(() => {
  const toast = document.getElementById("toast");

  function showToast(msg){
    if(!toast) return;
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 1600);
  }

  async function copyText(text){
    try{
      await navigator.clipboard.writeText(text);
      showToast("Link copied.");
      return true;
    }catch(e){
      // fallback
      const t = document.createElement("textarea");
      t.value = text;
      document.body.appendChild(t);
      t.select();
      try{
        document.execCommand("copy");
        showToast("Link copied.");
        return true;
      }catch(err){
        showToast("Couldn’t copy link.");
        return false;
      }finally{
        document.body.removeChild(t);
      }
    }
  }

  async function sharePage(){
    const url = window.location.href;
    const title = document.title || "Diploria";
    try{
      if(navigator.share){
        await navigator.share({ title, url });
        return;
      }
      await copyText(url);
    }catch(e){
      // user canceled share: no drama
    }
  }

  // Button wiring
  document.querySelectorAll("[data-share]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      sharePage();
    });
  });

  document.querySelectorAll("[data-copylink]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      copyText(window.location.href);
    });
  });

  document.querySelectorAll("[data-top]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  // Active section highlight for rail links (anchors only)
  const railLinks = Array.from(document.querySelectorAll('.rail-link[href^="#"]'));
  const sections = railLinks
    .map(a => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  if(sections.length){
    const obs = new IntersectionObserver((entries) => {
      // pick the most visible intersecting section
      const visible = entries
        .filter(en => en.isIntersecting)
        .sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];

      if(!visible) return;

      const id = "#" + visible.target.id;
      railLinks.forEach(a => a.classList.toggle("active", a.getAttribute("href") === id));
    }, { root: null, threshold: [0.15, 0.25, 0.35, 0.5] });

    sections.forEach(sec => obs.observe(sec));
  }

  // Footer year
  document.querySelectorAll("[data-year]").forEach(el => {
    el.textContent = String(new Date().getFullYear());
  });
})();