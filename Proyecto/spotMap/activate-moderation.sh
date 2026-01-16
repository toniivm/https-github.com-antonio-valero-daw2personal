#!/bin/bash

# Script para ayudarte a activar moderación en SpotMap
# Uso: bash activate-moderation.sh

echo "🚀 SpotMap - Activador de Moderación"
echo "===================================="
echo ""
echo "Este script te ayuda a:"
echo "1. Verificar si tienes la columna 'status' en Supabase"
echo "2. Activar tu rol como moderador"
echo ""
echo "PASOS MANUALES (sin scripts, porque necesitas SQL de Supabase):"
echo ""
echo "📋 PASO 1: Obtén tu USER ID"
echo "   - Accede a tu proyecto Supabase"
echo "   - Ve a Authentication > Users"
echo "   - Copia tu User ID (parece: 550e8400-e29b-41d4-a716-446655440000)"
echo ""
echo "📋 PASO 2: Ejecuta este SQL en Supabase SQL Editor"
echo ""
echo "═══════════════════════════════════════════════════════════"
cat << 'EOF'
-- Paso A: Crear columna status si no existe
ALTER TABLE public.spots 
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'approved' 
CHECK (status IN ('pending', 'approved', 'rejected'));

-- Paso B: Crear índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS spots_status_idx ON public.spots(status);

-- Paso C: Actualizar spots existentes a 'approved'
UPDATE public.spots 
SET status = 'approved' 
WHERE status IS NULL;

-- Paso D: Asignarte rol de moderador (REEMPLAZA TU_USER_ID)
UPDATE profiles 
SET role = 'moderator' 
WHERE user_id = 'TU_USER_ID';
EOF
echo ""
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "⚠️  IMPORTANTE: Reemplaza 'TU_USER_ID' con tu ID real de Supabase"
echo ""
echo "✅ Después de ejecutar el SQL:"
echo "   1. Recarga la página (F5)"
echo "   2. Deberías ver un panel de moderación en la esquina superior derecha"
echo "   3. ¡Listo para moderar spots!"
echo ""
echo "📚 Más detalles en: MODERATION_SETUP.md"
echo ""
