/**
 * Entry point for rendering the splice segment and mark point visualization.
 * Called from calculate.js after computing splice segments and markpoints.
 */
function visualizeMarkpoints(containerId, spliceSegments, allMarkPoints, totalRunInInches, doorLeft, doorRight) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '';
  if (!spliceSegments || spliceSegments.length === 0) return;

  const leftExtension = doorLeft ? 0 : 2.125;
  const rightExtension = doorRight ? 0 : 2.125;
  const visualTotalLength = totalRunInInches + leftExtension + rightExtension;

  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${visualTotalLength} 40`);
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '40');
  container.appendChild(svg);

  spliceSegments.forEach((segment, index) => {
    let start = segment.start;
    let end = segment.end;
    if (index === 0) start -= leftExtension;
    if (index === spliceSegments.length - 1) end += rightExtension;

    const rect = document.createElementNS(svgNS, 'rect');
    rect.setAttribute('x', start);
    rect.setAttribute('y', 10);
    rect.setAttribute('width', end - start);
    rect.setAttribute('height', 6);
    rect.setAttribute('fill', 'var(--visual-track-bg)');
    rect.setAttribute('stroke', 'var(--visual-track-border)');
    svg.appendChild(rect);

    const partLabel = document.createElementNS(svgNS, 'text');
    partLabel.setAttribute('x', (start + end) / 2);
    partLabel.setAttribute('y', 8);
    partLabel.setAttribute('text-anchor', 'middle');
    partLabel.setAttribute('fill', 'var(--text)');
    partLabel.textContent = `Part ${String.fromCharCode(65 + index)}`;
    svg.appendChild(partLabel);

    const labelBoxes = [];
    allMarkPoints
      .filter(pt => pt >= segment.start && pt <= segment.end)
      .forEach(pt => {
        const line = document.createElementNS(svgNS, 'line');
        line.setAttribute('x1', pt);
        line.setAttribute('x2', pt);
        line.setAttribute('y1', 10);
        line.setAttribute('y2', 30);
        line.setAttribute('stroke', 'var(--markpoint-color)');
        svg.appendChild(line);

        const txt = document.createElementNS(svgNS, 'text');
        txt.textContent = roundToSixteenths(pt - segment.start);
        txt.setAttribute('x', pt);
        txt.setAttribute('text-anchor', 'middle');
        txt.setAttribute('fill', 'var(--text)');

        let y = 32;
        txt.setAttribute('y', y);
        svg.appendChild(txt);
        let bbox = txt.getBBox();
        while (labelBoxes.some(b => !(bbox.x + bbox.width < b.x || b.x + b.width < bbox.x))) {
          y += 6;
          txt.setAttribute('y', y);
          bbox = txt.getBBox();
        }
        labelBoxes.push({ x: bbox.x, width: bbox.width });
      });
  });
}
