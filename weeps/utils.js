// Parse fractional or decimal input like "1 3/8" or "0.375"
function parseFractionalInput(input) {
    if (!input) return 0;
    input = input.trim();
  
    // e.g. "1 3/8"
    if (/^\d+\s+\d+\/\d+$/.test(input)) {
      const [whole, frac] = input.split(/\s+/);
      const [num, den] = frac.split('/');
      return parseInt(whole) + (parseInt(num) / parseInt(den));
    }
  
    // e.g. "3/8"
    if (/^\d+\/\d+$/.test(input)) {
      const [num, den] = input.split('/');
      return parseInt(num) / parseInt(den);
    }
  
    return parseFloat(input);
  }
  
  // Round inches to nearest sixteenth and format nicely (e.g. 36 3/8")
  function roundToSixteenths(inches) {
    const sixteenths = Math.round(inches * 16);
    const whole = Math.floor(sixteenths / 16);
    const remainder = sixteenths % 16;
  
    if (remainder === 0) return `${whole}"`;
  
    const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
    const divisor = gcd(remainder, 16);
    const num = remainder / divisor;
    const den = 16 / divisor;
  
    return whole > 0 ? `${whole} ${num}/${den}"` : `${num}/${den}"`;
  }
  
  // Create a downloadable text file and trigger the download
  function downloadTextFile(filename, content) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
  
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
  
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  
    URL.revokeObjectURL(url);
  }

function getAutoSpliceSegmentsBayMidpointsOnly(
  bayWidths,
  spacing,
  spliceGap,
  maxPartLength,
  doorLeft,
  doorRight,
  offset,
  markPointsAll
) {
  const bayCount = bayWidths.length;

  let positions = [];
  let bayCenters = [];

const initialPos = offset;
let pos = initialPos;

  for (let i = 0; i < bayCount; i++) {
    positions.push(pos);
    const center = pos + bayWidths[i] / 2;
    bayCenters.push(center);
    pos += bayWidths[i] + (i < bayCount - 1 ? spacing : 0);
  }
  const totalRun = pos + (doorRight ? 0 : 2.125) + (doorLeft ? 0 : 2.125);

  let segments = [];

  function hasClearance(candidate) {
    return markPointsAll.every(mp => Math.abs(mp - candidate) >= 6);
  }

  let segmentStart = (doorLeft ? 0 : 2.125);
  segmentStart += offset;

  while (segmentStart < totalRun) {
    // Check if remaining length fits in maxPartLength - if so, create last segment and break
    if (totalRun - segmentStart <= maxPartLength) {
      segments.push({
        part: segments.length + 1,
        start: segmentStart,
        end: totalRun
      });
      break;
    }

    // Find the furthest valid bay center for splice (must be > segmentStart)
    let nextSplice = null;
    for (const center of bayCenters) {
      if (center <= segmentStart) continue;
      if ((center - segmentStart) - spliceGap <= maxPartLength) {
        nextSplice = center;
      } else {
        break;
      }
    }

    if (!nextSplice || nextSplice >= totalRun) {
      // No valid splice found, finalize last segment
      segments.push({
        part: segments.length + 1,
        start: segmentStart,
        end: totalRun
      });
      break;
    }

    if (!hasClearance(nextSplice)) {
      const allow = confirm(`Splice at ${roundToSixteenths(nextSplice)} is less than 6" from a mark point. Allow anyway?`);
      if (!allow) {
        throw new Error(`Splice at ${roundToSixteenths(nextSplice)} rejected due to clearance.`);
      }
    }

    // Add current segment ending at splice (minus half gap)
    segments.push({
      part: segments.length + 1,
      start: segmentStart,
      end: nextSplice - spliceGap / 2
    });

    // Next segment starts after splice plus half gap
    segmentStart = nextSplice + spliceGap / 2;
  }

  // Final length check
  for (const seg of segments) {
    if (seg.end - seg.start > maxPartLength) {
      throw new Error(`Segment length ${roundToSixteenths(seg.end - seg.start)} exceeds max part length ${maxPartLength}"`);
    }
  }

  return segments;
}

