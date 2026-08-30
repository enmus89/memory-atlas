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
  AtlasSnapshot,
  loadMemories,
  upsertMemory,
  deleteMemory,
  calculateStats,
  loadMapTheme,
  saveMapTheme,
  loadWishlist,
  upsertWishlistItem,
  deleteWishlistItem,
  loadCityPins,
  upsertCityPin,
  deleteCityPin,
  loadOptionalFeatures,
  saveOptionalFeatures,
  exportMemoriesJSON,
  importMemoriesJSON,
  resetToDemoMemories,
  clearAllMemories
} from './utils/storage';
import {
  fetchProfile,
  getCurrentUser,
  onAuthStateChange,
  saveUserHomeCountry,
  signOut
} from './utils/auth';
import { isSupabaseConfigured } from './lib/supabase';
import { findCountry } from './data/countries';
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
import { InstallHint } from './components/InstallHint';
import { CheckCircle2, AlertCircle, Compass, Loader2 } from 'lucide-react';

type ToastType = 'success' | 'info' | 'error';

/**
 * Session gate.
 *
 * Nothing renders until we know whether somebody is signed in, so the atlas
 * below can treat `user` as guaranteed and never has to guard against a null
 * account while loading data.
 */
export function App() {
  const [status, setStatus] = useState<'loading' | 'signedOut' | 'signedIn'>('loading');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [fatalError, setFatalError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setFatalError(
        'This app is not connected to a database yet. Set VITE_SUPABASE_URL and ' +
          'VITE_SUPABASE_PUBLISHABLE_KEY, then reload — see README.md for the setup steps.'
      );
      setStatus('signedOut');
      return;
    }

    let cancelled = false;

    getCurrentUser()
      .then((user) => {
        if (cancelled) return;
        setCurrentUser(user);
        setStatus(user ? 'signedIn' : 'signedOut');
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setFatalError(err instanceof Error ? err.message : 'Could not reach the server.');
        setStatus('signedOut');
      });

    // Keeps the app honest when the session ends in another tab, and picks up
    // a password-reset redirect landing back on the page.
    const unsubscribe = onAuthStateChange(async (authUser) => {
      if (cancelled) return;
      if (!authUser) {
        setCurrentUser(null);
        setStatus('signedOut');
        return;
      }
      try {
        const profile = await fetchProfile(authUser);
        if (cancelled) return;
        setCurrentUser(profile);
        setStatus('signedIn');
      } catch (err) {
        if (cancelled) return;
        setFatalError(err instanceof Error ? err.message : 'Could not load your profile.');
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const handleSignOut = useCallback(async () => {
    await signOut();
    setCurrentUser(null);
    setStatus('signedOut');
  }, []);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Compass className="w-8 h-8 text-blue-600 animate-pulse" />
          <span className="text-sm font-medium">Loading your atlas…</span>
        </div>
      </div>
    );
  }

  if (status === 'signedOut' || !currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#eff6ff] via-[#f8f9fa] to-[#f1f5f9] flex items-center justify-center p-4">
        {fatalError && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 max-w-lg">
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-2xl shadow-sm flex items-start gap-2.5 text-xs font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{fatalError}</span>
            </div>
          </div>
        )}
        <AuthModal
          isOpen
          dismissable={false}
          onClose={() => undefined}
          currentUser={null}
          onAuthenticated={(user) => {
            setCurrentUser(user);
            setStatus('signedIn');
          }}
          onSignOut={handleSignOut}
        />
        <InstallHint />
      </div>
    );
  }

  // Remounting on account change guarantees no data from the previous user
  // survives into the next session.
  return (
    <>
      <Atlas key={currentUser.id} user={currentUser} onUserUpdated={setCurrentUser} onSignOut={handleSignOut} />
      <InstallHint />
    </>
  );
}

interface AtlasProps {
  user: UserProfile;
  onUserUpdated: (user: UserProfile) => void;
  onSignOut: () => void;
}

function Atlas({ user, onUserUpdated, onSignOut }: AtlasProps) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Core data, loaded from Supabase on mount.
  const [memories, setMemories] = useState<TravelMemory[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [cityPins, setCityPins] = useState<CityPin[]>([]);
  const [homeCountryCode, setHomeCountryCodeState] = useState<string>(user.homeCountryCode);
  const [dataStatus, setDataStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [loadError, setLoadError] = useState<string | null>(null);

  const [mapTheme, setMapThemeState] = useState<MapTheme>(() => loadMapTheme());
  const [activeView, setActiveView] = useState<AppView>('map');
  const [features, setFeatures] = useState<OptionalFeatures>(() => loadOptionalFeatures());

  // Toast notification
  const [toastMessage, setToastMessage] = useState<{ text: string; type: ToastType } | null>(null);

  const showToast = useCallback((text: string, type: ToastType = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), type === 'error' ? 5200 : 3200);
  }, []);

  /**
   * Apply a change locally straight away, then write it to the database. If
   * the write fails the local change is undone, so what is on screen always
   * matches what is actually stored.
   */
  const persist = useCallback(
    async (write: () => Promise<void>, rollback: () => void) => {
      try {
        await write();
      } catch (err) {
        rollback();
        showToast(err instanceof Error ? err.message : 'Could not save your change.', 'error');
      }
    },
    [showToast]
  );

  const loadAll = useCallback(async () => {
    setDataStatus('loading');
    setLoadError(null);
    try {
      const [loadedMemories, loadedWishlist, loadedPins] = await Promise.all([
        loadMemories(user.id),
        loadWishlist(user.id),
        loadCityPins(user.id)
      ]);
      setMemories(loadedMemories);
      setWishlist(loadedWishlist);
      setCityPins(loadedPins);
      setDataStatus('ready');
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Could not load your travel data.');
      setDataStatus('error');
    }
  }, [user.id]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    setHomeCountryCodeState(user.homeCountryCode);
  }, [user.homeCountryCode]);

  const handleToggleFeature = useCallback((key: keyof OptionalFeatures) => {
    setFeatures(prev => {
      const next = { ...prev, [key]: !prev[key] };
      saveOptionalFeatures(next);
      if (key === 'bucketList' && !next.bucketList) {
        setActiveView(current => (current === 'wishlist' ? 'map' : current));
      }
      return next;
    });
  }, []);

  // Modals
  const [isPosterModalOpen, setIsPosterModalOpen] = useState(false);
  const [isCityPinModalOpen, setIsCityPinModalOpen] = useState(false);
  const [editingPin, setEditingPin] = useState<CityPin | null>(null);

  const handleSetHomeCountry = useCallback(
    (code: string | null) => {
      const previous = homeCountryCode;
      const next = code || '';
      setHomeCountryCodeState(next);
      if (code) {
        const country = findCountry(code);
        showToast(`Home country set to ${country?.flag || ''} ${country?.name || code}`);
      }
      persist(
        async () => {
          await saveUserHomeCountry(code);
          onUserUpdated({ ...user, homeCountryCode: (code || 'US').toUpperCase() });
        },
        () => setHomeCountryCodeState(previous)
      );
    },
    [homeCountryCode, persist, showToast, user, onUserUpdated]
  );

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

  // Modal and drawer states
  const [selectedDrawerCountry, setSelectedDrawerCountry] = useState<CountryInfo | null>(null);
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [editingMemory, setEditingMemory] = useState<TravelMemory | null>(null);
  const [modalInitialCountry, setModalInitialCountry] = useState<CountryInfo | null>(null);

  // Lightbox state
  const [lightboxPhoto, setLightboxPhoto] = useState<PhotoItem | null>(null);
  const [lightboxAllPhotos, setLightboxAllPhotos] = useState<PhotoItem[]>([]);

  // Global Escape key handler to unselect everything & close any open dialogs
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

  const drawerMemories = selectedDrawerCountry
    ? memories.filter(m => m.countryCode.toUpperCase() === selectedDrawerCountry.code.toUpperCase())
    : [];

  // Handlers for map interactions
  const handleSelectCountry = (country: CountryInfo, _existingMemories: TravelMemory[]) => {
    setSelectedDrawerCountry(country);
  };

  const handleQuickMarkVisited = (country: CountryInfo) => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();
    const newMem: TravelMemory = {
      id: `mem-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
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
      createdAt: now,
      updatedAt: now
    };

    setMemories(prev => [newMem, ...prev]);
    showToast(`Marked ${country.flag} ${country.name} as visited!`);
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.7 },
      colors: ['#2563eb', '#3b82f6', '#60a5fa']
    });

    persist(
      () => upsertMemory(newMem, user.id),
      () => setMemories(prev => prev.filter(m => m.id !== newMem.id))
    );
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
    const now = new Date().toISOString();

    if (editingMemory) {
      const updated: TravelMemory = {
        ...editingMemory,
        ...memoryData,
        updatedAt: now
      } as TravelMemory;

      const previous = memories;
      // A wishlist item converted to a trip arrives here as an "edit" of a
      // memory that was never stored, so fall back to appending it.
      setMemories(prev =>
        prev.some(m => m.id === updated.id)
          ? prev.map(m => (m.id === updated.id ? updated : m))
          : [updated, ...prev]
      );
      showToast(`Updated memoir: "${updated.title}"`);
      persist(
        () => upsertMemory(updated, user.id),
        () => setMemories(previous)
      );
    } else {
      const newMemory: TravelMemory = {
        id: `memory-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
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
        createdAt: now,
        updatedAt: now
      };

      setMemories(prev => [newMemory, ...prev]);
      showToast(`Saved new journey: "${newMemory.title}"`);
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd']
      });
      persist(
        () => upsertMemory(newMemory, user.id),
        () => setMemories(prev => prev.filter(m => m.id !== newMemory.id))
      );
    }

    setIsEntryModalOpen(false);
    setEditingMemory(null);
    setModalInitialCountry(null);
  };

  const handleDeleteMemory = (memoryId: string) => {
    const memoryToDelete = memories.find(m => m.id === memoryId);
    if (!memoryToDelete) return;

    if (window.confirm(`Are you sure you want to remove the journey "${memoryToDelete.title}"?`)) {
      const previous = memories;
      setMemories(prev => prev.filter(m => m.id !== memoryId));
      showToast(`Removed "${memoryToDelete.title}"`, 'info');
      persist(
        () => deleteMemory(memoryToDelete, user.id),
        () => setMemories(previous)
      );
    }
  };

  const handleToggleFavorite = (memoryId: string) => {
    const target = memories.find(m => m.id === memoryId);
    if (!target) return;

    const updated: TravelMemory = {
      ...target,
      isFavorite: !target.isFavorite,
      updatedAt: new Date().toISOString()
    };

    setMemories(prev => prev.map(m => (m.id === memoryId ? updated : m)));
    showToast(updated.isFavorite ? `Starred as favorite: "${target.title}"` : 'Removed favorite');
    persist(
      () => upsertMemory(updated, user.id),
      () => setMemories(prev => prev.map(m => (m.id === memoryId ? target : m)))
    );
  };

  // Wishlist actions
  const handleAddWishlist = (item: Omit<WishlistItem, 'id' | 'createdAt'>) => {
    const newItem: WishlistItem = {
      ...item,
      id: `wish-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString()
    };
    setWishlist(prev => [newItem, ...prev]);
    showToast(`Added ${newItem.countryFlag} ${newItem.countryName} to Bucket List!`);
    persist(
      () => upsertWishlistItem(newItem, user.id),
      () => setWishlist(prev => prev.filter(w => w.id !== newItem.id))
    );
  };

  const handleToggleWishlistVisited = (id: string) => {
    const target = wishlist.find(w => w.id === id);
    if (!target) return;

    const updated: WishlistItem = { ...target, visited: !target.visited };
    setWishlist(prev => prev.map(w => (w.id === id ? updated : w)));
    persist(
      () => upsertWishlistItem(updated, user.id),
      () => setWishlist(prev => prev.map(w => (w.id === id ? target : w)))
    );
  };

  const handleDeleteWishlist = (id: string) => {
    const previous = wishlist;
    setWishlist(prev => prev.filter(item => item.id !== id));
    showToast('Removed from bucket list', 'info');
    persist(
      () => deleteWishlistItem(id, user.id),
      () => setWishlist(previous)
    );
  };

  const handleConvertWishlistToMemory = (item: WishlistItem) => {
    const country = findCountry(item.countryCode);
    if (!country) return;

    const now = new Date().toISOString();
    setModalInitialCountry(country);
    setEditingMemory({
      id: `memory-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
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
      createdAt: now,
      updatedAt: now
    });
    setIsEntryModalOpen(true);
    handleToggleWishlistVisited(item.id);
  };

  // City pin actions
  const handleSavePin = (pin: CityPin) => {
    const previous = cityPins;
    setCityPins(prev => (prev.some(p => p.id === pin.id) ? prev.map(p => (p.id === pin.id ? pin : p)) : [pin, ...prev]));
    showToast(`📍 Pinned "${pin.name}" to atlas!`);
    confetti({ particleCount: 35, spread: 60, origin: { y: 0.6 } });
    persist(
      () => upsertCityPin(pin, user.id),
      () => setCityPins(previous)
    );
  };

  const handleDeletePin = (id: string) => {
    const previous = cityPins;
    setCityPins(prev => prev.filter(p => p.id !== id));
    showToast('Removed pinned location', 'info');
    persist(
      () => deleteCityPin(id, user.id),
      () => setCityPins(previous)
    );
  };

  // Lightbox handlers
  const handleOpenPhotoLightbox = (photo: PhotoItem, allPhotos: PhotoItem[]) => {
    setLightboxPhoto(photo);
    setLightboxAllPhotos(allPhotos);
  };

  // Backup and storage actions
  const handleExport = () => {
    exportMemoriesJSON({ memories, wishlist, cityPins });
    showToast('Exported travel history backup file!');
  };

  const applySnapshot = (snapshot: AtlasSnapshot) => {
    setMemories(snapshot.memories);
    setWishlist(snapshot.wishlist);
    setCityPins(snapshot.cityPins);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    try {
      const imported = await importMemoriesJSON(file, user.id);
      if (imported) {
        applySnapshot(imported);
        showToast('Successfully imported travel records!');
      } else {
        showToast('Could not read that JSON file. Please check the format.', 'error');
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Import failed.', 'error');
    }
  };

  const handleResetDemo = async () => {
    if (!window.confirm('Replace everything in your account with the sample curated demo travel history?')) return;
    try {
      applySnapshot(await resetToDemoMemories(user.id));
      showToast('Reloaded sample journey memoirs!');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not load the demo data.', 'error');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to wipe all travel records? This action cannot be undone.')) return;
    try {
      await clearAllMemories(user.id);
      setMemories([]);
      setWishlist([]);
      setCityPins([]);
      showToast('Cleared all travel history.', 'info');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not clear your history.', 'error');
    }
  };

  if (dataStatus === 'loading') {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="text-sm font-medium">Loading your travel memories…</span>
        </div>
      </div>
    );
  }

  if (dataStatus === 'error') {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-6">
        <div className="max-w-md text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
          <h1 className="text-lg font-semibold text-[#1e293b]">We could not load your atlas</h1>
          <p className="text-sm text-slate-600">{loadError}</p>
          <button
            onClick={loadAll}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#1a1a1a] flex flex-col font-sans">

      {/* Navigation Header */}
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        filter={filter}
        setFilter={setFilter}
        stats={stats}
        currentUser={user}
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
        userId={user.id}
        onError={(message) => showToast(message, 'error')}
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

      {/* Traveler Profile Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        dismissable
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={user}
        onAuthenticated={() => setIsAuthModalOpen(false)}
        onProfileUpdated={(updated) => {
          onUserUpdated(updated);
          showToast('Profile picture updated!');
        }}
        onSignOut={onSignOut}
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
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200 max-w-sm">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl border flex items-start gap-2.5 text-xs font-medium ${
              toastMessage.type === 'error'
                ? 'bg-red-600 text-white border-red-500'
                : 'bg-[#1e293b] text-white border-slate-700/60'
            }`}
          >
            {toastMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
