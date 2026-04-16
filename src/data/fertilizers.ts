export interface FertilizerInfo {
  id: string;
  name: string;
  nameTa: string;
  type: string;
  typeTa: string;
  npk: string;
  usage: string;
  usageTa: string;
  crops: string[];
  cropsTa: string[];
}

export const fertilizers: FertilizerInfo[] = [
  {
    id: "urea",
    name: "Urea",
    nameTa: "யூரியா",
    type: "Nitrogenous",
    typeTa: "நைட்ரஜன்",
    npk: "46-0-0",
    usage: "Apply during vegetative growth stage. Best for leafy crops and cereals. Split application recommended.",
    usageTa: "வளர்ச்சி நிலையில் பயன்படுத்தவும். இலை பயிர்கள் மற்றும் தானியங்களுக்கு சிறந்தது.",
    crops: ["Rice", "Wheat", "Corn", "Sugarcane"],
    cropsTa: ["அரிசி", "கோதுமை", "சோளம்", "கரும்பு"],
  },
  {
    id: "dap",
    name: "DAP (Diammonium Phosphate)",
    nameTa: "டிஏபி",
    type: "Phosphatic",
    typeTa: "பாஸ்பேட்",
    npk: "18-46-0",
    usage: "Apply at sowing/planting time. Promotes root development and early growth.",
    usageTa: "விதைப்பு/நடவு நேரத்தில் பயன்படுத்தவும். வேர் வளர்ச்சி மற்றும் ஆரம்ப வளர்ச்சியை ஊக்குவிக்கும்.",
    crops: ["All crops", "Especially cereals and pulses"],
    cropsTa: ["அனைத்து பயிர்கள்", "குறிப்பாக தானியங்கள் மற்றும் பருப்பு வகைகள்"],
  },
  {
    id: "mop",
    name: "MOP (Muriate of Potash)",
    nameTa: "எம்ஓபி",
    type: "Potassic",
    typeTa: "பொட்டாசியம்",
    npk: "0-0-60",
    usage: "Apply during fruit/grain formation. Improves quality, disease resistance, and drought tolerance.",
    usageTa: "பழம்/தானிய உருவாக்க நேரத்தில் பயன்படுத்தவும். தரம், நோய் எதிர்ப்பு, வறட்சி சகிப்புத்தன்மையை மேம்படுத்தும்.",
    crops: ["Fruits", "Vegetables", "Potatoes"],
    cropsTa: ["பழங்கள்", "காய்கறிகள்", "உருளைக்கிழங்கு"],
  },
  {
    id: "npk-complex",
    name: "NPK Complex (10-26-26)",
    nameTa: "என்பிகே காம்ப்ளக்ஸ்",
    type: "Complex",
    typeTa: "கலவை",
    npk: "10-26-26",
    usage: "Basal application at sowing. Provides balanced nutrition for crop establishment.",
    usageTa: "விதைப்பின் போது அடி உரமாக. பயிர் நிலைநாட்டத்திற்கு சமநிலை ஊட்டச்சத்து.",
    crops: ["All crops"],
    cropsTa: ["அனைத்து பயிர்கள்"],
  },
  {
    id: "vermicompost",
    name: "Vermicompost",
    nameTa: "மண்புழு உரம்",
    type: "Organic",
    typeTa: "இயற்கை",
    npk: "1.5-0.5-0.8",
    usage: "Apply 2-5 tons per acre. Improves soil structure, water retention, and microbial activity.",
    usageTa: "ஏக்கருக்கு 2-5 டன் பயன்படுத்தவும். மண் அமைப்பு, நீர் தக்கவைப்பு, நுண்ணுயிர் செயல்பாட்டை மேம்படுத்தும்.",
    crops: ["All crops", "Especially vegetables and fruits"],
    cropsTa: ["அனைத்து பயிர்கள்", "குறிப்பாக காய்கறிகள் மற்றும் பழங்கள்"],
  },
  {
    id: "neem-cake",
    name: "Neem Cake",
    nameTa: "வேப்பம் புண்ணாக்கு",
    type: "Organic",
    typeTa: "இயற்கை",
    npk: "5-1-2",
    usage: "Apply as basal dose. Acts as natural pest repellent and slow-release nitrogen source.",
    usageTa: "அடி உரமாக பயன்படுத்தவும். இயற்கை பூச்சி விரட்டியாகவும் மெதுவான நைட்ரஜன் மூலமாகவும் செயல்படும்.",
    crops: ["Rice", "Sugarcane", "Vegetables"],
    cropsTa: ["அரிசி", "கரும்பு", "காய்கறிகள்"],
  },
];
