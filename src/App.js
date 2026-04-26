import React, { useState } from "react";
import { BarChart, Bar, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import "./App.css";

const MODEL_RULES = {
  route_base_risk: { A: 0.10, B: 0.18, C: 0.26 },
  traffic_modifier: { Light: -0.12, Medium: 0.05, Heavy: 0.28 },
  temp_coefficient: 0.022,
  temp_baseline: 30,
  hour_curve: { peak_hours: [12,13,14,15,16], peak_modifier: 0.35, safe_hours: [5,6,7,8,9], safe_modifier: -0.28 },
  feature_importance: { Departure_Hour: 0.397, Traffic_Enc: 0.277, Forecasted_Max_Temp: 0.273, Route_Enc: 0.053 },
  model_accuracy: 0.745,
};

function predictRisk(route, hour, temp, traffic) {
  let risk = MODEL_RULES.route_base_risk[route] || 0.15;
  risk += MODEL_RULES.traffic_modifier[traffic] || 0;
  risk += (temp - MODEL_RULES.temp_baseline) * MODEL_RULES.temp_coefficient;
  if (MODEL_RULES.hour_curve.peak_hours.includes(hour)) risk += MODEL_RULES.hour_curve.peak_modifier;
  if (MODEL_RULES.hour_curve.safe_hours.includes(hour)) risk += MODEL_RULES.hour_curve.safe_modifier;
  return Math.min(Math.max(risk, 0.02), 0.97);
}

function findOptimalHour(route, temp, traffic) {
  let best = { hour: 6, risk: 1 };
  for (let h = 0; h < 24; h++) {
    const r = predictRisk(route, h, temp, traffic);
    if (r < best.risk) best = { hour: h, risk: r };
  }
  return best;
}

function formatHour(h) {
  if (h === 0) return "12:00 AM";
  if (h < 12) return `${h}:00 AM`;
  if (h === 12) return "12:00 PM";
  return `${h - 12}:00 PM`;
}

const ALERTS = [
  { id: 1, type: "critical", title: "Vaccine Shipment", sub: "Over Temp!", desc: "Move to cooler storage now!", location: "Kano", time: "3 mins ago" },
  { id: 2, type: "warning", title: "Dairy Delivery", sub: "Near Threshold", desc: "Monitor closely!", location: "Port Harcourt", time: "20 mins ago" },
  { id: 3, type: "critical", title: "Antibiotics Lot #482", sub: "Temperature Breach!", desc: "Inspect immediately.", location: "Enugu", time: "1 hour ago" },
  { id: 4, type: "resolved", title: "Insulin Batch A23", sub: "Resolved", desc: "Storage stabilized.", location: "Aba", time: "2 hours ago" },
  { id: 5, type: "warning", title: "Cold Pack Route B", sub: "Delay Detected", desc: "Route congestion risk.", location: "Lagos", time: "35 mins ago" },
];

const WEEKLY_RISK = [
  { day: "Mon", risk: 22 }, { day: "Tue", risk: 58 }, { day: "Wed", risk: 34 },
  { day: "Thu", risk: 71 }, { day: "Fri", risk: 45 }, { day: "Sat", risk: 18 }, { day: "Sun", risk: 12 },
];

function generateTempData() {
  return Array.from({ length: 20 }, (_, i) => ({
    t: `${i * 3}m`,
    temp: +(6.5 + Math.sin(i * 0.6) * 2 + Math.random() * 0.8).toFixed(1),
    limit: 8,
  }));
}

function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); onLogin(); }, 1200);
  };

  return (
    <div className="screen login-screen">
      <div className="login-shapes">
        <div className="ls1"/><div className="ls2"/><div className="ls3"/>
      </div>
      <div className="login-inner">
        <div className="login-logo-row">
          <div className="logo-hex">
            <svg viewBox="0 0 48 48" fill="none" width="48" height="48">
              <polygon points="24,4 44,14 44,34 24,44 4,34 4,14" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"/>
              <polygon points="24,12 36,19 36,29 24,36 12,29 12,19" fill="rgba(255,255,255,0.25)" stroke="white" strokeWidth="1"/>
              <circle cx="24" cy="24" r="5" fill="white"/>
            </svg>
          </div>
          <div>
            <h1 className="logo-text">ColdChain<br/><span>Africa</span></h1>
          </div>
        </div>
        <p className="login-tagline">Supply Chain Intelligence for Climate Health</p>
        <div className="lf-card">
          <div className="lf-group">
            <label>Email or Phone</label>
            <input className="lf-input" type="text" placeholder="pharmacist@coldchain.ng" value={email} onChange={e => setEmail(e.target.value)}/>
          </div>
          <div className="lf-group">
            <label>Password</label>
            <input className="lf-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}/>
          </div>
          <button className="btn-primary" onClick={handleLogin} disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </button>
          <button className="btn-ghost">Login with OTP</button>
          <p className="hint-text">Demo: tap Login with any credentials</p>
        </div>
      </div>
    </div>
  );
}

function DashboardScreen({ onNavigate }) {
  const stats = [
    { label: "Safe", value: 28, color: "#22c55e", bg: "#dcfce7" },
    { label: "At Risk", value: 5, color: "#f59e0b", bg: "#fef3c7" },
    { label: "Critical", value: 2, color: "#ef4444", bg: "#fee2e2" },
    { label: "Active", value: 63, color: "#3b82f6", bg: "#dbeafe" },
  ];
  return (
    <div className="screen dash-screen">
      <div className="dash-header">
        <div>
          <p className="greet-sub">Good morning,</p>
          <h2 className="greet-name">Favour <span className="role-pill">Pharmacist</span></h2>
        </div>
        <div className="avatar">F</div>
      </div>
      <div className="stats-grid">
        {stats.map(s => (
          <div key={s.label} className="stat-tile" style={{ background: s.bg }}>
            <div className="stat-num" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-lbl">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="map-card" onClick={() => onNavigate("predict")}>
        <div className="map-label">Live Route Map</div>
        <svg viewBox="0 0 320 160" width="100%">
          <rect width="320" height="160" fill="#eff6ff" rx="10"/>
          <path d="M30 130 Q100 90 170 110 Q230 80 290 50" stroke="#3b82f6" strokeWidth="2.5" fill="none" strokeDasharray="8 4"/>
          <circle cx="30" cy="130" r="6" fill="#22c55e"/><text x="25" y="148" fontSize="9" fill="#166534">Enugu</text>
          <circle cx="170" cy="110" r="6" fill="#f59e0b"/><text x="158" y="128" fontSize="9" fill="#92400e">Onitsha</text>
          <circle cx="230" cy="80" r="8" fill="#ef4444"/><text x="218" y="70" fontSize="9" fill="#991b1b" fontWeight="700">⚠ Aba</text>
          <circle cx="290" cy="50" r="6" fill="#3b82f6"/><text x="278" y="42" fontSize="9" fill="#1e40af">PH</text>
          <rect x="210" y="138" width="100" height="16" rx="4" fill="#3b82f6" opacity="0.15"/>
          <text x="260" y="150" fontSize="9" fill="#1e3a8a" fontWeight="700" textAnchor="middle">Tap → AI Predict</text>
        </svg>
      </div>
      <div className="section-row">
        <h3>Live Alerts</h3>
        <button className="link-btn" onClick={() => onNavigate("alerts")}>See all →</button>
      </div>
      {ALERTS.slice(0,3).map(a => (
        <div key={a.id} className="alert-row" onClick={() => onNavigate("alerts")}>
          <span className={`dot dot-${a.type}`}/>
          <div className="ar-body">
            <div className="ar-title">{a.title} <span className={`sub-tag sub-${a.type}`}>{a.sub}</span></div>
            <div className="ar-meta">{a.location} · {a.time}</div>
          </div>
          <span className="ar-arrow">›</span>
        </div>
      ))}
    </div>
  );
}

function PredictScreen() {
  const [route, setRoute] = useState("A");
  const [hour, setHour] = useState(14);
  const [temp, setTemp] = useState(35);
  const [traffic, setTraffic] = useState("Heavy");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const hourData = Array.from({length:24},(_,h) => ({
    h, risk: Math.round(predictRisk(route, h, temp, traffic)*100)
  }));

  const run = () => {
    setLoading(true);
    setTimeout(() => {
      const risk = predictRisk(route, hour, temp, traffic);
      const optimal = findOptimalHour(route, temp, traffic);
      setResult({ risk, optimal, efficacy: Math.round(risk*35) });
      setLoading(false);
    }, 800);
  };

  const level = result ? (result.risk>0.6?"critical":result.risk>0.3?"warning":"safe") : null;

  return (
    <div className="screen pred-screen">
      <div className="sub-header">
        <h2>AI Risk Predictor</h2>
        <span className="model-tag">RF · 74.5% acc</span>
      </div>

      <div className="pred-form">
        <div className="fg"><label>Route</label>
          <div className="seg">{["A","B","C"].map(r=>(
            <button key={r} className={`seg-b ${route===r?"seg-on":""}`} onClick={()=>{setRoute(r);setResult(null);}}>Route {r}</button>
          ))}</div>
        </div>

        <div className="fg"><label>Departure: <b>{formatHour(hour)}</b></label>
          <input type="range" min={0} max={23} value={hour} onChange={e=>{setHour(+e.target.value);setResult(null);}} className="sl"/>
          <div className="sl-labels"><span>12AM</span><span>6AM</span><span>12PM</span><span>6PM</span><span>11PM</span></div>
        </div>

        <div className="fg"><label>Max Temp: <b>{temp}°C</b></label>
          <input type="range" min={28} max={42} value={temp} onChange={e=>{setTemp(+e.target.value);setResult(null);}} className="sl"/>
          <div className="sl-labels"><span>28°C</span><span>35°C</span><span>42°C</span></div>
        </div>

        <div className="fg"><label>Traffic</label>
          <div className="seg">{["Light","Medium","Heavy"].map(t=>(
            <button key={t} className={`seg-b ${traffic===t?"seg-on":""}`} onClick={()=>{setTraffic(t);setResult(null);}}>{t}</button>
          ))}</div>
        </div>

        <button className="btn-predict" onClick={run} disabled={loading}>
          {loading?"⏳ Analyzing...":"🔍 Run AI Prediction"}
        </button>
      </div>

      {result && (
        <div className={`res-card res-${level}`}>
          <div className="res-top">
            <div><div className="res-lbl">Breach Risk</div><div className="res-pct">{Math.round(result.risk*100)}%</div></div>
            <div className={`risk-pill pill-${level}`}>{level==="critical"?"🔴 HIGH":level==="warning"?"🟡 MODERATE":"🟢 SAFE"}</div>
          </div>
          {result.risk>0.3&&(
            <div className="rec-box">
              <span className="rec-bulb">💡</span>
              <div>
                <div className="rec-head">AI Recommendation</div>
                <div className="rec-body"><b>{formatHour(hour)}</b> is high risk. Depart at <b className="rec-hl">{formatHour(result.optimal.hour)}</b> → risk drops to <b className="rec-hl">{Math.round(result.optimal.risk*100)}%</b></div>
              </div>
            </div>
          )}
          <div className="res-metrics">
            <div className="rm"><div className="rm-v">{result.efficacy}%</div><div className="rm-l">Efficacy Loss</div></div>
            <div className="rm"><div className="rm-v">{formatHour(result.optimal.hour)}</div><div className="rm-l">Optimal Time</div></div>
            <div className="rm"><div className="rm-v">{Math.round(result.optimal.risk*100)}%</div><div className="rm-l">Min Risk</div></div>
          </div>
        </div>
      )}

      <div className="chart-block">
        <h4>Risk by Hour (current params)</h4>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={hourData} margin={{top:4,right:8,left:-22,bottom:4}}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)"/>
            <XAxis dataKey="h" tickFormatter={v=>v%6===0?formatHour(v).split(":")[0]+(v<12?"a":"p"):""} tick={{fontSize:9}}/>
            <YAxis tick={{fontSize:9}} unit="%"/>
            <Tooltip formatter={v=>[`${v}%`,"Risk"]} labelFormatter={v=>formatHour(v)}/>
            <Bar dataKey="risk" radius={[3,3,0,0]}>
              {hourData.map((d,i)=><Cell key={i} fill={d.risk>60?"#ef4444":d.risk>30?"#f59e0b":"#22c55e"}/>)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="fi-block">
        <h4>Feature Importance</h4>
        {Object.entries(MODEL_RULES.feature_importance).sort((a,b)=>b[1]-a[1]).map(([f,v])=>(
          <div key={f} className="fi-row">
            <div className="fi-lbl">{f.replace(/_/g," ").replace(" Enc","")}</div>
            <div className="fi-bg"><div className="fi-fill" style={{width:`${v*100}%`}}/></div>
            <div className="fi-pct">{(v*100).toFixed(0)}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BatchScreen() {
  const [td] = useState(generateTempData());
  return (
    <div className="screen batch-screen">
      <div className="sub-header">
        <h2>Insulin Batch A23</h2>
        <span className="crit-badge">CRITICAL</span>
      </div>
      <div className="chart-card">
        <h4>Temperature (°C)</h4>
        <ResponsiveContainer width="100%" height={140}>
          <LineChart data={td}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)"/>
            <XAxis dataKey="t" tick={{fontSize:9}} interval={4}/>
            <YAxis domain={[4,12]} tick={{fontSize:9}}/>
            <Tooltip formatter={v=>[`${v}°C`,"Temp"]}/>
            <Line type="monotone" dataKey="limit" stroke="#ef4444" strokeDasharray="5 3" strokeWidth={1.5} dot={false}/>
            <Line type="monotone" dataKey="temp" stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{r:4}}/>
          </LineChart>
        </ResponsiveContainer>
        <div className="breach-note">⚠ 8°C limit exceeded</div>
      </div>
      <div className="bm-list">
        {[["Current Temp","9.2°C","breach-val"],["Required Range","2°C – 8°C",""],["Potency Remaining","62%","safe-val"],["Time Over Limit","45 mins","warn-val"]].map(([l,v,c])=>(
          <div key={l} className="bm-row"><span className="bm-lbl">{l}</span><span className={`bm-val ${c}`}>{v} ›</span></div>
        ))}
      </div>
      <div className="route-card">
        <h4>Route Info</h4>
        <div className="ri-row"><span className="dot dot-safe"/>Enugu → Aba</div>
        <div className="ri-row"><span className="dot dot-critical"/>High-Risk Zone: <span className="breach-val"> Onitsha</span></div>
      </div>
    </div>
  );
}

function AlertsScreen() {
  const [filter, setFilter] = useState("All");
  const filtered = filter==="All"?ALERTS:ALERTS.filter(a=>a.type===filter.toLowerCase());
  return (
    <div className="screen alerts-screen">
      <div className="sub-header"><h2>Alerts</h2><span className="crit-count">{ALERTS.filter(a=>a.type==="critical").length} critical</span></div>
      <div className="filter-bar">{["All","Critical","Warning","Resolved"].map(f=>(
        <button key={f} className={`f-btn ${filter===f?"f-on":""}`} onClick={()=>setFilter(f)}>{f}</button>
      ))}</div>
      <input className="search-box" placeholder="🔍  Search alerts..."/>
      <div className="al-list">
        {filtered.map(a=>(
          <div key={a.id} className={`al-row al-${a.type}`}>
            <span className={`dot dot-${a.type}`}/>
            <div className="al-body">
              <div className="al-title">{a.title} <span className={`sub-tag sub-${a.type}`}>{a.sub}</span></div>
              <div className="al-desc">{a.desc}</div>
              <div className="al-meta">{a.location} · {a.time}</div>
            </div>
            <span className="ar-arrow">›</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AnalyticsScreen() {
  return (
    <div className="screen analytics-screen">
      <div className="sub-header"><h2>Analytics</h2></div>
      <div className="an-tabs"><button className="an-tab an-on">Insights</button><button className="an-tab">Loss Prevention</button><button className="an-tab">AI Reports</button></div>
      <div className="insight-tile">
        <span className="it-icon">🔥</span>
        <div><div className="it-title">High-Risk Routes This Week</div><div className="it-sub">Northern Axis · 2 PM to 5 PM</div></div>
      </div>
      <h4 className="an-h4">Weekly Risk Pattern</h4>
      <ResponsiveContainer width="100%" height={150}>
        <BarChart data={WEEKLY_RISK} margin={{top:4,right:8,left:-22,bottom:4}}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)"/>
          <XAxis dataKey="day" tick={{fontSize:11}}/>
          <YAxis tick={{fontSize:9}} unit="%"/>
          <Tooltip formatter={v=>[`${v}%`,"Risk"]}/>
          <Bar dataKey="risk" radius={[4,4,0,0]}>
            {WEEKLY_RISK.map((d,i)=><Cell key={i} fill={d.risk>60?"#ef4444":d.risk>40?"#f59e0b":"#22c55e"}/>)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <h4 className="an-h4">AI Recommendations</h4>
      <div className="rec-tags">
        <div className="rec-tag">🚫 Avoid Daytime Transport on Route X</div>
        <div className="rec-tag warn-tag">⚠ Flagged: Distributor Y – Repeated Violations</div>
      </div>
      <h4 className="an-h4">Savings Summary</h4>
      <div className="sav-row">
        <div className="sav-card sc-green"><div className="sav-v">$12,500</div><div className="sav-l">Cost Saved</div></div>
        <div className="sav-card sc-teal"><div className="sav-v">88%</div><div className="sav-l">Potency Preserved</div></div>
      </div>
    </div>
  );
}

const NAV = [
  {id:"dashboard",label:"Home",icon:"⊞"},
  {id:"predict",label:"Predict",icon:"🧠"},
  {id:"batch",label:"Batch",icon:"📦"},
  {id:"alerts",label:"Alerts",icon:"🔔"},
  {id:"analytics",label:"Stats",icon:"📊"},
];

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [screen, setScreen] = useState("dashboard");

  if (!loggedIn) return (
    <div className="shell">
      <div className="login-shell">
        <LoginScreen onLogin={() => setLoggedIn(true)} />
      </div>
    </div>
  );

  return (
    <div className="shell app-shell">
      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="sidebar">
        <div className="sb-logo">
          <div className="sb-logo-icon">
            <svg viewBox="0 0 48 48" fill="none" width="32" height="32">
              <polygon points="24,4 44,14 44,34 24,44 4,34 4,14" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"/>
              <polygon points="24,12 36,19 36,29 24,36 12,29 12,19" fill="rgba(255,255,255,0.25)" stroke="white" strokeWidth="1"/>
              <circle cx="24" cy="24" r="5" fill="white"/>
            </svg>
          </div>
          <div>
            <div className="sb-brand">ColdChain</div>
            <div className="sb-brand-sub">Africa</div>
          </div>
        </div>
        <div className="sb-user">
          <div className="sb-avatar">F</div>
          <div>
            <div className="sb-name">Favour</div>
            <div className="sb-role">Pharmacist</div>
          </div>
        </div>
        <nav className="sb-nav">
          {NAV.map(n => (
            <button key={n.id} className={`sb-nb ${screen===n.id?"sb-on":""}`} onClick={()=>setScreen(n.id)}>
              <span className="sb-icon">{n.icon}</span>
              <span className="sb-lbl">{n.label}</span>
            </button>
          ))}
        </nav>
        <div className="sb-footer">
          <div className="sb-model-info">
            <div className="sb-mi-title">AI Model</div>
            <div className="sb-mi-val">RandomForest · 74.5% acc</div>
            <div className="sb-mi-val">8,000 training rows</div>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="main-content">
        <div className="content-inner">
          {screen==="dashboard"&&<DashboardScreen onNavigate={setScreen}/>}
          {screen==="predict"&&<PredictScreen/>}
          {screen==="batch"&&<BatchScreen/>}
          {screen==="alerts"&&<AlertsScreen/>}
          {screen==="analytics"&&<AnalyticsScreen/>}
        </div>
      </main>

      {/* ── MOBILE BOTTOM NAV (hidden on desktop) ── */}
      <nav className="bnav">
        {NAV.map(n=>(
          <button key={n.id} className={`nb ${screen===n.id?"nb-on":""}`} onClick={()=>setScreen(n.id)}>
            <span className="nb-icon">{n.icon}</span>
            <span className="nb-lbl">{n.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
