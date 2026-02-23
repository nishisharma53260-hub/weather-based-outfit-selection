import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Cloud, 
  Sun, 
  Upload, 
  Shirt, 
  Briefcase, 
  PartyPopper, 
  Coffee, 
  Heart, 
  Dumbbell,
  Loader2,
  ChevronRight,
  Camera,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import { CameraCapture } from './components/CameraCapture';
import { Button } from './components/ui/Button';
import { Card } from './components/ui/Card';
import { Occasion, OutfitRecommendation, WeatherData } from './types';
import { getFashionRecommendations, generateVirtualTryOn } from './services/gemini';
import { getCurrentWeather } from './services/weather';

const occasions: { id: Occasion; label: string; icon: any; color: string }[] = [
  { id: 'casual', label: 'Casual', icon: Coffee, color: 'bg-blue-100 text-blue-600' },
  { id: 'office', label: 'Office', icon: Briefcase, color: 'bg-slate-100 text-slate-600' },
  { id: 'party', label: 'Party', icon: PartyPopper, color: 'bg-purple-100 text-purple-600' },
  { id: 'date', label: 'Date Night', icon: Heart, color: 'bg-pink-100 text-pink-600' },
  { id: 'wedding', label: 'Wedding', icon: Sparkles, color: 'bg-amber-100 text-amber-600' },
  { id: 'sport', label: 'Sport', icon: Dumbbell, color: 'bg-emerald-100 text-emerald-600' },
];

export default function App() {
  const [selectedOccasion, setSelectedOccasion] = useState<Occasion | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [recommendation, setRecommendation] = useState<OutfitRecommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [userImage, setUserImage] = useState<string | null>(null);
  const [tryOnImage, setTryOnImage] = useState<string | null>(null);
  const [generatingTryOn, setGeneratingTryOn] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getCurrentWeather().then(setWeather);
  }, []);

  const handleGenerate = async () => {
    if (!selectedOccasion) return;
    setLoading(true);
    try {
      const weatherStr = weather ? `${weather.temp}°C, ${weather.condition}` : undefined;
      const result = await getFashionRecommendations(selectedOccasion, weatherStr);
      setRecommendation(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVirtualTryOn = async () => {
    if (!userImage || !recommendation) return;
    setGeneratingTryOn(true);
    try {
      const base64 = userImage.split(',')[1];
      const mimeType = userImage.split(';')[0].split(':')[1];
      const outfitDesc = recommendation.items.map(i => `${i.category}: ${i.item}`).join(', ');
      const result = await generateVirtualTryOn(base64, mimeType, outfitDesc);
      setTryOnImage(result);
    } catch (error) {
      console.error(error);
    } finally {
      setGeneratingTryOn(false);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="pt-12 pb-8 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-100 text-brand-600 text-sm font-medium mb-4"
        >
          <Sparkles size={16} />
          <span>AI-Powered Personal Stylist</span>
        </motion.div>
        <h1 className="text-5xl font-serif font-bold text-brand-900 mb-2">ChicAI</h1>
        <p className="text-brand-600/80 max-w-md mx-auto">
          Elevate your style with AI-curated outfits tailored for every occasion and weather.
        </p>
      </header>

      <main className="max-w-4xl mx-auto px-6 space-y-8">
        {/* Weather Widget */}
        {weather && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="flex items-center justify-between py-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-100 flex items-center justify-center text-brand-500">
                  {weather.condition.includes('Sun') ? <Sun size={24} /> : <Cloud size={24} />}
                </div>
                <div>
                  <p className="text-sm text-brand-600 font-medium">Current Weather</p>
                  <p className="text-lg font-bold text-brand-900">{weather.city}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-brand-900">{weather.temp}°C</p>
                <p className="text-sm text-brand-500">{weather.condition}</p>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Occasion Selection */}
        <section>
          <h2 className="text-xl font-bold text-brand-900 mb-4 flex items-center gap-2">
            <Shirt size={20} className="text-brand-500" />
            Where are you going?
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {occasions.map((occ) => (
              <button
                key={occ.id}
                onClick={() => setSelectedOccasion(occ.id)}
                className={`relative group p-4 rounded-3xl transition-all duration-300 text-left border-2 ${
                  selectedOccasion === occ.id
                    ? 'border-brand-500 bg-white shadow-xl scale-105'
                    : 'border-transparent bg-white/50 hover:bg-white hover:shadow-lg'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl mb-3 flex items-center justify-center ${occ.color}`}>
                  <occ.icon size={20} />
                </div>
                <span className="font-bold text-brand-900">{occ.label}</span>
                {selectedOccasion === occ.id && (
                  <motion.div
                    layoutId="active-check"
                    className="absolute top-3 right-3 text-brand-500"
                  >
                    <CheckCircle2 size={18} />
                  </motion.div>
                )}
              </button>
            ))}
          </div>
          
          <div className="mt-8 flex justify-center">
            <Button
              size="lg"
              onClick={handleGenerate}
              disabled={!selectedOccasion || loading}
              className="w-full sm:w-auto min-w-[200px]"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 animate-spin" size={20} />
                  Curating Looks...
                </>
              ) : (
                <>
                  Get Recommendations
                  <ChevronRight className="ml-2" size={20} />
                </>
              )}
            </Button>
          </div>
        </section>

        {/* Recommendations */}
        <AnimatePresence mode="wait">
          {recommendation && (
            <motion.section
              key="recommendation"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-serif font-bold text-brand-900 italic">
                  {recommendation.title}
                </h2>
                <div className="flex gap-1">
                  {recommendation.colorPalette.map((color, i) => (
                    <div
                      key={i}
                      className="w-6 h-6 rounded-full border border-white/20 shadow-sm"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              <Card className="space-y-6">
                <p className="text-brand-700 leading-relaxed italic">
                  "{recommendation.description}"
                </p>

                <div className="grid gap-4">
                  {recommendation.items.map((item, i) => (
                    <div key={i} className="flex gap-4 p-4 rounded-2xl bg-brand-50/50 border border-brand-100">
                      <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-brand-400 shadow-sm">
                        <Shirt size={24} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-brand-400 uppercase tracking-wider">
                          {item.category}
                        </p>
                        <p className="font-bold text-brand-900 mb-1">{item.item}</p>
                        <p className="text-sm text-brand-600 italic">{item.stylingTip}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-brand-100">
                  <p className="text-sm font-bold text-brand-900 mb-2 flex items-center gap-2">
                    <Sparkles size={16} className="text-brand-500" />
                    Stylist's Note
                  </p>
                  <p className="text-brand-700 text-sm leading-relaxed">
                    {recommendation.overallStylingTip}
                  </p>
                </div>
              </Card>

              {/* Virtual Try-On Section */}
              <section className="pt-8">
                <h2 className="text-xl font-bold text-brand-900 mb-4 flex items-center gap-2">
                  <Camera size={20} className="text-brand-500" />
                  Virtual Try-On
                </h2>
                <Card className="flex flex-col items-center text-center space-y-6">
                  {!userImage ? (
                    <div className="w-full max-w-sm space-y-4">
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full aspect-square rounded-3xl border-2 border-dashed border-brand-200 bg-brand-50/30 flex flex-col items-center justify-center cursor-pointer hover:bg-brand-50/50 transition-colors"
                      >
                        <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center text-brand-500 mb-4">
                          <Upload size={32} />
                        </div>
                        <p className="font-bold text-brand-900">Upload your photo</p>
                        <p className="text-sm text-brand-500 px-8">
                          Choose a photo from your gallery
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="h-px flex-1 bg-brand-100" />
                        <span className="text-xs font-bold text-brand-300 uppercase tracking-widest">OR</span>
                        <div className="h-px flex-1 bg-brand-100" />
                      </div>

                      <Button 
                        variant="outline" 
                        className="w-full py-6 rounded-3xl"
                        onClick={() => setShowCamera(true)}
                      >
                        <Camera className="mr-2" size={20} />
                        Take a Live Photo
                      </Button>
                    </div>
                  ) : (
                    <div className="w-full space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <p className="text-sm font-bold text-brand-500 uppercase tracking-widest">Original</p>
                          <div className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-xl">
                            <img src={userImage} alt="User" className="w-full h-full object-cover" />
                            <button 
                              onClick={() => setUserImage(null)}
                              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center backdrop-blur-md hover:bg-black/70 transition-colors"
                            >
                              <RefreshCw size={20} />
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-bold text-brand-500 uppercase tracking-widest">AI Result</p>
                          <div className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-xl bg-brand-100 flex items-center justify-center">
                            {generatingTryOn ? (
                              <div className="flex flex-col items-center gap-3">
                                <Loader2 className="animate-spin text-brand-500" size={48} />
                                <p className="text-brand-600 font-medium animate-pulse">Styling you...</p>
                              </div>
                            ) : tryOnImage ? (
                              <img src={tryOnImage} alt="Try On" className="w-full h-full object-cover" />
                            ) : (
                              <div className="text-center px-8">
                                <Sparkles size={48} className="mx-auto text-brand-200 mb-4" />
                                <p className="text-brand-400">Ready to see your new look?</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {!tryOnImage && !generatingTryOn && (
                        <Button 
                          onClick={handleVirtualTryOn}
                          className="w-full"
                        >
                          Generate Virtual Try-On
                        </Button>
                      )}
                    </div>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageUpload} 
                    accept="image/*" 
                    className="hidden" 
                  />
                </Card>
              </section>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {showCamera && (
          <CameraCapture 
            onCapture={(img) => setUserImage(img)} 
            onClose={() => setShowCamera(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
