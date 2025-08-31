['T14000', 'T24650'].forEach(system => {
  document.getElementById(`useManualSplice${system}`).addEventListener('change', (e) => {
    const container = document.getElementById(`manualSpliceContainer${system}`);
    container.classList.toggle('hidden', !e.target.checked);
  });
});

// Entry point: run this after DOM is fully loaded
window.addEventListener('DOMContentLoaded', () => {
  // Set up tab switching
  setupTabs(['T14000', 'T24650']);

  // Set up forms for both systems
  initializeForm('T14000');
  initializeForm('T24650');
});
