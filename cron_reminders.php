<?php
/**
 * DONE OS — Automated Background Reminders Cron Job
 * 
 * Specifically designed for GoDaddy Linux Shared Hosting (cPanel).
 * Setup in cPanel -> Cron Jobs:
 * Run once daily (e.g. 10:00 AM): php /home/your_user/public_html/cron_reminders.php
 */

header('Content-Type: application/json');

// 1. Database Configuration (cPanel MySQL)
$db_host = getenv('DB_HOST') ?: 'localhost';
$db_name = getenv('DB_NAME') ?: 'done_os';
$db_user = getenv('DB_USER') ?: 'root';
$db_pass = getenv('DB_PASS') ?: '';

// 2. Meta WhatsApp Cloud API Configuration
// When you register on developers.facebook.com for WhatsApp Business API:
$wa_token = getenv('WHATSAPP_API_TOKEN') ?: '';
$wa_phone_id = getenv('WHATSAPP_PHONE_ID') ?: '';

$results = [
    'timestamp' => date('Y-m-d H:i:s'),
    'scanned' => 0,
    'reminders_sent' => 0,
    'errors' => []
];

try {
    $pdo = new PDO("mysql:host={$db_host};dbname={$db_name};charset=utf8mb4", $db_user, $db_pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
} catch (PDOException $e) {
    // If running in local demo without MySQL connected
    $results['status'] = 'DEMO_STANDALONE_MODE';
    $results['note'] = 'MySQL not configured yet. Configure DB credentials in cPanel environment or .env file.';
    echo json_encode($results, JSON_PRETTY_PRINT);
    exit(0);
}

// 3. Find requests that are pending/overdue and have not been completed
$stmt = $pdo->prepare("
    SELECT id, reference_no, title, recipient_name, recipient_phone, recipient_email, public_token, due_at, status
    FROM requests 
    WHERE status IN ('Sent', 'Opened', 'In Progress', 'Overdue')
    AND due_at IS NOT NULL
    AND due_at <= DATE_ADD(NOW(), INTERVAL 1 DAY)
");
$stmt->execute();
$pending = $stmt->fetchAll();
$results['scanned'] = count($pending);

foreach ($pending as $req) {
    $clean_phone = preg_replace('/[^0-9]/', '', $req['recipient_phone'] ?? '');
    if (strlen($clean_phone) === 10) {
        $clean_phone = '91' . $clean_phone;
    }

    $link = "https://" . ($_SERVER['HTTP_HOST'] ?? 'yourdomain.com') . "/r/" . $req['public_token'];

    // If Meta WhatsApp Cloud API is configured, send hands-free background message:
    if ($wa_token && $wa_phone_id && $clean_phone) {
        $payload = [
            'messaging_product' => 'whatsapp',
            'to' => $clean_phone,
            'type' => 'text',
            'text' => [
                'body' => "⚠️ Reminder: Your request '{$req['title']}' from Northstar Consulting is pending.\n\nPlease complete it securely here:\n👉 {$link}"
            ]
        ];

        $ch = curl_init("https://graph.facebook.com/v18.0/{$wa_phone_id}/messages");
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "Authorization: Bearer {$wa_token}",
            "Content-Type: application/json"
        ]);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $res = curl_exec($ch);
        $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($http_code === 200) {
            $results['reminders_sent']++;
            // Log in audit_logs
            $audit = $pdo->prepare("INSERT INTO audit_logs (id, request_id, reference_no, action, metadata, created_at) VALUES (UUID(), ?, ?, 'REMINDER_SENT', ?, NOW())");
            $audit->execute([$req['id'], $req['reference_no'], json_encode(['channel' => 'whatsapp_cloud_api'])]);
        } else {
            $results['errors'][] = "Failed sending to {$clean_phone}: HTTP {$http_code}";
        }
    } else {
        // Log that reminder was eligible
        $results['note'] = 'WhatsApp API token not set. To send 100% automated background WhatsApp messages without manual clicks, set WHATSAPP_API_TOKEN and WHATSAPP_PHONE_ID.';
    }
}

echo json_encode($results, JSON_PRETTY_PRINT);
