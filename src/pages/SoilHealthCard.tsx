import { useState, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Heart, Loader2, Printer, Bot, Leaf } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

interface SoilResult {
  score: number;
  grade: string;
  recommendations: string[];
  priorityAction: string;
}

function GaugeDial({ value, max, label, color, unit }: { value: number; max: number; label: string; color: string; unit?: string }) {
  const pct = Math.min(value / max, 1);
  const circumference = 2 * Math.PI * 40;
  const offset = circumference * (1 - pct);
  const status = pct >= 0.7 ? "Good" : pct >= 0.4 ? "Medium" : "Low";
  const statusColor = pct >= 0.7 ? "text-primary" : pct >= 0.4 ? "text-secondary" : "text-destructive";

  return (
    <div className="flex flex-col items-center">
      <svg width="110" height="110" viewBox="0 0 110 110">
        <circle cx="55" cy="55" r="40" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
        <circle
          cx="55" cy="55" r="40" fill="none" stroke={color} strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="gauge-circle"
          transform="rotate(-90 55 55)"
        />
        <text x="55" y="50" textAnchor="middle" dy="0.35em" className="font-body text-sm font-bold fill-foreground">{value}</text>
        {unit && <text x="55" y="68" textAnchor="middle" className="font-body text-[8px] fill-muted-foreground">{unit}</text>}
      </svg>
      <span className="text-xs font-bold text-foreground mt-1">{label}</span>
      <span className={`text-[10px] font-medium ${statusColor}`}>{status}</span>
    </div>
  );
}

function PieChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return null;
  let cumulative = 0;
  const size = 140;
  const cx = size / 2, cy = size / 2, r = 55;

  const slices = data.map((d) => {
    const pct = d.value / total;
    const startAngle = cumulative * 2 * Math.PI;
    cumulative += pct;
    const endAngle = cumulative * 2 * Math.PI;
    const largeArc = pct > 0.5 ? 1 : 0;
    const x1 = cx + r * Math.cos(startAngle - Math.PI / 2);
    const y1 = cy + r * Math.sin(startAngle - Math.PI / 2);
    const x2 = cx + r * Math.cos(endAngle - Math.PI / 2);
    const y2 = cy + r * Math.sin(endAngle - Math.PI / 2);
    const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    return { ...d, path, pct };
  });

  return (
    <div className="flex flex-col items-center gap-3">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {slices.map((s, i) => (
          <path key={i} d={s.path} fill={s.color} stroke="hsl(var(--background))" strokeWidth="2" />
        ))}
      </svg>
      <div className="flex gap-3 flex-wrap justify-center">
        {slices.map((s, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: s.color }} />
            <span className="text-[10px] text-muted-foreground">{s.label} ({Math.round(s.pct * 100)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const SoilHealthCard = () => {
  const { t } = useLanguage();
  const [form, setForm] = useState({
    farmerName: "", village: "", crop: "", nitrogen: "", phosphorus: "", potassium: "", ph: "", organicMatter: "", ec: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SoilResult | null>(null);
  const [aiAdvice, setAiAdvice] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const update = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const calculateScore = () => {
    const n = parseFloat(form.nitrogen) || 0;
    const p = parseFloat(form.phosphorus) || 0;
    const k = parseFloat(form.potassium) || 0;
    const ph = parseFloat(form.ph) || 7;
    const om = parseFloat(form.organicMatter) || 0;
    const ec = parseFloat(form.ec) || 0;

    let score = 0;
    score += Math.min(n / 140, 1) * 20;
    score += Math.min(p / 100, 1) * 15;
    score += Math.min(k / 200, 1) * 15;
    score += (1 - Math.abs(ph - 6.5) / 3) * 20;
    score += Math.min(om / 5, 1) * 20;
    score += (ec < 4 ? 1 : ec < 8 ? 0.5 : 0) * 10;
    score = Math.max(0, Math.min(100, Math.round(score)));

    const grade = score >= 90 ? "A+" : score >= 80 ? "A" : score >= 70 ? "B" : score >= 50 ? "C" : "D";

    const recs: string[] = [];
    if (n < 50) recs.push(t("Apply urea or organic nitrogen sources", "யூரியா அல்லது இயற்கை நைட்ரஜன் மூலங்களை பயன்படுத்தவும்"));
    if (p < 30) recs.push(t("Add DAP or bone meal for phosphorus", "பாஸ்பரஸுக்கு DAP அல்லது எலும்பு மாவு சேர்க்கவும்"));
    if (k < 80) recs.push(t("Apply MOP or wood ash for potassium", "பொட்டாசியத்திற்கு MOP அல்லது மர சாம்பல் சேர்க்கவும்"));
    if (ph < 5.5) recs.push(t("Add lime to raise soil pH", "மண் pH ஐ உயர்த்த சுண்ணாம்பு சேர்க்கவும்"));
    if (om < 2) recs.push(t("Add compost or vermicompost for organic matter", "இயற்கை பொருள்களுக்கு உரம் அல்லது மண்புழு உரம் சேர்க்கவும்"));
    if (recs.length === 0) recs.push(t("Your soil is in excellent condition!", "உங்கள் மண் சிறந்த நிலையில் உள்ளது!"));

    const priority = recs[0];
    setResult({ score, grade, recommendations: recs.slice(0, 3), priorityAction: priority });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { calculateScore(); setLoading(false); }, 1500);
  };

  const askAI = async () => {
    setAiLoading(true);
    setAiAdvice("");
    try {
      const prompt = `Analyze this soil data for ${form.crop || 'general farming'} in Tamil Nadu:
N=${form.nitrogen}kg/ha, P=${form.phosphorus}kg/ha, K=${form.potassium}kg/ha, pH=${form.ph}, Organic Matter=${form.organicMatter}%, EC=${form.ec}dS/m.
Give 3 specific improvement recommendations and 1 priority action. Be concise and practical.`;
      const resp = await supabase.functions.invoke('chat', {
        body: { messages: [{ role: "user", content: prompt }], lang: "en" },
      });
      if (resp.error) throw resp.error;
      setAiAdvice(typeof resp.data === 'string' ? resp.data : JSON.stringify(resp.data));
    } catch {
      setAiAdvice("AI analysis unavailable. Using local calculations.");
    } finally {
      setAiLoading(false);
    }
  };

  const gradeColor = (g: string) => {
    if (g === "A+" || g === "A") return "text-primary";
    if (g === "B") return "text-secondary";
    if (g === "C") return "text-gold";
    return "text-destructive";
  };

  const n = parseFloat(form.nitrogen) || 0;
  const p = parseFloat(form.phosphorus) || 0;
  const k = parseFloat(form.potassium) || 0;

  return (
    <div className="min-h-screen font-body">
      <Navbar />
      <section className="relative pt-16 overflow-hidden">
        <div className="relative h-48 md:h-64 bg-gradient-to-r from-primary to-earth">
          <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 text-center">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-5xl font-display font-extrabold text-primary-foreground mb-3">
              {t("Soil Health Score Card", "மண் ஆரோக்கிய மதிப்பெண் அட்டை")}
            </motion.h1>
            <p className="text-primary-foreground/80 font-body">{t("Visual soil analysis with gauges and charts", "அளவீடுகள் மற்றும் வரைபடங்களுடன் காட்சி மண் பகுப்பாய்வு")}</p>
          </div>
        </div>
      </section>

      <div className="px-4 pb-8">
        <div className="container mx-auto max-w-4xl">
          <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 md:p-8 mt-8 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <Heart className="h-6 w-6 text-primary" />
              <h2 className="text-lg font-display font-bold">{t("Enter Soil Data", "மண் தரவை உள்ளிடவும்")}</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { key: "farmerName", label: t("Farmer Name", "விவசாயி பெயர்"), type: "text", placeholder: "" },
                { key: "village", label: t("Village/District", "கிராமம்/மாவட்டம்"), type: "text", placeholder: "" },
                { key: "crop", label: t("Current Crop", "தற்போதைய பயிர்"), type: "text", placeholder: t("e.g., Rice", "எ.கா., அரிசி") },
                { key: "nitrogen", label: t("Nitrogen (N) kg/ha", "நைட்ரஜன் (N) kg/ha"), type: "number", placeholder: "0-140" },
                { key: "phosphorus", label: t("Phosphorus (P) kg/ha", "பாஸ்பரஸ் (P) kg/ha"), type: "number", placeholder: "5-145" },
                { key: "potassium", label: t("Potassium (K) kg/ha", "பொட்டாசியம் (K) kg/ha"), type: "number", placeholder: "5-205" },
                { key: "ph", label: t("pH Level", "pH அளவு"), type: "number", placeholder: "4.0-9.0" },
                { key: "organicMatter", label: t("Organic Matter %", "இயற்கை பொருள் %"), type: "number", placeholder: "0-10" },
                { key: "ec", label: t("EC (dS/m)", "EC (dS/m)"), type: "number", placeholder: "0-10" },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-medium text-foreground mb-1">{f.label}</label>
                  <input type={f.type} step="any" value={(form as any)[f.key]} onChange={e => update(f.key, e.target.value)} placeholder={f.placeholder}
                    className="w-full p-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/50 transition-all"
                    required={f.key !== "farmerName" && f.key !== "village" && f.key !== "crop"} />
                </div>
              ))}
            </div>
            <Button type="submit" disabled={loading} className="w-full mt-6 gap-2 py-5 rounded-xl">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Heart className="h-5 w-5" />}
              {loading ? t("Analyzing...", "பகுப்பாய்வு...") : t("Generate Soil Health Card", "மண் ஆரோக்கிய அட்டை உருவாக்கு")}
            </Button>
          </form>

          {result && (
            <motion.div ref={printRef} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 space-y-6">
              {/* Header */}
              <div className="bg-gradient-to-r from-primary to-canopy rounded-2xl p-6 text-primary-foreground text-center">
                <h3 className="font-display text-2xl font-bold mb-1">{t("Soil Health Card", "மண் ஆரோக்கிய அட்டை")}</h3>
                {form.farmerName && <p className="text-sm opacity-80">{form.farmerName} — {form.village}</p>}
                {form.crop && <p className="text-xs opacity-60 mt-1">{t("Crop:", "பயிர்:")} {form.crop}</p>}
              </div>

              {/* Score + Pie Chart */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-card border border-border rounded-2xl p-8 text-center">
                  <div className="text-6xl font-display font-extrabold mb-2">
                    <span className={gradeColor(result.grade)}>{result.score}</span>
                    <span className="text-muted-foreground text-2xl">/100</span>
                  </div>
                  <div className={`text-3xl font-display font-bold ${gradeColor(result.grade)}`}>{t("Grade:", "தரம்:")} {result.grade}</div>
                  <div className="w-full bg-muted rounded-full h-3 max-w-md mx-auto mt-4">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${result.score}%` }} transition={{ duration: 1.5, ease: "easeOut" }} className="bg-primary h-3 rounded-full" />
                  </div>
                </div>
                <div className="bg-card border border-border rounded-2xl p-6 flex items-center justify-center">
                  <PieChart data={[
                    { label: "N", value: n, color: "hsl(152, 45%, 28%)" },
                    { label: "P", value: p, color: "hsl(38, 75%, 52%)" },
                    { label: "K", value: k, color: "hsl(25, 35%, 35%)" },
                  ]} />
                </div>
              </div>

              {/* Gauge Dials */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <h4 className="font-display font-bold text-lg mb-4 text-center">{t("Nutrient Analysis", "ஊட்டச்சத்து பகுப்பாய்வு")}</h4>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                  <GaugeDial value={n} max={140} label="N" color="hsl(152, 45%, 22%)" unit="kg/ha" />
                  <GaugeDial value={p} max={145} label="P" color="hsl(38, 75%, 52%)" unit="kg/ha" />
                  <GaugeDial value={k} max={205} label="K" color="hsl(25, 35%, 28%)" unit="kg/ha" />
                  <GaugeDial value={parseFloat(form.ph) || 0} max={14} label="pH" color="hsl(205, 55%, 48%)" />
                  <GaugeDial value={parseFloat(form.organicMatter) || 0} max={10} label="OM%" color="hsl(110, 40%, 38%)" unit="%" />
                  <GaugeDial value={parseFloat(form.ec) || 0} max={10} label="EC" color="hsl(0, 72%, 51%)" unit="dS/m" />
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-accent/50 border border-primary/20 rounded-2xl p-6">
                <h4 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-primary" />
                  {t("Recommendations", "பரிந்துரைகள்")}
                </h4>
                <div className="space-y-3">
                  {result.recommendations.map((rec, i) => (
                    <div key={i} className="flex items-start gap-3 bg-card rounded-xl p-3">
                      <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">{i + 1}</span>
                      <span className="text-sm text-muted-foreground">{rec}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 bg-secondary/10 border border-secondary/30 rounded-xl p-4">
                  <p className="text-xs font-medium text-secondary-foreground">{t("Priority Action:", "முன்னுரிமை நடவடிக்கை:")} {result.priorityAction}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 no-print">
                <Button variant="outline" onClick={() => window.print()} className="gap-2">
                  <Printer className="h-4 w-4" /> {t("Print Card", "அட்டையை அச்சிடு")}
                </Button>
                <Button onClick={askAI} disabled={aiLoading} className="gap-2">
                  {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bot className="h-4 w-4" />}
                  {t("Ask AI for Detailed Analysis", "AI விரிவான பகுப்பாய்வு")}
                </Button>
              </div>

              {aiAdvice && (
                <div className="bg-card border border-border rounded-2xl p-6">
                  <h4 className="font-display font-bold mb-3 flex items-center gap-2">
                    <Bot className="h-5 w-5 text-primary" /> {t("AI Analysis", "AI பகுப்பாய்வு")}
                  </h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{aiAdvice}</p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SoilHealthCard;
