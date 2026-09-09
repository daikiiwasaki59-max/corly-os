<?php
/**
 * 株式会社CORLY — お問い合わせフォーム受信処理
 *
 * 静的サイト用の最小構成。外部ライブラリなし。
 * 対策: 同一オリジン検査 / ハニーポット / 最短入力時間 / IP別レート制限 /
 *       ヘッダインジェクション防止 / 文字数制限 / 出力エスケープ
 *
 * 設定はこのブロックだけ変更してください。
 */
declare(strict_types=1);

const TO_ADDRESS   = 'info@corly.co.jp';        // 受信先
const FROM_ADDRESS = 'noreply@corly.co.jp';     // 送信元（このドメインのアドレスにすること。Xserver側で作成が必要）
const FROM_NAME    = '株式会社CORLY Webサイト';
const SITE_HOST    = 'corly.co.jp';             // www 有無は両方許可する
const MIN_SECONDS  = 4;                          // フォーム表示から送信までの最短秒数（bot判定）
const RATE_LIMIT   = 5;                          // 1IPあたり RATE_WINDOW 秒間の上限回数
const RATE_WINDOW  = 3600;
const MAX_MESSAGE  = 3000;

mb_language('Japanese');
mb_internal_encoding('UTF-8');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: same-origin');

function bounce(string $key): void {
    header('Location: ./contact.html?error=' . rawurlencode($key), true, 303);
    exit;
}
function clean(string $v, int $max): string {
    $v = str_replace(["\r", "\n", "\0"], ' ', $v);      // ヘッダインジェクション防止
    $v = trim(preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $v) ?? '');
    return mb_substr($v, 0, $max);
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Location: ./contact.html', true, 303);
    exit;
}

// 1. 同一オリジン検査（他サイトからのPOSTを拒否）
$origin  = $_SERVER['HTTP_ORIGIN']  ?? '';
$referer = $_SERVER['HTTP_REFERER'] ?? '';
$src     = $origin !== '' ? $origin : $referer;
$srcHost = strtolower((string) parse_url($src, PHP_URL_HOST));
$allowed = [SITE_HOST, 'www.' . SITE_HOST];
if ($srcHost === '' || !in_array($srcHost, $allowed, true)) {
    bounce('spam');
}

// 2. ハニーポット（人には見えない欄が埋まっていたらbot）
if (($_POST['website'] ?? '') !== '') {
    bounce('spam');
}

// 3. 最短入力時間
$ts = (int) ($_POST['ts'] ?? 0);
if ($ts <= 0 || (time() - $ts) < MIN_SECONDS || (time() - $ts) > 86400) {
    bounce('spam');
}

// 4. レート制限（IP単位、公開ディレクトリ外に記録）
$ip   = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
$dir  = dirname(__DIR__) . '/contact-ratelimit';           // public_html の一つ上
if (!is_dir($dir) && !@mkdir($dir, 0700, true)) {
    $dir = sys_get_temp_dir();
}
$file = $dir . '/rl_' . hash('sha256', $ip) . '.json';
$hits = [];
if (is_file($file)) {
    $hits = json_decode((string) file_get_contents($file), true) ?: [];
}
$now  = time();
$hits = array_values(array_filter($hits, fn($t) => is_int($t) && ($now - $t) < RATE_WINDOW));
if (count($hits) >= RATE_LIMIT) {
    bounce('ratelimit');
}
$hits[] = $now;
@file_put_contents($file, json_encode($hits), LOCK_EX);

// 5. 入力の検証
$company = clean((string) ($_POST['company'] ?? ''), 100);
$name    = clean((string) ($_POST['name']    ?? ''), 60);
$email   = clean((string) ($_POST['email']   ?? ''), 120);
$tel     = clean((string) ($_POST['tel']     ?? ''), 20);
$topic   = clean((string) ($_POST['topic']   ?? ''), 80);
$message = trim(mb_substr((string) ($_POST['message'] ?? ''), 0, MAX_MESSAGE));
$message = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $message) ?? '';

if ($name === '' || $email === '' || $topic === '' || $message === '') {
    bounce('required');
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL) || preg_match('/[^\x21-\x7E]/', $email)) {
    bounce('email');
}
if (($_POST['consent'] ?? '') !== '1') {
    bounce('consent');
}

// 6. メール送信（本文はプレーンテキスト。HTMLは使わない）
$subject = '【Webお問い合わせ】' . $topic . ' / ' . $name;
$body = implode("\n", [
    'corly.co.jp のお問い合わせフォームから送信されました。',
    '',
    '会社名・施設名 : ' . ($company !== '' ? $company : '（未入力）'),
    'お名前         : ' . $name,
    'メール         : ' . $email,
    '電話           : ' . ($tel !== '' ? $tel : '（未入力）'),
    '相談内容       : ' . $topic,
    '',
    '----- 詳細 -----',
    $message,
    '----------------',
    '',
    '送信日時 : ' . date('Y-m-d H:i:s'),
    '送信元IP : ' . $ip,
]);

$headers  = 'From: ' . mb_encode_mimeheader(FROM_NAME, 'ISO-2022-JP-MS') . ' <' . FROM_ADDRESS . ">\r\n";
$headers .= 'Reply-To: ' . $email . "\r\n";
$headers .= "X-Mailer: PHP/" . PHP_VERSION;

$sent = @mb_send_mail(TO_ADDRESS, $subject, $body, $headers);
if (!$sent) {
    bounce('mail');
}

header('Location: ./thanks.html', true, 303);
exit;
