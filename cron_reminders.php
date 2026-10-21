<?php
/**
 * DONE OS — Automated Background Reminders Cron Job
 * 
 * Specifically designed for GoDaddy Linux Shared Hosting (cPanel).
 * Setup in cPanel -> Cron Jobs:
 * Run once daily (e.g. 10:00 AM): php /home/your_user/public_html/cron_reminders.php
 */

header('Content-Type: application/json');

// 1. Security Gate: Verify Caller Authorization
$cron_secret = getenv('CRON_SECRET') ?: 'done_cron_secure_token_2026';
$is_cli = (php_sapi_name() === 'cli');
$provided_token = $_GET['token'] ?? ($_SERVER['HTTP_X_CRON_TOKEN'] ?? '');

if (!$is_cli && $provided_token !== $cron_secret) {
    http_response_code(403);
    echo json_encode([
        'error' => '403 Forbidden: Unauthorized cron execution. Provide valid ?token= in request or execute via CLI.'
    ], JSON_PRETTY_PRINT);
    exit(1);
}

// 2. Database Configuration (cPanel MySQL)
$db_host = getenv('DB_HOST') ?: 'localhost';
$db_name = getenv('DB_NAME') ?: 'done_os';
$db_user = getenv('DB_USER') ?: 'root';
$db_pass = getenv('DB_PASS') ?: '';

// 3. Meta WhatsApp Cloud API Configuration
$wa_token = getenv('WHATSAPP_API_TOKEN') ?: '';
$wa_phone_id = getenv('WHATSAPP_PHONE_ID') ?: '';

$results = [
    'timestamp' => date('Y-m-d H:i:s'),
    'mode' => $is_cli ? 'CLI_CRON' : 'AUTHENTICATED_WEB',
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
    $results['status'] = 'DATABASE_CONNECTION_ERROR';
    $results['note'] = 'Could not connect to MySQL. Ensure credentials are set in .env or cPanel environment.';
    echo json_encode($results, JSON_PRETTY_PRINT);
    exit(0);
}

// 4. Find requests that are pending/overdue, due within 24 hours, AND have NOT received a reminder in the last 24 hours
$stmt = $pdo->prepare("
    SELECT r.id, r.organization_id, r.reference_no, r.title, 
           r.recipient_name, r.recipient_phone, r.recipient_email, 
           r.public_token, r.due_at, r.status
    FROM requests r
    WHERE r.status IN ('Sent', 'Opened', 'In Progress', 'Overdue')
      AND r.due_at IS NOT NULL
      AND r.due_at <= DATE_ADD(NOW(), INTERVAL 1 DAY)
      AND r.id NOT IN (
          SELECT request_id FROM audit_logs 
          WHERE action = 'REMINDER_SENT' 
            AND created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
      )
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
                'body' => "⚠️ Reminder: Your request '{$req['title']}' is pending.\n\nPlease complete it securely here:\n👉 {$link}"
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
            // Log in audit_logs with exact matching schema columns
            $audit = $pdo->prepare("
                INSERT INTO audit_logs (id, organization_id, request_id, reference_no, action, actor_type, metadata, created_at) 
                VALUES (UUID(), ?, ?, ?, 'REMINDER_SENT', 'system', ?, NOW())
            ");
            $audit->execute([
                $req['organization_id'],
                $req['id'],
                $req['reference_no'],
                json_encode(['channel' => 'whatsapp_cloud_api', 'recipient' => $clean_phone])
            ]);
        } else {
            $results['errors'][] = "Failed sending to {$clean_phone}: HTTP {$http_code}";
        }
    } else {
        $results['note'] = 'WhatsApp API token not set. To send 100% automated background WhatsApp messages, configure WHATSAPP_API_TOKEN.';
    }
}

echo json_encode($results, JSON_PRETTY_PRINT);
