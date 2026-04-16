import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";
import ficcaLogo from "@/assets/ficca-logo.jpg";

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-primary text-primary-foreground py-16 mt-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <h3 className="text-2xl font-display font-bold mb-3 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary-foreground/15 border border-primary-foreground/20 flex items-center justify-center overflow-hidden">
                <img src={ficcaLogo} alt="FICCA" className="w-full h-full object-cover rounded-full" />
              </div>
              {t("AgriSync", "அக்ரிசிங்க்")}
            </h3>
            <p className="text-primary-foreground/80 text-sm font-body mb-6 max-w-md leading-relaxed">
              {t(
                "AI-powered smart farming assistant for Tamil Nadu farmers. Better crop management, disease detection, and higher yields through cutting-edge technology.",
                "தமிழ்நாடு விவசாயிகளுக்கான AI சக்தி வாய்ந்த ஸ்மார்ட் விவசாய உதவியாளர். நவீன தொழில்நுட்பத்தின் மூலம் சிறந்த பயிர் மேலாண்மை, நோய் கண்டறிதல் மற்றும் அதிக மகசூல்."
              )}
            </p>
            <div className="text-xs text-primary-foreground/50">
              <p className="font-semibold font-body mb-1.5">{t("Developed by", "உருவாக்கியவர்கள்")}</p>
              <div className="flex flex-wrap gap-x-3 gap-y-1 font-body">
                {["MADHUMITHA A", "AATHIKA N M", "ARUNI B", "KOWSALYA M"].map(name => (
                  <span key={name} className="text-primary-foreground/70">{name}</span>
                ))}
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-4 text-lg">{t("Modules", "தொகுதிகள்")}</h4>
            <ul className="space-y-2 text-sm font-body text-primary-foreground/70">
              <li><Link to="/farming-guide" className="hover:text-primary-foreground transition-colors">{t("Farming Guide", "விவசாய வழிகாட்டி")}</Link></li>
              <li><Link to="/disease-detection" className="hover:text-primary-foreground transition-colors">{t("Disease Detection", "நோய் கண்டறிதல்")}</Link></li>
              <li><Link to="/weather" className="hover:text-primary-foreground transition-colors">{t("Weather Forecast", "வானிலை")}</Link></li>
              <li><Link to="/fertilizer" className="hover:text-primary-foreground transition-colors">{t("Fertilizer", "உரம்")}</Link></li>
              <li><Link to="/soil-health" className="hover:text-primary-foreground transition-colors">{t("Soil Health", "மண் ஆரோக்கியம்")}</Link></li>
              <li><Link to="/crop-calendar" className="hover:text-primary-foreground transition-colors">{t("Crop Calendar", "நாட்காட்டி")}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-4 text-lg">{t("Contact", "தொடர்பு")}</h4>
            <p className="text-sm font-body text-primary-foreground/70">support@agrisync.com</p>
            <p className="text-sm font-body text-primary-foreground/70 mt-1">+91 98765 43210</p>
            <div className="flex gap-3 mt-4">
              {[
                { icon: Facebook, label: "Facebook" },
                { icon: Twitter, label: "Twitter" },
                { icon: Instagram, label: "Instagram" },
                { icon: Youtube, label: "YouTube" },
              ].map((social) => (
                <button key={social.label} className="w-9 h-9 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 flex items-center justify-center transition-all hover:scale-110" aria-label={social.label}>
                  <social.icon className="h-4 w-4 text-primary-foreground/80" />
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-10 pt-8 border-t border-primary-foreground/15 text-center text-xs font-body text-primary-foreground/50">
          © 2026 AgriSync. {t("All rights reserved. Built for Tamil Nadu farmers.", "அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை. தமிழ்நாடு விவசாயிகளுக்காக உருவாக்கப்பட்டது.")}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
