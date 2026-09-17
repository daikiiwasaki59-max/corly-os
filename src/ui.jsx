// ── SHARED UI PRIMITIVES ──────────────────────────────────────
// App.jsx / JournalScreen.jsx の両方から使う共通パーツ。

export const C = {
  bg: "#050508",
  surface: "#0c0c14",
  border: "rgba(255,255,255,0.07)",
  gold: "#F0B429",
  goldDim: "rgba(240,180,41,0.12)",
  text: "#F0EEE8",
  textDim: "rgba(240,238,232,0.45)",
  textMuted: "rgba(240,238,232,0.25)",
};

export const inputStyle = { width:"100%", padding:"9px 12px", borderRadius:9, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", color:"#F0EEE8", fontSize:13, outline:"none" };

export function Label({children}){ return <div style={{fontSize:9,color:"rgba(240,238,232,0.4)",letterSpacing:"0.1em",marginBottom:6,textTransform:"uppercase"}}>{children}</div>; }

export function TextArea({label,value,onChange,rows=3,placeholder}){ return <div style={{marginBottom:12}}>{label&&<Label>{label}</Label>}<textarea value={value} onChange={e=>onChange(e.target.value)} rows={rows} placeholder={placeholder} style={{...inputStyle,resize:"none",lineHeight:1.6}}/></div>; }

export function ActionBtn({children,color="#F0B429",onClick,disabled}){ return <button onClick={onClick} disabled={disabled} style={{width:"100%",padding:"12px",borderRadius:11,background:`${color}20`,border:`1px solid ${color}50`,color,fontSize:13,fontWeight:700,cursor:disabled?"default":"pointer",opacity:disabled?0.55:1,marginTop:4}}>{children}</button>; }

export function SectionTitle({children,color="#F0B429"}){ return <div style={{fontWeight:700,fontSize:16,color,marginBottom:14}}>{children}</div>; }
