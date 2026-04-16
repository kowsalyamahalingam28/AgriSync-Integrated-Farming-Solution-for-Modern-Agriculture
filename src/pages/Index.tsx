import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { Leaf, Bug, CloudSun, FlaskConical, Sprout, MessageCircle, ArrowRight, Users, BarChart3, Shield, Zap, CheckCircle, Heart, Calendar, Microscope, Globe, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef, useEffect, useState } from "react";
import heroImage from "@/assets/farming-landscape.jpg";
import farmerTech from "@/assets/farmer-tech.jpg";
import seedlingImg from "@/assets/seedling-growth.jpg";
import terracedImg from "@/assets/terraced-fields.jpg";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TickerBar from "@/components/TickerBar";
import FloatingLeaves from "@/components/FloatingLeaves";

function AnimatedCounter({ end, suffix = "", duration = 2000 }: { end: number; suffix?: string; duration?: number }) {
  // allow null in the ref type so it matches the RefObject signature expected by useInView
  const ref = useRef<HTMLSpanElement | null>(null);
  const inView = useInView(ref, { once: true });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setVal(end); clearInterval(timer); }
      else setVal(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, end, duration]);
  return <span ref={ref}>{val}{suffix}</span>;
}

const modules = [
  { icon: Sprout, titleEn: "Smart Farming Guide", titleTa: "ஸ்மார்ட் விவசாய வழிகாட்டி", descEn: "Complete crop guidance from planting to harvest with expert tips.", descTa: "நடவு முதல் அறுவடை வரை முழுமையான பயிர் வழிகாட்டுதல்.", link: "/farming-guide", color: "from-primary/20 to-leaf/10", emoji: "🌱" },
  { icon: Bug, titleEn: "Disease Detection", titleTa: "நோய் கண்டறிதல்", descEn: "Upload leaf images for deep learning disease analysis.", descTa: "ஆழமான கற்றல் நோய் பகுப்பாய்வுக்கு இலைப் படங்களை பதிவேற்றவும்.", link: "/disease-detection", color: "from-destructive/10 to-destructive/5", emoji: "🔬" },
  { icon: CloudSun, titleEn: "Weather Forecast", titleTa: "வானிலை முன்னறிவிப்பு", descEn: "Real-time GPS weather with heat stress, ET₀ & pest risk analysis.", descTa: "வெப்ப அழுத்தம், ET₀ & பூச்சி ஆபத்துடன் நிகழ்நேர GPS வானிலை.", link: "/weather", color: "from-sky/15 to-sky/5", emoji: "🌤️" },
  { icon: FlaskConical, titleEn: "Fertilizer Guide", titleTa: "உர வழிகாட்டி", descEn: "Smart NPK analysis with visual charts and recommendations.", descTa: "காட்சி வரைபடங்கள் மற்றும் பரிந்துரைகளுடன் ஸ்மார்ட் NPK பகுப்பாய்வு.", link: "/fertilizer", color: "from-gold/15 to-gold/5", emoji: "🧪" },
  { icon: Leaf, titleEn: "Crop Recommendation", titleTa: "பயிர் பரிந்துரை", descEn: "AI-powered crop selection with pictorial results for farmers.", descTa: "விவசாயிகளுக்கான படங்களுடன் AI பயிர் தேர்வு.", link: "/crop-recommendation", color: "from-leaf/15 to-leaf/5", emoji: "🌾" },
  { icon: Heart, titleEn: "Soil Health Card", titleTa: "மண் ஆரோக்கிய அட்டை", descEn: "Generate soil health score with visual gauges and charts.", descTa: "காட்சி அளவீடுகள் மற்றும் வரைபடங்களுடன் மண் ஆரோக்கிய மதிப்பெண்.", link: "/soil-health", color: "from-earth/15 to-earth/5", emoji: "❤️" },
  { icon: Calendar, titleEn: "Crop Calendar", titleTa: "பயிர் நாட்காட்டி", descEn: "Month-by-month visual farming calendar with costs & yield.", descTa: "செலவுகள் & மகசூலுடன் மாதம் வாரியான காட்சி விவசாய நாட்காட்டி.", link: "/crop-calendar", color: "from-primary/15 to-accent/10", emoji: "📅" },
  { icon: MessageCircle, titleEn: "AI Voice Assistant", titleTa: "AI குரல் உதவியாளர்", descEn: "Chat in Tamil, English, Hindi, Telugu with voice support.", descTa: "தமிழ், ஆங்கிலம், இந்தி, தெலுங்கில் குரல் ஆதரவுடன் அரட்டை.", link: "/chat", color: "from-primary/15 to-primary/5", emoji: "🤖" },
];

const stats = [
  { value: 500, suffix: "+", labelEn: "Farmers Helped", labelTa: "விவசாயிகளுக்கு உதவி" },
  { value: 32, suffix: "", labelEn: "Districts Covered", labelTa: "மாவட்டங்கள்" },
  { value: 14, suffix: "+", labelEn: "Crops Supported", labelTa: "பயிர்கள் ஆதரிக்கப்பட்டன" },
  { value: 8, suffix: "", labelEn: "AI Modules", labelTa: "AI தொகுதிகள்" },
];

const trustFeatures = [
  { icon: Shield, en: "100% Free", ta: "100% இலவசம்" },
  { icon: Globe, en: "Bilingual", ta: "இருமொழி" },
  { icon: Zap, en: "AI Powered", ta: "AI சக்தி" },
  { icon: Microscope, en: "Lab Accurate", ta: "ஆய்வக துல்லியம்" },
  { icon: Users, en: "Farmer First", ta: "விவசாயி முதல்" },
];

const Index = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen font-body">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-[100vh] min-h-[700px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 mesh-gradient" />
        <FloatingLeaves />
        <img
          src={heroImage}
          alt="Lush green farming fields at sunrise"
          className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-block px-5 py-2 glass-card rounded-full text-sm font-medium mb-8 text-primary-foreground border border-primary-foreground/20"
          >
            {t("AI-Powered Smart Farming", "AI ஸ்மார்ட் விவசாயம்")}
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-display font-extrabold text-primary-foreground mb-6 leading-[0.95] drop-shadow-lg"
          >
            {t("AgriSync", "அக்ரிசிங்க்")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-2xl md:text-3xl font-display font-semibold text-primary-foreground/90 mb-4"
          >
            {t("Smart Crops, Smart Choices", "ஸ்மார்ட் பயிர்கள், ஸ்மார்ட் தேர்வுகள்")}
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-lg text-primary-foreground/70 mb-10 font-body max-w-2xl mx-auto"
          >
            {t(
              "8 AI-powered modules for crop guidance, disease detection, weather intelligence, soil analysis & more.",
              "பயிர் வழிகாட்டுதல், நோய் கண்டறிதல், வானிலை நுண்ணறிவு, மண் பகுப்பாய்வு & மேலும் 8 AI தொகுதிகள்."
            )}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/farming-guide">
              <Button size="lg" className="text-lg px-8 py-6 rounded-full font-semibold shadow-xl hover:scale-105 transition-transform font-body bg-secondary text-secondary-foreground hover:bg-secondary/90">
                {t("Explore 8 Modules", "8 தொகுதிகளை ஆராயுங்கள்")} <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/chat">
              <Button size="lg" className="text-lg px-8 py-6 rounded-full font-semibold shadow-xl bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-body">
                <MessageCircle className="mr-2 h-5 w-5" /> {t("Talk to AI", "AI உடன் பேசுங்கள்")}
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Ticker Bar */}
      <TickerBar />

      {/* Trust Bar */}
      <section className="py-6 bg-card border-b border-border">
        <div className="container mx-auto flex flex-wrap justify-center gap-6 md:gap-12">
          {trustFeatures.map((f, i) => (
            <motion.div
              key={f.en}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-2 text-muted-foreground"
            >
              <f.icon className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium font-body">{t(f.en, f.ta)}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-16 px-4 bg-accent/30">
        <div className="container mx-auto max-w-4xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <motion.div
                key={s.labelEn}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-display font-extrabold text-primary">
                  <AnimatedCounter end={s.value} suffix={s.suffix} />
                </div>
                <div className="text-sm text-muted-foreground mt-2 font-body">{t(s.labelEn, s.labelTa)}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 8-Module Card Grid */}
      <section className="py-24 px-4" id="features">
        <div className="container mx-auto max-w-6xl">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <h2 className="section-title text-foreground">
              {t("8 Powerful Modules", "8 சக்திவாய்ந்த தொகுதிகள்")}
            </h2>
            <p className="section-subtitle">
              {t(
                "Everything a farmer needs — from planting to harvest, powered by AI.",
                "விவசாயிக்கு தேவையான அனைத்தும் — நடவு முதல் அறுவடை வரை, AI மூலம் இயக்கப்படுகிறது."
              )}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {modules.map((f, i) => (
              <motion.div
                key={f.titleEn}
                initial={{ opacity: 0, y: 40, rotateX: 10 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.08, type: "spring", stiffness: 100 }}
                whileHover={{ y: -10, scale: 1.04, rotateY: 3 }}
              >
                <Link to={f.link}>
                  <div className={`bg-gradient-to-br ${f.color} rounded-2xl p-6 border border-border feature-card-hover holographic-shimmer h-full group relative overflow-hidden`}>
                    <div className="absolute top-3 right-3 text-3xl opacity-15 group-hover:opacity-30 transition-opacity">
                      {f.emoji}
                    </div>
                    <div className="w-14 h-14 rounded-xl bg-card/80 backdrop-blur flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all shadow-md border border-border/50">
                      <f.icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="text-base font-display font-bold mb-2 text-foreground group-hover:text-primary transition-colors">
                      {t(f.titleEn, f.titleTa)}
                    </h3>
                    <p className="text-muted-foreground text-xs font-body leading-relaxed mb-4">
                      {t(f.descEn, f.descTa)}
                    </p>
                    <div className="flex items-center gap-1.5 text-primary text-xs font-semibold font-body group-hover:gap-3 transition-all">
                      {t("Explore", "ஆராயுங்கள்")} <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4 bg-accent/20">
        <div className="container mx-auto max-w-6xl">
          <h2 className="section-title text-foreground">
            {t("How AgriSync Works", "அக்ரிசிங்க் எவ்வாறு செயல்படுகிறது")}
          </h2>
          <p className="section-subtitle">
            {t("Three simple steps to smarter farming", "ஸ்மார்ட் விவசாயத்திற்கு மூன்று எளிய படிகள்")}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-4">
            {[
              { step: "01", titleEn: "Input Your Data", titleTa: "உங்கள் தரவை உள்ளிடவும்", descEn: "Enter soil parameters, upload leaf images, or search your location.", descTa: "மண் அளவுருக்களை உள்ளிடவும், இலைப் படங்களை பதிவேற்றவும்.", icon: BarChart3 },
              { step: "02", titleEn: "AI Analyzes", titleTa: "AI பகுப்பாய்வு", descEn: "Our AI processes your data with advanced algorithms.", descTa: "எங்கள் AI மேம்பட்ட அல்காரிதம்களுடன் தரவை செயலாக்குகிறது.", icon: Zap },
              { step: "03", titleEn: "Get Results", titleTa: "முடிவுகளைப் பெறுங்கள்", descEn: "Receive actionable insights with treatment plans and schedules.", descTa: "சிகிச்சை திட்டங்கள் மற்றும் அட்டவணைகளுடன் நடவடிக்கை.", icon: CheckCircle },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative glass-card rounded-2xl p-8 text-center group hover:shadow-xl transition-shadow"
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-lg font-body">
                  {item.step}
                </div>
                <item.icon className="h-10 w-10 text-primary mx-auto mb-4 mt-4" />
                <h3 className="text-lg font-display font-bold text-foreground mb-2">{t(item.titleEn, item.titleTa)}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-body">{t(item.descEn, item.descTa)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology + Tradition */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <img src={farmerTech} alt="Farmer using technology" className="rounded-3xl shadow-xl w-full object-cover aspect-[4/3]" loading="lazy" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-6">
                {t("Technology Meets Tradition", "தொழில்நுட்பமும் பாரம்பரியமும்")}
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8 font-body">
                {t(
                  "AgriSync bridges the gap between traditional farming wisdom and modern AI. Designed for Tamil Nadu's unique agricultural landscape — supporting all 32 districts, 14+ crops, and available in both Tamil and English.",
                  "அக்ரிசிங்க் பாரம்பரிய விவசாய ஞானத்திற்கும் நவீன AI-க்கும் இடையிலான இடைவெளியை இணைக்கிறது. தமிழ்நாட்டின் தனித்துவமான விவசாய நிலப்பரப்புக்காக வடிவமைக்கப்பட்டது."
                )}
              </p>
              <div className="space-y-3">
                {[
                  { en: "Available in English & Tamil", ta: "ஆங்கிலம் & தமிழில் கிடைக்கும்" },
                  { en: "Voice chat in 4 languages", ta: "4 மொழிகளில் குரல் அரட்டை" },
                  { en: "AI-powered crop & disease analysis", ta: "AI பயிர் & நோய் பகுப்பாய்வு" },
                  { en: "Real-time weather with farming advisories", ta: "விவசாய ஆலோசனைகளுடன் நிகழ்நேர வானிலை" },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-foreground font-body">{t(item.en, item.ta)}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-32 px-4 overflow-hidden">
        <img src={terracedImg} alt="Terraced farming fields" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-primary/75" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative z-10 container mx-auto max-w-3xl text-center"
        >
          <h2 className="text-3xl md:text-5xl font-display font-bold text-primary-foreground mb-6">
            {t("Ready to Farm Smarter?", "ஸ்மார்ட்டாக விவசாயம் செய்ய தயாரா?")}
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 font-body">
            {t("Join 500+ Tamil Nadu farmers using AgriSync", "அக்ரிசிங்க்கைப் பயன்படுத்தும் 500+ தமிழ்நாடு விவசாயிகளுடன் இணையுங்கள்")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/farming-guide">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6 rounded-full font-semibold shadow-lg font-body">
                {t("Start Exploring", "ஆராய ஆரம்பியுங்கள்")} <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/chat">
              <Button size="lg" className="text-lg px-8 py-6 rounded-full font-semibold bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-body">
                <MessageCircle className="mr-2 h-5 w-5" /> {t("Ask AI", "AI கேளுங்கள்")}
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Soil Test Recommendation */}
      <section className="py-12 px-4 bg-secondary/10 border-y border-secondary/20">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-4 bg-card rounded-2xl p-6 border border-secondary/30 shadow-md"
          >
            <div className="w-14 h-14 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="h-7 w-7 text-secondary" />
            </div>
            <div>
              <h3 className="font-display font-bold text-foreground text-lg mb-1">
                {t("Important Recommendation", "முக்கிய பரிந்துரை")}
              </h3>
              <p className="text-muted-foreground font-body text-sm leading-relaxed">
                {t(
                  "It is recommended to take a soil test report from your nearby laboratory before every cropping season for accurate fertilizer application and better yields.",
                  "ஒவ்வொரு பயிர் பருவத்திற்கும் முன்பு துல்லியமான உர பயன்பாடு மற்றும் சிறந்த மகசூலுக்காக உங்கள் அருகிலுள்ள ஆய்வகத்தில் மண் பரிசோதனை அறிக்கை எடுக்க பரிந்துரைக்கப்படுகிறது."
                )}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* About & Team */}
      <section className="py-24 px-4 bg-accent/20">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-6">
                {t("About AgriSync", "அக்ரிசிங்க் பற்றி")}
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8 font-body">
                {t(
                  "AgriSync is an AI-powered smart farming platform built specifically for farmers. With 8 intelligent modules covering everything from soil analysis to crop calendars, we empower farmers with data-driven decisions for sustainable agriculture.",
                  "அக்ரிசிங்க் விவசாயிகளுக்காக உருவாக்கப்பட்ட AI சக்தி வாய்ந்த ஸ்மார்ட் விவசாய தளம்."
                )}
              </p>
              <div className="glass-card rounded-2xl p-6">
                <h3 className="font-display font-bold text-foreground mb-4 text-lg">{t("Our Team", "எங்கள் குழு")}</h3>
                <div className="grid grid-cols-2 gap-4">
                  {["MADHUMITHA A", "AATHIKA N M", "ARUNI B", "KOWSALYA M"].map((name) => (
                    <div key={name} className="flex items-center gap-3 bg-accent/50 rounded-xl p-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm font-semibold text-foreground font-body">{name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <img src={seedlingImg} alt="Seedling growth" className="rounded-3xl shadow-xl w-full object-cover aspect-square" loading="lazy" />
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
