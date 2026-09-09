import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const out = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'site') + '/';
// 写真: site/assets/img/ph-<name>.jpg があればそれを、無ければグレーの仮枠 SVG を使う
const img = (name) => fs.existsSync(out + 'assets/img/ph-' + name + '.jpg') ? 'ph-' + name + '.jpg' : 'ph-' + name + '.svg';
const NAV = [
  ['index.html','トップ'],['vacant.html','空室清掃'],['regular.html','日常・定期清掃'],['store.html','店舗・飲食店清掃'],['company.html','会社概要'],['contact.html','お問い合わせ']
];
const head = (title, desc, file, canon) => `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${desc}">
<meta property="og:type" content="website">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:url" content="https://corly.co.jp/${canon}">
<meta property="og:image" content="https://corly.co.jp/assets/img/logo-color.png">
<meta property="og:site_name" content="株式会社CORLY">
<meta property="og:locale" content="ja_JP">
<link rel="canonical" href="https://corly.co.jp/${canon}">
<link rel="icon" href="assets/img/favicon.png" type="image/png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap">
<link rel="stylesheet" href="assets/site.css">
</head>
<body>
<header class="header">
  <div class="wrap">
    <a class="logo" href="index.html" aria-label="株式会社CORLY トップページ"><img src="assets/img/logo-color.png" alt="CORLY inc." width="1200" height="323"></a>
    <nav class="nav" aria-label="メインナビゲーション">
${NAV.filter(n=>n[0]!=='contact.html').map(([f,l])=>`      <a href="${f}"${f===file?' aria-current="page"':''}>${l}</a>`).join('\n')}
      <a class="tel" href="tel:0642562693">06-4256-2693</a>
      <a class="btn cyan" href="contact.html">お問い合わせ</a>
    </nav>
    <button class="menu-btn" type="button" aria-label="メニュー" aria-expanded="false"><span></span></button>
  </div>
</header>
<main>
`;
const foot = `
</main>
<footer class="footer">
  <div class="wrap">
    <div class="top">
      <div>
        <a class="logo" href="index.html"><img src="assets/img/logo-color.png" alt="CORLY inc." width="1200" height="323"></a>
        <p class="addr">株式会社CORLY<br>〒541-0053 大阪府大阪市中央区本町2-3-4 アソルティ本町4F<br>TEL 06-4256-2693 ／ FAX 06-4560-9079</p>
      </div>
      <nav class="fnav" aria-label="フッターナビゲーション">
${NAV.map(([f,l])=>`        <a href="${f}">${l}</a>`).join('\n')}
        <a href="privacy.html">プライバシーポリシー</a>
      </nav>
    </div>
    <div class="copy"><span>© 2026 CORLY Inc.</span><span>法人番号 7120001269368</span></div>
  </div>
</footer>
<script src="assets/site.js" defer></script>
</body>
</html>
`;
const pageHead = (en, jp, crumbs) => `
<div class="page-head">
  <div class="wrap">
    <span class="en">${en}</span>
    <h1>${jp}</h1>
    <div class="crumb"><a href="index.html">トップ</a><span>›</span>${crumbs}</div>
  </div>
</div>`;
const ctaBand = `
<section class="cta-band">
  <div class="wrap">
    <div>
      <h2>お見積・ご相談は無料です</h2>
      <p>1室だけ、1回だけのご依頼でも構いません。現場を確認してからお見積を提示します。</p>
    </div>
    <div class="acts">
      <a class="btn cyan lg" href="contact.html">お問い合わせフォーム</a>
      <a class="tel" href="tel:0642562693">お電話でのお問い合わせ<b>06-4256-2693</b></a>
    </div>
  </div>
</section>`;
const flow = `
<section class="section">
  <div class="wrap">
    <div class="sec-title fade"><span class="en">FLOW</span><h2>ご依頼の流れ</h2></div>
    <ol class="flow fade">
      <li><span class="n">STEP 1</span><h3>お問い合わせ</h3><p>電話またはフォームからご連絡ください。物件の場所と困っていることをお聞かせください。</p></li>
      <li><span class="n">STEP 2</span><h3>現地確認・お見積</h3><p>現場を確認し、作業範囲と頻度を決めてお見積を提示します。見積は無料です。</p></li>
      <li><span class="n">STEP 3</span><h3>作業</h3><p>決めた手順に沿って作業します。営業時間外や休日の作業もご相談ください。</p></li>
      <li><span class="n">STEP 4</span><h3>報告</h3><p>作業前後の写真を付けた報告書を提出します。気になる点は次回に反映します。</p></li>
    </ol>
  </div>
</section>`;
const pages = {};

/* ---------- TOP ---------- */
pages['index.html'] = head('株式会社CORLY｜大阪の清掃会社（空室清掃・定期清掃・店舗清掃）','株式会社CORLY（大阪市中央区）は、空室清掃・日常清掃・定期清掃・店舗清掃・グリストラップ清掃を行う清掃会社です。JIS品質管理責任者と掃除能力検定士が在籍。写真付き報告書で作業結果をお伝えします。大阪・兵庫・京都・奈良・滋賀・和歌山に対応。','index.html','') + `
<section class="hero">
  <div class="wrap">
    <div>
      <h1>大阪・関西の<br><span class="mark">空室清掃・定期清掃</span>は<br>株式会社CORLYへ</h1>
      <p class="lead">アパート・マンションの空室清掃から、オフィス・施設の定期清掃、飲食店のグリストラップ清掃まで。有資格者が作業手順を決め、写真付きの報告書で結果をお伝えします。</p>
      <ul class="tags"><li>空室清掃</li><li>日常・定期清掃</li><li>店舗・飲食店清掃</li><li>グリストラップ清掃</li><li>写真付き報告書</li></ul>
      <div class="cta">
        <a class="btn cyan lg" href="contact.html">無料でお見積を依頼</a>
        <a class="tel" href="tel:0642562693">お電話はこちら<b>06-4256-2693</b></a>
      </div>
    </div>
    <div class="pic"><img src="assets/img/${img('hero')}" alt="清掃作業の様子" width="1600" height="900"></div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="sec-title fade"><span class="en">SERVICE</span><h2>清掃サービス</h2><p>住まい、オフィス、店舗。現場ごとに作業範囲と頻度を決めて、同じ品質で繰り返します。</p></div>
    <div class="cards fade">
      <a class="card" href="vacant.html"><img src="assets/img/${img('vacant')}" alt="空室清掃" width="1200" height="900"><div class="body"><h3>空室清掃</h3><p>退去後のアパート・マンションを、次の入居者を迎えられる状態に。管理会社様・オーナー様からのご依頼に対応します。</p><span class="more">詳しく見る</span></div></a>
      <a class="card" href="regular.html"><img src="assets/img/${img('regular')}" alt="日常・定期清掃" width="1200" height="900"><div class="body"><h3>日常・定期清掃</h3><p>オフィス、医療・介護施設、集合住宅の共用部。決めた頻度で、決めた品質を守り続けます。</p><span class="more">詳しく見る</span></div></a>
      <a class="card" href="store.html"><img src="assets/img/${img('store')}" alt="店舗・飲食店清掃" width="1200" height="900"><div class="body"><h3>店舗・飲食店清掃</h3><p>厨房のグリストラップ、換気まわり、客席の床とガラス。臭いと油のトラブルを防ぎます。</p><span class="more">詳しく見る</span></div></a>
    </div>
  </div>
</section>

<section class="section alt">
  <div class="wrap">
    <div class="sec-title fade"><span class="en">REASON</span><h2>CORLYが選ばれる理由</h2></div>
    <div class="reasons fade">
      <div class="reason"><span class="n">01</span><h3>有資格者が作業手順を決める</h3><p>JIS品質管理責任者と掃除能力検定士が在籍。現場ごとに手順と確認項目を決め、誰が作業しても同じ品質になるようにしています。</p></div>
      <div class="reason"><span class="n">02</span><h3>写真付き報告書で結果を残す</h3><p>作業前後の写真と確認項目を報告書にまとめて提出します。現場に行かなくても状態がわかります。</p></div>
      <div class="reason"><span class="n">03</span><h3>代表が直接対応</h3><p>お問い合わせから見積、現場確認まで代表が担当します。担当者が変わらず、判断が速い。</p></div>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="feature fade">
      <div class="pic"><img src="assets/img/${img('report')}" alt="写真付き作業報告書" width="1200" height="900"></div>
      <div>
        <div class="sec-title"><span class="en">REPORT</span><h2>作業は、写真で報告します</h2></div>
        <p>「きれいになったか」を口頭ではなく写真でお伝えします。作業前・作業後の写真と確認項目を1枚の報告書にまとめ、作業のたびに提出します。</p>
        <ul class="checks"><li>作業前・作業後の写真</li><li>作業箇所ごとの確認項目</li><li>気になった点・次回の提案</li></ul>
      </div>
    </div>
  </div>
</section>

<section class="section alt">
  <div class="wrap">
    <div class="sec-title fade"><span class="en">WORKS</span><h2>施工写真</h2><p>実際の現場写真を順次掲載します。</p></div>
    <div class="gallery fade">
      <figure><img src="assets/img/${img('work1')}" alt="施工写真" width="1200" height="900"><figcaption>空室清掃（作業前）</figcaption></figure>
      <figure><img src="assets/img/${img('work2')}" alt="施工写真" width="1200" height="900"><figcaption>空室清掃（作業後）</figcaption></figure>
      <figure><img src="assets/img/${img('work3')}" alt="施工写真" width="1200" height="900"><figcaption>定期清掃（床洗浄）</figcaption></figure>
      <figure><img src="assets/img/${img('work4')}" alt="施工写真" width="1200" height="900"><figcaption>グリストラップ清掃</figcaption></figure>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="sec-title fade"><span class="en">AREA</span><h2>対応エリア</h2></div>
    <ul class="area fade">
      <li class="hq">大阪府<small>本社・大阪市中央区</small></li><li>兵庫県</li><li>京都府</li><li>奈良県</li><li>滋賀県</li><li>和歌山県</li>
    </ul>
    <p class="area-note">上記以外のエリアもご相談ください。</p>
  </div>
</section>
${flow}
<section class="section alt">
  <div class="wrap">
    <div class="sec-title fade"><span class="en">COMPANY</span><h2>会社概要</h2></div>
    <table class="table fade">
      <tr><th>社名</th><td>株式会社CORLY（コーリー）</td></tr>
      <tr><th>代表取締役</th><td>岩崎 大樹</td></tr>
      <tr><th>所在地</th><td>〒541-0053 大阪府大阪市中央区本町2-3-4 アソルティ本町4F</td></tr>
      <tr><th>事業内容</th><td>空室清掃・日常清掃・定期清掃・店舗清掃・グリストラップ清掃</td></tr>
    </table>
    <p class="mt-18"><a class="btn line" href="company.html">会社概要をもっと見る</a></p>
  </div>
</section>
${ctaBand}` + foot;

/* ---------- SERVICE PAGES ---------- */
const service = (file, en, jp, desc, img, intro, points, works, extra) => head(`${jp}｜株式会社CORLY（大阪）`, desc, file, file) +
pageHead(en, jp, `<span>${jp}</span>`) + `
<section class="section">
  <div class="wrap">
    <div class="feature fade">
      <div class="pic"><img src="assets/img/${img}" alt="${jp}" width="1200" height="900"></div>
      <div>
        <h3>${intro.title}</h3>
        <p>${intro.text}</p>
        <ul class="checks">${points.map(p=>`<li>${p}</li>`).join('')}</ul>
      </div>
    </div>
  </div>
</section>
<section class="section alt">
  <div class="wrap">
    <div class="sec-title fade"><span class="en">WORK</span><h2>作業内容</h2><p>現場に合わせて作業範囲を決めます。下記は代表的な項目です。</p></div>
    <ul class="worklist fade">${works.map(([k,v])=>`<li><b>${k}</b><span>${v}</span></li>`).join('')}</ul>
    <p class="note">料金は物件の広さ・状態・頻度により異なるため、現地確認のうえお見積します。</p>
  </div>
</section>
${extra||''}
${flow}
${ctaBand}` + foot;

pages['vacant.html'] = service('vacant.html','VACANT CLEANING','空室清掃','大阪・関西の空室清掃（退去後クリーニング）。アパート・マンションの管理会社様・オーナー様向け。キッチン・浴室・トイレ・床・窓・建具まで、写真付き報告書で対応します。','ph-vacant.svg',
 {title:'退去後の部屋を、次の入居者を迎えられる状態に', text:'アパート・マンションの退去後クリーニングに対応します。原状回復のスケジュールに合わせて日程を調整し、管理会社様・オーナー様が現地に来なくても状態がわかるよう、作業前後の写真を付けて報告します。'},
 ['1室からご依頼可能','管理会社様・オーナー様の窓口対応','写真付き報告書を提出','鍵の受け渡し方法はご相談ください'],
 [['キッチン','シンク・コンロ・レンジフード・収納内'],['浴室','浴槽・壁・床・排水口・鏡・換気扇'],['トイレ・洗面','便器・タンク・洗面台・鏡・床'],['床・壁','掃除機がけ・水拭き・巾木・壁の汚れ'],['窓・サッシ','ガラス内外・サッシレール・網戸'],['建具・収納','扉・クローゼット内・棚'],['バルコニー','床の掃き掃除・排水口'],['照明・設備','照明カバー・エアコン表面・給湯器まわり']]);

pages['regular.html'] = service('regular.html','REGULAR CLEANING','日常・定期清掃','大阪・関西のオフィス・医療介護施設・マンション共用部の日常清掃・定期清掃。床洗浄・ワックス、エントランス、トイレ清掃。写真付き報告書で品質を管理します。','ph-regular.svg',
 {title:'決めた頻度で、決めた品質を守り続けます', text:'オフィス、医療・介護施設、集合住宅の共用部など、継続してきれいに保つ必要がある現場に対応します。作業手順と確認項目を決め、写真付きの報告書で毎回の結果を共有します。'},
 ['週1回から月1回まで頻度をご相談','有資格者が作業手順を作成','毎回の写真付き報告書','営業時間外・早朝の作業に対応'],
 [['エントランス','床の清掃・ガラス・自動ドア・マット'],['共用廊下・階段','掃き掃除・拭き掃除・手すり'],['トイレ','便器・洗面・床・消耗品の補充'],['床洗浄・ワックス','定期的な機械洗浄とワックス塗布'],['ゴミ置き場','清掃・消臭・整理'],['執務室・会議室','床・デスク周り・ゴミ回収'],['ガラス・サッシ','内側・手の届く範囲の外側'],['駐車場・外周','掃き掃除・除草のご相談']]);

pages['store.html'] = service('store.html','RESTAURANT / STORE','店舗・飲食店清掃','大阪・関西の飲食店・店舗清掃。グリストラップ清掃、厨房・換気まわり、客席の床・ガラス清掃。営業時間外の作業に対応。臭いと油のトラブルを防ぎます。','ph-store.svg',
 {title:'厨房の油と臭い、客席の清潔さを守ります', text:'飲食店・店舗の清掃に対応します。グリストラップや換気まわりの油汚れは放置すると臭いや詰まりの原因になります。営業時間外の作業で、営業に影響を出さずに定期的に清掃します。'},
 ['グリストラップの定期清掃','営業時間外・深夜早朝の作業に対応','厨房から客席まで一括対応','写真付き報告書を提出'],
 [['グリストラップ','汚泥・油脂の除去、槽内・バスケットの洗浄'],['厨房床・排水溝','油汚れの洗浄・排水溝の清掃'],['レンジフード・換気','フィルター・フード表面の油汚れ'],['客席床','掃除機・洗浄・ワックス'],['ガラス・入口','ガラス内外・ドア・看板まわり'],['トイレ','便器・洗面・床・消耗品'],['椅子・テーブル','拭き上げ・脚部の汚れ'],['定期メンテナンス','頻度を決めて継続的に対応']]);

/* ---------- COMPANY ---------- */
pages['company.html'] = head('会社概要｜株式会社CORLY','株式会社CORLYの会社概要。所在地：大阪府大阪市中央区本町2-3-4 アソルティ本町4F。代表取締役 岩崎大樹。設立 2024年10月。事業内容：空室清掃・日常清掃・定期清掃・店舗清掃。','company.html','company.html') + pageHead('COMPANY','会社概要','<span>会社概要</span>') + `
<section class="section">
  <div class="wrap">
    <div class="feature fade">
      <div class="pic"><img src="assets/img/${img('office')}" alt="株式会社CORLY 事務所" width="1200" height="900"></div>
      <div>
        <div class="sec-title"><span class="en">MESSAGE</span><h2>現場で信頼を積み上げる</h2></div>
        <p>株式会社CORLYは、大阪市中央区を拠点とする清掃会社です。空室清掃、日常・定期清掃、店舗清掃を通じて、管理会社様・オーナー様・店舗様の「現場を任せられる相手」であり続けることを目指しています。</p>
        <p class="mt-12">作業の基準を決めること、写真で結果を残すこと、代表が直接対応すること。この3つを守り、関西一円で信頼を積み上げていきます。</p>
        <p class="mt-18 bold">代表取締役　岩崎 大樹</p>
      </div>
    </div>
  </div>
</section>
<section class="section alt">
  <div class="wrap">
    <div class="sec-title fade"><span class="en">PROFILE</span><h2>会社概要</h2></div>
    <table class="table fade">
      <tr><th>社名</th><td>株式会社CORLY（コーリー）</td></tr>
      <tr><th>代表取締役</th><td>岩崎 大樹</td></tr>
      <tr><th>設立</th><td>2024年10月</td></tr>
      <tr><th>所在地</th><td>〒541-0053 大阪府大阪市中央区本町2-3-4 アソルティ本町4F<br><a class="link sm" href="https://www.google.com/maps/search/?api=1&query=%E5%A4%A7%E9%98%AA%E5%BA%9C%E5%A4%A7%E9%98%AA%E5%B8%82%E4%B8%AD%E5%A4%AE%E5%8C%BA%E6%9C%AC%E7%94%BA2-3-4" target="_blank" rel="noopener">Googleマップで見る</a></td></tr>
      <tr><th>連絡先</th><td>TEL 06-4256-2693<br>FAX 06-4560-9079<br>MAIL info@corly.co.jp</td></tr>
      <tr><th>事業内容</th><td><ul><li>空室清掃（アパート・マンションの退去後クリーニング）</li><li>日常清掃・定期清掃（オフィス・施設・集合住宅共用部）</li><li>店舗・飲食店清掃（グリストラップ清掃を含む）</li></ul></td></tr>
      <tr><th>有資格者</th><td>JIS品質管理責任者／掃除能力検定士</td></tr>
      <tr><th>対応エリア</th><td>大阪府・兵庫県・京都府・奈良県・滋賀県・和歌山県（その他は応相談）</td></tr>
      <tr><th>法人番号</th><td>7120001269368</td></tr>
    </table>
  </div>
</section>
${ctaBand}` + foot;

/* ---------- CONTACT ---------- */
pages['contact.html'] = head('お問い合わせ｜株式会社CORLY','株式会社CORLYへのお問い合わせ・お見積依頼。空室清掃・定期清掃・店舗清掃のご相談はフォームまたは電話（06-4256-2693）でどうぞ。見積は無料です。','contact.html','contact.html') + pageHead('CONTACT','お問い合わせ','<span>お問い合わせ</span>') + `
<section class="section">
  <div class="wrap">
    <div class="contact-grid">
      <div class="fade">
        <p>お見積・ご相談は無料です。1室だけ、1回だけのご依頼でも構いません。現場を確認してからお見積を提示します。</p>
        <dl class="info mt-22">
          <dt>お電話</dt><dd class="big"><a href="tel:0642562693">06-4256-2693</a></dd>
          <dt>メール</dt><dd><a href="mailto:info@corly.co.jp">info@corly.co.jp</a></dd>
          <dt>FAX</dt><dd>06-4560-9079</dd>
          <dt>所在地</dt><dd>〒541-0053<br>大阪府大阪市中央区本町2-3-4 アソルティ本町4F</dd>
        </dl>
      </div>
      <div class="fade">
        <div id="form-status" class="alert" role="status" hidden></div>
        <form action="contact.php" method="post" data-contact novalidate>
          <div class="grid-2">
            <div class="field"><label for="f-company">会社名・物件名<i>任意</i></label><input id="f-company" name="company" type="text" maxlength="100" autocomplete="organization"></div>
            <div class="field"><label for="f-name">お名前<b>必須</b></label><input id="f-name" name="name" type="text" maxlength="60" required autocomplete="name"></div>
          </div>
          <div class="grid-2">
            <div class="field"><label for="f-email">メールアドレス<b>必須</b></label><input id="f-email" name="email" type="email" maxlength="120" required autocomplete="email"></div>
            <div class="field"><label for="f-tel">電話番号<i>任意</i></label><input id="f-tel" name="tel" type="tel" maxlength="20" autocomplete="tel"></div>
          </div>
          <div class="field">
            <label for="f-topic">ご依頼内容<b>必須</b></label>
            <select id="f-topic" name="topic" required>
              <option value="">選択してください</option>
              <option>空室清掃</option>
              <option>日常清掃・定期清掃</option>
              <option>店舗・飲食店清掃（グリストラップ）</option>
              <option>その他</option>
            </select>
          </div>
          <div class="field"><label for="f-msg">現場の情報・ご相談内容<b>必須</b></label><textarea id="f-msg" name="message" maxlength="3000" required placeholder="物件の場所（市区町村）、広さや間取り、希望の時期、困っていることなど"></textarea></div>
          <label class="consent"><input type="checkbox" name="consent" value="1" required> <span><a href="privacy.html">プライバシーポリシー</a>に同意のうえ送信します。</span></label>
          <div class="hp" aria-hidden="true"><label>Website<input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>
          <input type="hidden" name="ts" value="">
          <div><button class="btn cyan lg" type="submit">送信する</button></div>
          <p class="form-note">送信いただいた内容は、お問い合わせへの回答のみに使用します。</p>
        </form>
      </div>
    </div>
  </div>
</section>` + foot;

/* ---------- THANKS / PRIVACY ---------- */
pages['thanks.html'] = head('送信完了｜株式会社CORLY','お問い合わせを受け付けました。','thanks.html','thanks.html').replace('<link rel="canonical"','<meta name="robots" content="noindex">\n<link rel="canonical"') + pageHead('CONTACT','送信完了','<span>送信完了</span>') + `
<section class="section">
  <div class="wrap prose">
    <p class="text-base">お問い合わせを受け付けました。内容を確認のうえ、担当者よりご連絡いたします。</p>
    <p class="mt-10">お急ぎの場合は <a class="link" href="tel:0642562693">06-4256-2693</a> までお電話ください。</p>
    <p class="mt-28"><a class="btn line" href="index.html">トップページへ戻る</a></p>
  </div>
</section>` + foot;

pages['privacy.html'] = head('プライバシーポリシー｜株式会社CORLY','株式会社CORLYの個人情報の取り扱いについて。','privacy.html','privacy.html') + pageHead('PRIVACY POLICY','プライバシーポリシー','<span>プライバシーポリシー</span>') + `
<section class="section">
  <div class="wrap prose">
    <!-- TODO: 現行サイト（corly.co.jp/privacy-policy/）の文面に差し替えてください。以下は一般的な雛形です。 -->
    <p>株式会社CORLY（以下「当社」）は、お客様の個人情報の重要性を認識し、以下の方針に基づき適切に取り扱います。</p>
    <h2>1. 取得する情報</h2>
    <p>お問い合わせフォーム、電話、メール等を通じて、会社名、氏名、メールアドレス、電話番号、ご相談内容等をお預かりします。</p>
    <h2>2. 利用目的</h2>
    <ul><li>お問い合わせ・お見積へのご回答</li><li>サービスの提供、契約の履行および連絡</li><li>当社サービスに関するご案内（ご希望されない場合はお申し出ください）</li></ul>
    <h2>3. 第三者提供</h2>
    <p>法令に基づく場合、または業務の遂行に必要な範囲で協力会社に委託する場合を除き、ご本人の同意なく第三者に提供しません。</p>
    <h2>4. 安全管理</h2>
    <p>個人情報への不正アクセス、紛失、漏えい等を防止するため、必要かつ適切な安全管理措置を講じます。</p>
    <h2>5. 開示・訂正・削除</h2>
    <p>ご本人からの開示、訂正、利用停止、削除のご請求には、ご本人確認のうえ速やかに対応します。</p>
    <h2>6. お問い合わせ窓口</h2>
    <p>株式会社CORLY<br>〒541-0053 大阪府大阪市中央区本町2-3-4 アソルティ本町4F<br>TEL 06-4256-2693 ／ MAIL info@corly.co.jp</p>
  </div>
</section>` + foot;

for (const [f, html] of Object.entries(pages)) fs.writeFileSync(out + f, html);
console.log('pages:', Object.keys(pages).join(', '));
