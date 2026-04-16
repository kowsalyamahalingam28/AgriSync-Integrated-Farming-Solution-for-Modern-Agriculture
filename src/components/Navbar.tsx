import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Menu, X, User, Globe, MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import ficcaLogo from "@/assets/ficca-logo.jpg";

const Navbar = () => {
  const { t, toggleLang, lang } = useLanguage();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const [profilePic, setProfilePic] = useState<string | null>(null);

  useEffect(() => {
    const updatePic = () => {
      try { setProfilePic(localStorage.getItem("farmer-profile-pic")); } catch { setProfilePic(null); }
    };
    updatePic();
    window.addEventListener("storage", updatePic);
    // Custom event for same-tab updates
    window.addEventListener("profile-pic-updated", updatePic);
    return () => {
      window.removeEventListener("storage", updatePic);
      window.removeEventListener("profile-pic-updated", updatePic);
    };
  }, []);

  const links = [
    { to: "/", label: t("Home", "முகப்பு") },
    { to: "/farming-guide", label: t("Farming Guide", "விவசாய வழிகாட்டி") },
    { to: "/disease-detection", label: t("Disease", "நோய்") },
    { to: "/weather", label: t("Weather", "வானிலை") },
    { to: "/fertilizer", label: t("Fertilizer", "உரம்") },
    { to: "/crop-recommendation", label: t("Crops", "பயிர்கள்") },
    { to: "/soil-health", label: t("Soil Health", "மண் ஆரோக்கியம்") },
    { to: "/crop-calendar", label: t("Calendar", "நாட்காட்டி") },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-primary/95 backdrop-blur-xl border-b border-primary-foreground/10 shadow-lg">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2.5 font-display font-bold text-xl text-primary-foreground">
          <div className="w-10 h-10 rounded-full bg-primary-foreground/15 border border-primary-foreground/20 flex items-center justify-center overflow-hidden">
            <img src={ficcaLogo} alt="FICCA" className="w-full h-full object-cover rounded-full" />
          </div>
          <span className="tracking-tight text-primary-foreground">{t("AgriSync", "அக்ரிசிங்க்")}</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden xl:flex items-center gap-0.5">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium font-body transition-all duration-200 ${
                location.pathname === link.to
                  ? "bg-primary-foreground text-primary shadow-md font-bold"
                  : "text-primary-foreground/80 hover:bg-primary-foreground/15 hover:text-primary-foreground hover:scale-105"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link to="/chat">
            <Button size="sm" className="gap-1.5 bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-all text-xs font-bold rounded-full px-4 shadow-md">
              <MessageCircle className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t("AI Chat", "AI அரட்டை")}</span>
            </Button>
          </Link>

          <Button size="sm" onClick={toggleLang} className="gap-1 text-xs bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/25 border-0 rounded-full">
            <Globe className="h-3.5 w-3.5" />
            {lang === "en" ? "தமிழ்" : "EN"}
          </Button>

          <Link to="/profile">
            <Button size="icon" className="h-8 w-8 bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/25 border-0 rounded-full overflow-hidden p-0">
              {profilePic ? (
                <img src={profilePic} alt="Profile" className="w-full h-full object-cover rounded-full" />
              ) : (
                <User className="h-3.5 w-3.5" />
              )}
            </Button>
          </Link>

          <button
            className="xl:hidden p-2 rounded-lg text-primary-foreground hover:bg-primary-foreground/15 transition-colors"
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="xl:hidden bg-primary/98 backdrop-blur-xl border-b border-primary-foreground/10 px-4 py-3 space-y-1 animate-fade-in">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className={`block px-3 py-2 rounded-lg text-sm font-medium font-body transition-colors ${
                location.pathname === link.to
                  ? "bg-primary-foreground text-primary font-bold"
                  : "text-primary-foreground/80 hover:bg-primary-foreground/15"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link to="/chat" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-secondary hover:bg-primary-foreground/15">
            {t("AI Chat Assistant", "AI அரட்டை உதவியாளர்")}
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
