import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Sprout, Loader2, Leaf, Award, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import seedlingImg from "@/assets/seedling-growth.jpg";

const cropImages: Record<string, string> = {
  rice: "🌾", paddy: "🌾", wheat: "🌾", sugarcane: "🎋", cotton: "🏵️",
  groundnut: "🥜", tomato: "🍅", onion: "🧅", banana: "🍌",
  coconut: "🥥", maize: "🌽", turmeric: "🟡", chili: "🌶️",
  mango: "🥭", soybean: "🫘", grape: "🍇", potato: "🥔",
  apple: "🍎", orange: "🍊", watermelon: "🍉", corn: "🌽",
};

function getCropEmoji(name: string): string {
  const lower = name.toLowerCase();
  for (const [key, emoji] of Object.entries(cropImages)) {
    if (lower.includes(key)) return emoji;
  }
  return "🌱";
}

type FormState = {
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  temperature: number;
  humidity: number;
  ph: number;
  rainfall: number;
};

const CropRecommendation = () => {
  const { t } = useLanguage();
  const [form, setForm] = useState<FormState>({ nitrogen: 50, phosphorus: 50, potassium: 50, temperature: 28, humidity: 70, ph: 6.5, rainfall: 150 });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [parsedCrops, setParsedCrops] = useState<{ name: string; match: number; reason: string }[]>([]);

  const fields: { key: keyof FormState; label: string; min: number; max: number; unit?: string; step?: number }[] = [
    { key: "nitrogen", label: t("Nitrogen (N)", "நைட்ரஜன் (N)"), min: 0, max: 140, unit: "kg/ha" },
    { key: "phosphorus", label: t("Phosphorus (P)", "பாஸ்பரஸ் (P)"), min: 0, max: 145, unit: "kg/ha" },
    { key: "potassium", label: t("Potassium (K)", "பொட்டாசியம் (K)"), min: 0, max: 205, unit: "kg/ha" },
    { key: "temperature", label: t("Temperature", "வெப்பநிலை"), min: 10, max: 50, unit: "°C" },
    { key: "humidity", label: t("Humidity", "ஈரப்பதம்"), min: 10, max: 100, unit: "%" },
    { key: "ph", label: t("Soil pH", "மண் pH"), min: 3, max: 10, unit: "", step: 0.1 },
    { key: "rainfall", label: t("Rainfall", "மழையளவு"), min: 0, max: 300, unit: "mm" },
  ];

  const handleSubmit = async () => {
    setLoading(true);
    setResult("");
    setParsedCrops([]);
    try {
      const prompt = `As an agricultural AI for Tamil Nadu, analyze these soil & climate parameters and recommend the BEST crops:
N=${form.nitrogen}kg/ha, P=${form.phosphorus}kg/ha, K=${form.potassium}kg/ha, Temp=${form.temperature}°C, Humidity=${form.humidity}%, pH=${form.ph}, Rainfall=${form.rainfall}mm.

IMPORTANT: Start your response with a JSON block in this exact format:
\`\`\`json
[
  {"name": "Rice", "match": 95, "reason": "Optimal NPK and water conditions"},
  {"name": "Sugarcane", "match": 88, "reason": "Good soil nutrients"},
  {"name": "Banana", "match": 82, "reason": "Suitable pH and rainfall"},
  {"name": "Groundnut", "match": 75, "reason": "Moderate conditions"},
  {"name": "Cotton", "match": 70, "reason": "Acceptable parameters"},
  {"name": "Maize", "match": 65, "reason": "Partial match"}
]
\`\`\`

Then provide detailed analysis:
## Top Recommended Crop
Explain why the #1 crop is best for these exact conditions.

## Detailed Analysis
For each recommended crop, explain:
- Why it suits these conditions
- Expected yield per hectare
- Best planting season
- Key growing tips for Tamil Nadu

## Growing Tips for Top Crop
Specific practical advice for Tamil Nadu farmers.`;

      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ messages: [{ role: "user", content: prompt }], lang: "en" }),
      });

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

      const jsonMatch = full.match(/```json\s*([\s\S]*?)```/);
      if (jsonMatch) {
        try {
          setParsedCrops(JSON.parse(jsonMatch[1]));
        } catch (err) {
          // If parsing fails, log and continue (we still show the raw result)
          console.warn("Failed to parse crop JSON from AI response", err);
        }
      }
    } catch (e: unknown) {
      if (e instanceof Error) setResult(`Error: ${e.message}`);
      else setResult(`Error: ${String(e)}`);
    } finally {
      setLoading(false);
    }
  };

  const displayResult = result.replace(/```json[\s\S]*?```\n?/, "");

  return (
    <div className="min-h-screen font-body">
      <Navbar />
      <section className="relative pt-16 overflow-hidden">
        <div className="relative h-56 md:h-72">
          <img src={seedlingImg} alt="Crop recommendation" className="absolute inset-0 w-full h-full object-cover" loading="eager" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/70 to-leaf/60" />
          <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 text-center">
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-4xl mb-2">🌾</motion.div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-5xl font-display font-extrabold text-primary-foreground mb-2">
              {t("AI Crop Recommendation", "AI பயிர் பரிந்துரை")}
            </motion.h1>
            <p className="text-primary-foreground/80 text-sm max-w-lg">{t("7-parameter soil & climate analysis with AI-powered crop matching and visual results", "AI சக்தி பயிர் பொருத்தம் மற்றும் காட்சி முடிவுகளுடன் 7 அளவுரு மண் & காலநிலை பகுப்பாய்வு")}</p>
          </div>
        </div>
      </section>

      <div className="px-4 pb-8">
        <div className="container mx-auto max-w-5xl">
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 mt-8 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-display font-bold text-lg">{t("Soil & Climate Parameters", "மண் & காலநிலை அளவுருக்கள்")}</h2>
                <p className="text-xs text-muted-foreground">{t("Adjust sliders to match your farm conditions", "உங்கள் பண்ணை நிலைமைகளுக்கு பொருந்தும்படி சரிசெய்யவும்")}</p>
              </div>
            </div>
            <div className="space-y-5">
              {fields.map(f => (
                <div key={f.key}>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-foreground">{f.label}</label>
                    <span className="text-sm font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-lg">{String(form[f.key])}{f.unit}</span>
                  </div>
                  <Slider
                    value={[form[f.key]]}
                    min={f.min}
                    max={f.max}
                    step={f.step ?? 1}
                    onValueChange={v => setForm(p => ({ ...p, [f.key]: v[0] } as FormState))}
                  />
                </div>
              ))}
            </div>
            <Button onClick={handleSubmit} disabled={loading} className="w-full mt-6 gap-2 py-5 rounded-xl text-base">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sprout className="h-5 w-5" />}
              {loading ? t("AI Analyzing...", "AI பகுப்பாய்வு...") : t("Get AI Crop Recommendation", "AI பயிர் பரிந்துரை பெறு")}
            </Button>
          </div>

          {/* Visual Crop Cards */}
          {parsedCrops.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
              <h3 className="font-display font-bold text-xl mb-4 flex items-center gap-2">
                <Award className="h-5 w-5 text-secondary" />
                {t("Recommended Crops", "பரிந்துரைக்கப்பட்ட பயிர்கள்")}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {parsedCrops.map((crop, i) => (
                  <motion.div
                    key={crop.name}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className={`bg-card border rounded-2xl p-5 text-center relative overflow-hidden ${i === 0 ? 'border-secondary/50 shadow-lg ring-2 ring-secondary/20' : 'border-border'}`}
                  >
                    {i === 0 && (
                      <div className="absolute top-2 right-2 bg-secondary text-secondary-foreground text-[10px] px-2 py-0.5 rounded-full font-bold">
                        {t("Best Match", "சிறந்த பொருத்தம்")}
                      </div>
                    )}
                    <div className="text-5xl mb-3">{getCropEmoji(crop.name)}</div>
                    <h4 className="font-display font-bold text-foreground text-lg">{crop.name}</h4>
                    <div className="mt-3 mb-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">{t("Match", "பொருத்தம்")}</span>
                        <span className="font-bold text-primary">{crop.match}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-3">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${crop.match}%` }}
                          transition={{ duration: 1, delay: i * 0.15 }}
                          className={`h-3 rounded-full ${i === 0 ? 'bg-secondary' : 'bg-primary'}`}
                        />
                      </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">{crop.reason}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {displayResult && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 bg-card border border-border rounded-2xl p-6 md:p-8 prose prose-sm max-w-none prose-headings:font-display prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground">
              <ReactMarkdown>{displayResult}</ReactMarkdown>
            </motion.div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CropRecommendation;
