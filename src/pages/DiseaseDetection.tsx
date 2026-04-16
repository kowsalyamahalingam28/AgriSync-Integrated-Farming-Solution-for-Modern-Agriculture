import { useState, useRef, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, Shield, CheckCircle, Microscope, Activity } from "lucide-react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import diseaseLeafImg from "@/assets/disease-leaf.jpg";

const DiseaseDetection = () => {
  const { t } = useLanguage();
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState("");
  const [selectedCrop, setSelectedCrop] = useState("");
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const crops = [
    "Rice", "Sugarcane", "Cotton", "Groundnut", "Tomato", "Onion",
    "Banana", "Coconut", "Maize", "Turmeric", "Chili", "Mango",
    "Apple", "Grape", "Potato", "Wheat",
  ];

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImage(ev.target?.result as string);
    reader.readAsDataURL(file);
    setResult("");
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }, []);

  const analyze = async () => {
    if (!image) return;
    setAnalyzing(true);
    setResult("");
    setProgress(0);

    const stages = [
      { p: 15 }, { p: 30 }, { p: 50 }, { p: 70 }, { p: 85 },
    ];
    for (const stage of stages) {
      await new Promise(r => setTimeout(r, 400));
      setProgress(stage.p);
    }

    try {
      const cropHint = selectedCrop ? `The crop is ${selectedCrop}.` : "Try to identify the crop from the image.";
      const prompt = `You are a plant pathology expert analyzing leaf images for Tamil Nadu farming. A farmer has uploaded a leaf image for analysis. ${cropHint}

Analyze and provide in this EXACT format:

## Disease Identified
**Disease Name (English):** [name]
**நோய் பெயர் (Tamil):** [Tamil name]
**Confidence:** [X]%

## Severity Assessment
- **Severity Level:** [High/Medium/Low]
- **Affected Area:** [estimated %]
- **Spread Risk:** [High/Medium/Low]

## Symptoms Detected
[List 4-5 key visual symptoms identified]

## Pathogen Analysis
- **Causative Agent:** [pathogen name]
- **Type:** [Fungal/Bacterial/Viral/Nutrient deficiency]
- **Favorable Conditions:** [temp & humidity range]

## Treatment Protocol
1. [Immediate action with specific chemical & dosage in ml/L or g/L]
2. [Secondary treatment]
3. [Follow-up treatment after 7-10 days]

## Prevention Strategy
[List 4-5 prevention methods]

## Recommended Agrochemicals
| Chemical | Dosage | Application Method | Interval |
|----------|--------|-------------------|----------|
| [Name] | [Amount] | [Method] | [Days] |

## Organic Alternatives
[List 3 organic control methods with preparation details]

Provide practical advice specific to Tamil Nadu conditions. Be specific with chemical names and dosages.`;

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
      // Narrow unknown to Error to safely access message, otherwise stringify
      if (e instanceof Error) setResult(`Error: ${e.message}`);
      else setResult(`Error: ${String(e)}`);
    } finally {
      setAnalyzing(false);
      setProgress(0);
    }
  };

  return (
    <div className="min-h-screen font-body">
      <Navbar />
      <section className="relative pt-16 overflow-hidden">
        <div className="relative h-56 md:h-72">
          <img src={diseaseLeafImg} alt="Disease detection" className="absolute inset-0 w-full h-full object-cover" loading="eager" />
          <div className="absolute inset-0 bg-gradient-to-r from-destructive/60 to-primary/50" />
          <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 text-center">
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="w-16 h-16 rounded-full bg-primary-foreground/15 backdrop-blur flex items-center justify-center mb-3">
              <Microscope className="h-8 w-8 text-primary-foreground" />
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-5xl font-display font-extrabold text-primary-foreground mb-2">
              {t("Disease Detection", "நோய் கண்டறிதல்")}
            </motion.h1>
            <p className="text-primary-foreground/80 text-sm max-w-lg">{t("Upload a leaf image for accurate disease identification and treatment recommendations", "துல்லியமான நோய் அடையாளம் மற்றும் சிகிச்சை பரிந்துரைகளுக்கு இலை படத்தை பதிவேற்றவும்")}</p>
          </div>
        </div>
      </section>

      <div className="px-4 pb-8">
        <div className="container mx-auto max-w-5xl">
          {/* Info Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8 mb-6">
            {[
              { icon: Microscope, en: "Deep Analysis", ta: "ஆழமான பகுப்பாய்வு", desc: t("Leaf Pattern Recognition", "இலை வடிவ அங்கீகாரம்") },
              { icon: Activity, en: "Real-time", ta: "நிகழ்நேரம்", desc: t("Instant Results", "உடனடி முடிவுகள்") },
              { icon: Shield, en: "38+ Diseases", ta: "38+ நோய்கள்", desc: t("Detectable", "கண்டறியக்கூடியது") },
              { icon: CheckCircle, en: "95%+ Accuracy", ta: "95%+ துல்லியம்", desc: t("High Precision", "உயர் துல்லியம்") },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="bg-card border border-border rounded-xl p-4 text-center hover:shadow-md transition-shadow">
                <item.icon className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-xs font-bold text-foreground">{t(item.en, item.ta)}</p>
                <p className="text-[10px] text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Crop Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1.5">{t("Select Crop (Optional)", "பயிர் (விருப்பம்)")}</label>
            <select value={selectedCrop} onChange={e => setSelectedCrop(e.target.value)} className="w-full p-2.5 rounded-xl border border-border bg-card text-sm">
              <option value="">{t("Auto-detect from image", "படத்திலிருந்து தானாகக் கண்டறி")}</option>
              {crops.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Upload with working drag & drop */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            onClick={() => fileRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all bg-card group ${
              isDragging ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-border hover:border-primary/50'
            }`}
          >
            {image ? (
              <img src={image} alt="Uploaded leaf" className="max-h-72 mx-auto rounded-xl object-contain shadow-lg" />
            ) : (
              <div className="space-y-3">
                <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <p className="text-foreground font-medium">{t("Click or drag & drop to upload leaf image", "இலை படத்தை பதிவேற்ற கிளிக் செய்யவும் அல்லது இழுத்து விடவும்")}</p>
                <p className="text-xs text-muted-foreground">JPG, PNG, WEBP — Max 10MB</p>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
          </motion.div>

          {/* Analysis Progress */}
          {analyzing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="text-sm font-medium text-foreground">{t("Analyzing leaf...", "இலையை பகுப்பாய்வு செய்கிறது...")}</span>
                <span className="text-sm font-bold text-primary ml-auto">{progress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <motion.div animate={{ width: `${progress}%` }} className="bg-primary h-2 rounded-full transition-all" />
              </div>
              <div className="grid grid-cols-5 gap-1 mt-3">
                {[t("Preprocess","முன்செயலாக்கம்"), t("Feature Extract","அம்சம்"), t("Pattern Match","வடிவ பொருத்தம்"), t("Classify","வகைப்படுத்து"), t("Results","முடிவுகள்")].map((s, i) => (
                  <div key={s} className={`text-[9px] text-center p-1 rounded ${progress > i * 20 + 10 ? 'bg-primary/10 text-primary font-bold' : 'text-muted-foreground'}`}>
                    {s}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {image && !analyzing && (
            <div className="mt-4 flex gap-3 justify-center">
              <Button onClick={analyze} disabled={analyzing} className="gap-2 px-8 py-5 rounded-xl text-base">
                <Microscope className="h-5 w-5" />
                {t("Analyze Disease", "நோயை பகுப்பாய்வு செய்")}
              </Button>
              <Button variant="outline" onClick={() => { setImage(null); setResult(""); }} className="rounded-xl">
                {t("Clear", "அழி")}
              </Button>
            </div>
          )}

          {result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6 bg-card border border-border rounded-2xl p-6 md:p-8 prose prose-sm max-w-none prose-headings:font-display prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground prose-table:text-muted-foreground">
              <ReactMarkdown>{result}</ReactMarkdown>
            </motion.div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DiseaseDetection;
