// Show the bay width input form after entering number of bays
function generateBayInputs(system) {
    const numBaysInput = document.getElementById(`numBays${system}`);
    const container = document.getElementById(`bayInputs${system}`);
    const form = document.getElementById(`mainForm${system}`);
    const num = parseInt(numBaysInput.value);
  
    if (!num || num <= 0 || num > 20) {
      alert('Please enter a valid number of bays (1–20).');
      return;
    }
  
    container.innerHTML = '';
  
    for (let i = 0; i < num; i++) {
  const wrapper = document.createElement('div');
  wrapper.className = 'bay-input-wrapper';

  const input = document.createElement('input');
  input.type = 'text';
  input.name = `bay${i}`;
  input.placeholder = 'e.g. 40 or 36 1/2';
  input.required = true;

  const label = document.createElement('label');
  label.textContent = `Bay ${i + 1}`;
  label.htmlFor = input.name;

  wrapper.appendChild(input);
  wrapper.appendChild(label);
  container.appendChild(wrapper);
}

  
    numBaysInput.style.display = 'none';
    numBaysInput.nextElementSibling.style.display = 'none'; // hide "Next" button
    form.classList.remove('hidden');
    document.getElementById(`results${system}`).classList.add('hidden');
  }
  
  // Add a new manual splice input row
  function addSplice(system) {
    const container = document.getElementById(`spliceContainer${system}`);
    const div = document.createElement('div');
    div.className = 'splice-section';
  
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'e.g. 288"';
    input.required = true;
  
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = '×';
    btn.title = 'Remove this segment';
    btn.onclick = () => div.remove();
  
    div.appendChild(input);
    div.appendChild(btn);
    container.appendChild(div);
  }
  
  // Show/hide manual splice container when checkbox is toggled
  function setupSpliceToggle(system) {
    const checkbox = document.getElementById(`useManualSplice${system}`);
    const container = document.getElementById(`manualSpliceContainer${system}`);
    checkbox.addEventListener('change', () => {
      container.classList.toggle('hidden', !checkbox.checked);
    });
  }
  
  // Setup all form-related behavior for a given system
  function initializeForm(system) {
    setupSpliceToggle(system);

    const form = document.getElementById(`mainForm${system}`);
    form.addEventListener('submit', (e) => calculate(e, system));
  }

  function onSubmitHandler(event) {
  event.preventDefault();
  const system = 'T14000'; // or pass dynamically
  const manualSpliceStr = getManualSpliceStr(system);
  console.log('Manual Splice String:', manualSpliceStr);

  // Continue with your calculation using manualSpliceStr...
}

  
function resetForm(system) {
  // Reset bay count input
  const numBaysInput = document.getElementById(`numBays${system}`);
  numBaysInput.value = '';
  numBaysInput.style.display = 'inline-block';
  numBaysInput.nextElementSibling.style.display = 'inline-block'; // Show "Next" button

  // Clear form fields and hide sections
  document.getElementById(`bayInputs${system}`).innerHTML = '';
  document.getElementById(`mainForm${system}`).classList.add('hidden');
  document.getElementById(`results${system}`).classList.add('hidden');

  // Clear manual splice fields
  document.getElementById(`spliceContainer${system}`).innerHTML = '';
  document.getElementById(`useManualSplice${system}`).checked = false;
  document.getElementById(`manualSpliceContainer${system}`).classList.add('hidden');

  // Clear visual markout
  const visual = document.getElementById(`markoutVisual${system}`);
  if (visual) visual.innerHTML = '';
}
