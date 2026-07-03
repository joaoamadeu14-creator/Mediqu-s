import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Guia aprofundado com termos técnicos e explicações científicas baseadas na Diretriz Brasileira de Hipertensão Arterial 2025 (DBHA 2025)
const TECHNICAL_BRA_MEDICINE = {
  "medicineName": "Bloqueadores de Angiotensina (BRAs)",
  "subtitle": "Antagonistas seletivos do receptor AT1 da Angiotensina II",
  "colorTheme": "emerald",
  "category": "hipertensao",
  "tags": ["pressão", "hipertensão", "losartana", "valsartana", "olmesartana", "coração", "rins"],
  "pages": [
    {
      "pageNumber": 1,
      "title": "DIRETRIZES DE BRAS E SARTANAS",
      "description": "Classe de primeira linha recomendada pela Diretriz Brasileira de Hipertensão Arterial (DBHA 2025) para controle pressórico, cardioproteção e nefroproteção ativa.",
      "sections": []
    },
    {
      "pageNumber": 2,
      "title": "REPRESENTANTES E POSOLOGIAS",
      "description": "Veja abaixo as dosagens habituais recomendadas pelas diretrizes para alcance do bloqueio pleno do SRAA:",
      "sections": [
        {
          "title": "Losartana Potássica",
          "content": "• Posologia habitual: 50 a 100 mg por dia (fração única ou dividida de 12/12h).\n• Observação clínica: O primeiro representante da classe, amplamente utilizado no SUS.",
          "icon": "Pill",
          "type": "success"
        },
        {
          "title": "Valsartana",
          "content": "• Posologia habitual: 80 a 320 mg por dia (dose única diária).\n• Observação clínica: Alta seletividade ao receptor AT1, reduz significativamente a morbimortalidade cardiovascular.",
          "icon": "Pill",
          "type": "success"
        },
        {
          "title": "Olmesartana Medoxomila",
          "content": "• Posologia habitual: 20 a 40 mg por dia (dose única diária).\n• Observação clínica: Potente ação anti-hipertensiva sustentada por 24 horas.",
          "icon": "Pill",
          "type": "success"
        },
        {
          "title": "Candesartana Cilexetila",
          "content": "• Posologia habitual: 8 a 32 mg por dia (dose única diária).\n• Observação clínica: Ligação forte e dissociação extremamente lenta do receptor AT1.",
          "icon": "Pill",
          "type": "success"
        },
        {
          "title": "Telmisartana",
          "content": "• Posologia habitual: 20 a 80 mg por dia (dose única diária).\n• Observação clínica: Longa meia-vida plasmática (~24h) com propriedades parciais de agonista do PPAR-gama.",
          "icon": "Pill",
          "type": "success"
        },
        {
          "title": "Irbesartana",
          "content": "• Posologia habitual: 150 a 300 mg por dia (dose única diária).\n• Observação clínica: Indicada formalmente para retardar a progressão da nefropatia em pacientes diabéticos.",
          "icon": "Pill",
          "type": "success"
        }
      ]
    },
    {
      "pageNumber": 3,
      "title": "FISIOPATOLOGIA DO SRAA",
      "description": "O Sistema Renina-Angiotensina-Aldosterona (SRAA) é o principal eixo endócrino regulador da hemodinâmica sistêmica e do equilíbrio hidrossalino:",
      "sections": [
        {
          "title": "Angiotensina II",
          "content": "Peptídeo vasoconstritor extremamente potente. Ao se ligar ao receptor AT1, causa vasoconstrição direta das artérias e estimula a hipertrofia celular vascular e cardíaca.",
          "icon": "Activity",
          "type": "warning"
        },
        {
          "title": "Elevação da RVP",
          "content": "A vasoconstrição eleva a resistência vascular periférica (RVP). Isso aumenta diretamente a pós-carga do ventrículo esquerdo, elevando a pressão arterial sistêmica.",
          "icon": "Flame",
          "type": "warning",
          "isSubtopic": true
        },
        {
          "title": "Aldosterona e Volemia",
          "content": "A Angiotensina II estimula a secreção de aldosterona no córtex adrenal, induzindo a reabsorção de sódio e água nos rins, o que expande o volume de sangue.",
          "icon": "Droplet",
          "type": "warning",
          "isSubtopic": true
        }
      ]
    },
    {
      "pageNumber": 4,
      "title": "MECANISMO DE BLOQUEIO AT1",
      "description": "Mecanismo de ação farmacológica celular e benefícios descritos na DBHA 2025:",
      "sections": [
        {
          "title": "Antagonismo Competitivo",
          "content": "Os BRAs bloqueiam seletivamente os receptores AT1, impedindo que a Angiotensina II se ligue às células musculares lisas dos vasos e ao coração.",
          "icon": "Lock",
          "type": "success"
        },
        {
          "title": "Vasodilatação Sistêmica",
          "content": "O bloqueio do receptor AT1 promove o relaxamento direto do leito arterial, resultando em diminuição da resistência vascular periférica e redução da pressão arterial.",
          "icon": "Activity",
          "type": "success",
          "isSubtopic": true
        },
        {
          "title": "Nefroproteção e Cardioproteção",
          "content": "Ao dilatar a arteríola eferente renal, reduz a pressão intraglomerular e a microalbuminúria. Além disso, previne o remodelamento e a hipertrofia ventricular esquerda.",
          "icon": "Heart",
          "type": "success"
        }
      ]
    },
    {
      "pageNumber": 5,
      "title": "CONTRAINDICAÇÕES E ALERTAS",
      "description": "Diretrizes de segurança cruciais baseadas em evidências de alta certeza científica:",
      "sections": [
        {
          "title": "Gestação (Contraindicação Absoluta)",
          "content": "Contraindicação formal Classe I, Evidência A. O uso na gravidez causa teratogenicidade grave, levando a disfunção renal fetal, hipoplasia pulmonar, deformações cranianas e óbito fetal.",
          "icon": "XCircle",
          "type": "warning"
        },
        {
          "title": "Monitoramento de Potássio e Creatinina",
          "content": "O uso de BRAs em pacientes com Doença Renal Crônica (DRC) avançada pode causar hipercalemia (potássio elevado) e redução transitória da TFG. É obrigatória a dosagem de potássio e creatinina em até duas semanas após início/ajuste.",
          "icon": "AlertTriangle",
          "type": "warning"
        },
        {
          "title": "Associação Proibida: BRA + IECA",
          "content": "A combinação de BRA com IECA é formalmente contraindicada. Ensaios clínicos demonstraram que o duplo bloqueio aumenta drasticamente os riscos de injúria renal aguda e hipercalemia, sem benefícios cardiovasculares adicionais.",
          "icon": "ShieldAlert",
          "type": "warning"
        }
      ]
    },
    {
      "pageNumber": 6,
      "title": "INTERAÇÕES MEDICAMENTOSAS",
      "description": "Interações importantes descritas nos capítulos de tratamento farmacológico:",
      "sections": [
        {
          "title": "Anti-inflamatórios Não Esteroidais (AINEs)",
          "content": "AINEs (como Ibuprofeno, Diclofenaco e Nimesulida) bloqueiam as prostaglandinas renais, causando vasoconstrição renal. Isso reduz o efeito anti-hipertensivo do BRA e eleva substancialmente o risco de insuficiência renal aguda.",
          "icon": "XCircle",
          "type": "warning"
        },
        {
          "title": "Espironolactona e Suplementos",
          "content": "O uso concomitante com espironolactona (antagonista da aldosterona) ou suplementação de potássio aumenta muito o risco de hipercalemia severa. Requer vigilância estrita.",
          "icon": "AlertTriangle",
          "type": "warning"
        },
        {
          "title": "Lítio",
          "content": "Pode reduzir a excreção renal do lítio, elevando seus níveis séricos e induzindo toxicidade grave. Requer ajuste posológico e monitoramento laboratorial.",
          "icon": "AlertTriangle",
          "type": "warning"
        }
      ]
    },
    {
      "pageNumber": 7,
      "title": "METAS E COMBINAÇÕES 2025",
      "description": "Metas terapêuticas e estratégias de tratamento estabelecidas na Diretriz de 2025:",
      "sections": [
        {
          "title": "Meta Pressórica Geral (< 130/80 mmHg)",
          "content": "A DBHA 2025 estabelece como meta terapêutica para todos os hipertensos manter a PA < 130/80 mmHg (Recomendação Forte, Evidência Alta), desde que bem tolerada.",
          "icon": "Activity",
          "type": "success"
        },
        {
          "title": "Terapia Combinada como Início Padrão",
          "content": "Recomenda-se iniciar o tratamento da hipertensão com associação dupla de medicamentos (por exemplo, BRA + BCC ou BRA + DIU) em dose fixa (comprimido único), acelerando o controle e a adesão.",
          "icon": "Pill",
          "type": "success"
        },
        {
          "title": "Uso de MAPA e MRPA",
          "content": "A confirmação do controle pressórico e alcance de metas deve ser validada por meio de monitorização residencial (MRPA) ou ambulatorial (MAPA), afastando fenótipos como hipertensão mascarada.",
          "icon": "Clock",
          "type": "info"
        }
      ]
    },
    {
      "pageNumber": 8,
      "title": "SÍNTESE CLÍNICA",
      "description": "Confira o sumário executivo das diretrizes práticas de BRAs segundo a DBHA 2025:",
      "sections": [
        {
          "title": "DIAGNÓSTICO E ALVOS",
          "content": "• Meta terapêutica geral de PA < 130/80 mmHg.\n• Indicação preferencial de terapia combinada em dose fixa como primeiro passo.",
          "icon": "Activity",
          "type": "info"
        },
        {
          "title": "VIGILÂNCIA LAB",
          "content": "• Dosagem anual de Creatinina e Potássio sérico.\n• Risco elevado de hipercalemia na DRC avançada ou se associado a Espironolactona.",
          "icon": "ShieldAlert",
          "type": "warning"
        },
        {
          "title": "CONTRAINDICAÇÕES",
          "content": "• Gestação (Absoluta): risco de teratogenicidade e óbito fetal.\n• Evitar uso concomitante com AINEs e associação com IECAs.",
          "icon": "XCircle",
          "type": "warning"
        }
      ],
      "isInfographic": true
    }
  ]
};

// Initial list of pre-rendered, high-quality, fully simplified Portuguese guides
// for instant loading of common medicines.
const PRESET_MEDICINES: Record<string, any> = {
  "hipertensao_bra": {
    "medicineName": "Sartanas",
    "subtitle": "Bloqueadores dos Receptores de Angiotensina II (BRAs)",
    "colorTheme": "emerald",
    "category": "hipertensao",
    "tags": ["pressão", "hipertensão", "losartana", "valsartana", "olmesartana", "coração"],
    "pages": [
      {
        "pageNumber": 1,
        "title": "Guia prático das “Sartanas”BRAs",
        "description": "Os Bloqueadores dos Receptores de Angiotensina II, carinhosamente chamados de BRAs ou \"sartanas\", são medicamentos amplamente utilizados para tratar a pressão alta e proteger órgãos vitais como o coração e os rins.",
        "sections": []
      },
      {
        "pageNumber": 2,
        "title": "Quem são",
        "description": "Veja abaixo os principais representantes da classe e as dosagens recomendadas:",
        "sections": [
          {
            "title": "Losartana",
            "content": "* Nome comercial: Cozaar; Lotar - associado a Anlodipino\n* Posologia: 50 - 100 mg; Uma vez ao dia ou de 12 em 12 horas.",
            "icon": "Pill",
            "type": "success"
          },
          {
            "title": "Valsartana",
            "content": "* Nome comercial: Diovan, Ex-forge - associado a Anlodipino\n* Posologia: 80 - 320 mg; uma vez ao dia",
            "icon": "Pill",
            "type": "success"
          },
          {
            "title": "Irbesartana",
            "content": "* Nome comercial: Aprovel\n* Posologia: 150 - 300 mg; Uma  vez ao dia",
            "icon": "Pill",
            "type": "success"
          },
          {
            "title": "Candesartana",
            "content": "* Nome comercial: Atacand/Blopress\n* Posologia: 8 - 32 mg; Uma vez ao dia",
            "icon": "Pill",
            "type": "success"
          },
          {
            "title": "Olmesartana",
            "content": "* Nome comercial: Benicar/Olmetec\n* Posologia: 20 - 40 mg; Uma vez ao dia",
            "icon": "Pill",
            "type": "success"
          },
          {
            "title": "Telmisartana",
            "content": "* Nome comercial: Micardis; Twynsta - associado a Anlodipino\n* Posologia: 20 - 80 mg; Uma vez ao dia",
            "icon": "Pill",
            "type": "success"
          }
        ]
      },
      {
        "pageNumber": 3,
        "title": "Entendendo a pressão alta",
        "description": "Vamos pensar que os vasos sanguíneos são como uma mangueira",
        "sections": [
          {
            "title": "Hormônio",
            "content": "Existe um hormônio no corpo chamado Angiotensina II (dois), que quando entra em ação, faz duas coisas principais:",
            "icon": "Activity",
            "type": "warning"
          },
          {
            "title": "Vasos apertados e mais estreitos",
            "content": "Diz para os vasos fecharem e apertarem - como quando apertamos ou pisamos na mangueira de jardim - Aumentando a força e a pressão da água! (conhecido na medicina como vasoconstrição)",
            "icon": "Flame",
            "type": "warning",
            "isSubtopic": true
          },
          {
            "title": "Retenção de Líquido",
            "content": "Diz para o corpo reter sal e água, aumentando a quantidade de líquido circulando no sangue ",
            "icon": "Droplet",
            "type": "warning",
            "isSubtopic": true
          },
          {
            "title": "Pressão alta (hipertensão)",
            "content": "O resultado desses dois mecanismos (cano apertado + aumento de líquido) é a pressão alta! ",
            "icon": "ShieldAlert",
            "type": "warning"
          }
        ]
      },
      {
        "pageNumber": 4,
        "title": "Como o medicamento age?",
        "description": "Veja abaixo como o medicamento funciona no seu organismo para proteger seu coração e seus rins:",
        "sections": [
          {
            "title": "A Fechadura (Receptor)",
            "content": "Para a angiotensina II ser ativada, ela precisa se encaixar em uma espécie de “fechadura” (conhecido na medicina como receptor), chamado Receptor da Angiotensina.",
            "icon": "Lock",
            "type": "success"
          },
          {
            "title": "A Chave Falsa de Bloqueio",
            "content": "O medicamento entra no organismo e funciona como uma chave falsa que se encaixa nessa fechadura, mas não consegue girar, apenas impedindo que a angiotensina II se encaixe.",
            "icon": "Pill",
            "type": "success"
          },
          {
            "title": "Os vasos sanguíneos ficam relaxados e abertos",
            "content": "Sem o encaixe do hormônio, os vasos não sofrem o aperto e permanecem mais relaxados e abertos (vasodilatação), diminuindo a força que o sangue precisa fazer.",
            "icon": "Activity",
            "type": "success",
            "isSubtopic": true
          },
          {
            "title": "O corpo retém menos sal e água",
            "content": "O rim elimina o excesso de sal e água, diminuindo a quantidade total de líquido que circula pelo corpo.",
            "icon": "Droplet",
            "type": "success",
            "isSubtopic": true
          },
          {
            "title": "Alívio e Proteção dos Órgãos",
            "content": "A melhora nesses dois mecanismos alivia coração, rins e outros órgãos de uma pressão alta que é extremamente prejudicial!",
            "icon": "Heart",
            "type": "success"
          }
        ]
      },
      {
        "pageNumber": 5,
        "title": "Efeitos colaterais",
        "description": "Informações essenciais de segurança para o seu dia a dia:",
        "sections": [
          {
            "title": "Restrições Importantes",
            "content": "* Não pode usar na gravidez ou no planejamento da gravidez, pois pode afetar gravemente o desenvolvimento do bebê.\n* Não pode se associar com IECAs (Ex: Captopril, enalapril, ramipril).\n* Pode piorar a função renal no começo, mas volta ao normal e estabiliza com o tempo.\n* Risco de aumento do potássio (principalmente se já tiver doença renal crônica avançada ou em uso de espironolactona).",
            "icon": "ShieldAlert",
            "type": "warning"
          },
          {
            "title": "Tonturas e Alergias",
            "content": "* Tontura leve: Ao levantar-se rapidamente, costuma aparecer nos primeiros dias. Levante-se devagar.\n* Alergia grave (rara): sintomas como inchaço no rosto, lábios ou língua, falta de ar.",
            "icon": "AlertTriangle",
            "type": "warning"
          },
          {
            "title": "Atendimento de Saúde",
            "content": "Caso sinta algum dos sintomas listados acima ou outro novo sintoma a partir do uso de um novo medicamento, procure um médico o quanto antes!",
            "icon": "ShieldAlert",
            "type": "warning"
          }
        ]
      },
      {
        "pageNumber": 6,
        "title": "Interações medicamentosas",
        "description": "Abaixo estão algumas interações a serem evitadas durante o tratamento:",
        "sections": [
          {
            "title": "Anti-inflamatórios e IECAs",
            "content": "* Anti-inflamatórios (Ex: ibuprofeno, cetoprofeno, nimesulida, diclofenaco): podem reduzir o efeito do remédio, provocando aumento da pressão.\n* Inibidores da enzima conversora de angiotensina - IECAs: Aumenta o risco dos efeitos adversos por agirem no mesmo sistema.",
            "icon": "XCircle",
            "type": "warning"
          },
          {
            "title": "Lítio e Diuréticos",
            "content": "* Lítio: Diminui a excreção do lítio,elevando a concentração dele no sangue.\n* Diuréticos poupadores de potássio (Ex: espironolactona): acúmulo excessivo de potássio no sangue pode causar fraqueza muscular, e em casos graves, arritmia.",
            "icon": "AlertTriangle",
            "type": "warning"
          }
        ]
      },
      {
        "pageNumber": 7,
        "title": "Recomendações e Avisos",
        "description": "Orientações fundamentais para a sua segurança e saúde:",
        "sections": [
          {
            "title": "Uso Seguro",
            "content": "Comunique sempre seu médico sobre os seus medicamentos de uso, para que assim ele faça a melhor combinação disponível para o seu caso!",
            "icon": "ThumbsUp",
            "type": "info"
          },
          {
            "title": "Aviso Importante",
            "content": "Este material tem caráter puramente educativo e informativo. As informações aqui contidas refletem as diretrizes médicas gerais e não substituem, em hipótese alguma, a consulta com o seu médico assistente. Nunca altere a dose, interrompa o uso ou inicie qualquer medicamento por conta própria. Cada organismo é único e o tratamento deve ser individualizado.",
            "icon": "ShieldAlert",
            "type": "warning"
          }
        ]
      },
      {
        "pageNumber": 8,
        "title": "Resumo Geral",
        "description": "Parabéns por concluir esta leitura! Aqui está uma revisão rápida de tudo o que aprendemos sobre os medicamentos BRA (Sartanas):",
        "sections": [
          {
            "title": "O que são?",
            "content": "São os Bloqueadores dos Receptores da Angiotensina (como Losartana e Valsartana), usados para controlar a pressão arterial alta.",
            "icon": "Pill",
            "type": "success"
          },
          {
            "title": "Como funcionam?",
            "content": "Agem como uma “chave falsa” na “fechadura” (receptor) do hormônio que contrai os vasos sanguíneos. Com isso, os vasos relaxam e o corpo elimina o excesso de sal e água, reduzindo a pressão.",
            "icon": "Activity",
            "type": "success"
          },
          {
            "title": "Por que tomar?",
            "content": "Ao reduzir a pressão, eles protegem o seu coração contra infartos/derrames e salvaguardam os seus rins contra lesões a longo prazo.",
            "icon": "Heart",
            "type": "success"
          },
          {
            "title": "Cuidados principais",
            "content": "Monitore possíveis tonturas no início, faça exames de sangue periódicos (potássio e creatinina) e evite misturar com anti-inflamatórios.",
            "icon": "ShieldAlert",
            "type": "warning"
          }
        ]
      }
    ]
  },
  "hipertensao_eca": {
    "medicineName": "Pris (Inibidores da ECA)",
    "subtitle": "Inibidores da Enzima Conversora de Angiotensina",
    "colorTheme": "green",
    "category": "hipertensao",
    "tags": ["pressão", "hipertensão", "captopril", "enalapril", "ramipril", "tosse", "rins"],
    "pages": [
      {
        "pageNumber": 1,
        "title": "Guia Prático dos Pris",
        "description": "Remédios que terminam com \"Pril\" (como Enalapril e Captopril) são muito usados para baixar a pressão e proteger os rins de quem tem diabetes.",
        "sections": []
      },
      {
        "pageNumber": 2,
        "title": "Remédios e Dosagens Comuns",
        "description": "Conheça as doses comuns e como tomar estes medicamentos de forma segura.",
        "sections": [
          {
            "title": "Captopril (Capoten)",
            "content": "• Dosagem comum: 12,5 mg, 25 mg ou 50 mg.\n• Como tomar: Geralmente tomado 2 ou 3 vezes ao dia, de preferência 1 hora antes das refeições (com o estômago vazio) para funcionar melhor.",
            "icon": "Pill",
            "type": "success"
          },
          {
            "title": "Enalapril (Renitec)",
            "content": "• Dosagem comum: 5 mg, 10 mg ou 20 mg.\n• Como tomar: Uma ou duas vezes ao dia, pode ser tomado com ou sem alimentos.",
            "icon": "Pill",
            "type": "success"
          }
        ]
      },
      {
        "pageNumber": 3,
        "title": "Como Funciona o Remédio",
        "description": "Eles agem impedindo a fabricação do fermento (enzima) que aperta as nossas artérias.",
        "sections": [
          {
            "title": "A Chave do Estreitamento",
            "content": "O nosso corpo fabrica uma substância que aperta com força os vasos de sangue. Os remédios \"Pril\" cortam a fabricação dessa substância apertadora.",
            "icon": "Activity",
            "type": "info"
          },
          {
            "title": "Efeito Desapertador",
            "content": "Com menos substância apertadora na circulação, os vasos relaxam e a pressão cai. Isso tira o esforço excessivo do coração para bombear o sangue.",
            "icon": "Heart",
            "type": "success"
          }
        ]
      },
      {
        "pageNumber": 4,
        "title": "O Efeito Colateral Famoso",
        "description": "Estes medicamentos têm um efeito colateral bastante específico que você precisa conhecer:",
        "sections": [
          {
            "title": "Tosse Seca e Chata",
            "content": "• Uma tosse seca e irritativa na garganta (que parece uma coceira constante) pode surgir. Ela não passa com xarope. Se for muito incômoda, avise seu médico, pois ele pode trocar o remédio por uma \"Sartana\".",
            "icon": "AlertTriangle",
            "type": "warning"
          },
          {
            "title": "Inchaço no Rosto",
            "content": "• Raramente pode causar inchaço nos lábios, língua ou olhos. Se isso acontecer, procure um serviço de emergência imediatamente e pare de tomar o remédio.",
            "icon": "ShieldAlert",
            "type": "warning"
          }
        ]
      },
      {
        "pageNumber": 5,
        "title": "Cuidados Importantes",
        "description": "Veja o que você deve evitar durante o tratamento com os \"Pris\":",
        "sections": [
          {
            "title": "Grávidas: Proibido",
            "content": "• Assim como as Sartanas, estes remédios fazem muito mal para os rins e formação do bebê se usados na gravidez.",
            "icon": "XCircle",
            "type": "warning"
          },
          {
            "title": "Substitutos de Sal de Cozinha",
            "content": "• Evite usar \"sal diet\" ou \"sal light\" que contenham muito potássio. Estes remédios já retêm potássio no corpo, e o excesso pode alterar os batimentos do coração.",
            "icon": "AlertTriangle",
            "type": "warning"
          }
        ]
      },
      {
        "pageNumber": 6,
        "title": "Infográfico de Resumo",
        "description": "Guarde os pontos fundamentais sobre o Captopril e Enalapril.",
        "sections": [
          {
            "title": "DOSES",
            "content": "• Captopril: Tomar de estômago vazio 2-3x ao dia.\n• Enalapril: Tomar 1-2x ao dia com ou sem comida.",
            "icon": "Pill",
            "type": "info"
          },
          {
            "title": "SINAIS",
            "content": "• Tosse seca e persistente é comum. Não tome xaropes, avise seu médico.",
            "icon": "AlertTriangle",
            "type": "warning"
          },
          {
            "title": "PERIGOS",
            "content": "• Nunca use na gravidez.\n• Evite sal light rico em potássio.\n• Cuidado com anti-inflamatórios.",
            "icon": "ShieldAlert",
            "type": "warning"
          }
        ],
        "isInfographic": true
      }
    ]
  },
  "diabetes_metformina": {
    "medicineName": "Metformina",
    "subtitle": "Remédio de Glicose (Glifage)",
    "colorTheme": "blue",
    "category": "diabetes",
    "tags": ["diabetes", "açúcar", "glicose", "metformina", "glifage", "glicemia", "barriga"],
    "pages": [
      {
        "pageNumber": 1,
        "title": "Guia Prático da Metformina",
        "description": "O medicamento mais seguro e usado no mundo para controlar o açúcar alto (diabetes) no sangue e proteger o seu corpo.",
        "sections": []
      },
      {
        "pageNumber": 2,
        "title": "Remédios e Dosagens Comuns",
        "description": "Conheça as doses comuns do remédio e como tomar para evitar desconfortos.",
        "sections": [
          {
            "title": "Metformina Comum",
            "content": "• Dosagem comum: 500 mg, 850 mg ou 1000 mg.\n• Como tomar: Sempre durante ou logo depois das principais refeições (café da manhã ou jantar) para proteger a sua barriga.",
            "icon": "Pill",
            "type": "success"
          },
          {
            "title": "Glifage XR (Liberação Lenta)",
            "content": "• Esta versão XR solta o remédio bem devagar no corpo ao longo do dia, diminuindo quase a zero os enjoos e a dor de barriga.",
            "icon": "Activity",
            "type": "success"
          }
        ]
      },
      {
        "pageNumber": 3,
        "title": "Como Funciona a Metformina",
        "description": "Entender como o corpo lida com o açúcar nos ajuda a compreender por que o remédio é tão importante:",
        "sections": [
          {
            "title": "O Açúcar como Energia",
            "content": "Tudo o que comemos vira açúcar no sangue para dar energia às nossas células. Mas, para esse açúcar entrar nas células, ele precisa de uma chave chamada Insulina.",
            "icon": "Flame",
            "type": "info"
          },
          {
            "title": "A Fechadura Emperrada",
            "content": "No Diabetes Tipo 2, a fechadura das células fica emperrada (resistência à insulina). O açúcar não consegue entrar e se acumula no sangue, como uma pia entupida.",
            "icon": "AlertTriangle",
            "type": "warning"
          },
          {
            "title": "A Ação da Metformina",
            "content": "O remédio limpa e desentope essa fechadura, facilitando a entrada do açúcar nas células. Além disso, ele avisa o fígado para parar de fabricar açúcar extra.",
            "icon": "CheckCircle2",
            "type": "success"
          }
        ]
      },
      {
        "pageNumber": 4,
        "title": "Efeitos Iniciais na Barriga",
        "description": "É comum sentir alguns desconfortos na barriga nas primeiras semanas. Saiba como lidar com eles:",
        "sections": [
          {
            "title": "Efeitos Comuns no Início",
            "content": "• Gases, cólicas leves, fezes moles ou um gosto estranho de metal na boca podem surgir. Isso melhora bastante tomando o remédio sempre de estômago cheio.",
            "icon": "Coffee",
            "type": "warning"
          },
          {
            "title": "Vitamina B12",
            "content": "• O uso contínuo da Metformina por muitos anos pode reduzir a absorção de Vitamina B12 no corpo. Seu médico pode solicitar exames de sangue simples para monitorar isso.",
            "icon": "AlertTriangle",
            "type": "warning"
          }
        ]
      },
      {
        "pageNumber": 5,
        "title": "Interações e Bebidas",
        "description": "Preste atenção especial ao misturar o remédio com bebidas alcoólicas ou fazer exames de imagem:",
        "sections": [
          {
            "title": "Álcool: Cuidado Extremo",
            "content": "• Beber muito álcool enquanto toma Metformina aumenta o risco de uma complicação rara e perigosa chamada acidose lática. Evite o excesso.",
            "icon": "XCircle",
            "type": "warning"
          },
          {
            "title": "Exames com Contraste",
            "content": "• Se for fazer exames de raio-X ou tomografia com contraste iodado, avise seu médico. Pode ser necessário suspender a Metformina por 48 horas.",
            "icon": "Calendar",
            "type": "info"
          }
        ]
      },
      {
        "pageNumber": 6,
        "title": "Infográfico de Resumo",
        "description": "Confira as dicas essenciais de forma rápida e visual sobre a Metformina.",
        "sections": [
          {
            "title": "O REMÉDIO",
            "content": "• Metformina (Glifage XR) 500-1000mg. Tomar junto das refeições principais.",
            "icon": "Pill",
            "type": "info"
          },
          {
            "title": "MECANISMO",
            "content": "• Desentope as fechaduras das células para o açúcar entrar e virar energia, baixando a glicose do sangue.",
            "icon": "Activity",
            "type": "success"
          },
          {
            "title": "EFEITOS",
            "content": "• Desconforto gástrico inicial é normal, some com o tempo. Evite álcool em excesso.",
            "icon": "ShieldAlert",
            "type": "warning"
          }
        ],
        "isInfographic": true
      }
    ]
  },
  "diabetes_sglt2": {
    "medicineName": "Gliflozinas (Inibidores da SGLT2)",
    "subtitle": "Inibidores do Transportador de Sódio-Glicose 2",
    "colorTheme": "indigo",
    "category": "diabetes",
    "tags": ["diabetes", "açúcar", "dapagliflozina", "empagliflozina", "xigduo", "rins", "urina", "infecção"],
    "pages": [
      {
        "pageNumber": 1,
        "title": "Guia Prático das Gliflozinas",
        "description": "Remédios mais modernos para diabetes (como a Dapagliflozina) agem fazendo o corpo eliminar o excesso de açúcar diretamente pela urina, além de proteger os rins e o coração.",
        "sections": []
      },
      {
        "pageNumber": 2,
        "title": "Remédios e Dosagens Comuns",
        "description": "Conheça as doses comuns desses novos aliados contra o açúcar alto.",
        "sections": [
          {
            "title": "Dapagliflozina (Forxiga)",
            "content": "• Dosagem comum: 10 mg ao dia.\n• Como tomar: Uma vez ao dia, pela manhã, com ou sem comida.",
            "icon": "Pill",
            "type": "success"
          },
          {
            "title": "Empagliflozina (Jardiance)",
            "content": "• Dosagem comum: 10 mg ou 25 mg ao dia.\n• Como tomar: Uma vez ao dia, de preferência de manhã.",
            "icon": "Pill",
            "type": "success"
          }
        ]
      },
      {
        "pageNumber": 3,
        "title": "Como Funciona o Remédio",
        "description": "Este remédio usa um filtro natural do nosso corpo para deitar fora o açúcar.",
        "sections": [
          {
            "title": "O Filtro dos Rins",
            "content": "Normalmente, os nossos rins filtram o sangue e devolvem todo o açúcar de volta para o corpo para não desperdiçar energia.",
            "icon": "Droplet",
            "type": "info"
          },
          {
            "title": "A Torneira Aberta",
            "content": "As Gliflozinas abrem uma torneira secreta nos rins. Elas impedem que o açúcar volte para o sangue, jogando o excesso direto na privada através da urina.",
            "icon": "Activity",
            "type": "success"
          }
        ]
      },
      {
        "pageNumber": 4,
        "title": "Cuidados com a Higiene",
        "description": "Como há muito açúcar saindo na urina, algumas bactérias e fungos podem tentar se aproveitar disso. Veja como se proteger:",
        "sections": [
          {
            "title": "Risco de Infecção Urinária e Candidíase",
            "content": "• É fundamental beber bastante água ao longo do dia para fazer xixi com frequência e limpar o canal urinário.",
            "icon": "Droplet",
            "type": "warning"
          },
          {
            "title": "Higiene Íntima Rigorosa",
            "content": "• Lave bem a região íntima após urinar. Como a urina está doce, os germes adoram fazer festa ali se sobrar alguma gotinha na pele.",
            "icon": "XCircle",
            "type": "warning"
          }
        ]
      },
      {
        "pageNumber": 5,
        "title": "Sinais de Alerta",
        "description": "Um alerta muito raro, porém importante, sobre uma complicação grave:",
        "sections": [
          {
            "title": "Desidratação",
            "content": "• Como o açúcar puxa água junto, você vai urinar mais. Se sentir muita sede, boca seca ou tontura ao levantar, beba mais água e avise seu médico.",
            "icon": "AlertTriangle",
            "type": "warning"
          },
          {
            "title": "Cetoacidose Diabética",
            "content": "• Se sentir náuseas, vômitos, dor de barriga forte, respiração rápida ou cansaço extremo inexplicável, procure uma emergência imediatamente.",
            "icon": "ShieldAlert",
            "type": "warning"
          }
        ]
      },
      {
        "pageNumber": 6,
        "title": "Infográfico de Resumo",
        "description": "Guarde as dicas cruciais sobre as Gliflozinas para o dia a dia.",
        "sections": [
          {
            "title": "AÇÃO",
            "content": "• Joga o excesso de açúcar na privada através da urina. Protege rins e coração.",
            "icon": "Droplet",
            "type": "success"
          },
          {
            "title": "HIGIENE",
            "content": "• Beba muita água.\n• Lave bem a região íntima após usar o banheiro para evitar candidíase.",
            "icon": "ShieldAlert",
            "type": "warning"
          },
          {
            "title": "ALERTA",
            "content": "• Sentiu boca seca ou muita sede? Aumente os copos de água diários. Evite bebidas alcóolicas.",
            "icon": "AlertTriangle",
            "type": "warning"
          }
        ],
        "isInfographic": true
      }
    ]
  },
  "colesterol_estatinas": {
    "medicineName": "Estatinas",
    "subtitle": "Remédios de Colesterol (Sinvastatina/Atorvastatina)",
    "colorTheme": "amber",
    "category": "colesterol",
    "tags": ["colesterol", "gordura", "sinvastatina", "atorvastatina", "colesterol alto", "coração", "músculo"],
    "pages": [
      {
        "pageNumber": 1,
        "title": "Guia Prático das Estatinas",
        "description": "As estatinas são remédios essenciais para diminuir o colesterol ruim (LDL) e evitar que gorduras entupam as artérias do seu coração.",
        "sections": []
      },
      {
        "pageNumber": 2,
        "title": "Remédios e Dosagens Comuns",
        "description": "Entenda qual o melhor horário e como tomar cada tipo de estatina prescrita.",
        "sections": [
          {
            "title": "Sinvastatina (Zocor)",
            "content": "• Dosagem comum: 10 mg a 40 mg.\n• Como tomar: Sempre à noite, antes de dormir. O fígado produz muito mais colesterol durante a noite enquanto dormimos.",
            "icon": "Pill",
            "type": "success"
          },
          {
            "title": "Atorvastatina (Lipitor) e Rosuvastatina (Crestor)",
            "content": "• Dosagem comum: Atorvastatina (10-80 mg) ou Rosuvastatina (5-40 mg).\n• Como tomar: Uma vez ao dia, a qualquer hora do dia (ficam ativas no corpo por muito mais tempo).",
            "icon": "Pill",
            "type": "success"
          }
        ]
      },
      {
        "pageNumber": 3,
        "title": "Entendendo o Colesterol",
        "description": "Uma analogia simples nos ajuda a diferenciar o colesterol bom do colesterol ruim no sangue:",
        "sections": [
          {
            "title": "LDL: O Distribuidor Desatento",
            "content": "Pense no colesterol LDL como caminhões carregados de gordura saindo do fígado. Se houver muitos caminhões, a gordura cai e se acumula na parede das artérias, entupindo a passagem.",
            "icon": "AlertTriangle",
            "type": "warning"
          },
          {
            "title": "HDL: O Faxineiro Amigo",
            "content": "O HDL funciona como o caminhão de lixo ou o faxineiro. Ele passa limpando as artérias, recolhendo a gordura caída e levando de volta para o fígado para ser destruída.",
            "icon": "CheckCircle2",
            "type": "success"
          },
          {
            "title": "Como as Estatinas Ajudam",
            "content": "O remédio bloqueia a fabricação de novo colesterol no fígado. Sem poder fabricar, o fígado é obrigado a sugar a gordura solta no sangue de volta para si, limpando as artérias!",
            "icon": "Heart",
            "type": "success"
          }
        ]
      },
      {
        "pageNumber": 4,
        "title": "Efeitos Colaterais e Alertas",
        "description": "Embora muito seguras, as estatinas exigem alguns cuidados importantes:",
        "sections": [
          {
            "title": "Dores Musculares (Mialgia)",
            "content": "• Algumas pessoas sentem dores musculares leves, como cansaço ou câibras, especialmente nas pernas ou costas. Se sentir dores inexplicáveis, relate ao médico.",
            "icon": "Activity",
            "type": "warning"
          },
          {
            "title": "Exames de Rotina",
            "content": "• O médico solicitará exames simples de sangue para monitorar a saúde do fígado e verificar se o corpo está se adaptando perfeitamente.",
            "icon": "ShieldAlert",
            "type": "info"
          }
        ]
      },
      {
        "pageNumber": 5,
        "title": "Interações Importantes",
        "description": "Evite alimentos ou combinações que possam interferir com a segurança do seu remédio:",
        "sections": [
          {
            "title": "Suco de Toranja (Grapefruit)",
            "content": "• O suco desta fruta impede que o fígado quebre a Sinvastatina corretamente, fazendo a dose acumular de forma tóxica no sangue. Evite consumir.",
            "icon": "XCircle",
            "type": "warning"
          },
          {
            "title": "Bebidas Alcoólicas",
            "content": "• O consumo exagerado de álcool sobrecarrega o fígado, que já está trabalhando junto com a estatina. Use com bastante moderação.",
            "icon": "AlertTriangle",
            "type": "warning"
          }
        ]
      },
      {
        "pageNumber": 6,
        "title": "Infográfico de Resumo",
        "description": "Guarde estas orientações práticas sobre o uso seguro das estatinas.",
        "sections": [
          {
            "title": "OS REMÉDIOS",
            "content": "• Sinvastatina (tomar antes de deitar).\n• Atorvastatina / Rosuvastatina (tomar em qualquer horário).",
            "icon": "Pill",
            "type": "info"
          },
          {
            "title": "O CAMINHO",
            "content": "• LDL entope artérias; HDL limpa. O remédio força o fígado a engolir e limpar o LDL acumulado no sangue.",
            "icon": "Heart",
            "type": "success"
          },
          {
            "title": "ALERTA",
            "content": "• Dor forte ou cansaço muscular estranho nas pernas? Procure seu médico. Evite suco de toranja.",
            "icon": "ShieldAlert",
            "type": "warning"
          }
        ],
        "isInfographic": true
      }
    ]
  },
  "colesterol_fibratos": {
    "medicineName": "Fibratos",
    "subtitle": "Remédios de Triglicerídeos (Genfibrozila/Fenofibrato)",
    "colorTheme": "rose",
    "category": "colesterol",
    "tags": ["colesterol", "gordura", "triglicerídeos", "genfibrozila", "fenofibrato", "estômago"],
    "pages": [
      {
        "pageNumber": 1,
        "title": "Guia Prático dos Fibratos",
        "description": "Os Fibratos são medicamentos muito potentes indicados para baixar os Triglicerídeos (outro tipo de gordura nociva no sangue) e proteger o pâncreas de inflamações.",
        "sections": []
      },
      {
        "pageNumber": 2,
        "title": "Remédios e Dosagens Comuns",
        "description": "Saiba quais são as doses comuns e os horários indicados para estes remédios.",
        "sections": [
          {
            "title": "Genfibrozila (Lopid)",
            "content": "• Dosagem comum: 600 mg ou 900 mg.\n• Como tomar: Geralmente tomado duas vezes ao dia, exatamente meia hora antes do café da manhã e meia hora antes do jantar.",
            "icon": "Pill",
            "type": "success"
          },
          {
            "title": "Fenofibrato (Lipidil)",
            "content": "• Dosagem comum: 160 mg ou 200 mg.\n• Como tomar: Uma vez ao dia, tomado junto com a refeição mais pesada do dia (o estômago cheio ajuda o corpo a absorver o remédio).",
            "icon": "Pill",
            "type": "success"
          }
        ]
      },
      {
        "pageNumber": 3,
        "title": "Como Funciona o Remédio",
        "description": "Eles aceleram a queima natural de gorduras que circulam soltas no sangue.",
        "sections": [
          {
            "title": "Os Triglicerídeos como Combustível",
            "content": "Diferente do colesterol comum, os triglicerídeos são gorduras puras que o corpo guarda como estoque de comida extra para queimar no futuro.",
            "icon": "Activity",
            "type": "info"
          },
          {
            "title": "O Perigo do Excesso",
            "content": "Gordura demais deixa o sangue grosso e gorduroso, podendo causar uma dor de barriga terrível chamada Pancreatite Aguda (inflamação do pâncreas).",
            "icon": "AlertTriangle",
            "type": "warning"
          },
          {
            "title": "O Queimador Ativo",
            "content": "Os Fibratos ligam um botão no fígado que acelera a queima dessas gorduras, limpando o sangue e reduzindo rapidamente os triglicerídeos.",
            "icon": "Flame",
            "type": "success"
          }
        ]
      },
      {
        "pageNumber": 4,
        "title": "Cuidados e Efeitos Comuns",
        "description": "Os efeitos colaterais mais normais e como você deve se prevenir de reações:",
        "sections": [
          {
            "title": "Estômago Sensível",
            "content": "• Desconfortos como dor de estômago, gases, enjoo ou queimação de estômago podem ocorrer nas primeiras semanas. Comer bem ajuda a amenizar.",
            "icon": "Coffee",
            "type": "warning"
          },
          {
            "title": "Pedra na Vesícula",
            "content": "• Estes medicamentos estimulam a saída de bile, o que pode aumentar levemente a chance de formar pedras na vesícula a longo prazo.",
            "icon": "AlertTriangle",
            "type": "warning"
          }
        ]
      },
      {
        "pageNumber": 5,
        "title": "Interação com Outros Remédios",
        "description": "Preste muita atenção ao usar Fibratos se você já toma remédios para o colesterol comum:",
        "sections": [
          {
            "title": "Fibratos + Estatinas",
            "content": "• Misturar Fibratos (especialmente Genfibrozila) com Estatinas aumenta muito o risco de dores musculares intensas e lesão nos rins. Seu médico deve acompanhar isso com cautela.",
            "icon": "ShieldAlert",
            "type": "warning"
          },
          {
            "title": "Varfarina (Anticoagulantes)",
            "content": "• Fibratos aumentam o efeito de remédios para afinar o sangue, aumentando a chance de sangramentos. Pode ser preciso ajustar a dose.",
            "icon": "AlertTriangle",
            "type": "warning"
          }
        ]
      },
      {
        "pageNumber": 6,
        "title": "Infográfico de Resumo",
        "description": "Relembre os pontos essenciais do controle dos Triglicerídeos.",
        "sections": [
          {
            "title": "MEDICAÇÃO",
            "content": "• Genfibrozila: Tomar 30min antes das refeições principais.\n• Fenofibrato: Tomar junto com a comida principal.",
            "icon": "Pill",
            "type": "info"
          },
          {
            "title": "EFEITOS",
            "content": "• Sintomas gástricos leves e gases são esperados no início. Comer bem ajuda.",
            "icon": "Coffee",
            "type": "warning"
          },
          {
            "title": "MISTURA PERIGOSA",
            "content": "• Evite misturar Genfibrozila com Estatinas sem consentimento médico devido ao risco de lesão muscular.",
            "icon": "ShieldAlert",
            "type": "warning"
          }
        ],
        "isInfographic": true
      }
    ]
  }
};

async function startServer() {
  const app = express();
  const port = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Initialize Gemini Client
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({
    apiKey: apiKey || 'DUMMY_KEY_FOR_BUILD',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // API to fetch list of standard preset medicines
  app.get('/api/presets', (req, res) => {
    const list = Object.keys(PRESET_MEDICINES).map(key => ({
      key,
      medicineName: PRESET_MEDICINES[key].medicineName,
      subtitle: PRESET_MEDICINES[key].subtitle,
      colorTheme: PRESET_MEDICINES[key].colorTheme,
      category: PRESET_MEDICINES[key].category,
      tags: PRESET_MEDICINES[key].tags || []
    }));
    res.json(list);
  });

  // API to simplify prescription/leaflet/medicine text
  app.post('/api/simplify', async (req, res) => {
    try {
      const { text, medicineName, accessibilitySettings } = req.body;

      // Clean the key
      const lookupKey = medicineName ? medicineName.trim() : '';
      
      // If we have a preset matching this exactly and no custom text is pasted, return the preset!
      if (!text && PRESET_MEDICINES[lookupKey]) {
        console.log(`Returning preset medicine for key: ${lookupKey}`);
        if (lookupKey === 'hipertensao_bra' && accessibilitySettings && !accessibilitySettings.simpleLanguage) {
          console.log('Returning Technical BRA medicine (Diretriz 2025)');
          return res.json(TECHNICAL_BRA_MEDICINE);
        }
        return res.json(PRESET_MEDICINES[lookupKey]);
      }

      // Check if API Key is configured
      if (!process.env.GEMINI_API_KEY) {
        // Fallback: If no API Key, return a placeholder preset or error
        if (PRESET_MEDICINES[lookupKey]) {
          if (lookupKey === 'hipertensao_bra' && accessibilitySettings && !accessibilitySettings.simpleLanguage) {
            console.log('Returning Technical BRA medicine (Diretriz 2025) fallback');
            return res.json(TECHNICAL_BRA_MEDICINE);
          }
          return res.json(PRESET_MEDICINES[lookupKey]);
        }
        return res.status(400).json({ 
          error: "Por favor, configure sua chave do Gemini nos Secrets do AI Studio para simplificar bulas personalizadas." 
        });
      }

      console.log(`Analyzing customized medicine via Gemini: "${medicineName}"`);

      let systemInstruction = `
Você é um especialista em saúde pública brasileira, empatia e acessibilidade. Sua missão é traduzir bulas ou informações médicas complexas em um guia visual simples e amigável em formato de E-book (JSON), focado em pessoas com baixa escolaridade ou idosas que tomam muitos remédios.

Regras de Simplificação Críticas:
1. Linguagem amigável e fofinha: Evite jargões médicos difíceis. Substitua "Posologia" por "Como tomar", "Cefaleia" por "Dor de cabeça", "Prurido" por "Coceira", "Hipersensibilidade" por "Alergia".
2. Use analogias acolhedoras.
3. Divida as orientações de forma sequencial em 3 a 5 páginas de e-book.
4. Use apenas nomes de ícones do Lucide válidos, por exemplo:
   - 'Clock' para horários, de quanto em quanto tempo.
   - 'AlertTriangle' ou 'ShieldAlert' para cuidados ou contraindicações perigosas.
   - 'Activity' para como funciona ou efeitos comuns.
   - 'Heart' para problemas do coração, circulação, ou saúde geral.
   - 'Droplet' para líquidos ou água.
   - 'XCircle' ou 'CheckCircle2' para o que NÃO fazer e o que FAZER.
   - 'Calendar' para dias do tratamento.
   - 'Flame' para reações de febre, queimação, ou alertas urgentes de emergência.
   - 'Coffee' para alimentação, estômago, ou cansaço.
5. Foco visual e empático: Diga claramente o que fazer se esquecer e avisos sobre não misturar com cachaça, cerveja ou outros remédios comuns.
`;

      if (accessibilitySettings && !accessibilitySettings.simpleLanguage) {
        systemInstruction = `
Você é um especialista em cardiologia e farmacologia médica clínica de acordo com as normas da Sociedade Brasileira de Cardiologia (SBC). Sua missão é produzir um guia médico aprofundado, científico e detalhado em formato de E-book (JSON) voltado a profissionais de saúde ou pacientes que demandem explicações científicas rigorosas e termos técnicos a partir da Diretriz Brasileira de Hipertensão Arterial de 2025 (DBHA 2025).

Regras de Conteúdo Técnico Críticas:
1. Utilize terminologia científica rigorosa e termos técnicos autênticos (ex: "antagonismo competitivo", "vasoconstrição", "resistência vascular periférica (RVP)", "remodelamento ventricular", "microalbuminúria", "nefropatia", "hiperkalemia", "TFG estimada", "teratogenicidade").
2. Inclua metas pressóricas baseadas na DBHA 2025 (como meta pressórica padrão < 130/80 mmHg, terapia de associação dupla em dose fixa em comprimido único para hipertensão estágio 1 de risco moderado/alto e estágios 2 e 3, contraindicação formal de BRA + IECA, e monitorização de potássio/creatinina na doença renal crônica).
3. Divida as orientações de forma sequencial em 5 a 8 páginas de e-book.
4. Use apenas nomes de ícones do Lucide válidos, por exemplo:
   - 'Clock' para horários, frequência de tomadas ou monitoramentos (MAPA/MRPA).
   - 'AlertTriangle' ou 'ShieldAlert' para riscos de hipercalemia, AINEs ou contraindicações perigosas.
   - 'Activity' para mecanismos de ação do SRAA ou efeitos adversos.
   - 'Heart' para cardioproteção, desfechos cardiovasculares.
   - 'Droplet' para volemia ou função renal.
   - 'XCircle' ou 'CheckCircle2' para contraindicações absolutas (gravidez) ou associações contraindicadas (BRA+IECA).
   - 'Pill' para posologias, doses habituais.
   - 'Lock' para mecanismos de bloqueio dos receptores AT1.
5. Foco em precisão científica e vigilância: Destaque a importância da depuração de creatinina, potássio sérico e interações farmacológicas severas.
`;
      }

      const prompt = `
Crie um guia simplificado de e-book para o remédio: "${medicineName || 'Medicamento Solicitado'}".
Texto original da bula ou informações de suporte fornecidas pelo usuário:
"""
${text || 'Pesquise sobre as bulas oficiais registradas na ANVISA desse medicamento e resuma com base nelas.'}
"""

Configurações extras de acessibilidade:
- Linguagem Fácil: ${accessibilitySettings?.simpleLanguage ? 'Nível Máximo' : 'Normal'}
- Encorajar Pictogramas e ícones coloridos: Sim

Gere um objeto JSON no formato exato especificado abaixo. Não inclua Markdown extras além do JSON bruto:
{
  "medicineName": "Nome simplificado do remédio (ex: Paracetamol ou Amoxicilina)",
  "subtitle": "Frase curta resumindo o principal benefício (ex: Combate bactérias da infecção)",
  "colorTheme": "blue" | "green" | "emerald" | "amber" | "rose" | "indigo",
  "pages": [
    {
      "pageNumber": 1,
      "title": "Título curto em caixa alta (ex: PARA QUE SERVE?)",
      "description": "Texto explicativo ultra simples (máximo de 2 frases curtas) em fonte grande.",
      "sections": [
        {
          "title": "Subtítulo de ação (ex: Como ajuda você?)",
          "content": "Explicação direta, curta e sem palavras complicadas.",
          "icon": "LucideIconName",
          "type": "success" | "warning" | "info" | "neutral"
        }
      ]
    }
  ]
}
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              medicineName: { type: Type.STRING },
              subtitle: { type: Type.STRING },
              colorTheme: { type: Type.STRING },
              pages: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    pageNumber: { type: Type.INTEGER },
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    sections: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          title: { type: Type.STRING },
                          content: { type: Type.STRING },
                          icon: { type: Type.STRING },
                          type: { type: Type.STRING }
                        },
                        required: ["title", "content", "icon", "type"]
                      }
                    }
                  },
                  required: ["pageNumber", "title", "description", "sections"]
                }
              }
            },
            required: ["medicineName", "subtitle", "colorTheme", "pages"]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error('Nenhuma resposta foi gerada pelo modelo de Inteligência Artificial.');
      }

      const parsedData = JSON.parse(responseText.trim());
      res.json(parsedData);
    } catch (error: any) {
      console.error('Error in /api/simplify:', error);
      res.status(500).json({ error: error.message || 'Erro ao processar as informações do medicamento.' });
    }
  });

  // Integrate Vite for Frontend routes in Development Mode
  if (process.env.NODE_ENV === 'production') {
    // Serve static files from the pre-built 'dist' folder
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    // Vite Dev Middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);
    
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  }

  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
}

startServer();
