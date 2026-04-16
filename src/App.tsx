import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import ScrollToTop from "@/components/ScrollToTop";
import Index from "./pages/Index.tsx";
import FarmingGuide from "./pages/FarmingGuide.tsx";
import CropDetail from "./pages/CropDetail.tsx";
import DiseaseDetection from "./pages/DiseaseDetection.tsx";
import WeatherForecast from "./pages/WeatherForecast.tsx";
import FertilizerRecommendation from "./pages/FertilizerRecommendation.tsx";
import CropRecommendation from "./pages/CropRecommendation.tsx";
import FarmerProfile from "./pages/FarmerProfile.tsx";
import ChatAssistant from "./pages/ChatAssistant.tsx";
import SoilHealthCard from "./pages/SoilHealthCard.tsx";
import CropCalendar from "./pages/CropCalendar.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/farming-guide" element={<FarmingGuide />} />
            <Route path="/crop/:id" element={<CropDetail />} />
            <Route path="/disease-detection" element={<DiseaseDetection />} />
            <Route path="/weather" element={<WeatherForecast />} />
            <Route path="/fertilizer" element={<FertilizerRecommendation />} />
            <Route path="/crop-recommendation" element={<CropRecommendation />} />
            <Route path="/soil-health" element={<SoilHealthCard />} />
            <Route path="/crop-calendar" element={<CropCalendar />} />
            <Route path="/profile" element={<FarmerProfile />} />
            <Route path="/chat" element={<ChatAssistant />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
