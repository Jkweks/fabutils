// W:\Web\dev\js\theme-toggle.js

const toggle = document.getElementById('theme-toggle');
const html = document.documentElement;

// Load saved theme
window.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('theme') || 'dark';
  html.setAttribute('data-theme', saved);
  toggle.checked = saved === 'light';
});

// Save theme when toggled
toggle.addEventListener('change', () => {
  const newTheme = toggle.checked ? 'light' : 'dark';
  html.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
});
