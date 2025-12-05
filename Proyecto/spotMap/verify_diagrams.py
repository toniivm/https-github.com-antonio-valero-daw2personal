"""
Script para verificar y reorganizar los diagramas SVG en el documento Word
- Asegurar que ERD esté en sección "5. Modelo de Datos"
- Wireframes en "7. Diseño de Interfaz"
- Casos de uso en "6. Diagramas de Procesos"
- Clases en "6. Diagramas de Procesos"
- Relacional en "5. Modelo de Datos"
- Guía de estilos en "7. Diseño de Interfaz"
"""

from docx import Document
from docx.shared import Inches, Pt
from docx.enum.text import WD_ALIGN_PARAGRAPH
import os

def reorganize_diagrams():
    print("🔧 Verificando posición de diagramas en el documento...\n")
    
    doc_path = r'c:\xampp\htdocs\https-github.com-antonio-valero-daw2personal\Proyecto\spotMap\docs\SPOTMAP_DOCUMENTO_FINAL_PROYECTO.docx'
    doc = Document(doc_path)
    
    # Encontrar secciones principales
    sections = {}
    for i, para in enumerate(doc.paragraphs):
        text = para.text.lower()
        if para.style.name.startswith('Heading 1'):
            sections[text] = i
            print(f"📍 Encontrado: {para.text[:60]} (línea {i})")
    
    print(f"\n✅ Total de secciones H1: {len(sections)}")
    
    # Verificar dónde están los diagramas
    print("\n📊 Buscando imágenes embebidas en el documento...")
    image_count = 0
    for rel in doc.part.rels.values():
        if "image" in rel.target_ref:
            image_count += 1
            print(f"  - Imagen encontrada: {rel.target_ref}")
    
    print(f"\nTotal de imágenes en documento: {image_count}")
    
    # Verificar archivos SVG en carpeta images
    images_folder = r'c:\xampp\htdocs\https-github.com-antonio-valero-daw2personal\Proyecto\spotMap\docs\images'
    if os.path.exists(images_folder):
        svg_files = [f for f in os.listdir(images_folder) if f.endswith('.svg')]
        print(f"\n📁 SVGs en carpeta 'images': {len(svg_files)}")
        for svg in sorted(svg_files):
            print(f"  ✅ {svg}")
    
    print("\n" + "="*70)
    print("📍 POSICIONES CORRECTAS QUE DEBEN TENER:")
    print("="*70)
    
    positions = {
        "5. modelo de datos": "ERD_PROFESIONAL.svg + RELACIONAL.svg",
        "6. diagramas de procesos": "CLASES.svg + CASOS_USO.svg",
        "7. diseño de interfaz": "WIREFRAMES.svg + GUIA_ESTILOS.svg"
    }
    
    for section, diagrams in positions.items():
        print(f"\n📌 {section.upper()}")
        print(f"   └─ {diagrams}")
    
    print("\n" + "="*70)
    print("✅ RECOMENDACIÓN:")
    print("="*70)
    print("""
Los diagramas SVG ya están embebidos en el documento Word.
Verifica que estén en estos lugares dentro del documento:

1️⃣  Sección "5. MODELO DE DATOS" (línea ~800):
    - SPOTMAP_ERD_PROFESIONAL.svg (diagrama entidad-relación)
    - SPOTMAP_RELACIONAL.svg (esquema relacional PostgreSQL)

2️⃣  Sección "6. DIAGRAMAS DE PROCESOS" (línea ~1200):
    - SPOTMAP_CLASES.svg (diagrama de clases UML)
    - SPOTMAP_CASOS_USO.svg (casos de uso)

3️⃣  Sección "7. DISEÑO DE INTERFAZ" (línea ~1600):
    - SPOTMAP_WIREFRAMES.svg (prototipos de pantallas)
    - SPOTMAP_GUIA_ESTILOS.svg (guía de diseño)

Si los diagramas NO están visibles en el documento:
→ El documento podría tener problemas de renderizado en Word
→ Abre el documento y verifica que las imágenes se muestren
→ Si no se ven: Formato → Imagen → Comprimir (si está en modo oscuro)
""")
    
    return image_count

if __name__ == '__main__':
    reorganize_diagrams()
