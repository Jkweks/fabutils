<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Bay Markout Tool - T14000 & T24650</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>

  <h2>Bay Markout Tool - T14000 & T24650</h2>
  <!-- T14000 uses center or quarter points; T24650 uses 2"/8" offsets as defined in calculate.js -->

  <div class="tab-buttons">
    <button id="tabBtnT14000" class="active" onclick="switchTab('T14000')">T14000</button>
    <button id="tabBtnT24650" onclick="switchTab('T24650')">T24650</button>
  </div>

  <!-- T14000 Tab -->
  <div id="tabT14000" class="tab-content">
    <label for="numBaysT14000">Number of Bays:</label>
    <input type="number" id="numBaysT14000" min="1" max="20" placeholder="e.g. 4" />
    <button type="button" onclick="generateBayInputs('T14000')">Next</button>

    <form id="mainFormT14000" class="hidden" data-system="T14000">
      <div id="bayInputsT14000"></div>

      <label for="spacingT14000">Spacing Between Bays (inches):</label>
      <input type="text" id="spacingT14000" value="2" placeholder="e.g. 2 or 1 3/8" />

      <label for="trackOffsetT14000">Track Start Offset (optional):</label>
      <input type="text" id="trackOffsetT14000" value="0" placeholder="e.g. 3/4" />

      <div class="checkbox">
        <input type="checkbox" id="doorLeftT14000" checked />
        <label for="doorLeftT14000">Door on Left</label>
      </div>
      <div class="checkbox">
        <input type="checkbox" id="doorRightT14000" checked />
        <label for="doorRightT14000">Door on Right</label>
      </div>

      <div class="checkbox">
        <input type="checkbox" id="useManualSpliceT14000" />
        <label for="useManualSpliceT14000">Use Manual Splice Segments</label>
      </div>

      <div id="manualSpliceContainerT14000" class="hidden">
        <h3>Manual Splice Segments</h3>
        <div id="spliceContainerT14000"></div>
        <button type="button" onclick="addSplice('T14000')">+ Add Splice Segment</button>
      </div>

      <div class="checkbox">
        <input type="checkbox" id="includeSpliceGapAutoT14000" checked />
        <label for="includeSpliceGapAutoT14000">Include Splice Gap in Auto Mode</label>
      </div>

      <label for="spliceGapT14000">Splice Gap (inches, e.g. 3/8):</label>
      <input type="text" id="spliceGapT14000" value="3/8" />

      <button type="submit">Calculate Quarter Points</button>
      <button type="button" onclick="resetForm('T14000')">Start Over</button>

    </form>

    <div id="resultsT14000" class="result hidden"></div>
    <button id="downloadT14000">Download Results</button>
  </div>

  <!-- T24650 Tab -->
  <div id="tabT24650" class="tab-content hidden">
    <label for="numBaysT24650">Number of Bays:</label>
    <input type="number" id="numBaysT24650" min="1" max="20" placeholder="e.g. 4" />
    <button type="button" onclick="generateBayInputs('T24650')">Next</button>

    <form id="mainFormT24650" class="hidden" data-system="T24650">
      <div id="bayInputsT24650"></div>

      <label for="spacingT24650">Spacing Between Bays (inches):</label>
      <input type="text" id="spacingT24650" value="2" placeholder="e.g. 2 or 1 3/8" />

      <label for="trackOffsetT24650">Track Start Offset (optional):</label>
      <input type="text" id="trackOffsetT24650" value="0" placeholder="e.g. 3/4" />

      <div class="checkbox">
        <input type="checkbox" id="doorLeftT24650" checked />
        <label for="doorLeftT24650">Door on Left</label>
      </div>
      <div class="checkbox">
        <input type="checkbox" id="doorRightT24650" checked />
        <label for="doorRightT24650">Door on Right</label>
      </div>

      <div class="checkbox">
        <input type="checkbox" id="useManualSpliceT24650" />
        <label for="useManualSpliceT24650">Use Manual Splice Segments</label>
      </div>

      <div id="manualSpliceContainerT24650" class="hidden">
        <h3>Manual Splice Segments</h3>
        <div id="spliceContainerT24650"></div>
        <button type="button" onclick="addSplice('T24650')">+ Add Splice Segment</button>
      </div>

      <div class="checkbox">
        <input type="checkbox" id="includeSpliceGapAutoT24650" checked />
        <label for="includeSpliceGapAutoT24650">Include Splice Gap in Auto Mode</label>
      </div>

      <label for="spliceGapT24650">Splice Gap (inches, e.g. 3/8):</label>
      <input type="text" id="spliceGapT24650" value="3/8" />

      <button type="submit">Calculate Points</button>
    </form>

    <div id="resultsT24650" class="result hidden"></div>
    <button id="downloadT24650" class="hidden">Download Results</button>
  </div>

<div id="visual-container" class="hidden">
  <div id="markpointVisualizer" class="visual-bar"></div>
</div>


  <!-- Script Modules -->
  <script src="utils.js"></script>
  <script src="tabs.js"></script>
  <script src="form.js"></script>
  <script src="calculate.js"></script>
  <script src="main.js"></script>
  <script src="visual.js"></script>
</body>
</html>
