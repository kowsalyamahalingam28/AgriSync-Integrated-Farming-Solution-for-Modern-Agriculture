import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { crops } from "@/data/crops";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowRight, Droplets, Thermometer, Clock, Leaf, Sprout, Sun, Bug, Lightbulb, BookOpen, Shield, Waves } from "lucide-react";
import terracedImg from "@/assets/terraced-fields.jpg";
import seedlingImg from "@/assets/seedling-growth.jpg";

const tabs = [
  { id: "soil", icon: Sprout, en: "Soil Preparation", ta: "மண் தயாரிப்பு" },
  { id: "water", icon: Waves, en: "Water Management", ta: "நீர் மேலாண்மை" },
  { id: "pest", icon: Bug, en: "Pest Control", ta: "பூச்சி கட்டுப்பாடு" },
  { id: "harvest", icon: Sun, en: "Harvest", ta: "அறுவடை" },
  { id: "organic", icon: Leaf, en: "Organic Farming", ta: "இயற்கை விவசாயம்" },
];

const tabContent: Record<string, { en: string; ta: string; tips: { en: string; ta: string }[] }> = {
  soil: {
    en: "Proper soil preparation is the foundation of a successful crop.",
    ta: "சரியான மண் தயாரிப்பு வெற்றிகரமான பயிரின் அடித்தளம்.",
    tips: [
      { en: "Deep plough 2-3 weeks before sowing to break compacted layers", ta: "விதைப்பதற்கு 2-3 வாரங்களுக்கு முன் ஆழமாக உழவு செய்யவும்" },
      { en: "Apply 10-12 tonnes of FYM per hectare as basal dose", ta: "ஹெக்டேருக்கு 10-12 டன் தொழு உரம் அடி உரமாக போடவும்" },
      { en: "Test soil pH and adjust with lime (acidic) or gypsum (alkaline)", ta: "மண் pH ஐ சோதித்து சுண்ணாம்பு அல்லது ஜிப்சம் மூலம் சரிசெய்யவும்" },
      { en: "Form raised beds for vegetables to ensure proper drainage", ta: "காய்கறிகளுக்கு சரியான வடிகாலுக்கு உயர்த்தப்பட்ட படுக்கைகள் அமைக்கவும்" },
    ],
  },
  water: {
    en: "Efficient water management reduces costs and improves yields.",
    ta: "திறமையான நீர் மேலாண்மை செலவுகளை குறைத்து மகசூலை மேம்படுத்துகிறது.",
    tips: [
      { en: "Use drip irrigation to save 40-60% water compared to flood irrigation", ta: "வெள்ள நீர்ப்பாசனத்துடன் ஒப்பிடும்போது 40-60% நீரை சேமிக்க சொட்டு நீர் பாசனம் பயன்படுத்தவும்" },
      { en: "Schedule irrigation early morning or late evening to minimize evaporation", ta: "ஆவியாதலை குறைக்க அதிகாலை அல்லது மாலையில் நீர் ஊற்றவும்" },
      { en: "Mulch around plants to retain soil moisture up to 25%", ta: "மண் ஈரப்பதத்தை 25% வரை தக்கவைக்க செடிகளைச் சுற்றி மல்ச் போடவும்" },
      { en: "Monitor soil moisture with tensiometers for precision irrigation", ta: "துல்லிய நீர்ப்பாசனத்திற்கு டென்சியோமீட்டர்களால் மண் ஈரப்பதத்தை கண்காணிக்கவும்" },
    ],
  },
  pest: {
    en: "Integrated Pest Management (IPM) is the most effective approach.",
    ta: "ஒருங்கிணைந்த பூச்சி மேலாண்மை (IPM) மிகவும் பயனுள்ள அணுகுமுறை.",
    tips: [
      { en: "Install yellow sticky traps for whitefly and aphid monitoring", ta: "வெள்ளை ஈ மற்றும் அசுவினி கண்காணிப்புக்கு மஞ்சள் ஒட்டும் பொறிகளை நிறுவவும்" },
      { en: "Release Trichogramma cards at 50,000/ha for stem borer control", ta: "தண்டு துளைப்பான் கட்டுப்பாட்டிற்கு 50,000/ஹெ ட்ரைக்கோகிராமா அட்டைகளை வெளியிடவும்" },
      { en: "Spray neem oil 5ml/L as a preventive measure every 15 days", ta: "ஒவ்வொரு 15 நாட்களுக்கும் தடுப்பு நடவடிக்கையாக வேப்ப எண்ணெய் 5ml/L தெளிக்கவும்" },
      { en: "Maintain field sanitation by removing crop residues after harvest", ta: "அறுவடைக்குப் பிறகு பயிர் எச்சங்களை அகற்றி வயல் சுகாதாரத்தை பராமரிக்கவும்" },
    ],
  },
  harvest: {
    en: "Timely harvesting ensures maximum quality and market value.",
    ta: "சரியான நேரத்தில் அறுவடை அதிகபட்ச தரம் மற்றும் சந்தை மதிப்பை உறுதிசெய்கிறது.",
    tips: [
      { en: "Harvest paddy when 80% grains turn golden yellow", ta: "80% தானியங்கள் தங்க மஞ்சளாக மாறும்போது நெல்லை அறுவடை செய்யவும்" },
      { en: "Dry grains to 14% moisture for safe storage", ta: "பாதுகாப்பான சேமிப்புக்கு 14% ஈரப்பதத்திற்கு தானியங்களை உலர்த்தவும்" },
      { en: "Use combine harvester for paddy to reduce post-harvest losses to 2-3%", ta: "அறுவடைக்குப் பிந்தைய இழப்புகளை 2-3% க்கு குறைக்க கம்பைன் ஹார்வெஸ்டர் பயன்படுத்தவும்" },
      { en: "Grade produce before market to get 15-20% higher prices", ta: "15-20% அதிக விலை பெற சந்தைக்கு முன் தரம் பிரிக்கவும்" },
    ],
  },
  organic: {
    en: "Organic farming builds soil health and commands premium prices.",
    ta: "இயற்கை விவசாயம் மண் ஆரோக்கியத்தை உருவாக்கி பிரீமியம் விலையைப் பெறுகிறது.",
    tips: [
      { en: "Prepare jeevamrutha (200L/acre) for microbial soil enrichment", ta: "நுண்ணுயிர் மண் செறிவூட்டலுக்கு ஜீவாம்ருதா (200L/ஏக்கர்) தயாரிக்கவும்" },
      { en: "Practice green manuring with Sesbania or Dhaincha before paddy", ta: "நெல்லுக்கு முன் செஸ்பேனியா அல்லது தைன்சாவுடன் பசுந்தாள் உரமிடல் செய்யவும்" },
      { en: "Use panchagavya 3% spray for overall plant immunity", ta: "ஒட்டுமொத்த தாவர நோய் எதிர்ப்புக்கு பஞ்சகவ்யா 3% தெளிப்பு பயன்படுத்தவும்" },
      { en: "Intercrop with legumes to fix atmospheric nitrogen naturally", ta: "இயற்கையாக நைட்ரஜனை நிலைநிறுத்த பருப்பு வகைகளுடன் ஊடுபயிர் செய்யவும்" },
    ],
  },
};

const seasonalTips = [
  { season: "Kharif (Jun–Oct)", seasonTa: "காரிஃப் (ஜூன்–அக்)", icon: "🌧️", color: "from-primary/15 to-primary/5", crops: "Rice, Cotton, Maize, Groundnut", cropsTa: "அரிசி, பருத்தி, சோளம், நிலக்கடலை" },
  { season: "Rabi (Nov–Mar)", seasonTa: "ரபி (நவ–மார்)", icon: "❄️", color: "from-sky/15 to-sky/5", crops: "Wheat, Potato, Tomato, Onion", cropsTa: "கோதுமை, உருளை, தக்காளி, வெங்காயம்" },
  { season: "Zaid (Mar–Jun)", seasonTa: "ஜாய்ட் (மார்–ஜூன்)", icon: "☀️", color: "from-gold/15 to-gold/5", crops: "Watermelon, Cucumber, Moong", cropsTa: "தர்பூசணி, வெள்ளரி, பாசிப்பயறு" },
];

const FarmingGuide = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("soil");
  const content = tabContent[activeTab];

  return (
    <div className="min-h-screen font-body">
      <Navbar />
      <section className="relative pt-16 overflow-hidden">
        <div className="relative h-48 md:h-64">
          <img src={terracedImg} alt="Farming fields" className="absolute inset-0 w-full h-full object-cover" loading="eager" />
          <div className="absolute inset-0 bg-primary/60" />
          <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 text-center">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-5xl font-display font-extrabold text-primary-foreground mb-3">
              {t("Smart Farming Guide", "ஸ்மார்ட் விவசாய வழிகாட்டி")}
            </motion.h1>
            <p className="text-primary-foreground/80">{t("Complete guidance for 14 crops with expert tips", "14 பயிர்களுக்கான முழுமையான வழிகாட்டுதல்")}</p>
          </div>
        </div>
      </section>

      <div className="px-4 pb-8">
        <div className="container mx-auto max-w-6xl">

          {/* Tabs */}
          <div className="mt-8 mb-6">
            <div className="flex flex-wrap gap-2 justify-center">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab.id ? "bg-primary text-primary-foreground shadow-md" : "bg-card border border-border text-foreground hover:bg-accent"
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {t(tab.en, tab.ta)}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-6 mb-12">
            <p className="text-muted-foreground mb-4">{t(content.en, content.ta)}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {content.tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-3 bg-accent/50 rounded-xl p-4">
                  <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">{i + 1}</span>
                  <span className="text-sm text-muted-foreground">{t(tip.en, tip.ta)}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Seasonal Calendar */}
          <h2 className="text-2xl font-display font-bold text-foreground mb-6 flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-primary" />
            {t("Seasonal Calendar", "பருவகால நாட்காட்டி")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
            {seasonalTips.map((s, i) => (
              <motion.div key={s.season} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className={`bg-gradient-to-br ${s.color} rounded-2xl border border-border p-5`}>
                <div className="text-3xl mb-2">{s.icon}</div>
                <h3 className="font-display font-bold text-foreground mb-1">{t(s.season, s.seasonTa)}</h3>
                <p className="text-xs text-muted-foreground">{t(s.crops, s.cropsTa)}</p>
              </motion.div>
            ))}
          </div>

          {/* Best Practices */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <img src={seedlingImg} alt="Seedlings" className="w-full h-full object-cover rounded-2xl" loading="lazy" />
            <div className="bg-accent/50 rounded-2xl p-6 border border-border flex flex-col justify-center">
              <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Leaf className="h-5 w-5 text-primary" /> {t("Best Practices", "சிறந்த நடைமுறைகள்")}
              </h2>
              <div className="space-y-3">
                {[
                  { en: "Test soil before every season", ta: "ஒவ்வொரு பருவத்திற்கும் முன் மண்ணை சோதிக்கவும்", icon: Sprout },
                  { en: "Practice crop rotation", ta: "பயிர் சுழற்சி செய்யவும்", icon: Sun },
                  { en: "Use drip irrigation to save 60% water", ta: "60% நீரை சேமிக்க சொட்டு நீர் பாசனம்", icon: Droplets },
                  { en: "Adopt IPM for eco-friendly farming", ta: "சுற்றுச்சூழல் நட்பு விவசாயத்திற்கு IPM", icon: Shield },
                  { en: "Monitor weather forecasts regularly", ta: "வானிலை முன்னறிவிப்புகளை கண்காணிக்கவும்", icon: Thermometer },
                  { en: "Keep detailed farm records", ta: "விரிவான பண்ணை பதிவுகளை வைக்கவும்", icon: Clock },
                ].map((tip, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <tip.icon className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-xs text-muted-foreground">{t(tip.en, tip.ta)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Crop Grid */}
          <h2 className="text-2xl font-display font-bold text-foreground mb-2 flex items-center gap-3">
            <Sprout className="h-6 w-6 text-primary" />
            {t("Explore 14 Crops", "14 பயிர்களை ஆராயுங்கள்")}
          </h2>
          <p className="text-muted-foreground mb-6 text-sm">{t("Click any crop for detailed growing guidance", "விரிவான வளர்ப்பு வழிகாட்டுதலுக்கு கிளிக் செய்யவும்")}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {crops.map((crop, i) => (
              <motion.div key={crop.id} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.03 }}>
                <Link to={`/crop/${crop.id}`}>
                  <div className="crop-card bg-card border border-border p-4 text-center group rounded-2xl holographic-shimmer">
                    <div className="text-4xl mb-2 group-hover:animate-float">{crop.emoji}</div>
                    <h3 className="font-display font-semibold text-sm text-foreground">{t(crop.name, crop.nameTa)}</h3>
                    <p className="text-[10px] text-muted-foreground mt-1">{t(crop.season, crop.seasonTa)}</p>
                    <div className="mt-2 flex items-center justify-center gap-1 text-[10px] text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      {t("View", "காண்")} <ArrowRight className="h-2.5 w-2.5" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default FarmingGuide;
