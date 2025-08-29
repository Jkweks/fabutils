// function findSegment(segments, point, doorLeft) {
//   const epsilon = 0.005; // small margin for floating point rounding

//   for (const seg of segments) {
//     console.log(
//       `Checking segment ${seg.part}:`,
//       `start=${seg.start.toFixed(3)}, end=${seg.end.toFixed(3)}, point=${point.toFixed(3)}`
//     );

//     if (point >= seg.start - epsilon && point <= seg.end + epsilon) {
//       console.log(`✔ Found in segment ${seg.part}, local position = ${(point - seg.start).toFixed(3)}`);
//       return {
//         part: seg.part,
//         local: point - seg.start,
//       };
//     }
//   }

//   console.warn(`❌ Point ${point.toFixed(3)} not found in any segment`);
//   throw new Error(`Point ${roundToSixteenths(point)} not found in any segment.`);
// }


// function calculateT14000(e) {
//   e.preventDefault();

//   const spacingInput = document.getElementById('spacingT14000');
//   const spliceGapInput = document.getElementById('spliceGapT14000');
//   const doorLeftInput = document.getElementById('doorLeftT14000');
//   const doorRightInput = document.getElementById('doorRightT14000');
//   const manualSpliceInput = document.getElementById('useManualSpliceT14000');
//   const offsetInput = document.getElementById('trackOffsetT14000');
//   const bayInputs = [...document.querySelectorAll('#bayInputsT14000 input')];
//   const maxPartLength = 288;

//   if (!spacingInput || !spliceGapInput || !doorLeftInput || !doorRightInput || !manualSpliceInput || !offsetInput) {
//     alert('Some input fields are missing in the form.');
//     return;
//   }

//   const spacing = parseFractionalInput(spacingInput.value) || 0;
//   const spliceGap = parseFractionalInput(spliceGapInput.value) || 0;
//   const doorLeft = doorLeftInput.checked;
//   const doorRight = doorRightInput.checked;
//   const useManualSplice = manualSpliceInput.checked;
//   const offset = parseFractionalInput(offsetInput.value) || 0;

//   if (!bayInputs.length) {
//     alert('Please enter number of bays and click Next first.');
//     return;
//   }

//   let bayWidths;
//   try {
//     bayWidths = bayInputs.map(inp => {
//       const val = parseFractionalInput(inp.value);
//       if (isNaN(val) || val <= 0) {
//         alert('Please enter valid positive numbers for bay widths.');
//         throw new Error('Invalid bay width');
//       }
//       return val;
//     });
//   } catch {
//     return;
//   }

//   const allMarkPoints = [];
//   let pos = doorLeft ? 0 : 2.125;
//   pos += offset;

//   bayWidths.forEach((width) => {
//     if (width <= 12) {
//       allMarkPoints.push(pos + width / 2);
//     } else {
//       allMarkPoints.push(pos + width * 0.25);
//       allMarkPoints.push(pos + width * 0.75);
//     }
//     pos += width + spacing;
//   });

//   const totalRun = bayWidths.reduce((a, b) => a + b, 0) + spacing * (bayWidths.length - 1);
//   let spliceSegments;

//   try {
//     if (useManualSplice) {
//       spliceSegments = getManualSpliceSegments('T14000', spliceGap);
//       const manualTotal = spliceSegments.reduce((a, seg, i) =>
//         a + (seg.end - seg.start) + (i < spliceSegments.length - 1 ? spliceGap : 0), 0);
//       if (manualTotal + 0.001 < totalRun) {
//         alert(`Warning: Manual splices total ${manualTotal.toFixed(3)}, less than total run ${totalRun.toFixed(3)}.`);
//       }
//     } else {
//       spliceSegments = getAutoSpliceSegmentsBayMidpointsOnly(
//         bayWidths,
//         spacing,
//         spliceGap,
//         maxPartLength,
//         doorLeft,
//         doorRight,
//         offset,
//         allMarkPoints
//       );
//     }
//   } catch (ex) {
//     alert('Error calculating splice segments: ' + ex.message);
//     return;
//   }

//   const results = [];
//   const quarterPointsByPart = {};
//   pos = doorLeft ? 0 : 2.125;
//   pos += offset;

//   visualizeMarkpoints('markpointVisualizer', spliceSegments, allMarkPoints, totalRun, doorLeft, doorRight);

//   bayWidths.forEach((width, i) => {
//     if (width <= 12) {
//       const center = pos + width / 2;
//       const seg = findSegment(spliceSegments, center);
//       results.push(`Bay ${i + 1}:`, `• Centerline at ${roundToSixteenths(center)} → Part ${seg.part} @ ${roundToSixteenths(seg.local)}`, '');
//       quarterPointsByPart[seg.part] = quarterPointsByPart[seg.part] || [];
//       quarterPointsByPart[seg.part].push(seg.local);
//     } else {
//       const q1 = pos + width * 0.25;
//       const q3 = pos + width * 0.75;
//       const seg1 = findSegment(spliceSegments, q1);
//       const seg3 = findSegment(spliceSegments, q3);
//       results.push(`Bay ${i + 1}:`,
//         `• Q1 at ${roundToSixteenths(q1)} → Part ${seg1.part} @ ${roundToSixteenths(seg1.local)}`,
//         `• Q3 at ${roundToSixteenths(q3)} → Part ${seg3.part} @ ${roundToSixteenths(seg3.local)}`, '');
//       quarterPointsByPart[seg1.part] = quarterPointsByPart[seg1.part] || [];
//       quarterPointsByPart[seg3.part] = quarterPointsByPart[seg3.part] || [];
//       quarterPointsByPart[seg1.part].push(seg1.local);
//       quarterPointsByPart[seg3.part].push(seg3.local);
//     }
//     pos += width + (i < bayWidths.length - 1 ? spacing : 0);
//   });

//   results.push('--- Summary of Quarter Points by Part ---');
//   Object.keys(quarterPointsByPart).sort((a, b) => a - b).forEach(part => {
//     const sorted = quarterPointsByPart[part].sort((a, b) => a - b).map(roundToSixteenths);
//     results.push(`Part ${part}: ${sorted.join(' | ')}`);
//   });

// results.push('\n--- Splice Segment Lengths ---');
// spliceSegments.forEach((seg, i) => {
//   const length = i === 0
//     ? seg.end  // First part: show from 0 to end
//     : seg.end - seg.start;
//   results.push(`Part ${seg.part}: ${roundToSixteenths(length)}`);
// });


//   const resDiv = document.getElementById('resultsT14000');
//   resDiv.textContent = `Markout Results:\n\n${results.join('\n')}`;
//   resDiv.classList.remove('hidden');
// }

// function calculateT24650(e) {
//   e.preventDefault();

//   const spacing = parseFractionalInput(document.getElementById('spacingT24650').value) || 0;
//   const spliceGap = parseFractionalInput(document.getElementById('spliceGapT24650').value) || 0;
//   const doorLeft = document.getElementById('doorLeftT24650').checked;
//   const doorRight = document.getElementById('doorRightT24650').checked;
//   const useManualSplice = document.getElementById('useManualSpliceT24650').checked;
//   const offset = parseFractionalInput(document.getElementById('trackOffsetT24650').value) || 0;

//   const maxPartLength = 288;
//   const bayInputs = [...document.querySelectorAll('#bayInputsT24650 input')];

//   if (!bayInputs.length) {
//     alert('Please enter number of bays and click Next first.');
//     return;
//   }

//   let bayWidths;
//   try {
//     bayWidths = bayInputs.map(inp => {
//       const val = parseFractionalInput(inp.value);
//       if (isNaN(val) || val <= 0) {
//         alert('Please enter valid positive numbers for bay widths.');
//         throw new Error('Invalid bay width');
//       }
//       return val;
//     });
//   } catch {
//     return;
//   }

//   const allMarkPoints = [];
//   let pos = doorLeft ? 0 : 2.125;
//   pos += offset;

//   bayWidths.forEach((width) => {
//     if (width < 8) {
//       allMarkPoints.push(pos + width / 2);
//     } else if (width < 12) {
//       allMarkPoints.push(pos + 2);
//       allMarkPoints.push(pos + width - 2);
//     } else if (width <= 16) {
//       allMarkPoints.push(pos + 2);
//       allMarkPoints.push(pos + width - 2);
//       allMarkPoints.push(pos + width / 2);
//     } else {
//       allMarkPoints.push(pos + 2);
//       allMarkPoints.push(pos + 8);
//       allMarkPoints.push(pos + width - 8);
//       allMarkPoints.push(pos + width - 2);
//     }
//     pos += width + spacing;
//   });

//   const totalRun = bayWidths.reduce((a, b) => a + b, 0) + spacing * (bayWidths.length - 1);
//   let spliceSegments;

//   try {
//     if (useManualSplice) {
//       spliceSegments = getManualSpliceSegments('T24650', spliceGap);
//       const manualTotal = spliceSegments.reduce((a, seg, i) =>
//         a + (seg.end - seg.start) + (i < spliceSegments.length - 1 ? spliceGap : 0), 0);
//       if (manualTotal + 0.001 < totalRun) {
//         alert(`Warning: Manual splices total ${manualTotal.toFixed(3)}, less than total run ${totalRun.toFixed(3)}.`);
//       }
//     } else {
//       spliceSegments = getAutoSpliceSegmentsBayMidpointsOnly(
//         bayWidths,
//         spacing,
//         spliceGap,
//         maxPartLength,
//         doorLeft,
//         doorRight,
//         offset,
//         allMarkPoints
//       );
//     }
//   } catch (ex) {
//     alert('Error calculating splice segments: ' + ex.message);
//     return;
//   }

//   const results = [];
//   const pointsByPart = {};
//   pos = doorLeft ? 0 : 2.125;
//   pos += offset;

//   bayWidths.forEach((width, i) => {
//     results.push(`Bay ${i + 1}:`);
//     let markPoints = [];

//     if (width < 8) {
//       markPoints = [pos + width / 2];
//     } else if (width < 12) {
//       markPoints = [pos + 2, pos + width - 2];
//     } else if (width <= 16) {
//       markPoints = [pos + 2, pos + width - 2, pos + width / 2];
//     } else {
//       markPoints = [pos + 2, pos + 8, pos + width - 8, pos + width - 2];
//     }
    
//     visualizeMarkpoints('markpointVisualizer', spliceSegments, allMarkPoints, totalRun, doorLeft, doorRight);

//     markPoints.forEach((pt, idx) => {
//       const desc = ['2"', '8"', '8"', '2"'][idx] || 'Center';
//       const side = ['start', 'start', 'end', 'end'][idx] || '';
//       const label = side ? `${desc} from ${side}` : 'Centerline';

//       const seg = findSegment(spliceSegments, pt);
//       results.push(`• ${label} at ${roundToSixteenths(pt)} → Part ${seg.part} @ ${roundToSixteenths(seg.local)}`);
//       pointsByPart[seg.part] = pointsByPart[seg.part] || [];
//       pointsByPart[seg.part].push(seg.local);
//     });

//     results.push('');
//     pos += width + (i < bayWidths.length - 1 ? spacing : 0);
//   });

//   results.push('--- Summary of Points by Part ---');
//   Object.keys(pointsByPart).sort((a, b) => a - b).forEach(part => {
//     const sorted = pointsByPart[part].sort((a, b) => a - b).map(roundToSixteenths);
//     results.push(`Part ${part}: ${sorted.join(' | ')}`);
//   });

// results.push('\n--- Splice Segment Lengths ---');
// spliceSegments.forEach((seg, i) => {
//   const length = i === 0
//     ? seg.end  // First part: show from 0 to end
//     : seg.end - seg.start;
//   results.push(`Part ${seg.part}: ${roundToSixteenths(length)}`);
// });

//   const resDiv = document.getElementById('resultsT24650');
//   resDiv.textContent = `Markout Results:\n\n${results.join('\n')}`;
//   resDiv.classList.remove('hidden');
// }


//____________________________________

function findSegment(segments, point, doorLeft) {
  const epsilon = 0.005; // small margin for floating point rounding

  for (const seg of segments) {
    console.log(
      `Checking segment ${seg.part}:`,
      `start=${seg.start.toFixed(3)}, end=${seg.end.toFixed(3)}, point=${point.toFixed(3)}`
    );

    if (point >= seg.start - epsilon && point <= seg.end + epsilon) {
      console.log(`✔ Found in segment ${seg.part}, local position = ${(point - seg.start).toFixed(3)}`);
      return {
        part: seg.part,
        local: point - seg.start,
      };
    }
  }

  console.warn(`❌ Point ${point.toFixed(3)} not found in any segment`);
  throw new Error(`Point ${roundToSixteenths(point)} not found in any segment.`);
}


function calculateT14000(e) {
  e.preventDefault();

  const spacingInput = document.getElementById('spacingT14000');
  const spliceGapInput = document.getElementById('spliceGapT14000');
  const doorLeftInput = document.getElementById('doorLeftT14000');
  const doorRightInput = document.getElementById('doorRightT14000');
  const manualSpliceInput = document.getElementById('useManualSpliceT14000');
  const offsetInput = document.getElementById('trackOffsetT14000');
  const bayInputs = [...document.querySelectorAll('#bayInputsT14000 input')];
  const maxPartLength = 288;

  if (!spacingInput || !spliceGapInput || !doorLeftInput || !doorRightInput || !manualSpliceInput || !offsetInput) {
    alert('Some input fields are missing in the form.');
    return;
  }

  const spacing = parseFractionalInput(spacingInput.value) || 0;
  const spliceGap = parseFractionalInput(spliceGapInput.value) || 0;
  const doorLeft = doorLeftInput.checked;
  const doorRight = doorRightInput.checked;
  const useManualSplice = manualSpliceInput.checked;
  const offset = parseFractionalInput(offsetInput.value) || 0;

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

  const allMarkPoints = [];
  let pos = doorLeft ? 0 : 2.125;
  pos += offset;

  bayWidths.forEach((width) => {
    if (width <= 12) {
      allMarkPoints.push(pos + width / 2);
    } else {
      allMarkPoints.push(pos + width * 0.25);
      allMarkPoints.push(pos + width * 0.75);
    }
    pos += width + spacing;
  });

  const totalRun = bayWidths.reduce((a, b) => a + b, 0) + spacing * (bayWidths.length - 1);
  let spliceSegments;


//   try {
//     if (useManualSplice) {
//       const manualSplicesStr = document.getElementById('manualSplicesT14000')?.value || '';
// const manualSplices = manualSplicesStr
//   .split(',')
//   .map(s => parseFractionalInput(s.trim()))
//   .filter(val => !isNaN(val));

// spliceSegments = getManualSpliceSegments(manualSplices, manualSplicesStr, totalRun, spliceGap);

//       const manualTotal = spliceSegments.reduce((a, seg, i) =>
//         a + (seg.end - seg.start) + (i < spliceSegments.length - 1 ? spliceGap : 0), 0);
//       if (manualTotal + 0.001 < totalRun) {
//         alert(`Warning: Manual splices total ${manualTotal.toFixed(3)}, less than total run ${totalRun.toFixed(3)}.`);
//       }
//     } else {
//       spliceSegments = getAutoSpliceSegmentsBayMidpointsOnly(
//         bayWidths,
//         spacing,
//         spliceGap,
//         maxPartLength,
//         doorLeft,
//         doorRight,
//         offset,
//         allMarkPoints
//       );
//     }

// } catch (ex) {
//     alert('Error calculating splice segments: ' + ex.message);
//     return;
//   }

if (useManualSplice) {
  spliceSegments = getManualSpliceSegments('T14000', totalRun, spliceGap);
  const manualTotal = spliceSegments.reduce(
    (a, seg, i) =>
      a + (seg.end - seg.start) + (i < spliceSegments.length - 1 ? spliceGap : 0),
    0
  );
  if (manualTotal + 0.001 < totalRun) {
    alert(
      `Warning: Manual splices total ${manualTotal.toFixed(3)}, less than total run ${totalRun.toFixed(3)}.`
    );
  }
} else {
  spliceSegments = getAutoSpliceSegmentsBayMidpointsOnly(
    bayWidths,
    spacing,
    spliceGap,
    maxPartLength,
    doorLeft,
    doorRight,
    offset,
    allMarkPoints
  );
}


  const results = [];
  const quarterPointsByPart = {};
  pos = doorLeft ? 0 : 2.125;
  pos += offset;

// console.log("🪚 Splice Gap:", spliceGap);
// console.log("📦 Generated Splice Segments:", spliceSegments);
// spliceSegments.forEach(seg => {
//   console.log(`  ▶️ Part ${seg.part}: ${seg.start}" to ${seg.end}" (${(seg.end - seg.start).toFixed(3)}")`);
// });
// console.groupEnd();



  visualizeMarkpoints('markpointVisualizer', spliceSegments, allMarkPoints, totalRun, doorLeft, doorRight);

  bayWidths.forEach((width, i) => {
    if (width <= 12) {
      const center = pos + width / 2;
      const seg = findSegment(spliceSegments, center);
      results.push(`Bay ${i + 1}:`, `• Centerline at ${roundToSixteenths(center)} → Part ${seg.part} @ ${roundToSixteenths(seg.local)}`, '');
      quarterPointsByPart[seg.part] = quarterPointsByPart[seg.part] || [];
      quarterPointsByPart[seg.part].push(seg.local);
    } else {
      const q1 = pos + width * 0.25;
      const q3 = pos + width * 0.75;
      const seg1 = findSegment(spliceSegments, q1);
      const seg3 = findSegment(spliceSegments, q3);
      results.push(`Bay ${i + 1}:`,
        `• Q1 at ${roundToSixteenths(q1)} → Part ${seg1.part} @ ${roundToSixteenths(seg1.local)}`,
        `• Q3 at ${roundToSixteenths(q3)} → Part ${seg3.part} @ ${roundToSixteenths(seg3.local)}`, '');
      quarterPointsByPart[seg1.part] = quarterPointsByPart[seg1.part] || [];
      quarterPointsByPart[seg3.part] = quarterPointsByPart[seg3.part] || [];
      quarterPointsByPart[seg1.part].push(seg1.local);
      quarterPointsByPart[seg3.part].push(seg3.local);
    }
    pos += width + (i < bayWidths.length - 1 ? spacing : 0);
  });

  results.push('--- Summary of Quarter Points by Part ---');
  Object.keys(quarterPointsByPart).sort((a, b) => a - b).forEach(part => {
    const sorted = quarterPointsByPart[part].sort((a, b) => a - b).map(roundToSixteenths);
    results.push(`Part ${part}: ${sorted.join(' | ')}`);
  });

results.push('\n--- Splice Segment Lengths ---');
spliceSegments.forEach((seg, i) => {
  const length = i === 0
    ? seg.end  // First part: show from 0 to end
    : seg.end - seg.start;
  results.push(`Part ${seg.part}: ${roundToSixteenths(length)}`);
});


  const resDiv = document.getElementById('resultsT14000');
  resDiv.textContent = `Markout Results:\n\n${results.join('\n')}`;
  resDiv.classList.remove('hidden');
}

function calculateT24650(e) {
  e.preventDefault();

  const spacing = parseFractionalInput(document.getElementById('spacingT24650').value) || 0;
  const spliceGap = parseFractionalInput(document.getElementById('spliceGapT24650').value) || 0;
  const doorLeft = document.getElementById('doorLeftT24650').checked;
  const doorRight = document.getElementById('doorRightT24650').checked;
  const useManualSplice = document.getElementById('useManualSpliceT24650').checked;
  const offset = parseFractionalInput(document.getElementById('trackOffsetT24650').value) || 0;

  const maxPartLength = 288;
  const bayInputs = [...document.querySelectorAll('#bayInputsT24650 input')];

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

  const allMarkPoints = [];
  let pos = doorLeft ? 0 : 2.125;
  pos += offset;

  bayWidths.forEach((width) => {
    if (width < 8) {
      allMarkPoints.push(pos + width / 2);
    } else if (width < 12) {
      allMarkPoints.push(pos + 2);
      allMarkPoints.push(pos + width - 2);
    } else if (width <= 16) {
      allMarkPoints.push(pos + 2);
      allMarkPoints.push(pos + width - 2);
      allMarkPoints.push(pos + width / 2);
    } else {
      allMarkPoints.push(pos + 2);
      allMarkPoints.push(pos + 8);
      allMarkPoints.push(pos + width - 8);
      allMarkPoints.push(pos + width - 2);
    }
    pos += width + spacing;
  });

  const totalRun = bayWidths.reduce((a, b) => a + b, 0) + spacing * (bayWidths.length - 1);
  let spliceSegments;

  try {
    if (useManualSplice) {
      spliceSegments = getManualSpliceSegments('T24650', totalRun, spliceGap);
      const manualTotal = spliceSegments.reduce((a, seg, i) =>
        a + (seg.end - seg.start) + (i < spliceSegments.length - 1 ? spliceGap : 0), 0);
      if (manualTotal + 0.001 < totalRun) {
        alert(`Warning: Manual splices total ${manualTotal.toFixed(3)}, less than total run ${totalRun.toFixed(3)}.`);
      }
    } else {
      spliceSegments = getAutoSpliceSegmentsBayMidpointsOnly(
        bayWidths,
        spacing,
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

  bayWidths.forEach((width, i) => {
    results.push(`Bay ${i + 1}:`);
    let markPoints = [];

    if (width < 8) {
      markPoints = [pos + width / 2];
    } else if (width < 12) {
      markPoints = [pos + 2, pos + width - 2];
    } else if (width <= 16) {
      markPoints = [pos + 2, pos + width - 2, pos + width / 2];
    } else {
      markPoints = [pos + 2, pos + 8, pos + width - 8, pos + width - 2];
    }
    
    visualizeMarkpoints('markpointVisualizer', spliceSegments, allMarkPoints, totalRun, doorLeft, doorRight);

    markPoints.forEach((pt, idx) => {
      const desc = ['2"', '8"', '8"', '2"'][idx] || 'Center';
      const side = ['start', 'start', 'end', 'end'][idx] || '';
      const label = side ? `${desc} from ${side}` : 'Centerline';

      const seg = findSegment(spliceSegments, pt);
      results.push(`• ${label} at ${roundToSixteenths(pt)} → Part ${seg.part} @ ${roundToSixteenths(seg.local)}`);
      pointsByPart[seg.part] = pointsByPart[seg.part] || [];
      pointsByPart[seg.part].push(seg.local);
    });

    results.push('');
    pos += width + (i < bayWidths.length - 1 ? spacing : 0);
  });

  results.push('--- Summary of Points by Part ---');
  Object.keys(pointsByPart).sort((a, b) => a - b).forEach(part => {
    const sorted = pointsByPart[part].sort((a, b) => a - b).map(roundToSixteenths);
    results.push(`Part ${part}: ${sorted.join(' | ')}`);
  });

results.push('\n--- Splice Segment Lengths ---');
spliceSegments.forEach((seg, i) => {
  const length = i === 0
    ? seg.end  // First part: show from 0 to end
    : seg.end - seg.start;
  results.push(`Part ${seg.part}: ${roundToSixteenths(length)}`);
});

  const resDiv = document.getElementById('resultsT24650');
  resDiv.textContent = `Markout Results:\n\n${results.join('\n')}`;
  resDiv.classList.remove('hidden');
}

