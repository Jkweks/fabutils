<!-- W:\Web\dev\index.php -->
<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>My Dashboard</title>
  <link rel="stylesheet" href="css/style.css" />
</head>
<body>
    <header>
    <h1>Engineering Tools</h1>
  </header>
  <main class="grid">
    <a href="weeps/index.php" class="card">
      <h2>Weep Hole Calculator</h2>
    </a>
    <a href="caps.php" class="card">
      <h2>Pressure Plate / Cap Calculator</h2>
    </a>
    <a href="newweeps/index.php" class="card">
      <h2>Original SubSill Calculator</h2>
    </a>
  </main>

  <!-- Theme Toggle Switch -->
  <div class="theme-toggle">
    <label class="switch">
      <input type="checkbox" id="theme-toggle">
      <span class="slider round"></span>
    </label>
  </div>

  <script src="js/theme-toggle.js"></script>
</body>
</html>
