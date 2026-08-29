import React, { useState, useRef, useEffect } from 'react';
import { TravelMemory, CountryInfo, OptionalFeatures } from '../types';
import { TravelStats } from '../utils/storage';
import { findCountry } from '../data/countries';
import { 
  X, 
  Download, 
  Sparkles, 
  Palette, 
  Compass, 
  Check, 
  Printer, 
  Layers,
  MapPin,
  Share2,
  RefreshCw,
  Sliders
} from 'lucide-react';

interface TravelPosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  memories: TravelMemory[];
  stats: TravelStats;
  travelerName?: string;
  homeCountryCode?: string;
  features?: OptionalFeatures;
}

type PosterTheme = 'vintage' | 'modern' | 'midnight' | 'passport';
type AspectRatio = 'portrait' | 'story' | 'square';

export function TravelPosterModal({
  isOpen,
  onClose,
  memories,
  stats,
  travelerName = 'Traveler',
  homeCountryCode,
  features
}: TravelPosterModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [theme, setTheme] = useState<PosterTheme>('vintage');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('portrait');
  const [posterTitle, setPosterTitle] = useState<string>(`${travelerName || 'Traveler'}'s World Odyssey`);
  const [posterQuote, setPosterQuote] = useState<string>('The world is a book, and those who do not travel read only one page.');
  const [quoteAuthor, setQuoteAuthor] = useState<string>('Saint Augustine');
  const [showStamps, setShowStamps] = useState<boolean>(true);
  const [showStatsRibbon, setShowStatsRibbon] = useState<boolean>(true);
  const [isGeneratingQuote, setIsGeneratingQuote] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  // Generate AI Quote
  const handleGenerateAIQuote = async () => {
    setIsGeneratingQuote(true);
    try {
      const visitedCountryNames = Array.from(stats.visitedCountryCodes).map((code: string) => {
        const c = findCountry(code);
        return c?.name || code;
      });

      const res = await fetch('/api/ai/generate-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitedCountries: visitedCountryNames,
          homeCountry: 'Earth',
          theme
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.quote) setPosterQuote(data.quote);
        if (data.attribution) setQuoteAuthor(data.attribution);
      }
    } catch (err) {
      console.error('Failed to generate AI quote:', err);
    } finally {
      setIsGeneratingQuote(false);
    }
  };

  // Render the poster onto HTML5 Canvas
  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dimensions
    let width = 1600;
    let height = 2200; // 3:4 portrait
    if (aspectRatio === 'square') {
      height = 1600;
    } else if (aspectRatio === 'story') {
      height = 2844; // 9:16 vertical
    }

    canvas.width = width;
    canvas.height = height;

    // Background & Palette Setup
    let bgGradient: CanvasGradient;
    let primaryText = '#1c1917';
    let secondaryText = '#78716c';
    let accentColor = '#b45309'; // amber
    let borderColor = '#d6d3d1';
    let mapLandColor = '#e7e5e4';
    let cardBg = 'rgba(255, 255, 255, 0.85)';

    if (theme === 'vintage') {
      // Warm aged parchment
      bgGradient = ctx.createLinearGradient(0, 0, width, height);
      bgGradient.addColorStop(0, '#fbf8ee');
      bgGradient.addColorStop(0.5, '#f4ece1');
      bgGradient.addColorStop(1, '#ebdcc9');

      primaryText = '#2c221a';
      secondaryText = '#6e5d4f';
      accentColor = '#9a3412';
      borderColor = '#c7ad8c';
      cardBg = 'rgba(250, 245, 235, 0.9)';
    } else if (theme === 'modern') {
      // Clean modern indigo minimalist
      bgGradient = ctx.createLinearGradient(0, 0, width, height);
      bgGradient.addColorStop(0, '#ffffff');
      bgGradient.addColorStop(1, '#f1f5f9');

      primaryText = '#0f172a';
      secondaryText = '#475569';
      accentColor = '#2563eb';
      borderColor = '#cbd5e1';
      cardBg = 'rgba(255, 255, 255, 0.95)';
    } else if (theme === 'midnight') {
      // Midnight celestial slate
      bgGradient = ctx.createLinearGradient(0, 0, width, height);
      bgGradient.addColorStop(0, '#090d16');
      bgGradient.addColorStop(0.5, '#0d1527');
      bgGradient.addColorStop(1, '#05070c');

      primaryText = '#f8fafc';
      secondaryText = '#94a3b8';
      accentColor = '#38bdf8';
      borderColor = '#1e293b';
      cardBg = 'rgba(15, 23, 42, 0.75)';
    } else {
      // Passport biometric retro
      bgGradient = ctx.createLinearGradient(0, 0, width, height);
      bgGradient.addColorStop(0, '#132438');
      bgGradient.addColorStop(1, '#0b1622');

      primaryText = '#f8fafc';
      secondaryText = '#cbd5e1';
      accentColor = '#fbbf24';
      borderColor = '#334155';
      cardBg = 'rgba(30, 41, 59, 0.85)';
    }

    // Fill Background
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Decorative Borders
    ctx.save();
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 4;
    ctx.strokeRect(40, 40, width - 80, height - 80);

    // Inner thin border
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(52, 52, width - 104, height - 104);

    // Corner ornate accents
    const corners = [
      [52, 52],
      [width - 52, 52],
      [52, height - 52],
      [width - 52, height - 52]
    ];
    corners.forEach(([cx, cy]) => {
      ctx.fillStyle = accentColor;
      ctx.beginPath();
      ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    // Top Header Badge
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = '600 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.letterSpacing = '6px';
    ctx.fillStyle = accentColor;
    ctx.fillText('MEMORY ATLAS • OFFICIAL EXPEDITION RECORD', width / 2, 110);

    // Main Poster Title
    ctx.font = theme === 'vintage' ? 'italic 700 68px "Georgia", serif' : '800 64px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillStyle = primaryText;
    ctx.fillText(posterTitle, width / 2, 190);

    // Subtitle / Date range
    const sortedMemories = [...memories].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    const firstYear = sortedMemories.length > 0 ? new Date(sortedMemories[0].startDate).getFullYear() : 2022;
    const latestYear = sortedMemories.length > 0 ? new Date(sortedMemories[sortedMemories.length - 1].startDate).getFullYear() : 2026;
    
    ctx.font = '500 24px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillStyle = secondaryText;
    ctx.fillText(`EXPLORATIONS & JOURNEYS • ${firstYear} — ${latestYear}`, width / 2, 235);
    ctx.restore();

    // Center Stat Cards Ribbon
    if (showStatsRibbon) {
      const ribbonY = 275;
      const cardWidth = 330;
      const cardHeight = 130;
      const spacing = 30;
      const totalRibbonWidth = (cardWidth * 4) + (spacing * 3);
      const startX = (width - totalRibbonWidth) / 2;

      const statCards = [
        { label: 'SOVEREIGN NATIONS', value: `${stats.totalVisitedCountries} / 195`, sub: `${stats.percentageOfWorld}% OF THE WORLD` },
        { label: 'CONTINENTS VISITED', value: `${stats.continentsVisitedCount} / 7`, sub: 'GLOBAL REACH' },
        { label: 'RECORDED JOURNEYS', value: `${stats.totalMemoriesCount}`, sub: 'EXPEDITIONS' },
        { label: 'CAPTURED PHOTOS', value: `${stats.totalPhotosCount}`, sub: 'ARCHIVED SHOTS' }
      ];

      statCards.forEach((c, i) => {
        const cx = startX + (i * (cardWidth + spacing));
        
        // Card Box
        ctx.save();
        ctx.fillStyle = cardBg;
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(cx, ribbonY, cardWidth, cardHeight, 14);
        ctx.fill();
        ctx.stroke();

        // Card Content
        ctx.textAlign = 'center';
        ctx.fillStyle = accentColor;
        ctx.font = '600 16px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.fillText(c.label, cx + cardWidth / 2, ribbonY + 32);

        ctx.fillStyle = primaryText;
        ctx.font = '800 38px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.fillText(c.value, cx + cardWidth / 2, ribbonY + 76);

        ctx.fillStyle = secondaryText;
        ctx.font = '500 15px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.fillText(c.sub, cx + cardWidth / 2, ribbonY + 108);
        ctx.restore();
      });
    }

    // Visited Nations Stamp Matrix
    const matrixStartY = showStatsRibbon ? 440 : 310;
    const matrixHeight = height - matrixStartY - 330;

    // Draw Matrix Frame
    ctx.save();
    ctx.fillStyle = cardBg;
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(80, matrixStartY, width - 160, matrixHeight, 18);
    ctx.fill();
    ctx.stroke();

    // Section Header
    ctx.fillStyle = primaryText;
    ctx.textAlign = 'left';
    ctx.font = theme === 'vintage' ? 'italic 700 28px "Georgia", serif' : '700 24px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText('PORTFOLIO OF VISITED NATIONS & CITIES', 110, matrixStartY + 45);

    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(110, matrixStartY + 62);
    ctx.lineTo(width - 110, matrixStartY + 62);
    ctx.stroke();

    // Grid of Visited Country Stamps
    const visitedList = Array.from(stats.visitedCountryCodes).map((code: string) => {
      const c = findCountry(code);
      const trip = memories.find(m => m.countryCode.toUpperCase() === code);
      return {
        code,
        name: c?.name || code,
        flag: c?.flag || '🌍',
        continent: c?.continent || 'World',
        city: trip?.city || c?.capital || '',
        year: trip?.startDate ? new Date(trip.startDate).getFullYear() : ''
      };
    });

    const stampCols = 3;
    const stampWidth = (width - 240) / stampCols;
    const stampHeight = 85;
    const startStampY = matrixStartY + 85;

    visitedList.slice(0, 18).forEach((item, idx) => {
      const col = idx % stampCols;
      const row = Math.floor(idx / stampCols);
      const sx = 110 + (col * stampWidth);
      const sy = startStampY + (row * (stampHeight + 14));

      if (sy + stampHeight > matrixStartY + matrixHeight - 20) return;

      // Stamp Card
      ctx.save();
      ctx.fillStyle = theme === 'midnight' || theme === 'passport' ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.7)';
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(sx, sy, stampWidth - 16, stampHeight, 10);
      ctx.fill();
      ctx.stroke();

      // Flag
      ctx.font = '36px "Apple Color Emoji", "Segoe UI Emoji", sans-serif';
      ctx.fillText(item.flag, sx + 14, sy + 52);

      // Country Name
      ctx.fillStyle = primaryText;
      ctx.font = '700 20px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText(item.name, sx + 68, sy + 36);

      // City & Year
      ctx.fillStyle = secondaryText;
      ctx.font = '500 15px -apple-system, BlinkMacSystemFont, sans-serif';
      const locText = item.city ? `${item.city} • ${item.year}` : `${item.continent} • ${item.year}`;
      ctx.fillText(locText, sx + 68, sy + 62);
      ctx.restore();
    });
    ctx.restore();

    // Footer: Quote & Signature Stamp
    const footerY = height - 260;
    ctx.save();
    ctx.textAlign = 'center';
    
    // Inspiring Quote
    ctx.fillStyle = primaryText;
    ctx.font = theme === 'vintage' ? 'italic 500 26px "Georgia", serif' : '500 24px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText(`“${posterQuote}”`, width / 2, footerY + 30);

    ctx.fillStyle = accentColor;
    ctx.font = '600 18px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText(`— ${quoteAuthor}`, width / 2, footerY + 65);

    // Compass / Certified Stamp
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(140, footerY + 105);
    ctx.lineTo(width - 140, footerY + 105);
    ctx.stroke();

    ctx.fillStyle = secondaryText;
    ctx.font = '600 16px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.letterSpacing = '3px';
    ctx.fillText(`CARTOGRAPHIC EDITION • GENERATED VIA MEMORY ATLAS • ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`, width / 2, footerY + 140);

    ctx.restore();

  }, [isOpen, theme, aspectRatio, posterTitle, posterQuote, quoteAuthor, showStatsRibbon, stats, memories, travelerName]);

  // Download High-Res PNG
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsDownloading(true);
    try {
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = `Memory_Atlas_Poster_${posterTitle.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const win = window.open('');
    if (win) {
      win.document.write(`<img src="${canvas.toDataURL()}" style="width:100%; height:auto;" onload="window.print();window.close()"/>`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#111827] border border-slate-800 rounded-3xl w-full max-w-6xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden text-slate-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">Exportable Travel Poster & Cartography</h2>
              <p className="text-xs text-slate-400">Generate a high-res souvenir print of your journeys around the globe</p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Left Controls, Right Canvas Live Preview */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-y-auto divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
          
          {/* Controls Sidebar (5 cols) */}
          <div className="lg:col-span-5 p-5 space-y-5 overflow-y-auto bg-slate-900/30">
            
            {/* Theme Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-amber-400" />
                Artistic Style & Theme
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'vintage', name: 'Vintage Parchment', desc: 'Warm aged cartography' },
                  { id: 'modern', name: 'Modern Minimalist', desc: 'Clean indigo geometric' },
                  { id: 'midnight', name: 'Midnight Celestial', desc: 'Dark star-studded slate' },
                  { id: 'passport', name: 'Passport Edition', desc: 'Retro visa aesthetic' }
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id as PosterTheme)}
                    className={`p-3 rounded-2xl text-left border transition-all ${
                      theme === t.id
                        ? 'bg-amber-500/10 border-amber-500/50 text-white shadow-sm'
                        : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="font-semibold text-xs text-white">{t.name}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Poster Title Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Poster Headline
              </label>
              <input
                type="text"
                value={posterTitle}
                onChange={(e) => setPosterTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-400"
                placeholder="e.g. Alex's World Odyssey"
              />
            </div>

            {/* Inspiring Tagline & AI Quote Button */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Poster Motto / Quote
                </label>
                {features?.aiAssistant !== false && (
                  <button
                    onClick={handleGenerateAIQuote}
                    disabled={isGeneratingQuote}
                    className="text-xs font-medium text-amber-400 hover:text-amber-300 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${isGeneratingQuote ? 'animate-spin' : ''}`} />
                    {isGeneratingQuote ? 'Crafting with AI...' : 'AI Generate Quote'}
                  </button>
                )}
              </div>
              <textarea
                rows={2}
                value={posterQuote}
                onChange={(e) => setPosterQuote(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800/60 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400 resize-none"
              />
              <input
                type="text"
                value={quoteAuthor}
                onChange={(e) => setQuoteAuthor(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-800/40 border border-slate-700/60 text-xs text-slate-300 focus:outline-none focus:border-amber-400"
                placeholder="Attribution / Author"
              />
            </div>

            {/* Aspect Ratio */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                Aspect Ratio
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'portrait', name: 'Portrait', ratio: '3 : 4' },
                  { id: 'square', name: 'Square', ratio: '1 : 1' },
                  { id: 'story', name: 'Story / Feed', ratio: '9 : 16' }
                ].map(ar => (
                  <button
                    key={ar.id}
                    onClick={() => setAspectRatio(ar.id as AspectRatio)}
                    className={`py-2 px-3 rounded-xl border text-center transition-all ${
                      aspectRatio === ar.id
                        ? 'bg-amber-500/10 border-amber-500/50 text-white font-medium'
                        : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-semibold">{ar.name}</div>
                    <div className="text-[10px] text-slate-500">{ar.ratio}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Toggles */}
            <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-3">
              <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
                <span>Display Statistics Summary Ribbon</span>
                <input
                  type="checkbox"
                  checked={showStatsRibbon}
                  onChange={(e) => setShowStatsRibbon(e.target.checked)}
                  className="rounded bg-slate-700 border-slate-600 text-amber-500 focus:ring-amber-400"
                />
              </label>
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-col gap-2.5">
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                {isDownloading ? 'Exporting High-Res PNG...' : 'Download High-Res Print Poster (PNG)'}
              </button>

              <button
                onClick={handlePrint}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-2 border border-slate-700 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                Print / Save PDF
              </button>
            </div>

          </div>

          {/* Canvas Live Preview Container (7 cols) */}
          <div className="lg:col-span-7 p-6 flex flex-col items-center justify-center bg-slate-950/60 overflow-hidden">
            <div className="w-full max-w-lg flex flex-col items-center justify-center">
              <div className="text-center mb-3">
                <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-widest bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                  Live Poster Render (2400 × 3300 px Quality)
                </span>
              </div>

              {/* Responsive container for canvas */}
              <div className="w-full rounded-2xl shadow-2xl overflow-hidden border border-slate-800 max-h-[64vh] flex items-center justify-center bg-slate-900">
                <canvas
                  ref={canvasRef}
                  className="w-full h-auto object-contain max-h-[62vh] rounded-xl shadow-xl"
                />
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
