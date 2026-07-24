(() => {
  try {
    const saved = localStorage.getItem('spark-theme');
    if (saved === 'light' || saved === 'dark') {
      document.documentElement.dataset.theme = saved;
    }
  } catch {
    // Storage may be unavailable in hardened browser contexts.
  }
})();
