// ================================================================
//  Ciclo de Vida del Smartphone  —  Presentacion v2
//  Canvas: 10" x 7.5"  (LAYOUT_16x9)
//  Safe content area:  x 0.35-9.65  |  y 1.50-7.15
// ================================================================
const PptxGenJS = require("pptxgenjs");
const pptx = new PptxGenJS();
pptx.layout = "LAYOUT_16x9";
pptx.title  = "Ciclo de Vida del Smartphone";

const C = {
  navy:"0D1B2A", blue:"1B4F72", lb:"2E86AB",
  acc:"E8890A",  accL:"F9C74F",
  white:"FFFFFF", off:"F5F8FC", dark:"1A1A1A", mid:"555555", gray:"888888",
  green:"1A6B38", greenL:"EBF7EF",
  orange:"8B3A00", orangeL:"FFF3E0",
  red:"B01E26",   redL:"FDECEC",
  blueL:"E8F4FB",
};

function bgSlide(bgColor){
  const s = pptx.addSlide();
  s.addShape(pptx.ShapeType.rect,{x:0,y:0,w:10,h:7.5,fill:{color:bgColor||C.off}});
  return s;
}
function addHeader(s,title,hColor){
  s.addShape(pptx.ShapeType.rect,{x:0,y:0,w:10,h:1.28,fill:{color:hColor||C.navy}});
  s.addShape(pptx.ShapeType.rect,{x:0,y:1.28,w:10,h:0.07,fill:{color:C.acc}});
  s.addText(title,{x:0.38,y:0.27,w:9.0,h:0.76,fontSize:24,color:C.white,bold:true,fontFace:"Calibri",wrap:true,valign:"middle"});
}
function hdrSlide(title,hColor){
  const s=bgSlide(); addHeader(s,title,hColor); return s;
}
function phaseBadge(s,label,bColor){
  s.addShape(pptx.ShapeType.rect,{x:7.98,y:0.23,w:1.62,h:0.82,fill:{color:bColor||C.acc}});
  s.addText(label,{x:7.98,y:0.23,w:1.62,h:0.82,fontSize:14,color:C.white,bold:true,align:"center",valign:"middle",fontFace:"Calibri"});
}
function card(s,x,y,w,h,title,body,bc,bg){
  s.addShape(pptx.ShapeType.rect,{x,y,w,h,fill:{color:bg||C.white},line:{color:bc||C.navy,pt:1}});
  s.addShape(pptx.ShapeType.rect,{x,y,w,h:0.055,fill:{color:bc||C.navy}});
  s.addText(title,{x:x+0.12,y:y+0.1, w:w-0.24,h:0.32,fontSize:11.5,color:bc||C.navy,bold:true,fontFace:"Calibri",wrap:true});
  s.addText(body, {x:x+0.12,y:y+0.45,w:w-0.24,h:h-0.6, fontSize:10.5,color:C.dark,fontFace:"Calibri",wrap:true,valign:"top"});
}
function bullet(s,x,y,w,text,dc){
  s.addShape(pptx.ShapeType.ellipse,{x,y:y+0.07,w:0.14,h:0.14,fill:{color:dc||C.acc}});
  s.addText(text,{x:x+0.22,y,w:w-0.22,h:0.44,fontSize:11,color:C.dark,fontFace:"Calibri",wrap:true,valign:"top"});
}

// ================================================================
//  SLIDE 1 — PORTADA
// ================================================================
const s1=bgSlide(C.navy);
s1.addShape(pptx.ShapeType.rect,{x:0,y:0,w:0.42,h:7.5,fill:{color:C.acc}});
s1.addShape(pptx.ShapeType.rect,{x:6.75,y:0,w:3.25,h:7.5,fill:{color:C.blue,transparency:58}});
s1.addShape(pptx.ShapeType.rect,{x:0.65,y:3.4,w:5.85,h:0.06,fill:{color:C.acc}});
s1.addText("ANALISIS DEL CICLO DE VIDA",{
  x:0.65,y:1.25,w:5.85,h:0.44,fontSize:11.5,color:C.accL,fontFace:"Calibri",charSpacing:3,wrap:true});
s1.addText("SMARTPHONE",{
  x:0.65,y:1.65,w:6.0,h:1.55,fontSize:56,color:C.white,bold:true,fontFace:"Calibri",wrap:true});
s1.addText("Del primer iPhone a la era de la IA movil.\nUn producto, cuatro fases, dos decadas de historia.",{
  x:0.65,y:3.5,w:5.85,h:0.88,fontSize:12.5,color:"A8C0D6",fontFace:"Calibri",wrap:true});
[["2E86AB","Intro"],["1A6B38","Crece"],["E8890A","Maduro"],["B01E26","Declive"]].forEach(([col,lbl],i)=>{
  s1.addShape(pptx.ShapeType.ellipse,{x:0.65+i*0.72,y:4.6,w:0.52,h:0.52,fill:{color:col}});
  s1.addText(lbl,{x:0.65+i*0.72,y:4.6,w:0.52,h:0.52,fontSize:7,color:C.white,bold:true,align:"center",valign:"middle",fontFace:"Calibri"});
});
s1.addShape(pptx.ShapeType.rect,{x:0,y:6.28,w:10,h:1.22,fill:{color:C.blue}});
s1.addText("Economia de la Empresa   |   2 DAW   |   Curso 2025-2026",{
  x:0.5,y:6.53,w:7.2,h:0.44,fontSize:11.5,color:C.white,fontFace:"Calibri",wrap:true});
s1.addText("Mayo 2026",{
  x:8.1,y:6.53,w:1.5,h:0.44,fontSize:11.5,color:C.accL,fontFace:"Calibri",align:"right",wrap:true});

// ================================================================
//  SLIDE 2 — INDICE
// ================================================================
const s2=hdrSlide("INDICE DE CONTENIDOS");
const IDX=[
  ["01","Motivacion",        "Por que elegi el smartphone como producto de analisis"],
  ["02","Ciclo de vida",     "Modelo teorico y vision general con curva de ventas"],
  ["03","Fase 1: Introduccion","Lanzamiento del iPhone y primeros anos (2007-2009)"],
  ["04","Fase 2: Crecimiento","Explosion del mercado global (2010-2013)"],
  ["05","Fase 3: Madurez",   "Saturacion, precio y competencia (2014-2020)"],
  ["06","Fase 4: Declive",   "Caida de ventas y estrategias de reinvencion (2021-hoy)"],
  ["07","Datos economicos",  "Cuota de mercado, ingresos y comparativa de fabricantes"],
  ["08","Conclusion",        "Reflexiones finales y lecciones del ciclo de vida"],
];
// 2 columns x 4 rows. Row height = (7.15-1.50)/4 = 1.4125" each
const RH=1.39;
IDX.forEach(([n,t,d],i)=>{
  const col=i<4?0:1, row=i%4;
  const ix=col===0?0.35:5.22, iy=1.5+row*RH;
  s2.addShape(pptx.ShapeType.ellipse,{x:ix,y:iy+0.14,w:0.54,h:0.54,fill:{color:C.acc}});
  s2.addText(n,{x:ix,y:iy+0.14,w:0.54,h:0.54,fontSize:12,color:C.white,bold:true,align:"center",valign:"middle",fontFace:"Calibri"});
  s2.addText(t,{x:ix+0.66,y:iy+0.11,w:4.14,h:0.34,fontSize:13,color:C.navy,bold:true,fontFace:"Calibri",wrap:true});
  s2.addText(d,{x:ix+0.66,y:iy+0.48,w:4.14,h:0.36,fontSize:10.5,color:C.mid,fontFace:"Calibri",wrap:true});
  if(row<3) s2.addShape(pptx.ShapeType.rect,{x:ix,y:iy+RH-0.07,w:4.6,h:0.02,fill:{color:"DDDDDD"}});
});

// ================================================================
//  SLIDE 3 — MOTIVACION
// ================================================================
const s3=hdrSlide("MOTIVACION  Por que el smartphone?");
s3.addText("El smartphone es el producto tecnologico que mas utilizamos a diario. En apenas 17 anos ha recorrido todas las fases del modelo clasico del ciclo de vida con datos reales y contrastados.",{
  x:0.38,y:1.5,w:9.25,h:0.62,fontSize:12,color:C.mid,fontFace:"Calibri",italic:true,wrap:true});

[
  {v:"6.800 M",  l:"usuarios activos en el mundo (2024)",  c:C.lb},
  {v:"5,4 h/dia",l:"de uso medio diario por persona en Espana", c:C.green},
  {v:"1.600 M",  l:"unidades en el pico maximo de ventas anuales", c:C.orange},
].forEach((st,i)=>{
  const sx=0.38+i*3.15;
  s3.addShape(pptx.ShapeType.rect,{x:sx,y:2.28,w:2.98,h:1.45,fill:{color:C.navy}});
  s3.addShape(pptx.ShapeType.rect,{x:sx,y:2.28,w:2.98,h:0.06,fill:{color:st.c}});
  s3.addText(st.v,{x:sx,y:2.38,w:2.98,h:0.65,fontSize:22,color:C.accL,bold:true,align:"center",fontFace:"Calibri",wrap:true});
  s3.addText(st.l,{x:sx,y:3.03,w:2.98,h:0.58,fontSize:10,color:"AACCEE",align:"center",fontFace:"Calibri",wrap:true,valign:"top"});
});

s3.addShape(pptx.ShapeType.rect,{x:0.38,y:3.87,w:9.25,h:0.04,fill:{color:"CCCCCC"}});
s3.addText("Por que lo elegi:",{x:0.38,y:3.98,w:9.0,h:0.38,fontSize:14,color:C.blue,bold:true,fontFace:"Calibri",wrap:true});
[
  "Es el dispositivo que mas utilizo a diario: comunicacion, estudios, trabajo y entretenimiento estan en mi smartphone.",
  "Su ciclo de vida cubre todas las fases clasicas con datos reales y contrastados, lo que facilita un analisis empirico riguroso.",
  "Permite estudiar factores economicos, sociales, tecnologicos y medioambientales de forma integrada y coherente.",
  "La abundancia de datos publicos (IDC, Gartner, Statista) permite fundamentar cada fase con evidencia solida y actualizada.",
  "Refleja como la innovacion disruptiva puede crear, transformar y saturar un mercado global en tiempo record.",
].forEach((r,i)=>bullet(s3,0.38,4.45+i*0.51,9.25,r,C.acc));

// ================================================================
//  SLIDE 4 — VISION GENERAL
// ================================================================
const s4=hdrSlide("ANALISIS DEL CICLO DE VIDA  Vision general");
s4.addText("El modelo del ciclo de vida describe las etapas por las que pasa un producto desde su lanzamiento hasta su declive. El smartphone es un ejemplo canonico y perfectamente documentado de este modelo.",{
  x:0.38,y:1.5,w:9.25,h:0.58,fontSize:11.5,color:C.mid,fontFace:"Calibri",italic:true,wrap:true});

s4.addChart(pptx.ChartType.line,[{
  name:"Ventas (indice 100=2013)",
  labels:["07","08","09","10","11","12","13","14","15","16","17","18","19","20","21","22","23","24"],
  values:[2,5,11,24,45,70,100,108,113,117,115,112,107,100,105,93,88,82],
}],{
  x:0.35,y:2.14,w:5.85,h:4.88,
  chartColors:[C.lb],
  lineDataSymbol:"none",lineSize:3,
  showLegend:false,showTitle:false,showValue:false,
  valAxisHidden:true,
  catAxisLabelFontSize:8,catAxisLabelColor:C.navy,
});

[[1,"INTRODUCCION","2007-2009",C.lb,  C.blueL ],
 [2,"CRECIMIENTO", "2010-2013",C.green,C.greenL],
 [3,"MADUREZ",     "2014-2020",C.orange,C.orangeL],
 [4,"DECLIVE",     "2021-hoy", C.red,  C.redL  ]
].forEach(([n,t,y,c,bg],i)=>{
  const py=2.14+i*1.22;
  s4.addShape(pptx.ShapeType.rect,{x:6.45,y:py,w:3.2,h:1.12,fill:{color:bg},line:{color:c,pt:1.5}});
  s4.addShape(pptx.ShapeType.rect,{x:6.45,y:py,w:0.48,h:1.12,fill:{color:c}});
  s4.addText(String(n),{x:6.45,y:py,w:0.48,h:1.12,fontSize:18,color:C.white,bold:true,align:"center",valign:"middle",fontFace:"Calibri"});
  s4.addText(t,{x:7.0,y:py+0.18,w:2.5,h:0.36,fontSize:14,color:c,bold:true,fontFace:"Calibri",wrap:true});
  s4.addText(y,{x:7.0,y:py+0.57,w:2.5,h:0.36,fontSize:12,color:C.mid,fontFace:"Calibri",wrap:true});
});

// ================================================================
//  SLIDE 5 — FASE 1: INTRODUCCION
// ================================================================
const s5=bgSlide(); addHeader(s5,"FASE 1: INTRODUCCION (2007-2009)",C.lb); phaseBadge(s5,"FASE 1",C.lb);
s5.addText("En enero de 2007, Steve Jobs presenta el primer iPhone. Pantalla tactil completa, sin teclado fisico, internet real en el bolsillo. El sector de la telefonia movil cambia para siempre.",{
  x:0.38,y:1.5,w:9.25,h:0.58,fontSize:11.5,color:C.mid,fontFace:"Calibri",italic:true,wrap:true});
// 4 cards: 2 cols x 2 rows. cardH=(7.15-2.15-0.12)/2=2.44
const cH5=2.38, cW5=4.55;
[
  ["Lanzamiento revolucionario",
   "El iPhone 1 integra telefono, iPod e internet en un solo dispositivo. Pantalla 3,5 pulgadas, acelerometro, Wi-Fi y detector de movimiento. Sin botones fisicos. Nokia y BlackBerry lo consideran imposible hasta que lo ven funcionando."],
  ["Precio elevado y nicho inicial",
   "El dispositivo cuesta 499-599 dolares. Solo 1,4 millones de unidades vendidas en 2007. Los margenes altos financian la I+D. Los competidores no perciben la amenaza hasta que es demasiado tarde para responder."],
  ["App Store y ecosistema",
   "En 2008 Apple lanza el App Store con mas de 500 apps el primer dia. Nace el ecosistema de desarrolladores que convierte al smartphone en plataforma. La tienda factura 1.000 millones de dolares en su primer ano completo."],
  ["Competencia casi nula",
   "Android (HTC Dream, 2008) es muy basico. RIM y Nokia lideran con hardware obsoleto. Apple disfruta de monopolio temporal de innovacion durante 18 meses y fija precios sin competencia real en el segmento tactil."],
].forEach(([t,b],i)=>{
  const col=i%2, row=Math.floor(i/2);
  card(s5, col===0?0.35:5.05, 2.15+row*(cH5+0.11), cW5, cH5, t, b, C.lb, C.blueL);
});

// ================================================================
//  SLIDE 6 — FASE 2: CRECIMIENTO
// ================================================================
const s6=bgSlide(); addHeader(s6,"FASE 2: CRECIMIENTO (2010-2013)",C.green); phaseBadge(s6,"FASE 2",C.green);
s6.addText("Las ventas se multiplican por ocho en seis anos: de 122 millones (2007) a mas de 1.000 millones (2013). Android supera a iOS en cuota global. La era del smartphone se democratiza a escala planetaria.",{
  x:0.38,y:1.5,w:9.25,h:0.58,fontSize:11.5,color:C.mid,fontFace:"Calibri",italic:true,wrap:true});
s6.addChart(pptx.ChartType.bar,[{
  name:"Smartphones vendidos (M)",
  labels:["2007","2008","2009","2010","2011","2012","2013"],
  values:[122,151,172,296,472,680,1010],
}],{
  x:0.35,y:2.14,w:5.35,h:4.88,
  chartColors:[C.green],
  showLegend:false,showTitle:false,showValue:true,barDir:"col",
  dataLabelFontSize:9,dataLabelColor:C.dark,
  catAxisLabelFontSize:10,valAxisHidden:true,
});
[
  "Android supera a iOS en cuota global en 2011 (53% vs 18%)",
  "Samsung se convierte en el mayor fabricante del mundo en 2012",
  "App Store y Play Store crean un nuevo mercado de miles de M$",
  "Las operadoras subvencionan moviles para captar contratos 2 anos",
  "El smartphone sustituye a camara, GPS, MP3 y agenda fisica",
  "China e India se convierten en los mayores mercados emergentes",
  "Huawei y LG irrumpen con gamas de precio mas accesibles",
  "En 2013 los smartphones superan en ventas anuales a los PC",
].forEach((f,i)=>bullet(s6,5.85,2.2+i*0.6,3.8,f,C.green));

// ================================================================
//  SLIDE 7 — FASE 3: MADUREZ
// ================================================================
const s7=bgSlide(); addHeader(s7,"FASE 3: MADUREZ (2014-2020)",C.orange); phaseBadge(s7,"FASE 3",C.orange);
s7.addText("El mercado alcanza su techo: 1.550 millones de unidades en 2016. El crecimiento se estanca y comienza la guerra de precios. Las mejoras son incrementales; los ciclos de renovacion se alargan.",{
  x:0.38,y:1.5,w:9.25,h:0.58,fontSize:11.5,color:C.mid,fontFace:"Calibri",italic:true,wrap:true});
// 6 cards in 2x3. cardH=1.58, gap=0.09. 3 rows: 3*(1.58+0.09)=5.01, start y=2.14 -> ends 7.15 ✓
const cH7=1.55, cW7=4.55;
[
  ["Saturacion del mercado",
   "El 85% de Europa usa smartphone en 2016. El crecimiento viene solo de reemplazos cada 2-3 anos. En mercados emergentes aun crece, pero a ritmo decreciente. El mercado maduro ya no escala."],
  ["Guerra de precios",
   "Xiaomi lanza moviles de alta calidad por 150 euros. OPPO y vivo conquistan Asia. Samsung crea las series A y M. Apple se refugia en el segmento premium con margenes superiores al 40%."],
  ["Innovacion incremental",
   "Las mejoras dejan de ser disruptivas: mejor camara, mas bateria, pantalla OLED y Face ID. Los ciclos de renovacion pasan de 2 a 3 anos. Aparece la 'fatiga de actualizaciones' entre usuarios."],
  ["Economias de escala",
   "Fabricar un smartphone de gama media cuesta menos de 70 euros. Los precios de pantallas OLED y chips caen drasticamente gracias al volumen. La rentabilidad por unidad aumenta."],
  ["Diversificacion de gamas",
   "Apple lanza iPhone SE (399$). Samsung divide su catalogo en S, A, M y XCover. Cada fabricante intenta cubrir todos los segmentos: ultra-low cost, medio, alto y premium exclusivo."],
  ["Presion medioambiental",
   "La UE aprueba la directiva WEEE sobre residuos electronicos. Apple y Samsung lanzan programas de reciclaje. La sostenibilidad entra en la agenda como exigencia legal y argumento de venta."],
].forEach(([t,b],i)=>{
  const col=i%2, row=Math.floor(i/2);
  card(s7, col===0?0.35:5.05, 2.14+row*(cH7+0.1), cW7, cH7, t, b, C.orange, C.orangeL);
});

// ================================================================
//  SLIDE 8 — FASE 4: DECLIVE
// ================================================================
const s8=bgSlide(); addHeader(s8,"FASE 4: DECLIVE Y REINVENCION (2021-hoy)",C.red); phaseBadge(s8,"FASE 4",C.red);
s8.addText("Las ventas globales caen un 11,3% en 2022: la mayor caida de la historia del sector. La industria apuesta por IA integrada, formatos plegables y sostenibilidad para relanzar el mercado.",{
  x:0.38,y:1.5,w:9.25,h:0.58,fontSize:11.5,color:C.mid,fontFace:"Calibri",italic:true,wrap:true});
s8.addChart(pptx.ChartType.bar,[{
  name:"Variacion anual ventas (%)",
  labels:["2018","2019","2020","2021","2022","2023","2024"],
  values:[-4,-1,-6,6,-11,-4,-3],
}],{
  x:0.35,y:2.14,w:4.75,h:4.88,
  chartColors:[C.red],
  showLegend:false,showTitle:false,showValue:true,barDir:"col",
  dataLabelFontSize:9,dataLabelColor:C.dark,
  catAxisLabelFontSize:10,
  valAxisMinVal:-15,valAxisMaxVal:12,
});
// 4 fact boxes on the right. Each h=1.17, gap=0.07. 4*1.24=4.96, start 2.14 -> ends 7.1 ✓
[
  ["Caida historica de ventas",
   "2022: -11,3%. Los ciclos de reposicion se alargan a 3-4 anos. El stock acumulado de 2021 no se absorbe. La crisis de semiconductores eleva los precios y frena la demanda al mismo tiempo."],
  ["IA generativa en el dispositivo",
   "Samsung Galaxy S24 y Apple Intelligence (iPhone 16) integran IA on-device. Modelos de lenguaje locales, edicion fotografica con IA y asistentes conversacionales son el nuevo argumento de venta."],
  ["Formatos plegables",
   "Galaxy Z Fold6, Motorola Razr+ y OnePlus Open crean un nuevo factor de forma. Precio superior a 1.500 euros. Crecen un 64% en 2023 pero representan solo el 1,5% del mercado total."],
  ["Sostenibilidad y derecho a reparar",
   "La UE exige baterias reemplazables desde 2027 y 5 anos de actualizaciones. Apple, Samsung y Fairphone lanzan programas de reparacion oficial. La vida util media del movil sube a 4,5 anos."],
].forEach(([t,b],i)=>{
  const dy=2.14+i*1.24;
  s8.addShape(pptx.ShapeType.rect,{x:5.35,y:dy,w:4.28,h:1.17,fill:{color:i%2===0?C.redL:C.white},line:{color:C.red,pt:1}});
  s8.addShape(pptx.ShapeType.rect,{x:5.35,y:dy,w:4.28,h:0.055,fill:{color:C.red}});
  s8.addText(t,{x:5.47,y:dy+0.10,w:4.04,h:0.30,fontSize:11.5,color:C.red,bold:true,fontFace:"Calibri",wrap:true});
  s8.addText(b,{x:5.47,y:dy+0.44,w:4.04,h:0.67,fontSize:10,color:C.dark,fontFace:"Calibri",wrap:true,valign:"top"});
});

// ================================================================
//  SLIDE 9 — DATOS ECONOMICOS
// ================================================================
const s9=hdrSlide("DATOS ECONOMICOS Y CUOTA DE MERCADO (2024)");
s9.addText("El mercado global de smartphones mueve mas de 430.000 millones de dolares anuales. Samsung y Apple concentran casi el 40% del mercado y mas del 80% de los beneficios del sector.",{
  x:0.38,y:1.5,w:9.25,h:0.58,fontSize:11.5,color:C.mid,fontFace:"Calibri",italic:true,wrap:true});
s9.addChart(pptx.ChartType.pie,[{
  name:"Cuota de mercado 2024",
  labels:["Samsung","Apple","Xiaomi","OPPO","vivo","Otros"],
  values:[22,18,13,10,9,28],
}],{
  x:0.35,y:2.14,w:4.65,h:4.65,
  chartColors:["1B4F72","222222","E74C3C","27AE60","8E44AD","AAAAAA"],
  showLegend:true,legendFontSize:10,legendColor:C.dark,
  dataLabelFontSize:10,dataLabelColor:C.white,
  showTitle:false,
});
[
  ["Mercado global 2024","$430.000 M","ingresos anuales totales del sector"],
  ["Precio medio global","$371","por dispositivo smartphone vendido en 2024"],
  ["Apple beneficio moviles","$60.000 M","beneficio neto de Apple en iPhone (2024)"],
  ["Huawei post-sanciones","-60% ventas","impacto de las sanciones comerciales EE.UU."],
  ["Mercado plegables 2024","+64% YoY","aunque solo representan el 1,5% del total"],
].forEach(([t,v,sub],i)=>{
  const ey=2.2+i*0.98;
  s9.addShape(pptx.ShapeType.rect,{x:5.2,y:ey,w:4.43,h:0.88,fill:{color:i%2===0?C.blueL:C.white},line:{color:C.lb,pt:1}});
  s9.addText(t,  {x:5.32,y:ey+0.06,w:2.5, h:0.30,fontSize:10.5,color:C.blue,bold:true,fontFace:"Calibri",wrap:true});
  s9.addText(v,  {x:7.85,y:ey+0.04,w:1.67,h:0.38,fontSize:14,  color:C.acc, bold:true,align:"right",fontFace:"Calibri",wrap:true});
  s9.addText(sub,{x:5.32,y:ey+0.48,w:4.2, h:0.30,fontSize:9.5, color:C.mid,fontFace:"Calibri",wrap:true});
});
s9.addText("Fuentes: IDC Worldwide Quarterly Mobile Phone Tracker 2024 · Counterpoint Research · Statista 2024",{
  x:0.38,y:7.04,w:9.25,h:0.24,fontSize:8.5,color:C.gray,fontFace:"Calibri",italic:true,wrap:true});

// ================================================================
//  SLIDE 10 — CONCLUSION
// ================================================================
const s10=bgSlide(C.navy);
s10.addShape(pptx.ShapeType.rect,{x:0,y:0,  w:10,h:0.07,fill:{color:C.acc}});
s10.addShape(pptx.ShapeType.rect,{x:0,y:7.43,w:10,h:0.07,fill:{color:C.acc}});
s10.addText("CONCLUSION",{
  x:0.38,y:0.12,w:9.25,h:0.98,fontSize:42,color:C.white,bold:true,fontFace:"Calibri",wrap:true});
s10.addShape(pptx.ShapeType.rect,{x:0.38,y:1.1,w:9.25,h:0.06,fill:{color:C.acc}});
// 6 items. Available y=1.2 to y=7.35 = 6.15". Each: 6.15/6=1.025" ✓
[
  "El smartphone ilustra el ciclo de vida clasico: en 17 anos ha recorrido todas sus fases con datos contrastados a escala global y con impacto economico y social sin precedentes.",
  "La introduccion demostro que la innovacion disruptiva puede crear mercados de la nada. Apple aposto por un telefono sin teclado que sus competidores consideraron un fracaso antes de verlo.",
  "El crecimiento (2010-2013) muestra como responder a necesidades reales a escala global. La competencia de Android acelero la democratizacion y la bajada de precios al alcance de todos.",
  "La madurez obligo a diferenciarse en ecosistemas, servicios y experiencia de usuario. Los margenes premium se mantienen, pero el volumen global ya no crece y la competencia es feroz.",
  "El declive no implica desaparicion: la IA integrada, los formatos plegables y la sostenibilidad son las apuestas para extender o reiniciar el ciclo. La reinvencion es la unica salida.",
  "Comprender el ciclo de vida es esencial para cualquier empresa: permite anticipar inversiones, campanas de marketing y decisiones de produccion en el momento oportuno para no quedarse atras.",
].forEach((c,i)=>{
  const cy=1.22+i*1.02;
  s10.addShape(pptx.ShapeType.ellipse,{x:0.38,y:cy+0.09,w:0.44,h:0.44,fill:{color:C.acc}});
  s10.addText(String(i+1),{x:0.38,y:cy+0.09,w:0.44,h:0.44,fontSize:13,color:C.white,bold:true,align:"center",valign:"middle",fontFace:"Calibri"});
  s10.addText(c,{x:0.94,y:cy+0.04,w:8.7,h:0.88,fontSize:10.8,color:"C8DCF0",fontFace:"Calibri",wrap:true,valign:"top"});
});
s10.addText("Economia de la Empresa  |  2 DAW  |  Curso 2025-2026",{
  x:0.38,y:7.18,w:9.25,h:0.24,fontSize:9,color:"446688",fontFace:"Calibri",align:"center",wrap:true});

// ── GUARDAR ───────────────────────────────────────────────────────
const OUT="D:/Escritorio/xampp/htdocs/https-github.com-antonio-valero-daw2personal/1ero/soste/Ciclo_de_Vida_Smartphone.pptx";
pptx.writeFile({fileName:OUT})
  .then(()=>console.log("OK:"+OUT))
  .catch(e=>{console.error("ERROR:",e);process.exit(1);});
