['T14000', 'T24650'].forEach(system => {
  document.getElementById(`useManualSplice${system}`).addEventListener('change', (e) => {
    const container = document.getElementById(`manualSpliceContainer${system}`);
    container.classList.toggle('hidden', !e.target.checked);
  });
  const dlBtn = document.getElementById(`download${system}`);
  if (dlBtn) dlBtn.addEventListener('click', () => downloadPDF(system));
});

// Entry point: run this after DOM is fully loaded
window.addEventListener('DOMContentLoaded', () => {
  // Set up tab switching
  setupTabs(['T14000', 'T24650']);

  // Set up forms for both systems
  initializeForm('T14000');
  initializeForm('T24650');

  // Ensure door checkboxes start unchecked
  ['T14000', 'T24650'].forEach(system => {
    const dl = document.getElementById(`doorLeft${system}`);
    const dr = document.getElementById(`doorRight${system}`);
    if (dl) dl.checked = false;
    if (dr) dr.checked = false;
  });
});
