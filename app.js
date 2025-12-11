// app.js  – shared behaviour for Diploria

document.addEventListener('DOMContentLoaded', () => {
  const CANONICAL_URL = 'https://diploria.net/'; // adjust if needed

  // SHARE button (uses Web Share where available, falls back to copy)
  document.querySelectorAll('[data-share]').forEach(btn => {
    btn.addEventListener('click', async () => {
      try {
        if (navigator.share) {
          await navigator.share({
            title: 'Diploria – Clarity you can use',
            text: 'A practical way to turn a complicated situation into a clear summary, simple timeline, and next steps.',
            url: CANONICAL_URL
          });
        } else if (navigator.clipboard) {
          await navigator.clipboard.writeText(CANONICAL_URL);
          btn.textContent = 'Link copied';
          setTimeout(() => (btn.textContent = 'Share'), 1500);
        } else {
          alert('Sharing is not available here. You can copy this link:\n\n' + CANONICAL_URL);
        }
      } catch (e) {
        console.error('Share failed', e);
      }
    });
  });

  // COPY LINK button – always copies canonical home URL
  document.querySelectorAll('[data-copy-link]').forEach(btn => {
    btn.addEventListener('click', async () => {
      try {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(CANONICAL_URL);
          const original = btn.textContent;
          btn.textContent = 'Copied';
          setTimeout(() => (btn.textContent = original), 1500);
        } else {
          alert('Copy is not available here. You can copy this link:\n\n' + CANONICAL_URL);
        }
      } catch (e) {
        console.error('Copy failed', e);
      }
    });
  });
});