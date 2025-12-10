// Share button: copy current URL
function copyCurrentUrl(){
  const url = window.location.href;
  navigator.clipboard.writeText(url).then(() => {
    const btn = document.querySelector('[data-share]');
    if(!btn) return;
    const old = btn.innerHTML;
    btn.innerHTML = 'Copied ✓';
    setTimeout(() => (btn.innerHTML = old), 1200);
  }).catch(() => {
    alert("Couldn't copy link. You can copy from the address bar.");
  });
}

// Active highlight for rail links (in-page anchors)
function setupRailActive(){
  const links = Array.from(document.querySelectorAll('.rail-link[href^="#"]'));
  const sections = links
    .map(a => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  if(!links.length || !sections.length) return;

  const activate = (id) => {
    links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${id}`));
  };

  window.addEventListener('scroll', () => {
    let currentId = sections[0].id;
    for(const s of sections){
      const top = s.getBoundingClientRect().top;
      if(top <= 140) currentId = s.id;
    }
    activate(currentId);
  }, { passive:true });

  activate(sections[0].id);
}

document.addEventListener('DOMContentLoaded', () => {
  const shareBtn = document.querySelector('[data-share]');
  if(shareBtn) shareBtn.addEventListener('click', copyCurrentUrl);
  setupRailActive();
});