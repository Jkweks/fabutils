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
    <a href="caps.php" class="card">
      <h2>Pressure Plate / Cap Calculator</h2>
    </a>
    <a href="newweeps/index.php" class="card">
      <h2>Original SubSill Calculator</h2>
    </a>
  </main>

  <section class="items-list">
    <h2>Items</h2>
    <?php
      $itemsFile = __DIR__ . '/data/items.json';
      $items = [];
      if (file_exists($itemsFile)) {
        $items = json_decode(file_get_contents($itemsFile), true) ?? [];
      }

      if (!empty($items)) {
        echo '<table>';
        echo '<tr><th>SKU</th><th>Type</th><th>Category</th><th>Use</th><th>Description</th><th>Action</th></tr>';
        foreach ($items as $item) {
          echo '<tr>';
          echo '<td>' . htmlspecialchars($item['sku']) . '</td>';
          echo '<td>' . htmlspecialchars($item['type']) . '</td>';
          echo '<td>' . htmlspecialchars($item['category']) . '</td>';
          echo '<td>' . htmlspecialchars($item['use']) . '</td>';
          echo '<td>' . htmlspecialchars($item['description']) . '</td>';
          echo '<td><a href="edit_item.php?sku=' . urlencode($item['sku']) . '">Edit</a></td>';
          echo '</tr>';
        }
        echo '</table>';
      } else {
        echo '<p>No items found.</p>';
      }
    ?>
    <p><a href="items.php">View all items</a></p>
  </section>

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
