import { useParams, Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { crops } from "@/data/crops";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft, Droplets, Sun, Clock, Bug, Lightbulb, Layers } from "lucide-react";
import { motion } from "framer-motion";

const stages = [
  { en: "Sowing", ta: "விதைப்பு", days: "Day 1-7", emoji: "🌱" },
  { en: "Nursery", ta: "நாற்றங்கால்", days: "Day 8-25", emoji: "🌿" },
  { en: "Transplant", ta: "நடவு", days: "Day 26-35", emoji: "🪴" },
  { en: "Fertilizing", ta: "உரமிடல்", days: "Day 36-60", emoji: "🧪" },
  { en: "Irrigation", ta: "நீர்ப்பாசனம்", days: "Day 61-90", emoji: "💧" },
  { en: "Harvest", ta: "அறுவடை", days: "Day 91-120", emoji: "🌾" },
];

const CropDetail = () => {
  const { id } = useParams();
  const { t } = useLanguage();
  const crop = crops.find((c) => c.id === id);

  if (!crop) {
    return (
      <div className="min-h-screen font-body"><Navbar /><div className="pt-24 text-center"><p className="text-xl text-muted-foreground">{t("Crop not found", "பயிர் கிடைக்கவில்லை")}</p><Link to="/farming-guide" className="text-primary underline mt-4 inline-block">{t("Back", "திரும்பு")}</Link></div></div>
    );
  }

  const infoCards = [
    { icon: Sun, label: t("Season", "பருவம்"), value: t(crop.season, crop.seasonTa), color: "bg-gold/10 text-gold" },
    { icon: Layers, label: t("Soil", "மண்"), value: t(crop.soilType, crop.soilTypeTa), color: "bg-earth/10 text-earth" },
    { icon: Droplets, label: t("Water", "நீர்"), value: t(crop.waterNeeds, crop.waterNeedsTa), color: "bg-sky/10 text-sky" },
    { icon: Clock, label: t("Duration", "காலம்"), value: crop.growthDuration, color: "bg-primary/10 text-primary" },
  ];

  return (
    <div className="min-h-screen font-body">
      <Navbar />
      <section className="pt-16">
        <div className="bg-gradient-to-br from-primary/10 to-accent/30 py-12 md:py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <Link to="/farming-guide" className="inline-flex items-center gap-2 text-primary hover:underline mb-4 text-sm">
              <ArrowLeft className="h-4 w-4" /> {t("Back to Guide", "வழிகாட்டிக்கு திரும்பு")}
            </Link>
            <div className="text-center">
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }} className="text-6xl md:text-7xl block mb-3">
                {crop.emoji}
              </motion.span>
              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-5xl font-display font-extrabold text-foreground mb-3">
                {t(crop.name, crop.nameTa)}
              </motion.h1>
              <p className="text-muted-foreground text-sm max-w-xl mx-auto">{t(crop.description, crop.descriptionTa)}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="px-4 pb-8">
        <div className="container mx-auto max-w-4xl">
          {/* Info Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 -mt-6 relative z-10 mb-8">
            {infoCards.map((card, i) => (
              <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-card border border-border rounded-xl p-4 text-center shadow-md">
                <div className={`w-9 h-9 rounded-lg ${card.color} flex items-center justify-center mx-auto mb-2`}>
                  <card.icon className="h-4 w-4" />
                </div>
                <div className="text-[10px] text-muted-foreground mb-0.5">{card.label}</div>
                <div className="text-xs font-bold text-foreground">{card.value}</div>
              </motion.div>
            ))}
          </div>

          {/* Growth Stage Timeline */}
          <div className="bg-card border border-border rounded-2xl p-6 mb-6">
            <h2 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
              🌱 {t("Growth Stage Timeline", "வளர்ச்சி நிலை காலவரிசை")}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {stages.map((stage, i) => (
                <motion.div key={stage.en} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
                  className="text-center bg-accent/50 rounded-xl p-3 relative">
                  <div className="text-2xl mb-1">{stage.emoji}</div>
                  <p className="text-xs font-bold text-foreground">{t(stage.en, stage.ta)}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{stage.days}</p>
                  {i < stages.length - 1 && <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 text-primary text-sm z-10">→</div>}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Diseases */}
          <div className="bg-destructive/5 border-2 border-destructive/20 rounded-2xl p-6 mb-4">
            <h2 className="font-display font-bold text-lg mb-3 flex items-center gap-2">
              <Bug className="h-5 w-5 text-destructive" /> {t("Common Diseases", "பொதுவான நோய்கள்")}
            </h2>
            <div className="flex flex-wrap gap-2">
              {(t("en", "ta") === "en" ? crop.diseases : crop.diseasesTa).map(d => (
                <span key={d} className="px-3 py-1.5 bg-destructive/10 text-destructive rounded-lg text-xs font-medium">{d}</span>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-accent/50 border-2 border-primary/20 rounded-2xl p-6">
            <h2 className="font-display font-bold text-lg mb-3 flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-gold" /> {t("Growing Tips", "வளர்ப்பு குறிப்புகள்")}
            </h2>
            <div className="space-y-2">
              {(t("en", "ta") === "en" ? crop.tips : crop.tipsTa).map((tip, i) => (
                <div key={tip} className="flex items-start gap-2 bg-card rounded-lg p-3">
                  <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold flex-shrink-0">{i + 1}</span>
                  <span className="text-xs text-muted-foreground">{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CropDetail;
