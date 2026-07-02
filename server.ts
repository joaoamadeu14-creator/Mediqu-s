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
        "title": "Guia Prático das Sartanas",
        "description": "Remédios que terminam com \"Sartana\" (como Losartana) protegem o coração e evitam que a pressão suba, relaxando os vasos de sangue.",
        "sections": []
      },
      {
        "pageNumber": 2,
        "title": "Remédios e Dosagens Comuns",
        "description": "Entenda as doses comuns e horários habituais recomendados para estes remédios de uso diário.",
        "sections": [
          {
            "title": "Losartana (Cozaar)",
            "content": "• Dosagem comum: 50 mg a 100 mg\n• Como tomar: Uma vez ao dia (geralmente pela manhã) ou dividida de 12 em 12 horas.",
            "icon": "Pill",
            "type": "success"
          },
          {
            "title": "Valsartana (Diovan)",
            "content": "• Dosagem comum: 80 mg a 320 mg\n• Como tomar: Uma vez ao dia, de preferência no mesmo horário todos os dias.",
            "icon": "Pill",
            "type": "success"
          },
          {
            "title": "Olmesartana (Benicar)",
            "content": "• Dosagem comum: 20 mg a 40 mg\n• Como tomar: Uma vez ao dia.",
            "icon": "Pill",
            "type": "success"
          }
        ]
      },
      {
        "pageNumber": 3,
        "title": "Como Funciona o Remédio",
        "description": "Uma analogia simples nos ajuda a entender por que a pressão alta sobrecarrega nosso coração e como o remédio ajuda.",
        "sections": [
          {
            "title": "A Mangueira Apertada",
            "content": "Imagine que as suas veias e artérias são como uma mangueira de jardim. Se você apertar a ponta da mangueira, a água sai com muito mais força e violência, forçando todo o sistema. No corpo, isso é a pressão alta!",
            "icon": "Droplet",
            "type": "warning"
          },
          {
            "title": "O Hormônio do Estreitamento",
            "content": "O nosso próprio corpo produz um hormônio que funciona como uma mão invisível apertando essas mangueiras. É aí que as Sartanas entram.",
            "icon": "AlertTriangle",
            "type": "warning"
          },
          {
            "title": "O Bloqueio do Aperto",
            "content": "As Sartanas funcionam como um escudo protetor. Elas impedem que a mão invisível aperte a mangueira, mantendo as veias relaxadas, abertas e saudáveis.",
            "icon": "Heart",
            "type": "success"
          }
        ]
      },
      {
        "pageNumber": 4,
        "title": "Cuidados e Efeitos Colaterais",
        "description": "Preste atenção aos avisos de segurança importantes e saiba como reagir a tonturas comuns:",
        "sections": [
          {
            "title": "Gravidez: Alerta Máximo",
            "content": "• Estes medicamentos não podem ser usados por grávidas ou mulheres que planejam engravidar, pois podem fazer mal ao bebê.",
            "icon": "XCircle",
            "type": "warning"
          },
          {
            "title": "Tontura ao Levantar",
            "content": "• É comum sentir tontura nos primeiros dias de uso, especialmente ao levantar rápido demais da cama ou cadeira. Levante-se com calma.",
            "icon": "Activity",
            "type": "warning"
          }
        ]
      },
      {
        "pageNumber": 5,
        "title": "Interações e Alertas",
        "description": "Evite misturar ou combinar estes remédios para garantir que eles funcionem de forma segura e perfeita:",
        "sections": [
          {
            "title": "Anti-inflamatórios",
            "content": "• Remédios para dor como Ibuprofeno, Nimesulida ou Diclofenaco cortam o efeito do remédio de pressão alta e podem fazer sua pressão subir perigosamente.",
            "icon": "AlertTriangle",
            "type": "warning"
          },
          {
            "title": "Bebidas Alcoólicas",
            "content": "• O consumo excessivo de álcool pode potencializar a tontura causada pelo remédio, aumentando o risco de quedas.",
            "icon": "XCircle",
            "type": "warning"
          }
        ]
      },
      {
        "pageNumber": 6,
        "title": "Infográfico de Resumo",
        "description": "Confira abaixo as informações cruciais sobre as Sartanas de maneira rápida e descomplicada.",
        "sections": [
          {
            "title": "MEDICAMENTOS",
            "content": "• Losartana (50-100mg)\n• Valsartana (80-320mg)\n• Olmesartana (20-40mg)",
            "icon": "Pill",
            "type": "info"
          },
          {
            "title": "A MANGUEIRA",
            "content": "• Vasos apertados geram pressão alta. As Sartanas relaxam as artérias e protegem seu coração.",
            "icon": "Heart",
            "type": "success"
          },
          {
            "title": "CUIDADOS",
            "content": "• Nunca use na gravidez.\n• Cuidado ao levantar rápido.\n• Evite misturar com anti-inflamatórios.",
            "icon": "ShieldAlert",
            "type": "warning"
          }
        ],
        "isInfographic": true
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
        return res.json(PRESET_MEDICINES[lookupKey]);
      }

      // Check if API Key is configured
      if (!process.env.GEMINI_API_KEY) {
        // Fallback: If no API Key, return a placeholder preset or error
        if (PRESET_MEDICINES[lookupKey]) {
          return res.json(PRESET_MEDICINES[lookupKey]);
        }
        return res.status(400).json({ 
          error: "Por favor, configure sua chave do Gemini nos Secrets do AI Studio para simplificar bulas personalizadas." 
        });
      }

      console.log(`Analyzing customized medicine via Gemini: "${medicineName}"`);

      const systemInstruction = `
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
  if (process.env.DISABLE_HMR === 'true' || process.env.NODE_ENV === 'production') {
    // Serve static files from the pre-built 'dist' folder
    const distPath = path.join(__dirname, 'dist');
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
