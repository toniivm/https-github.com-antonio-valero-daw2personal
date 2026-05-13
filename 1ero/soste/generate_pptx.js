// ============================================================
//  Ciclo de Vida del Smartphone — Generador de presentación v2
//  Slide canvas: 10" wide x 7.5" tall  (LAYOUT_16x9)
//  Safe content zone: x 0.35–9.65 | y 1.5–7.15
// ============================================================
const PptxGenJS = require('pptxgenjs');
const pptx = new PptxGenJS();
pptx.layout = 'LAYOUT_16x9';
pptx.title = 'Ciclo de Vida del Smartphone';
pptx.author = 'Alumno DAW';

// Paleta de colores
const C = {
  navy:       '0D1B2A',
  blue:       '1B4F72',
  lightBlue:  '2E86AB',
  accent:     'E8890A',
  accentLight:'F9C74F',
  white:      'FFFFFF',
  offwhite:   'F5F8FC',
  mid:        '666666',
  darkGray:   '333333',
  green:      '1D7A40',
  orange:     '9C4700',
  red:        'C0222A',
};

// ─── Helper: slide con cabecera coloreada ─────────────────────────────────────
function headerSlide(title, hColor) {
  const s = pptx.addSlide();
  s.addShape(pptx.ShapeType.rect, { x:0, y:0, w:'100%', h:'100%', fill:{color:C.offwhite} });
  s.addShape(pptx.ShapeType.rect, { x:0, y:0, w:'100%', h:1.35, fill:{color: hColor || C.navy} });
  s.addShape(pptx.ShapeType.rect, { x:0, y:1.35, w:'100%', h:0.07, fill:{color:C.accent} });
  s.addText(title, { x:0.4, y:0.35, w:9.0, h:0.65, fontSize:28, color:C.white, bold:true, fontFace:'Calibri' });
  return s;
}

// ─── Helper: fase badge ───────────────────────────────────────────────────────
function phaseBadge(slide, label) {
  slide.addShape(pptx.ShapeType.rect, { x:7.8, y:0.2, w:1.8, h:0.9, fill:{color:C.accent} });
  slide.addText(label, { x:7.8, y:0.2, w:1.8, h:0.9, fontSize:17, color:C.white, bold:true, align:'center', valign:'middle', fontFace:'Calibri' });
}

// ═══════════════════════════════════════════════════════════════════════════════
//  SLIDE 1 — PORTADA
// ═══════════════════════════════════════════════════════════════════════════════
const s1 = pptx.addSlide();
s1.addShape(pptx.ShapeType.rect, { x:0, y:0, w:'100%', h:'100%', fill:{color:C.navy} });
s1.addShape(pptx.ShapeType.rect, { x:0, y:0, w:0.4, h:'100%', fill:{color:C.accent} });
s1.addShape(pptx.ShapeType.rect, { x:7.0, y:0, w:3.0, h:'100%', fill:{color:C.blue, transparency:55} });
s1.addShape(pptx.ShapeType.rect, { x:0.7, y:3.5, w:5.9, h:0.07, fill:{color:C.accent} });

s1.addText('ANÁLISIS DEL CICLO DE VIDA', {
  x:0.7, y:1.3, w:6.0, h:0.5,
  fontSize:13, color:C.accentLight, fontFace:'Calibri', charSpacing:3
});
s1.addText('SMARTPHONE', {
  x:0.7, y:1.8, w:6.2, h:1.4,
  fontSize:56, color:C.white, bold:true, fontFace:'Calibri'
});
s1.addText('Del lanzamiento del iPhone a la era de la IA movil.\nUn producto, cuatro fases, dos decadas de historia.', {
  x:0.7, y:3.65, w:5.9, h:0.95,
  fontSize:13, color:'A8C0D6', fontFace:'Calibri'
});

s1.addShape(pptx.ShapeType.rect, { x:0, y:6.3, w:'100%', h:1.2, fill:{color:C.blue} });
s1.addText('Economia de la Empresa   |   2.o DAW   |   Curso 2025-2026', {
  x:0.5, y:6.55, w:7.0, h:0.45,
  fontSize:12, color:C.white, fontFace:'Calibri'
});
s1.addText('Mayo 2026', {
  x:8.1, y:6.55, w:1.6, h:0.45,
  fontSize:12, color:C.accentLight, fontFace:'Calibri', align:'right'
});

// ═══════════════════════════════════════════════════════════════════════════════
//  SLIDE 2 — ÍNDICE
// ═══════════════════════════════════════════════════════════════════════════════
const s2 = pptx.addSlide();
s2.addShape(pptx.ShapeType.rect, { x:0, y:0, w:'100%', h:'100%', fill:{color:C.offwhite} });
s2.addShape(pptx.ShapeType.rect, { x:0, y:0, w:'100%', h:1.35, fill:{color:C.navy} });
s2.addShape(pptx.ShapeType.rect, { x:0, y:1.35, w:'100%', h:0.07, fill:{color:C.accent} });
s2.addText('INDICE', { x:0.4, y:0.35, w:9, h:0.65, fontSize:32, color:C.white, bold:true, fontFace:'Calibri' });

const indexItems = [
  { n:'01', t:'Motivacion',          d:'Por que elegí el smartphone como producto de analisis' },
  { n:'02', t:'Fase 1: Introduccion', d:'Lanzamiento del iPhone — 2007-2009' },
  { n:'03', t:'Fase 2: Crecimiento',  d:'Explosion del mercado global — 2010-2013' },
  { n:'04', t:'Fase 3: Madurez',      d:'Saturacion y competencia — 2014-2020' },
  { n:'05', t:'Fase 4: Declive',      d:'Caida de ventas y reinvencion — 2021-hoy' },
  { n:'06', t:'Conclusion',           d:'Reflexiones finales sobre el ciclo de vida' },
];

indexItems.forEach((item, i) => {
  const col = i < 3 ? 0 : 1;
  const row = i % 3;
  const x  = col === 0 ? 0.5 : 5.2;
  const y  = 1.65 + row * 1.88;

  s2.addShape(pptx.ShapeType.ellipse, { x, y, w:0.6, h:0.6, fill:{color:C.accent} });
  s2.addText(item.n, { x, y, w:0.6, h:0.6, fontSize:13, color:C.white, bold:true, align:'center', valign:'middle', fontFace:'Calibri' });
  s2.addText(item.t, { x:x+0.75, y:y+0.02, w:3.8, h:0.34, fontSize:14, color:C.navy, bold:true, fontFace:'Calibri' });
  s2.addText(item.d, { x:x+0.75, y:y+0.35, w:3.8, h:0.28, fontSize:11, color:C.mid, fontFace:'Calibri' });
  if (row < 2) {
    s2.addShape(pptx.ShapeType.rect, { x, y:y+0.75, w:4.3, h:0.01, fill:{color:'CCCCCC'} });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
//  SLIDE 3 — MOTIVACION
// ═══════════════════════════════════════════════════════════════════════════════
const s3 = headerSlide('MOTIVACION — Por que el smartphone?');
s3.addText('El smartphone es el producto tecnologico que mas utilizamos a diario. Su ciclo de vida abarca apenas dos decadas pero contiene todas las fases del modelo clasico de forma nitida y documentada.', {
  x:0.4, y:1.55, w:9.2, h:0.75,
  fontSize:13, color:C.darkGray, fontFace:'Calibri', italic:true
});

const statBoxes = [
  { val:'6.800 M', label:'usuarios activos en el mundo (2024)' },
  { val:'5,4 h',   label:'de uso diario promedio por persona' },
  { val:'+2.000 M',label:'de unidades en su punto algido anual' },
];
statBoxes.forEach((s, i) => {
  const x = 0.4 + i * 3.2;
  s3.addShape(pptx.ShapeType.rect, { x, y:2.45, w:3.0, h:1.5, fill:{color:C.navy} });
  s3.addShape(pptx.ShapeType.rect, { x, y:2.45, w:3.0, h:0.07, fill:{color:C.accent} });
  s3.addText(s.val,   { x, y:2.57, w:3.0, h:0.7,  fontSize:23, color:C.accentLight, bold:true, align:'center', fontFace:'Calibri' });
  s3.addText(s.label, { x, y:3.25, w:3.0, h:0.55, fontSize:10, color:'AACCEE', align:'center', fontFace:'Calibri' });
});

s3.addText('Razones para elegirlo:', {
  x:0.4, y:4.15, w:9, h:0.35,
  fontSize:14, color:C.blue, bold:true, fontFace:'Calibri'
});
const reasons = [
  'Es el dispositivo que mas utilizo: comunicacion, estudios, trabajo y entretenimiento estan en mi smartphone.',
  'Su ciclo de vida cubre todas las fases clasicas con datos reales y contrastados, facilitando el analisis.',
  'Permite estudiar factores economicos, sociales, tecnologicos y medioambientales de forma integrada.',
  'Refleja perfectamente como la innovacion puede crear, transformar y eventualmente saturar un mercado global.',
];
reasons.forEach((r, i) => {
  s3.addShape(pptx.ShapeType.rect, { x:0.4, y:4.62+i*0.55, w:0.08, h:0.38, fill:{color:C.accent} });
  s3.addText(r, { x:0.65, y:4.62+i*0.55, w:9.0, h:0.48, fontSize:12, color:C.darkGray, fontFace:'Calibri' });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  SLIDE 4 — CICLO DE VIDA — VISION GENERAL
// ═══════════════════════════════════════════════════════════════════════════════
const s4 = headerSlide('ANALISIS DEL CICLO DE VIDA — Vision general');
s4.addText('El modelo del ciclo de vida de un producto describe las etapas por las que pasa desde su lanzamiento hasta su declive o reinvencion. El smartphone recorre estas 4 fases de forma nítida.', {
  x:0.4, y:1.55, w:9.2, h:0.6,
  fontSize:12.5, color:C.mid, fontFace:'Calibri', italic:true
});

s4.addChart(pptx.ChartType.line, [{
  name: 'Ventas (indice)',
  labels: ['2007','2008','2009','2010','2011','2012','2013','2014','2016','2018','2020','2022','2024'],
  values: [2, 5, 12, 25, 47, 72, 100, 110, 115, 112, 100, 82, 65],
}], {
  x:0.3, y:2.2, w:5.6, h:4.0,
  chartColors: [C.lightBlue],
  lineDataSymbol: 'none',
  showLegend: false,
  showTitle: false,
  showValue: false,
  lineSize: 3,
  valAxisHidden: true,
  catAxisLabelFontSize: 9,
  catAxisLabelColor: C.navy,
});

const phases4 = [
  { n:'1', name:'INTRODUCCION', years:'2007 - 2009', color:C.lightBlue },
  { n:'2', name:'CRECIMIENTO',  years:'2010 - 2013', color:C.green },
  { n:'3', name:'MADUREZ',      years:'2014 - 2020', color:C.orange },
  { n:'4', name:'DECLIVE',      years:'2021 - hoy',  color:C.red },
];
phases4.forEach((p, i) => {
  const y = 2.3 + i * 0.97;
  s4.addShape(pptx.ShapeType.rect, { x:6.3, y, w:0.5, h:0.72, fill:{color:p.color} });
  s4.addText(p.n, { x:6.3, y, w:0.5, h:0.72, fontSize:15, color:C.white, bold:true, align:'center', valign:'middle', fontFace:'Calibri' });
  s4.addText(p.name,  { x:6.95, y:y+0.03, w:2.8, h:0.33, fontSize:13, color:p.color, bold:true, fontFace:'Calibri' });
  s4.addText(p.years, { x:6.95, y:y+0.36, w:2.8, h:0.28, fontSize:11, color:C.mid, fontFace:'Calibri' });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  SLIDE 5 — FASE 1: INTRODUCCION
// ═══════════════════════════════════════════════════════════════════════════════
const s5 = pptx.addSlide();
s5.addShape(pptx.ShapeType.rect, { x:0, y:0, w:'100%', h:'100%', fill:{color:C.offwhite} });
s5.addShape(pptx.ShapeType.rect, { x:0, y:0, w:'100%', h:1.35, fill:{color:C.lightBlue} });
s5.addShape(pptx.ShapeType.rect, { x:0, y:1.35, w:'100%', h:0.07, fill:{color:C.accent} });
phaseBadge(s5, 'FASE 1');
s5.addText('INTRODUCCION  (2007 - 2009)', { x:0.4, y:0.38, w:7.2, h:0.65, fontSize:26, color:C.white, bold:true, fontFace:'Calibri' });

const introCards = [
  { t:'Lanzamiento revolucionario',     b:'En enero de 2007, Steve Jobs presenta el primer iPhone. Pantalla tactil completa, sin teclado fisico, internet real en el bolsillo. El mundo movil cambia para siempre.' },
  { t:'Precio elevado — nicho inicial', b:'El iPhone cuesta 499-599 dolares. Solo 1,4 millones de unidades en 2007. Los "early adopters" son el unico publico. Los margenes altos compensan la baja escala.' },
  { t:'Alta inversion en I+D',          b:'Apple invierte cientos de millones en desarrollo. Nokia y BlackBerry no reconocen la amenaza. En 2008 abre el App Store: nace un ecosistema completamente nuevo.' },
  { t:'Competencia practicamente nula', b:'Android se lanza en 2008 pero es muy basico. RIM y Nokia dominan el mercado pero con modelos obsoletos. Apple disfruta de un monopolio temporal de innovacion.' },
];
introCards.forEach((card, i) => {
  const col = i % 2;
  const row = Math.floor(i / 2);
  const x = col === 0 ? 0.3 : 5.1;
  const y = 1.6 + row * 2.65;
  s5.addShape(pptx.ShapeType.rect, { x, y, w:4.5, h:2.35, fill:{color:C.white}, line:{color:C.lightBlue, pt:1.5} });
  s5.addShape(pptx.ShapeType.rect, { x, y, w:4.5, h:0.07, fill:{color:C.lightBlue} });
  s5.addText(card.t, { x:x+0.15, y:y+0.15, w:4.2, h:0.38, fontSize:12.5, color:C.lightBlue, bold:true, fontFace:'Calibri' });
  s5.addText(card.b, { x:x+0.15, y:y+0.55, w:4.2, h:1.65, fontSize:11, color:C.darkGray, fontFace:'Calibri', wrap:true });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  SLIDE 6 — FASE 2: CRECIMIENTO
// ═══════════════════════════════════════════════════════════════════════════════
const s6 = pptx.addSlide();
s6.addShape(pptx.ShapeType.rect, { x:0, y:0, w:'100%', h:'100%', fill:{color:C.offwhite} });
s6.addShape(pptx.ShapeType.rect, { x:0, y:0, w:'100%', h:1.35, fill:{color:C.green} });
s6.addShape(pptx.ShapeType.rect, { x:0, y:1.35, w:'100%', h:0.07, fill:{color:C.accent} });
phaseBadge(s6, 'FASE 2');
s6.addText('CRECIMIENTO  (2010 - 2013)', { x:0.4, y:0.38, w:7.2, h:0.65, fontSize:26, color:C.white, bold:true, fontFace:'Calibri' });

s6.addChart(pptx.ChartType.bar, [{
  name: 'Smartphones vendidos (millones)',
  labels: ['2007','2008','2009','2010','2011','2012','2013'],
  values: [122, 151, 172, 296, 472, 680, 1010],
}], {
  x:0.3, y:1.6, w:5.4, h:4.1,
  chartColors: [C.green],
  showLegend: false,
  showTitle: false,
  showValue: true,
  barDir: 'col',
  dataLabelFontSize: 9,
  dataLabelColor: C.darkGray,
  catAxisLabelFontSize: 10,
  valAxisHidden: true,
});

const growthFacts = [
  'Ventas pasan de 122M (2007) a 1.010M (2013): x8 en 6 anos',
  'Android supera a iOS en cuota de mercado global en 2011',
  'Los App Stores crean un nuevo ecosistema digital de valor',
  'Los beneficios superan las inversiones iniciales en I+D',
  'Samsung se convierte en el mayor fabricante del mundo',
  'El smartphone sustituye a camara, GPS, MP3 y agenda',
  'Operadoras subvencionan moviles para captar contratos',
];
growthFacts.forEach((f, i) => {
  s6.addShape(pptx.ShapeType.ellipse, { x:6.05, y:1.72+i*0.57, w:0.18, h:0.18, fill:{color:C.green} });
  s6.addText(f, { x:6.3, y:1.67+i*0.57, w:3.5, h:0.5, fontSize:10.5, color:C.darkGray, fontFace:'Calibri' });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  SLIDE 7 — FASE 3: MADUREZ
// ═══════════════════════════════════════════════════════════════════════════════
const s7 = pptx.addSlide();
s7.addShape(pptx.ShapeType.rect, { x:0, y:0, w:'100%', h:'100%', fill:{color:C.offwhite} });
s7.addShape(pptx.ShapeType.rect, { x:0, y:0, w:'100%', h:1.35, fill:{color:C.orange} });
s7.addShape(pptx.ShapeType.rect, { x:0, y:1.35, w:'100%', h:0.07, fill:{color:C.accent} });
phaseBadge(s7, 'FASE 3');
s7.addText('MADUREZ  (2014 - 2020)', { x:0.4, y:0.38, w:7.2, h:0.65, fontSize:26, color:C.white, bold:true, fontFace:'Calibri' });

s7.addText('El mercado alcanza su techo: 1.500 millones de unidades en 2016. El crecimiento se estanca y comienza la guerra de precios entre fabricantes.', {
  x:0.4, y:1.55, w:9.2, h:0.55,
  fontSize:12.5, color:C.mid, fontFace:'Calibri', italic:true
});

const maturityItems = [
  { t:'Saturacion del mercado',    b:'Casi toda la poblacion con poder adquisitivo ya tiene smartphone. En mercados desarrollados el crecimiento viene solo de reemplazos cada 2-3 anos.' },
  { t:'Guerra de precios y marcas',b:'Samsung, Huawei, Xiaomi y OPPO lanzan gamas muy competitivas. Apple se refugia en el segmento premium con margenes altisimos.' },
  { t:'Innovacion incremental',    b:'Las mejoras dejan de ser revolucionarias: mejor camara, mas bateria, pantallas OLED. Los ciclos de renovacion se alargan de 2 a 3 anos.' },
  { t:'Impacto medioambiental',    b:'La UE aprueba leyes de reparabilidad y cargador universal. El residuo electronico preocupa. Apple y Samsung lanzan programas de reciclaje.' },
  { t:'Diversificacion de gamas',  b:'Apple lanza iPhone SE. Samsung divide su catalogo en S, A y M series. Cada marca intenta cubrir todos los segmentos de precio.' },
  { t:'Rentabilidad maxima',       b:'Los costes de produccion caen por las economias de escala. Fabricar un smartphone de gama media cuesta menos de 80 euros.' },
];
maturityItems.forEach((item, i) => {
  const col = i % 2;
  const row = Math.floor(i / 2);
  const x = col === 0 ? 0.3 : 5.1;
  const y = 2.25 + row * 1.65;
  s7.addShape(pptx.ShapeType.rect, { x, y, w:4.5, h:1.45, fill:{color: row%2===0 ? 'FFF5E6' : C.white}, line:{color:'E8890A', pt:1} });
  s7.addText(item.t, { x:x+0.12, y:y+0.1,  w:4.25, h:0.33, fontSize:12, color:C.orange, bold:true, fontFace:'Calibri' });
  s7.addText(item.b, { x:x+0.12, y:y+0.43, w:4.25, h:0.92, fontSize:10.5, color:C.darkGray, fontFace:'Calibri', wrap:true });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  SLIDE 8 — FASE 4: DECLIVE
// ═══════════════════════════════════════════════════════════════════════════════
const s8 = pptx.addSlide();
s8.addShape(pptx.ShapeType.rect, { x:0, y:0, w:'100%', h:'100%', fill:{color:C.offwhite} });
s8.addShape(pptx.ShapeType.rect, { x:0, y:0, w:'100%', h:1.35, fill:{color:C.red} });
s8.addShape(pptx.ShapeType.rect, { x:0, y:1.35, w:'100%', h:0.07, fill:{color:C.accent} });
phaseBadge(s8, 'FASE 4');
s8.addText('DECLIVE  (2021 — actualidad)', { x:0.4, y:0.38, w:7.2, h:0.65, fontSize:26, color:C.white, bold:true, fontFace:'Calibri' });

s8.addText('Las ventas globales caen por primera vez en 2022 (-11,3%). El mercado busca reinventarse con IA integrada, formatos plegables y mayor sostenibilidad.', {
  x:0.4, y:1.55, w:9.2, h:0.55,
  fontSize:12.5, color:C.mid, fontFace:'Calibri', italic:true
});

s8.addChart(pptx.ChartType.bar, [{
  name: 'Variacion ventas (%)',
  labels: ['2019','2020','2021','2022','2023'],
  values: [0, -6, 6, -11, -4],
}], {
  x:0.3, y:2.2, w:4.8, h:3.5,
  chartColors: [C.red],
  showLegend: false,
  showTitle: false,
  showValue: true,
  barDir: 'col',
  dataLabelFontSize: 10,
  dataLabelColor: C.darkGray,
  catAxisLabelFontSize: 10,
  valAxisHidden: false,
  valAxisMinVal: -15,
  valAxisMaxVal: 10,
});

const declinePts = [
  { t:'Caida historica de ventas', b:'En 2022 las ventas caen un 11,3%: la mayor caida de la historia del sector. Los ciclos de reposicion se alargan de 2 a 3-4 anos.' },
  { t:'IA generativa integrada',   b:'Los fabricantes integran IA (Copilot, Gemini, Apple Intelligence) para justificar la renovacion del dispositivo y relanzar el interes.' },
  { t:'Smartphones plegables',     b:'Samsung Galaxy Z Fold/Flip y Motorola Razr intentan crear un factor de forma nuevo que reactive el mercado premium con una experiencia diferente.' },
  { t:'Sostenibilidad regulada',   b:'La UE exige baterias reemplazables y mayor vida util. El residuo electronico preocupa. Nace el derecho a reparar como exigencia legal.' },
];
declinePts.forEach((p, i) => {
  const y = 2.25 + i * 1.3;
  s8.addShape(pptx.ShapeType.rect, { x:5.5, y, w:4.15, h:1.1, fill:{color: i%2===0 ? 'FFF0F0' : C.white}, line:{color:'C0222A', pt:1} });
  s8.addText(p.t, { x:5.62, y:y+0.08, w:3.9, h:0.32, fontSize:12, color:C.red, bold:true, fontFace:'Calibri' });
  s8.addText(p.b, { x:5.62, y:y+0.4,  w:3.9, h:0.62, fontSize:10, color:C.darkGray, fontFace:'Calibri', wrap:true });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  SLIDE 9 — CONCLUSION
// ═══════════════════════════════════════════════════════════════════════════════
const s9 = pptx.addSlide();
s9.addShape(pptx.ShapeType.rect, { x:0, y:0, w:'100%', h:'100%', fill:{color:C.navy} });
s9.addShape(pptx.ShapeType.rect, { x:0, y:0,    w:'100%', h:0.07, fill:{color:C.accent} });
s9.addShape(pptx.ShapeType.rect, { x:0, y:7.43, w:'100%', h:0.07, fill:{color:C.accent} });

s9.addText('CONCLUSION', {
  x:0.4, y:0.2, w:9.0, h:1.0,
  fontSize:42, color:C.white, bold:true, fontFace:'Calibri'
});
s9.addShape(pptx.ShapeType.rect, { x:0.4, y:1.18, w:9.2, h:0.06, fill:{color:C.accent} });

const conclusions = [
  'El smartphone es el producto que mejor representa el ciclo de vida clasico: en apenas 17 anos ha pasado por todas sus fases con datos nítidos y contrastados.',
  'La fase de introduccion demostro que la innovacion disruptiva puede crear mercados de la nada. La apuesta de Apple con un movil sin teclado fue considerada un fracaso por sus competidores.',
  'El crecimiento exponencial de 2010-2013 ilustra como un producto puede escalar globalmente cuando responde a necesidades reales. La competencia de Android acelero este proceso.',
  'La madurez obligo a las empresas a buscar diferenciacion: los servicios, los ecosistemas y la experiencia de usuario se convirtieron en los nuevos campos de batalla del sector.',
  'El declive no implica desaparicion: la IA integrada, los formatos plegables y la sostenibilidad son las apuestas para extender o reiniciar el ciclo de vida del producto.',
  'Comprender el ciclo de vida es fundamental para anticipar decisiones de inversion, marketing y produccion. El que no se reinventa desaparece; el que lo hace puede sobrevivir indefinidamente.',
];
conclusions.forEach((c, i) => {
  s9.addShape(pptx.ShapeType.ellipse, { x:0.4, y:1.38+i*0.97, w:0.42, h:0.42, fill:{color:C.accent} });
  s9.addText(String(i+1), {
    x:0.4, y:1.38+i*0.97, w:0.42, h:0.42,
    fontSize:13, color:C.white, bold:true, align:'center', valign:'middle', fontFace:'Calibri'
  });
  s9.addText(c, {
    x:1.0, y:1.4+i*0.97, w:8.65, h:0.82,
    fontSize:11, color:'C8DCF0', fontFace:'Calibri', wrap:true
  });
});

s9.addText('Economia de la Empresa  |  2.o DAW  |  Curso 2025-2026', {
  x:0.4, y:7.12, w:9.2, h:0.3,
  fontSize:9.5, color:'446688', fontFace:'Calibri', align:'center'
});

// ─── GUARDAR ──────────────────────────────────────────────────────────────────
const outPath = 'D:/Escritorio/xampp/htdocs/https-github.com-antonio-valero-daw2personal/1ero/soste/Ciclo_de_Vida_Smartphone.pptx';
pptx.writeFile({ fileName: outPath })
  .then(() => { console.log('OK:' + outPath); })
  .catch(err => { console.error('ERROR:', err); process.exit(1); });
