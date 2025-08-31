<?php
$itemsFile = __DIR__ . '/data/items.json';
$items = [];
if (file_exists($itemsFile)) {
    $items = json_decode(file_get_contents($itemsFile), true) ?? [];
}
?>
<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Items</title>
  <link rel="stylesheet" href="css/style.css" />
</head>
<body>
  <header>
    <h1>Items</h1>
  </header>

  <main>
    <form action="import_items.php" method="post" enctype="multipart/form-data">
      <input type="file" name="csv_file" accept=".csv" required>
      <button type="submit">Import CSV</button>
    </form>

    <?php if (!empty($items)): ?>
    <table>
      <tr>
        <th>SKU</th>
        <th>Type</th>
        <th>Category</th>
        <th>Use</th>
        <th>Description</th>
        <th>Action</th>
      </tr>
      <?php foreach ($items as $item): ?>
      <tr>
        <td><?php echo htmlspecialchars($item['sku']); ?></td>
        <td><?php echo htmlspecialchars($item['type']); ?></td>
        <td><?php echo htmlspecialchars($item['category']); ?></td>
        <td><?php echo htmlspecialchars($item['use']); ?></td>
        <td><?php echo htmlspecialchars($item['description']); ?></td>
        <td><a href="edit_item.php?sku=<?php echo urlencode($item['sku']); ?>">Edit</a></td>
      </tr>
      <?php endforeach; ?>
    </table>
    <?php else: ?>
      <p>No items found.</p>
    <?php endif; ?>
  </main>

  <div class="theme-toggle">
    <label class="switch">
      <input type="checkbox" id="theme-toggle">
      <span class="slider round"></span>
    </label>
  </div>
  <script src="js/theme-toggle.js"></script>
</body>
</html>
