/**
 * Entry point for rendering the splice segment and mark point visualization.
 * Called from calculate.js after computing splice segments and markpoints.
 */
function visualizeMarkpoints(containerId, spliceSegments, allMarkPoints, totalRunInInches, doorLeft, doorRight) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error("❌ Container not found:", containerId);
    return;
  }

  // Handle missing data
  const visualContainer = document.getElementById('visual-container');
  if (!spliceSegments || spliceSegments.length === 0) {
    if (visualContainer) {
      visualContainer.classList.add('hidden');
    }
    container.innerHTML = '';
    return;
  }

  // Unhide visual container
  if (visualContainer) {
    visualContainer.classList.remove('hidden');
  }

  // Reset contents
  container.innerHTML = '';

  // Extensions
  const leftExtension = doorLeft ? 0 : 2.125;
  const rightExtension = doorRight ? 0 : 2.125;

  const visualTotalLength = totalRunInInches + leftExtension + rightExtension;
  const containerWidth = container.offsetWidth;

  // Scale so entire run fits within container (~95%)
  const scale = (containerWidth * 0.95) / visualTotalLength;

  // 🪵 Debug logging
  console.group("🔍 Markpoint Visualizer Debug");
  console.log("📌 containerId:", containerId);
  console.log("📏 totalRunInInches:", totalRunInInches);
  console.log("📐 doorLeft:", doorLeft);
  console.log("📐 doorRight:", doorRight);
  console.log("➕ leftExtension:", leftExtension);
  console.log("➕ rightExtension:", rightExtension);
  console.log("📏 visualTotalLength:", visualTotalLength);
  console.log("📦 containerWidth (px):", containerWidth);
  console.log("📊 scale (px per inch):", scale);
  console.log("📍 Markpoints:", allMarkPoints);
  console.log("📦 Splice Segments:", spliceSegments);
  console.groupEnd();

  // Create visual for each splice segment
  spliceSegments.forEach((segment, index) => {
    const partLetter = String.fromCharCode(65 + index); // A, B, C...
    const isFirst = index === 0;
    const isLast = index === spliceSegments.length - 1;

    // Segment container
    const segmentDiv = document.createElement('div');
    segmentDiv.className = 'segment-container';

    // Segment label (e.g., Part A)
    const label = document.createElement('div');
    label.className = 'segment-label';
    label.textContent = `Part ${partLetter}`;
    segmentDiv.appendChild(label);

    // Track visual bar
    const track = document.createElement('div');
    track.className = 'visual-track';

    let segmentStart = segment.start;
    let segmentEnd = segment.end;
    if (isFirst) {
      segmentStart -= leftExtension;
    }
    if (isLast) {
      segmentEnd += rightExtension;
    }
    const segmentLengthInches = segmentEnd - segmentStart;
    track.style.width = `${segmentLengthInches * scale}px`;
    track.style.position = 'relative';

    // Add markpoints
    allMarkPoints.forEach((pt) => {
      if (pt >= segment.start && pt <= segment.end) {
        const offsetInInches = pt - segmentStart;
        const posPx = offsetInInches * scale;

        const mark = document.createElement('div');
        mark.className = 'markpoint';
        mark.style.left = `${posPx}px`;
        track.appendChild(mark);

        const lbl = document.createElement('div');
        lbl.className = 'markpoint-label';
        lbl.style.left = `${posPx}px`;
        lbl.textContent = roundToSixteenths(pt - segment.start);
        track.appendChild(lbl);
      }
    });

    segmentDiv.appendChild(track);
    container.appendChild(segmentDiv);
  });
}
