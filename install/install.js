document.querySelectorAll('[data-copy-value]').forEach((button) => {
  button.addEventListener('click', async () => {
    const value = button.getAttribute('data-copy-value') || '';
    try {
      await navigator.clipboard.writeText(value);
      button.textContent = 'Copied';
      const label = button.getAttribute('data-copy-label') || 'Copy';
      setTimeout(() => {
        button.textContent = label;
      }, 1400);
    } catch (error) {
      console.error('[install] Clipboard copy failed:', error);
      button.textContent = 'Select and copy above';
    }
  });
});
