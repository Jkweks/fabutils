<?php
$itemsFile = __DIR__ . '/data/items.json';
$items = [];
if (file_exists($itemsFile)) {
    $items = json_decode(file_get_contents($itemsFile), true) ?? [];
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['csv_file'])) {
    $tmpName = $_FILES['csv_file']['tmp_name'];
    if (($handle = fopen($tmpName, 'r')) !== false) {
        $row = 0;
        while (($data = fgetcsv($handle)) !== false) {
            if ($row === 0 && preg_match('/sku|part/i', $data[0])) {
                $row++;
                continue; // skip header row
            }
            if (count($data) < 5) {
                $row++;
                continue;
            }
            $items[] = [
                'sku' => $data[0],
                'type' => $data[1],
                'category' => $data[2],
                'use' => $data[3],
                'description' => $data[4],
            ];
            $row++;
        }
        fclose($handle);
        file_put_contents($itemsFile, json_encode($items, JSON_PRETTY_PRINT));
    }
}

header('Location: items.php');
exit;
