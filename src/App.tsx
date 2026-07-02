import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  Clock, 
  AlertTriangle, 
  ShieldAlert, 
  Heart, 
  Coffee, 
  XCircle, 
  CheckCircle2, 
  Flame, 
  ThumbsUp, 
  Calendar, 
  Droplet, 
  Eye, 
  Pill, 
  TrendingDown,
  BookOpen,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  FileText,
  Upload,
  Sparkles,
  RefreshCw,
  FolderOpen,
  PlusCircle,
  HelpCircle,
  FileCheck,
  Lock,
  Unlock,
  CreditCard,
  Palette,
  Search,
  Tag,
  Menu
} from 'lucide-react';

// Color themes mapping
const THEMES: Record<string, { bg: string, border: string, text: string, primary: string, accent: string }> = {
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-500',
    text: 'text-blue-900',
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    accent: 'text-blue-600'
  },
  emerald: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-500',
    text: 'text-emerald-900',
    primary: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    accent: 'text-emerald-600'
  },
  green: {
    bg: 'bg-green-50',
    border: 'border-green-500',
    text: 'text-green-900',
    primary: 'bg-green-600 hover:bg-green-700 text-white',
    accent: 'text-green-600'
  },
  amber: {
    bg: 'bg-amber-50',
    border: 'border-amber-500',
    text: 'text-amber-900',
    primary: 'bg-amber-600 hover:bg-amber-700 text-white',
    accent: 'text-amber-600'
  },
  rose: {
    bg: 'bg-rose-50',
    border: 'border-rose-500',
    text: 'text-rose-900',
    primary: 'bg-rose-600 hover:bg-rose-700 text-white',
    accent: 'text-rose-600'
  },
  indigo: {
    bg: 'bg-indigo-50',
    border: 'border-indigo-500',
    text: 'text-indigo-900',
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    accent: 'text-indigo-600'
  }
};

// Modern style presets for the whole application
const SITE_STYLES: Record<string, {
  name: string;
  themeKey: string;
  containerBg: string;
  sidebarBg: string;
  sidebarTitle: string;
  sidebarText: string;
  mainBg: string;
  cardBg: string;
  cardBorder: string;
  titleColor: string;
  descColor: string;
  labelColor: string;
  itemBg: string;
  accentBtn: string;
  subHeaderBg: string;
  subHeaderBorder: string;
  comfortDark?: boolean;
}> = {
  therapeutic: {
    name: '🌿 Verde Terapêutico',
    themeKey: 'emerald',
    containerBg: 'bg-emerald-50/20',
    sidebarBg: 'bg-white text-slate-800 border-slate-200/80',
    sidebarTitle: 'text-slate-900',
    sidebarText: 'text-slate-500',
    mainBg: 'bg-slate-50/50',
    cardBg: 'bg-white',
    cardBorder: 'border-slate-200/60 shadow-xl',
    titleColor: 'text-slate-950',
    descColor: 'text-slate-500',
    labelColor: 'text-slate-400',
    itemBg: 'bg-slate-50 border-slate-100',
    accentBtn: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    subHeaderBg: 'bg-white/50',
    subHeaderBorder: 'border-slate-200',
    comfortDark: false
  }
};

// Map generated icon string to Lucide component
const getIconComponent = (iconName: string, colorClass: string) => {
  const props = { className: `w-8 h-8 ${colorClass}` };
  switch (iconName) {
    case 'Activity': return <Activity {...props} />;
    case 'Clock': return <Clock {...props} />;
    case 'AlertTriangle': return <AlertTriangle {...props} />;
    case 'ShieldAlert': return <ShieldAlert {...props} />;
    case 'Heart': return <Heart {...props} />;
    case 'Coffee': return <Coffee {...props} />;
    case 'XCircle': return <XCircle {...props} />;
    case 'CheckCircle2': return <CheckCircle2 {...props} />;
    case 'Flame': return <Flame {...props} />;
    case 'ThumbsUp': return <ThumbsUp {...props} />;
    case 'Calendar': return <Calendar {...props} />;
    case 'Droplet': return <Droplet {...props} />;
    case 'Eye': return <Eye {...props} />;
    case 'Pill': return <Pill {...props} />;
    case 'TrendingDown': return <TrendingDown {...props} />;
    case 'Lock': return <Lock {...props} />;
    case 'Unlock': return <Unlock {...props} />;
    case 'BookOpen': return <BookOpen {...props} />;
    default: return <HelpCircle {...props} />;
  }
};

interface EbookSection {
  title: string;
  content: string;
  icon: string;
  type: 'success' | 'warning' | 'info' | 'neutral';
  isPremium?: boolean;
}

interface EbookPage {
  pageNumber: number;
  title: string;
  description: string;
  sections: EbookSection[];
  isInfographic?: boolean;
}

interface Ebook {
  medicineName: string;
  subtitle: string;
  colorTheme: string;
  pages: EbookPage[];
}

const renderSectionContent = (
  content: string,
  styleConfig: any,
  accessibilitySettings: { largeFont: boolean }
) => {
  const lines = content.split('\n').map(line => line.trim()).filter(Boolean);

  // Check if it's a key-value list (like on Page 2: Name, Dosage, etc.)
  const isKeyValue = lines.every(line => {
    const clean = line.replace(/^[•\-\*\s]+/, '');
    const idx = clean.indexOf(':');
    return idx > 0 && idx < 30; // label must be relatively short
  }) && lines.length > 0;

  if (isKeyValue) {
    return (
      <div className="space-y-1.5 mt-2 w-full">
        {lines.map((line, lIdx) => {
          const clean = line.replace(/^[•\-\*\s]+/, '');
          const idx = clean.indexOf(':');
          const label = clean.slice(0, idx).trim();
          const value = clean.slice(idx + 1).trim();
          return (
            <div key={lIdx} className="flex flex-col sm:flex-row sm:items-baseline gap-1 py-1.5 border-b border-emerald-100/30 last:border-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800/90 w-28 shrink-0">{label}</span>
              <span className={`text-slate-700 leading-relaxed font-sans ${accessibilitySettings.largeFont ? 'text-[14px]' : 'text-[12px]'}`}>{value}</span>
            </div>
          );
        })}
      </div>
    );
  }

  // Otherwise, render general bullet list or paragraphs with beautiful styling
  return (
    <div className="space-y-2 mt-2">
      {lines.map((line, lIdx) => {
        const hasBullet = line.startsWith('•') || line.startsWith('-') || line.startsWith('*');
        const cleanLine = line.replace(/^[•\-\*\s]+/, '');
        return (
          <div key={lIdx} className="flex gap-2 items-start">
            {hasBullet && <span className="text-emerald-500 shrink-0 mt-1">•</span>}
            <p className={`${styleConfig.comfortDark ? 'text-slate-350' : 'text-slate-650'} leading-relaxed font-sans ${
              accessibilitySettings.largeFont ? 'text-[14px]' : 'text-[12px]'
            }`}>
              {cleanLine}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default function App() {
  const [presets, setPresets] = useState<any[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<string>('hipertensao_bra');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({
    hipertensao: true,
    diabetes: false,
    colesterol: false
  });

  const normalizeString = (str: string) => {
    return str ? str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : '';
  };

  const getPresetDisplayName = (key: string, isSimple: boolean, defaultName: string) => {
    if (!key) return defaultName;
    const normalizedKey = key.toLowerCase().trim();
    
    // For general categories (folders)
    if (normalizedKey === 'hipertensao') {
      return isSimple ? 'Pressão alta' : 'Hipertensão';
    }
    if (normalizedKey === 'diabetes') {
      return isSimple ? 'Diabetes' : 'Diabetes Mellitus tipo 2';
    }
    if (normalizedKey === 'colesterol') {
      return isSimple ? 'Colesterol alto' : 'Dislipidemia';
    }

    // For specific sub-guides
    if (normalizedKey === 'hipertensao_bra') {
      return isSimple ? 'Sartanas (Losartana...)' : 'Bloqueadores de Angiotensina (BRAs)';
    }
    if (normalizedKey === 'hipertensao_eca') {
      return isSimple ? 'Pris (Captopril, Enalapril...)' : 'Inibidores da ECA';
    }
    if (normalizedKey === 'diabetes_metformina') {
      return isSimple ? 'Metformina (Glifage)' : 'Metformina';
    }
    if (normalizedKey === 'diabetes_sglt2') {
      return isSimple ? 'Remédio da Urina (Gliflozinas)' : 'Inibidores da SGLT2';
    }
    if (normalizedKey === 'colesterol_estatinas') {
      return isSimple ? 'Remédio de Gordura (Estatinas)' : 'Estatinas (Sinvastatina, Atorvastatina)';
    }
    if (normalizedKey === 'colesterol_fibratos') {
      return isSimple ? 'Fibratos (Triglicerídeos)' : 'Fibratos (Fenofibrato)';
    }

    return defaultName;
  };

  const getPresetDisplaySubtitle = (key: string, isSimple: boolean, defaultSubtitle: string) => {
    if (!key) return defaultSubtitle;
    const normalizedKey = key.toLowerCase().trim();
    
    // Categories
    if (normalizedKey === 'hipertensao') {
      return isSimple ? 'Guia simplificado para cuidar da sua pressão' : 'Tratamento de Hipertensão Arterial Sistêmica';
    }
    if (normalizedKey === 'diabetes') {
      return isSimple ? 'Entenda como controlar o açúcar no sangue' : 'Tratamento e Controle do Diabetes Mellitus Tipo 2';
    }
    if (normalizedKey === 'colesterol') {
      return isSimple ? 'Entenda a gordura no sangue de forma simples' : 'Controle de Colesterol e Tratamento da Dislipidemia';
    }

    // Sub-guides
    if (normalizedKey === 'hipertensao_bra') {
      return isSimple ? 'Evita que a mão invisível aperte suas veias' : 'Losartana, Valsartana e Olmesartana';
    }
    if (normalizedKey === 'hipertensao_eca') {
      return isSimple ? 'Relaxa as artérias e pode dar uma tosse seca' : 'Captopril, Enalapril e Ramipril';
    }
    if (normalizedKey === 'diabetes_metformina') {
      return isSimple ? 'Limpa a fechadura das células para o açúcar entrar' : 'Glifage e Glifage XR';
    }
    if (normalizedKey === 'diabetes_sglt2') {
      return isSimple ? 'Elimina o excesso de açúcar do corpo no xixi' : 'Dapagliflozina e Empagliflozina';
    }
    if (normalizedKey === 'colesterol_estatinas') {
      return isSimple ? 'Ajuda o fígado a sugar e limpar a gordura do sangue' : 'Sinvastatina, Atorvastatina e Rosuvastatina';
    }
    if (normalizedKey === 'colesterol_fibratos') {
      return isSimple ? 'Acelera a queima de gordura e evita pancreatite' : 'Genfibrozila e Fenofibrato';
    }

    return defaultSubtitle;
  };
  
  // Custom Leaflet analyzer state
  const [medicineName, setMedicineName] = useState('');
  const [bulaText, setBulaText] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [simulatedFile, setSimulatedFile] = useState<{name: string, size: string} | null>(null);

  // Accessibility Settings
  const [accessibilitySettings, setAccessibilitySettings] = useState({
    simpleLanguage: true,
    colorfulPictograms: true,
    largeFont: false
  });

  // Selected Visual Style / Theme Preset
  const [activeStyle, setActiveStyle] = useState<string>(() => {
    try {
      return localStorage.getItem('active_style') || 'therapeutic';
    } catch (e) {
      return 'therapeutic';
    }
  });

  // Paywall & Premium State
  const [unlockedMedicines, setUnlockedMedicines] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('unlocked_medicines');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [paywallModalMedicine, setPaywallModalMedicine] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Current E-book state
  const [currentEbook, setCurrentEbook] = useState<Ebook | null>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ebookWorkspaceRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to ebook on selection (especially for mobile layouts)
  useEffect(() => {
    if (currentEbook && ebookWorkspaceRef.current) {
      ebookWorkspaceRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentEbook]);

  // Audio / Speech State
  const [isReading, setIsReading] = useState(false);
  const [speechUtterance, setSpeechUtterance] = useState<SpeechSynthesisUtterance | null>(null);

  // Load Presets and set initial ebook
  useEffect(() => {
    fetchPresets();
    loadPresetDetails('hipertensao_bra');
  }, []);

  const fetchPresets = async () => {
    try {
      const res = await fetch('/api/presets');
      if (res.ok) {
        const data = await res.json();
        setPresets(data);
      }
    } catch (e) {
      console.error('Error fetching presets:', e);
    }
  };

  const loadPresetDetails = async (key: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/simplify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medicineName: key })
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentEbook(data);
        setCurrentPageIndex(0);
        stopSpeaking();
      } else {
        throw new Error('Não foi possível carregar as informações do remédio.');
      }
    } catch (err: any) {
      setError(err.message || 'Erro de conexão');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulatePayment = () => {
    if (!paywallModalMedicine) return;
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      setPaymentSuccess(true);
      setTimeout(() => {
        const updated = [...unlockedMedicines, paywallModalMedicine];
        setUnlockedMedicines(updated);
        localStorage.setItem('unlocked_medicines', JSON.stringify(updated));
        setPaywallModalMedicine(null);
        setPaymentSuccess(false);
      }, 1500);
    }, 2000);
  };

  const handleResetPremiumLocks = () => {
    setUnlockedMedicines([]);
    localStorage.removeItem('unlocked_medicines');
  };

  // Run Custom Simplify via Gemini API
  const handleSimplifyCustom = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!medicineName && !bulaText && !simulatedFile) {
      setError('Por favor, informe o nome do remédio ou anexe um texto/arquivo.');
      return;
    }

    setIsLoading(true);
    setError(null);
    stopSpeaking();

    // Setup dummy text if none provided but file exists
    const textToSend = bulaText || (simulatedFile ? `Análise simplificada do documento anexado: ${simulatedFile.name}. Por favor, crie as orientações de saúde para este medicamento.` : '');

    try {
      const res = await fetch('/api/simplify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medicineName: medicineName || simulatedFile?.name.replace(/\.[^/.]+$/, ""),
          text: textToSend,
          accessibilitySettings
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Erro ao simplificar a bula do medicamento.');
      }

      const data = await res.json();
      setCurrentEbook(data);
      setCurrentPageIndex(0);
      setIsCustomMode(false); // Go back to view the simplified guide
      // On mobile, automatically collapse sidebar to show the ebook immediately
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Houve um erro de comunicação com o servidor de Inteligência Artificial.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePresetSelect = (key: string) => {
    setSelectedPreset(key);
    setIsCustomMode(false);
    loadPresetDetails(key);
    // On mobile, automatically collapse sidebar to show the ebook immediately
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  // Text-To-Speech integration
  const speakCurrentPage = () => {
    if (!currentEbook) return;
    
    if (isReading) {
      stopSpeaking();
      return;
    }

    const currentPage = currentEbook.pages[currentPageIndex];
    if (!currentPage) return;

    // Check if page is locked (page 3 and beyond)
    const isPageLocked = currentPage.pageNumber >= 3 && 
      !unlockedMedicines.includes(currentEbook.medicineName + "_full") && 
      !unlockedMedicines.includes("ebook_completo");
    
    if (isPageLocked) {
      setPaywallModalMedicine(currentEbook.medicineName + "_full");
      return;
    }

    // Build speech text
    let textToRead = `Página ${currentPage.pageNumber}. ${currentPage.title}. ${currentPage.description}. `;
    
    currentPage.sections.forEach(section => {
      textToRead += `${section.title}: ${section.content}. `;
    });

    // Check speech API
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop any pending speech
      
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = 'pt-BR';
      utterance.rate = 0.95; // Slightly slower for comprehension
      
      utterance.onend = () => {
        setIsReading(false);
      };

      utterance.onerror = () => {
        setIsReading(false);
      };

      setSpeechUtterance(utterance);
      setIsReading(true);
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Seu navegador não suporta leitura de voz por inteligência artificial.');
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsReading(false);
  };

  // Clean speaking on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  // Handle Drag-and-drop simulated events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSimulatedFile({
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(1) + ' MB'
      });
      if (!medicineName) {
        setMedicineName(file.name.split('.')[0].replace(/_/g, ' '));
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSimulatedFile({
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(1) + ' MB'
      });
      if (!medicineName) {
        setMedicineName(file.name.split('.')[0].replace(/_/g, ' '));
      }
    }
  };

  // Visual classes according to user toggles and selected site style
  const styleConfig = SITE_STYLES[activeStyle] || SITE_STYLES.indigo;
  const themeKey = (!isCustomMode && currentEbook?.colorTheme) ? currentEbook.colorTheme : styleConfig.themeKey;
  const currentTheme = THEMES[themeKey] || THEMES.indigo;

  const toggleColorClass = themeKey === 'emerald' 
    ? 'bg-emerald-600' 
    : themeKey === 'amber' 
      ? 'bg-amber-600' 
      : themeKey === 'blue' 
        ? 'bg-blue-600' 
        : 'bg-indigo-600';

  const filteredPresets = presets.filter(preset => {
    const query = normalizeString(searchQuery);
    if (!query) return true;
    
    const nameSimple = getPresetDisplayName(preset.key, true, preset.medicineName);
    const nameClinical = getPresetDisplayName(preset.key, false, preset.medicineName);
    const subSimple = getPresetDisplaySubtitle(preset.key, true, preset.subtitle);
    const subClinical = getPresetDisplaySubtitle(preset.key, false, preset.subtitle);
    
    const nameMatch = normalizeString(nameSimple).includes(query) || normalizeString(nameClinical).includes(query);
    const subtitleMatch = normalizeString(subSimple).includes(query) || normalizeString(subClinical).includes(query);
    const tagsMatch = (preset.tags || []).some((tag: string) => normalizeString(tag).includes(query));
    
    return nameMatch || subtitleMatch || tagsMatch;
  });

  return (
    <div id="clarifarma-app" className={`min-h-screen ${styleConfig.containerBg} font-sans ${styleConfig.comfortDark ? 'text-slate-100' : 'text-slate-800'} flex flex-col md:flex-row overflow-x-hidden transition-all duration-300`}>
      
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div 
          id="sidebar-backdrop"
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 md:hidden animate-in fade-in duration-200"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Controls */}
      <aside 
        id="clarifarma-sidebar" 
        className={`flex-shrink-0 ${styleConfig.sidebarBg} flex flex-col justify-between transition-all duration-300 fixed inset-y-0 left-0 z-50 md:static md:translate-x-0 ${
          sidebarOpen 
            ? 'w-[290px] xs:w-[320px] md:w-80 lg:w-96 p-6 md:p-8 border-r border-slate-200/80 dark:border-slate-800 shadow-2xl md:shadow-md translate-x-0' 
            : 'w-0 p-0 overflow-hidden border-r-0 -translate-x-full md:w-0'
        }`}
      >
        <div className={`flex-1 flex flex-col justify-between h-full py-1 transition-all ${sidebarOpen ? 'min-w-[240px] xs:min-w-[272px] md:min-w-[310px]' : 'min-w-0 w-0 overflow-hidden'}`}>
          <div className="space-y-6">
            
            {/* Brand Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-extrabold shadow-sm ${
                  styleConfig.themeKey === 'emerald' 
                    ? 'bg-emerald-600' 
                    : styleConfig.themeKey === 'amber' 
                      ? 'bg-amber-600' 
                      : styleConfig.themeKey === 'blue' 
                        ? 'bg-blue-600' 
                        : 'bg-indigo-600'
                }`}>
                  M
                </div>
                <div>
                  <h1 className={`text-xl font-extrabold tracking-tight ${styleConfig.sidebarTitle} leading-none flex items-baseline gap-1`}>
                    <span className={`text-[9px] ${styleConfig.labelColor} font-semibold uppercase tracking-widest`}>do</span>
                    <span>MediQuês</span>
                  </h1>
                  <span className={`text-[10px] ${styleConfig.labelColor} font-semibold uppercase tracking-widest block mt-1`}>para o português</span>
                </div>
              </div>

              <button
                id="close-sidebar-btn"
                onClick={() => setSidebarOpen(false)}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  styleConfig.comfortDark 
                    ? 'border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-slate-200' 
                    : 'border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                }`}
                title="Recolher menu"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
            <p className={`text-xs ${styleConfig.sidebarText} mt-2`}>
              Transformamos bulas complexas em livrinhos coloridos e fáceis para quem precisa de ajuda para entender seus remédios.
            </p>



          <hr className={styleConfig.comfortDark ? 'border-slate-800' : 'border-slate-100'} />

          {/* Search Bar */}
          <div className="space-y-2">
            <label className={`text-xs font-bold ${styleConfig.comfortDark ? 'text-slate-400' : 'text-slate-500'} uppercase tracking-wider flex items-center gap-1.5`}>
              <Search className={`w-3.5 h-3.5 ${styleConfig.comfortDark ? 'text-slate-400' : 'text-indigo-500'}`} />
              Buscar no Guia
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ex: pressão alta, diabetes, azia..."
                className={`w-full pl-9 pr-8 py-2.5 rounded-xl text-xs outline-none border transition-all ${
                  styleConfig.comfortDark 
                    ? 'bg-slate-900 border-slate-800 text-slate-100 placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20' 
                    : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/20'
                }`}
              />
              <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${styleConfig.comfortDark ? 'text-slate-600' : 'text-slate-400'}`} />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick search tags suggestion */}
            <div className="flex flex-wrap gap-1 mt-1.5">
              {['pressão', 'diabetes', 'azia', 'losartana', 'BRA', 'glifage'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSearchQuery(tag)}
                  className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    normalizeString(searchQuery) === normalizeString(tag)
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : `${styleConfig.comfortDark ? 'bg-slate-850 text-slate-400 hover:bg-slate-800 hover:text-slate-350 border border-slate-800' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-600 border border-slate-100'}`
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <hr className={styleConfig.comfortDark ? 'border-slate-800' : 'border-slate-100'} />

          {/* Quick Preset Selector */}
          <div>
            <label className={`text-xs font-bold ${styleConfig.comfortDark ? 'text-slate-400' : 'text-slate-500'} uppercase tracking-wider mb-3 block flex items-center gap-1.5`}>
              <FolderOpen className={`w-3.5 h-3.5 ${styleConfig.comfortDark ? 'text-slate-400' : 'text-blue-500'}`} />
              Pastas de Doenças ({filteredPresets.length > 0 ? Array.from(new Set(filteredPresets.map(p => p.category))).length : 0})
            </label>
            
            {filteredPresets.length > 0 ? (
              <div className="space-y-2.5">
                {[
                  { id: 'hipertensao', icon: Heart, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/20 dark:border-emerald-500/10' },
                  { id: 'diabetes', icon: Activity, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40 border-blue-500/20 dark:border-blue-500/10' },
                  { id: 'colesterol', icon: ShieldAlert, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-500/20 dark:border-amber-500/10' }
                ].map((cat) => {
                  const categoryPresets = filteredPresets.filter(p => p.category === cat.id);
                  if (categoryPresets.length === 0) return null;
                  
                  const isExpanded = !!(openFolders[cat.id] || searchQuery.trim() !== '');
                  const CategoryIcon = cat.icon;
                  const folderName = getPresetDisplayName(cat.id, accessibilitySettings.simpleLanguage, cat.id);
                  const folderDesc = getPresetDisplaySubtitle(cat.id, accessibilitySettings.simpleLanguage, cat.id);

                  return (
                    <div 
                      key={cat.id} 
                      className={`rounded-xl border transition-all overflow-hidden ${
                        isExpanded 
                          ? `${styleConfig.comfortDark ? 'border-slate-800 bg-slate-900/10' : 'border-slate-200 bg-slate-50/20'}` 
                          : `${styleConfig.comfortDark ? 'border-slate-800 bg-slate-900/50 hover:border-slate-700' : 'border-slate-100 bg-slate-50/50 hover:border-slate-200'}`
                      }`}
                    >
                      {/* Folder Header button */}
                      <button
                        onClick={() => setOpenFolders(prev => ({ ...prev, [cat.id]: !prev[cat.id] }))}
                        className={`w-full p-3 flex items-center justify-between text-left transition-all cursor-pointer`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`p-2 rounded-lg border ${cat.color} flex items-center justify-center flex-shrink-0`}>
                            <CategoryIcon className="w-4 h-4 animate-pulse" />
                          </div>
                          <div className="min-w-0">
                            <span className={`text-xs font-bold block ${styleConfig.comfortDark ? 'text-slate-200' : 'text-slate-800'}`}>
                              📁 {folderName}
                            </span>
                            <span className={`text-[10px] block truncate ${styleConfig.comfortDark ? 'text-slate-500' : 'text-slate-400'}`}>
                              {folderDesc}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 pl-2">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${styleConfig.comfortDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                            {categoryPresets.length} {categoryPresets.length === 1 ? 'guia' : 'guias'}
                          </span>
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                      </button>

                      {/* Expandable/collapsible content */}
                      {isExpanded && (
                        <div className={`p-2 border-t flex flex-col gap-1.5 ${styleConfig.comfortDark ? 'border-slate-800 bg-slate-950/20' : 'border-slate-200/50 bg-white'}`}>
                          {categoryPresets.map((preset) => {
                            const isSelected = selectedPreset === preset.key && !isCustomMode;
                            return (
                              <button
                                key={preset.key}
                                id={`preset-btn-${preset.key}`}
                                onClick={() => handlePresetSelect(preset.key)}
                                className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                                  isSelected
                                    ? `${styleConfig.comfortDark ? 'border-indigo-500 bg-indigo-950/40 text-indigo-100' : 'border-indigo-600 bg-indigo-50/50 text-indigo-900'} font-semibold ring-1 ring-indigo-500/20` 
                                    : `${styleConfig.comfortDark ? 'border-slate-800 hover:border-slate-700 text-slate-300 bg-slate-900/50' : 'border-slate-200 hover:border-slate-300 text-slate-600 hover:bg-slate-50/50'}`
                                }`}
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5">
                                    <Pill className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-indigo-500' : 'text-slate-400'}`} />
                                    <p className="text-xs font-bold truncate">
                                      {getPresetDisplayName(preset.key, accessibilitySettings.simpleLanguage, preset.medicineName)}
                                    </p>
                                  </div>
                                  <p className={`text-[10px] font-normal truncate mt-0.5 ml-5 ${styleConfig.comfortDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                    {getPresetDisplaySubtitle(preset.key, accessibilitySettings.simpleLanguage, preset.subtitle)}
                                  </p>
                                </div>

                                <div className="flex-shrink-0 flex items-center gap-1">
                                  {preset.tags && preset.tags.length > 0 && (
                                    <span className="text-[8px] font-bold px-1 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded border border-slate-200/40 dark:border-slate-700/45 uppercase tracking-wide">
                                      {preset.tags[0]}
                                    </span>
                                  )}
                                  <ChevronRight className="w-3 h-3 text-slate-400" />
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-1 bg-slate-50/50 dark:bg-slate-900/10">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Nenhum resultado</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">Tente buscar por "pressão", "glicose" ou "azia".</p>
              </div>
            )}

            <button
              id="new-medicine-btn"
              onClick={() => {
                setIsCustomMode(true);
                setSelectedPreset('');
              }}
              className={`w-full mt-3 py-3 px-4 border border-dashed rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isCustomMode 
                  ? `${styleConfig.comfortDark ? 'border-indigo-500 bg-indigo-950/20 text-indigo-400' : 'border-indigo-600 bg-indigo-50/20 text-indigo-600'}`
                  : `${styleConfig.comfortDark ? 'border-slate-800 hover:border-slate-700 text-slate-400' : 'border-slate-300 hover:border-slate-400 text-slate-600'}`
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              Simplificar Outro Remédio
            </button>
          </div>

          <hr className={styleConfig.comfortDark ? 'border-slate-800' : 'border-slate-100'} />

          {/* Accessibility Adjustments */}
          <div className="space-y-3">
            <label className={`text-xs font-bold ${styleConfig.comfortDark ? 'text-slate-400' : 'text-slate-500'} uppercase tracking-wider block`}>
              Configurações de Acessibilidade
            </label>
            
            <div className="space-y-2.5">
              {/* Simple Language Toggle */}
              <div className={`flex items-center justify-between p-3 bg-slate-50 rounded-xl border transition-colors ${styleConfig.comfortDark ? 'bg-slate-900/60 border-slate-800/80' : 'bg-slate-50 rounded-xl border-slate-100'}`}>
                <div>
                  <span className={`text-xs font-bold block ${styleConfig.comfortDark ? 'text-slate-200' : 'text-slate-700'}`}>Linguagem Simples</span>
                  <span className={`text-[10px] font-medium ${styleConfig.comfortDark ? 'text-slate-500' : 'text-slate-400'}`}>Sem termos médicos</span>
                </div>
                <button 
                  id="toggle-simple-lang"
                  onClick={() => setAccessibilitySettings(prev => ({ ...prev, simpleLanguage: !prev.simpleLanguage }))}
                  className={`w-11 h-6 rounded-full relative transition-colors ${accessibilitySettings.simpleLanguage ? toggleColorClass : (styleConfig.comfortDark ? 'bg-slate-800' : 'bg-slate-200')}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${accessibilitySettings.simpleLanguage ? 'right-1' : 'left-1'}`}></div>
                </button>
              </div>

              {/* Colorful Icons Toggle */}
              <div className={`flex items-center justify-between p-3 bg-slate-50 rounded-xl border transition-colors ${styleConfig.comfortDark ? 'bg-slate-900/60 border-slate-800/80' : 'bg-slate-50 rounded-xl border-slate-100'}`}>
                <div>
                  <span className={`text-xs font-bold block ${styleConfig.comfortDark ? 'text-slate-200' : 'text-slate-700'}`}>Pictogramas Coloridos</span>
                  <span className={`text-[10px] font-medium ${styleConfig.comfortDark ? 'text-slate-500' : 'text-slate-400'}`}>Destaques visuais coloridos</span>
                </div>
                <button 
                  id="toggle-pictograms"
                  onClick={() => setAccessibilitySettings(prev => ({ ...prev, colorfulPictograms: !prev.colorfulPictograms }))}
                  className={`w-11 h-6 rounded-full relative transition-colors ${accessibilitySettings.colorfulPictograms ? toggleColorClass : (styleConfig.comfortDark ? 'bg-slate-800' : 'bg-slate-200')}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${accessibilitySettings.colorfulPictograms ? 'right-1' : 'left-1'}`}></div>
                </button>
              </div>

              {/* Large Font Size Toggle */}
              <div className={`flex items-center justify-between p-3 bg-slate-50 rounded-xl border transition-colors ${styleConfig.comfortDark ? 'bg-slate-900/60 border-slate-800/80' : 'bg-slate-50 rounded-xl border-slate-100'}`}>
                <div>
                  <span className={`text-xs font-bold block ${styleConfig.comfortDark ? 'text-slate-200' : 'text-slate-700'}`}>Fonte Grande (Leitura)</span>
                  <span className={`text-[10px] font-medium font-serif ${styleConfig.comfortDark ? 'text-slate-500' : 'text-slate-400'}`}>Aumenta as letras</span>
                </div>
                <button 
                  id="toggle-large-font"
                  onClick={() => setAccessibilitySettings(prev => ({ ...prev, largeFont: !prev.largeFont }))}
                  className={`w-11 h-6 rounded-full relative transition-colors ${accessibilitySettings.largeFont ? toggleColorClass : (styleConfig.comfortDark ? 'bg-slate-800' : 'bg-slate-200')}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${accessibilitySettings.largeFont ? 'right-1' : 'left-1'}`}></div>
                </button>
              </div>

              {/* Paywall control if there are unlocked items */}
              {unlockedMedicines.length > 0 && (
                <div className="pt-2">
                  <button
                    onClick={handleResetPremiumLocks}
                    className={`w-full py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border cursor-pointer ${
                      styleConfig.comfortDark 
                        ? 'bg-slate-800 hover:bg-slate-755 text-slate-300 hover:text-white border-slate-700'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border-slate-200'
                    }`}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Restaurar Bloqueios Premium
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        </div>

        {/* Footer info/credits */}
        <div className={`pt-4 border-t mt-6 text-center md:text-left ${styleConfig.comfortDark ? 'border-slate-800' : 'border-slate-100'}`}>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Tecnologia com Afeto</p>
          <p className="text-[10px] text-slate-300 mt-1">Desenvolvido com IA Gemini para Inclusão Digital</p>
        </div>
      </aside>

      {/* Main Preview and Interaction Area */}
      <main id="clarifarma-main" className={`flex-1 flex flex-col min-h-0 ${styleConfig.mainBg} transition-all duration-300`}>
        
        {/* Custom Input Mode / Analyzer */}
        {isCustomMode ? (
          <div className="flex-1 p-6 md:p-10 flex flex-col max-w-3xl mx-auto w-full justify-center">
            <div className={`${styleConfig.cardBg} ${styleConfig.cardBorder} rounded-2xl p-6 md:p-8 shadow-md space-y-6 transition-all duration-300`}>
              <div>
                <h2 className={`text-xl font-extrabold ${styleConfig.comfortDark ? 'text-slate-100' : 'text-slate-900'} tracking-tight flex items-center gap-2`}>
                  <Sparkles className={`w-5 h-5 ${styleConfig.comfortDark ? 'text-indigo-400' : 'text-indigo-600'} animate-pulse`} />
                  Simplificar um Novo Medicamento
                </h2>
                <p className={`text-xs ${styleConfig.comfortDark ? 'text-slate-450' : 'text-slate-400'} mt-1`}>
                  Insira o nome de um remédio ou cole o texto de uma bula. A nossa Inteligência Artificial vai gerar um E-book simples e interativo instantaneamente.
                </p>
              </div>

              <form onSubmit={handleSimplifyCustom} className="space-y-5">
                {/* Medicine Name */}
                <div className="space-y-1.5">
                  <label className={`text-xs font-bold ${styleConfig.comfortDark ? 'text-slate-400' : 'text-slate-500'} uppercase tracking-wider block`}>Nome do Remédio</label>
                  <input
                    type="text"
                    id="input-medicine-name"
                    value={medicineName}
                    onChange={(e) => setMedicineName(e.target.value)}
                    placeholder="Ex: Amoxicilina, Dipirona, Losartana..."
                    className={`w-full px-4 py-3 rounded-xl border ${styleConfig.comfortDark ? 'bg-slate-900 border-slate-800 text-slate-100 focus:ring-indigo-500' : 'bg-white border-slate-200 text-slate-800 focus:ring-indigo-500'} focus:outline-none focus:ring-2 text-sm placeholder:text-slate-400 transition-all font-medium`}
                  />
                </div>

                {/* Simulated File upload or text paste */}
                <div className="space-y-1.5">
                  <label className={`text-xs font-bold ${styleConfig.comfortDark ? 'text-slate-400' : 'text-slate-500'} uppercase tracking-wider block`}>
                    Anexar Bula (PDF / Imagem) ou Colar Texto
                  </label>
                  
                  {/* File Dropzone */}
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-2xl p-6 transition-all relative flex flex-col items-center justify-center gap-2 ${styleConfig.comfortDark ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700' : 'bg-slate-50 border-slate-200 hover:border-slate-300'} ${
                      dragActive ? (styleConfig.themeKey === 'emerald' ? 'border-emerald-500 bg-emerald-950/20' : styleConfig.themeKey === 'amber' ? 'border-amber-500 bg-amber-950/20' : styleConfig.themeKey === 'blue' ? 'border-blue-500 bg-blue-950/20' : 'border-indigo-500 bg-indigo-950/20') : ''
                    }`}
                  >
                    <input 
                      type="file" 
                      id="file-upload" 
                      accept=".pdf,.png,.jpg,.jpeg,.txt"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    
                    {simulatedFile ? (
                      <div className={`flex items-center gap-3 px-4 py-2 rounded-xl shadow-sm border z-10 ${styleConfig.comfortDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                        <FileCheck className="w-5 h-5 text-emerald-500" />
                        <div className="text-left">
                          <p className={`text-xs font-bold max-w-[200px] truncate ${styleConfig.comfortDark ? 'text-slate-200' : 'text-slate-700'}`}>{simulatedFile.name}</p>
                          <p className="text-[10px] text-slate-400">{simulatedFile.size}</p>
                        </div>
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setSimulatedFile(null);
                          }}
                          className="text-xs font-bold text-red-500 hover:text-red-700 ml-2"
                        >
                          Remover
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-slate-400" />
                        <p className={`text-xs font-bold ${styleConfig.comfortDark ? 'text-slate-300' : 'text-slate-600'}`}>Arraste a bula em PDF aqui ou clique para selecionar</p>
                        <p className="text-[10px] text-slate-400">PDF, JPG, PNG ou TXT de até 10MB</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Paste Area */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className={`text-xs font-bold ${styleConfig.comfortDark ? 'text-slate-400' : 'text-slate-500'} uppercase tracking-wider block`}>Colar Texto Manual (Opcional)</label>
                    <span className="text-[10px] text-slate-400 font-semibold">Ajuda a IA a ser ainda mais precisa</span>
                  </div>
                  <textarea
                    id="input-bula-text"
                    value={bulaText}
                    onChange={(e) => setBulaText(e.target.value)}
                    placeholder="Cole partes da bula ou as instruções que o médico passou..."
                    rows={4}
                    className={`w-full p-4 rounded-xl border ${styleConfig.comfortDark ? 'bg-slate-900 border-slate-800 text-slate-100 focus:ring-indigo-500' : 'bg-white border-slate-200 text-slate-800 focus:ring-indigo-500'} focus:outline-none focus:ring-2 text-xs placeholder:text-slate-450 transition-all font-mono`}
                  ></textarea>
                </div>

                {error && (
                  <div id="error-alert" className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold border border-red-200">
                    {error}
                  </div>
                )}

                {/* Submissions */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    id="submit-simplify"
                    disabled={isLoading}
                    className={`flex-1 py-4 text-white disabled:bg-slate-400 rounded-xl font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer ${toggleColorClass} hover:brightness-110`}
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Simplificando com Inteligência Artificial...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
                        Gerar Livro de Instruções
                      </>
                    )}
                  </button>
                  
                  <button
                    type="button"
                    id="cancel-simplify"
                    onClick={() => {
                      setIsCustomMode(false);
                      if (presets.length > 0) {
                        handlePresetSelect(presets[0].key);
                      }
                    }}
                    className={`px-6 py-4 rounded-xl font-bold text-sm transition-all border cursor-pointer ${styleConfig.comfortDark ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
                  >
                    Voltar
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          /* Simplified E-book Workspace */
          <div ref={ebookWorkspaceRef} className="flex-1 flex flex-col justify-between p-4 md:p-8">
            
            {/* Header / Workspace controls */}
            <header className={`flex flex-col sm:flex-row gap-4 items-center justify-between px-4 py-2 border-b ${styleConfig.subHeaderBorder} ${styleConfig.subHeaderBg} rounded-2xl mb-4 md:mb-6 transition-all duration-300`}>
              <div className="flex items-center gap-3">
                {!sidebarOpen && (
                  <button
                    id="header-open-sidebar-btn"
                    onClick={() => setSidebarOpen(true)}
                    className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center shrink-0 ${
                      styleConfig.comfortDark 
                        ? 'border-slate-800 bg-slate-900 text-indigo-400 hover:bg-slate-800 hover:text-indigo-300' 
                        : 'border-slate-200 bg-white text-indigo-600 hover:bg-slate-50 shadow-sm hover:text-indigo-700'
                    }`}
                    title="Abrir menu de busca e guias"
                  >
                    <Menu className="w-4 h-4 animate-in fade-in duration-200" />
                  </button>
                )}
                <span className={`text-[10px] font-bold ${styleConfig.comfortDark ? 'bg-slate-850 text-slate-350' : 'bg-slate-200 text-slate-600'} px-2.5 py-1 rounded-full uppercase tracking-wider`}>
                  Página {currentEbook ? `${currentPageIndex + 1} de ${currentEbook.pages.length}` : '0 de 0'}
                </span>
                <div>
                  <h2 className={`text-sm font-bold ${styleConfig.comfortDark ? 'text-slate-100' : 'text-slate-700'}`}>
                    {currentEbook ? `Guia Simplificado: ${getPresetDisplayName(selectedPreset, accessibilitySettings.simpleLanguage, currentEbook.medicineName)}` : 'Selecione um medicamento'}
                  </h2>
                  <p className={`text-[11px] ${styleConfig.comfortDark ? 'text-slate-400' : 'text-slate-400'} font-medium`}>
                    {currentEbook ? getPresetDisplaySubtitle(selectedPreset, accessibilitySettings.simpleLanguage, currentEbook.subtitle) : ''}
                  </p>
                  {currentPageIndex === 0 && currentEbook?.tags && currentEbook.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {currentEbook.tags.map((tag: string) => (
                        <button
                          key={tag}
                          onClick={() => setSearchQuery(tag)}
                          className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider transition-all cursor-pointer bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-indigo-600 hover:text-white dark:text-slate-400 dark:hover:bg-indigo-600 dark:hover:text-white border border-slate-200 dark:border-slate-700/80`}
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Speech Read-out Button and Nav */}
              <div className="flex items-center gap-3">
                <button
                  id="speak-page-btn"
                  onClick={speakCurrentPage}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    isReading 
                      ? 'bg-rose-500 text-white hover:bg-rose-600 animate-pulse shadow-md shadow-rose-100' 
                      : `${styleConfig.comfortDark ? 'bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 shadow-sm'}`
                  }`}
                  title="Ouvir em voz alta"
                >
                  {isReading ? (
                    <>
                      <VolumeX className="w-4 h-4" />
                      Parar Leitura
                    </>
                  ) : (
                    <>
                      <Volume2 className={`w-4 h-4 ${styleConfig.comfortDark ? 'text-indigo-400' : 'text-blue-600'}`} />
                      Ouvir esta Página (Áudio)
                    </>
                  )}
                </button>
              </div>
            </header>

            {/* Simulated Printed Ebook Page Card */}
            <div className="flex-1 flex justify-center items-center py-4 md:py-8">
              {isLoading ? (
                <div id="loading-spinner" className="flex flex-col items-center gap-3">
                  <RefreshCw className={`w-10 h-10 animate-spin ${styleConfig.comfortDark ? 'text-indigo-400' : 'text-blue-600'}`} />
                  <p className="text-xs font-bold text-slate-500">Montando seu guia de saúde ilustrado...</p>
                </div>
              ) : currentEbook && currentEbook.pages[currentPageIndex] ? (
                (() => {
                  const page = currentEbook.pages[currentPageIndex];
                  const isPageLocked = page.pageNumber >= 3 && 
                    !unlockedMedicines.includes(currentEbook.medicineName + "_full") && 
                    !unlockedMedicines.includes("ebook_completo");

                  const cardMaxWidth = isPageLocked
                    ? 'max-w-[500px]'
                    : sidebarOpen
                      ? (page.isInfographic ? 'max-w-[950px]' : 'max-w-[500px]')
                      : (page.isInfographic ? 'max-w-[1200px]' : 'max-w-[750px] md:max-w-[780px]');

                  const cardMinHeight = isPageLocked
                    ? 'min-h-[460px] md:min-h-[580px]'
                    : sidebarOpen
                      ? 'min-h-[460px] md:min-h-[580px]'
                      : 'min-h-[70vh] md:min-h-[82vh] lg:min-h-[86vh]';

                  return (
                    <article 
                      id={`ebook-page-${page.pageNumber}`}
                      className={`w-full ${cardMaxWidth} ${cardMinHeight} ${styleConfig.cardBg} ${styleConfig.cardBorder} rounded-2xl p-5 md:p-10 flex flex-col relative transition-all duration-300`}
                    >
                      {/* Top Accent bar representing dynamic medicine category theme color */}
                      <div className={`h-2.5 w-20 rounded-full mb-5 md:mb-6 ${currentTheme.bg} border-l-4 ${currentTheme.border}`}></div>
                      
                      {/* Header title */}
                      <h3 className={`text-xl md:text-3xl font-bold ${styleConfig.titleColor} mb-3 md:mb-4 leading-tight font-serif pb-2.5 border-b ${styleConfig.comfortDark ? 'border-slate-800' : 'border-slate-100'}`}>
                        {page.title}
                      </h3>
                      
                      {/* Large text description */}
                      <p className={`${styleConfig.descColor} mb-4 md:mb-6 font-serif italic leading-relaxed whitespace-pre-wrap ${
                        accessibilitySettings.largeFont ? 'text-lg' : 'text-[14px]'
                      } ${isPageLocked ? 'line-clamp-2 select-none opacity-40 blur-[1px]' : ''}`}>
                        {page.description}
                      </p>

                      {isPageLocked ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-5 my-auto">
                          <div className="w-14 h-14 bg-amber-50 dark:bg-amber-950/40 rounded-2xl flex items-center justify-center text-amber-500 dark:text-amber-400 shadow-sm border border-amber-100/50 dark:border-amber-900/50">
                            <Lock className="w-6 h-6 animate-pulse" />
                          </div>
                          <div className="space-y-2 max-w-sm">
                            <h4 className={`text-base font-bold font-serif ${styleConfig.titleColor}`}>
                              Conteúdo Exclusivo da Versão Premium
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                              Para continuar lendo as orientações completas, dicas de segurança e o infográfico resumido das Sartanas a partir da página 3, libere o acesso completo por apenas R$ 4,90.
                            </p>
                          </div>
                          <button
                            onClick={() => setPaywallModalMedicine(currentEbook.medicineName + "_full")}
                            className="py-3 px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                          >
                            <Unlock className="w-4 h-4" />
                            Liberar Guia Completo por R$ 4,90
                          </button>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                            Pagamento único. Acesso vitalício e ilimitado.
                          </p>
                        </div>
                      ) : page.isInfographic ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 flex-1">
                          {page.sections.map((section, idx) => {
                            const isSuccess = section.type === 'success';
                            const isWarning = section.type === 'warning';
                            const isInfo = section.type === 'info';
                            
                            let cardBg = styleConfig.itemBg;
                            let iconColor = styleConfig.comfortDark ? 'text-slate-400' : 'text-slate-500';
                            let textColor = styleConfig.comfortDark ? 'text-slate-100' : 'text-slate-800';

                            if (accessibilitySettings.colorfulPictograms) {
                              if (styleConfig.comfortDark) {
                                if (isSuccess) {
                                  cardBg = 'bg-emerald-950/20 border-emerald-900/45';
                                  iconColor = 'text-emerald-400';
                                } else if (isWarning) {
                                  cardBg = 'bg-rose-950/20 border-rose-900/45';
                                  iconColor = 'text-rose-400';
                                } else if (isInfo) {
                                  cardBg = 'bg-blue-950/20 border-blue-900/45';
                                  iconColor = 'text-blue-400';
                                }
                              } else {
                                if (isSuccess) {
                                  cardBg = 'bg-emerald-50/40 border-emerald-100/60 shadow-sm';
                                  iconColor = 'text-emerald-600';
                                } else if (isWarning) {
                                  cardBg = 'bg-rose-50/40 border-rose-100/60 shadow-sm';
                                  iconColor = 'text-rose-600';
                                } else if (isInfo) {
                                  cardBg = 'bg-blue-50/40 border-blue-100/60 shadow-sm';
                                  iconColor = 'text-blue-600';
                                }
                              }
                            }

                            return (
                              <section key={idx} className={`p-4 rounded-xl border ${cardBg} flex flex-col space-y-2 transition-all duration-300`}>
                                <div className="flex items-center gap-2.5">
                                  <div className={`p-2 rounded-lg bg-white shadow-sm border border-slate-100 shrink-0 ${styleConfig.comfortDark ? '!bg-slate-800 border-slate-700' : ''}`}>
                                    {getIconComponent(section.icon, iconColor)}
                                  </div>
                                  <h4 className={`text-xs md:text-sm font-bold font-serif ${textColor}`}>
                                    {section.title}
                                  </h4>
                                </div>
                                <div className="flex-1">
                                  {renderSectionContent(section.content, styleConfig, accessibilitySettings)}
                                </div>
                              </section>
                            );
                          })}
                        </div>
                      ) : (
                        /* Content sections list */
                        <div className="space-y-5 flex-1">
                          {page.sections.map((section, idx) => {
                            const isSuccess = section.type === 'success';
                            const isWarning = section.type === 'warning';
                            const isInfo = section.type === 'info';
                            
                            let cardBg = styleConfig.itemBg;
                            let iconColor = styleConfig.comfortDark ? 'text-slate-400' : 'text-slate-500';
                            let textColor = styleConfig.comfortDark ? 'text-slate-200' : 'text-slate-750';

                            if (accessibilitySettings.colorfulPictograms) {
                              if (styleConfig.comfortDark) {
                                if (isSuccess) {
                                  cardBg = 'bg-emerald-950/35 border-emerald-900/60';
                                  iconColor = 'text-emerald-400';
                                  textColor = 'text-emerald-200';
                                } else if (isWarning) {
                                  cardBg = 'bg-rose-950/35 border-rose-900/60';
                                  iconColor = 'text-rose-400';
                                  textColor = 'text-rose-200';
                                } else if (isInfo) {
                                  cardBg = 'bg-blue-950/35 border-blue-900/60';
                                  iconColor = 'text-blue-400';
                                  textColor = 'text-blue-200';
                                }
                              } else {
                                if (isSuccess) {
                                  cardBg = 'bg-emerald-50/50 border-emerald-100/50';
                                  iconColor = 'text-emerald-600';
                                  textColor = 'text-emerald-950';
                                } else if (isWarning) {
                                  cardBg = 'bg-rose-50/50 border-rose-100/50';
                                  iconColor = 'text-rose-600';
                                  textColor = 'text-rose-950';
                                } else if (isInfo) {
                                  cardBg = 'bg-blue-50/50 border-blue-100/50';
                                  iconColor = 'text-blue-600';
                                  textColor = 'text-blue-950';
                                }
                              }
                            }

                            const isLocked = section.isPremium && !unlockedMedicines.includes(section.title);

                            return (
                              <section 
                                key={idx} 
                                className={`flex flex-col sm:flex-row gap-3 sm:gap-4 items-start p-4 rounded-xl border ${cardBg} transition-all relative overflow-hidden`}
                              >
                                <div className="flex items-center sm:items-start gap-2.5 sm:gap-0 shrink-0 w-full sm:w-auto">
                                  <div className={`flex-shrink-0 bg-white p-2 rounded-xl shadow-sm border border-slate-100 ${isLocked ? 'filter blur-[1px] opacity-40' : ''} ${styleConfig.comfortDark ? '!bg-slate-800 border-slate-700' : ''}`}>
                                    {getIconComponent(section.icon, iconColor)}
                                  </div>
                                  {/* Mobile Title block */}
                                  <div className="sm:hidden flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <h4 className={`text-sm font-bold font-serif ${textColor} ${isLocked ? 'filter blur-[1px] opacity-40 select-none' : ''} leading-snug`}>
                                        {section.title}
                                      </h4>
                                      {section.isPremium && (
                                        <span className={`text-[8px] font-black uppercase tracking-wider px-1 py-0.5 rounded ${
                                          isLocked 
                                            ? 'bg-amber-100 text-amber-800' 
                                            : 'bg-emerald-100 text-emerald-800'
                                        }`}>
                                          {isLocked ? '🔒 Premium' : '🔓 Full'}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-1 flex-1 w-full">
                                  {/* Desktop Title block */}
                                  <div className="hidden sm:flex items-center gap-2 flex-wrap mb-1">
                                    <h4 className={`text-sm font-bold font-serif ${textColor} ${isLocked ? 'filter blur-[1px] opacity-40 select-none' : ''}`}>
                                      {section.title}
                                    </h4>
                                    {section.isPremium && (
                                      <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md ${
                                        isLocked 
                                          ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                      }`}>
                                        {isLocked ? '🔒 Premium' : '🔓 Desbloqueado'}
                                      </span>
                                    )}
                                  </div>
                                  
                                  {isLocked ? (
                                    <div className="pt-1">
                                      <p className={`text-[11px] font-medium mb-2 leading-snug ${styleConfig.comfortDark ? 'text-slate-400' : 'text-slate-450'}`}>
                                        Este medicamento exige acesso Premium para visualizar dosagens e posologia completas.
                                      </p>
                                      <button
                                        onClick={() => setPaywallModalMedicine(section.title)}
                                        className="py-1 px-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-lg text-[9px] font-bold shadow-sm transition-all flex items-center gap-1 cursor-pointer"
                                      >
                                        <Lock className="w-2.5 h-2.5" />
                                        Liberar por R$ 4,90
                                      </button>
                                    </div>
                                  ) : (
                                    renderSectionContent(section.content, styleConfig, accessibilitySettings)
                                  )}
                                </div>
                              </section>
                            );
                          })}
                        </div>
                      )}

                      {/* Reading Progress Bar */}
                      {(() => {
                        const progressPercent = currentEbook ? ((currentPageIndex + 1) / currentEbook.pages.length) * 100 : 0;
                        return (
                          <div className="w-full mt-8 space-y-1.5">
                            <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                              <span>Progresso de Leitura</span>
                              <span>{Math.round(progressPercent)}%</span>
                            </div>
                            <div className={`w-full h-1.5 rounded-full ${styleConfig.comfortDark ? 'bg-slate-800' : 'bg-slate-100'} overflow-hidden`}>
                              <div 
                                className={`h-full transition-all duration-300 ${
                                  styleConfig.themeKey === 'emerald' 
                                    ? 'bg-emerald-600' 
                                    : styleConfig.themeKey === 'amber' 
                                      ? 'bg-amber-600' 
                                      : styleConfig.themeKey === 'blue' 
                                        ? 'bg-blue-600' 
                                        : 'bg-indigo-600'
                                }`}
                                style={{ width: `${progressPercent}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Footer page elements */}
                      <footer className={`mt-6 flex justify-between items-center pt-5 border-t ${styleConfig.comfortDark ? 'border-slate-800' : 'border-slate-100'}`}>
                        <span className={`text-[9px] font-bold tracking-wider uppercase flex items-center gap-1 ${styleConfig.comfortDark ? 'text-slate-500' : 'text-slate-400'}`}>
                          <BookOpen className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                          Guia MediQuês
                        </span>
                        
                        {/* Page switching controls flanking the page number */}
                        <div className="flex items-center gap-2">
                          <button
                            id="prev-page-btn"
                            disabled={currentPageIndex === 0}
                            onClick={() => {
                              setCurrentPageIndex(prev => Math.max(0, prev - 1));
                              stopSpeaking();
                            }}
                            className={`p-1.5 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg transition-all cursor-pointer ${
                              styleConfig.comfortDark 
                                ? 'hover:bg-slate-800 text-slate-400 border-slate-800 bg-slate-900' 
                                : 'hover:bg-slate-50 text-slate-500 border-slate-200 bg-white'
                            } border shadow-sm`}
                            title="Página Anterior"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          
                          <span className={`text-xs font-extrabold ${styleConfig.comfortDark ? 'text-slate-200 bg-slate-800' : 'text-slate-800 bg-slate-100'} px-2.5 py-1 rounded-md min-w-[54px] text-center`}>
                            Pág {page.pageNumber.toString().padStart(2, '0')}
                          </span>

                          <button
                            id="next-page-btn"
                            disabled={!currentEbook || currentPageIndex === currentEbook.pages.length - 1}
                            onClick={() => {
                              setCurrentPageIndex(prev => Math.min(currentEbook!.pages.length - 1, prev + 1));
                              stopSpeaking();
                            }}
                            className={`p-1.5 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg transition-all cursor-pointer ${
                              styleConfig.comfortDark 
                                ? 'hover:bg-slate-800 text-slate-400 border-slate-800 bg-slate-900' 
                                : 'hover:bg-slate-50 text-slate-500 border-slate-200 bg-white'
                            } border shadow-sm`}
                            title="Próxima Página"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </footer>
                    </article>
                  );
                })()
              ) : (
                <div className={`text-center ${styleConfig.comfortDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  <p>Incapaz de carregar as páginas do livro de instruções.</p>
                </div>
              )}
            </div>

            {/* Bottom Nav Hint */}
            <div className="text-center py-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                Use as setas abaixo ou toque no botão de ouvir para ler o livro
              </span>
            </div>

          </div>
        )}
      </main>

      {/* Paywall / checkout Modal */}
      {paywallModalMedicine && (() => {
        const isFullEbookPaywall = paywallModalMedicine.endsWith('_full');
        const displayMedicineName = isFullEbookPaywall 
          ? `Guia Completo: ${getPresetDisplayName(selectedPreset, accessibilitySettings.simpleLanguage, currentEbook?.medicineName || '')}`
          : paywallModalMedicine;

        return (
          <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl max-w-md w-full border border-slate-100 shadow-2xl p-6 md:p-8 space-y-6 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              {/* Close button */}
              <button 
                onClick={() => setPaywallModalMedicine(null)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>

              {/* Icon Header */}
              <div className="text-center">
                <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 mb-4 mx-auto shadow-sm border border-amber-100/50">
                  <Lock className="w-6 h-6 animate-bounce" />
                </div>
                <h3 className="text-lg font-black text-slate-950 tracking-tight">
                  {isFullEbookPaywall ? 'Desbloquear Guia Completo' : 'Liberar Medicamento Premium'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {isFullEbookPaywall 
                    ? 'Você está prestes a desbloquear todas as páginas e o infográfico do:' 
                    : 'Você está prestes a desbloquear as informações completas de:'}
                </p>
                <div className="inline-block mt-2 px-3 py-1 bg-amber-50 border border-amber-100 rounded-full text-xs font-bold text-amber-800">
                  {displayMedicineName}
                </div>
              </div>

              {/* Benefits list */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">O que você recebe:</span>
                {isFullEbookPaywall ? (
                  <>
                    <div className="flex items-start gap-2 text-xs font-medium text-slate-600">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>Acesso total da Página 3 até o final do e-book</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs font-medium text-slate-600">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>Visualização do Infográfico Resumo completo das Sartanas</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs font-medium text-slate-600">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>Todas as orientações de segurança e interações liberadas</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs font-medium text-slate-600">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>Leitura por Áudio (TTS) habilitada para todas as páginas</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start gap-2 text-xs font-medium text-slate-600">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>Dosagens recomendadas e posologia detalhada</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs font-medium text-slate-600">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>Nomes comerciais e associações medicamentosas</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs font-medium text-slate-600">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>Áudio-leitura completa habilitada para este item</span>
                    </div>
                  </>
                )}
              </div>

              {/* Pricing Section */}
              <div className="text-center py-2">
                <span className="text-xs text-slate-400 font-semibold">Valor único para liberação:</span>
                <div className="flex items-baseline justify-center gap-1 mt-1">
                  <span className="text-sm font-bold text-slate-500">R$</span>
                  <span className="text-4xl font-black text-slate-900 tracking-tight">4,90</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 font-medium">
                  {isFullEbookPaywall ? 'Acesso vitalício e ilimitado a todas as páginas' : 'Acesso vitalício e ilimitado a este medicamento'}
                </p>
              </div>

              {/* Payment Actions */}
              <div className="space-y-3">
                {paymentSuccess ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl text-center space-y-1">
                    <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white mx-auto shadow-sm">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold mt-1">Pagamento Aprovado!</p>
                    <p className="text-[10px] text-emerald-600 font-medium">Liberando as informações para você...</p>
                  </div>
                ) : (
                  <>
                    <button
                      disabled={isProcessingPayment}
                      onClick={handleSimulatePayment}
                      className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isProcessingPayment ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Aguardando confirmação segura...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4" />
                          Simular Pagamento Instantâneo (R$ 4,90)
                        </>
                      )}
                    </button>
                    
                    <div className="text-center">
                      <p className="text-[9px] text-slate-400 font-medium leading-normal">
                        🔒 <strong>Ambiente de Testes:</strong> Nenhuma cobrança real será realizada. Clique no botão acima para simular a compra e testar a liberação imediata do paywall.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Floating reopen sidebar trigger on the left screen edge */}
      {!sidebarOpen && (
        <button
          id="reopen-sidebar-btn"
          onClick={() => setSidebarOpen(true)}
          className={`fixed left-0 top-[35%] z-40 w-8 h-10 bg-slate-900/80 hover:bg-slate-900 dark:bg-slate-800/80 dark:hover:bg-slate-800 backdrop-blur-xs text-slate-200 rounded-r-lg shadow-md border-y border-r border-slate-700/30 flex items-center justify-center transition-all duration-300 animate-in slide-in-from-left duration-200 cursor-pointer`}
          title="Abrir Menu de Busca"
        >
          <Menu className="w-4 h-4 text-slate-300 hover:text-white" />
        </button>
      )}
    </div>
  );
}
