
<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Cap Splice Calculator</title>
  <link rel="stylesheet" href="css/style.css" />
  <style>
    :root {
      --button-bg: #2563eb;
      --button-hover-bg: #1d4ed8;
      --button-text: #fff;
      --border: #ccc;
      --column-bg: #f0f0f0;
    }
    [data-theme="dark"] {
      --border: #444;
      --column-bg: #2a2a2a;
    }
    body {
      font-family: sans-serif;
      padding: 2rem;
      background: var(--bg);
      color: var(--text);
      display: block;
    }
    textarea {
      width: 100%;
      height: 200px;
      margin-bottom: 1rem;
      font-size: 1rem;
      padding: 0.5rem;
      background: var(--card-bg);
      color: var(--text);
      border: 1px solid var(--border);
    }
    button {
      padding: 0.75rem 1.5rem;
      background: var(--button-bg);
      color: var(--button-text);
      border: none;
      border-radius: 0.375rem;
      cursor: pointer;
      margin-right: 1rem;
    }
    button:hover {
      background: var(--button-hover-bg);
    }
    .results {
      margin-top: 2rem;
      background: var(--card-bg);
      padding: 1rem;
      border-radius: 0.5rem;
      box-shadow: 0 0 10px var(--shadow);
    }
    .result-group {
      margin-bottom: 2rem;
      page-break-inside: avoid;
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 1rem;
    }
    ul {
      margin: 0.5rem 0;
      padding-left: 1.5rem;
    }
    .column {
      background: var(--column-bg);
      padding: 0.75rem;
      border-radius: 0.375rem;
    }
    @media print {
      textarea, button, p {
        display: none;
      }
      body {
        background: white;
        padding: 1in;
      }
      .results {
        box-shadow: none;
        padding: 0;
      }
      .result-group {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
      }
      .column {
        background: none;
        padding: 0;
      }
    }
  </style>
</head>
<body>
  <h1>Cap Splice Calculator</h1>
  <p>Paste one dimension per line. Each bay is separated by a 2.5" mullion. Splices occur only on mullion centerlines. Stock cap length is 288".</p>
  <textarea id="input"></textarea>
  <button onclick="calculateSplices()">Calculate Splice Points</button>
  <button onclick="window.print()">Print</button>
  <button onclick="downloadCSV()">Export Full Cut List to CSV</button>
  <button onclick="downloadCutOnlyCSV()">Export Cut Only List to CSV</button>

  <div id="graphic"></div>
  <div class="results" id="results"></div>


  <script>
    const MULLION_WIDTH = 2.5;
    const MAX_LENGTH = 288;
    const PART_NUMBERS = {
      PressurePlate: {
        Head: 162505,
        Intermediate: 162335,
        Sill: 162505
      },
      Cap: {
        Head: 162006,
        Intermediate: 162006,
        Sill: 162006
      }
    };

    // let csvRows = [["Part Number", "0", "Length", "Qty", "CONRAC", "Segment", "Part", "0", "0", "Use", "0", "0"]];
      let csvRows = [];

    function calculateSplices() {
    //   csvRows = [["Part Number", "0", "Length", "Qty", "CONRAC", "Segment", "Part", "0", "0", "Use", "0", "0"]];
      csvRows = [];
      const input = document.getElementById("input").value.trim();
      const lines = input.split("\n").map(line => parseFloat(line)).filter(n => !isNaN(n));

      let results = document.getElementById("results");
      results.innerHTML = "";
      document.getElementById("graphic").innerHTML = "";


      let group = [];
      let groupLength = 0;
      let segmentIndex = 0;
      let output = "";

      for (let i = 0; i < lines.length; i++) {
        const bay = lines[i];
        const isLastBay = i === lines.length - 1;
        const mullion = isLastBay ? 0 : MULLION_WIDTH;

        const nextLength = groupLength + bay + mullion;

        if (nextLength > MAX_LENGTH && group.length > 0) {
          output += formatSegment(++segmentIndex, group, groupLength);
          group = [];
          groupLength = 0;
        }

        group.push(bay);
        groupLength += bay + mullion;
      }

      if (group.length > 0) {
        output += formatSegment(++segmentIndex, group, groupLength);
      }

      results.innerHTML = output;
    }

    function formatSegment(index, bays, totalLength) {
      const pressurePlateLength = (totalLength - 0.75).toFixed(4);
      const capLength = (totalLength - 0.125).toFixed(4);

      let pressureWeepDetails = [];
      let capWeepDetails = [];
      let pressureAdjustedBays = [];

      let position = 0;

      for (let i = 0; i < bays.length; i++) {
        let bay = bays[i];
        let adjustedBay = bay;

        if (i === 0 || i === bays.length - 1) {
          adjustedBay -= 0.375;
        }

        pressureAdjustedBays.push(adjustedBay.toFixed(4));

        let pressureStart = position;
        let capStart = position;

        if (i === 0) {
          pressureStart -= 0.375;
          capStart -= 0.0625;
        }
        if (i === bays.length - 1) {
          bay -= 0.375;
        }

        pressureWeepDetails.push(`Bay ${i + 1}: ${(pressureStart + 4).toFixed(4)}", ${(pressureStart + adjustedBay - 4).toFixed(4)}"`);
        capWeepDetails.push(`Bay ${i + 1}: ${(capStart + 2).toFixed(4)}", ${(capStart + bays[i] - 2 - (i === bays.length - 1 ? -0.0625 : 0)).toFixed(4)}"`);

        position += bays[i] + MULLION_WIDTH;
      }

      ["Head", "Intermediate", "Sill"].forEach(use => {
        csvRows.push([
          PART_NUMBERS.PressurePlate[use],
          0,
          pressurePlateLength,
          1,
          "CONRAC",
          `Segment ${index}`,
          "Pressure Plate",
          0,
          0,
          use,
          0,
          0
        ]);
        csvRows.push([
          PART_NUMBERS.Cap[use],
          0,
          capLength,
          1,
          "CONRAC",
          `Segment ${index}`,
          "Cap",
          0,
          0,
          use,
          0,
          0
        ]);
      });
const svgHeight = 100;
const svgWidth = 800;
const scale = svgWidth / totalLength;
const weepRadius = 3;
const stickY = 40;
const stickHeight = 20;

let svg = `<svg width="${svgWidth}" height="${svgHeight}" style="margin-bottom: 1rem; border:1px solid #ccc;">`;

// Draw stick (segment)
svg += `<rect x="0" y="${stickY}" width="${svgWidth}" height="${stickHeight}" fill="#999" />`;

// Draw weep holes
let xPos = 0;
for (let i = 0; i < bays.length; i++) {
  const bay = bays[i];
  const bayStart = xPos;
  const bayEnd = xPos + bay;

  const pressureStart = (i === 0) ? bayStart - 0.375 : bayStart;
  const pressureEnd = (i === bays.length - 1) ? bayEnd - 0.375 : bayEnd;

  const capStart = (i === 0) ? bayStart - 0.0625 : bayStart;
  const capEnd = (i === bays.length - 1) ? bayEnd - 0.0625 : bayEnd;

  // Pressure plate weep holes
  svg += `<circle cx="${(pressureStart + 4) * scale}" cy="${stickY + stickHeight / 2}" r="${weepRadius}" fill="red" />`;
  svg += `<circle cx="${(pressureEnd - 4) * scale}" cy="${stickY + stickHeight / 2}" r="${weepRadius}" fill="red" />`;

  // Cap weep holes
  svg += `<circle cx="${(capStart + 2) * scale}" cy="${stickY + stickHeight / 2 + 10}" r="${weepRadius}" fill="red" />`;
  svg += `<circle cx="${(capEnd - 2) * scale}" cy="${stickY + stickHeight / 2 + 10}" r="${weepRadius}" fill="red" />`;

  // Dimension label (mullion to mullion)
  if (i < bays.length - 1) {
    const mid = (bayEnd + MULLION_WIDTH / 2) * scale;
    svg += `<text x="${mid}" y="90" font-size="10" text-anchor="middle">${(bay + MULLION_WIDTH).toFixed(2)}"</text>`;
  }

  xPos += bay + MULLION_WIDTH;
}

svg += `</svg>`;
document.getElementById("graphic").innerHTML += svg;

    
      return `
        <div class='result-group'>
          <div class='column'>
            <strong>Segment ${index}</strong><br>
            Bays: ${bays.join(", ")}<br>
            Total Length: ${totalLength.toFixed(2)}"<br>
            Pressure Plate Cut: ${pressurePlateLength}"<br>
            Pressure Plate Bay Widths: ${pressureAdjustedBays.join(", ")}<br>
            Cap Cut: ${capLength}"
          </div>
          <div class='column'>
            <strong>Pressure Plate Weep Holes:</strong>
            <ul>${pressureWeepDetails.map(loc => `<li>${loc}</li>`).join("")}</ul>
          </div>
          <div class='column'>
            <strong>Cap Weep Holes:</strong>
            <ul>${capWeepDetails.map(loc => `<li>${loc}</li>`).join("")}</ul>
          </div>
        </div>
      `;

      }

    function downloadCSV() {
      let csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.join(",")).join("\n");
      let encodedUri = encodeURI(csvContent);
      let link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "cut_list_full.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    function downloadCutOnlyCSV() {
    //   const cutOnlyRows = [csvRows[0]];
    //   for (let i = 1; i < csvRows.length; i++) {
    //     cutOnlyRows.push(csvRows[i]);
    //   }
      const cutOnlyRows = [...csvRows];
      let csvContent = "data:text/csv;charset=utf-8," + cutOnlyRows.map(e => e.join(",")).join("\n");
      let encodedUri = encodeURI(csvContent);
      let link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "cut_only_list.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  </script>

  <div class="theme-toggle">
    <label class="switch">
      <input type="checkbox" id="theme-toggle">
      <span class="slider round"></span>
    </label>
  </div>

  <script src="js/theme-toggle.js"></script>
</body>
</html>
