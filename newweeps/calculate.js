// Shared weep-hole pattern generator and calculators for T14000 & T24650
//
// getWeepPoints(system, width)
//   Returns an array of mark positions (inches from bay start)
//   based on the bay width and requested system.
//
// Patterns:
//   T14000 - center when width ≤ 12", otherwise quarter points.
//   T24650 -
//     • width < 8"  → center
//     • 8"–<12"     → 2" from each end
//     • 12"–16"     → 2" from each end and center
//     • >16"        → 2" & 8" from both ends
function getWeepPoints(system, width) {
  if (system === 'T14000') {
    return width <= 12 ? [width / 2] : [width * 0.25, width * 0.75];
  }
  if (system === 'T24650') {
    if (width < 8) return [width / 2];
    if (width < 12) return [2, width - 2];
    if (width <= 16) return [2, width / 2, width - 2];
    return [2, 8, width - 8, width - 2];
  }
  return [];
}

// Locate which splice segment contains a given mark point
function findSegment(segments, point) {
  const epsilon = 0.005; // small margin for floating point rounding
  for (const seg of segments) {
    if (point >= seg.start - epsilon && point <= seg.end + epsilon) {
      return { part: seg.part, local: point - seg.start };
    }
  }
  throw new Error(`Point ${roundToSixteenths(point)} not found in any segment.`);
}

// Generic calculator used by both series
function calculate(e, system) {
  e.preventDefault();

  const spacingDefault = parseFractionalInput(document.getElementById(`spacing${system}`).value) || 0;
  const spliceGap = parseFractionalInput(document.getElementById(`spliceGap${system}`).value) || 0;
  const doorLeft = document.getElementById(`doorLeft${system}`).checked;
  const doorRight = document.getElementById(`doorRight${system}`).checked;
  const useManualSplice = document.getElementById(`useManualSplice${system}`).checked;
  const offset = parseFractionalInput(document.getElementById(`trackOffset${system}`).value) || 0;

  const bayInputs = [...document.querySelectorAll(`#bayInputs${system} input[type="text"]`)];
  if (!bayInputs.length) {
    alert('Please enter number of bays and click Next first.');
    return;
  }

  let bayWidths;
  try {
    bayWidths = bayInputs.map(inp => {
      const val = parseFractionalInput(inp.value);
      if (isNaN(val) || val <= 0) {
        alert('Please enter valid positive numbers for bay widths.');
        throw new Error('Invalid bay width');
      }
      return val;
    });
  } catch {
    return;
  }

  const expansionChecks = [...document.querySelectorAll(`#bayInputs${system} input[type="checkbox"]`)];
  const spacings = bayWidths.slice(0, -1).map((_, i) => expansionChecks[i] && expansionChecks[i].checked ? 2.5 : spacingDefault);

  const allMarkPoints = [];
  let pos = doorLeft ? 0 : 2.125;
  pos += offset;
  bayWidths.forEach((width, i) => {
    const points = getWeepPoints(system, width);
    points.forEach(p => allMarkPoints.push(pos + p));
    pos += width + (i < bayWidths.length - 1 ? spacings[i] : 0);
  });

  const totalRun = bayWidths.reduce((a, b) => a + b, 0) + spacings.reduce((a, b) => a + b, 0);
  const maxPartLength = 288;
  let spliceSegments;
  try {
    if (useManualSplice) {
      spliceSegments = getManualSpliceSegments(system, totalRun, spliceGap);
      const manualTotal = spliceSegments.reduce(
        (a, seg, i) => a + (seg.end - seg.start) + (i < spliceSegments.length - 1 ? spliceGap : 0),
        0
      );
      if (manualTotal + 0.001 < totalRun) {
        alert(`Warning: Manual splices total ${manualTotal.toFixed(3)}, less than total run ${totalRun.toFixed(3)}.`);
      }
    } else {
      spliceSegments = getAutoSpliceSegmentsBayMidpointsOnly(
        bayWidths,
        spacings,
        spliceGap,
        maxPartLength,
        doorLeft,
        doorRight,
        offset,
        allMarkPoints
      );
    }
  } catch (ex) {
    alert('Error calculating splice segments: ' + ex.message);
    return;
  }

  const results = [];
  const pointsByPart = {};
  pos = doorLeft ? 0 : 2.125;
  pos += offset;

  visualizeMarkpoints('markpointVisualizer', spliceSegments, allMarkPoints, totalRun, doorLeft, doorRight);

  bayWidths.forEach((width, i) => {
    results.push(`Bay ${i + 1}:`);
    const markPoints = getWeepPoints(system, width);
    markPoints.forEach((local, idx) => {
      const pt = pos + local;
      const seg = findSegment(spliceSegments, pt);
      let label;
      if (system === 'T14000') {
        label = markPoints.length === 1 ? 'Centerline' : idx === 0 ? 'Q1' : 'Q3';
        results.push(`• ${label} at ${roundToSixteenths(local)} → Part ${seg.part} - ${roundToSixteenths(seg.local)}`);
      } else {
        if (markPoints.length === 1) label = 'Centerline';
        else if (markPoints.length === 2) label = idx === 0 ? '2" from start' : '2" from end';
        else if (markPoints.length === 3) label = ['2" from start', 'Centerline', '2" from end'][idx];
        else label = ['2" from start', '8" from start', '8" from end', '2" from end'][idx];
        results.push(`• ${label} at ${roundToSixteenths(pt)} → Part ${seg.part} @ ${roundToSixteenths(seg.local)}`);
      }
      pointsByPart[seg.part] = pointsByPart[seg.part] || [];
      pointsByPart[seg.part].push(seg.local);
    });
    results.push('');
    pos += width + (i < bayWidths.length - 1 ? spacings[i] : 0);
  });

  results.push(system === 'T14000'
    ? '--- Summary of Quarter Points by Part ---'
    : '--- Summary of Points by Part ---');
  Object.keys(pointsByPart).sort((a, b) => a - b).forEach(part => {
    const sorted = pointsByPart[part].sort((a, b) => a - b).map(roundToSixteenths);
    const seg = spliceSegments.find(s => s.part === parseInt(part));
    const len = roundToSixteenths(seg.end - seg.start);
    results.push(`Part ${part} (Length: ${len}): ${sorted.join(' | ')}`);
  });

  const resDiv = document.getElementById(`results${system}`);
  resDiv.textContent = `Markout Results:\n\n${results.join('\n')}`;
  resDiv.classList.remove('hidden');
  const dlBtn = document.getElementById(`download${system}`);
  if (dlBtn) dlBtn.classList.remove('hidden');
}

// Wrapper functions for existing references
function calculateT14000(e) { calculate(e, 'T14000'); }
function calculateT24650(e) { calculate(e, 'T24650'); }

// Basic unit checks to verify patterns
console.log('Weep pattern checks:', {
  T14000_10: getWeepPoints('T14000', 10), // [5]
  T14000_20: getWeepPoints('T14000', 20), // [5, 15]
  T24650_6: getWeepPoints('T24650', 6),   // [3]
  T24650_10: getWeepPoints('T24650', 10), // [2, 8]
  T24650_14: getWeepPoints('T24650', 14), // [2, 7, 12]
  T24650_18: getWeepPoints('T24650', 18), // [2, 8, 10, 16]
});
