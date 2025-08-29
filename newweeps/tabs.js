// Switch tab between T14000 and T24650
function switchTab(system) {
  ['T14000', 'T24650'].forEach((s) => {
    const tab = document.getElementById(`tab${s}`);
    const btn = document.getElementById(`tabBtn${s}`);
    const isActive = s === system;

    tab.classList.toggle('hidden', !isActive);
    btn.classList.toggle('active', isActive);
  });
}

// Setup event listeners for all tab buttons
function setupTabs(systems) {
  systems.forEach(system => {
    const tabBtn = document.getElementById(`tabBtn${system}`);
    if (tabBtn) {
      tabBtn.addEventListener('click', () => switchTab(system));
    }
  });
}
