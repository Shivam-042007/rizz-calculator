import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, RefreshCw, Zap, Star, ShieldAlert, Sparkles, X, Download, Share2, ChevronLeft, ChevronRight, Github, Instagram } from 'lucide-react';
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

// Fetching the API key securely from Vite environment variables
const apiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim(); 

export default function App() {
  const [image, setImage] = useState(null);
  const [base64Image, setBase64Image] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [scanStage, setScanStage] = useState(0);
  const [selectedFeatureIndex, setSelectedFeatureIndex] = useState(null);
  const [showAdvice, setShowAdvice] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const fileInputRef = useRef(null);

  const loadingStages = [
    "Scanning facial aesthetics...",
    "Calculating jawline angularity...",
    "Measuring aura levels...",
    "Checking for unspoken rizz...",
    "Consulting the W-Rizz database..."
  ];

  useEffect(() => {
    let interval;
    if (loading) {
      setScanStage(0);
      interval = setInterval(() => {
        setScanStage((prev) => (prev + 1) % loadingStages.length);
      }, 1200);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setResult(null);
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target.result);
      const base64Str = e.target.result.split(',')[1];
      setBase64Image(base64Str);
    };
    reader.readAsDataURL(file);
  };

  const analyzeFace = async () => {
    if (!base64Image) return;

    if (!apiKey) {
      setError("API Key is missing! Check your .env file.");
      return;
    }

    setLoading(true);
    setError(null);

    const promptText = `
      You are a fun, highly exaggerated Gen-Z 'rizz' and 'looksmaxxing' analyzer. 
      Look at this photo. If it's not a person, jokingly call them out (e.g., 'Bro really uploaded a picture of a dog'). 
      If it is a person, analyze their facial features, 'aura', and 'rizz potential'. 
      Give me a JSON response with EXACTLY these fields: 
      - 'score' (number between 0.0 and 10.0), 
      - 'percentile' (string, e.g., 'Top 27%'),
      - 'tier' (string, e.g., 'Unspoken Rizz', 'W Rizz', 'Cooked', 'GigaChad', 'Mewing Champion'), 
      - 'analysis' (string, 2-3 sentences of funny, playful Gen-Z slang about their look and potential. Keep it PG-13, lighthearted, and not actually insulting, just hype them up or playfully roast their 'vibes'),
      - 'features' (array of exactly 8 objects analyzing attributes like Eyes, Stress, Hair, Happiness, Skin, Fatigue, Jawline/Structure, Confidence). Each object must have: 'name' (string, e.g., 'Eyes'), 'detail' (string, e.g., 'Almond Eyes'), 'score' (number 0.0 to 10.0), 'emoji' (a single emoji representing it), 'description' (string, a full 2-3 sentence detailed analysis of this specific feature), and 'advice' (string, 2-3 sentences of actionable guidance or 'looksmaxxing' advice to improve or maintain this specific feature).
    `;

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: SchemaType.OBJECT,
            properties: {
              score: { type: SchemaType.NUMBER },
              percentile: { type: SchemaType.STRING },
              tier: { type: SchemaType.STRING },
              analysis: { type: SchemaType.STRING },
              features: {
                type: SchemaType.ARRAY,
                items: {
                  type: SchemaType.OBJECT,
                  properties: {
                    name: { type: SchemaType.STRING },
                    detail: { type: SchemaType.STRING },
                    score: { type: SchemaType.NUMBER },
                    emoji: { type: SchemaType.STRING },
                    description: { type: SchemaType.STRING },
                    advice: { type: SchemaType.STRING }
                  }
                }
              }
            },
            required: ["score", "percentile", "tier", "analysis", "features"]
          }
        }
      });

      const imagePart = { inlineData: { data: base64Image, mimeType: "image/jpeg" } };
      const responseResult = await model.generateContent([promptText, imagePart]);
      const responseText = responseResult.response.text();
      setResult(JSON.parse(responseText));

    } catch (err) {
      console.error("API Error:", err);
      setError("The aura was too strong and broke our servers. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const resetApp = () => {
    setImage(null);
    setBase64Image(null);
    setResult(null);
    setError(null);
    setSelectedFeatureIndex(null);
    setShowAdvice(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleNextFeature = () => {
    if (selectedFeatureIndex < result.features.length - 1) {
      setSelectedFeatureIndex(prev => prev + 1);
      setShowAdvice(false);
    }
  };

  const handlePrevFeature = () => {
    if (selectedFeatureIndex > 0) {
      setSelectedFeatureIndex(prev => prev - 1);
      setShowAdvice(false);
    }
  };

  const getFeatureScoreColor = (score) => {
    if (score >= 9.0) return 'text-emerald-400';
    if (score >= 8.0) return 'text-blue-400';
    if (score >= 7.0) return 'text-indigo-400';
    if (score >= 5.0) return 'text-amber-400';
    return 'text-red-400';
  };

  const getFeatureScoreHexColor = (score) => {
    if (score >= 9.0) return '#34d399'; 
    if (score >= 8.0) return '#60a5fa'; 
    if (score >= 7.0) return '#818cf8'; 
    if (score >= 5.0) return '#fbbf24'; 
    return '#f87171'; 
  };

  const downloadReport = async () => {
    if (!result || !image) return;
    try {
      setIsGeneratingReport(true);
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 1400; 
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = '#020617'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const glow1 = ctx.createRadialGradient(800, 0, 0, 800, 0, 800);
      glow1.addColorStop(0, 'rgba(168, 85, 247, 0.15)'); 
      glow1.addColorStop(1, 'rgba(168, 85, 247, 0)');
      ctx.fillStyle = glow1;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const glow2 = ctx.createRadialGradient(0, 1400, 0, 0, 1400, 800);
      glow2.addColorStop(0, 'rgba(236, 72, 153, 0.15)'); 
      glow2.addColorStop(1, 'rgba(236, 72, 153, 0)');
      ctx.fillStyle = glow2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 36px sans-serif';
      ctx.textAlign = 'center';
      ctx.letterSpacing = "2px";
      ctx.fillText('RIZZ ANALYSIS REPORT', 400, 70);

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = image;
      await new Promise(r => img.onload = r);

      const imgX = 50, imgY = 120, imgW = 700, imgH = 460;

      ctx.shadowColor = 'rgba(236, 72, 153, 0.4)'; 
      ctx.shadowBlur = 40;
      ctx.shadowOffsetY = 10;
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.roundRect(imgX, imgY, imgW, imgH, 32);
      ctx.fill();
      
      ctx.shadowBlur = 0; 
      ctx.shadowOffsetY = 0;

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(imgX, imgY, imgW, imgH, 32);
      ctx.clip();
      
      const scale = Math.max(imgW / img.width, imgH / img.height);
      const sWidth = imgW / scale;
      const sHeight = imgH / scale;
      const sx = (img.width - sWidth) / 2;
      const sy = (img.height - sHeight) / 2;
      
      ctx.drawImage(img, sx, sy, sWidth, sHeight, imgX, imgY, imgW, imgH);
      ctx.restore();

      ctx.strokeStyle = '#06b6d4'; 
      ctx.lineWidth = 4;
      const bLen = 50, m = 40; 
      
      ctx.beginPath(); ctx.moveTo(imgX + m, imgY + m + bLen); ctx.lineTo(imgX + m, imgY + m); ctx.lineTo(imgX + m + bLen, imgY + m); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(imgX + imgW - m - bLen, imgY + imgH - m); ctx.lineTo(imgX + imgW - m, imgY + imgH - m); ctx.lineTo(imgX + imgW - m, imgY + imgH - m - bLen); ctx.stroke();

      const badgeY = imgY + imgH;
      ctx.fillStyle = '#0f172a'; 
      ctx.beginPath(); ctx.roundRect(250, badgeY - 25, 300, 50, 25); ctx.fill();
      ctx.strokeStyle = '#ec4899'; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = '#f8fafc'; ctx.font = 'bold 22px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(`⭐ ${result.tier} ⭐`, 400, badgeY + 7);

      ctx.fillStyle = '#f8fafc'; ctx.font = '800 28px sans-serif'; ctx.textAlign = 'left'; ctx.fillText('Facial Architecture', 50, 670);

      let baseY = 730;
      result.features.forEach((feature, idx) => {
        const col = idx % 2; const row = Math.floor(idx / 2);
        const x = col === 0 ? 50 : 420; const y = baseY + (row * 105); const colWidth = 330;

        ctx.fillStyle = '#f8fafc'; ctx.font = 'bold 22px sans-serif'; ctx.textAlign = 'left'; ctx.fillText(`${feature.emoji} ${feature.name}`, x, y);
        ctx.fillStyle = '#94a3b8'; ctx.font = '16px sans-serif'; ctx.fillText(feature.detail, x + 35, y + 24);
        ctx.fillStyle = getFeatureScoreHexColor(feature.score); ctx.font = '900 26px sans-serif'; ctx.textAlign = 'right'; ctx.fillText(feature.score.toFixed(1), x + colWidth, y + 10);
        
        ctx.fillStyle = '#1e293b'; ctx.beginPath(); ctx.roundRect(x, y + 42, colWidth, 8, 4); ctx.fill();
        const scoreRatio = feature.score / 10;
        ctx.fillStyle = getFeatureScoreHexColor(feature.score); ctx.beginPath(); ctx.roundRect(x, y + 42, Math.max(colWidth * scoreRatio, 10), 8, 4); ctx.fill();
      });

      const cardY = baseY + 450;
      const cardGrad = ctx.createLinearGradient(50, cardY, 750, cardY + 160);
      cardGrad.addColorStop(0, '#1e1b4b'); cardGrad.addColorStop(1, '#312e81'); ctx.fillStyle = cardGrad;
      ctx.beginPath(); ctx.roundRect(50, cardY, 700, 160, 24); ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'; ctx.lineWidth = 2; ctx.stroke();

      ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 45px sans-serif'; ctx.textAlign = 'left'; ctx.fillText('✨', 80, cardY + 70);
      ctx.fillStyle = '#f8fafc'; ctx.font = '900 36px sans-serif'; ctx.fillText('TOTAL AURA', 145, cardY + 65);
      ctx.fillStyle = '#cbd5e1'; ctx.font = '18px sans-serif'; ctx.fillText(result.percentile, 148, cardY + 95);

      ctx.shadowColor = getFeatureScoreHexColor(result.score); ctx.shadowBlur = 20; ctx.fillStyle = '#ffffff'; ctx.font = '900 80px sans-serif'; ctx.textAlign = 'right'; ctx.fillText(result.score.toFixed(1), 710, cardY + 110);
      ctx.shadowBlur = 0; 
      ctx.fillStyle = '#94a3b8'; ctx.font = 'bold 24px sans-serif'; ctx.fillText('/ 10', 710, cardY + 140);
      ctx.fillStyle = '#64748b'; ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('Generated by Rizz Calculator AI', 400, 1370);

      const link = document.createElement('a');
      link.download = `Aura_Report_${Math.round(result.score * 10)}.jpg`;
      link.href = canvas.toDataURL('image/jpeg', 0.95);
      link.click();
    } catch (err) {
      console.error("Error generating report:", err);
      setError("Failed to generate report image.");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleShare = async () => {
    let shareText = `I just got a ${Number(result.score).toFixed(1)}/10 Aura Score on the Rizz Calculator! 🗿✨`;
    if (selectedFeatureIndex !== null) {
      const feature = result.features[selectedFeatureIndex];
      shareText = `My ${feature.name} just scored a ${Number(feature.score).toFixed(1)}/10 on the AI Rizz Calculator! ${feature.emoji}`;
    }
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Rizz Calculator AI', text: shareText, url: window.location.href });
      } catch (err) { console.log('User cancelled share:', err); }
    } else {
      navigator.clipboard.writeText(`${shareText} - Check it out here: ${window.location.href}`);
      alert("Results copied to clipboard! 📋");
    }
  };

  return (
    <div className="min-h-screen bg-[#05050f] text-slate-100 font-sans flex flex-col items-center py-12 px-4 selection:bg-pink-500 selection:text-white relative overflow-hidden">
      
      {/* Dynamic Cyber/Tech Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f1a_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f1a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        {/* Animated Glowing Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/30 blur-[120px] rounded-full mix-blend-screen animate-[pulse-glow_8s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-600/20 blur-[120px] rounded-full mix-blend-screen animate-[pulse-glow_10s_ease-in-out_infinite_reverse]"></div>
      </div>

      {/* Main Calculator Card */}
      <div className="relative z-10 w-full max-w-md bg-slate-900/60 backdrop-blur-2xl border border-slate-700/50 rounded-3xl shadow-[0_0_50px_-12px_rgba(236,72,153,0.15)] overflow-hidden p-6 md:p-8 transition-all duration-500">
        
        {/* Header */}
        <div className="text-center mb-8 group cursor-default">
          <div className="inline-flex items-center justify-center p-3 bg-slate-800/80 rounded-2xl mb-4 shadow-inner border border-slate-700/50 group-hover:scale-110 group-hover:bg-slate-800 transition-all duration-300">
            <Zap className="w-8 h-8 text-pink-500 drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]" />
          </div>
          <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-sm">
            Rizz Calculator
          </h1>
          <p className="text-slate-400 mt-2 text-sm font-medium tracking-wide">
            AI-powered aura & looksmaxxing analysis
          </p>
        </div>

        {/* State 1: Upload */}
        {!image && !loading && !result && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
            <div 
              className="relative border-2 border-dashed border-slate-600 hover:border-pink-500 rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 bg-slate-800/30 hover:bg-slate-800/60 group hover:-translate-y-1 hover:shadow-[0_10px_40px_-10px_rgba(236,72,153,0.2)]"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="p-4 bg-slate-800/80 rounded-full group-hover:scale-110 group-hover:bg-slate-700 transition-all duration-300 shadow-xl border border-slate-700">
                <Camera className="w-8 h-8 text-slate-300 group-hover:text-pink-400" />
              </div>
              <p className="mt-5 text-base font-bold text-slate-300 group-hover:text-pink-100 transition-colors">
                Tap to scan aesthetics
              </p>
              <p className="text-xs text-slate-500 mt-2 font-medium">JPEG, PNG, HEIC accepted</p>
            </div>
            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
          </div>
        )}

        {/* State 2: Preview & Loading */}
        {image && !result && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-[3/4] sm:aspect-square flex items-center justify-center border border-slate-700/80 shadow-2xl ring-1 ring-white/10">
              <img 
                src={image} 
                alt="User submission" 
                className={`w-full h-full object-cover transition-all duration-1000 ${loading ? 'scale-110 brightness-40 blur-[2px]' : ''}`} 
              />
              
              {/* Scanline Effect during loading */}
              {loading && (
                <div className="absolute inset-0 z-10 pointer-events-none flex flex-col overflow-hidden">
                  <div className="w-full h-1 bg-pink-500 shadow-[0_0_20px_2px_rgba(236,72,153,1)] animate-[scan_2s_ease-in-out_infinite]"></div>
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(236,72,153,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(236,72,153,0.1)_1px,transparent_1px)] bg-[size:30px_30px] opacity-30"></div>
                </div>
              )}
            </div>

            {!loading ? (
              <div className="flex gap-3">
                <button 
                  onClick={resetApp}
                  className="flex-1 py-3 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 border border-slate-600 shadow-lg"
                >
                  <RefreshCw className="w-4 h-4" /> Retake
                </button>
                <button 
                  onClick={analyzeFace}
                  className="flex-[2] py-3 px-4 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.03] active:scale-95 shadow-[0_0_20px_rgba(236,72,153,0.4)] hover:shadow-[0_0_30px_rgba(236,72,153,0.6)] border border-pink-500/50"
                >
                  <Sparkles className="w-5 h-5 animate-pulse" /> Analyze Aura
                </button>
              </div>
            ) : (
              <div className="text-center py-3 bg-slate-800/50 rounded-xl border border-slate-700/50 backdrop-blur-sm">
                <p className="text-pink-400 font-bold animate-pulse tracking-wide text-sm">
                  {loadingStages[scanStage]}
                </p>
              </div>
            )}
          </div>
        )}

        {/* State 3: Results */}
        {result && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
            
            {/* Header Profile Card */}
            <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-slate-800/80 to-slate-900/90 rounded-2xl border border-slate-700/80 shadow-inner group">
              <div className="relative">
                <img src={image} alt="Thumbnail" className="w-16 h-16 rounded-xl object-cover shadow-lg border border-slate-600" />
                <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl blur opacity-25 group-hover:opacity-50 transition-opacity duration-500 -z-10"></div>
              </div>
              <div className="flex flex-col">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  Total Aura <span className={`${getFeatureScoreColor(result.score)} text-2xl drop-shadow-md`}>{Number(result.score).toFixed(1)}</span>
                </h2>
                <p className="text-slate-400 text-sm font-semibold tracking-wide">{result.percentile}</p>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-3 px-1">
              {result.features?.map((feature, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setSelectedFeatureIndex(idx)}
                  className="flex flex-row items-center gap-3 cursor-pointer bg-slate-800/30 hover:bg-slate-700/60 p-3 rounded-xl transition-all duration-300 border border-slate-700/50 hover:border-indigo-500/50 hover:-translate-y-1 hover:shadow-lg group"
                >
                  <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center text-xl shadow-inner border border-slate-800 group-hover:scale-110 group-hover:border-indigo-500/30 transition-all">
                    {feature.emoji}
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-bold text-slate-200 leading-tight truncate">{feature.name}</span>
                    <span className={`text-xs font-black leading-tight mt-0.5 ${getFeatureScoreColor(feature.score)}`}>
                      {Number(feature.score).toFixed(1)} / 10
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Analysis Data */}
            <div className="text-center space-y-4 pt-4 border-t border-slate-700/50">
              <div>
                <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Official Tier Rating</h2>
                <div className="inline-block px-5 py-2.5 bg-slate-800 border border-slate-600 rounded-full shadow-[0_0_15px_rgba(251,191,36,0.15)]">
                  <p className="text-xl font-black text-white flex items-center gap-2 tracking-tight">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500 drop-shadow-[0_0_5px_rgba(251,191,36,0.8)]" /> 
                    {result.tier} 
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500 drop-shadow-[0_0_5px_rgba(251,191,36,0.8)]" />
                  </p>
                </div>
              </div>

              <div className="bg-slate-800/40 rounded-2xl p-5 border border-slate-700/50 shadow-inner text-left relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-pink-500 to-purple-500"></div>
                <p className="text-slate-300 leading-relaxed font-medium text-sm italic">
                  "{result.analysis}"
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                onClick={resetApp}
                className="flex-1 py-4 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center gap-2 transition-all active:scale-95 border border-slate-600 text-sm shadow-md"
              >
                <RefreshCw className="w-4 h-4" /> Retake
              </button>
              
              <button 
                onClick={downloadReport}
                disabled={isGeneratingReport}
                className="flex-[2] py-4 px-2 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20 border border-amber-500/50 text-amber-400 hover:text-amber-300 font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-[0_0_15px_rgba(245,158,11,0.15)] disabled:opacity-50 text-sm"
              >
                {isGeneratingReport ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                {isGeneratingReport ? 'Processing...' : 'Export Report'}
              </button>
            </div>
          </div>
        )}

        {/* Detailed Feature View Modal */}
        {result && selectedFeatureIndex !== null && (
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-3xl z-50 flex flex-col p-6 animate-in slide-in-from-bottom-8 duration-300 rounded-3xl overflow-y-auto border border-slate-800">
            
            {/* Top Navigation */}
            <div className="flex items-center gap-4 mb-6">
              <button 
                onClick={() => { setSelectedFeatureIndex(null); setShowAdvice(false); }} 
                className="p-2 -ml-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors active:scale-90"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="flex-1 flex gap-1.5 px-2">
                {result.features.map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i === selectedFeatureIndex ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'bg-slate-800'}`} 
                  />
                ))}
              </div>
            </div>

            {/* Header */}
            <div className="text-center space-y-1 mb-6">
              <h2 className="text-xl font-bold text-white tracking-wide">{result.features[selectedFeatureIndex].name}</h2>
              <div className={`text-3xl font-black drop-shadow-md ${getFeatureScoreColor(result.features[selectedFeatureIndex].score)}`}>
                {Number(result.features[selectedFeatureIndex].score).toFixed(1)} <span className="text-slate-500 text-lg">/10</span>
              </div>
            </div>

            {/* Image Box */}
            <div className="relative w-48 h-48 mx-auto mb-8 flex-shrink-0 group">
              <img 
                src={image} 
                alt="Feature Detail" 
                className="w-full h-full object-cover rounded-3xl shadow-2xl border-2 border-slate-700/50 group-hover:border-indigo-500/50 transition-colors duration-500" 
              />
              <div className="absolute -inset-4 bg-indigo-500/20 blur-2xl rounded-full -z-10 opacity-50 mix-blend-screen"></div>
            </div>

            {/* Description area */}
            <div className="text-center flex-1 flex flex-col bg-slate-900/50 p-5 rounded-3xl border border-slate-800/80 shadow-inner">
              <div className="text-3xl mb-3 animate-[float_3s_ease-in-out_infinite]">{result.features[selectedFeatureIndex].emoji}</div>
              <h3 className="text-lg font-black text-white mb-2">
                {showAdvice ? "Looksmaxxing Advice" : "AI Assessment"}
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed font-medium">
                {showAdvice ? result.features[selectedFeatureIndex].advice : result.features[selectedFeatureIndex].description}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 space-y-4 pb-2">
              <div className="flex gap-2 items-center">
                <button 
                  onClick={handlePrevFeature}
                  disabled={selectedFeatureIndex === 0}
                  className="p-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-md"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <button 
                  onClick={() => setShowAdvice(!showAdvice)}
                  className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_25px_rgba(79,70,229,0.6)] active:scale-95 tracking-wide"
                >
                  {showAdvice ? "View Analysis" : `Get Advice`}
                </button>

                <button 
                  onClick={handleNextFeature}
                  disabled={selectedFeatureIndex === result.features.length - 1}
                  className="p-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-md"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex justify-between gap-3 pt-2">
                <button 
                  onClick={downloadReport}
                  disabled={isGeneratingReport}
                  className="flex-1 py-3.5 flex items-center justify-center gap-2 text-slate-300 font-bold bg-slate-800/50 hover:bg-slate-700 hover:text-white rounded-2xl transition-all border border-slate-700 active:scale-95 disabled:opacity-50 text-sm"
                >
                  {isGeneratingReport ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} 
                  {isGeneratingReport ? 'Saving...' : 'Save File'}
                </button>
                
                <button 
                  onClick={handleShare}
                  className="flex-1 py-3.5 flex items-center justify-center gap-2 text-slate-300 font-bold bg-slate-800/50 hover:bg-slate-700 hover:text-white rounded-2xl transition-all border border-slate-700 active:scale-95 text-sm"
                >
                  <Share2 className="w-4 h-4" /> Share Score
                </button>
              </div>
            </div>

          </div>
        )}

        {/* Error Handling */}
        {error && (
          <div className="mt-6 bg-red-950/40 border border-red-500/50 rounded-2xl p-4 flex items-start gap-3 text-red-200 animate-in shake">
            <ShieldAlert className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

      </div>

      {/* Footer & Info Section */}
      <footer className="mt-10 w-full max-w-md flex flex-col items-center gap-4 text-center pb-8 z-10 animate-in fade-in duration-1000">
        <div className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-6 w-full backdrop-blur-md shadow-lg">
          <h3 className="text-slate-200 font-bold mb-3 flex items-center justify-center gap-2 text-lg">
            <Sparkles className="w-5 h-5 text-pink-500" /> About This Build
          </h3>
          <p className="text-slate-400 text-xs leading-relaxed font-medium">
            The Rizz Calculator is an experimental AI aesthetics analyzer. 
            Powered by React, Tailwind CSS, and Google's Gemini Vision AI to playfully analyze facial architecture and "rizz" potential. 
            <br/><br/>
            <span className="text-pink-400 font-bold tracking-wide uppercase text-[10px] bg-pink-500/10 px-3 py-1 rounded-full border border-pink-500/20">For entertainment purposes only!</span>
          </p>
        </div>

        {/* Social Links */}
        <div className="flex gap-4 mt-2">
          {/* REPLACE 'YOUR_GITHUB_USERNAME' BELOW */}
          <a 
            href="https://github.com/Shivam-042007" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="p-3.5 bg-slate-900/80 border border-slate-700 hover:border-slate-500 hover:bg-slate-800 text-slate-400 hover:text-white rounded-full transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]"
          >
            <Github className="w-5 h-5" />
          </a>
          
          {/* REPLACE 'YOUR_INSTAGRAM_USERNAME' BELOW */}
          <a 
            href="https://instagram.com/hype_coding" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="p-3.5 bg-slate-900/80 border border-slate-700 hover:border-pink-500 hover:bg-slate-800 text-slate-400 hover:text-pink-400 rounded-full transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-[0_0_15px_rgba(236,72,153,0.3)]"
          >
            <Instagram className="w-5 h-5" />
          </a>
        </div>

        {/* Copyright */}
        <p className="text-xs text-slate-500 font-semibold tracking-widest uppercase mt-4">
          &copy; {new Date().getFullYear()} Shivam Kumar Chejara.
        </p>
      </footer>

      {/* Custom CSS Animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { transform: translateY(-100%); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(400px); opacity: 0; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
      `}} />
    </div>
  );
}