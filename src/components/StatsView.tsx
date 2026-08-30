import React, { useMemo } from 'react';
import { 
  BarChart3, 
  Globe, 
  MapPin, 
  Calendar, 
  Star, 
  Heart, 
  Image as ImageIcon, 
  Award, 
  Compass, 
  CheckCircle2, 
  Sparkles,
  TrendingUp,
  Tag,
  Users,
  Sun,
  ShieldCheck,
  ChevronRight,
  DollarSign,
  PieChart,
  CreditCard,
  Plane,
  Hotel,
  Utensils,
  Ticket,
  Car,
  ShoppingBag,
  Printer
} from 'lucide-react';
import { TravelMemory, CountryInfo, ExpenseCategory, OptionalFeatures } from '../types';
import { COUNTRIES_DATA, CONTINENTS } from '../data/countries';
import { TravelStats } from '../utils/storage';

interface StatsViewProps {
  memories: TravelMemory[];
  stats: TravelStats;
  onSelectCountry: (country: CountryInfo, existingMemories: TravelMemory[]) => void;
  onOpenNewEntry: () => void;
  onOpenPosterModal?: () => void;
  features?: OptionalFeatures;
}

const CATEGORY_ICONS: Record<ExpenseCategory, React.ReactNode> = {
  flights: <Plane className="w-3.5 h-3.5 text-sky-500" />,
  lodging: <Hotel className="w-3.5 h-3.5 text-indigo-500" />,
  food: <Utensils className="w-3.5 h-3.5 text-amber-500" />,
  activities: <Ticket className="w-3.5 h-3.5 text-emerald-500" />,
  transit: <Car className="w-3.5 h-3.5 text-blue-500" />,
  shopping: <ShoppingBag className="w-3.5 h-3.5 text-purple-500" />,
  other: <DollarSign className="w-3.5 h-3.5 text-slate-500" />
};

const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  flights: 'bg-sky-500',
  lodging: 'bg-indigo-500',
  food: 'bg-amber-500',
  activities: 'bg-emerald-500',
  transit: 'bg-blue-500',
  shopping: 'bg-purple-500',
  other: 'bg-slate-400'
};

export const StatsView: React.FC<StatsViewProps> = ({
  memories,
  stats,
  onSelectCountry,
  onOpenNewEntry,
  onOpenPosterModal,
  features
}) => {

  // Group visited countries by continent
  const continentBreakdown = useMemo(() => {
    const totalByContinent: Record<string, number> = {};
    const visitedByContinent: Record<string, number> = {};

    CONTINENTS.forEach(c => {
      totalByContinent[c] = 0;
      visitedByContinent[c] = 0;
    });

    COUNTRIES_DATA.forEach(c => {
      if (totalByContinent[c.continent] !== undefined) {
        totalByContinent[c.continent] += 1;
      }
      if (stats.visitedCountryCodes.has(c.code.toUpperCase())) {
        visitedByContinent[c.continent] = (visitedByContinent[c.continent] || 0) + 1;
      }
    });

    return CONTINENTS.map(continent => {
      const visited = visitedByContinent[continent] || 0;
      const total = totalByContinent[continent] || 1;
      const pct = Math.round((visited / total) * 100);
      return {
        continent,
        visited,
        total,
        percentage: pct
      };
    });
  }, [stats.visitedCountryCodes]);

  // Visited country cards / passport stamps
  const visitedCountryList = useMemo(() => {
    return COUNTRIES_DATA.filter(c => stats.visitedCountryCodes.has(c.code.toUpperCase()))
      .map(c => {
        const countryMemories = memories.filter(m => m.countryCode.toUpperCase() === c.code.toUpperCase());
        const latestMemory = countryMemories[0];
        return {
          country: c,
          memories: countryMemories,
          latestDate: latestMemory?.startDate || 'Visited',
          cities: Array.from(new Set(countryMemories.map(m => m.city).filter(Boolean))),
          photosCount: countryMemories.reduce((acc, m) => acc + (m.photos?.length || 0), 0)
        };
      });
  }, [memories, stats.visitedCountryCodes]);

  // Tag frequency analysis
  const topTags = useMemo(() => {
    const tagCount: Record<string, number> = {};
    memories.forEach(m => {
      m.tags?.forEach(t => {
        tagCount[t] = (tagCount[t] || 0) + 1;
      });
    });
    return Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, [memories]);

  // Traveler Rank / Explorer Level
  const explorerRank = useMemo(() => {
    const count = stats.totalVisitedCountries;
    if (count >= 50) return { title: 'Global Nomad Explorer', desc: 'True Citizen of the World', badge: 'Tier V Master' };
    if (count >= 25) return { title: 'Master Voyager', desc: 'Wide continental horizons', badge: 'Tier IV' };
    if (count >= 10) return { title: 'Seasoned Traveler', desc: 'Frequent globetrotter', badge: 'Tier III' };
    if (count >= 5) return { title: 'Avid Adventurer', desc: 'Stepping into diverse cultures', badge: 'Tier II' };
    if (count >= 1) return { title: 'Curious Explorer', desc: 'Beginning the lifelong journey', badge: 'Tier I' };
    return { title: 'Aspiring Traveler', desc: 'World awaits exploration', badge: 'Tier 0' };
  }, [stats.totalVisitedCountries]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-h-full">
      
      {/* Header & Explorer Passport Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Traveler Sleek Profile Card (Dark Accent Archetype) */}
        <div className="bg-[#1e293b] text-white rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-lg relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-36 h-36 rounded-full bg-[#2563eb]/20 pointer-events-none blur-xl" />
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-widest text-blue-400 uppercase bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
                OFFICIAL PASSPORT
              </span>
              <ShieldCheck className="w-5 h-5 text-blue-400" />
            </div>

            <div>
              <p className="text-xs text-slate-400">Explorer Identity</p>
              <h2 className="text-2xl font-bold tracking-tight text-white mt-0.5">
                {explorerRank.title}
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                {explorerRank.desc}
              </p>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>World Territory Explored</span>
              <span className="font-bold text-blue-400 font-mono text-sm">{stats.percentageOfWorld}%</span>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-1000"
                style={{ width: `${Math.max(stats.percentageOfWorld, 2)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>{stats.totalVisitedCountries} / 195 Sovereign Countries</span>
              <span className="text-slate-500 font-mono">{explorerRank.badge}</span>
            </div>
          </div>
        </div>

        {/* Right: Key Metric Dashboard Cards (2 columns) */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
          
          {/* Card 1: Visited Countries */}
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#64748b]">Visited Countries</span>
              <div className="w-8 h-8 rounded-xl bg-[#e0f2fe] text-[#2563eb] flex items-center justify-center">
                <Globe className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-[#1a1a1a] tracking-tight">
                {stats.totalVisitedCountries}
              </p>
              <p className="text-[11px] text-[#64748b] mt-1">
                out of 195 world states
              </p>
            </div>
          </div>

          {/* Card 2: Travel Memoirs */}
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#64748b]">Travel Memoirs</span>
              <div className="w-8 h-8 rounded-xl bg-[#f1f5f9] text-[#1e293b] flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-[#1a1a1a] tracking-tight">
                {stats.totalMemoriesCount}
              </p>
              <p className="text-[11px] text-[#64748b] mt-1">
                journal entries recorded
              </p>
            </div>
          </div>

          {/* Card 3: Photos In Gallery */}
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#64748b]">Travel Photos</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#2563eb] flex items-center justify-center">
                <ImageIcon className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-[#1a1a1a] tracking-tight">
                {stats.totalPhotosCount}
              </p>
              <p className="text-[11px] text-[#64748b] mt-1">
                high-res photos saved
              </p>
            </div>
          </div>

          {/* Card 4: Starred Favorites */}
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#64748b]">Starred Favorites</span>
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
                <Heart className="w-4 h-4 fill-rose-500" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-[#1a1a1a] tracking-tight">
                {stats.totalFavoritesCount}
              </p>
              <p className="text-[11px] text-[#64748b] mt-1">
                treasured highlights
              </p>
            </div>
          </div>

          {/* Card 5: Continents Touched */}
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#64748b]">Continents</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Compass className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-[#1a1a1a] tracking-tight">
                {continentBreakdown.filter(c => c.visited > 0).length} / 6
              </p>
              <p className="text-[11px] text-[#64748b] mt-1">
                continents stepped on
              </p>
            </div>
          </div>

          {/* Card 6: Average Rating */}
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#64748b]">Average Rating</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                <Star className="w-4 h-4 fill-amber-400" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-[#1a1a1a] tracking-tight">
                {memories.length > 0 
                  ? (memories.reduce((acc, m) => acc + (m.rating || 5), 0) / memories.length).toFixed(1)
                  : '5.0'} ★
              </p>
              <p className="text-[11px] text-[#64748b] mt-1">
                trip satisfaction score
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* Travel Expenses & Budget Tracker Dashboard */}
      {features?.budgetExpenses !== false && (
        <div className="bg-white border border-[#e2e8f0] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
                <h3 className="text-xl font-bold tracking-tight text-[#1a1a1a]">
                  Travel Expenses & Budget Tracker
                </h3>
              </div>
              <p className="text-xs text-[#64748b] mt-1">
                Financial breakdown across flights, lodging, dining, activities, and local transit
              </p>
            </div>

            {onOpenPosterModal && features?.posterGenerator !== false && (
              <button
                onClick={onOpenPosterModal}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 border border-amber-500/30 text-xs font-bold transition-all cursor-pointer self-start sm:self-center"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Generate Souvenir Poster</span>
              </button>
            )}
          </div>

          {/* Expense Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100">
              <span className="text-xs font-semibold text-emerald-700">Total Spent</span>
              <p className="text-2xl font-bold text-emerald-900 mt-1">
                ${stats.totalSpendingUSD.toLocaleString()} <span className="text-xs font-normal text-emerald-600">USD</span>
              </p>
              <p className="text-[11px] text-emerald-600 mt-0.5">{stats.totalDaysTraveled} total travel days</p>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100">
              <span className="text-xs font-semibold text-blue-700">Average Cost / Trip</span>
              <p className="text-2xl font-bold text-blue-900 mt-1">
                ${stats.averageCostPerTrip.toLocaleString()} <span className="text-xs font-normal text-blue-600">USD</span>
              </p>
              <p className="text-[11px] text-blue-600 mt-0.5">Across {stats.totalMemoriesCount} recorded journeys</p>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100">
              <span className="text-xs font-semibold text-indigo-700">Daily Burn Rate</span>
              <p className="text-2xl font-bold text-indigo-900 mt-1">
                ${stats.averageDailyCostUSD.toLocaleString()} <span className="text-xs font-normal text-indigo-600">USD/day</span>
              </p>
              <p className="text-[11px] text-indigo-600 mt-0.5">Average daily trip spending</p>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100">
              <span className="text-xs font-semibold text-purple-700">Top Investment Trip</span>
              <p className="text-xl font-bold text-purple-900 mt-1 truncate">
                {stats.mostExpensiveTrip ? stats.mostExpensiveTrip.trip.title : 'N/A'}
              </p>
              <p className="text-[11px] text-purple-600 mt-0.5">
                {stats.mostExpensiveTrip ? `$${stats.mostExpensiveTrip.totalUSD.toLocaleString()} USD` : 'No expenses logged'}
              </p>
            </div>
          </div>

          {/* Category Breakdown Progress Bars */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Spending by Category</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(Object.keys(stats.categorySpending) as ExpenseCategory[]).map(cat => {
                const amount = stats.categorySpending[cat];
                const pct = stats.totalSpendingUSD > 0 ? Math.round((amount / stats.totalSpendingUSD) * 100) : 0;
                return (
                  <div key={cat} className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-700 capitalize">
                        {CATEGORY_ICONS[cat]}
                        <span>{cat}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">${Math.round(amount).toLocaleString()}</span>
                        <span className="text-[10px] font-bold text-slate-500">({pct}%)</span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${CATEGORY_COLORS[cat]} rounded-full transition-all duration-500`}
                        style={{ width: `${Math.max(pct, amount > 0 ? 3 : 0)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Continental Breakdown Progress & Tag Cloud */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Continental Breakdown Progress */}
        <div className="bg-white border border-[#e2e8f0] rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[#1a1a1a] text-lg">
              Continental Coverage
            </h3>
            <span className="text-xs text-[#64748b] font-mono">By Sovereign State</span>
          </div>

          <div className="space-y-4">
            {continentBreakdown.map((item) => (
              <div key={item.continent} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#1e293b]">{item.continent}</span>
                  <span className="text-[#64748b] font-mono">
                    <span className="font-bold text-[#2563eb]">{item.visited}</span> / {item.total} countries ({item.percentage}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-[#f1f5f9] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#2563eb] rounded-full transition-all duration-700"
                    style={{ width: `${Math.max(item.percentage, item.visited > 0 ? 3 : 0)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Travel Themes & Tags */}
        <div className="bg-white border border-[#e2e8f0] rounded-3xl p-6 sm:p-8 shadow-sm space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#1a1a1a] text-lg">
                Travel Themes & Preferences
              </h3>
              <Tag className="w-4 h-4 text-[#2563eb]" />
            </div>

            {topTags.length === 0 ? (
              <p className="text-xs text-[#64748b]">
                Add custom tags when recording your trips (e.g. #Sightseeing, #Culinary, #Nature) to see your travel style.
              </p>
            ) : (
              <div className="space-y-2.5">
                {topTags.map(([tag, count]) => {
                  const pct = Math.round((count / (memories.length || 1)) * 100);
                  return (
                    <div key={tag} className="flex items-center justify-between p-2.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
                      <span className="text-xs font-semibold text-[#2563eb]">#{tag}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#64748b] font-mono">{count} trips</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#e0f2fe] text-[#2563eb] font-bold">
                          {pct}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <button
            onClick={onOpenNewEntry}
            className="w-full py-2.5 bg-[#f8fafc] hover:bg-[#f1f5f9] text-[#2563eb] border border-[#e2e8f0] rounded-xl text-xs font-semibold transition-colors mt-4 cursor-pointer"
          >
            + Record Another Journey
          </button>
        </div>

      </div>

      {/* Visited Country Passport Visa Stamps */}
      <div className="bg-white border border-[#e2e8f0] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-[#1a1a1a]">
              Passport Stamps & Travel History
            </h3>
            <p className="text-xs text-[#64748b] mt-0.5">
              Every country you have explored in your personal memory map
            </p>
          </div>

          <span className="text-xs px-3 py-1 bg-[#f1f5f9] text-[#2563eb] rounded-full font-semibold border border-[#e2e8f0] self-start sm:self-center">
            {visitedCountryList.length} Countries Recorded
          </span>
        </div>

        {visitedCountryList.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-[#cbd5e1] rounded-2xl p-6">
            <p className="text-xs text-[#64748b]">No passport stamps collected yet. Mark countries on the world map!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {visitedCountryList.map(({ country, memories: cMems, latestDate, cities, photosCount }) => (
              <div
                key={country.code}
                onClick={() => onSelectCountry(country, cMems)}
                className="group relative bg-[#f8fafc] hover:bg-white border border-[#e2e8f0] hover:border-[#2563eb]/40 rounded-2xl p-4 shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
                {/* Stamp Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{country.flag}</span>
                    <div>
                      <h4 className="font-bold text-sm text-[#1e293b] group-hover:text-[#2563eb] transition-colors">
                        {country.name}
                      </h4>
                      <p className="text-[10px] text-[#64748b]">{country.capital} • {country.continent}</p>
                    </div>
                  </div>
                </div>

                {/* Cities visited */}
                {cities.length > 0 && (
                  <div className="my-3 text-xs text-[#334155]">
                    <p className="text-[10px] text-[#94a3b8] font-bold uppercase tracking-wider">Destinations:</p>
                    <p className="font-medium truncate text-xs">{cities.join(', ')}</p>
                  </div>
                )}

                {/* Stamp Footer */}
                <div className="pt-2 border-t border-[#e2e8f0] flex items-center justify-between text-[10px] text-[#64748b] font-mono">
                  <span>{latestDate}</span>
                  <span className="text-[#2563eb] font-sans font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                    {cMems.length} {cMems.length === 1 ? 'trip' : 'trips'} →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
};
