import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  AppView, 
  TravelMemory, 
  CountryInfo, 
  FilterState, 
  PhotoItem,
  MapTheme,
  UserProfile,
  WishlistItem,
  CityPin,
  OptionalFeatures
} from './types';
import { 
  loadMemories, 
  saveMemories, 
  calculateStats, 
  loadHomeCountryCode,
  saveHomeCountryCode,
  loadMapTheme,
  saveMapTheme,
  loadWishlist,
  saveWishlist,
  loadCityPins,
  saveCityPins,
  loadOptionalFeatures,
  saveOptionalFeatures,
  exportMemoriesJSON, 
  importMemoriesJSON, 
  resetToDemoMemories, 
  clearAllMemories 
} from './utils/storage';
import { 
  getCurrentUser, 
  setCurrentUser as setAuthCurrentUser 
} from './utils/auth';
import { COUNTRIES_DATA, findCountry } from './data/countries';
import { Navbar } from './components/Navbar';
import { MapView } from './components/MapView';
import { DiaryView } from './components/DiaryView';
import { GalleryView } from './components/GalleryView';
import { StatsView } from './components/StatsView';
import { WishlistView } from './components/WishlistView';
import { CountryDrawer } from './components/CountryDrawer';
import { EntryModal } from './components/EntryModal';
import { PhotoLightbox } from './components/PhotoLightbox';
import { AuthModal } from './components/AuthModal';
import { TravelPosterModal } from './components/TravelPosterModal';
import { CityPinModal } from './components/CityPinModal';
import { CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export function App() {
  const [currentUser, setCurrentUserState] = useState<UserProfile>(() => getCurrentUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Core Data States
  const [memories, setMemories] = useState<TravelMemory[]>(() => loadMemories(currentUser.id));
  const [wishlist, setWishlist] = useState<WishlistItem[]>(() => loadWishlist(currentUser.id));
  const [cityPins, setCityPins] = useState<CityPin[]>(() => loadCityPins(currentUser.id));
  const [homeCountryCode, setHomeCountryCodeState] = useState<string>(() => loadHomeCountryCode(currentUser.id));
  const [mapTheme, setMapThemeState] = useState<MapTheme>(() => loadMapTheme());
  const [activeView, setActiveView] = useState<AppView>('map');
  const [features, setFeatures] = useState<OptionalFeatures>(() => loadOptionalFeatures());

  const handleToggleFeature = useCallback((key: keyof OptionalFeatures) => {
    setFeatures(prev => {
      const next = { ...prev, [key]: !prev[key] };
      saveOptionalFeatures(next);
      if (key === 'bucketList' && !next.bucketList) {
        setActiveView(current => current === 'wishlist' ? 'map' : current);
      }
      return next;
    });
  }, []);

  // Modals
  const [isPosterModalOpen, setIsPosterModalOpen] = useState(false);
  const [isCityPinModalOpen, setIsCityPinModalOpen] = useState(false);
  const [editingPin, setEditingPin] = useState<CityPin | null>(null);

  const handleUserChange = useCallback((newUser: UserProfile, message?: string) => {
    setCurrentUserState(newUser);
    const userMems = loadMemories(newUser.id);
    const userWish = loadWishlist(newUser.id);
    const userPins = loadCityPins(newUser.id);
    const userHome = loadHomeCountryCode(newUser.id);
    setMemories(userMems);
    setWishlist(userWish);
    setCityPins(userPins);
    setHomeCountryCodeState(userHome);
    if (message) {
      showToast(message, 'success');
    }
  }, []);
  
  const handleSetHomeCountry = useCallback((code: string | null) => {
    saveHomeCountryCode(code, currentUser.id);
    setHomeCountryCodeState(code || '');
    if (code) {
      const country = findCountry(code);
      showToast(`Home country set to ${country?.flag || ''} ${country?.name || code}`, 'success');
    }
  }, [currentUser.id]);

  const handleToggleMapTheme = useCallback(() => {
    setMapThemeState(prev => {
      const next: MapTheme = prev === 'dark' ? 'light' : 'dark';
      saveMapTheme(next);
      return next;
    });
  }, []);
  
  // Filter state
  const [filter, setFilter] = useState<FilterState>({
    search: '',
    continent: 'ALL',
    tag: 'ALL',
    countryCode: 'ALL',
    sortBy: 'date-desc',
    favoriteOnly: false
  });

  // Modal and Drawer states
  const [selectedDrawerCountry, setSelectedDrawerCountry] = useState<CountryInfo | null>(null);
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [editingMemory, setEditingMemory] = useState<TravelMemory | null>(null);
  const [modalInitialCountry, setModalInitialCountry] = useState<CountryInfo | null>(null);

  // Lightbox state
  const [lightboxPhoto, setLightboxPhoto] = useState<PhotoItem | null>(null);
  const [lightboxAllPhotos, setLightboxAllPhotos] = useState<PhotoItem[]>([]);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  const showToast = useCallback((text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  }, []);

  // Save states to localStorage whenever data changes
  useEffect(() => {
    saveMemories(memories, currentUser.id);
  }, [memories, currentUser.id]);

  useEffect(() => {
    saveWishlist(wishlist, currentUser.id);
  }, [wishlist, currentUser.id]);

  useEffect(() => {
    saveCityPins(cityPins, currentUser.id);
  }, [cityPins, currentUser.id]);

  // Global Escape key handler to unselect everything & close any open dialogs/drawers/lightboxes
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isAuthModalOpen) setIsAuthModalOpen(false);
        if (isPosterModalOpen) setIsPosterModalOpen(false);
        if (isCityPinModalOpen) setIsCityPinModalOpen(false);
        if (isEntryModalOpen) {
          setIsEntryModalOpen(false);
          setEditingMemory(null);
          setModalInitialCountry(null);
        }
        if (selectedDrawerCountry) setSelectedDrawerCountry(null);
        if (lightboxPhoto) setLightboxPhoto(null);
        if (filter.search) setFilter(prev => ({ ...prev, search: '' }));
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isAuthModalOpen, isPosterModalOpen, isCityPinModalOpen, isEntryModalOpen, selectedDrawerCountry, lightboxPhoto, filter.search]);

  // Derived statistics
  const stats = calculateStats(memories);

  // Drawer memories
  const drawerMemories = selectedDrawerCountry
    ? memories.filter(m => m.countryCode.toUpperCase() === selectedDrawerCountry.code.toUpperCase())
    : [];

  // Handlers for Map interactions
  const handleSelectCountry = (country: CountryInfo, existingMemories: TravelMemory[]) => {
    setSelectedDrawerCountry(country);
  };

  const handleQuickMarkVisited = (country: CountryInfo) => {
    const today = new Date().toISOString().split('T')[0];
    const newMem: TravelMemory = {
      id: `mem-${Date.now()}`,
      countryCode: country.code.toUpperCase(),
      countryName: country.name,
      countryFlag: country.flag,
      continent: country.continent,
      city: country.capital || country.name,
      startDate: today,
      title: `Visit to ${country.name}`,
      notes: `Explored the vibrant culture, sights, and atmosphere of ${country.name}.`,
      rating: 5,
      weather: 'sunny',
      tags: ['Sightseeing'],
      photos: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setMemories(prev => [newMem, ...prev]);
    showToast(`Marked ${country.flag} ${country.name} as visited!`);
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.7 },
      colors: ['#2563eb', '#3b82f6', '#60a5fa']
    });
  };

  const handleOpenNewEntryWithCountry = (country: CountryInfo) => {
    setEditingMemory(null);
    setModalInitialCountry(country);
    setIsEntryModalOpen(true);
  };

  const handleOpenNewEntry = () => {
    setEditingMemory(null);
    setModalInitialCountry(null);
    setIsEntryModalOpen(true);
  };

  const handleEditMemory = (memory: TravelMemory) => {
    setEditingMemory(memory);
    setModalInitialCountry(null);
    setIsEntryModalOpen(true);
  };

  const handleSaveMemory = (memoryData: Partial<TravelMemory>) => {
    if (editingMemory) {
      // Update existing
      setMemories(prev => prev.map(m => {
        if (m.id === editingMemory.id) {
          return {
            ...m,
            ...memoryData,
            updatedAt: Date.now()
          } as TravelMemory;
        }
        return m;
      }));
      showToast(`Updated memoir: "${memoryData.title}"`);
    } else {
      // Create new
      const newMemory: TravelMemory = {
        id: `memory-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        countryCode: (memoryData.countryCode || 'FR').toUpperCase(),
        countryName: memoryData.countryName || 'Unknown',
        countryFlag: memoryData.countryFlag || '🌍',
        continent: memoryData.continent || 'Europe',
        city: memoryData.city || '',
        startDate: memoryData.startDate || new Date().toISOString().split('T')[0],
        endDate: memoryData.endDate,
        title: memoryData.title || 'Travel Memoir',
        notes: memoryData.notes || '',
        highlight: memoryData.highlight,
        rating: memoryData.rating || 5,
        weather: memoryData.weather || 'sunny',
        companions: memoryData.companions,
        isFavorite: memoryData.isFavorite,
        tags: memoryData.tags || [],
        photos: memoryData.photos || [],
        expenses: memoryData.expenses || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setMemories(prev => [newMemory, ...prev]);
      showToast(`Saved new journey: "${newMemory.title}"`);
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd']
      });
    }

    setIsEntryModalOpen(false);
    setEditingMemory(null);
    setModalInitialCountry(null);
  };

  const handleDeleteMemory = (memoryId: string) => {
    const memoryToDelete = memories.find(m => m.id === memoryId);
    if (!memoryToDelete) return;

    if (window.confirm(`Are you sure you want to remove the journey "${memoryToDelete.title}"?`)) {
      setMemories(prev => prev.filter(m => m.id !== memoryId));
      showToast(`Removed "${memoryToDelete.title}"`, 'info');
    }
  };

  const handleToggleFavorite = (memoryId: string) => {
    setMemories(prev => prev.map(m => {
      if (m.id === memoryId) {
        const nextFav = !m.isFavorite;
        showToast(nextFav ? `Starred as favorite: "${m.title}"` : `Removed favorite`);
        return {
          ...m,
          isFavorite: nextFav,
          updatedAt: Date.now()
        };
      }
      return m;
    }));
  };

  // Wishlist Actions
  const handleAddWishlist = (item: Omit<WishlistItem, 'id' | 'createdAt'>) => {
    const newItem: WishlistItem = {
      ...item,
      id: `wish-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      createdAt: new Date().toISOString()
    };
    setWishlist(prev => [newItem, ...prev]);
    showToast(`Added ${newItem.countryFlag} ${newItem.countryName} to Bucket List!`);
  };

  const handleToggleWishlistVisited = (id: string) => {
    setWishlist(prev => prev.map(item => {
      if (item.id === id) {
        const next = !item.visited;
        return { ...item, visited: next };
      }
      return item;
    }));
  };

  const handleDeleteWishlist = (id: string) => {
    setWishlist(prev => prev.filter(item => item.id !== id));
    showToast('Removed from bucket list', 'info');
  };

  const handleConvertWishlistToMemory = (item: WishlistItem) => {
    const country = findCountry(item.countryCode);
    if (country) {
      setModalInitialCountry(country);
      setEditingMemory({
        id: `memory-${Date.now()}`,
        countryCode: item.countryCode.toUpperCase(),
        countryName: item.countryName,
        countryFlag: item.countryFlag,
        continent: item.continent,
        city: country.capital || item.countryName,
        startDate: item.targetYear ? `${item.targetYear}-06-15` : new Date().toISOString().split('T')[0],
        title: `Adventure in ${item.countryName}`,
        notes: item.notes || `Fulfilled bucket list dream: trip to ${item.countryName}!`,
        rating: 5,
        weather: 'sunny',
        tags: ['Bucket List Achieved'],
        photos: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      setIsEntryModalOpen(true);
      // Mark wishlist as visited
      handleToggleWishlistVisited(item.id);
    }
  };

  // City Pins Actions
  const handleSavePin = (pin: CityPin) => {
    setCityPins(prev => {
      const exists = prev.some(p => p.id === pin.id);
      if (exists) {
        return prev.map(p => p.id === pin.id ? pin : p);
      }
      return [pin, ...prev];
    });
    showToast(`📍 Pinned "${pin.name}" to atlas!`);
    confetti({
      particleCount: 35,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  const handleDeletePin = (id: string) => {
    setCityPins(prev => prev.filter(p => p.id !== id));
    showToast('Removed pinned location', 'info');
  };

  // Lightbox handlers
  const handleOpenPhotoLightbox = (photo: PhotoItem, allPhotos: PhotoItem[]) => {
    setLightboxPhoto(photo);
    setLightboxAllPhotos(allPhotos);
  };

  // Backup and storage actions
  const handleExport = () => {
    exportMemoriesJSON();
    showToast('Exported travel history backup file!');
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const imported = await importMemoriesJSON(file);
    if (imported) {
      setMemories(imported.memories);
      if (imported.wishlist) setWishlist(imported.wishlist);
      if (imported.cityPins) setCityPins(imported.cityPins);
      showToast(`Successfully imported travel records!`);
    } else {
      alert('Could not read JSON file. Please verify formatting.');
    }
    e.target.value = '';
  };

  const handleResetDemo = () => {
    if (window.confirm('Reset all memoirs to the sample curated demo travel history?')) {
      const demo = resetToDemoMemories();
      setMemories(demo);
      setWishlist(loadWishlist(currentUser.id));
      setCityPins(loadCityPins(currentUser.id));
      showToast('Reloaded sample journey memoirs!');
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to wipe all travel records? This action cannot be undone.')) {
      clearAllMemories();
      setMemories([]);
      setWishlist([]);
      setCityPins([]);
      showToast('Cleared all travel history.', 'info');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#1a1a1a] flex flex-col font-sans">
      
      {/* Navigation Header */}
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        filter={filter}
        setFilter={setFilter}
        stats={stats}
        currentUser={currentUser}
        wishlistCount={wishlist.filter(w => !w.visited).length}
        features={features}
        onToggleFeature={handleToggleFeature}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenNewEntry={handleOpenNewEntry}
        onOpenPosterModal={() => setIsPosterModalOpen(true)}
        onOpenPinModal={() => {
          setEditingPin(null);
          setIsCityPinModalOpen(true);
        }}
        onExport={handleExport}
        onImport={handleImport}
        onResetDemo={handleResetDemo}
        onClearAll={handleClearAll}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {activeView === 'map' && (
          <MapView
            memories={memories}
            stats={stats}
            homeCountryCode={homeCountryCode}
            onSetHomeCountry={handleSetHomeCountry}
            mapTheme={mapTheme}
            onToggleMapTheme={handleToggleMapTheme}
            onSelectCountry={handleSelectCountry}
            onQuickMarkVisited={handleQuickMarkVisited}
            onOpenNewEntryWithCountry={handleOpenNewEntryWithCountry}
            onOpenMemory={(mem) => {
              const country = findCountry(mem.countryCode);
              if (country) setSelectedDrawerCountry(country);
            }}
            wishlist={wishlist}
            cityPins={cityPins}
            onOpenCityPin={(pin) => {
              setEditingPin(pin);
              setIsCityPinModalOpen(true);
            }}
            features={features}
          />
        )}

        {activeView === 'diary' && (
          <DiaryView
            memories={memories}
            filter={filter}
            setFilter={setFilter}
            onOpenNewEntry={handleOpenNewEntry}
            onEditMemory={handleEditMemory}
            onDeleteMemory={handleDeleteMemory}
            onToggleFavorite={handleToggleFavorite}
            onOpenPhotoLightbox={handleOpenPhotoLightbox}
          />
        )}

        {activeView === 'wishlist' && features.bucketList && (
          <WishlistView
            wishlist={wishlist}
            onAddWishlistItem={handleAddWishlist}
            onRemoveWishlistItem={handleDeleteWishlist}
            onConvertWishlistToMemory={handleConvertWishlistToMemory}
            onSelectCountryForMap={(country) => {
              setSelectedDrawerCountry(country);
              setActiveView('map');
            }}
          />
        )}

        {activeView === 'gallery' && (
          <GalleryView
            memories={memories}
            filter={filter}
            setFilter={setFilter}
            onOpenPhotoLightbox={handleOpenPhotoLightbox}
            onOpenNewEntry={handleOpenNewEntry}
            onSelectCountryFromGallery={(code) => {
              const country = findCountry(code);
              if (country) {
                setSelectedDrawerCountry(country);
                setActiveView('map');
              }
            }}
          />
        )}

        {activeView === 'stats' && (
          <StatsView
            memories={memories}
            stats={stats}
            onSelectCountry={handleSelectCountry}
            onOpenNewEntry={handleOpenNewEntry}
            onOpenPosterModal={() => setIsPosterModalOpen(true)}
            features={features}
          />
        )}
      </main>

      {/* Slide-over Country Memory Drawer */}
      <CountryDrawer
        country={selectedDrawerCountry}
        memories={drawerMemories}
        homeCountryCode={homeCountryCode}
        onSetHomeCountry={handleSetHomeCountry}
        onClose={() => setSelectedDrawerCountry(null)}
        onAddNewTrip={(country) => {
          setSelectedDrawerCountry(null);
          handleOpenNewEntryWithCountry(country);
        }}
        onEditMemory={(mem) => {
          setSelectedDrawerCountry(null);
          handleEditMemory(mem);
        }}
        onDeleteMemory={handleDeleteMemory}
        onOpenPhotoLightbox={handleOpenPhotoLightbox}
        onToggleFavorite={handleToggleFavorite}
      />

      {/* Entry Modal for Creating / Editing Trips with AI Story Polisher & Budget Tracker */}
      <EntryModal
        isOpen={isEntryModalOpen}
        onClose={() => {
          setIsEntryModalOpen(false);
          setEditingMemory(null);
          setModalInitialCountry(null);
        }}
        onSave={handleSaveMemory}
        initialMemory={editingMemory}
        initialCountry={modalInitialCountry}
        features={features}
      />

      {/* Multi-City & Landmark Pinning Modal */}
      <CityPinModal
        isOpen={isCityPinModalOpen}
        onClose={() => {
          setIsCityPinModalOpen(false);
          setEditingPin(null);
        }}
        onSavePin={handleSavePin}
        onDeletePin={handleDeletePin}
        initialPin={editingPin}
      />

      {/* Exportable Travel Souvenir Poster Generator Modal */}
      <TravelPosterModal
        isOpen={isPosterModalOpen}
        onClose={() => setIsPosterModalOpen(false)}
        memories={memories}
        stats={stats}
        homeCountryCode={homeCountryCode}
        features={features}
      />

      {/* Traveler Login & Profile Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onUserChange={handleUserChange}
      />

      {/* High-Resolution Photo Lightbox */}
      <PhotoLightbox
        photo={lightboxPhoto}
        allPhotos={lightboxAllPhotos}
        onClose={() => setLightboxPhoto(null)}
        onNavigate={(p) => setLightboxPhoto(p)}
      />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="bg-[#1e293b] text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700/60 flex items-center gap-2.5 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
