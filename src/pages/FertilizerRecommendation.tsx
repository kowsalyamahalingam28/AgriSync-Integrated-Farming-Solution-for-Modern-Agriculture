import { useState, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { fertilizers } from "@/data/fertilizers";
import { FlaskConical, Leaf, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import fertilizerImg from "@/assets/fertilizer-hands.jpg";
import seedlingImg from "@/assets/seedling-growth.jpg";
import ReactMarkdown from "react-markdown";

/* Simple SVG Pie Chart */
function PieChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return null;
  let cumulative = 0;
  const size = 160;
  const cx = size / 2, cy = size / 2, r = 60;

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
    <div className="flex items-center gap-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {slices.map((s, i) => (
          <path key={i} d={s.path} fill={s.color} stroke="hsl(var(--background))" strokeWidth="2" />
        ))}
      </svg>
      <div className="space-y-1.5">
        {slices.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: s.color }} />
            <span className="text-xs text-foreground font-medium">{s.label}</span>
            <span className="text-xs text-muted-foreground">({Math.round(s.pct * 100)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Bar chart component */
function BarChart({ data }: { data: { label: string; value: number; max: number; color: string }[] }) {
  return (
    <div className="space-y-3">
      {data.map((d, i) => (
        <div key={i}>
          <div className="flex justify-between text-xs mb-1">
            <span className="font-medium text-foreground">{d.label}</span>
            <span className="text-muted-foreground">{d.value} kg/ha</span>
          </div>
          <div className="w-full bg-muted rounded-full h-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((d.value / d.max) * 100, 100)}%` }}
              transition={{ duration: 1, delay: i * 0.15 }}
              className="h-3 rounded-full"
              style={{ backgroundColor: d.color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

const FertilizerRecommendation = () => {
  const { t } = useLanguage();
  const [form, setForm] = useState({ crop: "", soilType: "loamy", nitrogen: "", phosphorus: "", potassium: "", ph: "", yieldTarget: "", irrigation: "drip" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [progress, setProgress] = useState(0);

  const update = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const npkData = useMemo(() => {
    const n = parseFloat(form.nitrogen) || 0;
    const p = parseFloat(form.phosphorus) || 0;
    const k = parseFloat(form.potassium) || 0;
    return [
      { label: t("Nitrogen (N)", "நைட்ரஜன் (N)"), value: n, color: "hsl(152, 45%, 28%)" },
      { label: t("Phosphorus (P)", "பாஸ்பரஸ் (P)"), value: p, color: "hsl(38, 75%, 52%)" },
      { label: t("Potassium (K)", "பொட்டாசியம் (K)"), value: k, color: "hsl(25, 35%, 35%)" },
    ];
  }, [form.nitrogen, form.phosphorus, form.potassium, t]);

  const handleAI = async () => {
    setLoading(true);
    setResult("");
    setProgress(0);

    const stages = [{ p: 20 }, { p: 40 }, { p: 60 }, { p: 80 }];
    for (const stage of stages) {
      await new Promise(r => setTimeout(r, 350));
      setProgress(stage.p);
    }

    try {
      const prompt = `As a fertilizer recommendation system for Tamil Nadu, provide a detailed fertilizer prediction:
Crop: ${form.crop}, Soil: ${form.soilType}, N=${form.nitrogen}kg/ha, P=${form.phosphorus}kg/ha, K=${form.potassium}kg/ha, pH=${form.ph}, Yield Target: ${form.yieldTarget}kg/ha, Irrigation: ${form.irrigation}.

Provide predictions:
## Fertilizer Dosage Prediction (kg/ha)
| Fertilizer | Predicted Amount | Application Phase |
|-----------|-----------------|-------------------|
| Urea | [X] kg/ha | [Phase] |
| DAP | [X] kg/ha | [Phase] |
| MOP | [X] kg/ha | [Phase] |

## Micronutrient Requirements
Calcium, Zinc, Boron, Iron needs based on soil analysis.

## 3-Phase Application Schedule
1. **Basal (Day 0):** [specific amounts]
2. **Top Dressing 1 (Day 30):** [specific amounts]
3. **Top Dressing 2 (Day 60):** [specific amounts]

## Soil Amendment Recommendations
Based on current pH and nutrient levels.

## Warnings & Precautions
Any specific warnings for this crop-soil combination.

## Predicted Yield Increase
Expected yield improvement with recommended fertilization vs. no fertilization.

Use markdown formatting. Be specific with numbers.`;

      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ messages: [{ role: "user", content: prompt }], lang: "en" }),
      });

      setProgress(100);

      if (!resp.ok || !resp.body) throw new Error("Failed");
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "", full = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, idx); buf = buf.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") break;
          try { const p = JSON.parse(json); const c = p.choices?.[0]?.delta?.content; if (c) { full += c; setResult(full); } } catch { break; }
        }
      }
    } catch (e: unknown) {
      if (e instanceof Error) setResult(`Error: ${e.message}`);
      else setResult(`Error: ${String(e)}`);
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const hasNPK = parseFloat(form.nitrogen) > 0 || parseFloat(form.phosphorus) > 0 || parseFloat(form.potassium) > 0;

  return (
    <div className="min-h-screen font-body">
      <Navbar />
      <section className="relative pt-16 overflow-hidden">
        <div className="relative h-56 md:h-72">
          <img src={fertilizerImg} alt="Fertilizer" className="absolute inset-0 w-full h-full object-cover" loading="eager" />
          <div className="absolute inset-0 bg-gradient-to-r from-earth/70 to-gold/50" />
          <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 text-center">
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="w-14 h-14 rounded-full bg-primary-foreground/15 backdrop-blur flex items-center justify-center mb-3">
              <FlaskConical className="h-7 w-7 text-primary-foreground" />
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-5xl font-display font-extrabold text-primary-foreground mb-2">
              {t("Smart Fertilizer Guide", "ஸ்மார்ட் உர வழிகாட்டி")}
            </motion.h1>
            <p className="text-primary-foreground/80 text-sm">{t("Visual NPK analysis with AI-powered recommendations", "AI பரிந்துரைகளுடன் காட்சி NPK பகுப்பாய்வு")}</p>
          </div>
        </div>
      </section>

      <div className="px-4 pb-8">
        <div className="container mx-auto max-w-6xl">
          {/* Form */}
          <div className="bg-card border border-border rounded-2xl p-6 mt-8 shadow-lg">
            <h2 className="font-display font-bold text-lg flex items-center gap-2 mb-4">
              <FlaskConical className="h-5 w-5 text-primary" />
              {t("Input Parameters", "உள்ளீட்டு அளவுருக்கள்")}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <input type="text" value={form.crop} onChange={e => update("crop", e.target.value)} placeholder={t("Crop name", "பயிர் பெயர்")} className="p-2.5 rounded-xl border border-border bg-background text-sm" />
              <select value={form.soilType} onChange={e => update("soilType", e.target.value)} className="p-2.5 rounded-xl border border-border bg-background text-sm">
                {["loamy", "sandy", "clay", "red", "black", "alluvial"].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <input type="number" value={form.nitrogen} onChange={e => update("nitrogen", e.target.value)} placeholder="N (kg/ha)" className="p-2.5 rounded-xl border border-border bg-background text-sm" />
              <input type="number" value={form.phosphorus} onChange={e => update("phosphorus", e.target.value)} placeholder="P (kg/ha)" className="p-2.5 rounded-xl border border-border bg-background text-sm" />
              <input type="number" value={form.potassium} onChange={e => update("potassium", e.target.value)} placeholder="K (kg/ha)" className="p-2.5 rounded-xl border border-border bg-background text-sm" />
              <input type="number" step="0.1" value={form.ph} onChange={e => update("ph", e.target.value)} placeholder="pH" className="p-2.5 rounded-xl border border-border bg-background text-sm" />
              <input type="number" value={form.yieldTarget} onChange={e => update("yieldTarget", e.target.value)} placeholder={t("Yield target kg/ha", "மகசூல் இலக்கு")} className="p-2.5 rounded-xl border border-border bg-background text-sm" />
              <select value={form.irrigation} onChange={e => update("irrigation", e.target.value)} className="p-2.5 rounded-xl border border-border bg-background text-sm">
                {["drip", "sprinkler", "flood", "rainfed"].map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>

            {/* Visual NPK Charts */}
            {hasNPK && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 bg-accent/30 rounded-xl p-5">
                <div>
                  <h3 className="text-sm font-bold text-foreground mb-3">{t("NPK Distribution", "NPK விநியோகம்")}</h3>
                  <PieChart data={npkData} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground mb-3">{t("Nutrient Levels", "ஊட்டச்சத்து அளவுகள்")}</h3>
                  <BarChart data={[
                    { label: "N", value: parseFloat(form.nitrogen) || 0, max: 140, color: "hsl(152, 45%, 28%)" },
                    { label: "P", value: parseFloat(form.phosphorus) || 0, max: 145, color: "hsl(38, 75%, 52%)" },
                    { label: "K", value: parseFloat(form.potassium) || 0, max: 205, color: "hsl(25, 35%, 35%)" },
                  ]} />
                </div>
              </div>
            )}

            {/* Progress */}
            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 bg-accent/30 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-xs font-medium">{t("Analyzing...", "பகுப்பாய்வு...")}</span>
                  <span className="text-xs font-bold text-primary ml-auto">{progress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <motion.div animate={{ width: `${progress}%` }} className="bg-primary h-2 rounded-full" />
                </div>
              </motion.div>
            )}

            <Button onClick={handleAI} disabled={loading || !form.crop} className="w-full mt-4 gap-2 py-5 rounded-xl">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <FlaskConical className="h-5 w-5" />}
              {loading ? t("Predicting...", "கணிப்பு...") : t("Get Recommendation", "பரிந்துரை பெறு")}
            </Button>
          </div>

          {result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6 bg-card border border-border rounded-2xl p-6 md:p-8 prose prose-sm max-w-none prose-headings:font-display prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground prose-table:text-muted-foreground">
              <ReactMarkdown>{result}</ReactMarkdown>
            </motion.div>
          )}

          {/* NPK Guide */}
          <h2 className="text-2xl font-display font-bold text-foreground mt-12 mb-6 text-center">{t("Understanding NPK", "NPK புரிந்துகொள்ளுதல்")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { letter: "N", name: t("Nitrogen", "நைட்ரஜன்"), desc: t("Promotes leaf and stem growth. Essential for leafy vegetables and cereals.", "இலை மற்றும் தண்டு வளர்ச்சியை ஊக்குவிக்கிறது."), color: "bg-primary text-primary-foreground", border: "border-primary/30" },
              { letter: "P", name: t("Phosphorus", "பாஸ்பரஸ்"), desc: t("Supports root development, flowering, and fruit formation.", "வேர் வளர்ச்சி, பூக்கும் நிலை மற்றும் பழ உருவாக்கம்."), color: "bg-secondary text-secondary-foreground", border: "border-secondary/30" },
              { letter: "K", name: t("Potassium", "பொட்டாசியம்"), desc: t("Improves disease resistance, drought tolerance, and fruit quality.", "நோய் எதிர்ப்பு, வறட்சி சகிப்புத்தன்மை மற்றும் பழ தரம்."), color: "bg-earth text-earth-foreground", border: "border-earth/30" },
            ].map((npk, i) => (
              <motion.div key={npk.letter} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className={`text-center bg-card rounded-2xl p-6 border-2 ${npk.border}`}>
                <div className={`w-14 h-14 rounded-full ${npk.color} flex items-center justify-center mx-auto mb-3 text-xl font-bold shadow-lg font-display`}>{npk.letter}</div>
                <h3 className="font-display font-bold text-foreground mb-2">{npk.name}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{npk.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Tips with image */}
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <img src={seedlingImg} alt="Plant growth" className="w-full h-full object-cover rounded-2xl" loading="lazy" />
            <div className="bg-accent/50 rounded-2xl p-6 border border-border flex flex-col justify-center">
              <h3 className="font-display text-xl font-bold text-foreground mb-4">{t("Application Best Practices", "பயன்பாட்டு சிறந்த நடைமுறைகள்")}</h3>
              <div className="space-y-3">
                {[
                  { en: "Always do a soil test before applying fertilizers", ta: "உரங்களை பயன்படுத்தும் முன் மண் பரிசோதனை செய்யுங்கள்" },
                  { en: "Apply in split doses for better absorption", ta: "சிறந்த உறிஞ்சுதலுக்கு பிரித்து போடுங்கள்" },
                  { en: "Water immediately after applying", ta: "உரம் போட்ட உடனேயே நீர் ஊற்றவும்" },
                  { en: "Avoid fertilizing during heavy rain", ta: "கனமழையின் போது உரமிடுவதைத் தவிர்க்கவும்" },
                  { en: "Use neem-coated urea for slow release", ta: "மெதுவான வெளியீட்டுக்கு வேப்ப பூசிய யூரியா" },
                ].map((tip, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-xs text-muted-foreground">{t(tip.en, tip.ta)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default FertilizerRecommendation;
