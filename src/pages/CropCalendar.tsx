import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Calendar, Loader2, Printer, Bot } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";

const CropCalendar = () => {
  const { t } = useLanguage();
  const [form, setForm] = useState({
    crop: "", soilType: "loamy", sowingDate: "", district: "", area: "", irrigation: "drip",
  });
  const [loading, setLoading] = useState(false);
  const [calendar, setCalendar] = useState("");

  const update = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const soilOptions = [
    { value: "loamy", label: t("Loamy", "களிமண்") },
    { value: "sandy", label: t("Sandy", "மணல்") },
    { value: "clay", label: t("Clay", "களிமண் பசை") },
    { value: "red", label: t("Red Soil", "செம்மண்") },
    { value: "black", label: t("Black Soil", "கருப்பு மண்") },
    { value: "alluvial", label: t("Alluvial", "வண்டல் மண்") },
  ];

  const irrigationOptions = [
    { value: "drip", label: t("Drip", "சொட்டு") },
    { value: "sprinkler", label: t("Sprinkler", "தெளிப்பான்") },
    { value: "flood", label: t("Flood", "வெள்ளம்") },
    { value: "rainfed", label: t("Rainfed", "மழை") },
  ];

  const cropOptions = [
    "Rice", "Sugarcane", "Cotton", "Groundnut", "Tomato", "Onion",
    "Banana", "Coconut", "Maize", "Turmeric", "Chili", "Mango",
  ];

  const handleGenerate = async () => {
    if (!form.crop || !form.sowingDate) return;
    setLoading(true);
    setCalendar("");
    try {
      const prompt = `Generate a detailed month-by-month crop calendar for ${form.crop} farming in ${form.district || 'Tamil Nadu'}, India.

Inputs: Crop: ${form.crop}, Soil: ${form.soilType}, Sowing Date: ${form.sowingDate}, Area: ${form.area || '1'} acres, Irrigation: ${form.irrigation}.

For EACH month of the crop duration, provide:
- Month name & crop stage (e.g., "Month 1 - Land Preparation")
- Tasks list (3-5 specific tasks)
- Fertilizer to apply (with exact quantities per acre)
- Irrigation schedule
- Pest/disease to watch for
- Weather consideration
- Priority level (🔴 High / 🟡 Medium / 🟢 Low)

At the end, provide:
- Estimated total cost per acre (in ₹)
- Expected yield per acre
- Expected revenue per acre

Format with clear markdown headers and bullet points. Keep it practical and specific to Tamil Nadu conditions.`;

      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: [{ role: "user", content: prompt }], lang: "en" }),
      });

      if (!resp.ok || !resp.body) throw new Error("Failed to generate");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, idx);
          buf = buf.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") break;
          try {
            const parsed = JSON.parse(json);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              full += content;
              setCalendar(full);
            }
          } catch { break; }
        }
      }
    } catch (e: unknown) {
      if (e instanceof Error) setCalendar(`Error: ${e.message}. Please try again.`);
      else setCalendar(`Error: ${String(e)}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen font-body">
      <Navbar />
      <section className="relative pt-16 overflow-hidden">
        <div className="relative h-48 md:h-64 bg-gradient-to-r from-primary to-leaf">
          <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 text-center">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-5xl font-display font-extrabold text-primary-foreground mb-3">
              {t("Crop Calendar Generator", "பயிர் நாட்காட்டி உருவாக்கி")}
            </motion.h1>
            <p className="text-primary-foreground/80">{t("Month-by-month farming plan with costs & yields", "செலவுகள் & மகசூலுடன் மாதம் வாரியான விவசாய திட்டம்")}</p>
          </div>
        </div>
      </section>

      <div className="px-4 pb-8">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 mt-8 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="h-6 w-6 text-primary" />
              <h2 className="text-lg font-display font-bold">{t("Enter Crop Details", "பயிர் விவரங்களை உள்ளிடவும்")}</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1">{t("Crop", "பயிர்")}</label>
                <select value={form.crop} onChange={e => update("crop", e.target.value)} className="w-full p-2.5 rounded-xl border border-border bg-background text-sm" required>
                  <option value="">{t("Select crop", "பயிரைத் தேர்ந்தெடுக்கவும்")}</option>
                  {cropOptions.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">{t("Soil Type", "மண் வகை")}</label>
                <select value={form.soilType} onChange={e => update("soilType", e.target.value)} className="w-full p-2.5 rounded-xl border border-border bg-background text-sm">
                  {soilOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">{t("Sowing Date", "விதைப்பு தேதி")}</label>
                <input type="date" value={form.sowingDate} onChange={e => update("sowingDate", e.target.value)} className="w-full p-2.5 rounded-xl border border-border bg-background text-sm" required />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">{t("District", "மாவட்டம்")}</label>
                <input type="text" value={form.district} onChange={e => update("district", e.target.value)} placeholder={t("e.g., Thanjavur", "எ.கா., தஞ்சாவூர்")} className="w-full p-2.5 rounded-xl border border-border bg-background text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">{t("Area (acres)", "பரப்பளவு (ஏக்கர்)")}</label>
                <input type="number" value={form.area} onChange={e => update("area", e.target.value)} placeholder="1" className="w-full p-2.5 rounded-xl border border-border bg-background text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">{t("Irrigation", "நீர்ப்பாசனம்")}</label>
                <select value={form.irrigation} onChange={e => update("irrigation", e.target.value)} className="w-full p-2.5 rounded-xl border border-border bg-background text-sm">
                  {irrigationOptions.map(i => <option key={i.value} value={i.value}>{i.label}</option>)}
                </select>
              </div>
            </div>
            <Button onClick={handleGenerate} disabled={loading || !form.crop || !form.sowingDate} className="w-full mt-6 gap-2 py-5 rounded-xl">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Bot className="h-5 w-5" />}
              {loading ? t("Generating Calendar...", "நாட்காட்டி உருவாக்குகிறது...") : t("Generate AI Calendar", "AI நாட்காட்டி உருவாக்கு")}
            </Button>
          </div>

          {calendar && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
              <div className="flex justify-end mb-3 no-print">
                <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-2">
                  <Printer className="h-4 w-4" /> {t("Print Calendar", "நாட்காட்டியை அச்சிடு")}
                </Button>
              </div>
              <div className="bg-card border border-border rounded-2xl p-6 md:p-8 prose prose-sm max-w-none prose-headings:font-display prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground">
                <ReactMarkdown>{calendar}</ReactMarkdown>
              </div>
            </motion.div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CropCalendar;
