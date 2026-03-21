import { useState, useRef } from "react";

// ── CONSTANTS ─────────────────────────────────────────────────
const C = {
  bg: "#050508",
  surface: "#0c0c14",
  border: "rgba(255,255,255,0.07)",
  gold: "#F0B429",
  goldDim: "rgba(240,180,41,0.12)",
  text: "#F0EEE8",
  textDim: "rgba(240,238,232,0.45)",
  textMuted: "rgba(240,238,232,0.25)",
};

const CHANNELS = [
  { id: "walkin",   icon: "🚶", label: "飛び込み",  color: "#F97316", online: false },
  { id: "phone",    icon: "📞", label: "電話",       color: "#10B981", online: false },
  { id: "email",    icon: "✉️", label: "メール",    color: "#6366F1", online: true  },
  { id: "line",     icon: "💬", label: "LINE",       color: "#4ADE80", online: true  },
  { id: "instagram",icon: "📷", label: "Instagram", color: "#EC4899", online: true  },
  { id: "x",        icon: "✖️", label: "X/DM",     color: "#1D9BF0", online: true  },
  { id: "google",   icon: "🔍", label: "GBP/SEO",  color: "#FACC15", online: true  },
  { id: "referral", icon: "🤝", label: "紹介",      color: "#A78BFA", online: false },
];

const STAGES = ["未接触","初回接触","提案済","交渉中","成約","失注"];
const STAGE_COLOR = {
  "未接触":  "#64748B",
  "初回接触":"#F59E0B",
  "提案済":  "#6366F1",
  "交渉中":  "#F97316",
  "成約":    "#10B981",
  "失注":    "#EF4444",
};
const TYPE_ICON  = { 歯科:"🦷", 薬局:"💊", 介護:"🏥", 保育:"🌸", 美容:"✨", 医療:"⚕️", 飲食:"🍽", 工場:"🏭" };
const TYPE_COLOR = { 歯科:"#6366F1", 薬局:"#10B981", 介護:"#F97316", 保育:"#EC4899", 美容:"#A78BFA", 医療:"#14B8A6", 飲食:"#F59E0B", 工場:"#94A3B8" };

const initTargets = [
  { id:1, name:"さくら歯科クリニック",    type:"歯科", stage:"交渉中",  channels:["walkin","email"],        lat:34.705, lng:135.502, priority:"高", note:"院長と直接話した。来週返答", filters:0,  monthly:0,      lastContact:"3日前", referrer:"" },
  { id:2, name:"ひまわり調剤薬局",       type:"薬局", stage:"提案済",  channels:["phone","line"],          lat:34.702, lng:135.498, priority:"高", note:"LINE見積送付済",             filters:3,  monthly:9000,   lastContact:"1日前", referrer:"" },
  { id:3, name:"北大阪介護センター",      type:"介護", stage:"成約",    channels:["walkin","email","line"], lat:34.708, lng:135.506, priority:"高", note:"清掃＋フィルター契約済",     filters:12, monthly:85000,  lastContact:"今日",  referrer:"" },
  { id:4, name:"みどり保育園",           type:"保育", stage:"初回接触",channels:["walkin"],                lat:34.700, lng:135.494, priority:"中", note:"園長が前向き。再訪予定",     filters:0,  monthly:0,      lastContact:"5日前", referrer:"北大阪介護センター" },
  { id:5, name:"天神橋エステサロン",      type:"美容", stage:"未接触",  channels:[],                       lat:34.706, lng:135.510, priority:"中", note:"",                           filters:0,  monthly:0,      lastContact:"—",    referrer:"" },
  { id:6, name:"淀川メディカルクリニック",type:"医療", stage:"提案済",  channels:["email","instagram"],     lat:34.710, lng:135.500, priority:"高", note:"Instagram DM→メール移行済", filters:0,  monthly:0,      lastContact:"2日前", referrer:"" },
  { id:7, name:"グランツ歯科",           type:"歯科", stage:"初回接触",channels:["x","phone"],             lat:34.697, lng:135.504, priority:"高", note:"X DMで反応あり。電話アポ待ち",filters:0, monthly:0,      lastContact:"今日",  referrer:"" },
  { id:8, name:"なにわ飲食チェーン本部",  type:"飲食", stage:"未接触",  channels:[],                       lat:34.703, lng:135.512, priority:"低", note:"本部落とせば20店舗",         filters:0,  monthly:0,      lastContact:"—",    referrer:"" },
];

const TALK_SCRIPTS = {
  歯科: { open:"「院内感染対策について、10分ほどお時間いただけますか。フィルター1枚から始められます」", close:"「今月中にご決断いただければ初月無料です。いかがでしょうか」", objection:"「コストのご心配は当然です。まずは1枚だけお試し設置で効果をご確認ください」" },
  介護: { open:"「入居者様とスタッフの感染リスク低減について実績があります。15分だけいただけますか」", close:"「施設長様のご判断次第で来週から設置できます。ご決断をお聞かせください」", objection:"「他社と比較いただいて構いません。ただし空気の王様の抗菌性能はJIS認証済みです」" },
  薬局: { open:"「薬局内の空気品質は患者様の信頼に直結します。御社の衛生環境を拝見できますか」", close:"「月額は1枚から始められ、解約もいつでも可能です。まずお試しいただけますか」", objection:"「他社製品との違いは原材料の抗菌成分濃度です。データをお見せします」" },
  保育: { open:"「園児の感染症予防について、保護者からのご要望はありますか？空気品質でお役に立てます」", close:"「補助金対象になる可能性もあります。まず1週間の無料体験はいかがでしょうか」", objection:"「予算のご心配は承知です。リースプランなら初期費用ゼロで導入できます」" },
  飲食: { open:"「食の安全・空気の清潔さは飲食店のブランドです。チェーン全店での衛生管理をご提案します」", close:"「本部でご契約いただければ全店一括対応いたします。まず3店舗のお試しから始めませんか」", objection:"「他チェーンでの導入実績もございます。事例をご覧いただけますか」" },
};

const COMPETITORS = [
  { name:"ダスキン",    weakness:"高単価・契約縛りが強い",   ourEdge:"月額フレキシブル・即解約可能" },
  { name:"地元清掃会社",weakness:"フィルター事業なし・一本足",ourEdge:"清掃＋空気品質の複合提案" },
  { name:"大手ビルメン",weakness:"小規模施設対応が遅い・担当者が変わる",ourEdge:"岩崎が直接担当・即レスポンス" },
];

const DM_TEMPLATES = {
  instagram: "【ご縁があり拝見しました】\n\n素敵な施設ですね。私どもは大阪で清掃・空気品質管理を手がけております株式会社CORLYと申します。\n\n感染対策・消臭・空気清浄を月額定額でご提供しており、御施設のような環境に特にご好評いただいています。\n\n10分だけお時間いただけませんか？\n\n株式会社CORLY 岩崎",
  x:         "はじめまして。株式会社CORLYの岩崎と申します。\n\n貴施設の感染対策・空気品質改善についてご提案があります。\n\nフィルター設置1枚から始められ、清掃との複合プランもございます。\n\nDMでご相談いただけますか？",
  line:      "いつもお世話になっております。\n株式会社CORLY 岩崎です。\n\n空気の王様フィルターについてご提案資料をお送りしてもよろしいでしょうか。\n\nご都合のよいお時間をお知らせください。",
  email:     "件名：【ご提案】空気品質管理サービスのご案内\n\n拝啓\n\n平素より格別のご高配を賜り、厚く御礼申し上げます。\n株式会社CORLY 代表の岩崎と申します。\n\nこの度は貴施設の衛生管理・空気品質改善についてご提案の機会をいただきたく、ご連絡差し上げました。\n\n弊社が取り扱う「空気の王様」は抗菌・抗ウイルス性能を持つ空気清浄フィルターで、大阪市内の医療・介護・保育施設様に導入いただいております。\n\n月額定額制でリスクなくお試しいただけます。\n\n一度15分ほどお時間をいただけますでしょうか。\n\n敬具\n株式会社CORLY\n代表取締役 岩崎",
};

// ── MAP ───────────────────────────────────────────────────────
function MapView({ targets, selected, onSelect }) {
  const minLat=34.694, maxLat=34.713, minLng=135.490, maxLng=135.516;
  const toX = lng => ((lng-minLng)/(maxLng-minLng))*100;
  const toY = lat => ((maxLat-lat)/(maxLat-minLat))*100;
  return (
    <div style={{ position:"relative", width:"100%", paddingBottom:"52%", background:"linear-gradient(160deg,#080d18,#060a14)", borderRadius:16, overflow:"hidden", border:"1px solid rgba(255,255,255,0.07)" }}>
      {[20,40,60,80].map(p=>(
        <div key={p}>
          <div style={{position:"absolute",left:`${p}%`,top:0,bottom:0,width:1,background:"rgba(255,255,255,0.03)"}}/>
          <div style={{position:"absolute",top:`${p}%`,left:0,right:0,height:1,background:"rgba(255,255,255,0.03)"}}/>
        </div>
      ))}
      <div style={{position:"absolute",top:8,left:12,fontSize:8,color:"rgba(255,255,255,0.2)",letterSpacing:"0.12em"}}>大阪市北区周辺</div>
      <div style={{position:"absolute",top:8,right:12,fontSize:9,color:"rgba(255,255,255,0.18)"}}>N↑</div>
      {targets.map(t=>{
        const x=toX(t.lng), y=toY(t.lat);
        const isSel=selected?.id===t.id;
        const sc=STAGE_COLOR[t.stage];
        return (
          <div key={t.id} onClick={()=>onSelect(t)} style={{position:"absolute",left:`${x}%`,top:`${y}%`,transform:"translate(-50%,-50%)",cursor:"pointer",zIndex:isSel?10:2}}>
            <div style={{width:isSel?38:28,height:isSel?38:28,borderRadius:"50%",background:isSel?TYPE_COLOR[t.type]:`${TYPE_COLOR[t.type]}55`,border:`2px solid ${isSel?"#fff":sc}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:isSel?17:12,boxShadow:isSel?`0 0 18px ${TYPE_COLOR[t.type]}`:`0 0 5px ${sc}60`,transition:"all 0.2s"}}>
              {TYPE_ICON[t.type]}
            </div>
            {isSel && (
              <div style={{position:"absolute",bottom:"calc(100% + 7px)",left:"50%",transform:"translateX(-50%)",background:"#10101e",border:`1px solid ${TYPE_COLOR[t.type]}`,borderRadius:8,padding:"4px 9px",whiteSpace:"nowrap",fontSize:10,fontWeight:700,color:"#fff",boxShadow:"0 4px 14px rgba(0,0,0,0.6)"}}>
                {t.name}
              </div>
            )}
            {t.stage==="成約" && <div style={{position:"absolute",top:-4,right:-4,width:12,height:12,borderRadius:"50%",background:"#10B981",border:"2px solid #050508",fontSize:7,display:"flex",alignItems:"center",justifyContent:"center"}}>✓</div>}
          </div>
        );
      })}
    </div>
  );
}

// ── CHANNEL BADGE ─────────────────────────────────────────────
function ChannelBadge({ ch }) {
  const c = CHANNELS.find(x=>x.id===ch);
  if (!c) return null;
  return (
    <span style={{fontSize:9,color:c.color,background:`${c.color}15`,border:`1px solid ${c.color}35`,borderRadius:20,padding:"2px 7px",whiteSpace:"nowrap"}}>
      {c.icon} {c.label}
    </span>
  );
}

// ── QUICK LOG MODAL ────────────────────────────────────────────
function QuickLog({ target, onClose, onSave }) {
  const [ch, setCh] = useState("");
  const [result, setResult] = useState("");
  const [note, setNote] = useState("");
  const [next, setNext] = useState("");
  return (
    <Modal onClose={onClose} title={`⚡ 5秒ログ｜${target.name}`}>
      <div style={{marginBottom:12}}>
        <Label>チャネル</Label>
        <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
          {CHANNELS.map(c=>(
            <button key={c.id} onClick={()=>setCh(c.id)} style={{padding:"5px 10px",borderRadius:20,fontSize:10,cursor:"pointer",background:ch===c.id?`${c.color}25`:"transparent",border:`1px solid ${ch===c.id?c.color:"rgba(255,255,255,0.12)"}`,color:ch===c.id?c.color:"rgba(255,255,255,0.45)"}}>
              {c.icon} {c.label}
            </button>
          ))}
        </div>
      </div>
      <div style={{marginBottom:12}}>
        <Label>結果</Label>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {["会えた・話した","留守・不在","折り返し依頼","メール送付済","DM送信済","断られた"].map(r=>(
            <button key={r} onClick={()=>setResult(r)} style={{padding:"5px 10px",borderRadius:20,fontSize:10,cursor:"pointer",background:result===r?"rgba(240,180,41,0.2)":"transparent",border:`1px solid ${result===r?"#F0B429":"rgba(255,255,255,0.12)"}`,color:result===r?"#F0B429":"rgba(255,255,255,0.45)"}}>
              {r}
            </button>
          ))}
        </div>
      </div>
      <TextArea label="メモ（話した内容）" value={note} onChange={setNote} rows={2} placeholder="院長と15分話せた。来週金曜に返答もらえる予定" />
      <TextInput label="次のアクション" value={next} onChange={setNext} placeholder="来週火曜にフォローメール送る" />
      <ActionBtn color="#F0B429" onClick={()=>{ onSave({ch,result,note,next}); onClose(); }}>記録する</ActionBtn>
    </Modal>
  );
}

// ── DM COMPOSER ───────────────────────────────────────────────
function DMComposer({ target, onClose }) {
  const [ch, setCh] = useState("line");
  const [body, setBody] = useState(DM_TEMPLATES.line);
  const [sent, setSent] = useState(false);
  const onlineCh = CHANNELS.filter(c=>c.online);
  return (
    <Modal onClose={onClose} title={`📨 一斉DM送信｜${target.name}`}>
      <div style={{marginBottom:12}}>
        <Label>送信チャネル</Label>
        <div style={{display:"flex",gap:6,overflowX:"auto",scrollbarWidth:"none"}}>
          {onlineCh.map(c=>(
            <button key={c.id} onClick={()=>{ setCh(c.id); setBody(DM_TEMPLATES[c.id]||DM_TEMPLATES.line); }} style={{flexShrink:0,padding:"5px 10px",borderRadius:20,fontSize:10,cursor:"pointer",background:ch===c.id?`${c.color}25`:"transparent",border:`1px solid ${ch===c.id?c.color:"rgba(255,255,255,0.12)"}`,color:ch===c.id?c.color:"rgba(255,255,255,0.45)"}}>
              {c.icon} {c.label}
            </button>
          ))}
        </div>
      </div>
      <textarea value={body} onChange={e=>setBody(e.target.value)} rows={9} style={{width:"100%",padding:"11px",borderRadius:10,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",color:C.text,fontSize:12,lineHeight:1.7,outline:"none",resize:"none",marginBottom:12}}/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        <button onClick={()=>{setSent(true);setTimeout(()=>{setSent(false);onClose();},1500);}} style={{padding:"11px",borderRadius:11,background:sent?"rgba(16,185,129,0.2)":"rgba(240,180,41,0.15)",border:`1px solid ${sent?"#10B981":"#F0B429"}50`,color:sent?"#34D399":"#F0B429",fontSize:12,fontWeight:700,cursor:"pointer"}}>
          {sent?"✓ 送信完了！":"📤 送信する"}
        </button>
        <button onClick={()=>{ navigator.clipboard?.writeText(body); }} style={{padding:"11px",borderRadius:11,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.45)",fontSize:12,cursor:"pointer"}}>
          📋 コピー
        </button>
      </div>
    </Modal>
  );
}

// ── ESTIMATE BUILDER ──────────────────────────────────────────
function EstimateScreen() {
  const [client,setClient]=useState("");
  const [items,setItems]=useState([
    {id:1,name:"日常清掃（週5日）",qty:1,unit:"月",price:80000},
    {id:2,name:"空気の王様フィルター",qty:5,unit:"枚/月",price:2200},
  ]);
  const [sent,setSent]=useState(null);
  const sub=items.reduce((s,i)=>s+i.qty*i.price,0);
  const tax=Math.floor(sub*0.1);
  const total=sub+tax;
  const profit=Math.floor(sub*0.175);
  const upd=(id,k,v)=>setItems(p=>p.map(i=>i.id===id?{...i,[k]:v}:i));
  return (
    <div style={{padding:"16px 14px 100px"}}>
      <SectionTitle color="#F0B429">📋 見積書作成</SectionTitle>
      <div style={{marginBottom:12}}>
        <Label>宛先</Label>
        <input value={client} onChange={e=>setClient(e.target.value)} placeholder="例：さくら歯科クリニック 御中" style={inputStyle}/>
      </div>
      <Label>明細</Label>
      {items.map(item=>(
        <div key={item.id} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:10,padding:"10px 11px",marginBottom:8}}>
          <div style={{display:"flex",gap:6,marginBottom:7}}>
            <input value={item.name} onChange={e=>upd(item.id,"name",e.target.value)} placeholder="項目名" style={{...inputStyle,flex:1,padding:"7px 10px",fontSize:12}}/>
            <button onClick={()=>setItems(p=>p.filter(i=>i.id!==item.id))} style={{width:28,height:32,borderRadius:7,background:"rgba(239,68,68,0.12)",border:"1px solid rgba(239,68,68,0.25)",color:"#F87171",fontSize:14,cursor:"pointer"}}>×</button>
          </div>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            <input type="number" value={item.qty} onChange={e=>upd(item.id,"qty",Number(e.target.value))} style={{...inputStyle,width:50,textAlign:"center",padding:"6px 6px",fontSize:12}}/>
            <input value={item.unit} onChange={e=>upd(item.id,"unit",e.target.value)} style={{...inputStyle,width:68,padding:"6px 8px",fontSize:12}}/>
            <input type="number" value={item.price} onChange={e=>upd(item.id,"price",Number(e.target.value))} placeholder="単価" style={{...inputStyle,flex:1,padding:"6px 8px",fontSize:12}}/>
            <span style={{fontSize:11,color:"#F0B429",fontWeight:700,whiteSpace:"nowrap"}}>¥{(item.qty*item.price).toLocaleString()}</span>
          </div>
        </div>
      ))}
      <button onClick={()=>setItems(p=>[...p,{id:Date.now(),name:"",qty:1,unit:"式",price:0}])} style={{width:"100%",padding:"8px",borderRadius:10,background:"transparent",border:"1px dashed rgba(255,255,255,0.18)",color:"rgba(255,255,255,0.35)",fontSize:12,cursor:"pointer",marginBottom:14}}>＋ 明細を追加</button>
      <div style={{background:"rgba(240,180,41,0.07)",border:"1px solid rgba(240,180,41,0.22)",borderRadius:12,padding:"13px 15px",marginBottom:14}}>
        {[["小計",sub],["消費税（10%）",tax]].map(([l,v])=>(
          <div key={l} style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
            <span style={{fontSize:11,color:C.textDim}}>{l}</span>
            <span style={{fontSize:11,color:"rgba(255,255,255,0.65)"}}>¥{v.toLocaleString()}</span>
          </div>
        ))}
        <div style={{height:1,background:"rgba(240,180,41,0.2)",margin:"8px 0"}}/>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
          <span style={{fontSize:14,fontWeight:700,color:"#F0B429"}}>合計（税込）</span>
          <span style={{fontSize:18,fontWeight:700,color:"#F0B429"}}>¥{total.toLocaleString()}</span>
        </div>
        <div style={{textAlign:"right",fontSize:10,color:"#10B981"}}>想定利益 ¥{profit.toLocaleString()}</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6}}>
        {[["📄 PDF","pdf","#6366F1"],["✉️ メール","mail","#10B981"],["💬 LINE","line","#4ADE80"],["📋 コピー","copy","#94A3B8"]].map(([l,m,col])=>(
          <button key={m} onClick={()=>{setSent(m);setTimeout(()=>setSent(null),2000);}} style={{padding:"10px 4px",borderRadius:10,background:sent===m?`${col}25`:`${col}12`,border:`1px solid ${col}${sent===m?"80":"40"}`,color:sent===m?"#fff":col,fontSize:10,fontWeight:700,cursor:"pointer",transition:"all 0.2s"}}>
            {sent===m?"✓":""}　{l}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── PIPELINE ──────────────────────────────────────────────────
function PipelineScreen({ targets }) {
  return (
    <div style={{padding:"14px 14px 100px"}}>
      <SectionTitle color="#4ECDC4">🔀 パイプライン</SectionTitle>
      {STAGES.filter(s=>s!=="未接触").map(stage=>{
        const items=targets.filter(t=>t.stage===stage);
        const col=STAGE_COLOR[stage];
        return (
          <div key={stage} style={{marginBottom:14}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
              <div style={{width:10,height:10,borderRadius:"50%",background:col,boxShadow:`0 0 6px ${col}`}}/>
              <span style={{fontSize:11,fontWeight:700,color:col}}>{stage}</span>
              <span style={{fontSize:10,color:C.textMuted}}>({items.length}件)</span>
              <div style={{flex:1,height:1,background:`${col}20`}}/>
            </div>
            {items.length===0
              ? <div style={{fontSize:11,color:C.textMuted,paddingLeft:18}}>案件なし</div>
              : items.map(t=>(
                <div key={t.id} style={{background:`${STAGE_COLOR[t.stage]}08`,border:`1px solid ${STAGE_COLOR[t.stage]}25`,borderRadius:11,padding:"11px 13px",marginBottom:7,marginLeft:18}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                    <div>
                      <span style={{fontSize:13,fontWeight:600}}>{TYPE_ICON[t.type]} {t.name}</span>
                      <div style={{fontSize:10,color:C.textMuted,marginTop:2}}>最終接触：{t.lastContact}</div>
                    </div>
                    {t.monthly>0 && <span style={{fontSize:11,color:"#F0B429",fontWeight:700}}>¥{t.monthly.toLocaleString()}/月</span>}
                  </div>
                  <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                    {t.channels.map(ch=><ChannelBadge key={ch} ch={ch}/>)}
                  </div>
                  {t.note && <div style={{fontSize:10,color:C.textDim,marginTop:6}}>💬 {t.note}</div>}
                </div>
              ))
            }
          </div>
        );
      })}
    </div>
  );
}

// ── TALK SCRIPT ───────────────────────────────────────────────
function TalkScreen() {
  const [type,setType]=useState("歯科");
  const script=TALK_SCRIPTS[type]||TALK_SCRIPTS["歯科"];
  return (
    <div style={{padding:"14px 14px 100px"}}>
      <SectionTitle color="#EC4899">💬 AI営業トーク</SectionTitle>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:16}}>
        {Object.keys(TALK_SCRIPTS).map(t=>(
          <button key={t} onClick={()=>setType(t)} style={{padding:"5px 11px",borderRadius:20,fontSize:11,cursor:"pointer",background:type===t?`${TYPE_COLOR[t]}25`:"transparent",border:`1px solid ${type===t?TYPE_COLOR[t]:"rgba(255,255,255,0.12)"}`,color:type===t?TYPE_COLOR[t]:"rgba(255,255,255,0.45)"}}>
            {TYPE_ICON[t]} {t}
          </button>
        ))}
      </div>
      {[["🎯 オープニング（最初の一言）","open","#F0B429"],["🤝 クロージング","close","#10B981"],["💪 切り返し（断られたとき）","objection","#F97316"]].map(([label,key,col])=>(
        <div key={key} style={{marginBottom:12}}>
          <div style={{fontSize:10,color:col,fontWeight:700,letterSpacing:"0.08em",marginBottom:6}}>{label}</div>
          <div style={{background:`${col}08`,border:`1px solid ${col}25`,borderRadius:11,padding:"12px 14px",position:"relative"}}>
            <div style={{fontSize:13,color:C.text,lineHeight:1.75,marginBottom:10}}>{script[key]}</div>
            <button onClick={()=>navigator.clipboard?.writeText(script[key])} style={{fontSize:10,color:col,background:`${col}12`,border:`1px solid ${col}30`,borderRadius:8,padding:"4px 10px",cursor:"pointer"}}>📋 コピー</button>
          </div>
        </div>
      ))}
      <div style={{marginTop:16}}>
        <div style={{fontSize:10,color:C.textMuted,fontWeight:700,letterSpacing:"0.08em",marginBottom:10}}>🏆 競合比較（その場で使える）</div>
        {COMPETITORS.map((c,i)=>(
          <div key={i} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:11,padding:"11px 13px",marginBottom:8}}>
            <div style={{fontWeight:700,fontSize:12,marginBottom:6}}>vs {c.name}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <div><div style={{fontSize:9,color:"#EF4444",marginBottom:3}}>競合の弱点</div><div style={{fontSize:11,color:"rgba(255,255,255,0.65)"}}>{c.weakness}</div></div>
              <div><div style={{fontSize:9,color:"#10B981",marginBottom:3}}>CORLYの強み</div><div style={{fontSize:11,color:"rgba(255,255,255,0.65)"}}>{c.ourEdge}</div></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── KPI DASHBOARD ─────────────────────────────────────────────
function KPIScreen({ targets }) {
  const won=targets.filter(t=>t.stage==="成約");
  const monthlyRevenue=won.reduce((s,t)=>s+t.monthly,0);
  const monthlyProfit=Math.floor(monthlyRevenue*0.175)+(won.reduce((s,t)=>s+t.filters,0)*1750);
  const totalFilters=targets.reduce((s,t)=>s+t.filters,0);
  const convRate=targets.length>0?Math.floor((won.length/targets.length)*100):0;
  const goal=500000;
  const pct=Math.min(Math.floor((monthlyProfit/goal)*100),100);

  const channelStats=CHANNELS.map(ch=>({
    ...ch,
    count:targets.filter(t=>t.channels.includes(ch.id)).length,
    won:targets.filter(t=>t.channels.includes(ch.id)&&t.stage==="成約").length,
  })).sort((a,b)=>b.count-a.count);

  return (
    <div style={{padding:"14px 14px 100px"}}>
      <SectionTitle color="#F0B429">👑 経営KPI</SectionTitle>
      {/* Main numbers */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
        {[
          {label:"月利益",value:`¥${monthlyProfit.toLocaleString()}`,color:"#F0B429",big:true},
          {label:"目標達成率",value:`${pct}%`,color:"#10B981",big:true},
          {label:"フィルター枚数",value:`${totalFilters}枚`,color:"#6366F1"},
          {label:"成約件数",value:`${won.length}件`,color:"#4ECDC4"},
          {label:"成約率",value:`${convRate}%`,color:"#EC4899"},
          {label:"商談中",value:`${targets.filter(t=>["初回接触","提案済","交渉中"].includes(t.stage)).length}件`,color:"#F97316"},
        ].map(k=>(
          <div key={k.label} style={{background:`${k.color}09`,border:`1px solid ${k.color}25`,borderRadius:12,padding:"12px",textAlign:"center"}}>
            <div style={{fontSize:k.big?22:18,fontWeight:700,color:k.color}}>{k.value}</div>
            <div style={{fontSize:9,color:C.textMuted,marginTop:3}}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Progress */}
      <div style={{background:"rgba(240,180,41,0.07)",border:"1px solid rgba(240,180,41,0.2)",borderRadius:12,padding:"13px 15px",marginBottom:16}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}>
          <span style={{fontSize:11,color:C.textDim}}>月利益50万目標</span>
          <span style={{fontSize:11,color:"#F0B429",fontWeight:700}}>¥{monthlyProfit.toLocaleString()} / ¥500,000</span>
        </div>
        <div style={{height:7,background:"rgba(255,255,255,0.07)",borderRadius:4,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${pct}%`,background:"linear-gradient(90deg,#F0B429,#F97316)",borderRadius:4,transition:"width 0.5s",boxShadow:"0 0 10px rgba(240,180,41,0.5)"}}/>
        </div>
        <div style={{fontSize:10,color:C.textMuted,marginTop:6}}>あと¥{(goal-monthlyProfit).toLocaleString()}で現場離脱可能</div>
      </div>

      {/* Channel performance */}
      <div style={{fontSize:10,color:C.textMuted,fontWeight:700,letterSpacing:"0.1em",marginBottom:8}}>📡 チャネル別パフォーマンス</div>
      {channelStats.filter(c=>c.count>0).map(c=>(
        <div key={c.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 11px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:9,marginBottom:6}}>
          <span style={{fontSize:16,flexShrink:0}}>{c.icon}</span>
          <span style={{fontSize:12,flex:1,color:c.online?"rgba(255,255,255,0.7)":"rgba(255,255,255,0.7)"}}>{c.label}</span>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <span style={{fontSize:10,color:C.textMuted}}>接触 {c.count}</span>
            <span style={{fontSize:10,color:"#10B981",fontWeight:700}}>成約 {c.won}</span>
            <div style={{width:50,height:4,background:"rgba(255,255,255,0.08)",borderRadius:2,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${c.count>0?Math.floor((c.won/c.count)*100):0}%`,background:c.color,borderRadius:2}}/>
            </div>
          </div>
        </div>
      ))}

      {/* Weekly KPI */}
      <div style={{fontSize:10,color:C.textMuted,fontWeight:700,letterSpacing:"0.1em",marginBottom:8,marginTop:16}}>📊 今週のKPI</div>
      {[
        {label:"飛び込み訪問",cur:8,goal:15,color:"#F97316"},
        {label:"オンラインDM",cur:12,goal:20,color:"#6366F1"},
        {label:"フォローアップ",cur:5,goal:10,color:"#10B981"},
        {label:"フィルター交渉",cur:3,goal:5,color:"#F0B429"},
        {label:"成約",cur:0,goal:1,color:"#EC4899"},
      ].map(k=>(
        <div key={k.label} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:9,padding:"9px 12px",marginBottom:6}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
            <span style={{fontSize:11}}>{k.label}</span>
            <span style={{fontSize:11,color:k.color,fontWeight:700}}>{k.cur} / {k.goal}</span>
          </div>
          <div style={{height:4,background:"rgba(255,255,255,0.06)",borderRadius:2,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${Math.min((k.cur/k.goal)*100,100)}%`,background:k.color,borderRadius:2}}/>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── FILTER LEDGER ─────────────────────────────────────────────
function FilterScreen({ targets }) {
  const installed=targets.filter(t=>t.filters>0);
  const totalFilters=installed.reduce((s,t)=>s+t.filters,0);
  const totalProfit=totalFilters*1750;
  return (
    <div style={{padding:"14px 14px 100px"}}>
      <SectionTitle color="#14B8A6">🌬️ フィルター台帳</SectionTitle>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:14}}>
        {[
          {label:"設置枚数",value:`${totalFilters}枚`,color:"#14B8A6"},
          {label:"月利益",value:`¥${totalProfit.toLocaleString()}`,color:"#F0B429"},
          {label:"目標比",value:`${Math.floor((totalFilters/175)*100)}%`,color:"#6366F1"},
        ].map(k=>(
          <div key={k.label} style={{background:`${k.color}0a`,border:`1px solid ${k.color}22`,borderRadius:11,padding:"11px",textAlign:"center"}}>
            <div style={{fontSize:18,fontWeight:700,color:k.color}}>{k.value}</div>
            <div style={{fontSize:9,color:C.textMuted,marginTop:2}}>{k.label}</div>
          </div>
        ))}
      </div>
      <div style={{height:5,background:"rgba(255,255,255,0.06)",borderRadius:3,overflow:"hidden",marginBottom:16}}>
        <div style={{height:"100%",width:`${Math.min((totalFilters/175)*100,100)}%`,background:"linear-gradient(90deg,#14B8A6,#6366F1)",borderRadius:3}}/>
      </div>
      <div style={{fontSize:10,color:C.textMuted,marginBottom:12}}>目標175枚まであと {Math.max(175-totalFilters,0)}枚</div>
      {installed.map(t=>(
        <div key={t.id} style={{background:"rgba(20,184,166,0.06)",border:"1px solid rgba(20,184,166,0.18)",borderRadius:11,padding:"12px 14px",marginBottom:8}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
            <span style={{fontWeight:600,fontSize:13}}>{TYPE_ICON[t.type]} {t.name}</span>
            <span style={{fontSize:13,fontWeight:700,color:"#14B8A6"}}>{t.filters}枚</span>
          </div>
          <div style={{display:"flex",gap:12,fontSize:11,color:C.textDim}}>
            <span>月収益 <span style={{color:"#F0B429",fontWeight:700}}>¥{(t.filters*1750).toLocaleString()}</span></span>
            <span>原価 ¥{(t.filters*500).toLocaleString()}</span>
            <span>利益率 <span style={{color:"#10B981"}}>75%</span></span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── SHARED PRIMITIVES ─────────────────────────────────────────
const inputStyle = { width:"100%", padding:"9px 12px", borderRadius:9, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", color:"#F0EEE8", fontSize:13, outline:"none" };
function Label({children}){ return <div style={{fontSize:9,color:"rgba(240,238,232,0.4)",letterSpacing:"0.1em",marginBottom:6,textTransform:"uppercase"}}>{children}</div>; }
function TextInput({label,value,onChange,placeholder}){ return <div style={{marginBottom:12}}>{label&&<Label>{label}</Label>}<input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={inputStyle}/></div>; }
function TextArea({label,value,onChange,rows=3,placeholder}){ return <div style={{marginBottom:12}}>{label&&<Label>{label}</Label>}<textarea value={value} onChange={e=>onChange(e.target.value)} rows={rows} placeholder={placeholder} style={{...inputStyle,resize:"none",lineHeight:1.6}}/></div>; }
function ActionBtn({children,color="#F0B429",onClick}){ return <button onClick={onClick} style={{width:"100%",padding:"12px",borderRadius:11,background:`${color}20`,border:`1px solid ${color}50`,color,fontSize:13,fontWeight:700,cursor:"pointer",marginTop:4}}>{children}</button>; }
function SectionTitle({children,color="#F0B429"}){ return <div style={{fontWeight:700,fontSize:16,color,marginBottom:14}}>{children}</div>; }
function Modal({children,onClose,title}){
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",display:"flex",alignItems:"flex-end",zIndex:300}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{width:"100%",maxWidth:500,margin:"0 auto",background:"#0d0d1e",borderRadius:"20px 20px 0 0",padding:"18px 16px 40px",border:"1px solid rgba(255,255,255,0.1)",maxHeight:"88vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div style={{fontWeight:700,fontSize:14}}>{title}</div>
          <button onClick={onClose} style={{background:"none",border:"none",color:"rgba(255,255,255,0.35)",fontSize:22,cursor:"pointer",lineHeight:1}}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── TARGET LIST ───────────────────────────────────────────────
function TargetList({ targets, setTargets, setDmTarget, setLogTarget, setScreen }) {
  const [filterStage,setFilterStage]=useState("全て");
  const [filterType,setFilterType]=useState("全て");
  const [filterChannel,setFilterChannel]=useState("全て");

  const filtered=targets.filter(t=>
    (filterStage==="全て"||t.stage===filterStage)&&
    (filterType==="全て"||t.type===filterType)&&
    (filterChannel==="全て"||t.channels.includes(filterChannel))
  );

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{padding:"8px 14px",background:C.surface,borderBottom:`1px solid ${C.border}`}}>
        <div style={{display:"flex",gap:5,overflowX:"auto",marginBottom:5,scrollbarWidth:"none"}}>
          {["全て",...STAGES].map(s=><FilterBtn key={s} label={s} active={filterStage===s} color={s==="全て"?"#F0B429":STAGE_COLOR[s]} onClick={()=>setFilterStage(s)}/>)}
        </div>
        <div style={{display:"flex",gap:5,overflowX:"auto",marginBottom:5,scrollbarWidth:"none"}}>
          {["全て",...Object.keys(TYPE_ICON)].map(t=><FilterBtn key={t} label={t==="全て"?t:TYPE_ICON[t]+" "+t} active={filterType===t} color={t==="全て"?"#6366F1":TYPE_COLOR[t]} onClick={()=>setFilterType(t)}/>)}
        </div>
        <div style={{display:"flex",gap:5,overflowX:"auto",scrollbarWidth:"none"}}>
          {["全て",...CHANNELS.map(c=>c.id)].map(id=>{
            const ch=CHANNELS.find(c=>c.id===id);
            return <FilterBtn key={id} label={id==="全て"?"全チャネル":ch.icon+" "+ch.label} active={filterChannel===id} color={id==="全て"?"#94A3B8":ch.color} onClick={()=>setFilterChannel(id)}/>;
          })}
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"10px 14px 100px"}}>
        <div style={{fontSize:9,color:C.textMuted,marginBottom:8}}>{filtered.length}件表示</div>
        {filtered.map(t=>{
          const sc=STAGE_COLOR[t.stage];
          return (
            <div key={t.id} style={{background:"rgba(255,255,255,0.025)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,padding:"12px 13px",marginBottom:8,borderLeft:`3px solid ${TYPE_COLOR[t.type]}`}}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:7}}>
                <div>
                  <div style={{fontWeight:600,fontSize:13}}>{TYPE_ICON[t.type]} {t.name}</div>
                  <div style={{fontSize:9,color:C.textMuted,marginTop:2}}>最終接触：{t.lastContact}{t.referrer&&` · 紹介：${t.referrer}`}</div>
                </div>
                <span style={{fontSize:9,fontWeight:700,color:sc,background:`${sc}15`,border:`1px solid ${sc}35`,borderRadius:20,padding:"2px 7px",whiteSpace:"nowrap",marginLeft:8}}>{t.stage}</span>
              </div>
              {t.channels.length>0&&<div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:7}}>{t.channels.map(ch=><ChannelBadge key={ch} ch={ch}/>)}</div>}
              {t.note&&<div style={{fontSize:10,color:C.textDim,marginBottom:7}}>💬 {t.note}</div>}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:5}}>
                {[
                  {l:"🗺 地図",col:"#4ECDC4",fn:()=>setScreen("map")},
                  {l:"⚡ ログ",col:"#10B981",fn:()=>setLogTarget(t)},
                  {l:"📨 DM",col:"#6366F1",fn:()=>setDmTarget(t)},
                  {l:"📋 見積",col:"#F0B429",fn:()=>setScreen("estimate")},
                ].map(b=>(
                  <button key={b.l} onClick={b.fn} style={{padding:"6px 3px",borderRadius:8,background:`${b.col}12`,border:`1px solid ${b.col}30`,color:b.col,fontSize:9,fontWeight:700,cursor:"pointer"}}>
                    {b.l}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
function FilterBtn({label,active,color,onClick}){
  return <button onClick={onClick} style={{flexShrink:0,padding:"3px 9px",borderRadius:20,fontSize:9,cursor:"pointer",background:active?`${color}20`:"transparent",border:`1px solid ${active?color:"rgba(255,255,255,0.1)"}`,color:active?color:"rgba(255,255,255,0.38)",fontWeight:active?700:400,whiteSpace:"nowrap"}}>{label}</button>;
}

// ── MAIN ──────────────────────────────────────────────────────
export default function CORLYApp() {
  const [screen,setScreen]=useState("map");
  const [targets,setTargets]=useState(initTargets);
  const [selected,setSelected]=useState(null);
  const [dmTarget,setDmTarget]=useState(null);
  const [logTarget,setLogTarget]=useState(null);

  const monthlyProfit = Math.floor(
    targets.filter(t=>t.stage==="成約").reduce((s,t)=>s+t.monthly,0)*0.175
  ) + targets.reduce((s,t)=>s+t.filters,0)*1750;

  const nav=[
    {id:"map",     icon:"🗺",  label:"地図"},
    {id:"targets", icon:"🎯",  label:"ターゲット"},
    {id:"pipeline",icon:"🔀",  label:"パイプ"},
    {id:"estimate",icon:"📋",  label:"見積"},
    {id:"talk",    icon:"💬",  label:"トーク"},
    {id:"kpi",     icon:"👑",  label:"KPI"},
    {id:"filter",  icon:"🌬️", label:"台帳"},
  ];

  return (
    <div style={{height:"100vh",background:C.bg,overflow:"hidden",fontFamily:"'Hiragino Kaku Gothic ProN','Noto Sans JP',sans-serif",color:C.text,maxWidth:500,margin:"0 auto",display:"flex",flexDirection:"column"}}>

      {/* HEADER */}
      <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"11px 14px",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:9}}>
            <div style={{width:32,height:32,borderRadius:9,background:"linear-gradient(135deg,#F0B429,#F97316)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>⚡</div>
            <div>
              <div style={{fontWeight:700,fontSize:14,letterSpacing:"0.02em"}}>CORLY OS</div>
              <div style={{fontSize:9,color:C.textMuted}}>株式会社CORLY · 岩崎 · 全チャネル営業</div>
            </div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:13,fontWeight:700,color:"#F0B429"}}>¥{monthlyProfit.toLocaleString()}</div>
            <div style={{fontSize:8,color:C.textMuted}}>月利益</div>
          </div>
        </div>
        {/* Online/Offline indicator */}
        <div style={{display:"flex",gap:8,marginTop:8}}>
          <div style={{display:"flex",alignItems:"center",gap:4,fontSize:9,color:"#F97316"}}>
            <span style={{width:5,height:5,borderRadius:"50%",background:"#F97316",display:"inline-block"}}/>
            オフライン：飛び込み・電話・紹介
          </div>
          <div style={{display:"flex",alignItems:"center",gap:4,fontSize:9,color:"#6366F1"}}>
            <span style={{width:5,height:5,borderRadius:"50%",background:"#6366F1",display:"inline-block",animation:"pulse 1.5s infinite"}}/>
            オンライン：メール・LINE・Instagram・X
          </div>
        </div>
      </div>

      {/* SCREENS */}
      <div style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column"}}>
        {screen==="map" && (
          <div style={{flex:1,overflowY:"auto",padding:"14px 14px 100px"}}>
            <MapView targets={targets} selected={selected} onSelect={setSelected}/>
            {/* Legend */}
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:10,marginBottom:14}}>
              {Object.entries(TYPE_ICON).map(([t,i])=>(
                <span key={t} style={{fontSize:9,color:TYPE_COLOR[t],background:`${TYPE_COLOR[t]}12`,border:`1px solid ${TYPE_COLOR[t]}25`,borderRadius:20,padding:"2px 7px"}}>{i} {t}</span>
              ))}
            </div>
            {selected && (
              <div style={{background:`${TYPE_COLOR[selected.type]}09`,border:`1px solid ${TYPE_COLOR[selected.type]}35`,borderRadius:14,padding:"14px",animation:"fadeIn 0.2s ease"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                  <div>
                    <div style={{fontWeight:700,fontSize:15}}>{TYPE_ICON[selected.type]} {selected.name}</div>
                    <div style={{fontSize:10,color:C.textDim,marginTop:2}}>{selected.stage} · 最終接触：{selected.lastContact}</div>
                  </div>
                  <button onClick={()=>setSelected(null)} style={{background:"none",border:"none",color:C.textMuted,fontSize:20,cursor:"pointer"}}>×</button>
                </div>
                {selected.channels.length>0&&<div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:10}}>{selected.channels.map(ch=><ChannelBadge key={ch} ch={ch}/>)}</div>}
                {selected.note&&<div style={{fontSize:11,color:C.textDim,background:"rgba(255,255,255,0.03)",borderRadius:8,padding:"7px 10px",marginBottom:10}}>💬 {selected.note}</div>}
                {/* Stage quick-change */}
                <div style={{marginBottom:10}}>
                  <div style={{fontSize:9,color:C.textMuted,marginBottom:5}}>ステータス</div>
                  <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                    {STAGES.map(s=><button key={s} onClick={()=>{setTargets(p=>p.map(t=>t.id===selected.id?{...t,stage:s}:t));setSelected(p=>({...p,stage:s}));}} style={{padding:"4px 8px",borderRadius:20,fontSize:9,cursor:"pointer",background:selected.stage===s?`${STAGE_COLOR[s]}25`:"transparent",border:`1px solid ${selected.stage===s?STAGE_COLOR[s]:"rgba(255,255,255,0.12)"}`,color:STAGE_COLOR[s]}}>{s}</button>)}
                  </div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6}}>
                  {[
                    {l:"⚡ ログ",col:"#10B981",fn:()=>setLogTarget(selected)},
                    {l:"📨 DM",col:"#6366F1",fn:()=>setDmTarget(selected)},
                    {l:"📋 見積",col:"#F0B429",fn:()=>setScreen("estimate")},
                    {l:"💬 トーク",col:"#EC4899",fn:()=>setScreen("talk")},
                  ].map(b=>(
                    <button key={b.l} onClick={b.fn} style={{padding:"9px 4px",borderRadius:10,background:`${b.col}14`,border:`1px solid ${b.col}35`,color:b.col,fontSize:10,fontWeight:700,cursor:"pointer"}}>{b.l}</button>
                  ))}
                </div>
              </div>
            )}
            {/* Map stats */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginTop:14}}>
              {[
                {l:"総ターゲット",v:targets.length,col:"#6366F1"},
                {l:"商談中",v:targets.filter(t=>["初回接触","提案済","交渉中"].includes(t.stage)).length,col:"#F0B429"},
                {l:"成約",v:targets.filter(t=>t.stage==="成約").length,col:"#10B981"},
              ].map(s=>(
                <div key={s.l} style={{background:`${s.col}09`,border:`1px solid ${s.col}22`,borderRadius:11,padding:"10px",textAlign:"center"}}>
                  <div style={{fontSize:22,fontWeight:700,color:s.col}}>{s.v}</div>
                  <div style={{fontSize:9,color:C.textMuted,marginTop:2}}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        {screen==="targets"  && <TargetList targets={targets} setTargets={setTargets} setDmTarget={setDmTarget} setLogTarget={setLogTarget} setScreen={setScreen}/>}
        {screen==="pipeline" && <div style={{flex:1,overflowY:"auto"}}><PipelineScreen targets={targets}/></div>}
        {screen==="estimate" && <div style={{flex:1,overflowY:"auto"}}><EstimateScreen/></div>}
        {screen==="talk"     && <div style={{flex:1,overflowY:"auto"}}><TalkScreen/></div>}
        {screen==="kpi"      && <div style={{flex:1,overflowY:"auto"}}><KPIScreen targets={targets}/></div>}
        {screen==="filter"   && <div style={{flex:1,overflowY:"auto"}}><FilterScreen targets={targets}/></div>}
      </div>

      {/* BOTTOM NAV */}
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:500,background:"rgba(8,8,20,0.96)",backdropFilter:"blur(24px)",borderTop:`1px solid ${C.border}`,padding:"7px 4px 20px",display:"flex",justifyContent:"space-around"}}>
        {nav.map(n=>(
          <button key={n.id} onClick={()=>setScreen(n.id)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,background:"none",border:"none",cursor:"pointer",padding:"3px 6px",borderRadius:10,minWidth:40}}>
            <span style={{fontSize:screen===n.id?21:18,transition:"font-size 0.2s"}}>{n.icon}</span>
            <span style={{fontSize:8,color:screen===n.id?"#F0B429":"rgba(255,255,255,0.35)",fontWeight:screen===n.id?700:400}}>{n.label}</span>
          </button>
        ))}
      </div>

      {/* MODALS */}
      {dmTarget  && <DMComposer target={dmTarget} onClose={()=>setDmTarget(null)}/>}
      {logTarget && <QuickLog target={logTarget} onClose={()=>setLogTarget(null)} onSave={(data)=>{
        setTargets(p=>p.map(t=>t.id===logTarget.id?{...t,lastContact:"今日",note:data.note||t.note,channels:data.ch&&!t.channels.includes(data.ch)?[...t.channels,data.ch]:t.channels}:t));
      }}/>}

      <style>{`
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
        ::-webkit-scrollbar{display:none;}
        input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;}
        input,textarea{font-family:inherit;}
      `}</style>
    </div>
  );
}
