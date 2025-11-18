# 🚀 Alternativas de Deploy (sin Docker)

## 1. ⭐ Vercel (RECOMENDADO)
**Gratis, rápido, deploy automático**

```powershell
npm install -g vercel
vercel login
vercel --prod
```

✅ Ya tienes `vercel.json` configurado
📖 Ver: `DEPLOY_VERCEL.md`

---

## 2. 💜 Railway.app
**Mejor para PHP + Supabase**

1. https://railway.app → Sign up con GitHub
2. New Project → Deploy from GitHub repo
3. Añadir variables de entorno:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
4. Deploy automático

**Costo:** $5 gratis/mes

---

## 3. 🎯 Netlify
**Similar a Vercel**

```powershell
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

**Ventaja:** Netlify Forms gratis (si quieres añadir contacto)

---

## 4. 📦 GitHub Pages
**100% gratis, solo frontend**

```powershell
# 1. GitHub repo → Settings → Pages
# 2. Source: main branch
# 3. Folder: /frontend
# 4. Save
```

Tu app estará en: `https://tu-usuario.github.io/repo-name`

**Limitación:** Solo archivos estáticos (pero Supabase hace el backend)

---

## 5. 🌐 Cloudflare Pages
**CDN ultrarrápido + gratis**

```powershell
npm install -g wrangler
wrangler login
wrangler pages publish frontend
```

**Ventajas:**
- CDN global de Cloudflare
- Build ilimitado
- SSL automático
- Workers para backend (opcional)

---

## 6. 🔥 Firebase Hosting
**Google, gratis hasta 10GB/mes**

```powershell
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

**Buena opción si quieres añadir:**
- Firebase Analytics
- Firebase Cloud Messaging (notificaciones push)

---

## 7. 🟢 Render.com
**Free tier generoso**

1. https://render.com → Sign up
2. New → Static Site
3. Conectar GitHub
4. Build: (vacío)
5. Publish: frontend
6. Deploy

**Ventaja:** También tiene plan gratis para PostgreSQL

---

## 8. ⚙️ Surge.sh
**El más simple**

```powershell
npm install -g surge
cd frontend
surge
```

Deploy en 10 segundos literal. Dominio random: `random-name.surge.sh`

---

## 📊 Comparativa rápida

| Plataforma | Costo | PHP | Auto-deploy | SSL | CDN |
|------------|-------|-----|-------------|-----|-----|
| **Vercel** | Gratis | ❌ | ✅ | ✅ | ✅ |
| Railway | $5 free | ✅ | ✅ | ✅ | ✅ |
| Netlify | Gratis | ❌ | ✅ | ✅ | ✅ |
| GitHub Pages | Gratis | ❌ | ✅ | ✅ | ❌ |
| Cloudflare Pages | Gratis | Workers | ✅ | ✅ | ✅ |
| Firebase | Gratis | ❌ | ✅ | ✅ | ✅ |
| Render | Gratis | ✅ | ✅ | ✅ | ✅ |
| Surge | Gratis | ❌ | ❌ | ✅ | ❌ |

---

## 🎯 Mi Top 3 recomendaciones

### 🥇 Para tu proyecto: **Vercel**
- Frontend estático + Supabase = perfecto
- Deploy automático
- Ya está configurado (`vercel.json`)

### 🥈 Si quieres PHP: **Railway.app**
- Soporta PHP nativo
- Deploy desde GitHub
- Super fácil

### 🥉 Gratis 100%: **GitHub Pages**
- Ya tienes el repo en GitHub
- Un click y funciona
- Backend = Supabase

---

## 🚀 Comandos rápidos

```powershell
# Vercel (recomendado)
npm i -g vercel; vercel --prod

# Netlify
npm i -g netlify-cli; netlify deploy --prod

# Surge (el más rápido)
npm i -g surge; cd frontend; surge

# Cloudflare Pages
npm i -g wrangler; wrangler pages publish frontend
```

---

## 💡 Consejo final

Como ya tienes **Supabase haciendo todo el backend** (Auth, DB, Storage, Realtime), te recomiendo:

1. **Deploy frontend en Vercel** (gratis, rápido, profesional)
2. **Olvidar el backend PHP** para producción
3. **Disfrutar de 0€/mes** en hosting

El backend PHP solo úsalo en XAMPP para desarrollo local si lo necesitas, pero para producción → todo en Supabase + Vercel.
