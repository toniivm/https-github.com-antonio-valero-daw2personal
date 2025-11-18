# 🚀 Deploy SpotMap en Vercel (RECOMENDADO)

## ¿Por qué Vercel?
- ✅ **100% GRATIS** para proyectos personales
- ✅ Deploy automático desde GitHub (push → live en 30 seg)
- ✅ SSL + CDN global incluido
- ✅ Compatible perfecto con Supabase
- ✅ Deploy en < 1 minuto

## 🎯 Arquitectura recomendada
**Frontend en Vercel + Backend en Supabase = 0€/mes**

Ya tienes todo en Supabase (Auth, DB, Storage, Realtime), así que **no necesitas el backend PHP** para producción.

---

## 📋 Pasos para deploy

### 1️⃣ Instalar Vercel CLI
```powershell
npm install -g vercel
```

### 2️⃣ Login en Vercel
```powershell
vercel login
```

### 3️⃣ Deploy
```powershell
# Desde la raíz del proyecto
vercel

# Responder:
# - Set up and deploy? Y
# - Which scope? tu-usuario
# - Link to existing project? N
# - Project name? spotmap
# - In which directory is your code? ./
# - Override settings? N
```

### 4️⃣ Deploy a producción
```powershell
vercel --prod
```

✅ **¡Listo!** Tu app estará en: `https://spotmap.vercel.app`

---

## 🔐 Configurar variables de entorno

```powershell
vercel env add SUPABASE_URL production
# Pegar: https://ptjkepxsjqyejkynjewc.supabase.co

vercel env add SUPABASE_ANON_KEY production
# Pegar: tu-anon-key
```

---

## 🔄 Deploy automático con GitHub

Cada `git push` → deploy automático

```powershell
git add .
git commit -m "Deploy to Vercel"
git push origin main
```

---

## ⚡ Ya está configurado

- ✅ Rutas SPA
- ✅ Service Worker
- ✅ Security headers
- ✅ Cache optimizado

---

## 🎉 Resultado

- Frontend: `https://spotmap.vercel.app`
- Backend: Supabase
- SSL: automático
- Deploy: `git push`
- Costo: **0€**
