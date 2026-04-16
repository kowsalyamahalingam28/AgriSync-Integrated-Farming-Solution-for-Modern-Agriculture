import { useState, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { User, Save, CheckCircle, Camera } from "lucide-react";
import { motion } from "framer-motion";

const FarmerProfile = () => {
  const { t } = useLanguage();
  const [saved, setSaved] = useState(false);
  const [profilePic, setProfilePic] = useState<string | null>(() => {
    try { return localStorage.getItem("farmer-profile-pic"); } catch { return null; }
  });
  const fileRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState(() => {
    try { return JSON.parse(localStorage.getItem("farmer-profile") || "{}"); } catch { return {}; }
  });

  const update = (field: string, value: string) => {
    setProfile((prev: any) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleProfilePic = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setProfilePic(result);
      localStorage.setItem("farmer-profile-pic", result);
      // Dispatch custom event so Navbar updates immediately
      window.dispatchEvent(new Event("profile-pic-updated"));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("farmer-profile", JSON.stringify(profile));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const soilOptions = [
    { value: "loamy", en: "Loamy", ta: "களிமண்" },
    { value: "sandy", en: "Sandy", ta: "மணல்" },
    { value: "clay", en: "Clay", ta: "களிமண் பசை" },
    { value: "red", en: "Red Soil", ta: "செம்மண்" },
    { value: "black", en: "Black Soil", ta: "கருப்பு மண்" },
    { value: "alluvial", en: "Alluvial", ta: "வண்டல் மண்" },
  ];

  const irrigationOptions = [
    { value: "drip", en: "Drip", ta: "சொட்டு நீர்ப்பாசனம்" },
    { value: "sprinkler", en: "Sprinkler", ta: "தெளிப்பான்" },
    { value: "flood", en: "Flood", ta: "வெள்ள நீர்ப்பாசனம்" },
    { value: "canal", en: "Canal", ta: "கால்வாய்" },
    { value: "rainfed", en: "Rainfed", ta: "மழையை நம்பியது" },
  ];

  return (
    <div className="min-h-screen font-body">
      <Navbar />
      <div className="pt-20 pb-8 px-4">
        <div className="container mx-auto max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mt-8 mb-8">
            {/* Profile Picture Upload */}
            <div className="relative w-24 h-24 mx-auto mb-4 group cursor-pointer" onClick={() => fileRef.current?.click()}>
              {profilePic ? (
                <img src={profilePic} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-primary/30 shadow-lg" />
              ) : (
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center border-4 border-primary/20">
                  <User className="h-12 w-12 text-primary" />
                </div>
              )}
              <div className="absolute inset-0 rounded-full bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-md border-2 border-background">
                <Camera className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleProfilePic} />
            </div>
            <p className="text-xs text-muted-foreground mb-2">{t("Tap to upload photo", "புகைப்படம் பதிவேற்ற தட்டவும்")}</p>
            <h1 className="text-3xl font-display font-bold text-foreground">{t("Farmer Profile", "விவசாயி சுயவிவரம்")}</h1>
            <p className="text-muted-foreground mt-2 text-sm">{t("Your details help us provide better recommendations.", "உங்கள் விவரங்கள் சிறந்த பரிந்துரைகளை வழங்க உதவுகின்றன.")}</p>
          </motion.div>

          <form onSubmit={handleSave} className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-lg">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { key: "name", label: t("Full Name", "முழு பெயர்"), type: "text", placeholder: t("Your name", "உங்கள் பெயர்") },
                { key: "phone", label: t("Phone", "தொலைபேசி"), type: "tel", placeholder: "+91 98765 43210" },
                { key: "village", label: t("Village", "கிராமம்"), type: "text", placeholder: "" },
                { key: "district", label: t("District", "மாவட்டம்"), type: "text", placeholder: t("e.g., Thanjavur", "எ.கா., தஞ்சாவூர்") },
                { key: "landSize", label: t("Land (acres)", "நிலம் (ஏக்கர்)"), type: "text", placeholder: "5" },
                { key: "mainCrops", label: t("Main Crops", "முக்கிய பயிர்கள்"), type: "text", placeholder: t("Rice, Sugarcane", "அரிசி, கரும்பு") },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-medium text-foreground mb-1">{f.label}</label>
                  <input type={f.type} value={profile[f.key] || ""} onChange={e => update(f.key, e.target.value)} placeholder={f.placeholder} className="w-full p-2.5 rounded-xl border border-border bg-background text-sm" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">{t("Soil Type", "மண் வகை")}</label>
                <select value={profile.soilType || "loamy"} onChange={e => update("soilType", e.target.value)} className="w-full p-2.5 rounded-xl border border-border bg-background text-sm">
                  {soilOptions.map(o => <option key={o.value} value={o.value}>{t(o.en, o.ta)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">{t("Irrigation", "நீர்ப்பாசனம்")}</label>
                <select value={profile.irrigationType || "drip"} onChange={e => update("irrigationType", e.target.value)} className="w-full p-2.5 rounded-xl border border-border bg-background text-sm">
                  {irrigationOptions.map(o => <option key={o.value} value={o.value}>{t(o.en, o.ta)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">{t("pH Level", "pH அளவு")}</label>
                <input type="number" step="0.1" value={profile.ph || ""} onChange={e => update("ph", e.target.value)} placeholder="6.5" className="w-full p-2.5 rounded-xl border border-border bg-background text-sm" />
              </div>
            </div>
            <Button type="submit" className="w-full gap-2 py-5 rounded-xl">
              {saved ? <CheckCircle className="h-5 w-5" /> : <Save className="h-5 w-5" />}
              {saved ? t("Saved!", "சேமிக்கப்பட்டது!") : t("Save Profile", "சுயவிவரத்தை சேமி")}
            </Button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default FarmerProfile;
