# 営業チャネルの道具選定 — FAX・問い合わせフォーム・SNS・郵送DM

- 作成日: 2026-09-29
- 担当: 営業オペレーション（道具選定）
- 調査方法: WebSearch 44回。**外部サイトの本文取得は行っていない（組織方針で遮断）ため、本書の数字はすべて検索スニペット由来（「スニペットのみ」）。契約前に出典URLの公式ページで再確認すること。**
- 前提（岩崎の制約）: 1人会社。AI（Claude 定期実行）は Gmail・Google Drive・Google Calendar・（この環境では）Google スプレッドシートを操作できる。外部サイトの本文取得と自動ブラウザ操作は不可。道具代は月 1〜2万円以内（仮置き: AI 予算と同枠）。
- 対象顧客: 賃貸管理会社（大阪北部）、尼崎の燃料配達業者。

---

## 1. 結論（各チャネルの推奨1つと月額の目安）

| チャネル | 推奨 | 月額の目安 | AI運用の形に乗るか |
|---|---|---|---|
| ① FAX | **MOVFAX スタンダード**（月額1,078円＋送信11円/枚）。メール添付PDFでFAX送信、受付通知＋結果通知がメールで返る。第2候補: 秒速FAX（基本料0円・10円/枚・前払い、送信専用） | 月100枚送信で **約2,200円**（仮置き: 1,078円＋11円×100枚。単価は出典 [F2][F3]） | **○** AIが下書き→岩崎承認→AIがGmailから「番号付き宛先」へPDF添付で送信→結果メールをAIが読む |
| ② 問い合わせフォーム | **自社運用（AIが文面・送信先リストを作り、岩崎が手で送信）**。量が要るなら FormReach（1通4.9〜11.2円、成功分のみ課金）か手動代行（20〜300円/件） | **0円**（手動）。外注時は 例: 100件×約80〜100円＝約1万円（仮置き、単価は [P1][P2]） | **△** フォーム入力はブラウザ操作なので AI は送れない。AIは「下書き＋URL一覧＋送信済み管理」まで |
| ③ SNS | **公式の無料予約投稿を軸に、Google ビジネスプロフィール（GBP）は Buffer Free、投稿の受け渡しはスプレッドシート→Zapier Free→Buffer**。note は予約投稿がプレミアム（月500円）限定 | **0〜500円**（note プレミアムを使う場合のみ500円 [S6]） | Instagram・GBP **○**（Buffer 経由で自動予約）／ X **△**（Buffer 経由は可、X API 従量化の影響を要確認）／ note **×**（API なし、岩崎が貼り付け） |
| ④ 郵送DM | **日本郵便 Webレター**（PDFアップロード→印刷・封入・郵送まで代行、白黒1通 約97〜99円） | 月20通で **約2,000円**（仮置き: 約99円×20通 [M1][M2]） | **△** Web 操作は岩崎。AIは PDF と宛名リストを Drive に用意するまで |

**推奨の組み合わせと月額合計（仮置き）**: MOVFAX 約2,200円 ＋ フォーム 0円 ＋ SNS 0〜500円 ＋ Webレター 約2,000円 ＝ **約4,200〜4,700円/月**。予算1〜2万円の枠に対して余裕があるので、残りは「フォーム送信の外注（100件≒1万円）」か「FAX の枚数増」に回せる。

**一言で**: この環境で AI が「送信まで」完結できるのは **FAX（メール→FAX）と SNS（シート→Zapier→Buffer）だけ**。フォームと郵送は AI が「下書きと台帳」、岩崎が「送信」の分業になる。

---

## 2. チャネル別の比較表

### 2.1 インターネットFAX（送信・email-to-fax）

すべて「スニペットのみ」。税込/税抜の別はスニペット表記に従う（不明は未記載）。

| サービス | メール送信 | 月額 | 送信単価 | 無料枠 | 宛先の書き方 | 送信結果の通知 | 備考 | 出典 |
|---|---|---|---|---|---|---|---|---|
| **MOVFAX**（スタンダード） | ○ | 1,078円（プレミアム4,378円） | 11円/枚（2025/12/1改定、旧: 2枚ごと8.8円） | 受信1,000枚/月無料。送信の無料枠なし | メール送信で「[FAX]に続けて送信先番号（複数はカンマ区切り）」を記入して送る方式（詳細書式はログイン後ヘルプ、要確認） | 「FAX送信受付完了通知」と「送信結果通知」の2通がメールで届く | 国産。プレミアムとの差は振り分け・サブID等の共有機能で、送受信の基本機能は同じ | [F2][F3][F4][F5] |
| **秒速FAX（送信）** | ○ | 基本料0円（Toonesポイント前払い、1pt=1円） | 10円/枚（〜5,000枚）、以降 9円→8円→7円 | なし | To＝秒速FAX発行の送信アドレス、**件名＝相手FAX番号**（市外局番から、ハイフンなし半角）、本文テキスト＋PDF添付（3つまで、パスワード付不可）。本文と添付は別ページ課金 | 管理画面で送信中/完了/失敗を確認。**失敗時はメール通知**（成功通知の有無は未確認） | 送信専用。受信番号が要るなら「秒速FAX Plus」（SOHO 550円／ベーシック 880円／ビジネス 1,100円） | [F6][F7][F8][F9] |
| **jFax** | ○ | 1,430円（月払）、年払い実質1,311円。登録手数料1,100円 | 超過 11円/枚 | 送信50ページ・受信100ページ/月 | `81＋市外局番の先頭0を除いた番号@jfaxsend.com`（例: 0123-45-6789 → 81123456789@jfaxsend.com） | 未確認（スニペットに記載なし） | eFax と同系列 | [F10][F11][F12] |
| **eFax** | ○ | 2,585円（月払）、3ヶ月6,985円、年払い25,850円（実質2,154円） | 151枚目から 11円/枚 | 送受信 各150枚/月 | `81＋先頭0を除いた番号@efaxsend.com` | 送信元メールアドレスへ成功・失敗とも完了通知が届く | 30日無料トライアルは終了との記載。月100枚超なら候補 | [F1][F13][F14] |
| **faximo** | ○ | 1,080円（請求書郵送不要なら940円） | 国内 14円/枚 | 受信1,000枚/月無料 | `ハイフンなしFAX番号@ml.faximo.jp`（別記載で @cl1.faximo.jp）。市外局番から入力 | 未確認 | 受信中心向けの料金設計 | [F15][F16][F17] |
| **InterFAX** | ○ | 1,100円（うち275円分の送信料込み） | 国内一律 22円＋税/ページ（60秒超は6秒ごとに1/10加算） | 275円分 | メール送信対応。本文＋添付を送る場合は件名末尾に「/b」指定（宛先書式は未確認） | 未確認 | 法人・API向け。単価が高い | [F18][F19][F20] |
| **メッセージプラス** | ○（メール／Web） | 月々約1,000円（月払・年払いあり） | 16円/枚（税込）。同サービス宛は無料 | 受信無料 | 未確認 | 送信元メールアドレスに送信結果が届く | FAX＋留守電 | [F21][F22] |
| KDDI ペーパーレスFAX | — | — | — | — | — | — | **2024/10/31 サービス終了**。候補外 | [F23] |
| （参考）NEXLINK（ネクスウェイ FAXDM一斉送信） | ×（Web一斉送信） | 基本料0円。ただし送信月は従量が2,000円未満でも一律2,000円請求 | 5〜10円/枚程度を想定（大量割引あり） | — | Web操作 | Web | 数百〜数千件の一斉送信向け。AIはWeb操作不可 | [F24][F25] |

**選定理由（MOVFAX）**: 月額が低く、送信も受信も1契約で持て（送信停止の返信FAXを受ける番号が要る）、受付通知と結果通知の2段階メールを AI が読み取れる。秒速FAXは最安だが送信専用のため受信番号を別途持つ必要があり、件名に番号を書く方式は Gmail 下書きの誤送信リスクが宛先方式より高い（判断は仮置き）。

### 2.2 問い合わせフォーム営業

| 区分 | 例 | 料金 | 制限・特徴 | 出典 |
|---|---|---|---|---|
| (a) 送信代行（従量） | 各社 | 1件 100〜300円が一般的。安い例で 10〜60円、最安例 20円/件（手動送信） | 手動送信は成功率が高い。成果報酬型は返信/アポ1件 1〜3万円。月額定額は月10万円前後で300〜500件 | [P1] |
| (a) 送信代行（手動重視） | SakuSaku | スモール 85円/件、スタンダード 80円/件 | BtoB専門、人的対応 | [P2][P3] |
| (b) 自動送信ツール | FormReach | 1通 4.9円（プレミアム）〜11.2円（ライト）、成功分のみ課金、上限で自動停止 | 25万件のフォームURL・350万件企業データ搭載と記載 | [P4][P5] |
| (b) 自動送信ツール | GeAIne | 月額 40,000／67,500／80,000円 | **2026/3/31 サービス終了** | [P6][P7] |
| (b) 自動送信ツール | Listers form 等 | 月額定額・送信件数無制限と記載（金額はスニペットに無し＝未登録） | — | [P2] |
| (b) FORM SEND | — | **該当サービスを特定できず**（検索ではフォーム作成ツールしか出ない）。未登録 | — | — |

- (c) 「営業お断り」表記への対応: 業界記事の共通見解は「フォーム上部やサイトポリシーの禁止文言を送信前に確認し、記載があれば送らない」。送ると苦情の典型パターンになる。受け手側は NGワード設定・CAPTCHA・Turnstile 等で自動送信を弾く運用が広がっている（自動ツールの到達率はこれで下がる）。[P8][P9][P10]
- (d) 法令・信用の論点は §3.2 参照。

### 2.3 SNS の予約投稿・自動投稿

| 媒体 | 公式の予約投稿 | 料金 | 外部ツール経由 | 出典 |
|---|---|---|---|---|
| X | Web版 x.com の投稿画面（カレンダーアイコン）から無料。同時最大64件・最長18ヶ月先。スレッド予約は不可。アプリ対応は2026年9月に始まったとの記載あり（未確認） | 0円 | X API は 2026年2月に従量課金（Pay-Per-Use）が標準化。投稿作成 $0.015/件、URL付き投稿 $0.20/件、読み取り $0.005/件。旧Basic（$200/月）は2026/6/1以降従量へ移行。Buffer/SocialDog 等の X 対応はこの影響を受けるので契約時に要確認 | [S1][S2][S3] |
| Instagram | Meta Business Suite で無料。20分後〜最大30日先（29日との記載も）、1日25件まで。フィード・ストーリーズ・リール対応 | 0円 | Buffer Free で可 | [S4][S5] |
| note | **プレミアム会員（月500円）限定**。Webブラウザのみ、30分刻み、約1年先まで | 500円/月 | 外部ツール・API なし（岩崎が貼り付け） | [S6][S7] |
| Google ビジネスプロフィール | 公式管理画面に予約機能なし（投稿はできる） | 0円 | **Buffer Free で GBP 投稿を予約可**（最新情報／特典／イベント、画像10枚・CTA・リンク可、動画不可）。Metricool は無料プランで GBP 不可。Statusbrew、Gyro-n、MEO Analytics 等の国内MEOツールも対応（料金未確認） | [S8][S9][S10][S11] |

**受け渡し基盤（無料〜数千円）**

| ツール | 無料枠 | 有料 | 用途 | 出典 |
|---|---|---|---|---|
| Buffer | Free: 3チャネル、チャネルごと予約10件（キュー上限。消化すれば再利用可）、期限なし | Essentials $5/チャネル/月（年払）、$6（月払）で予約無制限 | Instagram・GBP・X の予約先 | [S12][S13][S14] |
| Zapier | Free: 月100タスク、Zap 5本、2ステップまで | Professional $19.99〜（月750タスク〜） | Google Sheets の新規/更新行 → Buffer「Schedule Post」（日時をシートで指定可） | [S15][S16][S17] |
| Make | Free: 月1,000クレジット（旧オペレーション） | Core $9/月（年払）、$10.59（月払）で1万クレジット | Zapier の代替 | [S18] |
| SocialDog（X向け） | Free: 月間予約投稿150件、下書き無制限 | Personal/Professional/Business（金額はスニペットに無し＝未登録） | X 専用の予約・分析 | [S19][S20] |
| Hootsuite | — | Standard $99/月（年払、1ユーザー10アカウント） | 予算外 | [S21] |
| Later | — | $18.75〜82.50/月（別記載で $25〜） | 予算内だが Buffer で足りる | [S21] |

**推奨フロー（○）**: AI が「CORLY OS」シートの `SNS投稿` タブに 行（媒体・本文・画像URL(Drive共有リンク)・予約日時・承認欄）を書く → 岩崎が承認欄を「承認」にする → Zapier（更新行トリガー）→ Buffer「Schedule Post」→ Instagram／GBP／X に予約。月100件以内なら Zapier Free で収まる（仮置き: 1投稿1タスク）。note は AI が Drive に本文を置き、岩崎がプレミアムで予約投稿。

### 2.4 郵送DM（1通単位）

| サービス | 1通あたり | 内容 | AI運用 | 出典 |
|---|---|---|---|---|
| **日本郵便 Webレター** | 白黒 約97〜99円（1枚）、カラー +20円、2枚目以降 +5円/枚 | PDF/文書をWebでアップロード→印刷・宛名印字・封入・郵送まで日本郵便が実施。1通から | △ Web操作は岩崎。AIは PDF と宛名 CSV を Drive に用意 | [M1][M2][M3] |
| 日本郵便 定形郵便（自分で出す） | 110円（25g以下、2024/10/1改定） | 自分で印刷・封入・投函 | × 手作業 | [M4][M5] |
| レターパックライト／プラス | 430円／600円（2024/10/1改定） | 追跡付き。資料送付向けでDMには高い | × | [M4][M5] |
| ラクスル DM発送代行 | はがき 1通49円〜（印刷＋発送）、1通から・1,000通未満も可 | Webで入稿。封書DMの相場は 100〜160円/通、はがきDMは 50〜110円/通 | △ Web操作は岩崎 | [M6][M7] |

（参考）郵送DMの反応率は「約1%」とする業界記事あり（スニペットのみ、母集団不明）[M8]。

---

## 3. 法令・慣行（論点整理まで。**最終確認は専門家へ**）

### 3.1 FAX DM
- **規制の中身**: 特定商取引法の改正（2016年成立・2017年12月施行）で、**通信販売の FAX 広告**に「請求・承諾のない者への送信禁止（オプトイン）」が導入された。契約の申込・内容・履行に関する通知に付随する場合、請求に基づく場合は例外。承諾・請求の記録は1年保存。[L1][L2][L3][L4]
- **事業者間への適用**: 特商法は消費者保護法で、**事業者間取引（営業のために／営業として契約する者）は適用除外**とするのが業界・法律事務所記事の一致した見解。したがって「賃貸管理会社・燃料配達業者への役務の営業案内 FAX」は、特商法の FAX 広告オプトインの直接の対象にはならない可能性が高い。[L1][L2][L5]
- **残る論点**（専門家に確認）: (1) 宛先が個人事業主の場合、「営業のため」の契約かは実態判断で、代表者個人としての契約と見られる余地。(2) 岩崎の商材が「通信販売」に当たる形（Web申込で完結）なら消費者宛には規制が及ぶ。(3) 特商法以外に、受信側の紙・インク負担を理由とする苦情、しつこい送信は業務妨害・不法行為の主張リスク。
- **慣行（業界記事の共通項）**: 送信元の社名・所在地・連絡先を明記／**送信停止の受付方法（FAX返信欄・電話・メール）を原稿に必ず記載**し、停止依頼は即反映して二度と送らない／**始業前・深夜・昼休みを避け、平日日中に送る**／無関係な業種・興味のない内容を送らない／原稿は1枚に収める。[L6][L7][L8][L9]
- 「1社1回」の目安: **出典なし**（慣行としては停止依頼が無い限り再送する事業者が多い。頻度は自社ルールで決める）。
- **反応率の公開データ**: ネクスウェイ調査で「平均0.9%、中央値0.05%」、他の記事で「不特定多数宛の平均は約0.1%」。いずれもスニペットのみ、母集団・定義は未確認。[L10][L11]

### 3.2 問い合わせフォーム営業
- **特定電子メール法との関係**: フォーム送信は「電子メールの送信」そのものではないため直接の対象外とする見解と、第3条1項4号（自己の電子メールアドレスを公表している営業者への送信は同意不要）を根拠に適法とする見解がある。一方、**フォーム経由でも特定電子メール法の趣旨を守るべきとする記事**もあり、見解は割れている。[L12][L13][L14][L15]
- **返信メールが営業メールになる点**: フォームから相手がメールで返信してきた後、こちらが送る2通目以降は通常の電子メール。特定電子メール法では「取引関係にある者」「名刺等でアドレスを通知した者」等の例外はあるが、単に返信があっただけでは同意と見なされないとする解説が多い。以後の送信は、送信者表示・オプトアウト導線・停止依頼への即応を必ず付ける。[L12][L16]
- **罰則の目安**: 特定電子メール法違反は1年以下の懲役または100万円以下の罰金、法人は3,000万円以下の罰金（措置命令違反時）。[L14]
- **信用面**: 「営業お断り」記載先への送信、利用規約違反、同一企業への繰り返し送信は苦情・SNS上の晒しの典型。総務省ガイドライン [L17] の趣旨（送信者情報の表示、拒否者への再送禁止）に沿う。
- 論点整理まで。**最終確認は専門家へ。**

### 3.3 SNS
- 自社アカウントからの情報発信は広告規制の直接対象になりにくいが、実績・料金表示は景品表示法（優良誤認・有利誤認）に注意。数字は `company/01_products.md` の価格表と実績値のみ。（出典なし、一般論）

### 3.4 郵送DM
- 法人宛の郵送DMに送信規制はない。代表者個人名宛にする場合は個人情報保護法の利用目的の範囲で。（出典なし、一般論。専門家に確認）

---

## 4. AI運用「AIが下書き→岩崎が承認→AIがメールで送信指示→サービスが送る」への適合

| チャネル／道具 | 判定 | 理由 |
|---|---|---|
| FAX: MOVFAX／eFax／jFax／faximo／メッセージプラス | **○** | 宛先メールアドレスに FAX 番号を埋め込む方式。AIは Gmail 下書きに PDF を添付し、承認後に送信。結果通知メールを AI が読んで台帳に記録できる |
| FAX: 秒速FAX（送信） | **○（注意）** | 件名に番号を書く方式で1通1宛先。最安だが送信専用。誤送信対策として AI 側で「件名＝台帳の番号」を突合すること |
| FAX: InterFAX | **△** | メール送信可だが単価22円と高い。API向け |
| FAX: NEXLINK 等 一斉送信代行 | **△** | Web操作が必要。数百件以上を一気に送る時だけ岩崎が操作 |
| フォーム: 自社運用 | **△** | AIは文面・URL一覧・送信済み台帳。送信は岩崎の手作業（1件2〜3分、仮置き） |
| フォーム: FormReach 等の自動ツール | **△** | ツールのWeb画面操作が必要。AIが CSV（送信先＋文面）を Drive に用意し、岩崎が投入 |
| フォーム: 手動代行（SakuSaku 等） | **△** | AIが文面と送信先リストをメールで代行会社に渡せる。ただし発注・承認は岩崎 |
| SNS: Instagram／GBP（Sheets→Zapier→Buffer） | **○** | AI がシートに行を書き、岩崎が承認列を変えると自動で予約される |
| SNS: X（Sheets→Zapier→Buffer） | **△** | 仕組みは同じ。X API 従量化で Buffer 側の X 対応条件が変わりうるため契約時に要確認 |
| SNS: note | **×** | 予約投稿は有料会員かつブラウザ手動。AIは本文を Drive に置くまで |
| 郵送: Webレター／ラクスル | **△** | Web入稿は岩崎。AIは PDF・宛名 CSV・承認依頼メールまで |
| 郵送: 自分で投函 | **×** | 手作業 |

---

## 5. 岩崎が契約時に確認すること

**FAX（MOVFAX を第一候補）**
1. スタンダードプランで**メール送信**が使えるか（プレミアム限定でないか）と、メールでの宛先書式（[FAX]番号の書き方、複数宛先の上限）。ログイン後ヘルプ・マニュアル [F5] で確認。
2. 送信元として許可するメールアドレスの登録方法（AI が使う Gmail アドレスを登録できるか、複数登録できるか）。
3. 送信結果通知メールの差出人アドレスと件名の形式（AI が台帳突合に使う）。
4. 取得できる FAX 番号の市外局番（06 が取れるか）。停止依頼の返信 FAX を受ける番号として案内する。
5. 送信単価 11円/枚 が「60秒単位」か「ページ単位」か、A4 1枚の文字原稿が1枚課金で収まるか。
6. 秒速FAXを併用する場合: ポイントの有効期限、失敗時の再送課金、成功通知の有無。

**フォーム**
7. 代行や自動ツールを使う場合、「営業お断り」記載先を除外する運用があるか、除外リストを渡せるか。
8. 送信文面に必ず「送信停止の連絡先」と社名・所在地を入れる（`company/04_templates.md` に雛形を追加する）。

**SNS**
9. Buffer Free で X チャネルが追加できるか（X API 従量化後の条件）。Instagram はプロアカウント＋Facebookページ連携が前提。GBP はオーナー権限が必要。
10. Zapier Free の「2ステップ」制限で Sheets→Buffer が1本で組めるか（フィルタを挟むと3ステップになり有料）。無理なら Make Free（1,000クレジット）で代替。
11. 画像は Drive の共有リンクが Buffer から取得できる形（誰でも閲覧可）にする必要がある。
12. note プレミアム（500円）を契約するかは投稿頻度が月4本以上になってから（仮置き）。

**郵送**
13. Webレターの最新料金（97円か99円か、スニペットで揺れ）と、差出人・宛先 CSV の一括アップロード可否。
14. 月20通を超えるならラクスル DM の見積を取り、はがきか封書かを反応率で決める。

**共通**
15. 上記の月額合計（仮置き 約4,200〜4,700円）を `company/INPUT_REQUIRED.md` の予算欄と突合し、契約したサービス名・アカウント・月額を `company/06_data_schema.md` の正データに登録する。
16. 各チャネルの送信台帳（宛先・日時・結果・停止依頼）をスプレッドシート「CORLY OS」に持つ。停止依頼リストは全チャネル共通で参照する。

---

## 6. 出典一覧（すべてスニペットのみ。本文未読）

**FAX**
- [F1] eFax 公式 https://www.efax.co.jp/ ／料金まとめ https://internetfax-it.com/efax/ ／比較 https://www.intfax.com/company/compare.php
- [F2] MOVFAX 料金・仕様 https://movfax.jp/price/
- [F3] MOVFAX 料金改定（2025年12月1日、送信10円+税/枚） https://movfax.jp/kiyakukaitei_2025/
- [F4] MOVFAX FAX送信機能・FAQ https://movfax.jp/function/function2/ ／ https://movfax.jp/faq_cat/faq_faxtransmission/ ／プラン比較 https://movfax.jp/feature/feature2/
- [F5] MOVFAX ご利用マニュアル（PDF） https://movfax.lcloud.jp/HTML/MOVFAX_help.pdf ／送信手順 https://movfax.jp/column/how-to-send-internet-fax-with-movfax/
- [F6] 秒速FAX 送信 料金 https://fax.toones.jp/send/plan.html
- [F7] 秒速FAX メールFAX送信方法 https://fax.toones.jp/send/system/fax-mail.html
- [F8] 秒速FAX 配信状況確認／エラー通知 https://fax.toones.jp/send/system/status.html ／ https://fax.toones.jp/send/system/error.html
- [F9] 秒速FAX Plus（受信） https://fax.toones.jp/plus/
- [F10] jFax 公式 https://www.jfax.com/
- [F11] jFax 送信時のメールアドレス https://www.jfax.com/help/help05-send/help05-send-03 ／送信方法 https://www.jfax.com/how-to/send
- [F12] jFax 料金まとめ https://internetfax-it.com/jfax.html
- [F13] eFax メールでファックスを送信する https://www.efax.co.jp/efax-help/sending-fax/01-send-email
- [F14] eFax 送信トラブル（通知メール） https://www.efax.co.jp/efax-help/sending-fax/07_send_trouble ／料金・トライアル https://www.itreview.jp/products/efax/price
- [F15] faximo 価格 https://www.edicworks.com/service/faximo/price.html
- [F16] faximo 送り方 https://faximo.jp/service/function/hwtsnd.html
- [F17] faximo マニュアル https://www.edicworks.com/support/faximo/manual/sendfax/operation-s/sfx0001.html
- [F18] InterFAX 料金 https://www.interfax.jp/price/index.html
- [F19] InterFAX 送信仕様 https://www.interfax.jp/send/spec.html
- [F20] InterFAX 送信方法（/b 指定） https://www.interfax.jp/users/guide/send_03.html
- [F21] メッセージプラス 料金・仕様 https://www.messageplus.jp/spec/
- [F22] メッセージプラス FAX送信機能 https://www.messageplus.jp/function/send.html
- [F23] KDDI ペーパーレスFAX（2024/10/31終了） https://www.intfax.com/kddi-fax/ ／ https://0en-fax.com/business/kddi/
- [F24] ネクスウェイ FAXDM プラン・価格 https://faxdm.nexway.co.jp/price
- [F25] ネクスウェイ FAXDM 費用相場 https://faxdm.nexway.co.jp/blog/138 ／FAQ https://faxdm.nexway.co.jp/faq

**問い合わせフォーム**
- [P1] フォーム営業代行 料金相場 https://stock-sun.com/column/form-sales/ ／ https://www.aspicjapan.org/asu/article/46230 ／ https://dream-up.co.jp/sakusaku/media/form-sales-recommendation/
- [P2] フォーム営業ツール比較 https://japan-ai.co.jp/media/3251/ ／ https://saas-search.jp/saas-services/sales/inquiry-form-sales-automatic-tool/
- [P3] SakuSaku（BtoB専門） https://dream-up.co.jp/sakusaku/media/form-sales-recommendation/
- [P4] FormReach https://www.formrea.ch/
- [P5] FormReach ツール比較 https://www.formrea.ch/blog/best-form-outreach-tools
- [P6] GeAIne 価格 https://the.geaine2.jp/price/
- [P7] GeAIne サービス終了 https://kigyolog.com/tool.php?id=274
- [P8] 「営業お断り」表記の効果 https://vkformguard.com/guide/contact-form-no-sales
- [P9] フォーム営業のクレーム要因 https://dream-up.co.jp/sakusaku/media/toiawaseformeigyou-claim/
- [P10] 受け手側の対策 https://www.mubag.com/blog/prevent-sales-inquiry-form/ ／ https://hirogaru.jp/guide/contact-form-spam-guide/

**SNS**
- [S1] X 予約投稿（公式・64件・18ヶ月） https://holytech.jp/column/tiktok-sns-operate-sns-operate-agency-threads-2026-guide/ ／ https://sinis-x.tetemarche.co.jp/blog/x-reserve
- [S2] X API 従量課金 https://sananeblog.com/x-api-pricing/ ／ https://www.ownly.jp/sslab/twitter-apix-api-price-plan
- [S3] X API 料金（英語） https://postproxy.dev/blog/x-api-pricing-2026/ ／ https://www.outstand.so/blog/x-api-pricing
- [S4] Meta Business Suite 予約投稿（20分〜29日） https://forcle.co.jp/blog/meta-business-suite-scheduled-post/
- [S5] Meta Business Suite（1日25件・30日先） https://request.ne.jp/instagram-scheduled-posting/ ／ https://post-mesh.com/articles/instagram-scheduled-posting
- [S6] note 予約投稿はプレミアム https://www.sungrove.co.jp/note-reservation/
- [S7] note プレミアム会員でできること https://www.help-note.com/hc/ja/articles/360000279862
- [S8] Buffer × Google Business Profile https://buffer.com/google-business-profile ／ https://support.buffer.com/article/557-using-google-business-profiles-with-buffer
- [S9] GBP 投稿ヘルプ https://support.google.com/business/answer/7342169?hl=ja
- [S10] GBP 予約投稿ツール比較 https://embedsocial.jp/blog/google-posts-scheduling/ ／ https://www.aspicjapan.org/asu/article/9523
- [S11] Metricool 料金（無料で GBP 不可） https://metricool.com/pricing/ ／ https://tygartmedia.com/metricool-free-plan/
- [S12] Buffer 料金 https://buffer.com/pricing
- [S13] Buffer Free の上限（3ch・10件キュー） https://boomp.net/blog/buffer-pricing-free-plan-limits-2026 ／ https://use-apify.com/blog/buffer-free-plan-guide
- [S14] Buffer 料金解説 https://www.blotato.com/blog/buffer-pricing
- [S15] Zapier 料金 https://ai-kenkyujo.com/software/zapier-ryoukin/ ／ https://saas-kurabe.com/articles/automation/zapier.html
- [S16] Zapier × Buffer × Google Sheets https://zapier.com/apps/buffer/integrations/google-sheets
- [S17] Buffer Zapier 連携（Schedule Post・日時指定） https://buffer.com/resources/buffer-zapier-integration/
- [S18] Make 料金 https://latenode.com/blog/make-com-pricing ／ https://trackstack.tech/en/make-com-pricing-2026/
- [S19] SocialDog 有料プラン概要 https://help.social-dog.net/ja/paid_plan/plans_upgrade/paid_plans/
- [S20] SocialDog 無料プラン（月150件） https://app-tatsujin.com/socialdog-free-plan-2026/
- [S21] Hootsuite／Later 料金 https://napoleoncat.com/blog/hootsuite-pricing/ ／ https://www.g2.com/compare/hootsuite-vs-later-social

**郵送**
- [M1] 日本郵便 Webレター https://www.post.japanpost.jp/service/send/domestic/web/webletter/
- [M2] Webレター 料金表 https://www.post.japanpost.jp/send/domestic/charge/list/other.html ／カラー料金FAQ https://www.post.japanpost.jp/service/web/faq/63.html
- [M3] Webレター 1通99円から（ITmedia） https://www.itmedia.co.jp/news/articles/2112/21/news145.html
- [M4] 日本郵便 料金改定プレスリリース（2024/6/13） https://www.post.japanpost.jp/notification/pressrelease/2024/00_honsha/0613_01_01.pdf
- [M5] 国内の料金表（手紙・はがき） https://www.post.japanpost.jp/send/domestic/charge/list/one_two.html ／改定報道 https://k-tai.watch.impress.co.jp/docs/news/1627875.html
- [M6] ラクスル DM発送代行 https://st.raksul.com/directmail/estimate
- [M7] DM発送代行 料金相場 https://ec-kanji.com/posts/dm-shipping-agency-fee ／小ロット https://dmhassodaiko-hikaku.com/genre/small-lot-best3/
- [M8] 郵送DM 反応率（約1%） https://meibo-engine.com/column/mail-dm-reaction-rate.html

**法令・慣行**
- [L1] ネクスウェイ FAXDMと法律 https://faxdm.nexway.co.jp/blog/69
- [L2] ネクスウェイ 特商法改正 https://faxdm.nexway.co.jp/blog/111
- [L3] いがらし司法書士事務所 FAX広告規制 http://www.wakaba-houmu.jp/article/15826816.html
- [L4] 大塚・加藤法律事務所 特商法改正（FAX広告） https://ok-law.net/news/jirei/hourei026/
- [L5] 企業宛FAXDMは違法か https://faxdm.netreal.jp/know-how/faxdm-regulation ／ https://web.value-fax.com/blog/archives/423
- [L6] FAXDM クレーム対応マニュアル https://next-sfa.jp/journal/faxdm/faxdm-complaint/
- [L7] 弥生 迷惑FAXにならない方法 https://media.yayoi-kk.co.jp/business/5725/
- [L8] ネクスウェイ クレーム対応 https://faxdm.nexway.co.jp/blog/61
- [L9] ValueFAX クレームを受けない方法 https://web.value-fax.com/blog/archives/114
- [L10] FAXDM 反応率（ネクスウェイ 平均0.9%・中央値0.05%） https://faxdm.nexway.co.jp/blog/208 ／ https://next-sfa.jp/journal/faxdm/what-is-the-faxdm-response-rate/
- [L11] FAXDM 平均反応率 約0.1% https://urizo.jp/knowhow/65 ／ https://strate.biz/fax_dm/c_response-rate/
- [L12] 問い合わせフォームからの営業メールは合法か https://www.digital-aid.co.jp/tips/inquiry-spam/
- [L13] フォーム営業は違法か（FormReach） https://www.formrea.ch/blog/is-form-sales-illegal ／ https://form-sales.com/261/
- [L14] 特定電子メール法 解説・罰則 https://am.arara.com/blog/20191227_specifiedmail ／ https://www.dekyo.or.jp/soudan/contents/taisaku/1-2.html
- [L15] 3条1項4号（公表アドレス）を根拠とする見解 https://sales-form.com/legal/ ／ https://dream-up.co.jp/sakusaku/media/toiawaseformeigyou-ihou/
- [L16] 特定電子メール法 BtoB 適用 https://smslink.nexway.co.jp/column/03
- [L17] 総務省・消費者庁 特定電子メールの送信等に関するガイドライン https://www.soumu.go.jp/main_sosiki/joho_tsusin/d_syohi/pdf/m_mail_081114_1.pdf ／パンフレット https://www.soumu.go.jp/main_sosiki/joho_tsusin/d_syohi/pdf/m_mail_pamphlet.pdf
