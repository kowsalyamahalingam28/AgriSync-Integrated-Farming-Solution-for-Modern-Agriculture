import { useLanguage } from "@/contexts/LanguageContext";

const tips = [
  { en: "Crop rotation prevents soil depletion", ta: "பயிர் சுழற்சி மண் சோர்வைத் தடுக்கிறது" },
  { en: "Use IPM for eco-friendly pest control", ta: "சுற்றுச்சூழல் நட்பு பூச்சி கட்டுப்பாட்டிற்கு IPM பயன்படுத்துங்கள்" },
  { en: "Harvest early morning in summer", ta: "கோடையில் அதிகாலையில் அறுவடை செய்யுங்கள்" },
  { en: "Drip irrigation saves 60% water", ta: "சொட்டு நீர்ப்பாசனம் 60% நீரை சேமிக்கிறது" },
  { en: "Vermicompost improves soil structure", ta: "மண்புழு உரம் மண் அமைப்பை மேம்படுத்துகிறது" },
  { en: "PM-KISAN: ₹6000/year for farmer families", ta: "PM-KISAN: விவசாய குடும்பங்களுக்கு ₹6000/ஆண்டு" },
  { en: "PMFBY: Crop insurance at just 2% premium", ta: "PMFBY: 2% பிரீமியத்தில் பயிர் காப்பீடு" },
  { en: "KCC: Kisan Credit Card at 4% interest", ta: "KCC: 4% வட்டியில் கிசான் கிரெடிட் கார்டு" },
  { en: "Soil Health Card Scheme: Free soil testing", ta: "மண் ஆரோக்கிய அட்டை திட்டம்: இலவச மண் பரிசோதனை" },
  { en: "TN Uzhavar Paadhugappu Thittam: Farmer Protection Scheme", ta: "தமிழ்நாடு உழவர் பாதுகாப்பு திட்டம்" },
  { en: "NABARD subsidies for drip & sprinkler irrigation", ta: "சொட்டு & தெளிப்பான் நீர்ப்பாசனத்திற்கு NABARD மானியம்" },
  { en: "eNAM: National Agriculture Market for fair prices", ta: "eNAM: நியாயமான விலைக்கு தேசிய வேளாண் சந்தை" },
  { en: "Paramparagat Krishi Vikas Yojana: Organic farming support", ta: "பரம்பரகத் கிருஷி விகாஸ் யோஜனா: இயற்கை விவசாய ஆதரவு" },
];

const TickerBar = () => {
  const { t } = useLanguage();

  const content = tips.map(tip => t(tip.en, tip.ta)).join("   •   ");

  return (
    <div className="bg-primary text-primary-foreground py-2 ticker-bar relative overflow-hidden">
      <div className="ticker-content font-body text-xs tracking-wide">
        {content}   •   {content}
      </div>
    </div>
  );
};

export default TickerBar;
