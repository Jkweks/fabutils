<?php
$itemsFile = __DIR__ . '/data/items.json';
$items = file_exists($itemsFile) ? json_decode(file_get_contents($itemsFile), true) : [];
$sku = $_GET['sku'] ?? '';
$index = array_search($sku, array_column($items, 'sku'));
if ($index === false) {
    echo 'Item not found';
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $items[$index]['type'] = $_POST['type'] ?? $items[$index]['type'];
    $items[$index]['category'] = $_POST['category'] ?? $items[$index]['category'];
    $items[$index]['use'] = $_POST['use'] ?? $items[$index]['use'];
    $items[$index]['description'] = $_POST['description'] ?? $items[$index]['description'];
    file_put_contents($itemsFile, json_encode($items, JSON_PRETTY_PRINT));
    header('Location: items.php');
    exit;
}
$item = $items[$index];
?>
<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Edit Item</title>
  <link rel="stylesheet" href="css/style.css" />
</head>
<body>
  <header>
    <h1>Edit Item</h1>
  </header>

  <main>
      <form method="post">
        <p>Part Number/SKU: <?php echo htmlspecialchars($item['sku']); ?></p>
        <label>Type
          <input type="text" name="type" value="<?php echo htmlspecialchars($item['type']); ?>">
        </label><br>
        <label>Category
          <input type="text" name="category" value="<?php echo htmlspecialchars($item['category']); ?>">
        </label><br>
        <label>Use
          <input type="text" name="use" value="<?php echo htmlspecialchars($item['use']); ?>">
        </label><br>
        <label>Description
          <input type="text" name="description" value="<?php echo htmlspecialchars($item['description']); ?>">
        </label><br>
        <button type="submit">Save</button>
      </form>
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
