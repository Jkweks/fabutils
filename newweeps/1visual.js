function visualizeMarkpoints(containerId, spliceSegments, allMarkPoints, totalRunInInches, doorLeft, doorRight) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error("❌ Container not found:", containerId);
    return;
  }

  // Unhide container if hidden
  const visualContainer = document.getElementById('visual-container');
  if (visualContainer) {
    visualContainer.classList.remove('hidden');
  }

  // Reset contents
  container.innerHTML = '';

  // Determine visual extensions
  const leftExtension = doorLeft ? 0 : 2.125;
  const rightExtension = doorRight ? 0 : 2.125;

  const visualTotalLength = totalRunInInches + leftExtension + rightExtension;
  const containerWidth = container.offsetWidth;
  const scale = containerWidth / visualTotalLength;

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

  // Create visual track
  const track = document.createElement('div');
  track.className = 'visual-track';
  track.style.width = `${containerWidth}px`;
  container.appendChild(track);

  // Draw splice segments
  if (Array.isArray(spliceSegments)) {
    spliceSegments.forEach((segment, index) => {
      const spliceEl = document.createElement('div');
      spliceEl.className = 'splice-segment';

      // Adjust starting position for first segment
      const segmentStartInInches = index === 0 ? segment.start - leftExtension : segment.start;
      const segmentStartPx = index === 0 ? (segment.start - leftExtension)*scale : segment.start*scale;
      const segmentWidthInInches = (segment.end - segment.start);
  const segmentWidthPx = index === 0 ?  ((segment.end - segment.start)+leftExtension) * scale: (segment.end - segment.start) * scale;

      spliceEl.style.left = `${segmentStartPx}px`;
      spliceEl.style.width = `${segmentWidthPx}px`;
      track.appendChild(spliceEl);
    });
  }
// Draw markpoints and local dimension labels
if (Array.isArray(allMarkPoints) && Array.isArray(spliceSegments)) {
  allMarkPoints.forEach(pt => {
    const posInInches = pt + leftExtension;
    const leftPx = posInInches * scale;

    // Find segment this point belongs to
    let matchingSegment = null;
    for (const seg of spliceSegments) {
      if (pt >= seg.start && pt <= seg.end) {
        matchingSegment = seg;
        break;
      }
    }

    // Default to global if no match
    const localValue = matchingSegment ? pt - matchingSegment.start : pt;
    const localLabel = roundToSixteenths(localValue);

    // Markpoint line
    const mp = document.createElement('div');
    mp.className = 'markpoint';
    mp.style.left = `${leftPx}px`;
    track.appendChild(mp);

    // Label (showing local distance)
    const label = document.createElement('div');
    label.className = 'markpoint-label';
    label.style.left = `${leftPx}px`;
    label.textContent = localLabel;
    track.appendChild(label);
  });
}}
