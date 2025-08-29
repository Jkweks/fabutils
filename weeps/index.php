<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Bay Hole Calculator</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 1rem;
      background: #f9f9f9;
    }
    label {
      display: block;
      margin-top: 1rem;
      font-weight: bold;
    }
    input, select {
      width: 100%;
      padding: 0.5rem;
      margin-top: 0.25rem;
      box-sizing: border-box;
    }
    .bay-inputs {
      margin-top: 1rem;
    }
    .results {
      margin-top: 2rem;
      background: #fff;
      padding: 1rem;
      border-radius: 6px;
      box-shadow: 0 0 5px rgba(0,0,0,0.1);
    }
  </style>
</head>
<body>
  <h2>Bay Hole Position Calculator</h2>

  <label>Number of Bays</label>
  <input type="number" id="numBays" min="1" value="1" />

  <div id="bayInputs" class="bay-inputs"></div>

  <label>Door on Left</label>
  <select id="doorLeft">
    <option value="yes">Yes</option>
    <option value="no" selected>No</option>
  </select>

  <label>Door on Right</label>
  <select id="doorRight">
    <option value="yes">Yes</option>
    <option value="no" selected>No</option>
  </select>

  <label>Left Extension (inches)</label>
  <input type="text" id="leftExt" value="0" />

  <label>Right Extension (inches)</label>
  <input type="text" id="rightExt" value="0" />

  <label>Splice Gap (inches)</label>
  <input type="text" id="spliceGap" value="0" />

  <label>Mullion Width (inches)</label>
  <input type="text" id="mullionWidth" value="2" />

  <button onclick="calculatePositions()" style="margin-top: 1.5rem; padding: 0.5rem 1rem;">Calculate</button>

  <div class="results">
    <h3>Hole Positions (inches from 0):</h3>
    <pre id="output">–</pre>
    <h3>Total Length:</h3>
    <pre id="totalLength">–</pre>
  </div>

<script>
  const bayInputsContainer = document.getElementById('bayInputs');

  document.getElementById('numBays').addEventListener('input', generateBayInputs);

  function generateBayInputs() {
    const num = parseInt(document.getElementById('numBays').value);
    bayInputsContainer.innerHTML = '';
    for (let i = 0; i < num; i++) {
      const label = document.createElement('label');
      label.innerText = `Bay ${i + 1} Width (inches)`;
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'bay-width';
      input.placeholder = 'e.g. 14 or 12 3/4';
      bayInputsContainer.appendChild(label);
      bayInputsContainer.appendChild(input);
    }
  }

  function parseInches(str) {
    str = str.trim();
    if (!str) return 0;
    if (str.includes('/')) {
      const parts = str.split(' ');
      let whole = 0, frac = parts[0];
      if (parts.length === 2) {
        whole = parseFloat(parts[0]);
        frac = parts[1];
      }
      const [num, denom] = frac.split('/');
      return whole + (parseFloat(num) / parseFloat(denom));
    } else {
      return parseFloat(str);
    }
  }

function toFractionalInch(decimalInch) {
  const whole = Math.floor(decimalInch);
  const frac = decimalInch - whole;

  const preferredFractions = [
    { denominator: 2, text: '1/2' },
    { denominator: 4, text: '1/4' },
    { denominator: 4, text: '3/4' },
    { denominator: 8, text: '1/8' },
    { denominator: 8, text: '3/8' },
    { denominator: 8, text: '5/8' },
    { denominator: 8, text: '7/8' },
    { denominator: 16, text: '1/16' },
    { denominator: 16, text: '3/16' },
    { denominator: 16, text: '5/16' },
    { denominator: 16, text: '7/16' },
    { denominator: 16, text: '9/16' },
    { denominator: 16, text: '11/16' },
    { denominator: 16, text: '13/16' },
    { denominator: 16, text: '15/16' },
  ];

  let closest = null;
  let minDiff = Infinity;

  for (let f of preferredFractions) {
    const value = eval(f.text); // e.g., 3/4 = 0.75
    const diff = Math.abs(frac - value);
    if (diff < minDiff) {
      minDiff = diff;
      closest = f;
    }
  }

  const approx = eval(closest.text);
  let resultWhole = whole;
  let resultFraction = closest.text;

  // If rounding pushes to next inch
  if (Math.abs(frac - 1) < Math.abs(frac - approx)) {
    resultWhole += 1;
    return `${resultWhole}`;
  }

  // No fraction part
  if (Math.abs(frac - 0) < 0.03125 || closest.text === '0/16') {
    return `${resultWhole}`;
  }

  return `${resultWhole} ${closest.text}`;
}

function calculatePositions() {
  const bayInputs = document.querySelectorAll('.bay-width');
  const bayWidths = Array.from(bayInputs).map(input => parseInches(input.value));
  const doorLeft = document.getElementById('doorLeft').value === 'yes';
  const doorRight = document.getElementById('doorRight').value === 'yes';
  const leftExt = parseInches(document.getElementById('leftExt').value);
  const rightExt = parseInches(document.getElementById('rightExt').value);
  const spliceGap = parseInches(document.getElementById('spliceGap').value);
  const mullion = parseInches(document.getElementById('mullionWidth').value);
  const MAX_LENGTH = 288;

  // Build bays with mullions as needed
  const bays = bayWidths.map((width, i) => ({
    width,
    index: i,
  }));

  // Calculate total frame length (bays + mullions on ends + between bays)
  const totalMullionsCount = bayWidths.length + 1;
  const totalMullionsLength = mullion * totalMullionsCount;
  const totalFrameLength = bayWidths.reduce((a, b) => a + b, 0) + totalMullionsLength + leftExt + rightExt;

  // Split into segments
  let segments = [];
  let currentSegment = {
    bays: [],
    length: 0,
  };

  let lengthAccum = 0; // length of bays + mullions in current segment

  for (let i = 0; i < bays.length; i++) {
    // Length of this bay + mullion to its right (except last bay mullion)
    let bayPlusMullion = bays[i].width + mullion;

    // If first bay, add mullion on left as well (except door left)
    if (i === 0 && !doorLeft) {
      bayPlusMullion += mullion;
    }

    // Check if adding this bay exceeds max segment length
    if (lengthAccum + bayPlusMullion > MAX_LENGTH && currentSegment.bays.length > 0) {
      // Finalize current segment
      segments.push({...currentSegment, length: lengthAccum});
      currentSegment = {bays: [], length: 0};
      lengthAccum = 0;
    }

    currentSegment.bays.push(bays[i]);
    lengthAccum += bayPlusMullion;
  }

  // Push last segment
  segments.push({...currentSegment, length: lengthAccum});

  // Now apply splice gap trimming:
  // Each internal segment is trimmed by half the splice gap at its end.
  // So segment length -= spliceGap / 2 for all except last segment
  // The last segment also trimmed at the start by spliceGap / 2 to keep total length correct.
  // For simplicity, trim all segments by spliceGap / 2 except first segment's start is zero
  // and last segment trimmed at end by spliceGap / 2 as well.

  const halfSplice = spliceGap / 2;

  // Calculate adjusted segment lengths:
  // First segment trimmed only at end (-halfSplice)
  // Middle segments trimmed at start and end (-spliceGap)
  // Last segment trimmed only at start (-halfSplice)
  // If only one segment, no trimming

  let adjustedSegments = [];

  if (segments.length === 1) {
    adjustedSegments = [{...segments[0], adjustedLength: segments[0].length}];
  } else {
    for (let i = 0; i < segments.length; i++) {
      let segLen = segments[i].length;
      if (i === 0) {
        segLen -= halfSplice; // trim end only
      } else if (i === segments.length - 1) {
        segLen -= halfSplice; // trim start only
      } else {
        segLen -= spliceGap; // trim both ends
      }
      adjustedSegments.push({...segments[i], adjustedLength: segLen});
    }
  }

  // Now calculate hole positions for each segment, offset holes by trimming amount at start
  // For first segment, offset holes by 0
  // For other segments, offset holes by halfSplice (start trim)

  let outputText = '';
  let segmentStartGlobal = leftExt + (!doorLeft ? mullion : 0);

  adjustedSegments.forEach((seg, i) => {
    outputText += `🔹 Segment ${i + 1} (length: ${seg.adjustedLength.toFixed(3)}")\n`;

    let localPos = 0;
    const holes = [];
    const startTrim = i === 0 ? 0 : halfSplice; // trim at segment start for segments after first

    for (let b = 0; b < seg.bays.length; b++) {
      const bay = seg.bays[b];

      // Add mullion before bay except for first bay of first segment or if door on left
      if (!(i === 0 && b === 0 && doorLeft)) {
        localPos += mullion;
      }

      // Apply start trim offset only once per segment at start (already factored into startTrim)
      let bayStart = localPos;

      // Adjust bayStart by subtracting startTrim to reflect trimmed segment start
      bayStart -= startTrim;

      // Hole positions
      if (bay.width < 12) {
        holes.push(toFractionalInch(bayStart + bay.width * 0.25));
      } else {
        holes.push(toFractionalInch(bayStart + bay.width * 0.25));
        holes.push(toFractionalInch(bayStart + bay.width * 0.75));
      }

      localPos += bay.width;
    }

    outputText += `   Holes: ${holes.join('", "')}"\n\n`;

    // Update global start for next segment: add segment adjusted length + splice gap
    // The splice gap physically exists as a gap between segments, but is not included in segment length.
    segmentStartGlobal += seg.adjustedLength + spliceGap;
  });

  // Total length remains constant regardless of splice gap:
  const totalLength = totalFrameLength;

  document.getElementById('output').innerText = outputText.trim();
  document.getElementById('totalLength').innerText = totalLength.toFixed(3) + '"';
}

// function calculatePositions() {
//   const bayInputs = document.querySelectorAll('.bay-width');
//   const bayWidths = Array.from(bayInputs).map(input => parseInches(input.value));
//   const doorLeft = document.getElementById('doorLeft').value === 'yes';
//   const doorRight = document.getElementById('doorRight').value === 'yes';
//   const leftExt = parseInches(document.getElementById('leftExt').value);
//   const rightExt = parseInches(document.getElementById('rightExt').value);
//   const spliceGap = parseInches(document.getElementById('spliceGap').value);
//   const mullion = parseInches(document.getElementById('mullionWidth').value);
//   const MAX_LENGTH = 288;

//   let segments = [];
//   let currentSegment = {
//     bays: [],
//     length: 0,
//     startOffset: 0,
//   };

//   let globalPosition = leftExt + (!doorLeft ? mullion : 0);
//   let segmentLength = 0;
//   let totalSpliceGaps = 0;

//   for (let i = 0; i < bayWidths.length; i++) {
//     const isFirstBay = i === 0;
//     const isLastBay = i === bayWidths.length - 1;
//     const bay = {
//       width: bayWidths[i],
//       index: i,
//       includeMullion: !(isLastBay && doorRight)
//     };

//     let bayLength = bay.width;
//     if (!(isFirstBay && doorLeft)) {
//       bayLength += mullion;
//     }

//     if ((segmentLength + bayLength) <= MAX_LENGTH || currentSegment.bays.length === 0) {
//       currentSegment.bays.push(bay);
//       segmentLength += bayLength;
//     } else {
//       // Finalize current segment
//       currentSegment.length = segmentLength;
//       segments.push(currentSegment);

//       totalSpliceGaps += spliceGap;
//       globalPosition += spliceGap;

//       currentSegment = {
//         bays: [bay],
//         length: bayLength,
//         startOffset: globalPosition,
//       };
//       segmentLength = bayLength;
//     }

//     globalPosition += bay.width;
//     if (bay.includeMullion) {
//       globalPosition += mullion;
//     }
//   }

//   // Push the last segment
//   currentSegment.length = segmentLength;
//   segments.push(currentSegment);

//   // Total frame length = end + right extension + total splice gaps
//   let totalLength = globalPosition + rightExt + totalSpliceGaps;

//   // Calculate hole positions relative to each segment
//   let outputText = '';

//   segments.forEach((seg, i) => {
//     outputText += `🔹 Segment ${i + 1} (length: ${seg.length.toFixed(3)}")\n`;

//     let localPos = 0;
//     let holes = [];

//     for (let b = 0; b < seg.bays.length; b++) {
//       const bay = seg.bays[b];

//       if (!(i === 0 && b === 0 && doorLeft)) {
//         localPos += mullion;
//       }

//       const bayStart = localPos;

//       if (bay.width < 12) {
//         holes.push((bayStart + bay.width / 2).toFixed(3));
//       } else {
//         holes.push((bayStart + bay.width * 0.25).toFixed(3));
//         holes.push((bayStart + bay.width * 0.75).toFixed(3));
//       }

//       localPos += bay.width;
//     }

//     outputText += `   Holes: ${holes.join('", "')}"\n\n`;
//   });

//   document.getElementById('output').innerText = outputText.trim();
//   document.getElementById('totalLength').innerText = totalLength.toFixed(3) + '"';
// }

  generateBayInputs(); // Initialize on load
</script>

</body>
</html>
