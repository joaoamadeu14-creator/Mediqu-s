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
  Sun
} from 'lucide-react';
import { jsPDF } from 'jspdf';

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

// Route parameters interface
interface RouteParams {
  livro?: string;
  categoria?: string;
  pagina?: number;
  novo?: boolean;
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
  
  return { livro, categoria, pagina, novo };
};

// Update URL query parameters based on state route params
const updateURL = (route: RouteParams) => {
  const params = new URLSearchParams();
  if (route.novo) {
    params.set('novo', 'true');
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
    return !(route.livro || route.categoria || route.novo);
  });
  const [homeSearchQuery, setHomeSearchQuery] = useState('');
  const [viewingTagResults, setViewingTagResults] = useState(false);

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
      } catch (e) {}
      return newVal;
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

  const toggleFavoriteEbook = (key: string) => {
    if (!key) return;
    setFavoriteEbooks(prev => {
      const updated = prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key];
      localStorage.setItem('favorite_ebooks', JSON.stringify(updated));
      return updated;
    });
  };

  const toggleFavoriteFolder = (id: string) => {
    if (!id) return;
    setFavoriteFolders(prev => {
      const updated = prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id];
      localStorage.setItem('favorite_folders', JSON.stringify(updated));
      return updated;
    });
  };

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
    if (route.novo) {
      setIsCustomMode(true);
      setShowHome(false);
      setSelectedCategory(null);
    } else if (route.categoria) {
      setSelectedCategory(route.categoria);
      setShowHome(false);
      setIsCustomMode(false);
      setOpenFolders(prev => ({ ...prev, [route.categoria!]: true }));
    } else if (route.livro) {
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
      setShowHome(true);
      setSelectedCategory(null);
      setIsCustomMode(false);
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
    } else if (isCustomMode) {
      route.novo = true;
    } else if (selectedCategory) {
      route.categoria = selectedCategory;
    } else if (selectedPreset) {
      route.livro = selectedPreset;
      if (currentPageIndex > 0) {
        route.pagina = currentPageIndex + 1;
      }
    }
    
    updateURL(route);
  }, [showHome, isCustomMode, selectedCategory, selectedPreset, currentPageIndex]);

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

  return (
    <div id="clarifarma-app" className={`min-h-screen ${styleConfig.containerBg} font-sans ${darkMode ? 'dark' : ''} ${styleConfig.comfortDark ? 'text-slate-100' : 'text-slate-800'} flex flex-col ${showHome ? 'justify-center items-center' : 'md:flex-row'} overflow-x-hidden transition-all duration-300`}>
      
      {showHome ? (
        <div className="flex-1 flex flex-col items-center justify-center max-w-3xl w-full text-center space-y-10 my-auto p-4 md:p-8 animate-in fade-in duration-300">
          
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
              Buscar
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
                  className="px-4 py-2 rounded-xl text-xs font-bold transition-all border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700 hover:scale-[1.02] cursor-pointer shadow-xs"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Meus Guias Section */}
          <div className="w-full max-w-2xl space-y-4 pt-4 border-t border-slate-100 dark:border-slate-900 text-left">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block">Meus Guias</h3>
            </div>
            
            {favoriteFolders.length === 0 && favoriteEbooks.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-1 bg-slate-50/50 dark:bg-slate-900/10">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Nenhum guia ou pasta favorita ainda</p>
                <p className="text-[10px] text-slate-450 dark:text-slate-550">Clique no ícone de coração nos e-books e pastas para salvá-los aqui e acessá-los rapidamente!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Favorite Folders */}
                {favoriteFolders.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pastas Salvas</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {favoriteFolders.map(folderId => {
                        const catData = [
                          { id: 'hipertensao', label: 'Pressão Alta', icon: Heart, desc: 'Sartanas, Pris e controle de pressão.', color: 'text-emerald-600 bg-emerald-50/60 border-emerald-100 hover:border-emerald-200 hover:bg-emerald-50/80' },
                          { id: 'diabetes', label: 'Diabetes', icon: Activity, desc: 'Metformina, Gliflozinas e açúcar no sangue.', color: 'text-blue-600 bg-blue-50/60 border-blue-100 hover:border-blue-200 hover:bg-blue-50/80' },
                          { id: 'colesterol', label: 'Colesterol Alto', icon: ShieldAlert, desc: 'Estatinas, Fibratos e gordura no sangue.', color: 'text-amber-600 bg-amber-50/60 border-amber-100 hover:border-amber-200 hover:bg-amber-50/80' }
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
                              }}
                              className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between gap-2.5 transition-all cursor-pointer shadow-xs hover:shadow-md hover:scale-[1.01] w-full ${catData.color}`}
                            >
                              <div className="flex justify-between items-start w-full">
                                <div className="p-1.5 rounded-lg bg-white shadow-xs shrink-0 border border-slate-100">
                                  <CatIcon className="w-3.5 h-3.5" />
                                </div>
                                <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-white border border-slate-100 text-slate-500 mr-6">
                                  {count} {count === 1 ? 'Guia' : 'Guias'}
                                </span>
                              </div>
                              <div>
                                <h3 className="text-xs font-extrabold text-slate-800">📁 {catData.label}</h3>
                              </div>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                toggleFavoriteFolder(folderId);
                              }}
                              className="absolute top-3 right-3 p-1.5 rounded-xl bg-white hover:bg-slate-50 text-rose-500 shadow-sm border border-slate-100 transition-colors cursor-pointer"
                              title="Remover dos favoritos"
                            >
                              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
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
                              className={`p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-rose-500 transition-colors shrink-0 cursor-pointer`}
                              title="Remover dos favoritos"
                            >
                              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Disease Category Folders */}
          <div className="w-full max-w-2xl space-y-4 pt-4 border-t border-slate-100 dark:border-slate-900 text-left">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Explorar por Mais Visualizados</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { id: 'hipertensao', label: 'Pressão Alta', icon: Heart, desc: 'Sartanas, Pris e controle de pressão.', color: 'text-emerald-600 bg-emerald-50/60 border-emerald-100 hover:border-emerald-200 hover:bg-emerald-50/80' },
                { id: 'diabetes', label: 'Diabetes', icon: Activity, desc: 'Metformina, Gliflozinas e açúcar no sangue.', color: 'text-blue-600 bg-blue-50/60 border-blue-100 hover:border-blue-200 hover:bg-blue-50/80' },
                { id: 'colesterol', label: 'Colesterol Alto', icon: ShieldAlert, desc: 'Estatinas, Fibratos e gordura no sangue.', color: 'text-amber-600 bg-amber-50/60 border-amber-100 hover:border-amber-200 hover:bg-amber-50/80' }
              ].map((cat) => {
                const CatIcon = cat.icon;
                const count = presets.filter(p => p.category === cat.id).length;
                return (
                  <div key={cat.id} className="relative group">
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setShowHome(false);
                        setIsCustomMode(false);
                        setSidebarOpen(true);
                        // Set corresponding accordion folder open in sidebar
                        setOpenFolders(prev => ({ ...prev, [cat.id]: true }));
                      }}
                      className={`p-4 rounded-2xl border text-left flex flex-col justify-between gap-3 transition-all cursor-pointer shadow-xs hover:shadow-md hover:scale-[1.02] w-full ${cat.color}`}
                    >
                      <div className="flex justify-between items-start w-full">
                        <div className="p-2 rounded-xl bg-white shadow-xs shrink-0 border border-slate-100">
                          <CatIcon className="w-4 h-4 animate-pulse" />
                        </div>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white border border-slate-100 text-slate-500 mr-6">
                          {count} {count === 1 ? 'Guia' : 'Guias'}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-xs font-extrabold text-slate-800">📁 {cat.label}</h3>
                        <p className="text-[10px] text-slate-500 mt-1 leading-snug">{cat.desc}</p>
                      </div>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        toggleFavoriteFolder(cat.id);
                      }}
                      className="absolute top-4 right-4 p-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-450 hover:text-rose-500 shadow-sm border border-slate-100 transition-colors cursor-pointer"
                      title={favoriteFolders.includes(cat.id) ? "Remover pasta dos favoritos" : "Adicionar pasta aos favoritos"}
                    >
                      <Heart className={`w-4 h-4 ${favoriteFolders.includes(cat.id) ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
                    </button>
                  </div>
                );
              })}
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
      ) : (
        <>
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
              <button
                onClick={() => {
                  setShowHome(true);
                  setSelectedCategory(null);
                  stopSpeaking();
                }}
                className="flex items-center gap-3 text-left hover:opacity-85 transition-opacity cursor-pointer"
                title="Voltar ao início"
              >
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
              </button>

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
                  
                  const isExpanded = !!(
                    openFolders[cat.id] || 
                    searchQuery.trim() !== '' || 
                    (!showHome && searchQuery.trim() === '' && openFolders[cat.id] !== false)
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
                            setOpenFolders(prev => ({ ...prev, [cat.id]: !prev[cat.id] }));
                            setSelectedCategory(cat.id);
                            setIsCustomMode(false);
                            setShowHome(false);
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
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-450 hover:text-rose-500 transition-colors cursor-pointer"
                            title={favoriteFolders.includes(cat.id) ? "Remover pasta dos favoritos" : "Adicionar pasta aos favoritos"}
                          >
                            <Heart className={`w-3.5 h-3.5 ${favoriteFolders.includes(cat.id) ? 'fill-rose-500 text-rose-500' : 'text-slate-400 dark:text-slate-500'}`} />
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
                                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                                  title={favoriteEbooks.includes(preset.key) ? "Remover guia dos favoritos" : "Adicionar guia aos favoritos"}
                                >
                                  <Heart className={`w-3.5 h-3.5 ${favoriteEbooks.includes(preset.key) ? 'fill-rose-500 text-rose-500' : 'text-slate-400 dark:text-slate-500'}`} />
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
                      <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
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
                                    className="absolute top-3 right-3 p-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-rose-500 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors cursor-pointer"
                                    title="Remover dos favoritos"
                                  >
                                    <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
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
                                    className={`p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-rose-500 transition-colors shrink-0 cursor-pointer`}
                                    title="Remover dos favoritos"
                                  >
                                    <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
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
                              <Heart className={`w-3.5 h-3.5 ${favoriteFolders.includes(cat.id) ? 'fill-rose-500 text-rose-500' : 'text-white'}`} />
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
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                                title={favoriteEbooks.includes(preset.key) ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                              >
                                <Heart className={`w-3.5 h-3.5 ${favoriteEbooks.includes(preset.key) ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
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
                                    renderSectionContent(section.content, styleConfig, accessibilitySettings)
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
    </div>
  );
}
