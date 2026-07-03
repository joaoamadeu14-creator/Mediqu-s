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
  Menu,
  Home,
  Download,
  Moon,
  Sun,
  User as UserIcon,
  LogOut,
  LogIn,
  Star,
  History,
  Settings,
  Trash2,
  Plus,
  Edit,
  Bell,
  Check
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { auth, db } from './firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';


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

// Glossário de Termos Médicos para uso no e-book quando o Modo Linguagem Simples estiver desativado
const MEDICAL_GLOSSARY = [
  {
    term: "BRAs",
    definition: "Bloqueadores dos Receptores de Angiotensina II. Medicamentos que bloqueiam a ação do hormônio que contrai as artérias, ajudando a reduzir a pressão arterial e proteger o coração e os rins.",
    simpleDefinition: "Remédios para pressão (como Losartana) que relaxam as artérias (canos de sangue), ajudando a diminuir a força que o coração faz e a proteger os rins de complicações."
  },
  {
    term: "Inibidores da ECA",
    definition: "Inibidores da Enzima Conversora de Angiotensina. Medicamentos (como Captopril e Enalapril) que impedem a produção do hormônio angiotensina II, promovendo o relaxamento dos vasos sanguíneos.",
    simpleDefinition: "Remédios para pressão (como Captopril e Enalapril) que impedem que o corpo aperte os vasos sanguíneos, fazendo com que fiquem relaxados e o sangue passe mais livremente."
  },
  {
    term: "Hipertensão",
    definition: "Pressão arterial de valores elevados. Condição crônica em que a força exercida pelo sangue contra as paredes das artérias é suficientemente alta para eventualmente causar problemas de saúde, como infarto e AVC.",
    simpleDefinition: "Pressão alta de forma contínua. É quando o sangue corre com muita força pelas artérias, podendo com o tempo machucar o coração, os rins ou a cabeça se não for controlada."
  },
  {
    term: "Dislipidemia",
    definition: "Presença de níveis elevados ou anormais de gorduras (lipídeos) no sangue, como colesterol LDL e triglicerídeos, aumentando o risco de infarto.",
    simpleDefinition: "Gordura alta no sangue. Ter muito colesterol ruim (LDL) ou outras gorduras que podem ir se acumulando lentamente nos vasos e aumentar o risco de entupimento do coração."
  },
  {
    term: "Triglicerídeos",
    definition: "Principal tipo de gordura de reserva energética no corpo. Níveis extremamente altos podem deixar o sangue espesso e causar inflamação grave no pâncreas.",
    simpleDefinition: "Um tipo de gordura que vem do que comemos (como massas, doces e óleos). Se estiver em níveis muito altos, pode deixar o sangue grosso e inflamar o pâncreas."
  },
  {
    term: "Posologia",
    definition: "A descrição detalhada de como um medicamento deve ser administrado: a dose correta, o intervalo entre as tomadas (ex: 12 em 12 horas) e a duração do tratamento.",
    simpleDefinition: "As instruções corretas de como tomar o remédio: a quantidade exata, as horas certas (ex: de 12 em 12 horas) e por quantos dias você deve tomar."
  },
  {
    term: "Vasoconstrição",
    definition: "O estreitamento ou aperto dos vasos sanguíneos (artérias e veias), o que reduz o fluxo de sangue e eleva a pressão arterial.",
    simpleDefinition: "O aperto ou estreitamento dos vasos sanguíneos, fazendo com que o espaço para o sangue passar fique menor, o que sobe a pressão na hora."
  },
  {
    term: "Vasodilatação",
    definition: "O relaxamento e alargamento dos vasos sanguíneos, permitindo que o sangue flua com mais facilidade, o que reduz a pressão arterial.",
    simpleDefinition: "O relaxamento e a abertura dos vasos de sangue, permitindo que o sangue corra de forma mais suave, o que abaixa a pressão."
  },
  {
    term: "Mialgia",
    definition: "Dor muscular. É um efeito adverso conhecido do uso de estatinas, variando de cansaço muscular leve a dores intensas que exigem atenção médica.",
    simpleDefinition: "Dores ou cansaço forte nos músculos (como braços e pernas). Pode ser um efeito colateral de alguns remédios de colesterol, como as estatinas."
  },
  {
    term: "Estatinas",
    definition: "Classe de medicamentos (como Sinvastatina e Atorvastatina) usada para reduzir os níveis de colesterol ruim (LDL) e ajudar a limpar e estabilizar as artérias.",
    simpleDefinition: "Remédios para colesterol (como Sinvastatina e Atorvastatina) que reduzem a gordura ruim e ajudam a limpar e a proteger os vasos de sangue."
  },
  {
    term: "Fibratos",
    definition: "Medicamentos (como o Fenofibrato) indicados principalmente para reduzir de forma acentuada os triglicerídeos no sangue, ativando a queima de gorduras no fígado.",
    simpleDefinition: "Remédios específicos para abaixar as gorduras do tipo triglicerídeos, estimulando o fígado a eliminar esse excesso."
  },
  {
    term: "SGLT2",
    definition: "Co-transportador de Sódio-Glicose 2. Proteína nos rins que reabsorve o açúcar de volta para o corpo. Sua inibição (por gliflozinas) faz com que o excesso de açúcar seja eliminado na urina.",
    simpleDefinition: "Uma parte dos rins que puxa o açúcar de volta para o sangue. Remédios modernos (gliflozinas) bloqueiam isso para que o açúcar saia direto pela urina."
  },
  {
    term: "Acidose Lática",
    definition: "Acúmulo perigoso de ácido lático no sangue. É uma complicação extremamente rara, porém grave, que pode ocorrer em pacientes que usam metformina associada a consumo excessivo de álcool.",
    simpleDefinition: "Acúmulo perigoso de um ácido no sangue. É um problema muito raro, mas grave, que pode acontecer se a pessoa beber álcool em excesso enquanto toma Metformina."
  },
  {
    term: "Candidíase",
    definition: "Infecção fúngica causada pelo excesso de leveduras do gênero Candida. Pode ocorrer devido ao aumento de açúcar excretado na urina em pacientes usando inibidores de SGLT2.",
    simpleDefinition: "Infecção por fungo que causa coceira ou corrimento na região íntima. Pode dar porque alguns remédios de diabetes fazem sair muito açúcar no xixi, alimentando esses fungos."
  },
  {
    term: "Cetoacidose Diabética",
    definition: "Estado grave de deficiência de insulina em que o corpo passa a queimar gorduras como fonte de energia, criando corpos cetônicos que tornam o sangue ácido. Exige atendimento médico imediato.",
    simpleDefinition: "Problema grave e perigoso pela falta de insulina no corpo, que faz o sangue ficar ácido. Causa muita sede, cansaço e exige ir correndo para o hospital."
  },
  {
    term: "Pancreatite Aguda",
    definition: "Inflamação súbita do pâncreas. Pode ser desencadeada por níveis extremamente elevados de triglicerídeos no sangue (geralmente acima de 1.000 mg/dL).",
    simpleDefinition: "Inflamação forte e rápida no pâncreas (órgão da barriga). Pode acontecer quando a gordura do sangue (triglicerídeos) fica extremamente alta."
  },
  {
    term: "Angiotensina II",
    definition: "Hormônio vasoconstritor potente produzido pelo organismo que causa estreitamento das artérias e estimula a retenção de sódio e água, elevando diretamente a pressão.",
    simpleDefinition: "Uma substância natural do corpo que faz os vasos sanguíneos se espremerem e prenderem água, o que aumenta a pressão."
  },
  {
    term: "Creatinina",
    definition: "Resíduo metabólico produzido pelos músculos e filtrado pelos rins. Seus níveis no sangue servem para monitorar a função e a saúde renal.",
    simpleDefinition: "Sujeira natural que os músculos produzem e que sai pelos rins. Fazer esse exame de sangue serve para ver se seus rins estão limpando tudo direitinho."
  },
  {
    term: "Hipercalemia",
    definition: "Concentração excessivamente alta de potássio no sangue, que pode ocorrer com o uso de BRAs (sartanas) ou IECAs (pris) em pacientes com disfunção renal.",
    simpleDefinition: "Potássio alto demais no sangue. Pode ser perigoso para os batimentos do coração e acontece às vezes com remédios de pressão em quem tem rim fraco."
  },
  {
    term: "Angioedema",
    definition: "Inchaço profundo na pele, tecidos subcutâneos ou mucosas (lábios, língua, garganta). É um efeito colateral raro e grave de medicamentos como os inibidores da ECA.",
    simpleDefinition: "Inchaço muito grande e perigoso nos lábios, na língua ou na garganta que pode fechar a respiração. É uma reação alérgica muito rara de alguns remédios de pressão."
  }
];

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
  isSubtopic?: boolean;
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

// Medication item interface
interface MyMedicine {
  id: string;
  medicineName: string;
  dose: string;
  timesPerDay: string;
  times: string[];
  instructions: string;
  sourceEbookKey?: string;
}

// Medication adherence log interface
interface AdherenceLog {
  id: string;
  medicineName: string;
  dose: string;
  scheduledTime: string;
  date: string; // YYYY-MM-DD
  takenAt: string; // ISO string
  status: 'taken' | 'missed';
}

// Route parameters interface
interface RouteParams {
  livro?: string;
  categoria?: string;
  pagina?: number;
  novo?: boolean;
  explorar?: boolean;
  remedios?: boolean;
}

// Extract current route settings from URL query parameters
const getRouteFromURL = (): RouteParams => {
  const search = window.location.search;
  const params = new URLSearchParams(search);
  
  const livro = params.get('livro') || undefined;
  const categoria = params.get('categoria') || undefined;
  const paginaStr = params.get('pagina');
  const pagina = paginaStr ? parseInt(paginaStr, 10) : undefined;
  const novo = params.get('novo') === 'true';
  const explorar = params.get('explorar') === 'true';
  const remedios = params.get('remedios') === 'true';
  
  return { livro, categoria, pagina, novo, explorar, remedios };
};

// Update URL query parameters based on state route params
const updateURL = (route: RouteParams) => {
  const params = new URLSearchParams();
  if (route.novo) {
    params.set('novo', 'true');
  } else if (route.explorar) {
    params.set('explorar', 'true');
  } else if (route.remedios) {
    params.set('remedios', 'true');
  } else if (route.categoria) {
    params.set('categoria', route.categoria);
  } else if (route.livro) {
    params.set('livro', route.livro);
    if (route.pagina && route.pagina > 1) {
      params.set('pagina', route.pagina.toString());
    }
  }
  
  const queryString = params.toString();
  const newURL = queryString ? `?${queryString}` : window.location.pathname;
  
  const currentSearch = window.location.search;
  if (currentSearch !== `?${queryString}` && (currentSearch !== '' || queryString !== '')) {
    window.history.pushState(null, '', newURL);
  }
};

export default function App() {
  const [presets, setPresets] = useState<any[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<string>(() => {
    const route = getRouteFromURL();
    return route.livro || 'hipertensao_bra';
  });
  const [selectedCategory, setSelectedCategory] = useState<string | null>(() => {
    const route = getRouteFromURL();
    return route.categoria || null;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarInputVal, setSidebarInputVal] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showHome, setShowHome] = useState<boolean>(() => {
    const route = getRouteFromURL();
    return !(route.livro || route.categoria || route.novo || route.explorar || route.remedios);
  });
  const [homeSearchQuery, setHomeSearchQuery] = useState('');
  const [viewingTagResults, setViewingTagResults] = useState<boolean>(() => {
    const route = getRouteFromURL();
    return !!route.explorar;
  });

  const [sidebarFoldersCollapsed, setSidebarFoldersCollapsed] = useState(false);
  const [sidebarFavoritesCollapsed, setSidebarFavoritesCollapsed] = useState(false);
  const [sidebarHistoryCollapsed, setSidebarHistoryCollapsed] = useState(false);
  const [sidebarAccessibilityCollapsed, setSidebarAccessibilityCollapsed] = useState(false);

  const normalizeString = (str: string) => {
    return str ? str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : '';
  };

  const isMainTag = (query: string) => {
    const normalized = normalizeString(query).trim();
    if (normalized === 'pressao' || normalized === 'pressao alta' || normalized === 'hipertensao' || normalized === 'hipertensao arterial') {
      return 'hipertensao';
    }
    if (normalized === 'diabetes' || normalized === 'diabete' || normalized === 'diabetes mellitus' || normalized === 'acucar no sangue') {
      return 'diabetes';
    }
    if (normalized === 'colesterol' || normalized === 'colesterol alto' || normalized === 'dislipidemia' || normalized === 'gordura no sangue') {
      return 'colesterol';
    }
    return null;
  };

  const handleHomeSearch = (query: string) => {
    if (!query || !query.trim()) {
      setSelectedPreset(null);
      setSelectedCategory(null);
      setViewingTagResults(true);
      setIsCustomMode(false);
      setShowHome(false);
      setSearchQuery('');
      setHomeSearchQuery('');
      setSidebarInputVal('');
      setSidebarOpen(true);
      return;
    }

    const mainCat = isMainTag(query);
    if (mainCat) {
      setSelectedCategory(mainCat);
      setSearchQuery('');
      setHomeSearchQuery('');
      setSidebarInputVal('');
      setShowHome(false);
      setSidebarOpen(true);
      setOpenFolders(prev => ({ ...prev, [mainCat]: true }));
      setViewingTagResults(false);
      return;
    }

    setSearchQuery(query);
    setHomeSearchQuery(query);
    setSidebarInputVal(query);
    setSelectedCategory(null);
    setShowHome(false);
    setSidebarOpen(true);
    setViewingTagResults(true);
  };

  const handleSidebarSearchRealTime = (val: string) => {
    setSidebarInputVal(val);
    
    // Se estiver lendo um e-book ou com uma pasta selecionada no centro da tela,
    // a busca NÃO deve ser em tempo real (só buscará ao apertar Enter).
    if (currentEbook !== null || selectedCategory !== null) {
      return;
    }

    const trimmed = val.trim();
    if (trimmed === '') {
      setSearchQuery('');
      setViewingTagResults(true);
      setSelectedCategory(null);
      setIsCustomMode(false);
      setShowHome(false);
      setHomeSearchQuery('');
    } else {
      setSearchQuery(val);
      setViewingTagResults(true);
      setShowHome(false);
      setIsCustomMode(false);
      setSelectedCategory(null);
    }
  };

  const handleSidebarSearch = (query: string) => {
    const trimmed = query.trim();
    setSearchQuery(query);
    setSidebarInputVal(query);

    if (trimmed === '') {
      setViewingTagResults(true);
      setSelectedCategory(null);
      setIsCustomMode(false);
      setShowHome(false);
      setHomeSearchQuery('');
      setCurrentEbook(null);
      return;
    }

    // Check if there is an exact or close match for a preset medicineName or key
    const normalizedQuery = normalizeString(query).trim();
    const exactPreset = presets.find(p => {
      const pName = normalizeString(p.medicineName || '').trim();
      const pKey = normalizeString(p.key || '').trim();
      return pName === normalizedQuery || pKey === normalizedQuery;
    });

    if (exactPreset) {
      setViewingTagResults(false);
      handlePresetSelect(exactPreset.key);
      setSearchQuery('');
      setSidebarInputVal('');
      return;
    }

    const mainCat = isMainTag(query);
    if (mainCat) {
      setSelectedCategory(mainCat);
      setSearchQuery('');
      setSidebarInputVal('');
      setOpenFolders(prev => ({ ...prev, [mainCat]: true }));
      setShowHome(false);
      setIsCustomMode(false);
      setViewingTagResults(false);
      setCurrentEbook(null);
    } else {
      setViewingTagResults(true);
      setShowHome(false);
      setIsCustomMode(false);
      setSelectedCategory(null);
      setCurrentEbook(null);
    }
  };

  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>(() => {
    const route = getRouteFromURL();
    return {
      hipertensao: route.categoria === 'hipertensao' || !route.categoria,
      diabetes: route.categoria === 'diabetes',
      colesterol: route.categoria === 'colesterol'
    };
  });

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
      return isSimple ? 'Sartanas (Losartana...)' : 'Bloqueadores dos Receptores de Angiotensina (BRAs)';
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
  const [isCustomMode, setIsCustomMode] = useState<boolean>(() => {
    const route = getRouteFromURL();
    return !!route.novo;
  });
  const [dragActive, setDragActive] = useState(false);
  const [simulatedFile, setSimulatedFile] = useState<{name: string, size: string} | null>(null);

  // Accessibility Settings
  const [accessibilitySettings, setAccessibilitySettings] = useState({
    simpleLanguage: true,
    colorfulPictograms: true,
    largeFont: false
  });

  // Dark Mode State
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('dark_mode');
      return saved ? JSON.parse(saved) : false;
    } catch (e) {
      return false;
    }
  });

  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const newVal = !prev;
      try {
        localStorage.setItem('dark_mode', JSON.stringify(newVal));
        if (auth.currentUser) {
          updateDoc(doc(db, 'users', auth.currentUser.uid), {
            darkMode: newVal
          }).catch(err => console.error(err));
        }
      } catch (e) {}
      return newVal;
    });
  };

  // Firebase Auth State
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [authName, setAuthName] = useState<string>('');
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'signup'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authConfirmPassword, setAuthConfirmPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);

  // Favorites State (E-books & Folders)
  const [favoriteEbooks, setFavoriteEbooks] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('favorite_ebooks');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [favoriteFolders, setFavoriteFolders] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('favorite_folders');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [recentViews, setRecentViews] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('recent_views');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [showMyMedicines, setShowMyMedicines] = useState<boolean>(() => {
    const route = getRouteFromURL();
    return !!route.remedios;
  });

  const [showProfile, setShowProfile] = useState<boolean>(false);

  const [myMedicines, setMyMedicines] = useState<MyMedicine[]>(() => {
    try {
      const saved = localStorage.getItem('my_medicines');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Prescription editing form state
  const [isAddingMedicine, setIsAddingMedicine] = useState(false);
  const [editingMedicineId, setEditingMedicineId] = useState<string | null>(null);
  const [recipeName, setRecipeName] = useState('');
  const [recipeDose, setRecipeDose] = useState('');
  const [recipeTimesPerDay, setRecipeTimesPerDay] = useState('1');
  const [recipeTimes, setRecipeTimes] = useState<string[]>(['08:00']);
  const [recipeInstructions, setRecipeInstructions] = useState('');

  // Active Alarm State
  const [activeAlarm, setActiveAlarm] = useState<{
    id: string;
    medicineName: string;
    dose: string;
    time: string;
    instructions: string;
  } | null>(null);

  // Keep track of triggered alarms
  const [triggeredAlarms, setTriggeredAlarms] = useState<string[]>([]);

  // Adherence Logs State
  const [adherenceLogs, setAdherenceLogs] = useState<AdherenceLog[]>(() => {
    try {
      const saved = localStorage.getItem('adherence_logs');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const saveAdherenceLogs = async (updatedLogs: AdherenceLog[]) => {
    setAdherenceLogs(updatedLogs);
    try {
      localStorage.setItem('adherence_logs', JSON.stringify(updatedLogs));
      if (auth.currentUser) {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          adherenceLogs: updatedLogs
        });
      }
    } catch (e) {
      console.error('Error saving adherence logs:', e);
    }
  };

  const logDoseTaken = async (medicineName: string, dose: string, scheduledTime: string) => {
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    
    // Check if this specific dose is already logged as taken today
    const isAlreadyLogged = adherenceLogs.some(
      log => log.medicineName === medicineName && 
             log.scheduledTime === scheduledTime && 
             log.date === dateStr &&
             log.status === 'taken'
    );
    
    if (isAlreadyLogged) return;

    const newLog: AdherenceLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      medicineName,
      dose: dose || 'Dose padrão',
      scheduledTime,
      date: dateStr,
      takenAt: now.toISOString(),
      status: 'taken'
    };

    const updatedLogs = [newLog, ...adherenceLogs];
    await saveAdherenceLogs(updatedLogs);
  };

  const getMonthlyCompliance = () => {
    if (myMedicines.length === 0 && Object.keys(reminders).length === 0) {
      return 100;
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    let startDate = new Date(currentYear, currentMonth, 1);
    
    if (adherenceLogs.length > 0) {
      const logDates = adherenceLogs.map(log => {
        // Ensure date is parsed correctly in local timezone
        const [y, m, d] = log.date.split('-').map(Number);
        return new Date(y, m - 1, d);
      });
      const earliestLogDate = new Date(Math.min(...logDates.map(d => d.getTime())));
      
      if (earliestLogDate > startDate && earliestLogDate <= now) {
        startDate = new Date(earliestLogDate.getFullYear(), earliestLogDate.getMonth(), earliestLogDate.getDate());
      }
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }

    let totalScheduled = 0;
    let totalTaken = 0;

    const days: string[] = [];
    let tempDate = new Date(startDate);
    
    while (tempDate <= now) {
      const yyyy = tempDate.getFullYear();
      const mm = String(tempDate.getMonth() + 1).padStart(2, '0');
      const dd = String(tempDate.getDate()).padStart(2, '0');
      days.push(`${yyyy}-${mm}-${dd}`);
      tempDate.setDate(tempDate.getDate() + 1);
    }

    days.forEach(day => {
      myMedicines.forEach(med => {
        totalScheduled += med.times.length;
      });
      totalScheduled += Object.keys(reminders).length;
    });

    adherenceLogs.forEach(log => {
      if (log.status === 'taken') {
        const [y, m, d] = log.date.split('-').map(Number);
        const logDate = new Date(y, m - 1, d);
        const startCompare = new Date(startDate);
        logDate.setHours(0,0,0,0);
        startCompare.setHours(0,0,0,0);
        const endCompare = new Date(now);
        endCompare.setHours(23,59,59,999);
        
        if (logDate >= startCompare && logDate <= endCompare) {
          totalTaken++;
        }
      }
    });

    if (totalScheduled === 0) return 100;
    return Math.min(100, Math.round((totalTaken / totalScheduled) * 100));
  };

  const getTodaysScheduledDoses = () => {
    const doses: Array<{
      medicineName: string;
      dose: string;
      time: string;
      type: 'custom' | 'ebook';
      id: string;
    }> = [];

    // 1. From custom medicines (myMedicines)
    myMedicines.forEach(med => {
      med.times.forEach(t => {
        doses.push({
          medicineName: med.medicineName,
          dose: med.dose || 'Dose padrão',
          time: t,
          type: 'custom',
          id: `${med.id}_${t}`
        });
      });
    });

    // 2. From book reminders
    Object.entries(reminders).forEach(([key, time]) => {
      const idx = key.indexOf('_');
      const medicineName = idx !== -1 ? key.substring(0, idx) : 'Medicamento';
      const sectionTitle = idx !== -1 ? key.substring(idx + 1) : key;
      doses.push({
        medicineName: sectionTitle,
        dose: `Lembrete do livro de ${medicineName}`,
        time: time as string,
        type: 'ebook',
        id: `${key}_${time}`
      });
    });

    // Sort chronologically by time
    return doses.sort((a, b) => a.time.localeCompare(b.time));
  };

  const isDoseTakenToday = (medicineName: string, time: string) => {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    return adherenceLogs.some(
      log => log.medicineName.toLowerCase() === medicineName.toLowerCase() && 
             log.scheduledTime === time && 
             log.date === todayStr &&
             log.status === 'taken'
    );
  };

  const getDoseTakenTimeToday = (medicineName: string, time: string) => {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const log = adherenceLogs.find(
      log => log.medicineName.toLowerCase() === medicineName.toLowerCase() && 
             log.scheduledTime === time && 
             log.date === todayStr &&
             log.status === 'taken'
    );
    if (!log) return '';
    try {
      const d = new Date(log.takenAt);
      return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    } catch (e) {
      return '';
    }
  };

  const saveMyMedicines = async (updatedMedicines: MyMedicine[]) => {
    setMyMedicines(updatedMedicines);
    try {
      localStorage.setItem('my_medicines', JSON.stringify(updatedMedicines));
      if (auth.currentUser) {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          myMedicines: updatedMedicines
        });
      }
    } catch (e) {
      console.error('Error saving medicines:', e);
    }
  };

  // Reminders State (Medication Alarms)
  const [reminders, setReminders] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('medication_reminders');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const saveReminder = async (key: string, time: string) => {
    const updated = { ...reminders };
    if (time) {
      updated[key] = time;
    } else {
      delete updated[key];
    }
    setReminders(updated);
    try {
      localStorage.setItem('medication_reminders', JSON.stringify(updated));
      if (auth.currentUser) {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          reminders: updated
        });
      }

      // Automatically import to myMedicines list
      if (time && currentEbook) {
        const alreadyExists = myMedicines.some(m => m.medicineName.toLowerCase() === currentEbook.medicineName.toLowerCase());
        if (!alreadyExists) {
          const newMed: MyMedicine = {
            id: 'import_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            medicineName: currentEbook.medicineName,
            dose: 'Ver posologia no livrinho',
            timesPerDay: '1',
            times: [time],
            instructions: 'Importado automaticamente do guia de posologia do livro.',
            sourceEbookKey: selectedPreset
          };
          await saveMyMedicines([...myMedicines, newMed]);
        } else {
          // Update the times if medicine already exists in list
          const updatedMeds = myMedicines.map(m => {
            if (m.medicineName.toLowerCase() === currentEbook.medicineName.toLowerCase()) {
              const updatedTimes = m.times.includes(time) ? m.times : [...m.times, time].sort();
              return {
                ...m,
                times: updatedTimes,
                timesPerDay: updatedTimes.length.toString()
              };
            }
            return m;
          });
          await saveMyMedicines(updatedMeds);
        }
      }
    } catch (e) {
      console.error('Error saving reminder:', e);
    }
  };

  const isPosologySection = (section: any, page: any) => {
    if (!section || !page) return false;
    const titleLower = (section.title || '').toLowerCase();
    const contentLower = (section.content || '').toLowerCase();
    const pageTitleLower = (page.title || '').toLowerCase();
    
    return (
      section.icon === 'Pill' ||
      section.icon === 'Clock' ||
      titleLower.includes('posologia') ||
      titleLower.includes('como tomar') ||
      titleLower.includes('dose') ||
      titleLower.includes('dosagem') ||
      contentLower.includes('posologia') ||
      contentLower.includes('como tomar') ||
      contentLower.includes('dose') ||
      contentLower.includes('dosagem') ||
      pageTitleLower.includes('posologia') ||
      pageTitleLower.includes('como tomar') ||
      pageTitleLower.includes('remediose')
    );
  };

  // Track Auth Changes and Sync
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.name) {
              setUserName(data.name);
            } else {
              setUserName(currentUser.displayName || '');
            }
            if (data.favoriteEbooks) {
              setFavoriteEbooks(data.favoriteEbooks);
              localStorage.setItem('favorite_ebooks', JSON.stringify(data.favoriteEbooks));
            }
            if (data.favoriteFolders) {
              setFavoriteFolders(data.favoriteFolders);
              localStorage.setItem('favorite_folders', JSON.stringify(data.favoriteFolders));
            }
            if (data.reminders) {
              setReminders(data.reminders);
              localStorage.setItem('medication_reminders', JSON.stringify(data.reminders));
            }
            if (data.myMedicines) {
              setMyMedicines(data.myMedicines);
              localStorage.setItem('my_medicines', JSON.stringify(data.myMedicines));
            }
            if (data.adherenceLogs) {
              setAdherenceLogs(data.adherenceLogs);
              localStorage.setItem('adherence_logs', JSON.stringify(data.adherenceLogs));
            }
            if (typeof data.darkMode === 'boolean') {
              setDarkMode(data.darkMode);
              localStorage.setItem('dark_mode', JSON.stringify(data.darkMode));
            }
          } else {
            // Document does not exist yet, bootstrap it
            await setDoc(doc(db, 'users', currentUser.uid), {
              email: currentUser.email || '',
              name: currentUser.displayName || '',
              createdAt: serverTimestamp(),
              favoriteFolders: favoriteFolders,
              favoriteEbooks: favoriteEbooks,
              reminders: reminders,
              myMedicines: myMedicines,
              adherenceLogs: adherenceLogs,
              darkMode: darkMode
            });
            setUserName(currentUser.displayName || '');
          }
        } catch (e) {
          console.error("Error fetching user data from Firestore:", e);
        }
      } else {
        setUserName('');
        setAuthName('');
      }
    });
    return unsubscribe;
  }, []);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    if (!authName.trim()) {
      setAuthError('Por favor, informe seu Nome Completo.');
      return;
    }
    if (!authEmail || !authPassword) {
      setAuthError('Por favor, preencha todos os campos.');
      return;
    }
    if (authPassword !== authConfirmPassword) {
      setAuthError('As senhas não coincidem.');
      return;
    }
    if (authPassword.length < 6) {
      setAuthError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    setAuthSubmitting(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, authEmail, authPassword);
      const newUser = userCredential.user;
      
      await setDoc(doc(db, 'users', newUser.uid), {
        email: authEmail,
        name: authName.trim(),
        createdAt: serverTimestamp(),
        favoriteFolders: favoriteFolders,
        favoriteEbooks: favoriteEbooks,
        reminders: reminders,
        myMedicines: myMedicines,
        adherenceLogs: adherenceLogs,
        darkMode: darkMode
      });
      setUserName(authName.trim());

      setAuthSuccess('Cadastro realizado com sucesso!');
      setTimeout(() => {
        setAuthModalOpen(false);
        setAuthName('');
        setAuthEmail('');
        setAuthPassword('');
        setAuthConfirmPassword('');
        setAuthSuccess('');
      }, 1500);
    } catch (err: any) {
      console.error("Sign up error:", err);
      if (err.code === 'auth/email-already-in-use') {
        setAuthError('Este e-mail já está em uso.');
      } else if (err.code === 'auth/invalid-email') {
        setAuthError('E-mail inválido.');
      } else if (err.code === 'auth/weak-password') {
        setAuthError('Senha muito fraca.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setAuthError('O método de cadastro por e-mail/senha não está ativo no Firebase. Ative "E-mail/senha" em Authentication > Sign-in method no seu Console do Firebase.');
      } else {
        setAuthError('Ocorreu um erro ao cadastrar. Verifique a configuração do seu Firebase.');
      }
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setAuthError('');
    setAuthSuccess('');
    setAuthSubmitting(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      setAuthSuccess('Login com Google realizado com sucesso!');
      setTimeout(() => {
        setAuthModalOpen(false);
        setAuthSuccess('');
      }, 1500);
    } catch (err: any) {
      console.error("Google sign in error:", err);
      if (err.code === 'auth/popup-closed-by-user') {
        setAuthError('O login com Google foi cancelado.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setAuthError('O login com Google não está ativo no seu projeto Firebase. Ative o provedor "Google" em Authentication > Sign-in method no seu Console do Firebase.');
      } else {
        setAuthError('Ocorreu um erro ao fazer login com o Google.');
      }
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    if (!authEmail || !authPassword) {
      setAuthError('Por favor, preencha todos os campos.');
      return;
    }
    setAuthSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, authEmail, authPassword);
      setAuthSuccess('Login realizado com sucesso!');
      setTimeout(() => {
        setAuthModalOpen(false);
        setAuthEmail('');
        setAuthPassword('');
        setAuthSuccess('');
      }, 1500);
    } catch (err: any) {
      console.error("Login error:", err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setAuthError('E-mail ou senha incorretos.');
      } else {
        setAuthError('Ocorreu um erro ao fazer login. Tente novamente.');
      }
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setFavoriteFolders([]);
      setFavoriteEbooks([]);
      localStorage.removeItem('favorite_folders');
      localStorage.removeItem('favorite_ebooks');
    } catch (e) {
      console.error("Error signing out:", e);
    }
  };

  const toggleFavoriteEbook = (key: string) => {
    if (!key) return;
    setFavoriteEbooks(prev => {
      const updated = prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key];
      localStorage.setItem('favorite_ebooks', JSON.stringify(updated));
      if (auth.currentUser) {
        updateDoc(doc(db, 'users', auth.currentUser.uid), {
          favoriteEbooks: updated
        }).catch(err => console.error(err));
      }
      return updated;
    });
  };

  const toggleFavoriteFolder = (id: string) => {
    if (!id) return;
    setFavoriteFolders(prev => {
      const updated = prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id];
      localStorage.setItem('favorite_folders', JSON.stringify(updated));
      if (auth.currentUser) {
        updateDoc(doc(db, 'users', auth.currentUser.uid), {
          favoriteFolders: updated
        }).catch(err => console.error(err));
      }
      return updated;
    });
  };

  // Medical Glossary state
  const [glossarySearch, setGlossarySearch] = useState('');
  const [expandedGlossaryTerm, setExpandedGlossaryTerm] = useState<string | null>(null);
  const [glossaryReading, setGlossaryReading] = useState<string | null>(null);
  const [glossaryMinimized, setGlossaryMinimized] = useState(false);
  const [summaryMinimized, setSummaryMinimized] = useState(false);
  const [summaryDropdownOpen, setSummaryDropdownOpen] = useState(false);

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
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(() => {
    const route = getRouteFromURL();
    return (route.pagina && route.pagina > 0) ? route.pagina - 1 : 0;
  });
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

  // Initialization is handled by the URL routing system below

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

  const loadPresetDetails = async (key: string, settings = accessibilitySettings) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/simplify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medicineName: key, accessibilitySettings: settings })
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
    setSelectedCategory(null);
    setViewingTagResults(false);
    setShowHome(false);
    setShowProfile(false);
    setShowMyMedicines(false);
    loadPresetDetails(key);
    
    // Automatically expand the folder of the selected preset
    const matchedPreset = presets.find(p => p.key === key);
    if (matchedPreset && matchedPreset.category) {
      setOpenFolders(prev => ({ ...prev, [matchedPreset.category]: true }));
    }

    // On mobile, automatically collapse sidebar to show the ebook immediately
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }

    // Update recently viewed history
    setRecentViews(prev => {
      const filtered = prev.filter(k => k !== key);
      const updated = [key, ...filtered].slice(0, 5); // Keep top 5
      try {
        localStorage.setItem('recent_views', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
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
    setGlossaryReading(null);
  };

  const isTermInPage = (term: string) => {
    if (!currentEbook || !currentEbook.pages[currentPageIndex]) return false;
    const page = currentEbook.pages[currentPageIndex];
    const textToScan = [
      page.title,
      page.description,
      ...page.sections.map(s => s.title + " " + s.content)
    ].join(" ").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    const normalizedTerm = term.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (textToScan.includes(normalizedTerm)) return true;
    
    // Synonyms and abbreviation logic
    if (normalizedTerm === "bras" && (textToScan.includes("bra") || textToScan.includes("sartana"))) return true;
    if (normalizedTerm === "inibidores da eca" && (textToScan.includes("eca") || textToScan.includes("pril"))) return true;
    if (normalizedTerm === "angiotensina ii" && textToScan.includes("angiotensina")) return true;
    if (normalizedTerm === "hipercalemia" && textToScan.includes("potassio")) return true;
    if (normalizedTerm === "mialgia" && textToScan.includes("dor muscular")) return true;
    if (normalizedTerm === "dislipidemia" && textToScan.includes("colesterol")) return true;

    return false;
  };

  const speakGlossaryTerm = (term: string, definition: string) => {
    if (glossaryReading === term) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setGlossaryReading(null);
      return;
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsReading(false); // Stop standard ebook page reader
      
      const textToRead = `${term}. Significado: ${definition}`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = 'pt-BR';
      utterance.rate = 1.0;
      utterance.onend = () => {
        setGlossaryReading(null);
      };
      utterance.onerror = () => {
        setGlossaryReading(null);
      };
      setGlossaryReading(term);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Apply route settings to state variables
  const applyRoute = async (route: RouteParams) => {
    setShowProfile(false);
    if (route.remedios) {
      setShowMyMedicines(true);
      setShowHome(false);
      setIsCustomMode(false);
      setSelectedCategory(null);
      setViewingTagResults(false);
      setCurrentEbook(null);
    } else if (route.explorar) {
      setShowMyMedicines(false);
      setViewingTagResults(true);
      setShowHome(false);
      setIsCustomMode(false);
      setSelectedCategory(null);
      setSearchQuery('');
    } else if (route.novo) {
      setShowMyMedicines(false);
      setViewingTagResults(false);
      setIsCustomMode(true);
      setShowHome(false);
      setSelectedCategory(null);
    } else if (route.categoria) {
      setShowMyMedicines(false);
      setViewingTagResults(false);
      setSelectedCategory(route.categoria);
      setShowHome(false);
      setIsCustomMode(false);
      setOpenFolders(prev => ({ ...prev, [route.categoria!]: true }));
    } else if (route.livro) {
      setShowMyMedicines(false);
      setViewingTagResults(false);
      setSelectedPreset(route.livro);
      setShowHome(false);
      setIsCustomMode(false);
      setSelectedCategory(null);
      
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/simplify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ medicineName: route.livro, accessibilitySettings })
        });
        if (res.ok) {
          const data = await res.json();
          setCurrentEbook(data);
          if (route.pagina && route.pagina > 0 && route.pagina <= data.pages.length) {
            setCurrentPageIndex(route.pagina - 1);
          } else {
            setCurrentPageIndex(0);
          }
          stopSpeaking();
        } else {
          throw new Error('Não foi possível carregar as informações do remédio.');
        }
      } catch (err: any) {
        setError(err.message || 'Erro de conexão');
      } finally {
        setIsLoading(false);
      }
    } else {
      setShowMyMedicines(false);
      setShowHome(true);
      setSelectedCategory(null);
      setIsCustomMode(false);
      setViewingTagResults(false);
      setCurrentEbook(null);
    }
  };

  // Load Presets and handle initial routing based on URL
  useEffect(() => {
    const init = async () => {
      await fetchPresets();
      const route = getRouteFromURL();
      await applyRoute(route);
    };
    init();
  }, []);

  // Reload current preset whenever the simple language mode is toggled
  useEffect(() => {
    if (selectedPreset) {
      loadPresetDetails(selectedPreset);
    }
  }, [accessibilitySettings.simpleLanguage]);

  // Listen to popstate (browser back/forward navigation)
  useEffect(() => {
    const handlePopState = () => {
      const route = getRouteFromURL();
      applyRoute(route);
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Sync state changes with URL query parameters
  useEffect(() => {
    const route: RouteParams = {};
    if (showHome) {
      // Home has no parameters
    } else if (showMyMedicines) {
      route.remedios = true;
    } else if (isCustomMode) {
      route.novo = true;
    } else if (viewingTagResults) {
      route.explorar = true;
    } else if (selectedCategory) {
      route.categoria = selectedCategory;
    } else if (selectedPreset) {
      route.livro = selectedPreset;
      if (currentPageIndex > 0) {
        route.pagina = currentPageIndex + 1;
      }
    }
    
    updateURL(route);
  }, [showHome, showMyMedicines, isCustomMode, selectedCategory, selectedPreset, currentPageIndex, viewingTagResults]);

  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const playTone = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.15, start + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
        
        osc.start(start);
        osc.stop(start + duration);
      };

      const now = ctx.currentTime;
      playTone(659.25, now, 0.4); // E5
      playTone(880.00, now + 0.2, 0.6); // A5
    } catch (e) {
      console.warn('Audio play failed:', e);
    }
  };

  // Real-Time Alarm Clock Check
  useEffect(() => {
    const checkAlarms = () => {
      const now = new Date();
      const HH = String(now.getHours()).padStart(2, '0');
      const MM = String(now.getMinutes()).padStart(2, '0');
      const timeStr = `${HH}:${MM}`;
      
      const currentMinuteKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}_${timeStr}`;

      // 1. Check reminders from ebooks
      Object.entries(reminders).forEach(([key, alarmTime]) => {
        if (alarmTime === timeStr) {
          const alarmId = `reminder_${key}_${currentMinuteKey}`;
          if (!triggeredAlarms.includes(alarmId)) {
            const index = key.indexOf('_');
            const medName = index !== -1 ? key.substring(0, index) : 'Medicamento';
            const secTitle = index !== -1 ? key.substring(index + 1) : key;

            setTriggeredAlarms(prev => [...prev, alarmId]);
            setActiveAlarm({
              id: alarmId,
              medicineName: medName,
              dose: 'Dose especificada no livrinho (' + secTitle + ')',
              time: alarmTime,
              instructions: 'Lembrete configurado através do E-book interativo.'
            });
            playChime();
          }
        }
      });

      // 2. Check myMedicines recipe times
      myMedicines.forEach(med => {
        med.times.forEach(alarmTime => {
          if (alarmTime === timeStr) {
            const alarmId = `medicine_${med.id}_${alarmTime}_${currentMinuteKey}`;
            if (!triggeredAlarms.includes(alarmId)) {
              setTriggeredAlarms(prev => [...prev, alarmId]);
              setActiveAlarm({
                id: alarmId,
                medicineName: med.medicineName,
                dose: med.dose,
                time: alarmTime,
                instructions: med.instructions
              });
              playChime();
            }
          }
        });
      });
    };

    // Check immediately and then every 10 seconds
    checkAlarms();
    const interval = setInterval(checkAlarms, 10000);
    return () => clearInterval(interval);
  }, [reminders, myMedicines, triggeredAlarms]);

  const downloadEbookPDF = () => {
    if (!currentEbook) return;
    
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);

    // Dynamic brand theme color palette matching the website presets
    const themeColors: Record<string, { primary: [number, number, number], dark: [number, number, number], light: [number, number, number], text: [number, number, number] }> = {
      emerald: {
        primary: [16, 185, 129], // emerald-500
        dark: [6, 95, 70],       // emerald-800
        light: [240, 253, 244],  // emerald-50
        text: [6, 78, 59]         // emerald-900
      },
      green: {
        primary: [34, 197, 94],  // green-500
        dark: [20, 83, 45],       // green-800
        light: [240, 253, 244],  // green-50
        text: [20, 70, 35]        // green-900
      },
      amber: {
        primary: [245, 158, 11],  // amber-500
        dark: [120, 53, 4],       // amber-800
        light: [254, 243, 199],  // amber-100
        text: [120, 53, 4]        // amber-950
      },
      rose: {
        primary: [244, 63, 94],   // rose-500
        dark: [159, 18, 57],      // rose-800
        light: [255, 241, 242],  // rose-50
        text: [136, 19, 55]       // rose-900
      },
      indigo: {
        primary: [79, 70, 229],   // indigo-600
        dark: [49, 46, 129],      // indigo-900
        light: [238, 242, 255],  // indigo-50
        text: [49, 46, 129]       // indigo-950
      },
      blue: {
        primary: [37, 99, 235],   // blue-600
        dark: [30, 58, 138],      // blue-900
        light: [239, 246, 255],  // blue-50
        text: [30, 58, 138]       // blue-950
      }
    };

    // Card/section color presets based on section category/type
    const sectionColors: Record<string, { bg: [number, number, number], border: [number, number, number], text: [number, number, number], iconColor: [number, number, number] }> = {
      success: {
        bg: [240, 253, 244],     // emerald-50
        border: [186, 230, 206], // emerald-200
        text: [6, 95, 70],        // emerald-800
        iconColor: [16, 185, 129] // emerald-500
      },
      warning: {
        bg: [255, 241, 242],     // rose-50
        border: [254, 205, 211], // rose-200
        text: [159, 18, 57],      // rose-800
        iconColor: [244, 63, 94]  // rose-500
      },
      info: {
        bg: [239, 246, 255],     // blue-50
        border: [191, 219, 254], // blue-200
        text: [30, 58, 138],      // blue-800
        iconColor: [37, 99, 235]  // blue-500
      },
      default: {
        bg: [248, 250, 252],     // slate-50
        border: [226, 232, 240], // slate-200
        text: [51, 65, 85],       // slate-700
        iconColor: [100, 116, 139] // slate-500
      }
    };

    // Get color profile for the active ebook category
    const activeThemeColors = themeColors[themeKey] || themeColors.indigo;

    let currentY = 30;

    // Helper to draw the mock printed white card background
    const drawPageCardBackground = (pIndex: number) => {
      // Background canvas (slate-100)
      doc.setFillColor(241, 245, 249);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');

      // Mock Printed Book Card Box
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.setLineWidth(0.4);
      doc.roundedRect(12, 15, 186, 267, 5, 5, 'FD');

      // Header inside the card container
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(156, 163, 175); // gray-400
      doc.text("Guia Ilustrado MediQuês", 18, 22);
      
      const categoryLabel = "Saúde Descomplicada";
      doc.text(categoryLabel, 192 - doc.getTextWidth(categoryLabel), 22);

      // Accent separator line
      doc.setDrawColor(241, 245, 249);
      doc.setLineWidth(0.2);
      doc.line(18, 24, 192, 24);

      // Pill accent bar representing dynamic medicine category
      doc.setFillColor(activeThemeColors.light[0], activeThemeColors.light[1], activeThemeColors.light[2]);
      doc.roundedRect(18, 28, 25, 3, 1.5, 1.5, 'F');
      
      doc.setFillColor(activeThemeColors.primary[0], activeThemeColors.primary[1], activeThemeColors.primary[2]);
      doc.roundedRect(18, 28, 4, 3, 1.5, 1.5, 'F');
      doc.rect(20, 28, 2, 3, 'F');

      // Footer page number and copyright inside the card container
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(156, 163, 175);
      doc.text(`Página ${pIndex + 1} de ${currentEbook.pages.length}`, 192 - doc.getTextWidth(`Página ${pIndex + 1} de ${currentEbook.pages.length}`), 274);
      doc.text("© MediQuês - Material Educativo de Saúde", 18, 274);
    };

    // --- PAGE 1: COVER PAGE ---
    // Full-page thematic background tint
    doc.setFillColor(activeThemeColors.light[0], activeThemeColors.light[1], activeThemeColors.light[2]);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    
    // Border design
    doc.setDrawColor(activeThemeColors.primary[0], activeThemeColors.primary[1], activeThemeColors.primary[2]);
    doc.setLineWidth(1);
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20, 'D');

    // Colored Header bar
    doc.setFillColor(activeThemeColors.primary[0], activeThemeColors.primary[1], activeThemeColors.primary[2]);
    doc.rect(10, 10, pageWidth - 20, 26, 'F');

    // Brand Label
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    const headerText = "MEDIQUÊS  •  SAÚDE DESCOMPLICADA";
    const headerTextX = (pageWidth - doc.getTextWidth(headerText)) / 2;
    doc.text(headerText, headerTextX, 26);

    // Book Main Title
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(28);
    doc.setTextColor(activeThemeColors.dark[0], activeThemeColors.dark[1], activeThemeColors.dark[2]);
    
    const displayTitle = getPresetDisplayName(selectedPreset, accessibilitySettings.simpleLanguage, currentEbook.medicineName);
    const titleLines = doc.splitTextToSize(`Guia Prático: ${displayTitle}`, contentWidth);
    doc.text(titleLines, 20, 75);
    
    let coverY = 75 + (titleLines.length * 11);

    // Stylish divider rule
    doc.setFillColor(activeThemeColors.primary[0], activeThemeColors.primary[1], activeThemeColors.primary[2]);
    doc.rect(20, coverY, 45, 2, 'F');
    coverY += 12;

    // Subtitle
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(14);
    doc.setTextColor(activeThemeColors.text[0], activeThemeColors.text[1], activeThemeColors.text[2]);
    
    const displaySubtitle = getPresetDisplaySubtitle(selectedPreset, accessibilitySettings.simpleLanguage, currentEbook.subtitle);
    const subtitleLines = doc.splitTextToSize(displaySubtitle, contentWidth);
    doc.text(subtitleLines, 20, coverY);
    
    coverY += (subtitleLines.length * 7) + 15;

    // "Premium digital guide" badge
    doc.setFillColor(activeThemeColors.primary[0], activeThemeColors.primary[1], activeThemeColors.primary[2]);
    doc.roundedRect(20, coverY, 52, 9, 2, 2, 'F');
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text("GUIA DIGITAL COMPLETO", 24, coverY + 6);
    
    coverY += 22;

    // Description / Introduction paragraph in high-contrast styling
    doc.setFont('Helvetica', 'oblique');
    doc.setFontSize(11);
    doc.setTextColor(71, 85, 105); // slate-600
    const firstPageDesc = currentEbook.pages[0]?.description || '';
    const splitIntro = doc.splitTextToSize(firstPageDesc, contentWidth);
    doc.text(splitIntro, 20, coverY);

    // Cover page footer disclaimer and attribution
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(activeThemeColors.dark[0], activeThemeColors.dark[1], activeThemeColors.dark[2]);
    doc.text("Este material tem caráter estritamente educativo.", 20, pageHeight - 24);
    
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text("Desenvolvido por MediQuês • Todos os direitos reservados", 20, pageHeight - 19);

    // --- OTHER CONTENT PAGES ---
    currentEbook.pages.forEach((page, index) => {
      doc.addPage();
      drawPageCardBackground(index);
      
      currentY = 38;

      // Page Title
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(15, 23, 42); // slate-900
      doc.text(page.title, 18, currentY);

      // Underline decorative line
      doc.setDrawColor(241, 245, 249);
      doc.setLineWidth(0.4);
      doc.line(18, 41, 192, 41);

      currentY = 47;

      // Page Description in elegant italic/serif-like font
      doc.setFont('Helvetica', 'oblique');
      doc.setFontSize(10.5);
      doc.setTextColor(71, 85, 105); // slate-600
      const splitPageDesc = doc.splitTextToSize(page.description, 174);
      doc.text(splitPageDesc, 18, currentY);
      
      currentY += (splitPageDesc.length * 4.8) + 6;

      // Dynamic page splitter checker inside section loop
      const checkSpaceAndGrow = (neededHeight: number) => {
        if (currentY + neededHeight > 262) {
          doc.addPage();
          drawPageCardBackground(index);
          currentY = 36; // Start fresh position inside the white card container
          return true;
        }
        return false;
      };

      // Page Sections
      page.sections.forEach((section) => {
        const isSub = section.isSubtopic;
        const cardX = isSub ? 30 : 18;
        const cardW = isSub ? 150 : 174;

        const secType = section.type || 'default';
        const colors = sectionColors[secType] || sectionColors.default;

        // Split paragraph to fit the content container width
        const textWidth = cardW - 20;
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(9);
        const splitContent = doc.splitTextToSize(section.content, textWidth);
        
        // Calculate dynamic card height: padding top + title height + body text lines + padding bottom
        const cardH = 9 + (splitContent.length * 4.2) + 5;

        // Check overflow and wrap onto a new page if necessary
        checkSpaceAndGrow(cardH + 4);

        // Draw card base with correct background fill and border strokes
        doc.setFillColor(colors.bg[0], colors.bg[1], colors.bg[2]);
        doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
        doc.setLineWidth(0.35);

        if (isSub) {
          // Subtopics get a beautiful dashed line representation exactly like the website
          doc.setLineDashPattern([2, 1.5], 0);
        } else {
          doc.setLineDashPattern([], 0);
        }

        doc.roundedRect(cardX, currentY, cardW, cardH, 3, 3, 'FD');
        // Reset dash pattern instantly
        doc.setLineDashPattern([], 0);

        // Draw mini graphic icon container
        const iconX = cardX + 4;
        const iconY = currentY + 4;
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
        doc.setLineWidth(0.25);
        doc.roundedRect(iconX, iconY, 8, 8, 1.5, 1.5, 'FD');

        // Draw neat geometric glyph to represent the icon
        const cx = iconX + 4;
        const cy = iconY + 4;
        doc.setDrawColor(colors.iconColor[0], colors.iconColor[1], colors.iconColor[2]);
        doc.setLineWidth(0.65);

        if (secType === 'success') {
          // Handcrafted checkmark path
          doc.line(cx - 1.8, cy, cx - 0.5, cy + 1.6);
          doc.line(cx - 0.5, cy + 1.6, cx + 2, cy - 1.4);
        } else if (secType === 'warning') {
          // Exclamation mark !
          doc.setFillColor(colors.iconColor[0], colors.iconColor[1], colors.iconColor[2]);
          doc.rect(cx - 0.4, cy - 2.2, 0.8, 2.5, 'F');
          doc.circle(cx, cy + 1.4, 0.4, 'F');
        } else if (secType === 'info') {
          // Letter 'i'
          doc.setFillColor(colors.iconColor[0], colors.iconColor[1], colors.iconColor[2]);
          doc.circle(cx, cy - 1.8, 0.4, 'F');
          doc.rect(cx - 0.4, cy - 0.8, 0.8, 2.6, 'F');
        } else {
          // Tiny bullet circle
          doc.setFillColor(colors.iconColor[0], colors.iconColor[1], colors.iconColor[2]);
          doc.circle(cx, cy, 1.2, 'F');
        }

        // Section Title text
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
        doc.text(section.title, cardX + 15, currentY + 8.5);

        // Section Content text
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(51, 65, 85); // slate-700
        doc.text(splitContent, cardX + 15, currentY + 13.5);

        // Space out card list
        currentY += cardH + 4.5;
      });
    });

    // Save generated book PDF
    const filename = `Guia_Simplificado_${currentEbook.medicineName.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
    doc.save(filename);
  };

  const downloadMedicinesPDF = () => {
    if (myMedicines.length === 0) return;
    
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);

    const themeColors: Record<string, { primary: [number, number, number], dark: [number, number, number], light: [number, number, number], text: [number, number, number] }> = {
      emerald: {
        primary: [16, 185, 129], // emerald-500
        dark: [6, 95, 70],       // emerald-800
        light: [240, 253, 244],  // emerald-50
        text: [6, 78, 59]         // emerald-900
      },
      green: {
        primary: [34, 197, 94],  // green-500
        dark: [20, 83, 45],       // green-800
        light: [240, 253, 244],  // green-50
        text: [20, 70, 35]        // green-900
      },
      amber: {
        primary: [245, 158, 11],  // amber-500
        dark: [120, 53, 4],       // amber-800
        light: [254, 243, 199],  // amber-100
        text: [120, 53, 4]        // amber-950
      },
      rose: {
        primary: [244, 63, 94],   // rose-500
        dark: [159, 18, 57],      // rose-800
        light: [255, 241, 242],  // rose-50
        text: [136, 19, 55]       // rose-900
      },
      indigo: {
        primary: [79, 70, 229],   // indigo-600
        dark: [49, 46, 129],      // indigo-900
        light: [238, 242, 255],  // indigo-50
        text: [49, 46, 129]       // indigo-950
      },
      blue: {
        primary: [37, 99, 235],   // blue-600
        dark: [30, 58, 138],      // blue-900
        light: [239, 246, 255],  // blue-50
        text: [30, 58, 138]       // blue-950
      }
    };

    const activeThemeColors = themeColors[themeKey] || themeColors.indigo;
    let pageCount = 1;

    const drawPageDecoration = (pNum: number) => {
      // Background canvas (slate-50)
      doc.setFillColor(248, 250, 252);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');

      // Card Container Box
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.setLineWidth(0.4);
      doc.roundedRect(margin, margin, contentWidth, pageHeight - (margin * 2), 4, 4, 'FD');

      // Header inside the card container
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text("MediQuês • Minha Receita & Medicamentos", margin + 6, margin + 8);
      
      const dateStr = new Date().toLocaleDateString('pt-BR');
      doc.text(`Gerado em ${dateStr}`, margin + contentWidth - 6 - doc.getTextWidth(`Gerado em ${dateStr}`), margin + 8);

      // Accent separator line
      doc.setDrawColor(241, 245, 249);
      doc.setLineWidth(0.2);
      doc.line(margin + 6, margin + 11, margin + contentWidth - 6, margin + 11);

      // Footer page number and copyright inside the card container
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text("Aviso: Siga sempre as orientações do seu médico e farmacêutico antes de fazer alterações na terapia.", margin + 6, pageHeight - margin - 6);
      
      const pageStr = `Página ${pNum}`;
      doc.text(pageStr, margin + contentWidth - 6 - doc.getTextWidth(pageStr), pageHeight - margin - 6);
    };

    // Draw first page decoration
    drawPageDecoration(pageCount);

    let currentY = margin + 18;

    // Title of the Recipe
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(activeThemeColors.dark[0], activeThemeColors.dark[1], activeThemeColors.dark[2]);
    doc.text("MINHA LISTA DE MEDICAMENTOS", margin + 6, currentY);
    currentY += 6;

    // Subtitle / Patient details
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105); // slate-600
    const patientName = userName || (user ? (user.displayName || user.email || 'Usuário do MediQuês') : 'Usuário do MediQuês');
    const subTitleStr = `Paciente: ${patientName}`;
    doc.text(subTitleStr, margin + 6, currentY);
    currentY += 8;

    // Accent line below title
    doc.setFillColor(activeThemeColors.primary[0], activeThemeColors.primary[1], activeThemeColors.primary[2]);
    doc.rect(margin + 6, currentY, 40, 1.5, 'F');
    currentY += 10;

    myMedicines.forEach((med, idx) => {
      const labelDose = `Dose: ${med.dose || 'Sob demanda'}`;
      const labelFrequency = `Frequência: ${med.timesPerDay === 'Outro' ? 'Sob demanda / Conforme necessário' : `${med.timesPerDay}x ao dia`}`;
      const labelTimes = med.times && med.times.length > 0 ? `Horários: ${med.times.join('  •  ')}` : '';
      
      const wrappedInstructions = doc.splitTextToSize(`Instruções: ${med.instructions || 'Tomar conforme orientação médica.'}`, contentWidth - 20);
      const instructionsHeight = wrappedInstructions.length * 4.5;
      const cardHeight = 22 + instructionsHeight;

      // Check if we need a new page
      if (currentY + cardHeight > pageHeight - margin - 15) {
        doc.addPage();
        pageCount++;
        drawPageDecoration(pageCount);
        currentY = margin + 18;
      }

      // Draw Card background
      doc.setFillColor(252, 253, 255);
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.setLineWidth(0.35);
      doc.roundedRect(margin + 6, currentY, contentWidth - 12, cardHeight, 3, 3, 'FD');

      // Left Accent Strip (vertical bar of primary color)
      doc.setFillColor(activeThemeColors.primary[0], activeThemeColors.primary[1], activeThemeColors.primary[2]);
      doc.rect(margin + 6, currentY, 1.5, cardHeight, 'F');

      let itemY = currentY + 6;

      // 1. Medicine Name
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(30, 41, 59); // slate-800
      doc.text(`${idx + 1}. ${med.medicineName}`, margin + 11, itemY);

      // Dose Badge text on the right
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(activeThemeColors.dark[0], activeThemeColors.dark[1], activeThemeColors.dark[2]);
      const doseWidth = doc.getTextWidth(labelDose);
      doc.text(labelDose, margin + contentWidth - 12 - doseWidth, itemY);

      itemY += 6;

      // 2. Frequency & Horários
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105); // slate-600
      doc.text(labelFrequency, margin + 11, itemY);

      if (labelTimes) {
        doc.setFont('Helvetica', 'bold');
        doc.setTextColor(activeThemeColors.primary[0], activeThemeColors.primary[1], activeThemeColors.primary[2]);
        const timesWidth = doc.getTextWidth(labelTimes);
        doc.text(labelTimes, margin + contentWidth - 12 - timesWidth, itemY);
      }

      itemY += 6;

      // 3. Instructions (wrapped text)
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139); // slate-500
      wrappedInstructions.forEach((line: string) => {
        doc.text(line, margin + 11, itemY);
        itemY += 4.5;
      });

      currentY += cardHeight + 6; // Spacing to next card
    });

    const filenameOutput = `Minha_Receita_MediQues_${patientName.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
    doc.save(filenameOutput);
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
  const baseStyleConfig = SITE_STYLES[activeStyle] || SITE_STYLES.therapeutic;
  const styleConfig = darkMode ? {
    ...baseStyleConfig,
    containerBg: 'bg-slate-950 dark:bg-slate-950',
    sidebarBg: 'bg-slate-900 text-slate-100 border-slate-800 dark:border-slate-800 dark:bg-slate-900',
    sidebarTitle: 'text-slate-100',
    sidebarText: 'text-slate-400',
    mainBg: 'bg-slate-950 dark:bg-slate-950',
    cardBg: 'bg-slate-900 dark:bg-slate-900',
    cardBorder: 'border-slate-850 dark:border-slate-850 shadow-2xl',
    titleColor: 'text-slate-100 dark:text-slate-100',
    descColor: 'text-slate-400 dark:text-slate-400',
    labelColor: 'text-slate-500 dark:text-slate-500',
    itemBg: 'bg-slate-850 border-slate-800 dark:bg-slate-850 dark:border-slate-850',
    subHeaderBg: 'bg-slate-900/50 dark:bg-slate-900/50',
    subHeaderBorder: 'border-slate-800 dark:border-slate-800',
    comfortDark: true
  } : baseStyleConfig;
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

  const getSimilarRecommendations = (query: string, currentResults: any[]): any[] => {
    const norm = normalizeString(query).trim();
    if (!norm) return [];

    const recommendationRules = [
      {
        keywords: ["sartana", "sartanas", "bra", "bras", "losartana", "valsartana", "olmesartana", "telmisartana", "candesartana", "irbesartana"],
        recommendKeys: ["hipertensao_eca"]
      },
      {
        keywords: ["ieca", "iecas", "pril", "prils", "captopril", "enalapril", "ramipril", "lisinopril"],
        recommendKeys: ["hipertensao_bra"]
      },
      {
        keywords: ["metformina", "glifage", "glicose", "glicemia"],
        recommendKeys: ["diabetes_sglt2"]
      },
      {
        keywords: ["glifozina", "glifozinas", "gliflozina", "gliflozinas", "sglt2", "dapagliflozina", "empagliflozina", "xigduo", "urina"],
        recommendKeys: ["diabetes_metformina"]
      },
      {
        keywords: ["estatina", "estatinas", "sinvastatina", "atorvastatina", "rosuvastatina", "colesterol", "colesterol alto"],
        recommendKeys: ["colesterol_fibratos"]
      },
      {
        keywords: ["fibrato", "fibratos", "triglicerideo", "triglicerideos", "genfibrozila", "fenofibrato"],
        recommendKeys: ["colesterol_estatinas"]
      }
    ];

    const recommendedKeys: string[] = [];
    
    recommendationRules.forEach(rule => {
      const isKeywordMatch = rule.keywords.some(keyword => {
        const nk = normalizeString(keyword);
        return norm.includes(nk) || nk.includes(norm);
      });
      if (isKeywordMatch) {
        rule.recommendKeys.forEach(k => {
          if (!recommendedKeys.includes(k)) {
            recommendedKeys.push(k);
          }
        });
      }
    });

    if (currentResults.length > 0) {
      currentResults.forEach(res => {
        const cat = res.category;
        if (cat) {
          presets.forEach(p => {
            if (p.category === cat && p.key !== res.key && !currentResults.some(cr => cr.key === p.key)) {
              if (!recommendedKeys.includes(p.key)) {
                recommendedKeys.push(p.key);
              }
            }
          });
        }
      });
    }

    const filteredRecKeys = recommendedKeys.filter(key => !currentResults.some(cr => cr.key === key));

    return presets.filter(p => filteredRecKeys.includes(p.key));
  };

  const renderUserMenu = () => {
    return (
      <div className="shrink-0 flex items-center gap-2">
        {user ? (
          <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 px-3 py-1.5 rounded-full shadow-xs">
            <div className="flex flex-col items-end text-right">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Bem vindo de volta,</span>
              <span className="text-xs font-extrabold text-slate-700 dark:text-slate-200 max-w-[120px] xs:max-w-[180px] truncate">
                {userName || user.displayName || user.email?.split('@')[0] || 'Usuário'}
              </span>
            </div>
            
            {/* Foto de Perfil ou Inicial automática */}
            <div className="shrink-0">
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt="Foto de perfil" 
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full object-cover border border-indigo-500/30"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center font-black text-xs uppercase shadow-sm">
                  {(userName || user.displayName || user.email || 'U')[0]}
                </div>
              )}
            </div>

            <button
              onClick={handleSignOut}
              className="p-1.5 rounded-full hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-450 hover:text-rose-500 transition-all cursor-pointer"
              title="Sair da Conta"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setAuthModalTab('login');
                setAuthModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-indigo-600 hover:bg-indigo-700 text-white border border-indigo-500 transition-all cursor-pointer shadow-md shadow-indigo-600/10"
            >
              Entrar
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div id="clarifarma-app" className={`min-h-screen ${styleConfig.containerBg} font-sans ${darkMode ? 'dark' : ''} ${styleConfig.comfortDark ? 'text-slate-100' : 'text-slate-800'} flex flex-col ${showHome ? 'justify-center items-center' : 'md:flex-row'} overflow-x-hidden transition-all duration-300`}>
      
      {showHome ? (
        <div className="flex-1 flex flex-col w-full relative min-h-screen">
          {/* Top Navbar */}
          <header className="w-full max-w-7xl mx-auto px-6 py-4 flex justify-end items-center z-10 shrink-0">
            {renderUserMenu()}
          </header>

          <div className="flex-1 flex flex-col items-center justify-center max-w-3xl w-full text-center space-y-10 mx-auto px-4 pb-12 animate-in fade-in duration-300">
          
          {/* Brand Logo and Site Name */}
          <div className="flex flex-col items-center gap-4">
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-white font-extrabold text-4xl shadow-lg ${
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
            <div className="text-center">
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 leading-none flex items-baseline justify-center gap-1.5">
                <span className="text-[12px] text-slate-400 font-semibold uppercase tracking-widest">do</span>
                <span className="text-slate-900 dark:text-slate-50">MediQuês</span>
              </h1>
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-widest block mt-2">para o português</span>
              <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 max-w-lg mx-auto mt-4 leading-relaxed font-medium">
                Transformamos bulas complexas em livrinhos coloridos e fáceis para quem precisa de ajuda para entender seus remédios.
              </p>
            </div>
          </div>

          {/* The Question */}
          <h2 className="text-2xl md:text-4xl font-extrabold font-serif text-slate-800 dark:text-slate-100 tracking-tight leading-tight max-w-2xl">
            Qual seu problem principal de saúde hoje?
          </h2>

          {/* Large search input */}
          <div className="relative w-full max-w-2xl shadow-xl rounded-2xl bg-white dark:bg-slate-900 p-1.5 border border-slate-200 dark:border-slate-800">
            <input
              type="text"
              value={homeSearchQuery}
              onChange={(e) => setHomeSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleHomeSearch(homeSearchQuery);
                }
              }}
              placeholder="Ex: pressão alta, diabetes, azia, colesterol..."
              className="w-full pl-12 pr-28 py-3.5 md:py-4.5 rounded-xl text-base md:text-lg outline-none bg-transparent text-slate-850 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 font-medium"
            />
            <Search className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-450" />
            {homeSearchQuery && (
              <button
                onClick={() => setHomeSearchQuery('')}
                className="absolute right-28 top-1/2 -translate-y-1/2 text-slate-450 hover:text-slate-600 cursor-pointer p-1"
              >
                <XCircle className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={() => handleHomeSearch(homeSearchQuery)}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 md:py-3.5 rounded-xl text-sm md:text-base transition-all shadow-md cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              {!homeSearchQuery || !homeSearchQuery.trim() ? 'Explorar' : 'Buscar'}
            </button>
          </div>

          {/* Suggestions */}
          <div className="space-y-3.5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Ou selecione um problema comum:</span>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                { label: 'Pressão Alta', query: 'pressão' },
                { label: 'Diabetes', query: 'diabetes' },
                { label: 'Colesterol Alto', query: 'colesterol' },
                { label: 'Azia e Estômago', query: 'azia' }
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleHomeSearch(item.query)}
                  className="px-4 py-2 rounded-xl text-xs font-bold transition-all border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-400 cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main 3-Column Section */}
          <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-100 dark:border-slate-900 text-left">
            {/* Column 1: Meus Favoritos */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block">Meus Favoritos</h3>
              </div>
              
              {favoriteFolders.length === 0 && favoriteEbooks.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-1 bg-slate-50/50 dark:bg-slate-900/10">
                  <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Nenhum favorito ainda</p>
                  <p className="text-[9px] text-slate-400 dark:text-slate-500">Adicione estrelas aos e-books ou pastas!</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {/* Favorite Folders */}
                  {favoriteFolders.map(folderId => {
                    const catData = [
                      { id: 'hipertensao', label: 'Pressão Alta', icon: Heart, desc: 'Sartanas, Pris e controle de pressão.', color: 'text-emerald-600 bg-emerald-50/60 border-emerald-100 hover:border-emerald-200 hover:bg-emerald-50/80 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400' },
                      { id: 'diabetes', label: 'Diabetes', icon: Activity, desc: 'Metformina, Gliflozinas e açúcar no sangue.', color: 'text-blue-600 bg-blue-50/60 border-blue-100 hover:border-blue-200 hover:bg-blue-50/80 dark:bg-blue-950/20 dark:border-blue-900/30 dark:text-blue-400' },
                      { id: 'colesterol', label: 'Colesterol Alto', icon: ShieldAlert, desc: 'Estatinas, Fibratos e gordura no sangue.', color: 'text-amber-600 bg-amber-50/60 border-amber-100 hover:border-amber-200 hover:bg-amber-50/80 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-400' }
                    ].find(c => c.id === folderId);
                    
                    if (!catData) return null;
                    const CatIcon = catData.icon;
                    return (
                      <div key={folderId} className="relative group">
                        <button
                          onClick={() => {
                            setSelectedCategory(folderId);
                            setShowHome(false);
                            setIsCustomMode(false);
                            setSidebarOpen(true);
                            setOpenFolders(prev => ({ ...prev, [folderId]: true }));
                            setSelectedPreset('');
                            setCurrentEbook(null);
                          }}
                          className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer shadow-xs hover:shadow-md w-full ${catData.color}`}
                        >
                          <div className="p-1 rounded-lg bg-white dark:bg-slate-900 shadow-xs shrink-0 border border-slate-100 dark:border-slate-800">
                            <CatIcon className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 truncate">📁 {catData.label}</h4>
                          </div>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            toggleFavoriteFolder(folderId);
                          }}
                          className="absolute top-2.5 right-2.5 p-1 rounded-lg bg-white/90 dark:bg-slate-900/90 hover:bg-white text-amber-500 shadow-xs border border-slate-100 dark:border-slate-800 transition-colors cursor-pointer"
                          title="Remover dos favoritos"
                        >
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        </button>
                      </div>
                    );
                  })}

                  {/* Favorite Ebooks */}
                  {favoriteEbooks.map(ebookKey => {
                    const preset = presets.find(p => p.key === ebookKey);
                    if (!preset) return null;
                    
                    return (
                      <div 
                        key={ebookKey} 
                        className={`relative rounded-xl border p-3 flex items-center justify-between gap-3 shadow-xs hover:shadow-md transition-all w-full ${
                          styleConfig.comfortDark 
                            ? 'border-slate-800 bg-slate-900/30 hover:border-slate-700' 
                            : 'border-slate-200 bg-white hover:bg-slate-50/50 hover:border-slate-250'
                        }`}
                      >
                        <button
                          onClick={() => {
                            handlePresetSelect(ebookKey);
                          }}
                          className="flex-1 text-left min-w-0 cursor-pointer pr-6"
                        >
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Pill className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                            <p className={`text-xs font-bold truncate ${styleConfig.comfortDark ? 'text-slate-100' : 'text-slate-850'}`}>
                              {getPresetDisplayName(preset.key, accessibilitySettings.simpleLanguage, preset.medicineName)}
                            </p>
                          </div>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            toggleFavoriteEbook(ebookKey);
                          }}
                          className="absolute top-2.5 right-2.5 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-amber-500 transition-colors shrink-0 cursor-pointer"
                          title="Remover dos favoritos"
                        >
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Column 2: Mais Visualizados */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-500 fill-emerald-500/10" />
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block">Mais Visualizados</h3>
              </div>
              
              <div className="flex flex-col gap-2.5 w-full">
                {[
                  { id: 'hipertensao', label: 'Pressão Alta', icon: Heart, desc: 'Sartanas, Pris e controle de pressão.', color: 'text-emerald-600 bg-emerald-50/60 border-emerald-100 hover:border-emerald-200 hover:bg-emerald-50/80 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400' },
                  { id: 'diabetes', label: 'Diabetes', icon: Activity, desc: 'Metformina, Gliflozinas e açúcar no sangue.', color: 'text-blue-600 bg-blue-50/60 border-blue-100 hover:border-blue-200 hover:bg-blue-50/80 dark:bg-blue-950/20 dark:border-blue-900/30 dark:text-blue-400' },
                  { id: 'colesterol', label: 'Colesterol Alto', icon: ShieldAlert, desc: 'Estatinas, Fibratos e gordura no sangue.', color: 'text-amber-600 bg-amber-50/60 border-amber-100 hover:border-amber-200 hover:bg-amber-50/80 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-400' }
                ].map((cat) => {
                  const CatIcon = cat.icon;
                  const count = presets.filter(p => p.category === cat.id).length;
                  return (
                    <div key={cat.id} className="relative group w-full">
                      <button
                        onClick={() => {
                          setSelectedCategory(cat.id);
                          setShowHome(false);
                          setIsCustomMode(false);
                          setSidebarOpen(true);
                          setOpenFolders(prev => ({ ...prev, [cat.id]: true }));
                          setSelectedPreset('');
                          setCurrentEbook(null);
                        }}
                        className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer shadow-xs hover:shadow-md w-full ${cat.color}`}
                      >
                        <div className="p-1 rounded-lg bg-white dark:bg-slate-900 shadow-xs shrink-0 border border-slate-100 dark:border-slate-800">
                          <CatIcon className="w-3.5 h-3.5 animate-pulse" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 truncate">📁 {cat.label}</h4>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{cat.desc}</p>
                        </div>
                        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-500 shrink-0">
                          {count} {count === 1 ? 'Guia' : 'Guias'}
                        </span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          toggleFavoriteFolder(cat.id);
                        }}
                        className={`absolute top-2.5 right-2.5 p-1 rounded-lg bg-white/90 dark:bg-slate-900/90 hover:bg-white shadow-xs border border-slate-100 dark:border-slate-800 transition-colors cursor-pointer ${
                          favoriteFolders.includes(cat.id)
                            ? 'flex text-amber-500'
                            : 'hidden group-hover:flex text-slate-400 hover:text-amber-500'
                        }`}
                        title={favoriteFolders.includes(cat.id) ? "Remover pasta dos favoritos" : "Adicionar pasta aos favoritos"}
                      >
                        <Star className={`w-3 h-3 ${favoriteFolders.includes(cat.id) ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Column 3: Histórico */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-500" />
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block">Histórico</h3>
              </div>
              
              {recentViews.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-1 bg-slate-50/50 dark:bg-slate-900/10">
                  <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Nenhum histórico</p>
                  <p className="text-[9px] text-slate-400 dark:text-slate-500">Os guias que você ler aparecerão aqui!</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5 w-full">
                  {recentViews.map(ebookKey => {
                    const preset = presets.find(p => p.key === ebookKey);
                    if (!preset) return null;
                    return (
                      <div 
                        key={ebookKey} 
                        className={`relative rounded-xl border p-3 flex items-center justify-between gap-3 shadow-xs hover:shadow-md transition-all w-full ${
                          styleConfig.comfortDark 
                            ? 'border-slate-800 bg-slate-900/30 hover:border-slate-700' 
                            : 'border-slate-200 bg-white hover:bg-slate-50/50 hover:border-slate-250'
                        }`}
                      >
                        <button
                          onClick={() => {
                            handlePresetSelect(ebookKey);
                          }}
                          className="flex-1 text-left min-w-0 cursor-pointer pr-6"
                        >
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                            <p className={`text-xs font-bold truncate ${styleConfig.comfortDark ? 'text-slate-100' : 'text-slate-850'}`}>
                              {getPresetDisplayName(preset.key, accessibilitySettings.simpleLanguage, preset.medicineName)}
                            </p>
                          </div>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            toggleFavoriteEbook(ebookKey);
                          }}
                          className="absolute top-2.5 right-2.5 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer text-slate-350 hover:text-amber-500"
                          title={favoriteEbooks.includes(ebookKey) ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                        >
                          <Star className={`w-3 h-3 ${favoriteEbooks.includes(ebookKey) ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Custom simplify link */}
          <div className="pt-6 border-t border-slate-200/50 w-full max-w-sm mx-auto">
            <button
              onClick={() => {
                setIsCustomMode(true);
                setSelectedPreset('');
                setShowHome(false);
                setSelectedCategory(null);
              }}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center justify-center gap-1.5 mx-auto hover:underline cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              Simplificar outro remédio específico
            </button>
          </div>
        </div>
        </div>
      ) : (
        <>
          {/* Floating Profile Button when Sidebar is Minimized */}
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="fixed top-4 left-4 z-50 p-0.5 rounded-full transition-all cursor-pointer shadow-md border border-slate-200/80 dark:border-slate-850 bg-white dark:bg-slate-900 hover:scale-[1.05] active:scale-[0.95]"
              title="Abrir menu"
            >
              {user ? (
                user.photoURL ? (
                  <img src={user.photoURL} alt="Foto de perfil" className="w-10 h-10 rounded-full border border-slate-100 dark:border-slate-800 object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-extrabold text-sm border border-indigo-200/50 dark:border-slate-750">
                    {userName ? userName.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : 'U')}
                  </div>
                )
              ) : (
                <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-slate-850 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-extrabold text-sm border border-indigo-100 dark:border-slate-800">
                  <UserIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
              )}
            </button>
          )}

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
            className={`flex-shrink-0 ${styleConfig.sidebarBg} flex flex-col justify-between transition-all duration-300 fixed inset-y-0 left-0 z-50 md:sticky md:top-0 md:h-screen md:translate-x-0 ${
              sidebarOpen 
                ? 'w-[290px] xs:w-[320px] md:w-80 lg:w-96 p-6 md:p-8 border-r border-slate-200/80 dark:border-slate-800 shadow-2xl md:shadow-md translate-x-0' 
                : 'w-0 p-0 overflow-hidden border-r-0 -translate-x-full md:w-0'
            }`}
          >
            <div className={`flex-1 flex flex-col h-full min-h-0 overflow-hidden py-1 transition-all ${sidebarOpen ? 'min-w-[240px] xs:min-w-[272px] md:min-w-[310px]' : 'min-w-0 w-0 overflow-hidden'}`}>
              
              {/* User Profile / Login Area (Static, stays at top) */}
              <div className="flex-shrink-0 pb-4 border-b border-slate-100/50 dark:border-slate-800/50">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    {user ? (
                      <button
                        onClick={() => {
                          setShowProfile(true);
                          setShowHome(false);
                          setShowMyMedicines(false);
                          setSelectedCategory(null);
                          setViewingTagResults(false);
                          setCurrentEbook(null);
                          if (window.innerWidth < 768) {
                            setSidebarOpen(false);
                          }
                        }}
                        className={`w-full p-2.5 rounded-xl border flex items-center gap-2.5 transition-all cursor-pointer text-left ${
                          showProfile
                            ? `${styleConfig.comfortDark ? 'border-indigo-500 bg-indigo-950/40 text-indigo-100 font-extrabold shadow-sm' : 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-extrabold shadow-xs'}`
                            : `${styleConfig.comfortDark ? 'border-slate-800 hover:border-slate-700 text-slate-300 hover:bg-slate-900/50' : 'border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50/50'}`
                        }`}
                      >
                        {user.photoURL ? (
                          <img src={user.photoURL} alt="Foto de perfil" className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-850 shrink-0" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-extrabold text-xs border border-indigo-200/50 dark:border-slate-750 shrink-0">
                            {userName ? userName.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : 'U')}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <span className="text-[9px] text-slate-400 font-semibold block uppercase tracking-wider leading-none">Bem-vindo(a)</span>
                          <span className={`text-xs block font-bold truncate mt-0.5 ${styleConfig.comfortDark ? 'text-slate-200' : 'text-slate-800'}`}>
                            {userName || user.displayName || 'Usuário'}
                          </span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setAuthModalTab('login');
                          setAuthModalOpen(true);
                        }}
                        className={`w-full py-2.5 px-3 border rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
                          styleConfig.comfortDark 
                            ? 'bg-slate-800 hover:bg-slate-755 text-indigo-400 hover:text-indigo-300 border-slate-700'
                            : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-600 hover:text-indigo-700 border-indigo-100'
                        }`}
                      >
                        <LogIn className="w-4 h-4 shrink-0" />
                        <span className="truncate">Entrar / Cadastrar-se</span>
                      </button>
                    )}
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
              </div>

              {/* Scrollable Container (Everything else in the sidebar) */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-6 mt-4 scrollbar-thin">



          <hr className={styleConfig.comfortDark ? 'border-slate-800' : 'border-slate-100'} />

          {/* Search Bar */}
          <div className="space-y-2">
            <label className={`text-xs font-bold ${styleConfig.comfortDark ? 'text-slate-400' : 'text-slate-500'} uppercase tracking-wider flex items-center gap-1.5`}>
              <Search className={`w-3.5 h-3.5 ${styleConfig.comfortDark ? 'text-slate-400' : 'text-indigo-500'}`} />
              Buscar no Guia
            </label>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSidebarSearch(sidebarInputVal);
              }}
              className="relative"
            >
              <input
                type="text"
                value={sidebarInputVal}
                onChange={(e) => handleSidebarSearchRealTime(e.target.value)}
                placeholder="Ex: pressão alta, diabetes, azia..."
                className={`w-full pl-9 pr-8 py-2.5 rounded-xl text-xs outline-none border transition-all ${
                  styleConfig.comfortDark 
                    ? 'bg-slate-900 border-slate-800 text-slate-100 placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20' 
                    : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/20'
                }`}
              />
              <button
                type="submit"
                className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors cursor-pointer flex items-center justify-center p-1 rounded-md ${
                  styleConfig.comfortDark ? 'text-slate-500 hover:text-indigo-400' : 'text-slate-400 hover:text-indigo-600'
                }`}
                title="Pesquisar"
              >
                <Search className="w-4 h-4" />
              </button>
              {sidebarInputVal && (
                <button
                  type="button"
                  onClick={() => {
                    setSidebarInputVal('');
                    handleSidebarSearch('');
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer flex items-center justify-center"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              )}
            </form>

            {/* Quick search tags suggestion */}
            <div className="flex flex-wrap gap-1 mt-1.5">
              {['pressão', 'diabetes', 'azia', 'losartana', 'BRA', 'glifage'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleSidebarSearch(tag)}
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

          {/* My Medicines Option */}
          <div className="mb-4">
            <button
              onClick={() => {
                setShowMyMedicines(true);
                setShowHome(false);
                setIsCustomMode(false);
                setSelectedCategory(null);
                setViewingTagResults(false);
                setCurrentEbook(null);
                if (window.innerWidth < 768) {
                  setSidebarOpen(false);
                }
              }}
              className={`w-full p-3 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                showMyMedicines
                  ? `${styleConfig.comfortDark ? 'border-indigo-500 bg-indigo-950/40 text-indigo-100 font-extrabold shadow-sm' : 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-extrabold shadow-xs'}`
                  : `${styleConfig.comfortDark ? 'border-slate-800 hover:border-slate-700 text-slate-300 hover:bg-slate-900/50' : 'border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50/50'}`
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`p-2 rounded-lg border ${
                  showMyMedicines
                    ? 'text-indigo-500 bg-indigo-100/40 border-indigo-500/20'
                    : 'text-slate-400 bg-slate-50 dark:bg-slate-900 border-slate-200/50 dark:border-slate-800/50'
                } flex items-center justify-center flex-shrink-0`}>
                  <Pill className={`w-4 h-4 ${showMyMedicines ? 'animate-bounce' : ''}`} />
                </div>
                <div className="min-w-0">
                  <span className="text-xs block font-bold">
                    Meus Remédios 💊
                  </span>
                  <span className={`text-[10px] font-medium block truncate ${showMyMedicines ? 'text-indigo-600/80 dark:text-indigo-300/80' : 'text-slate-400'}`}>
                    Minha receita & lembretes
                  </span>
                </div>
              </div>
              <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                showMyMedicines ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-850 text-slate-500 dark:text-slate-400'
              }`}>
                {myMedicines.length}
              </span>
            </button>
          </div>

          {/* Quick Preset Selector */}
          <div>
            <button
              onClick={() => setSidebarFoldersCollapsed(!sidebarFoldersCollapsed)}
              className={`w-full text-xs font-bold ${styleConfig.comfortDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'} uppercase tracking-wider mb-3 flex items-center justify-between text-left cursor-pointer`}
            >
              <div className="flex items-center gap-1.5">
                <FolderOpen className={`w-3.5 h-3.5 ${styleConfig.comfortDark ? 'text-slate-400' : 'text-blue-500'}`} />
                Pastas de Doenças ({filteredPresets.length > 0 ? Array.from(new Set(filteredPresets.map(p => p.category))).length : 0})
              </div>
              {sidebarFoldersCollapsed ? (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>
            
            {!sidebarFoldersCollapsed && (
              <>
                {filteredPresets.length > 0 ? (
                  <div className="space-y-2.5">
                    {[
                      { id: 'hipertensao', icon: Heart, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/20 dark:border-emerald-500/10' },
                      { id: 'diabetes', icon: Activity, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40 border-blue-500/20 dark:border-blue-500/10' },
                      { id: 'colesterol', icon: ShieldAlert, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-500/20 dark:border-amber-500/10' }
                    ].map((cat) => {
                      const categoryPresets = filteredPresets.filter(p => p.category === cat.id);
                      if (categoryPresets.length === 0) return null;
                      
                      const isExpanded = !!(
                        openFolders[cat.id] || 
                        searchQuery.trim() !== ''
                      );
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
                          <div className={`w-full p-3 flex items-center justify-between text-left transition-all`}>
                            <button
                              onClick={() => {
                                setOpenFolders(prev => ({ ...prev, [cat.id]: true }));
                                setSelectedCategory(cat.id);
                                setIsCustomMode(false);
                                setShowHome(false);
                                setSelectedPreset('');
                                setCurrentEbook(null);
                              }}
                              className="flex items-center gap-2.5 min-w-0 flex-1 text-left cursor-pointer mr-2"
                            >
                              <div className={`p-2 rounded-lg border ${cat.color} flex items-center justify-center flex-shrink-0`}>
                                <CategoryIcon className="w-4 h-4 animate-pulse" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <span className={`text-xs font-bold block ${styleConfig.comfortDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                  📁 {folderName}
                                </span>
                                <span className={`text-[10px] block truncate ${styleConfig.comfortDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                  {folderDesc}
                                </span>
                              </div>
                            </button>

                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  toggleFavoriteFolder(cat.id);
                                }}
                                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-amber-500 transition-colors cursor-pointer"
                                title={favoriteFolders.includes(cat.id) ? "Remover pasta dos favoritos" : "Adicionar pasta aos favoritos"}
                              >
                                <Star className={`w-3.5 h-3.5 ${favoriteFolders.includes(cat.id) ? 'fill-amber-500 text-amber-500' : 'text-slate-400 dark:text-slate-500'}`} />
                              </button>

                              <button
                                onClick={() => {
                                  setOpenFolders(prev => ({ ...prev, [cat.id]: !prev[cat.id] }));
                                  setSelectedCategory(cat.id);
                                  setIsCustomMode(false);
                                  setShowHome(false);
                                }}
                                className="flex items-center gap-1.5 cursor-pointer"
                              >
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${styleConfig.comfortDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                                  {categoryPresets.length} {categoryPresets.length === 1 ? 'guia' : 'guias'}
                                </span>
                                {isExpanded ? (
                                  <ChevronDown className="w-4 h-4 text-slate-400" />
                                ) : (
                                  <ChevronRight className="w-4 h-4 text-slate-400" />
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Expandable/collapsible content */}
                          {isExpanded && (
                            <div className={`p-2 border-t flex flex-col gap-1.5 ${styleConfig.comfortDark ? 'border-slate-800 bg-slate-950/20' : 'border-slate-200/50 bg-white'}`}>
                              {categoryPresets.map((preset) => {
                                const isSelected = selectedPreset === preset.key && !isCustomMode;
                                return (
                                  <div key={preset.key} className="relative group/ebook-side">
                                    <button
                                      id={`preset-btn-${preset.key}`}
                                      onClick={() => handlePresetSelect(preset.key)}
                                      className={`w-full p-2.5 pr-11 rounded-lg border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
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

                                      <div className="flex-shrink-0 flex items-center gap-1 mr-4">
                                        {preset.tags && preset.tags.length > 0 && (
                                          <span className="text-[8px] font-bold px-1 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded border border-slate-200/40 dark:border-slate-700/45 uppercase tracking-wide">
                                            {preset.tags[0]}
                                          </span>
                                        )}
                                        <ChevronRight className="w-3 h-3 text-slate-400" />
                                      </div>
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        toggleFavoriteEbook(preset.key);
                                      }}
                                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-450 hover:text-amber-500 transition-colors cursor-pointer"
                                      title={favoriteEbooks.includes(preset.key) ? "Remover guia dos favoritos" : "Adicionar guia aos favoritos"}
                                    >
                                      <Star className={`w-3.5 h-3.5 ${favoriteEbooks.includes(preset.key) ? 'fill-amber-500 text-amber-500' : 'text-slate-400 dark:text-slate-500'}`} />
                                    </button>
                                  </div>
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
              </>
            )}
          </div>

          <hr className={styleConfig.comfortDark ? 'border-slate-800' : 'border-slate-100'} />

          {/* Favoritos Section */}
          <div>
            <button
              onClick={() => setSidebarFavoritesCollapsed(!sidebarFavoritesCollapsed)}
              className={`w-full text-xs font-bold ${styleConfig.comfortDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'} uppercase tracking-wider mb-3 flex items-center justify-between text-left cursor-pointer`}
            >
              <div className="flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                Favoritos ({favoriteFolders.length + favoriteEbooks.length})
              </div>
              {sidebarFavoritesCollapsed ? (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {!sidebarFavoritesCollapsed && (
              favoriteFolders.length === 0 && favoriteEbooks.length === 0 ? (
                <div className="p-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center bg-slate-50/30 dark:bg-slate-900/10">
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">Nenhum favorito</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Favorite Folders */}
                  {favoriteFolders.map(folderId => {
                    const catData = [
                      { id: 'hipertensao', label: 'Pressão Alta', icon: Heart, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/10' },
                      { id: 'diabetes', label: 'Diabetes', icon: Activity, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40 border-blue-500/10' },
                      { id: 'colesterol', label: 'Colesterol Alto', icon: ShieldAlert, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-500/10' }
                    ].find(c => c.id === folderId);
                    if (!catData) return null;
                    const CatIcon = catData.icon;
                    return (
                      <div key={`side-fav-folder-${folderId}`} className="relative group/side-fav-folder">
                        <button
                          onClick={() => {
                            setSelectedCategory(folderId);
                            setShowHome(false);
                            setIsCustomMode(false);
                            setOpenFolders(prev => ({ ...prev, [folderId]: true }));
                            setSelectedPreset('');
                            setCurrentEbook(null);
                          }}
                          className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer w-full text-xs font-bold ${catData.color}`}
                        >
                          <CatIcon className="w-3.5 h-3.5" />
                          <span className="truncate">📁 {catData.label}</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            toggleFavoriteFolder(folderId);
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-amber-500 border border-slate-100 dark:border-slate-800 cursor-pointer"
                          title="Remover"
                        >
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        </button>
                      </div>
                    );
                  })}

                  {/* Favorite Ebooks */}
                  {favoriteEbooks.map(ebookKey => {
                    const preset = presets.find(p => p.key === ebookKey);
                    if (!preset) return null;
                    const isSelected = selectedPreset === ebookKey && !isCustomMode;
                    return (
                      <div key={`side-fav-ebook-${ebookKey}`} className="relative group/side-fav-ebook">
                        <button
                          onClick={() => handlePresetSelect(ebookKey)}
                          className={`p-2.5 pr-9 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer w-full text-xs font-bold ${
                            isSelected
                              ? `${styleConfig.comfortDark ? 'border-indigo-500 bg-indigo-950/40 text-indigo-100' : 'border-indigo-600 bg-indigo-50/50 text-indigo-900'}`
                              : `${styleConfig.comfortDark ? 'border-slate-800 hover:border-slate-700 text-slate-300 bg-slate-900/50' : 'border-slate-200 hover:border-slate-300 text-slate-600 hover:bg-slate-50/50'}`
                          }`}
                        >
                          <Pill className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span className="truncate">
                            {getPresetDisplayName(preset.key, accessibilitySettings.simpleLanguage, preset.medicineName)}
                          </span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            toggleFavoriteEbook(ebookKey);
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Remover"
                        >
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )
            )}
          </div>

          <hr className={styleConfig.comfortDark ? 'border-slate-800' : 'border-slate-100'} />

          {/* Histórico Section */}
          <div>
            <button
              onClick={() => setSidebarHistoryCollapsed(!sidebarHistoryCollapsed)}
              className={`w-full text-xs font-bold ${styleConfig.comfortDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'} uppercase tracking-wider mb-3 flex items-center justify-between text-left cursor-pointer`}
            >
              <div className="flex items-center gap-1.5">
                <History className={`w-3.5 h-3.5 ${styleConfig.comfortDark ? 'text-slate-400' : 'text-indigo-500'}`} />
                Histórico ({recentViews.length})
              </div>
              {sidebarHistoryCollapsed ? (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {!sidebarHistoryCollapsed && (
              recentViews.length === 0 ? (
                <div className="p-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center bg-slate-50/30 dark:bg-slate-900/10">
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">Nenhum histórico</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentViews.map(ebookKey => {
                    const preset = presets.find(p => p.key === ebookKey);
                    if (!preset) return null;
                    const isSelected = selectedPreset === ebookKey && !isCustomMode;
                    return (
                      <div key={`side-hist-ebook-${ebookKey}`} className="relative group/side-hist-ebook">
                        <button
                          onClick={() => handlePresetSelect(ebookKey)}
                          className={`p-2.5 pr-9 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer w-full text-xs font-bold ${
                            isSelected
                              ? `${styleConfig.comfortDark ? 'border-indigo-500 bg-indigo-950/40 text-indigo-100' : 'border-indigo-600 bg-indigo-50/50 text-indigo-900'}`
                              : `${styleConfig.comfortDark ? 'border-slate-800 hover:border-slate-700 text-slate-300 bg-slate-900/50' : 'border-slate-200 hover:border-slate-300 text-slate-600 hover:bg-slate-50/50'}`
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">
                            {getPresetDisplayName(preset.key, accessibilitySettings.simpleLanguage, preset.medicineName)}
                          </span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            toggleFavoriteEbook(ebookKey);
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Favoritar"
                        >
                          <Star className={`w-3.5 h-3.5 ${favoriteEbooks.includes(ebookKey) ? 'fill-amber-500 text-amber-500' : 'text-slate-450 dark:text-slate-500'}`} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )
            )}
          </div>

          <hr className={styleConfig.comfortDark ? 'border-slate-800' : 'border-slate-100'} />

          {/* Accessibility Adjustments */}
          <div>
            <button
              onClick={() => setSidebarAccessibilityCollapsed(!sidebarAccessibilityCollapsed)}
              className={`w-full text-xs font-bold ${styleConfig.comfortDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'} uppercase tracking-wider mb-3 flex items-center justify-between text-left cursor-pointer`}
            >
              <div className="flex items-center gap-1.5">
                <Settings className={`w-3.5 h-3.5 ${styleConfig.comfortDark ? 'text-slate-400' : 'text-indigo-500'}`} />
                Configurações de Acessibilidade
              </div>
              {sidebarAccessibilityCollapsed ? (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>
            
            {!sidebarAccessibilityCollapsed && (
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

                {/* Dark Mode Toggle */}
                <div className={`flex items-center justify-between p-3 bg-slate-50 rounded-xl border transition-colors ${styleConfig.comfortDark ? 'bg-slate-900/60 border-slate-800/80' : 'bg-slate-50 rounded-xl border-slate-100'}`}>
                  <div>
                    <span className={`text-xs font-bold block ${styleConfig.comfortDark ? 'text-slate-200' : 'text-slate-700'} flex items-center gap-1.5`}>
                      {darkMode ? <Moon className="w-3.5 h-3.5 text-indigo-400" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
                      Modo Escuro
                    </span>
                    <span className={`text-[10px] font-medium ${styleConfig.comfortDark ? 'text-slate-500' : 'text-slate-400'}`}>Ideal para leitura noturna</span>
                  </div>
                  <button 
                    id="toggle-dark-mode"
                    onClick={toggleDarkMode}
                    className={`w-11 h-6 rounded-full relative transition-colors ${darkMode ? toggleColorClass : (styleConfig.comfortDark ? 'bg-slate-800' : 'bg-slate-200')}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${darkMode ? 'right-1' : 'left-1'}`}></div>
                  </button>
                </div>
              </div>
            )}

            {/* Paywall control if there are unlocked items */}
            {unlockedMedicines.length > 0 && (
              <div className="pt-4 border-t border-slate-150 dark:border-slate-800 mt-4">
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

        {/* Bottom Footer (Static/Fixed at the bottom) - Now the Brand Logo */}
        <div className="flex-shrink-0 pt-4 border-t border-slate-150 dark:border-slate-800 mt-4 flex justify-center">
          <button
            onClick={() => {
              setShowHome(true);
              setSelectedCategory(null);
              setShowProfile(false);
              setShowMyMedicines(false);
              stopSpeaking();
              if (window.innerWidth < 768) {
                setSidebarOpen(false);
              }
            }}
            className="flex items-center gap-3 text-left hover:opacity-85 transition-opacity cursor-pointer w-full justify-center py-1"
            title="Voltar ao início"
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-extrabold shadow-sm shrink-0 ${
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
            <div className="min-w-0">
              <h1 className={`text-xl font-extrabold tracking-tight ${styleConfig.sidebarTitle} leading-none flex items-baseline gap-1`}>
                <span className={`text-[9px] ${styleConfig.labelColor} font-semibold uppercase tracking-widest`}>do</span>
                <span>MediQuês</span>
              </h1>
              <span className={`text-[10px] ${styleConfig.labelColor} font-semibold uppercase tracking-widest block mt-1`}>para o português</span>
            </div>
          </button>
        </div>

        </div>

      </aside>

      {/* Main Preview and Interaction Area */}
      <main id="clarifarma-main" className={`flex-1 flex flex-col min-h-0 ${styleConfig.mainBg} transition-all duration-300 ${!sidebarOpen ? 'pl-16 md:pl-20' : ''}`}>
        
        {showProfile ? (
          /* Profile Info Page */
          <div className="flex-1 p-4 md:p-8 flex flex-col max-w-3xl mx-auto w-full space-y-6 overflow-y-auto animate-in fade-in duration-300 text-left">
            {/* Header section with back button */}
            <div className={`flex flex-col md:flex-row md:items-center justify-between p-5 border ${styleConfig.cardBorder} ${styleConfig.subHeaderBg} rounded-2xl gap-4 shadow-xs`}>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setShowProfile(false);
                    setShowHome(true);
                  }}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1.5 text-xs font-bold ${
                    styleConfig.comfortDark 
                      ? 'border-slate-850 bg-slate-900 text-indigo-400 hover:bg-slate-800 hover:text-indigo-300' 
                      : 'border-slate-200 bg-white text-indigo-600 hover:bg-slate-50 shadow-xs hover:text-indigo-700'
                  }`}
                  title="Voltar ao início"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Voltar ao Início
                </button>
                <div>
                  <h2 className={`text-base font-extrabold ${styleConfig.comfortDark ? 'text-slate-100' : 'text-slate-800'} leading-none flex items-center gap-2`}>
                    <UserIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    Informações do Perfil 👤
                  </h2>
                  <p className="text-[11px] text-slate-400 mt-1 font-semibold">
                    Visualize estatísticas de uso, preferências de leitura e gerencie sua sessão.
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Detail Card */}
            <div className={`p-6 rounded-2xl border ${styleConfig.cardBg} ${styleConfig.cardBorder} shadow-sm space-y-6`}>
              <div className="flex flex-col sm:flex-row items-center gap-5 pb-6 border-b border-slate-100 dark:border-slate-850">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="Avatar" className="w-20 h-20 rounded-full border-2 border-indigo-500 shadow-md" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-black text-3xl shadow-md">
                    {userName ? userName.charAt(0).toUpperCase() : (user?.email ? user.email.charAt(0).toUpperCase() : 'U')}
                  </div>
                )}
                <div className="text-center sm:text-left space-y-1">
                  <h3 className={`text-lg font-extrabold ${styleConfig.comfortDark ? 'text-slate-100' : 'text-slate-900'}`}>
                    {userName || user?.displayName || 'Usuário do MediQuês'}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    {user?.email || 'Nenhum e-mail cadastrado'}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1 justify-center sm:justify-start">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-slate-850 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-slate-800">
                      Conta Sincronizada ☁️
                    </span>
                  </div>
                </div>
              </div>

              {/* Statistics Grid */}
              <div className="space-y-3">
                <h4 className={`text-xs font-bold uppercase tracking-wider ${styleConfig.comfortDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Estatísticas de Uso
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className={`p-4 rounded-xl border ${styleConfig.itemBg} flex items-center gap-3.5`}>
                    <div className="p-2 bg-indigo-50 dark:bg-slate-900 rounded-lg border border-indigo-100 dark:border-slate-800 text-indigo-500">
                      <Pill className="w-5 h-5" />
                    </div>
                    <div>
                      <span className={`text-lg font-black block ${styleConfig.comfortDark ? 'text-slate-100' : 'text-slate-900'} leading-none`}>
                        {myMedicines.length}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mt-1">Remédios</span>
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl border ${styleConfig.itemBg} flex items-center gap-3.5`}>
                    <div className="p-2 bg-amber-50 dark:bg-slate-900 rounded-lg border border-amber-100 dark:border-slate-800 text-amber-500">
                      <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
                    </div>
                    <div>
                      <span className={`text-lg font-black block ${styleConfig.comfortDark ? 'text-slate-100' : 'text-slate-900'} leading-none`}>
                        {favoriteFolders.length + favoriteEbooks.length}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mt-1">Favoritos</span>
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl border ${styleConfig.itemBg} flex items-center gap-3.5`}>
                    <div className="p-2 bg-emerald-50 dark:bg-slate-900 rounded-lg border border-emerald-100 dark:border-slate-800 text-emerald-500">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <span className={`text-lg font-black block ${styleConfig.comfortDark ? 'text-slate-100' : 'text-slate-900'} leading-none`}>
                        {recentViews.length}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mt-1">Lidos Recentemente</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Adherence Compliance Card */}
              <div className={`p-5 rounded-2xl border ${styleConfig.cardBorder} ${styleConfig.cardBg} space-y-4 shadow-sm text-left`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-850 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-emerald-50 dark:bg-slate-950/30 rounded-lg border border-emerald-100 dark:border-slate-900/30 text-emerald-500 shrink-0">
                      <Activity className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <h4 className={`text-sm font-extrabold ${styleConfig.comfortDark ? 'text-slate-100' : 'text-slate-900'}`}>
                        📈 Adesão e Conformidade com o Tratamento
                      </h4>
                      <p className="text-[10px] text-slate-400 font-semibold">
                        Acompanhamento mensal do seu consumo de medicamentos
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 self-start sm:self-center">
                    <span className={`text-2xl font-black ${
                      getMonthlyCompliance() >= 85 
                        ? 'text-emerald-500 dark:text-emerald-400' 
                        : getMonthlyCompliance() >= 50 
                        ? 'text-amber-500 dark:text-amber-400' 
                        : 'text-rose-500 dark:text-rose-400'
                    }`}>
                      {getMonthlyCompliance()}%
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">de conformidade</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3.5 overflow-hidden border border-slate-200/50 dark:border-slate-800">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        getMonthlyCompliance() >= 85 
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-xs' 
                          : getMonthlyCompliance() >= 50 
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-xs' 
                          : 'bg-gradient-to-r from-rose-500 to-pink-500 shadow-xs'
                      }`}
                      style={{ width: `${getMonthlyCompliance()}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                    <span>Tratamento Irregular (0%)</span>
                    <span>Meta Clínica (85%)</span>
                    <span>Excelente (100%)</span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                  💡 <strong>Como é calculado:</strong> Esta taxa reflete a quantidade de doses diárias que você confirmou ter tomado (clicando em "Já tomei" nos lembretes ou no controle diário) em relação ao total de doses programadas na sua receita para o mês atual. Manter a conformidade acima de <strong>85%</strong> é fundamental para a eficácia do seu tratamento!
                </p>
              </div>

              {/* Preferences Summary */}
              <div className="space-y-3 pt-2">
                <h4 className={`text-xs font-bold uppercase tracking-wider ${styleConfig.comfortDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Preferências de Acessibilidade
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className={`p-3 rounded-xl border ${styleConfig.itemBg} text-center space-y-1`}>
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wider">Linguagem Simples</span>
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${accessibilitySettings.simpleLanguage ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                      {accessibilitySettings.simpleLanguage ? 'Ativa' : 'Inativa'}
                    </span>
                  </div>

                  <div className={`p-3 rounded-xl border ${styleConfig.itemBg} text-center space-y-1`}>
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wider">Pictogramas</span>
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${accessibilitySettings.colorfulPictograms ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                      {accessibilitySettings.colorfulPictograms ? 'Coloridos' : 'Inativos'}
                    </span>
                  </div>

                  <div className={`p-3 rounded-xl border ${styleConfig.itemBg} text-center space-y-1`}>
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wider">Fonte Grande</span>
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${accessibilitySettings.largeFont ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                      {accessibilitySettings.largeFont ? 'Ativa' : 'Inativa'}
                    </span>
                  </div>

                  <div className={`p-3 rounded-xl border ${styleConfig.itemBg} text-center space-y-1`}>
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wider">Modo Escuro</span>
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${darkMode ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                      {darkMode ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Logout Action */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-850 flex flex-col sm:flex-row gap-3 justify-between items-center">
                <p className="text-[11px] text-slate-400 font-semibold text-center sm:text-left">
                  Suas receitas, favoritos e histórico são sincronizados automaticamente em tempo real com a nuvem do Firebase.
                </p>
                <button
                  onClick={() => {
                    handleSignOut();
                    setShowProfile(false);
                    setShowHome(true);
                  }}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 hover:scale-[1.01] active:scale-[0.99] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0"
                >
                  <LogOut className="w-4 h-4" />
                  Sair da Conta (Logout)
                </button>
              </div>
            </div>
          </div>
        ) : showMyMedicines ? (
          /* "Meus Remédios" Page */
          <div className="flex-1 p-4 md:p-8 flex flex-col max-w-5xl mx-auto w-full space-y-6 overflow-y-auto animate-in fade-in duration-300 text-left">
            {/* Header section with back button */}
            <div className={`flex flex-col md:flex-row md:items-center justify-between p-5 border ${styleConfig.cardBorder} ${styleConfig.subHeaderBg} rounded-2xl gap-4 shadow-xs`}>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setShowMyMedicines(false);
                    setShowHome(true);
                  }}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1.5 text-xs font-bold ${
                    styleConfig.comfortDark 
                      ? 'border-slate-850 bg-slate-900 text-indigo-400 hover:bg-slate-800 hover:text-indigo-300' 
                      : 'border-slate-200 bg-white text-indigo-600 hover:bg-slate-50 shadow-xs hover:text-indigo-700'
                  }`}
                  title="Voltar ao início"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Voltar ao Início
                </button>
                <div>
                  <h2 className={`text-base font-extrabold ${styleConfig.comfortDark ? 'text-slate-100' : 'text-slate-800'} leading-none flex items-center gap-2`}>
                    <Pill className="w-5 h-5 text-indigo-600 dark:text-indigo-400 animate-pulse" />
                    Meus Remédios & Receita 📋
                  </h2>
                  <p className="text-[11px] text-slate-400 mt-1 font-semibold">
                    Crie e visualize sua receita completa com doses, horários e lembretes automáticos salvos na sua conta.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 self-end md:self-auto">
                {myMedicines.length > 0 && (
                  <button
                    onClick={downloadMedicinesPDF}
                    className={`px-4 py-2.5 rounded-xl border font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98] ${
                      styleConfig.comfortDark
                        ? 'bg-slate-800 hover:bg-slate-750 text-indigo-400 border-slate-700'
                        : 'bg-white hover:bg-slate-50 text-indigo-600 border-slate-200'
                    }`}
                    title="Baixar lista de remédios em PDF"
                  >
                    <Download className="w-4 h-4 text-indigo-500" />
                    Gerar PDF (Imprimir)
                  </button>
                )}

                <button
                  onClick={() => {
                    // Reset form for adding new medicine
                    setEditingMedicineId(null);
                    setRecipeName('');
                    setRecipeDose('');
                    setRecipeTimesPerDay('1');
                    setRecipeTimes(['08:00']);
                    setRecipeInstructions('');
                    setIsAddingMedicine(!isAddingMedicine);
                  }}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isAddingMedicine ? (
                    <>Fechar Formulário</>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Adicionar Remédio
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Collapsible Add/Edit Form */}
            {isAddingMedicine && (
              <div className={`p-6 rounded-2xl border ${styleConfig.cardBg} ${styleConfig.cardBorder} shadow-md space-y-5 animate-in slide-in-from-top-3 duration-300`}>
                <div className="flex items-center justify-between border-b pb-2 border-slate-100 dark:border-slate-850">
                  <h3 className={`text-sm font-extrabold ${styleConfig.comfortDark ? 'text-slate-200' : 'text-slate-800'} flex items-center gap-1.5`}>
                    <Plus className="w-4 h-4 text-indigo-500" />
                    {editingMedicineId ? 'Editar Medicamento Receitado' : 'Adicionar Novo Medicamento à Receita'}
                  </h3>
                  <button 
                    type="button"
                    onClick={() => {
                      setIsAddingMedicine(false);
                      setEditingMedicineId(null);
                    }}
                    className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>

                <form onSubmit={async (e) => {
                  e.preventDefault();
                  if (!recipeName.trim()) {
                    alert('Por favor, informe o nome do remédio.');
                    return;
                  }

                  const medData: MyMedicine = {
                    id: editingMedicineId || 'manual_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
                    medicineName: recipeName.trim(),
                    dose: recipeDose.trim() || 'Sob demanda',
                    timesPerDay: recipeTimesPerDay,
                    times: [...recipeTimes].sort(),
                    instructions: recipeInstructions.trim() || 'Tomar conforme orientação médica.'
                  };

                  let updatedMeds: MyMedicine[];
                  if (editingMedicineId) {
                    updatedMeds = myMedicines.map(m => m.id === editingMedicineId ? medData : m);
                  } else {
                    updatedMeds = [...myMedicines, medData];
                  }

                  await saveMyMedicines(updatedMeds);
                  
                  // Reset form and close
                  setRecipeName('');
                  setRecipeDose('');
                  setRecipeTimesPerDay('1');
                  setRecipeTimes(['08:00']);
                  setRecipeInstructions('');
                  setEditingMedicineId(null);
                  setIsAddingMedicine(false);
                }} className="space-y-4 text-xs font-medium">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Medicine Name */}
                    <div className="space-y-1.5">
                      <label className={`text-[11px] font-bold uppercase tracking-wider ${styleConfig.comfortDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Nome do Medicamento *
                      </label>
                      <input
                        type="text"
                        required
                        value={recipeName}
                        onChange={(e) => setRecipeName(e.target.value)}
                        placeholder="Ex: Losartana Potássica, Metformina, etc."
                        className={`w-full px-4 py-2.5 rounded-xl border ${
                          styleConfig.comfortDark ? 'bg-slate-900 border-slate-800 text-slate-100 focus:ring-indigo-500' : 'bg-white border-slate-200 text-slate-800 focus:ring-indigo-500'
                        } focus:outline-none focus:ring-2`}
                      />
                    </div>

                    {/* Dosage */}
                    <div className="space-y-1.5">
                      <label className={`text-[11px] font-bold uppercase tracking-wider ${styleConfig.comfortDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Dose ou Dosagem
                      </label>
                      <input
                        type="text"
                        value={recipeDose}
                        onChange={(e) => setRecipeDose(e.target.value)}
                        placeholder="Ex: 50mg, 1 comprimido, 5ml"
                        className={`w-full px-4 py-2.5 rounded-xl border ${
                          styleConfig.comfortDark ? 'bg-slate-900 border-slate-800 text-slate-100 focus:ring-indigo-500' : 'bg-white border-slate-200 text-slate-800 focus:ring-indigo-500'
                        } focus:outline-none focus:ring-2`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Times per day select */}
                    <div className="space-y-1.5">
                      <label className={`text-[11px] font-bold uppercase tracking-wider ${styleConfig.comfortDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Quantas vezes ao dia?
                      </label>
                      <select
                        value={recipeTimesPerDay}
                        onChange={(e) => {
                          const val = e.target.value;
                          setRecipeTimesPerDay(val);
                          const count = val === 'Outro' ? 1 : parseInt(val, 10) || 1;
                          // prefill or crop times array
                          const newTimes = Array.from({ length: count }, (_, idx) => {
                            return recipeTimes[idx] || ['08:00', '14:00', '20:00', '22:00'][idx] || '08:00';
                          });
                          setRecipeTimes(newTimes);
                        }}
                        className={`w-full px-4 py-2.5 rounded-xl border ${
                          styleConfig.comfortDark ? 'bg-slate-900 border-slate-800 text-slate-100 focus:ring-indigo-500' : 'bg-white border-slate-200 text-slate-800 focus:ring-indigo-500'
                        } focus:outline-none focus:ring-2`}
                      >
                        <option value="1">1 vez ao dia</option>
                        <option value="2">2 vezes ao dia</option>
                        <option value="3">3 vezes ao dia</option>
                        <option value="4">4 vezes ao dia</option>
                        <option value="Outro">Outro / Sob Demanda</option>
                      </select>
                    </div>

                    {/* Specific Alarm Hours */}
                    <div className="space-y-1.5">
                      <label className={`text-[11px] font-bold uppercase tracking-wider ${styleConfig.comfortDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Definir Horários do Alarme
                      </label>
                      <div className="flex flex-wrap gap-2.5">
                        {recipeTimes.map((time, idx) => (
                          <div key={idx} className="flex items-center gap-1">
                            <span className="text-[10px] font-bold text-slate-450">#{idx + 1}:</span>
                            <input
                              type="time"
                              required
                              value={time}
                              onChange={(e) => {
                                const newTimes = [...recipeTimes];
                                newTimes[idx] = e.target.value;
                                setRecipeTimes(newTimes);
                              }}
                              className={`px-3 py-1.5 rounded-lg border text-xs font-bold ${
                                styleConfig.comfortDark ? 'bg-slate-900 border-slate-800 text-slate-250' : 'bg-white border-slate-200 text-slate-700'
                              }`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="space-y-1.5">
                    <label className={`text-[11px] font-bold uppercase tracking-wider ${styleConfig.comfortDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Instruções Adicionais (Como tomar)
                    </label>
                    <textarea
                      value={recipeInstructions}
                      onChange={(e) => setRecipeInstructions(e.target.value)}
                      placeholder="Ex: Tomar com água em jejum pela manhã, não partir ou mastigar..."
                      rows={3}
                      className={`w-full p-3 rounded-xl border ${
                        styleConfig.comfortDark ? 'bg-slate-900 border-slate-800 text-slate-100 focus:ring-indigo-500' : 'bg-white border-slate-200 text-slate-800 focus:ring-indigo-500'
                      } focus:outline-none focus:ring-2`}
                    ></textarea>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingMedicine(false);
                        setEditingMedicineId(null);
                      }}
                      className={`px-5 py-2.5 rounded-xl border font-bold text-xs transition-all cursor-pointer ${
                        styleConfig.comfortDark ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      {editingMedicineId ? 'Salvar Alterações' : 'Salvar Medicamento'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Interactive Daily Adherence Log Section */}
            {(myMedicines.length > 0 || Object.keys(reminders).length > 0) && (
              <div className={`p-5 rounded-2xl border ${styleConfig.cardBg} ${styleConfig.cardBorder} shadow-xs space-y-4 text-left animate-in fade-in slide-in-from-top-4 duration-300`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-850 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-indigo-50 dark:bg-slate-950/20 rounded-lg border border-indigo-100 dark:border-indigo-900/30 text-indigo-500 shrink-0">
                      <Heart className="w-5 h-5 text-indigo-500 animate-pulse" />
                    </div>
                    <div>
                      <h3 className={`text-sm font-extrabold ${styleConfig.comfortDark ? 'text-slate-100' : 'text-slate-800'}`}>
                        📋 Controle de Tomada de Hoje (Adesão Diária)
                      </h3>
                      <p className="text-[10px] text-slate-400 font-semibold">
                        Marque "Já tomei" ao consumir cada dose para manter seu tratamento em dia!
                      </p>
                    </div>
                  </div>
                  
                  {/* Progress info */}
                  {(() => {
                    const todaysScheduled = getTodaysScheduledDoses();
                    const takenTodayCount = todaysScheduled.filter(d => isDoseTakenToday(d.medicineName, d.time)).length;
                    const totalScheduledCount = todaysScheduled.length;
                    const percent = totalScheduledCount > 0 ? Math.round((takenTodayCount / totalScheduledCount) * 100) : 100;
                    
                    return (
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-xs font-black text-slate-700 dark:text-slate-300">
                            {takenTodayCount} de {totalScheduledCount} doses
                          </span>
                          <span className="text-[10px] text-indigo-500 dark:text-indigo-400 font-extrabold block">
                            {percent}% concluído hoje
                          </span>
                        </div>
                        <div className="w-12 h-12 rounded-full border-4 border-slate-150 dark:border-slate-800 flex items-center justify-center relative bg-slate-50 dark:bg-slate-900">
                          <span className="text-[10px] font-black text-slate-850 dark:text-slate-200">
                            {percent}%
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Grid list of today's scheduled doses */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {getTodaysScheduledDoses().map((dose) => {
                    const taken = isDoseTakenToday(dose.medicineName, dose.time);
                    const takenTime = getDoseTakenTimeToday(dose.medicineName, dose.time);

                    return (
                      <div 
                        key={dose.id} 
                        className={`p-3.5 rounded-xl border flex flex-col justify-between gap-3.5 transition-all ${
                          taken 
                            ? 'bg-emerald-500/5 border-emerald-500/20 dark:bg-emerald-500/10 dark:border-emerald-500/30' 
                            : styleConfig.comfortDark 
                            ? 'bg-slate-900/40 border-slate-800 hover:border-slate-750' 
                            : 'bg-slate-50/50 border-slate-150 hover:bg-slate-50 hover:border-slate-200'
                        }`}
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                            taken 
                              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                              : styleConfig.comfortDark 
                              ? 'bg-slate-850 text-indigo-400 border border-slate-800' 
                              : 'bg-indigo-50 text-indigo-600 border border-indigo-100/50'
                          }`}>
                            <Pill className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`px-2 py-0.5 text-[9px] font-black rounded-md border flex items-center gap-1 ${
                                taken 
                                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                                  : styleConfig.comfortDark 
                                  ? 'bg-slate-900 border-slate-800 text-indigo-400' 
                                  : 'bg-white border-indigo-100 text-indigo-600'
                              }`}>
                                <Clock className="w-2.5 h-2.5" />
                                {dose.time}
                              </span>
                              {dose.type === 'ebook' && (
                                <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-100/40">
                                  Livro
                                </span>
                              )}
                            </div>
                            <h4 className={`text-xs font-extrabold truncate mt-2 ${
                              taken 
                                ? 'text-emerald-700 dark:text-emerald-350 line-through' 
                                : styleConfig.comfortDark 
                                ? 'text-slate-200' 
                                : 'text-slate-700'
                            }`}>
                              {dose.medicineName}
                            </h4>
                            <p className="text-[9px] text-slate-400 truncate mt-0.5 font-medium">
                              {dose.dose}
                            </p>
                          </div>
                        </div>

                        {/* Action state button */}
                        <div>
                          {taken ? (
                            <div className="w-full py-2 bg-emerald-500/10 border border-emerald-500/25 rounded-lg text-[10px] font-black text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
                              <Check className="w-3.5 h-3.5" />
                              Tomado às {takenTime}
                            </div>
                          ) : (
                            <button
                              onClick={() => logDoseTaken(dose.medicineName, dose.dose, dose.time)}
                              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-lg text-[10px] transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Já tomei 👍
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* List / Recipe Dashboard Grid */}
            {myMedicines.length === 0 ? (
              /* Beautiful Empty State */
              <div className={`p-10 rounded-2xl border text-center ${styleConfig.cardBg} ${styleConfig.cardBorder} space-y-4 shadow-2xs`}>
                <div className="w-16 h-16 bg-indigo-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto border border-indigo-100 dark:border-slate-850">
                  <Pill className="w-8 h-8 text-indigo-500 animate-pulse" />
                </div>
                <div className="space-y-1.5 max-w-lg mx-auto">
                  <h3 className={`text-base font-extrabold ${styleConfig.comfortDark ? 'text-slate-200' : 'text-slate-800'}`}>
                    Sua prateleira de remédios está vazia!
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                    Comece a montar sua receita diária clicando em <strong>Adicionar Remédio</strong> acima para inserir manualmente. 
                  </p>
                  <p className="text-[11px] text-slate-400 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-850 mt-2 font-medium">
                    💡 <strong>Dica Inteligente:</strong> Ao navegar pelos E-books simplificados (Losartana, Metformina, etc.), você pode configurar horários diretamente nas páginas de posologia! Eles serão importados automaticamente para esta página e salvos na sua conta.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingMedicineId(null);
                    setRecipeName('');
                    setRecipeDose('');
                    setRecipeTimesPerDay('1');
                    setRecipeTimes(['08:00']);
                    setRecipeInstructions('');
                    setIsAddingMedicine(true);
                  }}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Cadastrar Meu Primeiro Remédio
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myMedicines.map((med) => (
                  <div 
                    key={med.id}
                    className={`p-5 rounded-2xl border ${styleConfig.cardBg} ${styleConfig.cardBorder} hover:shadow-md transition-all relative flex flex-col justify-between text-left shadow-xs`}
                  >
                    <div>
                      {/* Title and badges */}
                      <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-850 pb-3 mb-3">
                        <div className="min-w-0">
                          <h4 className={`text-sm font-extrabold truncate ${styleConfig.comfortDark ? 'text-slate-100' : 'text-slate-800'}`}>
                            {med.medicineName}
                          </h4>
                          <span className={`inline-block text-[9px] font-extrabold px-2 py-0.5 rounded-full mt-1 ${
                            styleConfig.comfortDark ? 'bg-slate-900 border border-slate-800 text-indigo-400' : 'bg-indigo-50 border border-indigo-100 text-indigo-600'
                          }`}>
                            💊 {med.dose || 'Dose sob demanda'}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => {
                              // Edit medicine
                              setEditingMedicineId(med.id);
                              setRecipeName(med.medicineName);
                              setRecipeDose(med.dose);
                              setRecipeTimesPerDay(med.timesPerDay);
                              setRecipeTimes(med.times);
                              setRecipeInstructions(med.instructions);
                              setIsAddingMedicine(true);
                              // Scroll form into view
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50/50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-indigo-100 dark:hover:border-slate-800"
                            title="Editar remédio"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={async () => {
                              if (confirm(`Remover ${med.medicineName} da sua lista de remédios?`)) {
                                const updated = myMedicines.filter(m => m.id !== med.id);
                                await saveMyMedicines(updated);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 rounded-lg transition-all cursor-pointer border border-transparent hover:border-rose-100 dark:hover:border-rose-950"
                            title="Remover remédio"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Schedule times list */}
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-bold text-slate-450 uppercase tracking-widest block font-bold">Horários definidos:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {med.times.map((t, tIdx) => (
                            <div key={tIdx} className={`px-2.5 py-1 text-xs font-extrabold rounded-lg border flex items-center gap-1 shadow-3xs ${
                              styleConfig.comfortDark 
                                ? 'bg-slate-900 border-slate-800/80 text-indigo-400' 
                                : 'bg-white border-indigo-100 text-indigo-600'
                            }`}>
                              <Clock className="w-3 h-3 animate-pulse text-indigo-500" />
                              {t}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Instructions */}
                      <div className="space-y-1 mt-3">
                        <span className="text-[9px] font-bold text-slate-450 uppercase tracking-widest block font-bold">Como tomar:</span>
                        <p className={`text-xs ${styleConfig.comfortDark ? 'text-slate-300 font-medium' : 'text-slate-650'} leading-relaxed`}>
                          {med.instructions}
                        </p>
                      </div>
                    </div>

                    {/* Source Link back to simplified Ebook */}
                    {med.sourceEbookKey && (
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-850/60 flex justify-end">
                        <button
                          onClick={() => {
                            setShowMyMedicines(false);
                            handlePresetSelect(med.sourceEbookKey!);
                          }}
                          className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 hover:underline cursor-pointer ${
                            styleConfig.comfortDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-650 hover:text-indigo-800'
                          }`}
                        >
                          Ver Guia Simplificado 📖
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Sticky/bottom instruction cards */}
            <div className={`p-5 rounded-2xl border ${styleConfig.cardBg} ${styleConfig.cardBorder} flex flex-col md:flex-row gap-5 items-center justify-between bg-gradient-to-r from-emerald-500/5 to-teal-500/5 dark:from-emerald-950/5 dark:to-teal-950/5`}>
              <div className="flex items-center gap-3 text-center md:text-left">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center shrink-0">
                  <Bell className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h4 className={`text-xs font-extrabold ${styleConfig.comfortDark ? 'text-slate-200' : 'text-slate-800'} uppercase tracking-wider`}>
                    🔔 Como funcionam os avisos?
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5 font-semibold">
                    Mantenha esta aba aberta no seu navegador ou celular. O sistema monitora seus remédios em tempo real e emite um alerta visual e sonoro sempre que atingir o horário da sua dose!
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : isCustomMode ? (
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
        ) : selectedCategory ? (
          /* Disease Folder Category Catalog Page */
          <div className="flex-1 p-4 md:p-8 flex flex-col max-w-5xl mx-auto w-full space-y-6 animate-in fade-in duration-300">
            {/* Header section with back button */}
            <div className={`flex items-center justify-between p-4 border-b ${styleConfig.subHeaderBorder} ${styleConfig.subHeaderBg} rounded-2xl mb-4 shadow-xs`}>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setShowHome(true);
                  }}
                  className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1.5 text-xs font-bold ${
                    styleConfig.comfortDark 
                      ? 'border-slate-800 bg-slate-900 text-indigo-400 hover:bg-slate-800 hover:text-indigo-300' 
                      : 'border-slate-200 bg-white text-indigo-600 hover:bg-slate-50 shadow-sm hover:text-indigo-700'
                  }`}
                  title="Voltar ao início"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Voltar ao Início
                </button>
                <div>
                  <h2 className={`text-base font-extrabold ${styleConfig.comfortDark ? 'text-slate-100' : 'text-slate-800'} leading-none`}>
                    Pasta: {getPresetDisplayName(selectedCategory, accessibilitySettings.simpleLanguage, selectedCategory)}
                  </h2>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {getPresetDisplaySubtitle(selectedCategory, accessibilitySettings.simpleLanguage, selectedCategory)}
                  </p>
                </div>
              </div>
            </div>

            {/* Disease Banner */}
            {(() => {
              const catConfig = [
                { id: 'hipertensao', label: 'Hipertensão', icon: Heart, bgGrad: 'from-emerald-500 to-teal-600', textLight: 'text-emerald-100', color: 'emerald', desc: 'A pressão alta acontece quando o sangue precisa fazer muita força para passar pelas veias. Aqui temos livrinhos interativos para te ajudar a entender cada tipo de remédio para a pressão!' },
                { id: 'diabetes', label: 'Diabetes', icon: Activity, bgGrad: 'from-blue-500 to-indigo-600', textLight: 'text-blue-100', color: 'blue', desc: 'O diabetes acontece quando o açúcar fica acumulado no sangue em vez de virar energia. Descubra como os medicamentos ajudam a limpar as fechaduras das células!' },
                { id: 'colesterol', label: 'Colesterol Alto', icon: ShieldAlert, bgGrad: 'from-amber-500 to-orange-600', textLight: 'text-amber-100', color: 'amber', desc: 'O colesterol e os triglicerídeos altos deixam gordura solta no sangue, o que pode entupir os vasos. Aprenda de forma simples como as estatinas e fibratos limpam essa gordura!' }
              ].find(c => c.id === selectedCategory);

              if (!catConfig) return null;
              const CatIcon = catConfig.icon;

              const categoryPresets = presets.filter(p => p.category === selectedCategory);

              return (
                <div className="space-y-6">
                  {/* Category Banner Card */}
                  <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-r ${catConfig.bgGrad} p-6 md:p-8 text-white shadow-lg`}>
                    {/* Decorative Background Circles */}
                    <div className="absolute right-[-20px] top-[-20px] w-48 h-48 rounded-full bg-white/10 blur-xl"></div>
                    <div className="absolute left-[30%] bottom-[-30px] w-36 h-36 rounded-full bg-white/5 blur-lg"></div>

                    <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                      <div className="space-y-3 max-w-2xl">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-md">
                            <CatIcon className="w-6 h-6 text-white" />
                          </div>
                          <span className="text-xs font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">
                            {categoryPresets.length} {categoryPresets.length === 1 ? 'Livro Disponível' : 'Livros Disponíveis'}
                          </span>
                        </div>
                        <h1 className="text-2xl md:text-4xl font-extrabold font-serif tracking-tight">
                          {getPresetDisplayName(selectedCategory, accessibilitySettings.simpleLanguage, catConfig.label)}
                        </h1>
                        <p className={`text-xs md:text-sm font-medium ${catConfig.textLight} leading-relaxed`}>
                          {catConfig.desc}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Catalog Header */}
                  <div>
                    <h3 className={`text-lg font-extrabold font-serif ${styleConfig.comfortDark ? 'text-slate-100' : 'text-slate-800'} tracking-tight`}>
                      Catálogo de Livrinhos Simplificados
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Escolha um medicamento abaixo para abrir o guia interativo de instruções:
                    </p>
                  </div>

                  {/* Grid of books */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {categoryPresets.map((preset) => {
                      return (
                        <div 
                          key={preset.key}
                          className={`rounded-2xl border ${styleConfig.cardBg} ${styleConfig.cardBorder} p-5 flex flex-col justify-between gap-5 transition-all shadow-md hover:shadow-xl hover:scale-[1.01]`}
                        >
                          <div className="flex gap-4 items-start">
                            {/* Decorative Book Cover */}
                            <div className={`w-20 h-28 rounded-xl bg-gradient-to-br ${catConfig.bgGrad} shadow-md shrink-0 flex flex-col justify-between p-2.5 text-white relative overflow-hidden`}>
                              <div className="absolute right-0 bottom-0 w-12 h-12 bg-white/10 rounded-tl-full"></div>
                              <span className="text-[8px] font-black uppercase tracking-widest bg-white/20 px-1 py-0.5 rounded text-center block">
                                MediQuês
                              </span>
                              <div className="space-y-0.5">
                                <p className="text-xs font-black tracking-tight leading-none text-center">
                                  {getPresetDisplayName(preset.key, true, preset.medicineName)}
                                </p>
                                <p className="text-[7px] text-white/80 text-center uppercase tracking-widest font-bold">
                                  Guia Ilustrado
                                </p>
                              </div>
                              <div className="flex justify-center">
                                <Pill className="w-4 h-4 text-white/90" />
                              </div>
                            </div>

                            {/* Book Info */}
                            <div className="space-y-1.5 flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h4 className={`text-sm font-extrabold ${styleConfig.comfortDark ? 'text-slate-100' : 'text-slate-900'} leading-none truncate`}>
                                  {getPresetDisplayName(preset.key, accessibilitySettings.simpleLanguage, preset.medicineName)}
                                </h4>
                                {preset.tags && preset.tags.length > 0 && (
                                  <span className="text-[8px] font-extrabold px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded uppercase tracking-wide">
                                    {preset.tags[0]}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-400 font-medium leading-snug line-clamp-2">
                                {getPresetDisplaySubtitle(preset.key, accessibilitySettings.simpleLanguage, preset.subtitle)}
                              </p>

                              {/* Included Topics Bullet hints */}
                              <div className="space-y-1 pt-1.5">
                                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Conteúdo Incluído:</span>
                                <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                                  {['Como funciona', 'Efeitos comuns', 'Dicas de segurança', 'Infográfico resumo'].map((topic, tIdx) => (
                                    <div key={tIdx} className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                                      <span className="truncate">{topic}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Action Button */}
                          <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3 mt-1">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                              <BookOpen className="w-3.5 h-3.5" />
                              E-book interativo
                            </span>
                            <button
                              onClick={() => {
                                handlePresetSelect(preset.key);
                              }}
                              className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition-all hover:scale-[1.03] active:scale-[0.97] cursor-pointer bg-gradient-to-r ${catConfig.bgGrad}`}
                            >
                              Ler Livrinho
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Help with custom medicine in category */}
                  <div className={`p-6 rounded-2xl border ${styleConfig.cardBg} ${styleConfig.cardBorder} flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm mt-6`}>
                    <div className="space-y-1 max-w-xl text-center md:text-left">
                      <h4 className={`text-sm font-extrabold ${styleConfig.comfortDark ? 'text-slate-100' : 'text-slate-900'} flex items-center justify-center md:justify-start gap-1.5`}>
                        <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
                        Toma outro remédio para {getPresetDisplayName(selectedCategory, accessibilitySettings.simpleLanguage, catConfig.label)}?
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed font-medium">
                        Se você usa outro remédio que não está na lista, nossa Inteligência Artificial pode criar um e-book personalizado e ilustrado para ele em poucos segundos!
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setIsCustomMode(true);
                        setSelectedCategory(null);
                        setMedicineName('');
                        setBulaText('');
                        setSimulatedFile(null);
                      }}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer whitespace-nowrap"
                    >
                      Criar Livrinho Personalizado
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        ) : viewingTagResults ? (
          /* Tag / Search Results Page */
          <div className="flex-1 p-4 md:p-8 flex flex-col max-w-5xl mx-auto w-full space-y-6 animate-in fade-in duration-300">
            {/* Header section with back button */}
            <div className={`flex items-center justify-between p-4 border-b ${styleConfig.subHeaderBorder} ${styleConfig.subHeaderBg} rounded-2xl mb-4 shadow-xs`}>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setViewingTagResults(false);
                    setSearchQuery('');
                    setSidebarInputVal('');
                    setHomeSearchQuery('');
                    setShowHome(true);
                  }}
                  className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1.5 text-xs font-bold ${
                    styleConfig.comfortDark 
                      ? 'border-slate-800 bg-slate-900 text-indigo-400 hover:bg-slate-800 hover:text-indigo-300' 
                      : 'border-slate-200 bg-white text-indigo-600 hover:bg-slate-50 shadow-sm hover:text-indigo-700'
                  }`}
                  title="Voltar ao início"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Voltar ao Início
                </button>
                <div>
                  <h2 className={`text-base font-extrabold ${styleConfig.comfortDark ? 'text-slate-100' : 'text-slate-800'} leading-none flex items-center gap-2`}>
                    {searchQuery.trim() ? (
                      <>
                        <Tag className="w-4 h-4 text-indigo-500 animate-bounce" />
                        Busca por: <span className="text-indigo-700 dark:text-indigo-300 bg-indigo-100/50 dark:bg-indigo-950/80 border border-indigo-200/50 dark:border-indigo-900/40 px-2 py-0.5 rounded-md">#{searchQuery}</span>
                      </>
                    ) : (
                      <>
                        <FolderOpen className="w-4 h-4 text-indigo-500" />
                        Explorar Pastas e E-books
                      </>
                    )}
                  </h2>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {searchQuery.trim() 
                      ? 'Mostrando todos os livrinhos simplificados que incluem esta tag ou termo de pesquisa.'
                      : 'Navegue por nossas pastas de saúde e descubra os guias simplificados disponíveis.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick folder match recommendation */}
            {(() => {
              const matchedCat = isMainTag(searchQuery);
              if (!matchedCat) return null;
              const catData = {
                hipertensao: { label: 'Pressão Alta', bgGrad: 'from-emerald-500 to-teal-600', desc: 'Ver todos os guias e e-books da pasta de Pressão Alta' },
                diabetes: { label: 'Diabetes', bgGrad: 'from-blue-500 to-indigo-600', desc: 'Ver todos os guias e e-books da pasta de Diabetes' },
                colesterol: { label: 'Colesterol Alto', bgGrad: 'from-amber-500 to-orange-600', desc: 'Ver todos os guias e e-books da pasta de Colesterol Alto' }
              }[matchedCat];

              if (!catData) return null;

              return (
                <div 
                  className={`p-4 md:p-5 rounded-2xl border bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent dark:from-indigo-500/5 dark:via-purple-500/2 dark:to-transparent ${styleConfig.cardBorder} flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs animate-in slide-in-from-top-2 duration-300`}
                >
                  <div className="flex items-center gap-3.5 text-center sm:text-left">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center shrink-0">
                      <FolderOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block">Sugestão de Pasta</span>
                      <h4 className={`text-sm font-extrabold ${styleConfig.comfortDark ? 'text-slate-100' : 'text-slate-800'}`}>
                        Abrir pasta de {catData.label}
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed font-medium">
                        {catData.desc}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setViewingTagResults(false);
                      setSelectedCategory(matchedCat);
                      setIsCustomMode(false);
                      setShowHome(false);
                      setSearchQuery('');
                      setSidebarInputVal('');
                      setSelectedPreset('');
                      setCurrentEbook(null);
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer whitespace-nowrap hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Abrir Pasta 📂
                  </button>
                </div>
              );
            })()}

            {!searchQuery.trim() ? (
              /* All Folders Explorer View when empty search guide */
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Meus Guias Section */}
                {(favoriteFolders.length > 0 || favoriteEbooks.length > 0) && (
                  <div className={`p-5 rounded-2xl border ${styleConfig.cardBg} ${styleConfig.cardBorder} space-y-4 shadow-sm text-left`}>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <h3 className={`text-xs font-bold uppercase tracking-widest block ${styleConfig.comfortDark ? 'text-slate-300' : 'text-slate-700'}`}>Meus Guias Favoritos</h3>
                    </div>

                    <div className="space-y-4">
                      {/* Favorite Folders */}
                      {favoriteFolders.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pastas Salvas</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {favoriteFolders.map(folderId => {
                              const catData = [
                                { id: 'hipertensao', label: 'Pressão Alta', icon: Heart, desc: 'Sartanas, Pris e controle de pressão.', color: 'text-emerald-600 bg-emerald-50/60 border-emerald-100 dark:border-emerald-950/40 dark:text-emerald-400 hover:border-emerald-200 hover:bg-emerald-50/80' },
                                { id: 'diabetes', label: 'Diabetes', icon: Activity, desc: 'Metformina, Gliflozinas e açúcar no sangue.', color: 'text-blue-600 bg-blue-50/60 border-blue-100 dark:border-blue-950/40 dark:text-blue-400 hover:border-blue-200 hover:bg-blue-50/80' },
                                { id: 'colesterol', label: 'Colesterol Alto', icon: ShieldAlert, desc: 'Estatinas, Fibratos e gordura no sangue.', color: 'text-amber-600 bg-amber-50/60 border-amber-100 dark:border-amber-950/40 dark:text-amber-400 hover:border-amber-200 hover:bg-amber-50/80' }
                              ].find(c => c.id === folderId);
                              
                              if (!catData) return null;
                              const CatIcon = catData.icon;
                              const count = presets.filter(p => p.category === folderId).length;
                              return (
                                <div key={folderId} className="relative group">
                                  <button
                                    onClick={() => {
                                      setSelectedCategory(folderId);
                                      setShowHome(false);
                                      setIsCustomMode(false);
                                      setSidebarOpen(true);
                                      setOpenFolders(prev => ({ ...prev, [folderId]: true }));
                                      setSelectedPreset('');
                                      setCurrentEbook(null);
                                    }}
                                    className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between gap-2.5 transition-all cursor-pointer shadow-xs hover:shadow-md hover:scale-[1.01] w-full ${catData.color}`}
                                  >
                                    <div className="flex justify-between items-start w-full">
                                      <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900 shadow-xs shrink-0 border border-slate-100 dark:border-slate-800">
                                        <CatIcon className="w-3.5 h-3.5" />
                                      </div>
                                      <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-500 mr-6">
                                        {count} {count === 1 ? 'Guia' : 'Guias'}
                                      </span>
                                    </div>
                                    <div>
                                      <h3 className={`text-xs font-extrabold ${styleConfig.comfortDark ? 'text-slate-200' : 'text-slate-800'}`}>📁 {catData.label}</h3>
                                    </div>
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      e.preventDefault();
                                      toggleFavoriteFolder(folderId);
                                    }}
                                    className="absolute top-3 right-3 p-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-amber-500 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors cursor-pointer"
                                    title="Remover dos favoritos"
                                  >
                                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Favorite Ebooks */}
                      {favoriteEbooks.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Guias de Medicamentos Salvos</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {favoriteEbooks.map(ebookKey => {
                              const preset = presets.find(p => p.key === ebookKey);
                              if (!preset) return null;
                              
                              return (
                                <div 
                                  key={ebookKey} 
                                  className={`relative rounded-xl border p-3 flex items-center justify-between gap-3 shadow-xs hover:shadow-md transition-all ${
                                    styleConfig.comfortDark 
                                      ? 'border-slate-800 bg-slate-900/30 hover:border-slate-700' 
                                      : 'border-slate-200 bg-white hover:bg-slate-50/50 hover:border-slate-250'
                                  }`}
                                >
                                  <button
                                    onClick={() => {
                                      handlePresetSelect(ebookKey);
                                    }}
                                    className="flex-1 text-left min-w-0 cursor-pointer"
                                  >
                                    <div className="flex items-center gap-1.5 min-w-0">
                                      <Pill className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                      <p className={`text-xs font-bold truncate ${styleConfig.comfortDark ? 'text-slate-100' : 'text-slate-850'}`}>
                                        {getPresetDisplayName(preset.key, accessibilitySettings.simpleLanguage, preset.medicineName)}
                                      </p>
                                    </div>
                                    <p className="text-[10px] text-slate-400 truncate mt-0.5 ml-5">
                                      {getPresetDisplaySubtitle(preset.key, accessibilitySettings.simpleLanguage, preset.subtitle)}
                                    </p>
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      e.preventDefault();
                                      toggleFavoriteEbook(ebookKey);
                                    }}
                                    className={`p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-amber-500 transition-colors shrink-0 cursor-pointer`}
                                    title="Remover dos favoritos"
                                  >
                                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { id: 'hipertensao', label: 'Pressão Alta', icon: Heart, bgGrad: 'from-emerald-500 to-teal-600', textLight: 'text-emerald-100', color: 'emerald', desc: 'A pressão alta acontece quando o sangue precisa fazer muita força.' },
                  { id: 'diabetes', label: 'Diabetes', icon: Activity, bgGrad: 'from-blue-500 to-indigo-600', textLight: 'text-blue-100', color: 'blue', desc: 'O diabetes acontece quando o açúcar fica acumulado no sangue.' },
                  { id: 'colesterol', label: 'Colesterol Alto', icon: ShieldAlert, bgGrad: 'from-amber-500 to-orange-600', textLight: 'text-amber-100', color: 'amber', desc: 'O colesterol alto deixa gordura solta no sangue.' }
                ].map((cat) => {
                  const categoryPresets = presets.filter(p => p.category === cat.id);
                  const CatIcon = cat.icon;

                  return (
                    <div 
                      key={cat.id} 
                      className={`rounded-2xl border ${styleConfig.cardBg} ${styleConfig.cardBorder} overflow-hidden shadow-md flex flex-col justify-between`}
                    >
                      <div>
                        {/* Folder Header */}
                        <div className={`bg-gradient-to-r ${cat.bgGrad} p-4 text-white flex items-center justify-between`}>
                          <div className="flex items-center gap-2">
                            <CatIcon className="w-4 h-4 shrink-0" />
                            <h4 className="text-xs font-extrabold font-serif truncate leading-none">
                              📁 {getPresetDisplayName(cat.id, accessibilitySettings.simpleLanguage, cat.label)}
                            </h4>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                toggleFavoriteFolder(cat.id);
                              }}
                              className="p-1 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
                              title={favoriteFolders.includes(cat.id) ? "Remover pasta dos favoritos" : "Adicionar pasta aos favoritos"}
                            >
                              <Star className={`w-3.5 h-3.5 ${favoriteFolders.includes(cat.id) ? 'fill-amber-500 text-amber-500' : 'text-white'}`} />
                            </button>
                            <span className="text-[8px] font-black uppercase tracking-widest bg-white/20 px-1.5 py-0.5 rounded-full shrink-0">
                              {categoryPresets.length} {categoryPresets.length === 1 ? 'Livro' : 'Livros'}
                            </span>
                          </div>
                        </div>

                        {/* List of Ebooks inside Folder */}
                        <div className="p-3 space-y-2">
                          {categoryPresets.map((preset) => (
                            <div key={preset.key} className="relative group/ebook-center">
                              <button
                                onClick={() => {
                                  setViewingTagResults(false);
                                  handlePresetSelect(preset.key);
                                }}
                                className={`w-full p-2.5 pr-10 rounded-xl border text-left flex items-center justify-between gap-2.5 transition-all cursor-pointer hover:shadow-xs hover:scale-[1.01] ${
                                  styleConfig.comfortDark 
                                    ? 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700 text-slate-200' 
                                    : 'bg-slate-50/50 border-slate-100 hover:bg-slate-50 hover:border-slate-250 text-slate-700'
                                }`}
                              >
                                <div className="min-w-0 flex-1 flex items-center gap-2 pr-2">
                                  <Pill className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                  <div className="min-w-0">
                                    <p className="text-[11px] font-extrabold truncate">
                                      {getPresetDisplayName(preset.key, accessibilitySettings.simpleLanguage, preset.medicineName)}
                                    </p>
                                    <p className="text-[9px] text-slate-400 truncate">
                                      {getPresetDisplaySubtitle(preset.key, accessibilitySettings.simpleLanguage, preset.subtitle)}
                                    </p>
                                  </div>
                                </div>
                                <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  toggleFavoriteEbook(preset.key);
                                }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-amber-500 transition-colors cursor-pointer"
                                title={favoriteEbooks.includes(preset.key) ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                              >
                                <Star className={`w-3.5 h-3.5 ${favoriteEbooks.includes(preset.key) ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Folder Link / Action */}
                      <div className="p-3 border-t border-slate-150/40 dark:border-slate-850/40 bg-slate-50/20 dark:bg-slate-950/10 flex justify-end">
                        <button
                          onClick={() => {
                            setViewingTagResults(false);
                            setSelectedCategory(cat.id);
                            setIsCustomMode(false);
                            setShowHome(false);
                          }}
                          className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 hover:underline cursor-pointer ${
                            styleConfig.comfortDark ? 'text-indigo-400' : 'text-indigo-650'
                          }`}
                        >
                          Ver Pasta Completa
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            ) : (
              <>
                {/* Results Header */}
                <div>
                  <h3 className={`text-lg font-extrabold font-serif ${styleConfig.comfortDark ? 'text-slate-100' : 'text-slate-800'} tracking-tight`}>
                    Guias Encontrados ({filteredPresets.length})
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {filteredPresets.length > 0 
                      ? 'Escolha um medicamento abaixo para abrir o guia interativo de instruções:'
                      : 'Nenhum guia pré-cadastrado atende a essa busca. Veja opções abaixo:'}
                  </p>
                </div>

                {/* Grid of books */}
                {filteredPresets.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredPresets.map((preset) => {
                      // Get theme color/gradient for this preset category
                      const presetCat = preset.category || '';
                      let bgGrad = 'from-indigo-500 to-purple-600';
                      if (presetCat === 'hipertensao') bgGrad = 'from-emerald-500 to-teal-600';
                      else if (presetCat === 'diabetes') bgGrad = 'from-blue-500 to-indigo-600';
                      else if (presetCat === 'colesterol') bgGrad = 'from-amber-500 to-orange-600';

                      return (
                        <div 
                          key={preset.key}
                          className={`rounded-2xl border ${styleConfig.cardBg} ${styleConfig.cardBorder} p-5 flex flex-col justify-between gap-5 transition-all shadow-md hover:shadow-xl hover:scale-[1.01]`}
                        >
                          <div className="flex gap-4 items-start">
                            {/* Decorative Book Cover */}
                            <div className={`w-20 h-28 rounded-xl bg-gradient-to-br ${bgGrad} shadow-md shrink-0 flex flex-col justify-between p-2.5 text-white relative overflow-hidden`}>
                              <div className="absolute right-0 bottom-0 w-12 h-12 bg-white/10 rounded-tl-full"></div>
                              <span className="text-[8px] font-black uppercase tracking-widest bg-white/20 px-1 py-0.5 rounded text-center block">
                                MediQuês
                              </span>
                              <div className="space-y-0.5">
                                <p className="text-xs font-black tracking-tight leading-none text-center">
                                  {getPresetDisplayName(preset.key, true, preset.medicineName)}
                                </p>
                                <p className="text-[7px] text-white/80 text-center uppercase tracking-widest font-bold">
                                  Guia Ilustrado
                                </p>
                              </div>
                              <div className="flex justify-center">
                                <Pill className="w-4 h-4 text-white/90" />
                              </div>
                            </div>

                            {/* Book Info */}
                            <div className="space-y-1.5 flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h4 className={`text-sm font-extrabold ${styleConfig.comfortDark ? 'text-slate-100' : 'text-slate-900'} leading-none truncate`}>
                                  {getPresetDisplayName(preset.key, accessibilitySettings.simpleLanguage, preset.medicineName)}
                                </h4>
                              </div>
                              <p className="text-xs text-slate-400 font-medium leading-snug line-clamp-2">
                                {getPresetDisplaySubtitle(preset.key, accessibilitySettings.simpleLanguage, preset.subtitle)}
                              </p>

                              {/* Included Topics Bullet hints */}
                              <div className="space-y-1 pt-1.5">
                                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Conteúdo Incluído:</span>
                                <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                                  {['Como funciona', 'Efeitos comuns', 'Dicas de segurança', 'Infográfico resumo'].map((topic, tIdx) => (
                                    <div key={tIdx} className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                                      <span className="truncate">{topic}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Render all Tags for this preset to show what matched */}
                              {preset.tags && preset.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {preset.tags.map((t: string) => {
                                    const isMatch = normalizeString(t).includes(normalizeString(searchQuery));
                                    return (
                                      <span 
                                        key={t} 
                                        className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                                          isMatch 
                                            ? 'bg-indigo-600 dark:bg-indigo-500 text-white animate-pulse shadow-sm' 
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                                        }`}
                                      >
                                        #{t}
                                      </span>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Action Button */}
                          <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3 mt-1">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                              <BookOpen className="w-3.5 h-3.5" />
                              E-book interativo
                            </span>
                            <button
                              onClick={() => {
                                setViewingTagResults(false);
                                handlePresetSelect(preset.key);
                              }}
                              className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition-all hover:scale-[1.03] active:scale-[0.97] cursor-pointer bg-gradient-to-r ${bgGrad}`}
                            >
                              Ler Livrinho
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center space-y-3 bg-slate-50/50 dark:bg-slate-900/10">
                    <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto animate-bounce" />
                    <h4 className={`text-sm font-extrabold ${styleConfig.comfortDark ? 'text-slate-100' : 'text-slate-900'}`}>
                      Nenhum guia pronto encontrado para "{searchQuery}"
                    </h4>
                    <p className="text-xs text-slate-450 max-w-md mx-auto leading-relaxed">
                      Não temos um guia pronto na nossa base para essa busca. Mas não se preocupe! Você pode usar a nossa Inteligência Artificial para gerar um guia completo, colorido e simplificado em poucos segundos.
                    </p>
                    <button
                      onClick={() => {
                        setViewingTagResults(false);
                        setIsCustomMode(true);
                        setMedicineName(searchQuery);
                        setBulaText('');
                        setSimulatedFile(null);
                      }}
                      className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
                      Gerar Guia com IA para "{searchQuery}"
                    </button>
                  </div>
                )}

                {/* "Pacientes também procuram" Section */}
                {(() => {
                  const similarRecs = getSimilarRecommendations(searchQuery, filteredPresets);
                  if (similarRecs.length === 0) return null;
                  return (
                    <div className="mt-8 space-y-4 animate-in fade-in duration-300">
                      <div className="flex items-center gap-2 border-b border-slate-150/60 dark:border-slate-800/60 pb-2.5">
                        <Pill className="w-4 h-4 text-indigo-500" />
                        <h3 className={`text-xs font-extrabold uppercase tracking-wider ${styleConfig.comfortDark ? 'text-slate-200' : 'text-slate-600'}`}>
                          pacientes também procuram
                        </h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {similarRecs.map((preset) => {
                          const presetCat = preset.category || '';
                          let bgGrad = 'from-indigo-500 to-purple-600';
                          if (presetCat === 'hipertensao') bgGrad = 'from-emerald-500 to-teal-600';
                          else if (presetCat === 'diabetes') bgGrad = 'from-blue-500 to-indigo-600';
                          else if (presetCat === 'colesterol') bgGrad = 'from-amber-500 to-orange-600';

                          return (
                            <div 
                              key={`rec-${preset.key}`}
                              className={`rounded-2xl border ${styleConfig.cardBg} ${styleConfig.cardBorder} p-5 flex flex-col justify-between gap-5 transition-all shadow-md hover:shadow-xl hover:scale-[1.01]`}
                            >
                              <div className="flex gap-4 items-start">
                                {/* Decorative Book Cover */}
                                <div className={`w-20 h-28 rounded-xl bg-gradient-to-br ${bgGrad} shadow-md shrink-0 flex flex-col justify-between p-2.5 text-white relative overflow-hidden`}>
                                  <div className="absolute right-0 bottom-0 w-12 h-12 bg-white/10 rounded-tl-full"></div>
                                  <span className="text-[8px] font-black uppercase tracking-widest bg-white/20 px-1 py-0.5 rounded text-center block">
                                    MediQuês
                                  </span>
                                  <div className="space-y-0.5">
                                    <p className="text-xs font-black tracking-tight leading-none text-center">
                                      {getPresetDisplayName(preset.key, true, preset.medicineName)}
                                    </p>
                                    <p className="text-[7px] text-white/80 text-center uppercase tracking-widest font-bold">
                                      Guia Ilustrado
                                    </p>
                                  </div>
                                  <div className="flex justify-center">
                                    <Pill className="w-4 h-4 text-white/90" />
                                  </div>
                                </div>

                                {/* Book Info */}
                                <div className="space-y-1.5 flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <h4 className={`text-sm font-extrabold ${styleConfig.comfortDark ? 'text-slate-100' : 'text-slate-900'} leading-none truncate`}>
                                      {getPresetDisplayName(preset.key, accessibilitySettings.simpleLanguage, preset.medicineName)}
                                    </h4>
                                  </div>
                                  <p className="text-xs text-slate-400 font-medium leading-snug line-clamp-2">
                                    {getPresetDisplaySubtitle(preset.key, accessibilitySettings.simpleLanguage, preset.subtitle)}
                                  </p>

                                  {/* Included Topics Bullet hints */}
                                  <div className="space-y-1 pt-1.5">
                                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Conteúdo Incluído:</span>
                                    <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                                      {['Como funciona', 'Efeitos comuns', 'Dicas de segurança', 'Infográfico resumo'].map((topic, tIdx) => (
                                        <div key={tIdx} className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                                          <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                                          <span className="truncate">{topic}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Action Button */}
                              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3 mt-1">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                                  <BookOpen className="w-3.5 h-3.5" />
                                  Recomendado
                                </span>
                                <button
                                  onClick={() => {
                                    setViewingTagResults(false);
                                    handlePresetSelect(preset.key);
                                  }}
                                  className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition-all hover:scale-[1.03] active:scale-[0.97] cursor-pointer bg-gradient-to-r ${bgGrad}`}
                                >
                                  Ler Livrinho
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {/* Help with custom medicine in tag page */}
                {filteredPresets.length > 0 && (
                  <div className={`p-6 rounded-2xl border ${styleConfig.cardBg} ${styleConfig.cardBorder} flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm mt-6`}>
                    <div className="space-y-1 max-w-xl text-center md:text-left">
                      <h4 className={`text-sm font-extrabold ${styleConfig.comfortDark ? 'text-slate-100' : 'text-slate-900'} flex items-center justify-center md:justify-start gap-1.5`}>
                        <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
                        Não achou o remédio exato na busca?
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed font-medium">
                        Se você usa outro remédio específico e quer uma explicação amigável, nossa Inteligência Artificial cria o livrinho ilustrado e interativo para você na hora!
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setViewingTagResults(false);
                        setIsCustomMode(true);
                        setMedicineName(searchQuery);
                        setBulaText('');
                        setSimulatedFile(null);
                      }}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer whitespace-nowrap"
                    >
                      Criar com Inteligência Artificial
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (selectedPreset && !currentEbook) || (isLoading && !currentEbook) ? (
          /* Show loading spinner while loading a preset */
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <RefreshCw className={`w-10 h-10 animate-spin ${styleConfig.comfortDark ? 'text-indigo-400' : 'text-blue-600'}`} />
            <p className={`text-xs font-bold mt-4 ${styleConfig.comfortDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Montando seu guia de saúde ilustrado...
            </p>
          </div>
        ) : !currentEbook ? (
          /* Disease Folders Explorer View in Center when no medication is active */
          <div className="flex-1 p-6 md:p-10 flex flex-col max-w-5xl mx-auto w-full justify-center space-y-8 animate-in fade-in duration-300">
            <div className="text-center space-y-3 max-w-2xl mx-auto mb-2">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block">Explore por Categoria</span>
              <h2 className={`text-2xl md:text-3xl font-extrabold ${styleConfig.comfortDark ? 'text-slate-100' : 'text-slate-800'} tracking-tight`}>
                Pastas de Doenças
              </h2>
              <p className="text-sm text-slate-400 font-medium">
                Selecione um guia nas pastas abaixo para abrir o e-book interativo ou crie um livrinho personalizado para qualquer outro remédio.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { id: 'hipertensao', label: 'Pressão Alta', icon: Heart, bgGrad: 'from-emerald-500 to-teal-600', textLight: 'text-emerald-100', color: 'emerald', desc: 'A pressão alta acontece quando o sangue precisa fazer muita força.' },
                { id: 'diabetes', label: 'Diabetes', icon: Activity, bgGrad: 'from-blue-500 to-indigo-600', textLight: 'text-blue-100', color: 'blue', desc: 'O diabetes acontece quando o açúcar fica acumulado no sangue.' },
                { id: 'colesterol', label: 'Colesterol Alto', icon: ShieldAlert, bgGrad: 'from-amber-500 to-orange-600', textLight: 'text-amber-100', color: 'amber', desc: 'O colesterol alto deixa gordura solta no sangue.' }
              ].map((cat) => {
                const categoryPresets = presets.filter(p => p.category === cat.id);
                const CatIcon = cat.icon;

                return (
                  <div 
                    key={cat.id} 
                    className={`rounded-2xl border ${styleConfig.cardBg} ${styleConfig.cardBorder} overflow-hidden shadow-md flex flex-col justify-between`}
                  >
                    <div>
                      {/* Folder Header */}
                      <div className={`bg-gradient-to-r ${cat.bgGrad} p-4 text-white flex items-center justify-between`}>
                        <div className="flex items-center gap-2">
                          <CatIcon className="w-4 h-4 shrink-0" />
                          <h4 className="text-xs font-extrabold font-serif truncate leading-none">
                            📁 {getPresetDisplayName(cat.id, accessibilitySettings.simpleLanguage, cat.label)}
                          </h4>
                        </div>
                        <span className="text-[8px] font-black uppercase tracking-widest bg-white/20 px-1.5 py-0.5 rounded-full shrink-0">
                          {categoryPresets.length} {categoryPresets.length === 1 ? 'Livro' : 'Livros'}
                        </span>
                      </div>

                      {/* List of Ebooks inside Folder */}
                      <div className="p-3 space-y-2">
                        {categoryPresets.map((preset) => (
                          <button
                            key={preset.key}
                            onClick={() => {
                              setViewingTagResults(false);
                              handlePresetSelect(preset.key);
                            }}
                            className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between gap-2.5 transition-all cursor-pointer hover:shadow-xs hover:scale-[1.01] ${
                              styleConfig.comfortDark 
                                ? 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700 text-slate-200' 
                                : 'bg-slate-50/50 border-slate-100 hover:bg-slate-50 hover:border-slate-250 text-slate-700'
                            }`}
                          >
                            <div className="min-w-0 flex-1 flex items-center gap-2">
                              <Pill className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                              <div className="min-w-0">
                                <p className="text-[11px] font-extrabold truncate">
                                  {getPresetDisplayName(preset.key, accessibilitySettings.simpleLanguage, preset.medicineName)}
                                </p>
                                  <p className="text-[9px] text-slate-400 truncate">
                                  {getPresetDisplaySubtitle(preset.key, accessibilitySettings.simpleLanguage, preset.subtitle)}
                                </p>
                              </div>
                            </div>
                            <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Folder Link / Action */}
                    <div className="p-3 border-t border-slate-150/40 dark:border-slate-850/40 bg-slate-50/20 dark:bg-slate-950/10 flex justify-end">
                      <button
                        onClick={() => {
                          setViewingTagResults(false);
                          setSelectedCategory(cat.id);
                          setIsCustomMode(false);
                          setShowHome(false);
                          setSelectedPreset('');
                          setCurrentEbook(null);
                        }}
                        className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 hover:underline cursor-pointer ${
                          styleConfig.comfortDark ? 'text-indigo-400' : 'text-indigo-650'
                        }`}
                      >
                        Ver Pasta Completa
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Medication Reminders Dashboard Section */}
            <div className={`p-6 rounded-2xl border ${styleConfig.cardBg} ${styleConfig.cardBorder} space-y-4 shadow-sm text-left`}>
              <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-500 animate-pulse" />
                  <h3 className={`text-xs font-bold uppercase tracking-widest block ${styleConfig.comfortDark ? 'text-slate-100' : 'text-slate-800'}`}>
                    ⏱️ Meus Lembretes de Horários
                  </h3>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                  {Object.keys(reminders).length} {Object.keys(reminders).length === 1 ? 'Lembrete' : 'Lembretes'}
                </span>
              </div>

              {Object.keys(reminders).length === 0 ? (
                <div className="text-center py-6 space-y-1">
                  <p className={`text-xs font-semibold ${styleConfig.comfortDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Nenhum lembrete configurado ainda.
                  </p>
                  <p className="text-[11px] text-slate-400 max-w-lg mx-auto">
                    Ao ler as páginas de posologia (como tomar) de qualquer e-book de medicamento, você pode definir um horário diário de lembrete para receber o aviso.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {Object.entries(reminders).map(([key, time]) => {
                    const index = key.indexOf('_');
                    const medicineName = index !== -1 ? key.substring(0, index) : 'Medicamento';
                    const sectionTitle = index !== -1 ? key.substring(index + 1) : key;

                    return (
                      <div 
                        key={key} 
                        className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 shadow-xs hover:shadow-sm transition-all ${
                          styleConfig.comfortDark 
                            ? 'bg-slate-900/40 border-slate-800 hover:border-slate-700' 
                            : 'bg-slate-50/50 border-slate-150 hover:bg-slate-50 hover:border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`p-2.5 rounded-lg shrink-0 ${
                            styleConfig.comfortDark ? 'bg-slate-850 text-indigo-400 border border-slate-800' : 'bg-indigo-50/60 text-indigo-600 border border-indigo-100/50'
                          }`}>
                            <Pill className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <h4 className={`text-xs font-bold truncate ${styleConfig.comfortDark ? 'text-slate-200' : 'text-slate-700'}`}>
                              {sectionTitle}
                            </h4>
                            <p className="text-[10px] text-slate-400 truncate">
                              Remédio: {medicineName}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`px-2 py-1 text-xs font-extrabold rounded-lg border flex items-center gap-1 shadow-xs ${
                            styleConfig.comfortDark 
                              ? 'bg-slate-900 border-slate-800 text-indigo-400' 
                              : 'bg-white border-indigo-100 text-indigo-600'
                          }`}>
                            <Clock className="w-3 h-3" />
                            {time}
                          </div>
                          <button
                            onClick={() => saveReminder(key, '')}
                            className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 rounded-lg transition-all cursor-pointer border border-transparent hover:border-rose-100 dark:hover:border-rose-950"
                            title="Remover lembrete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Help with custom medicine */}
            <div className={`p-6 rounded-2xl border ${styleConfig.cardBg} ${styleConfig.cardBorder} flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm`}>
              <div className="space-y-1 max-w-xl text-center md:text-left">
                <h4 className={`text-sm font-extrabold ${styleConfig.comfortDark ? 'text-slate-100' : 'text-slate-900'} flex items-center justify-center md:justify-start gap-1.5`}>
                  <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
                  Precisa de ajuda com outro remédio?
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  Se você usa outro remédio específico e quer uma explicação amigável, nossa Inteligência Artificial cria o livrinho ilustrado e interativo para você na hora!
                </p>
              </div>
              <button
                onClick={() => {
                  setViewingTagResults(false);
                  setIsCustomMode(true);
                  setMedicineName('');
                  setBulaText('');
                  setSimulatedFile(null);
                }}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer whitespace-nowrap"
              >
                Criar com Inteligência Artificial
              </button>
            </div>
          </div>
        ) : (
          /* Simplified E-book Workspace */
          <div ref={ebookWorkspaceRef} className="flex-1 flex flex-col justify-between p-4 md:p-8">
            
            {/* Header / Workspace controls */}
            <header className={`flex flex-col sm:flex-row gap-4 items-center justify-between px-4 py-2 border-b ${styleConfig.subHeaderBorder} ${styleConfig.subHeaderBg} rounded-2xl mb-4 md:mb-6 transition-all duration-300`}>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setShowHome(true);
                    stopSpeaking();
                  }}
                  className={`px-3 py-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0 text-xs font-bold ${
                    styleConfig.comfortDark 
                      ? 'border-slate-800 bg-slate-900 text-indigo-400 hover:bg-slate-800 hover:text-indigo-300' 
                      : 'border-slate-200 bg-white text-indigo-600 hover:bg-slate-50 shadow-sm hover:text-indigo-700'
                  }`}
                  title="Voltar ao início"
                >
                  <Home className="w-3.5 h-3.5" />
                  Início
                </button>
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
              <div className="flex items-center gap-3 flex-wrap justify-end">
                {(() => {
                  const isPremiumUnlocked = currentEbook && (
                    unlockedMedicines.includes(currentEbook.medicineName + "_full") || 
                    unlockedMedicines.includes("ebook_completo")
                  );

                  return isPremiumUnlocked ? (
                    <button
                      id="download-pdf-btn"
                      onClick={downloadEbookPDF}
                      className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:scale-[1.02] active:scale-[0.98]"
                      title="Baixar Guia completo em PDF"
                    >
                      <Download className="w-4 h-4" />
                      Baixar PDF
                    </button>
                  ) : (
                    <button
                      id="download-pdf-btn-locked"
                      onClick={() => currentEbook && setPaywallModalMedicine(currentEbook.medicineName + "_full")}
                      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                        styleConfig.comfortDark 
                          ? 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850' 
                          : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200 shadow-sm'
                      }`}
                      title="Liberar versão Premium para baixar o PDF"
                    >
                      <Lock className="w-3.5 h-3.5 text-amber-500" />
                      Baixar PDF (Bloqueado)
                    </button>
                  );
                })()}

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

            {/* Simulated Printed Ebook Page Card & Medical Glossary */}
            <div className="flex-1 flex flex-col lg:flex-row lg:items-start lg:justify-center gap-6 py-4 md:py-8 w-full max-w-[1400px] mx-auto">
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

                  const totalPages = currentEbook?.pages?.length || 1;
                  const progressPercentage = Math.round(((currentPageIndex + 1) / totalPages) * 100);
                  const progressColor = 
                    styleConfig.themeKey === 'emerald' ? 'bg-emerald-500' :
                    styleConfig.themeKey === 'amber' ? 'bg-amber-500' :
                    styleConfig.themeKey === 'blue' ? 'bg-blue-500' :
                    styleConfig.themeKey === 'green' ? 'bg-green-500' :
                    styleConfig.themeKey === 'rose' ? 'bg-rose-500' :
                    'bg-indigo-500';

                  return (
                    <>
                      <article 
                        id={`ebook-page-${page.pageNumber}`}
                        className={`w-full ${cardMaxWidth} ${cardMinHeight} ${styleConfig.cardBg} ${styleConfig.cardBorder} rounded-2xl p-5 md:p-10 flex flex-col relative transition-all duration-300`}
                      >
                      {/* Reading Progress and Dropdown Table of Contents (Sumário) */}
                      <div className="flex items-center justify-between gap-4 mb-5 md:mb-6 select-none">
                        {/* Reading Progress Indicator */}
                        <div className="flex items-center gap-2">
                          <div className="h-2.5 w-20 rounded-full bg-slate-100 dark:bg-slate-850 overflow-hidden relative border border-slate-200 dark:border-slate-800 shadow-xs">
                            <div 
                              className={`h-full ${progressColor} transition-all duration-300 rounded-full`} 
                              style={{ width: `${progressPercentage}%` }}
                            />
                          </div>
                          <span className={`text-[11px] font-black font-sans leading-none ${styleConfig.comfortDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {progressPercentage}%
                          </span>
                        </div>

                        {/* Interactive Sumário Dropdown (Upper Right Corner of the Card) */}
                        <div className="relative" id="summary-dropdown">
                          <button
                            onClick={() => setSummaryDropdownOpen(!summaryDropdownOpen)}
                            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                              styleConfig.comfortDark 
                                ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-200' 
                                : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                            }`}
                            title="Ver Sumário do Guia"
                          >
                            <FileText className="w-3.5 h-3.5 text-indigo-500" />
                            <span>Sumário</span>
                            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${summaryDropdownOpen ? 'rotate-180' : ''}`} />
                          </button>

                          {summaryDropdownOpen && (
                            <div className={`absolute right-0 top-full mt-2 w-64 rounded-2xl p-4 border shadow-xl z-30 flex flex-col space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-200 ${
                              styleConfig.comfortDark
                                ? 'bg-slate-900 border-slate-800'
                                : 'bg-white border-slate-200'
                            }`}>
                              <div className="flex items-center justify-between border-b pb-2 border-slate-100 dark:border-slate-850">
                                <span className={`text-[10px] font-black uppercase tracking-wider ${styleConfig.comfortDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                  Páginas do Guia
                                </span>
                                <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                                  {currentEbook.pages.length} págs
                                </span>
                              </div>

                              <div className="space-y-1.5 overflow-y-auto max-h-[220px] pr-1 scrollbar-thin">
                                {currentEbook.pages.map((p, idx) => {
                                  const isPageActive = currentPageIndex === idx;
                                  const isPageLocked = p.pageNumber >= 3 && 
                                    !unlockedMedicines.includes(currentEbook.medicineName + "_full") && 
                                    !unlockedMedicines.includes("ebook_completo");

                                  return (
                                    <button
                                      key={idx}
                                      onClick={() => {
                                        setCurrentPageIndex(idx);
                                        setSummaryDropdownOpen(false);
                                        stopSpeaking();
                                        if (isPageLocked) {
                                          setPaywallModalMedicine(currentEbook.medicineName + "_full");
                                        }
                                      }}
                                      className={`w-full p-2 rounded-xl text-left transition-all duration-200 flex items-center justify-between border cursor-pointer ${
                                        isPageActive
                                          ? (styleConfig.themeKey === 'emerald' 
                                              ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/20 dark:border-emerald-800 dark:text-emerald-300 font-extrabold shadow-xs' 
                                              : styleConfig.themeKey === 'amber'
                                                ? 'bg-amber-50/50 border-amber-200 text-amber-900 dark:bg-amber-950/20 dark:border-amber-800 dark:text-amber-300 font-extrabold shadow-xs'
                                                : styleConfig.themeKey === 'blue'
                                                  ? 'bg-blue-50/50 border-blue-200 text-blue-900 dark:bg-blue-950/20 dark:border-blue-800 dark:text-blue-300 font-extrabold shadow-xs'
                                                  : 'bg-indigo-50/50 border-indigo-200 text-indigo-900 dark:bg-indigo-950/20 dark:border-indigo-800 dark:text-indigo-300 font-extrabold shadow-xs')
                                          : `${styleConfig.comfortDark ? 'hover:bg-slate-800/60 border-transparent text-slate-350 bg-slate-900/10' : 'hover:bg-slate-50 border-transparent text-slate-600 bg-slate-50/40'}`
                                      }`}
                                    >
                                      <div className="flex items-center gap-2 min-w-0 flex-1">
                                        <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md ${
                                          isPageActive
                                            ? (styleConfig.themeKey === 'emerald' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300' : styleConfig.themeKey === 'amber' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300' : styleConfig.themeKey === 'blue' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300')
                                            : `${styleConfig.comfortDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`
                                        }`}>
                                          {p.pageNumber.toString().padStart(2, '0')}
                                        </span>
                                        <span className={`text-[11px] truncate font-sans ${isPageActive ? 'font-bold' : 'font-medium'}`}>
                                          {p.title}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1.5 flex-shrink-0">
                                        {isPageLocked && (
                                          <span className="p-1 rounded bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                                            <Lock className="w-2.5 h-2.5" />
                                          </span>
                                        )}
                                        {isPageActive && (
                                          <span className={`w-1.5 h-1.5 rounded-full ${
                                            styleConfig.themeKey === 'emerald' ? 'bg-emerald-500' : styleConfig.themeKey === 'amber' ? 'bg-amber-500' : styleConfig.themeKey === 'blue' ? 'bg-blue-500' : 'bg-indigo-500'
                                          } animate-pulse`} />
                                        )}
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
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
                                <div className="flex-1 flex flex-col justify-between">
                                  <div>
                                    {renderSectionContent(section.content, styleConfig, accessibilitySettings)}
                                  </div>
                                  {isPosologySection(section, page) && (
                                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between gap-2">
                                      <div className="flex items-center gap-1">
                                        <Clock className="w-3 h-3 text-indigo-500" />
                                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                                          Lembrete:
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1.5">
                                        <input
                                          type="time"
                                          value={reminders[`${currentEbook?.medicineName || 'custom'}_${section.title}`] || ''}
                                          onChange={(e) => saveReminder(`${currentEbook?.medicineName || 'custom'}_${section.title}`, e.target.value)}
                                          className={`px-1.5 py-0.5 text-[10px] rounded border focus:ring-1 focus:ring-indigo-500 focus:outline-hidden ${
                                            styleConfig.comfortDark 
                                              ? 'bg-slate-900 border-slate-800 text-slate-200' 
                                              : 'bg-white border-slate-200 text-slate-700 shadow-xs'
                                          }`}
                                        />
                                        {reminders[`${currentEbook?.medicineName || 'custom'}_${section.title}`] && (
                                          <button
                                            onClick={() => saveReminder(`${currentEbook?.medicineName || 'custom'}_${section.title}`, '')}
                                            className="px-1.5 py-0.5 text-[9px] font-bold text-rose-500 hover:text-rose-600 bg-rose-50 dark:bg-rose-950/25 rounded hover:scale-[1.02] transition-all cursor-pointer border border-rose-100/50"
                                            title="Limpar lembrete"
                                          >
                                            Limpar
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  )}
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
                            const isSub = section.isSubtopic;
                            const isNextSubtopic = page.sections[idx + 1]?.isSubtopic;

                            return (
                              <section 
                                key={idx} 
                                className={`flex flex-col sm:flex-row gap-3 sm:gap-4 items-start p-4 rounded-xl border ${cardBg} transition-all relative ${isSub ? 'ml-6 sm:ml-12 border-dashed shadow-sm' : 'overflow-hidden'}`}
                              >
                                {isSub && (
                                  <>
                                    {/* Vertical line connecting downwards if there is a next subtopic, or stopping here if last */}
                                    <div 
                                      className="absolute left-[-24px] sm:left-[-48px] top-[-20px] pointer-events-none border-l-2 border-dashed border-slate-300 dark:border-slate-600"
                                      style={{
                                        height: isNextSubtopic ? 'calc(100% + 40px)' : '44px'
                                      }}
                                    />
                                    {/* Horizontal branch line to this card */}
                                    <div 
                                      className="absolute left-[-24px] sm:left-[-48px] top-[24px] w-[24px] sm:w-[48px] border-b-2 border-dashed border-slate-300 dark:border-slate-600 pointer-events-none"
                                    />
                                  </>
                                )}
                                <div className="flex items-center sm:items-start gap-2.5 sm:gap-0 shrink-0 w-full sm:w-auto">
                                  <div className={`flex-shrink-0 bg-white p-2 rounded-xl shadow-sm border border-slate-100 ${isLocked ? 'filter blur-[1px] opacity-40' : ''} ${styleConfig.comfortDark ? '!bg-slate-800 border-slate-700' : ''}`}>
                                    {getIconComponent(section.icon, iconColor)}
                                  </div>
                                  {/* Mobile Title block */}
                                  <div className="sm:hidden flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <h4 className={`text-sm font-bold font-serif ${textColor} ${isLocked ? 'filter blur-[1px] opacity-40 select-none' : ''} leading-snug flex items-center gap-1`}>
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
                                    <h4 className={`text-sm font-bold font-serif ${textColor} ${isLocked ? 'filter blur-[1px] opacity-40 select-none' : ''} flex items-center gap-1`}>
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
                                    <>
                                      {renderSectionContent(section.content, styleConfig, accessibilitySettings)}
                                      {isPosologySection(section, page) && (
                                        <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
                                          <div className="flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5 text-indigo-500" />
                                            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                                              Definir lembrete diário:
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <input
                                              type="time"
                                              value={reminders[`${currentEbook?.medicineName || 'custom'}_${section.title}`] || ''}
                                              onChange={(e) => saveReminder(`${currentEbook?.medicineName || 'custom'}_${section.title}`, e.target.value)}
                                              className={`px-2 py-1 text-xs rounded-lg border focus:ring-1 focus:ring-indigo-500 focus:outline-hidden ${
                                                styleConfig.comfortDark 
                                                  ? 'bg-slate-900 border-slate-800 text-slate-200' 
                                                  : 'bg-white border-slate-200 text-slate-700 shadow-xs'
                                              }`}
                                            />
                                            {reminders[`${currentEbook?.medicineName || 'custom'}_${section.title}`] && (
                                              <button
                                                onClick={() => saveReminder(`${currentEbook?.medicineName || 'custom'}_${section.title}`, '')}
                                                className="px-2 py-1 text-[10px] font-bold text-rose-500 hover:text-rose-600 bg-rose-50 dark:bg-rose-950/20 rounded-lg hover:scale-[1.02] transition-all cursor-pointer border border-rose-100/50 dark:border-rose-950/50"
                                                title="Limpar lembrete"
                                              >
                                                Limpar
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </>
                                  )}
                                </div>
                              </section>
                            );
                          })}
                        </div>
                      )}

                      {/* Footer page elements */}
                      <footer className={`mt-6 flex justify-between items-center pt-5 border-t ${styleConfig.comfortDark ? 'border-slate-800' : 'border-slate-100'}`}>
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

                    {/* Glossário e Sumário do Ebook Side Column */}
                    <div className="w-full lg:w-[350px] shrink-0 flex flex-col gap-4 self-stretch lg:self-auto">
                      {/* Glossário de Termos Médicos Card */}
                      <div className={`w-full ${styleConfig.cardBg} ${styleConfig.cardBorder} rounded-2xl p-5 flex flex-col space-y-4 transition-all duration-300 shadow-sm`}>
                        {/* Glossary Header */}
                        <div 
                          onClick={() => setGlossaryMinimized(!glossaryMinimized)}
                          className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-850 cursor-pointer select-none"
                        >
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-lg ${styleConfig.comfortDark ? 'bg-indigo-950/40 text-indigo-400' : 'bg-indigo-50 text-indigo-650'}`}>
                              <BookOpen className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className={`text-xs font-black uppercase tracking-wider ${styleConfig.comfortDark ? 'text-slate-100' : 'text-slate-900'}`}>
                                Glossário Médico
                              </h4>
                              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                                {accessibilitySettings.simpleLanguage ? 'Modo de Leitura Auxiliar' : 'Modo Científico Ativo'}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200/40 dark:border-indigo-800/40">
                              {MEDICAL_GLOSSARY.length} termos
                            </span>
                            <div className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-450 transition-colors">
                              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${glossaryMinimized ? 'transform -rotate-90' : 'transform rotate-0'}`} />
                            </div>
                          </div>
                        </div>

                        {/* Glossary Body */}
                        {!glossaryMinimized && (
                          <div className="flex flex-col space-y-4 flex-1 animate-in fade-in duration-300">
                            {/* Glossary Info Tip */}
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed">
                              {accessibilitySettings.simpleLanguage 
                                ? "Consulte termos médicos avançados e suas definições científicas a qualquer momento para enriquecer sua leitura."
                                : "Como a linguagem simples está desativada, este guia exibe termos técnicos avançados da Diretriz 2025. Use o glossário abaixo para consulta."
                              }
                            </p>

                            {/* Search box */}
                            <div className="relative">
                              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                              <input
                                type="text"
                                placeholder="Buscar termo médico..."
                                value={glossarySearch}
                                onChange={(e) => setGlossarySearch(e.target.value)}
                                className={`w-full pl-8 pr-8 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                  styleConfig.comfortDark 
                                    ? 'bg-slate-900 border-slate-800 text-slate-200 placeholder:text-slate-500' 
                                    : 'bg-slate-50 border-slate-200 text-slate-700 placeholder:text-slate-400'
                                }`}
                              />
                              {glossarySearch && (
                                <button
                                  onClick={() => setGlossarySearch('')}
                                  className="text-[10px] font-bold text-slate-400 hover:text-slate-600 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                                >
                                  Limpar
                                </button>
                              )}
                            </div>

                            {/* Terms List */}
                            <div className="flex-1 overflow-y-auto max-h-[300px] lg:max-h-[380px] pr-1 space-y-2 scrollbar-thin">
                              {(() => {
                                const isEbookLocked = !unlockedMedicines.includes(currentEbook.medicineName + "_full") && 
                                  !unlockedMedicines.includes("ebook_completo");

                                // Filter and sort glossary terms
                                const filteredTerms = MEDICAL_GLOSSARY.filter(item => {
                                  const definitionToMatch = (accessibilitySettings.simpleLanguage && item.simpleDefinition)
                                    ? item.simpleDefinition
                                    : item.definition;
                                  const matchesSearch = item.term.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(
                                    glossarySearch.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                                  ) || definitionToMatch.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(
                                    glossarySearch.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                                  );
                                  return matchesSearch;
                                });

                                // Limit the terms shown if ebook is locked
                                const displayTerms = isEbookLocked ? filteredTerms.slice(0, 2) : filteredTerms;

                                // Divide into "On this page" and "Others"
                                const currentTerms = displayTerms.filter(t => isTermInPage(t.term));
                                const otherTerms = displayTerms.filter(t => !isTermInPage(t.term));

                                if (filteredTerms.length === 0) {
                                  return (
                                    <div className="text-center py-6">
                                      <HelpCircle className="w-6 h-6 text-slate-350 mx-auto mb-1.5" />
                                      <p className="text-[10px] text-slate-450 font-bold">Nenhum termo encontrado</p>
                                    </div>
                                  );
                                }

                                const renderTermCard = (item: typeof MEDICAL_GLOSSARY[0], isCurrent: boolean) => {
                                  const isExpanded = expandedGlossaryTerm === item.term;
                                  const isTermReading = glossaryReading === item.term;
                                  const definitionToDisplay = (accessibilitySettings.simpleLanguage && item.simpleDefinition)
                                    ? item.simpleDefinition
                                    : item.definition;

                                  return (
                                    <div 
                                      key={item.term} 
                                      className={`rounded-xl border transition-all ${
                                        isExpanded
                                          ? styleConfig.comfortDark 
                                            ? 'bg-slate-900 border-indigo-500/50 shadow-md shadow-indigo-950/10' 
                                            : 'bg-indigo-50/20 border-indigo-200 shadow-xs'
                                          : styleConfig.comfortDark
                                            ? 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700'
                                            : 'bg-white border-slate-100 hover:bg-slate-50/50 hover:border-slate-200'
                                      }`}
                                    >
                                      {/* Header toggle */}
                                      <button
                                        onClick={() => setExpandedGlossaryTerm(isExpanded ? null : item.term)}
                                        className="w-full p-3 flex items-center justify-between text-left cursor-pointer"
                                      >
                                        <div className="flex items-center gap-1.5 min-w-0 pr-4">
                                          <span className={`text-[11px] font-extrabold ${styleConfig.comfortDark ? 'text-slate-100' : 'text-slate-800'} truncate`}>
                                            {item.term}
                                          </span>
                                          {isCurrent && (
                                            <span className="text-[8px] shrink-0 font-extrabold bg-indigo-500 dark:bg-indigo-600 text-white px-1.5 py-0.5 rounded uppercase tracking-wider animate-pulse">
                                              Neste Guia
                                            </span>
                                          )}
                                        </div>
                                        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                                      </button>

                                      {/* Expanded definition content */}
                                      {isExpanded && (
                                        <div className="px-3 pb-3 pt-0 border-t border-slate-100/40 dark:border-slate-850/40 space-y-2 animate-in fade-in duration-200">
                                          <p className={`text-[10px] leading-relaxed font-sans ${styleConfig.comfortDark ? 'text-slate-350' : 'text-slate-650'}`}>
                                            {definitionToDisplay}
                                          </p>
                                          
                                          {/* Audio definition read aloud */}
                                          <div className="flex justify-end pt-1">
                                            <button
                                              onClick={() => speakGlossaryTerm(item.term, definitionToDisplay)}
                                              className={`px-2 py-1 rounded-lg text-[9px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                                                isTermReading 
                                                  ? 'bg-rose-500 text-white animate-pulse' 
                                                  : styleConfig.comfortDark
                                                    ? 'bg-slate-800 hover:bg-slate-750 text-indigo-400 hover:text-indigo-300 border border-slate-700'
                                                    : 'bg-slate-50 hover:bg-slate-100 text-indigo-650 hover:text-indigo-700 border border-slate-150'
                                              }`}
                                              title="Ouvir definição"
                                            >
                                              {isTermReading ? (
                                                <>
                                                  <VolumeX className="w-3 h-3" />
                                                  Parar Áudio
                                                </>
                                              ) : (
                                                <>
                                                  <Volume2 className="w-3 h-3" />
                                                  Ouvir Conceito
                                                </>
                                              )}
                                            </button>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                };

                                return (
                                  <div className="space-y-3">
                                    {/* Terms on this page */}
                                    {currentTerms.length > 0 && (
                                      <div className="space-y-1.5">
                                        <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block px-1">
                                          Termos do Guia Ativos ({currentTerms.length})
                                        </span>
                                        <div className="space-y-1.5">
                                          {currentTerms.map(t => renderTermCard(t, true))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Other terms */}
                                    {otherTerms.length > 0 && (
                                      <div className="space-y-1.5">
                                        <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block px-1 pt-1">
                                          Outros Termos Médicos ({otherTerms.length})
                                        </span>
                                        <div className="space-y-1.5">
                                          {otherTerms.map(t => renderTermCard(t, false))}
                                        </div>
                                      </div>
                                    )}

                                    {isEbookLocked && filteredTerms.length > 2 && (
                                      <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-600/10 border border-amber-500/20 text-center space-y-2.5 mt-4 animate-in fade-in duration-300">
                                        <div className="w-8 h-8 bg-amber-500/15 rounded-full flex items-center justify-center text-amber-600 dark:text-amber-400 mx-auto">
                                          <Lock className="w-4 h-4" />
                                        </div>
                                        <h5 className={`text-[11px] font-extrabold ${styleConfig.comfortDark ? 'text-amber-400' : 'text-amber-800'} uppercase tracking-wider`}>
                                          Glossário Premium Limitado
                                        </h5>
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                                          {accessibilitySettings.simpleLanguage 
                                            ? "Adquira a versão completa para desbloquear todos os termos simplificados e narração de áudio!"
                                            : "Desbloqueie o e-book completo para liberar todas as explicações científicas e o dicionário de termos médicos."
                                          }
                                        </p>
                                        <button
                                          onClick={() => setPaywallModalMedicine(currentEbook.medicineName + "_full")}
                                          className="w-full py-1.5 px-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-lg text-[9px] font-black uppercase tracking-wider shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                                        >
                                          Liberar Tudo por R$ 4,90
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Guias Semelhantes Card */}
                      {(() => {
                        const currentPreset = presets.find(p => p.key === selectedPreset);
                        let similarEbooks = currentPreset 
                          ? presets.filter(p => p.category === currentPreset.category && p.key !== selectedPreset)
                          : [];
                        
                        // If we don't have enough ebooks from the same category, add other presets
                        if (similarEbooks.length < 3) {
                          const otherPresets = presets.filter(p => p.key !== selectedPreset && !similarEbooks.some(se => se.key === p.key));
                          similarEbooks = [...similarEbooks, ...otherPresets].slice(0, 3);
                        } else {
                          similarEbooks = similarEbooks.slice(0, 3);
                        }

                        if (similarEbooks.length === 0) return null;

                        return (
                          <div className={`w-full ${styleConfig.cardBg} ${styleConfig.cardBorder} rounded-2xl p-5 flex flex-col space-y-4 transition-all duration-300 shadow-sm`}>
                            {/* Header */}
                            <div className="flex items-center gap-2 border-b pb-3 border-slate-100 dark:border-slate-850">
                              <div className={`p-1.5 rounded-lg ${styleConfig.comfortDark ? 'bg-indigo-950/40 text-indigo-400' : 'bg-indigo-50 text-indigo-650'}`}>
                                <BookOpen className="w-4 h-4" />
                              </div>
                              <div>
                                <h4 className={`text-xs font-black uppercase tracking-wider ${styleConfig.comfortDark ? 'text-slate-100' : 'text-slate-900'}`}>
                                  Guias Semelhantes
                                </h4>
                                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                                  Mais Leitura Sugerida
                                </span>
                              </div>
                            </div>

                            {/* List of similar guides in a vertical stack */}
                            <div className="space-y-2.5">
                              {similarEbooks.map((preset) => {
                                const isEmerald = preset.colorTheme === 'emerald';
                                const isAmber = preset.colorTheme === 'amber';
                                const isBlue = preset.colorTheme === 'blue';
                                
                                const cardThemeBg = isEmerald 
                                  ? 'hover:border-emerald-300 dark:hover:border-emerald-800/80 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/10' 
                                  : isAmber 
                                    ? 'hover:border-amber-300 dark:hover:border-amber-800/80 hover:bg-amber-50/20 dark:hover:bg-amber-950/10'
                                    : isBlue
                                      ? 'hover:border-blue-300 dark:hover:border-blue-800/80 hover:bg-blue-50/20 dark:hover:bg-blue-950/10'
                                      : 'hover:border-indigo-300 dark:hover:border-indigo-800/80 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/10';

                                const iconColorClass = isEmerald 
                                  ? 'text-emerald-500' 
                                  : isAmber 
                                    ? 'text-amber-500' 
                                    : isBlue
                                      ? 'text-blue-500' 
                                      : 'text-indigo-500';

                                return (
                                  <button
                                    key={preset.key}
                                    onClick={() => {
                                      handlePresetSelect(preset.key);
                                      stopSpeaking();
                                      // Scroll to top of ebook workspace
                                      if (ebookWorkspaceRef.current) {
                                        ebookWorkspaceRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                      }
                                    }}
                                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all duration-200 cursor-pointer hover:shadow-xs hover:scale-[1.01] ${
                                      styleConfig.comfortDark 
                                        ? 'bg-slate-900/40 border-slate-800 text-slate-200' 
                                        : 'bg-slate-50/30 border-slate-100 text-slate-700'
                                    } ${cardThemeBg}`}
                                  >
                                    <div className="space-y-1 pr-2 min-w-0 flex-1">
                                      <div className="flex items-center gap-1.5">
                                        <Pill className={`w-3.5 h-3.5 ${iconColorClass} shrink-0`} />
                                        <span className={`text-[9px] font-extrabold ${styleConfig.comfortDark ? 'text-slate-400' : 'text-slate-500'} uppercase tracking-wider`}>
                                          Medicamento
                                        </span>
                                      </div>
                                      <p className="text-[11px] font-black truncate w-full">
                                        {getPresetDisplayName(preset.key, accessibilitySettings.simpleLanguage, preset.medicineName)}
                                      </p>
                                      <p className={`text-[9px] truncate w-full ${styleConfig.comfortDark ? 'text-slate-450' : 'text-slate-500'}`}>
                                        {getPresetDisplaySubtitle(preset.key, accessibilitySettings.simpleLanguage, preset.subtitle)}
                                      </p>
                                    </div>
                                    
                                    <div className="flex items-center justify-center shrink-0 w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-450 group-hover:text-indigo-500 transition-all">
                                      <ChevronRight className="w-4 h-4" />
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </>
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
        </>
      )}

      {/* Active Alarm Trigger Popup Modal */}
      {activeAlarm && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 border-2 border-indigo-500 rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl relative z-10 animate-in zoom-in-95 duration-300 text-left">
            <div className="text-center space-y-4">
              {/* Pulsing ring bell */}
              <div className="w-20 h-20 rounded-full bg-indigo-50 dark:bg-slate-800 flex items-center justify-center mx-auto border-2 border-indigo-200 dark:border-indigo-800 animate-bounce">
                <Bell className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
              </div>

              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-1 rounded-full border border-indigo-100 dark:border-indigo-900/30">
                  ⏰ HORA DA SUA DOSE ({activeAlarm.time})
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-slate-50 mt-3.5">
                  {activeAlarm.medicineName}
                </h3>
                <p className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
                  Dosagem: {activeAlarm.dose}
                </p>
              </div>

              {/* Instructions summary */}
              {activeAlarm.instructions && (
                <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-850 text-xs font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">
                  📖 {activeAlarm.instructions}
                </div>
              )}

              {/* Action buttons */}
              <div className="pt-2">
                <button
                  onClick={async () => {
                    await logDoseTaken(activeAlarm.medicineName, activeAlarm.dose, activeAlarm.time);
                    setActiveAlarm(null);
                  }}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-sm transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-indigo-600/20 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Confirmar que Tomei a Dose 👍
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Authentication Modal */}
      {authModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-55 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div 
            className="fixed inset-0" 
            onClick={() => {
              if (!authSubmitting) setAuthModalOpen(false);
            }} 
          />
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-sm w-full p-6 md:p-8 shadow-2xl relative z-10 animate-in zoom-in-95 duration-200">
            
            {/* Close Button */}
            <button
              disabled={authSubmitting}
              onClick={() => setAuthModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <span className="sr-only">Fechar</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Header / Tabs */}
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-extrabold flex items-center justify-center text-xl shadow-md mx-auto mb-3">
                M
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-50">
                {authModalTab === 'login' ? 'Bem-vindo de Volta' : 'Criar sua Conta'}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                {authModalTab === 'login' 
                  ? 'Conecte-se para sincronizar seus favoritos na nuvem.' 
                  : 'Sua leitura, favoritos e progresso salvos em qualquer lugar.'}
              </p>
            </div>

            {/* Error and Success states */}
            {authError && (
              <div className="p-3 mb-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-rose-650 dark:text-rose-400 text-xs font-bold rounded-xl text-center">
                ⚠️ {authError}
              </div>
            )}
            {authSuccess && (
              <div className="p-3 mb-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-xl text-center flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                {authSuccess}
              </div>
            )}

            {/* Form */}
            <form onSubmit={authModalTab === 'login' ? handleLogin : handleSignUp} className="space-y-4">
              {authModalTab === 'signup' && (
                <div>
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1.5">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    required
                    disabled={authSubmitting}
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    placeholder="Seu Nome Completo"
                    className="w-full px-4 py-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10 transition-all placeholder-slate-400"
                  />
                </div>
              )}

              <div>
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1.5">
                  Endereço de E-mail
                </label>
                <input
                  type="email"
                  required
                  disabled={authSubmitting}
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="seuemail@exemplo.com"
                  className="w-full px-4 py-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10 transition-all placeholder-slate-400"
                />
              </div>

              <div>
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1.5">
                  Sua Senha
                </label>
                <input
                  type="password"
                  required
                  disabled={authSubmitting}
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10 transition-all placeholder-slate-400"
                />
              </div>

              {authModalTab === 'signup' && (
                <div>
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1.5">
                    Confirmar Senha
                  </label>
                  <input
                    type="password"
                    required
                    disabled={authSubmitting}
                    value={authConfirmPassword}
                    onChange={(e) => setAuthConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10 transition-all placeholder-slate-400"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={authSubmitting}
                className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/10 mt-2"
              >
                {authSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  authModalTab === 'login' ? 'Entrar na Conta' : 'Criar minha Conta'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-5 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
              </div>
              <span className="relative bg-white dark:bg-slate-900 px-3 text-[10px] uppercase font-black tracking-widest text-slate-400 dark:text-slate-500">
                ou continue com
              </span>
            </div>

            {/* Google Sign In Button */}
            <button
              type="button"
              disabled={authSubmitting}
              onClick={handleGoogleLogin}
              className="w-full py-3 px-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-sm"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                <g transform="matrix(1, 0, 0, 1, 0, 0)">
                  <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.57h3.3c1.93,-1.78 3.04,-4.4 3.04,-7.49C21.68,11.91 21.56,11.47 21.35,11.1z" fill="#4285F4" />
                  <path d="M12,20.8c2.38,0 4.38,-0.79 5.84,-2.13l-3.3,-2.57c-0.91,0.61 -2.08,0.98 -3.39,0.98 -2.61,0 -4.82,-1.76 -5.61,-4.13H2.12v2.65C3.59,18.57 7.55,20.8 12,20.8z" fill="#34A853" />
                  <path d="M6.39,12.95c-0.2,-0.61 -0.31,-1.26 -0.31,-1.95s0.11,-1.34 0.31,-1.95V6.4H2.12C1.41,7.81 1,9.41 1,11c0,1.59 0.41,3.19 1.12,4.6l3.3,-2.57C5.7,14.33 5.7,13.62 6.39,12.95z" fill="#FBBC05" />
                  <path d="M12,5.18c1.3,0 2.46,0.45 3.38,1.32l2.53,-2.53C16.37,2.51 14.38,1.2 12,1.2c-4.45,0 -8.41,2.23 -9.88,5.2L5.42,9.05C6.21,6.68 8.42,5.18 12,5.18z" fill="#EA4335" />
                </g>
              </svg>
              Entrar com o Google
            </button>

            {/* Tab switch link */}
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
              <span className="text-[11px] text-slate-400">
                {authModalTab === 'login' ? 'Não tem uma conta?' : 'Já possui uma conta?'}
              </span>
              <button
                disabled={authSubmitting}
                onClick={() => {
                  setAuthModalTab(authModalTab === 'login' ? 'signup' : 'login');
                  setAuthError('');
                  setAuthSuccess('');
                }}
                className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline ml-1 cursor-pointer"
              >
                {authModalTab === 'login' ? 'Cadastre-se grátis' : 'Faça login aqui'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

