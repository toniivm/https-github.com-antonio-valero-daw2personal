-- SQL para añadir columna status a tabla spots en Supabase
-- Ejecuta esto SOLO si quieres sistema de moderación

-- 1. Añadir columna status
ALTER TABLE public.spots 
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'approved' 
CHECK (status IN ('pending', 'approved', 'rejected'));

-- 2. Crear índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS spots_status_idx ON public.spots(status);

-- 3. Actualizar spots existentes a 'approved'
UPDATE public.spots 
SET status = 'approved' 
WHERE status IS NULL;

-- ✅ LISTO! Ahora puedes filtrar por status
-- Si NO quieres moderación, NO ejecutes este archivo
