# SpotMap - Plan de Integración de IA en VS Code

## 1. Objetivos
- Acelerar escritura de código (frontend JS, SQL Supabase, policies RLS).
- Mejorar documentación y explicaciones para tu presentación.
- Preparar futura moderación automática (imágenes / texto) sin sobrecargar ahora.
- Mantener seguridad (no filtrar claves en prompts). 

## 2. Extensiones y Herramientas Recomendadas
| Herramienta | Uso Principal | Nota |
|-------------|---------------|------|
| GitHub Copilot | Autocompletar JS, PHP, SQL | Ajustar estilo consistente del repo |
| Copilot Chat | Preguntas sobre código, generar tests rápidos | Evitar pegar secretos |
| Supabase Studio (web) + Supabase AI | Generar/explicar queries y policies | No exponer service role key |
| REST Client (VS Code) | Guardar requests a la API local | Facilita pruebas repetibles |
| Ollama / Local AI (opcional) | Ejecutar modelos ligeros locales (resúmenes) | Sin enviar datos a terceros |
| Markdown Preview Enhanced | Visualizar documentación técnica | Para revisar ARQUITECTURA.md |

## 3. Flujo Diario Sugerido
1. Abrir VS Code → Activar Copilot.
2. Escribir un bloque (ej. nueva función spots) y dejar que Copilot sugiera; aceptar sólo si comprende el contexto.
3. Para SQL complejo: ir a Supabase Studio, usar AI para generar query, traerla y pegar en `DATOS_MODELO.md` si se añade.
4. Documentar cambio inmediatamente en el archivo correspondiente (ej. `ROLES_Y_RLS.md`).
5. Revisar seguridad: buscar palabras como `KEY` o `TOKEN` en código antes de commit.

## 4. Prompting Efectivo (Ejemplos)
"Genera una función JS que obtenga spots aprobados paginados y comente dónde optimizar."  → Código + explicación.
"Explica cada policy RLS y dame un resumen para el tribunal." → Texto condensado.
"Sugiere pruebas de estrés para la carga de 500 spots en mapa." → Casos de test.

## 5. Moderación Automática Futuro (Roadmap IA)
Fase inicial (manual): moderadores aprueban.
Fase IA texto: pequeño modelo (local) etiqueta categoría sugerida (skate, view, art) según descripción.
Fase IA imagen: modelo NSFW / contenido inapropiado antes de aprobar (Edge Function).
Fase reputación: score por aprobaciones y calidad (algoritmo simple + IA para detectar spam repetido).

## 6. Integración Técnica Progresiva
- Añadir script `scripts/ai-suggestions.md` para registrar prompts y mejoras.
- Local: si instalas Ollama → `ollama run mistral "Resume archivo ROLES_Y_RLS.md"`.
- Evaluar tiempo: si la respuesta de la IA no es clara en 2-3 intentos, reformular prompt (añadir contexto concreto: archivo, función, objetivo).

## 7. Buenas Prácticas
- Validar cada sugerencia: la IA puede inventar APIs inexistentes.
- No incluir claves ni datos sensibles en prompts (usa placeholders). 
- No delegar diseñar seguridad completa: revisa manualmente policies.
- Mantener estilo consistente (nombres descriptivos, evitar abreviaturas). 

## 8. Métricas de Uso IA
- % de líneas aceptadas automáticamente vs. editadas manualmente.
- Tiempo ahorrado en escribir queries SQL.
- Número de prompts útiles guardados para tu defensa (demuestra metodología).

## 9. Preparación para la Presentación
Explica: "He usado IA como copiloto, no como reemplazo. Cada sugerencia fue revisada y documentada para asegurar calidad y seguridad."

## 10. Próximo Paso
Crear archivo de recopilación de prompts (si se desea) y comenzar con Auth + Roles apoyado por AI para acelerar.
