import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const out = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'site') + '/';
// 写真: site/assets/img/ph-<name>.jpg があればそれを、無ければグレーの仮枠 SVG を使う
const has = (name) => fs.existsSync(out + 'assets/img/ph-' + name + '.jpg');
const img = (name) => has(name) ? 'ph-' + name + '.jpg' : 'ph-' + name + '.svg';
const NAV = [
  ['index.html','トップ'],['vacant.html','空室清掃'],['regular.html','日常・定期清掃'],['store.html','店舗・飲食店清掃'],['company.html','会社概要'],['contact.html','お問い合わせ']
];
const TEL = '06-4256-2693', TEL_HREF = 'tel:0642562693';
const ADDR = '〒541-0053 大阪府大阪市中央区本町2-3-4 アソルティ本町4F';
const arr = '<span class="arr" aria-hidden="true"></span>';

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
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Zen+Kaku+Gothic+New:wght@400;500;700;900&family=Manrope:wght@700;800&display=swap">
<link rel="stylesheet" href="assets/site.css">
</head>
<body>
<header class="header">
  <div class="wrap">
    <a class="logo" href="index.html" aria-label="株式会社CORLY トップページ"><img src="assets/img/logo-color.png" alt="CORLY inc." width="1200" height="323"></a>
    <nav class="nav" aria-label="メインナビゲーション">
${NAV.filter(n=>n[0]!=='contact.html').map(([f,l])=>`      <a href="${f}"${f===file?' aria-current="page"':''}>${l}</a>`).join('\n')}
      <a class="tel" href="${TEL_HREF}">${TEL}</a>
      <a class="btn" href="contact.html">お問い合わせ${arr}</a>
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
        <p class="addr">株式会社CORLY<br>${ADDR}<br>TEL ${TEL} ／ FAX 06-4560-9079</p>
      </div>
      <nav class="fnav" aria-label="フッターナビゲーション">
${NAV.map(([f,l])=>`        <a href="${f}">${l}</a>`).join('\n')}
        <a href="privacy.html">プライバシーポリシー</a>
      </nav>
    </div>
    <div class="word" aria-hidden="true">CORLY</div>
    <div class="copy"><span>© 2026 CORLY Inc.</span><span>Osaka, Japan — 法人番号 7120001269368</span></div>
  </div>
</footer>
<script src="assets/site.js" defer></script>
</body>
</html>
`;

const pageHead = (en, jp, crumbs) => `
<div class="page-head">
  <div class="wrap">
    <span class="en rv">${en}</span>
    <h1 class="rv d1">${jp}</h1>
    <div class="crumb rv d2"><a href="index.html">トップ</a><span>/</span>${crumbs}</div>
  </div>
</div>`;

// 報告書のイメージ（内容はサンプル）
const reportCard = (cls='') => `
<div class="report ${cls}" aria-label="作業報告書のイメージ">
  <div class="rh"><b>作業報告書</b><span>SAMPLE</span></div>
  <dl>
    <dt>物件</dt><dd>○○マンション 203号室</dd>
    <dt>作業</dt><dd>空室清掃（退去後）</dd>
    <dt>担当</dt><dd>掃除能力検定士</dd>
  </dl>
  <div class="ba">
    <figure><img src="assets/img/${img('work1')}" alt="" width="1200" height="900" loading="lazy"><figcaption>BEFORE</figcaption></figure>
    <figure><img src="assets/img/${img('vacant')}" alt="" width="1200" height="900" loading="lazy"><figcaption>AFTER</figcaption></figure>
  </div>
  <ul class="chk"><li>キッチン・レンジフード</li><li>浴室・排水口</li><li>床・巾木・窓サッシ</li></ul>
</div>`;

const ctaBand = `
<section class="cta-band">
  <div class="wrap">
    <div class="rv">
      <span class="en">CONTACT</span>
      <h2>お見積・ご相談は、<br>無料です。</h2>
      <p>1室だけ、1回だけのご依頼でも構いません。現場を確認してからお見積を提示します。</p>
    </div>
    <div class="acts rv d2">
      <a class="btn lg" href="contact.html">お問い合わせフォーム${arr}</a>
      <a class="tel" href="${TEL_HREF}">お電話でのお問い合わせ<b>${TEL}</b></a>
    </div>
  </div>
</section>`;

const flow = `
<section class="section">
  <div class="wrap">
    <div class="sec-head rv"><div><span class="en">FLOW</span><h2>ご依頼の流れ</h2></div><p>お問い合わせから報告まで、窓口は代表が一貫して担当します。</p></div>
    <ol class="flow">
      <span class="bar" aria-hidden="true"></span>
      <li class="rv"><span class="n">STEP 01</span><h3>お問い合わせ</h3><p>電話またはフォームからご連絡ください。物件の場所と困っていることをお聞かせください。</p></li>
      <li class="rv d1"><span class="n">STEP 02</span><h3>現地確認・お見積</h3><p>現場を確認し、作業範囲と頻度を決めてお見積を提示します。見積は無料です。</p></li>
      <li class="rv d2"><span class="n">STEP 03</span><h3>作業</h3><p>決めた手順に沿って作業します。営業時間外や休日の作業もご相談ください。</p></li>
      <li class="rv d3"><span class="n">STEP 04</span><h3>報告</h3><p>作業前後の写真を付けた報告書を提出します。気になる点は次回に反映します。</p></li>
    </ol>
  </div>
</section>`;

const pages = {};

/* ---------- TOP ---------- */
pages['index.html'] = head('株式会社CORLY｜大阪の清掃会社（空室清掃・定期清掃・店舗清掃）','株式会社CORLY（大阪市中央区）は、空室清掃・日常清掃・定期清掃・店舗清掃・グリストラップ清掃を行う清掃会社です。JIS品質管理責任者と掃除能力検定士が在籍。写真付き報告書で作業結果をお伝えします。大阪・兵庫・京都・奈良・滋賀・和歌山に対応。','index.html','') + `
<section class="hero">
  <div class="wrap">
    <div class="eyebrow"><span class="en">Cleaning Company</span><small>OSAKA / KANSAI</small></div>
    <h1><span class="l"><i>きれいを、</i></span><span class="l"><i><span class="c">写真</span>で証明する</i></span><span class="l"><i>清掃会社。</i></span></h1>
    <div class="grid">
      <div>
        <p class="lead">アパート・マンションの空室清掃から、オフィス・施設の定期清掃、飲食店のグリストラップ清掃まで。有資格者が作業手順を決め、作業前後の写真付き報告書で結果をお伝えします。</p>
        <div class="cta">
          <a class="btn cyan lg" href="contact.html">無料でお見積を依頼${arr}</a>
          <a class="tel" href="${TEL_HREF}">お電話はこちら<b>${TEL}</b></a>
        </div>
      </div>
      <div class="pic-wrap"><div class="pic"><img src="assets/img/${img('hero')}" alt="清掃後の床" width="1600" height="900" fetchpriority="high"><span class="tag">Osaka, Chuo-ku</span></div>${reportCard()}</div>
    </div>
  </div>
</section>

<div class="marquee" aria-hidden="true">
  <div class="track">
    ${'<span><i>空室清掃</i></span><span>Vacant</span><span><i>日常・定期清掃</i></span><span>Regular</span><span><i>店舗・飲食店清掃</i></span><span>Restaurant</span><span><i>グリストラップ清掃</i></span><span>Grease trap</span><span><i>写真付き報告書</i></span><span>Photo report</span>'.repeat(2)}
  </div>
</div>

<section class="section" id="service">
  <div class="wrap">
    <div class="sec-head rv"><div><span class="en">SERVICE</span><h2>清掃サービス</h2></div><div><p>住まい、オフィス、店舗。現場ごとに作業範囲と頻度を決めて、同じ品質で繰り返します。</p></div></div>
    <div class="svc">
      <a class="svc-row rv" href="vacant.html">
        <div class="pic rv-pic"><img src="assets/img/${img('vacant')}" alt="空室清掃" width="1200" height="900" loading="lazy"></div>
        <div class="body"><span class="n">01</span><h3>空室清掃<small>Vacant cleaning</small></h3><p>退去後のアパート・マンションを、次の入居者を迎えられる状態に。管理会社様・オーナー様からのご依頼に対応します。</p><ul class="tags"><li>1室から</li><li>管理会社・オーナー様</li><li>写真付き報告書</li></ul><span class="more">詳しく見る</span></div>
      </a>
      <a class="svc-row rev rv" href="regular.html">
        <div class="pic rv-pic"><img src="assets/img/${img('regular')}" alt="日常・定期清掃" width="1200" height="900" loading="lazy"></div>
        <div class="body"><span class="n">02</span><h3>日常・定期清掃<small>Regular cleaning</small></h3><p>オフィス、医療・介護施設、集合住宅の共用部。決めた頻度で、決めた品質を守り続けます。</p><ul class="tags"><li>週1回〜月1回</li><li>営業時間外の作業</li><li>床洗浄・ワックス</li></ul><span class="more">詳しく見る</span></div>
      </a>
      <a class="svc-row rv" href="store.html">
        <div class="pic rv-pic"><img src="assets/img/${img('store')}" alt="店舗・飲食店清掃" width="1200" height="900" loading="lazy"></div>
        <div class="body"><span class="n">03</span><h3>店舗・飲食店清掃<small>Restaurant / Store</small></h3><p>厨房のグリストラップ、換気まわり、客席の床とガラス。臭いと油のトラブルを防ぎます。</p><ul class="tags"><li>グリストラップ</li><li>深夜・早朝対応</li><li>厨房から客席まで</li></ul><span class="more">詳しく見る</span></div>
      </a>
    </div>
  </div>
</section>

<section class="section tight">
  <div class="wrap">
    <div class="sec-head rv"><div><span class="en">REASON</span><h2>CORLYが選ばれる理由</h2></div><div class="idx" aria-hidden="true">03</div></div>
    <div class="reasons">
      <div class="reason rv"><span class="num">01</span><h3>有資格者が作業手順を決める</h3><p>JIS品質管理責任者と掃除能力検定士が在籍。現場ごとに手順と確認項目を決め、誰が作業しても同じ品質になるようにしています。</p></div>
      <div class="reason rv d1"><span class="num">02</span><h3>写真付き報告書で結果を残す</h3><p>作業前後の写真と確認項目を報告書にまとめて提出します。現場に行かなくても状態がわかります。</p></div>
      <div class="reason rv d2"><span class="num">03</span><h3>代表が直接対応</h3><p>お問い合わせから見積、現場確認まで代表が担当します。担当者が変わらず、判断が速い。</p></div>
    </div>
  </div>
</section>

<section class="section field-cyan">
  <div class="wrap">
    <div class="feature">
      <div class="rv">
        <div class="sec-head one"><div><span class="en">REPORT</span><h2>作業は、写真で報告します。</h2></div></div>
        <p>「きれいになったか」を口頭ではなく写真でお伝えします。作業前・作業後の写真と確認項目を1枚の報告書にまとめ、作業のたびに提出します。</p>
        <ul class="checks"><li>作業前・作業後の写真</li><li>作業箇所ごとの確認項目</li><li>気になった点・次回の提案</li></ul>
      </div>
      <div class="rep-wrap rv d2">${reportCard()}</div>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="sec-head rv"><div><span class="en">WORKS</span><h2>現場から</h2></div><div><p>実際の現場写真を順次掲載します。</p></div></div>
    <div class="works rv">
      <figure><img src="assets/img/${img('work1')}" alt="床のモップがけ" width="1200" height="900" loading="lazy"><figcaption>床清掃<span>FLOOR</span></figcaption></figure>
      <figure><img src="assets/img/${img('work2')}" alt="エントランス" width="1200" height="900" loading="lazy"><figcaption>エントランス清掃<span>ENTRANCE</span></figcaption></figure>
      <figure><img src="assets/img/${img('work4')}" alt="清掃用具" width="1200" height="900" loading="lazy"><figcaption>使用する道具<span>TOOLS</span></figcaption></figure>
      <figure><div class="soon"><b>COMING SOON</b>現場写真は<br>順次掲載します。</div></figure>
    </div>
  </div>
</section>

<section class="section tight">
  <div class="wrap">
    <div class="area-grid">
      <div class="rv">
        <span class="en">AREA</span>
        <div class="big">OSAKA<i>.</i></div>
        <p>本社は大阪市中央区本町。関西一円に対応します。上記以外のエリアもご相談ください。</p>
      </div>
      <ul class="area rv d1">
        <li class="hq"><span class="num">01</span><span>大阪府<small class="mt-10">　本社・大阪市中央区</small></span></li>
        <li><span class="num">02</span><span>兵庫県</span></li>
        <li><span class="num">03</span><span>京都府</span></li>
        <li><span class="num">04</span><span>奈良県</span></li>
        <li><span class="num">05</span><span>滋賀県</span></li>
        <li><span class="num">06</span><span>和歌山県</span></li>
      </ul>
    </div>
  </div>
</section>
${flow}
<section class="section tight">
  <div class="wrap">
    <div class="company-x">
      <div class="rv">
        <div class="sec-head one"><div><span class="en">COMPANY</span><h2>会社概要</h2></div></div>
        <p class="mt-12">株式会社CORLYは、大阪市中央区を拠点とする清掃会社です。</p>
        <p class="mt-28"><a class="btn line" href="company.html">会社概要をもっと見る${arr}</a></p>
      </div>
      <table class="table rv d1">
        <tr><th>社名</th><td>株式会社CORLY（コーリー）</td></tr>
        <tr><th>代表取締役</th><td>岩崎 大樹</td></tr>
        <tr><th>所在地</th><td>${ADDR}</td></tr>
        <tr><th>事業内容</th><td>空室清掃・日常清掃・定期清掃・店舗清掃・グリストラップ清掃</td></tr>
        <tr><th>有資格者</th><td>JIS品質管理責任者／掃除能力検定士</td></tr>
      </table>
    </div>
  </div>
</section>
${ctaBand}` + foot;

/* ---------- SERVICE PAGES ---------- */
const service = (file, en, jp, desc, slot, intro, points, works) => head(`${jp}｜株式会社CORLY（大阪）`, desc, file, file) +
pageHead(en, jp, `<span>${jp}</span>`) + `
<section class="section tight">
  <div class="wrap">
    <div class="feature">
      <div class="pic rv-pic"><img src="assets/img/${img(slot)}" alt="${jp}" width="1200" height="900"></div>
      <div class="rv d1">
        <h3>${intro.title}</h3>
        <p class="mt-18">${intro.text}</p>
        <ul class="checks">${points.map(p=>`<li>${p}</li>`).join('')}</ul>
      </div>
    </div>
  </div>
</section>
<section class="section tight">
  <div class="wrap">
    <div class="sec-head rv"><div><span class="en">WORK</span><h2>作業内容</h2></div><div><p>現場に合わせて作業範囲を決めます。下記は代表的な項目です。</p></div></div>
    <ul class="worklist rv d1">${works.map(([k,v],i)=>`<li><i>${String(i+1).padStart(2,'0')}</i><b>${k}</b><span>${v}</span></li>`).join('')}</ul>
    <p class="note">料金は物件の広さ・状態・頻度により異なるため、現地確認のうえお見積します。</p>
  </div>
</section>
${flow}
${ctaBand}` + foot;

pages['vacant.html'] = service('vacant.html','VACANT CLEANING','空室清掃','大阪・関西の空室清掃（退去後クリーニング）。アパート・マンションの管理会社様・オーナー様向け。キッチン・浴室・トイレ・床・窓・建具まで、写真付き報告書で対応します。','vacant',
 {title:'退去後の部屋を、<br>次の入居者を迎えられる状態に。', text:'アパート・マンションの退去後クリーニングに対応します。原状回復のスケジュールに合わせて日程を調整し、管理会社様・オーナー様が現地に来なくても状態がわかるよう、作業前後の写真を付けて報告します。'},
 ['1室からご依頼可能','管理会社様・オーナー様の窓口対応','写真付き報告書を提出','鍵の受け渡し方法はご相談ください'],
 [['キッチン','シンク・コンロ・レンジフード・収納内'],['浴室','浴槽・壁・床・排水口・鏡・換気扇'],['トイレ・洗面','便器・タンク・洗面台・鏡・床'],['床・壁','掃除機がけ・水拭き・巾木・壁の汚れ'],['窓・サッシ','ガラス内外・サッシレール・網戸'],['建具・収納','扉・クローゼット内・棚'],['バルコニー','床の掃き掃除・排水口'],['照明・設備','照明カバー・エアコン表面・給湯器まわり']]);

pages['regular.html'] = service('regular.html','REGULAR CLEANING','日常・定期清掃','大阪・関西のオフィス・医療介護施設・マンション共用部の日常清掃・定期清掃。床洗浄・ワックス、エントランス、トイレ清掃。写真付き報告書で品質を管理します。','regular',
 {title:'決めた頻度で、<br>決めた品質を守り続けます。', text:'オフィス、医療・介護施設、集合住宅の共用部など、継続してきれいに保つ必要がある現場に対応します。作業手順と確認項目を決め、写真付きの報告書で毎回の結果を共有します。'},
 ['週1回から月1回まで頻度をご相談','有資格者が作業手順を作成','毎回の写真付き報告書','営業時間外・早朝の作業に対応'],
 [['エントランス','床の清掃・ガラス・自動ドア・マット'],['共用廊下・階段','掃き掃除・拭き掃除・手すり'],['トイレ','便器・洗面・床・消耗品の補充'],['床洗浄・ワックス','定期的な機械洗浄とワックス塗布'],['ゴミ置き場','清掃・消臭・整理'],['執務室・会議室','床・デスク周り・ゴミ回収'],['ガラス・サッシ','内側・手の届く範囲の外側'],['駐車場・外周','掃き掃除・除草のご相談']]);

pages['store.html'] = service('store.html','RESTAURANT / STORE','店舗・飲食店清掃','大阪・関西の飲食店・店舗清掃。グリストラップ清掃、厨房・換気まわり、客席の床・ガラス清掃。営業時間外の作業に対応。臭いと油のトラブルを防ぎます。','store',
 {title:'厨房の油と臭い、<br>客席の清潔さを守ります。', text:'飲食店・店舗の清掃に対応します。グリストラップや換気まわりの油汚れは放置すると臭いや詰まりの原因になります。営業時間外の作業で、営業に影響を出さずに定期的に清掃します。'},
 ['グリストラップの定期清掃','営業時間外・深夜早朝の作業に対応','厨房から客席まで一括対応','写真付き報告書を提出'],
 [['グリストラップ','汚泥・油脂の除去、槽内・バスケットの洗浄'],['厨房床・排水溝','油汚れの洗浄・排水溝の清掃'],['レンジフード・換気','フィルター・フード表面の油汚れ'],['客席床','掃除機・洗浄・ワックス'],['ガラス・入口','ガラス内外・ドア・看板まわり'],['トイレ','便器・洗面・床・消耗品'],['椅子・テーブル','拭き上げ・脚部の汚れ'],['定期メンテナンス','頻度を決めて継続的に対応']]);

/* ---------- COMPANY ---------- */
pages['company.html'] = head('会社概要｜株式会社CORLY','株式会社CORLYの会社概要。所在地：大阪府大阪市中央区本町2-3-4 アソルティ本町4F。代表取締役 岩崎大樹。設立 2024年10月。事業内容：空室清掃・日常清掃・定期清掃・店舗清掃。','company.html','company.html') + pageHead('COMPANY','会社概要','<span>会社概要</span>') + `
<section class="section tight">
  <div class="wrap">
    <div class="feature">
      <div class="pic rv-pic"><img src="assets/img/${img('office')}" alt="オフィスビル" width="1200" height="900"></div>
      <div class="rv d1">
        <span class="en">MESSAGE</span>
        <h2 class="mt-12">現場で、<br>信頼を積み上げる。</h2>
        <p class="mt-22">株式会社CORLYは、大阪市中央区を拠点とする清掃会社です。空室清掃、日常・定期清掃、店舗清掃を通じて、管理会社様・オーナー様・店舗様の「現場を任せられる相手」であり続けることを目指しています。</p>
        <p class="mt-12">作業の基準を決めること、写真で結果を残すこと、代表が直接対応すること。この3つを守り、関西一円で信頼を積み上げていきます。</p>
        <p class="sig">代表取締役<b>岩崎 大樹</b></p>
      </div>
    </div>
  </div>
</section>
<section class="section tight">
  <div class="wrap">
    <div class="sec-head rv"><div><span class="en">PROFILE</span><h2>基本情報</h2></div></div>
    <table class="table rv d1">
      <tr><th>社名</th><td>株式会社CORLY（コーリー）</td></tr>
      <tr><th>代表取締役</th><td>岩崎 大樹</td></tr>
      <tr><th>設立</th><td>2024年10月</td></tr>
      <tr><th>所在地</th><td>${ADDR}<br><a class="link sm" href="https://www.google.com/maps/search/?api=1&query=%E5%A4%A7%E9%98%AA%E5%BA%9C%E5%A4%A7%E9%98%AA%E5%B8%82%E4%B8%AD%E5%A4%AE%E5%8C%BA%E6%9C%AC%E7%94%BA2-3-4" target="_blank" rel="noopener">Googleマップで見る</a></td></tr>
      <tr><th>連絡先</th><td>TEL ${TEL}<br>FAX 06-4560-9079<br>MAIL info@corly.co.jp</td></tr>
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
<section class="section tight">
  <div class="wrap">
    <div class="contact-grid">
      <div class="rv">
        <p>お見積・ご相談は無料です。1室だけ、1回だけのご依頼でも構いません。現場を確認してからお見積を提示します。</p>
        <dl class="info">
          <dt>Phone</dt><dd class="big"><a href="${TEL_HREF}">${TEL}</a></dd>
          <dt>Mail</dt><dd><a href="mailto:info@corly.co.jp">info@corly.co.jp</a></dd>
          <dt>Fax</dt><dd>06-4560-9079</dd>
          <dt>Address</dt><dd>${ADDR}</dd>
        </dl>
      </div>
      <div class="rv d1">
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
          <div><button class="btn cyan lg" type="submit">送信する${arr}</button></div>
          <p class="form-note">送信いただいた内容は、お問い合わせへの回答のみに使用します。</p>
        </form>
      </div>
    </div>
  </div>
</section>` + foot;

/* ---------- THANKS / PRIVACY ---------- */
pages['thanks.html'] = head('送信完了｜株式会社CORLY','お問い合わせを受け付けました。','thanks.html','thanks.html').replace('<link rel="canonical"','<meta name="robots" content="noindex">\n<link rel="canonical"') + pageHead('CONTACT','送信完了','<span>送信完了</span>') + `
<section class="section tight">
  <div class="wrap prose rv">
    <p class="text-base">お問い合わせを受け付けました。内容を確認のうえ、担当者よりご連絡いたします。</p>
    <p class="mt-10">お急ぎの場合は <a class="link" href="${TEL_HREF}">${TEL}</a> までお電話ください。</p>
    <p class="mt-28"><a class="btn line" href="index.html">トップページへ戻る${arr}</a></p>
  </div>
</section>` + foot;

pages['privacy.html'] = head('プライバシーポリシー｜株式会社CORLY','株式会社CORLYの個人情報の取り扱いについて。','privacy.html','privacy.html') + pageHead('PRIVACY POLICY','プライバシーポリシー','<span>プライバシーポリシー</span>') + `
<section class="section tight">
  <div class="wrap prose rv">
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
    <p>株式会社CORLY<br>${ADDR}<br>TEL ${TEL} ／ MAIL info@corly.co.jp</p>
  </div>
</section>` + foot;

for (const [f, html] of Object.entries(pages)) fs.writeFileSync(out + f, html);
console.log('pages:', Object.keys(pages).join(', '));
