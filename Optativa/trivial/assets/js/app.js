(function(){
  const root = document.getElementById('view-root');
  const btnHome = document.getElementById('btn-home');
  const btnLb = document.getElementById('btn-leaderboard');
  const basePath = (function(){
    const p = window.location.pathname;
    return p.endsWith('/') ? p : p.replace(/[^/]+$/, '');
  })();

  const state = {
    mode: 'classic',
    remaining: [],
    total: 0,
    startAt: 0,
    answered: false,
    players: [],
    currentPlayer: 0,
    currentQuestion: null,
    currentTheme: null,
    autoTheme: false,
  };

  btnHome.addEventListener('click', () => renderHome());
  btnLb.addEventListener('click', () => renderLeaderboard());

  function api(path, opts={}){
    return fetch(`${basePath}api/${path}`.replace(/\/+/,'/'), opts).then(r=>{
      if(!r.ok) throw new Error('API error');
      return r.json();
    });
  }

  function renderHome(){
    root.innerHTML = `
      <section class="card">
        <h2 class="title">Juega al Trivial Pro</h2>
        <p class="meta">Configura jugadores, categoría y dificultad. Turnos por jugador, temas aleatorios y ranking final.</p>
        <div class="card" style="margin-top:12px">
          <label for="players-input" class="meta">Jugadores (separados por coma)</label>
          <input id="players-input" type="text" value="Ana, Bruno" placeholder="Ej: Ana, Bruno, Carla" />
          <div class="grid" style="margin-top:12px">
            <div>
              <label class="meta">Categoría</label>
              <select id="category">
                <option value="">Todas</option>
                <option value="Cultura General">Cultura General</option>
                <option value="Historia">Historia</option>
                <option value="Ciencia">Ciencia</option>
                <option value="Geografía">Geografía</option>
                <option value="Arte">Arte</option>
                <option value="Cine">Cine</option>
                <option value="Música">Música</option>
                <option value="Videojuegos">Videojuegos</option>
                <option value="Deportes">Deportes</option>
                <option value="Tecnología">Tecnología</option>
              </select>
            </div>
            <div>
              <label class="meta">Dificultad</label>
              <select id="difficulty">
                <option value="">Todas</option>
                <option value="facil">Fácil</option>
                <option value="media">Media</option>
                <option value="dificil">Difícil</option>
              </select>
            </div>
            <div>
              <label class="meta">Preguntas</label>
              <select id="limit">
                <option value="8">8</option>
                <option value="10" selected>10</option>
                <option value="12">12</option>
              </select>
            </div>
          </div>
          <div style="margin-top:12px;display:flex;gap:10px;align-items:center">
            <input type="checkbox" id="auto-theme" />
            <label class="meta" for="auto-theme" style="margin:0">Asignar tema aleatorio automático cada turno</label>
          </div>
        </div>
        <div class="grid" style="margin-top:12px">
          <div class="card">
            <h3>Modo clásico</h3>
            <p>Turnos alternos por jugador, sin extras.</p>
            <button id="start-classic">Empezar</button>
          </div>
          <div class="card">
            <h3>Modo fiesta</h3>
            <p>Bonus por racha y confeti al final.</p>
            <button id="start-party">Empezar</button>
          </div>
        </div>
        <div class="info-box">
          <h4>Cómo funciona</h4>
          <ul>
            <li>Se turnan los jugadores. Cada turno puede fijar un tema aleatorio.</li>
            <li>Modo fiesta añade bonus por racha y más confeti.</li>
            <li>El ganador se guarda en el ranking global con su mejor puntuación.</li>
          </ul>
        </div>
      </section>
    `;
    document.getElementById('start-classic').onclick = () => start('classic');
    document.getElementById('start-party').onclick = () => start('party');
  }

  function buildPlayers(){
    const raw = (document.getElementById('players-input').value || '').split(',').map(s=>s.trim()).filter(Boolean);
    const names = raw.length ? raw : ['Jugador 1'];
    return names.map(n=>({ name: n, score: 0, combo: 0 }));
  }

  async function start(mode){
    state.mode = mode;
    state.remaining = [];
    state.total = 0;
    state.answered = false;
    state.players = buildPlayers();
    state.currentPlayer = 0;
    state.startAt = Date.now();
    state.currentQuestion = null;
    state.currentTheme = null;
    state.autoTheme = document.getElementById('auto-theme').checked;

    const category = document.getElementById('category').value;
    const difficulty = document.getElementById('difficulty').value;
    const limit = document.getElementById('limit').value || '10';
    const params = new URLSearchParams();
    params.set('limit', limit);
    if(category) params.set('category', category);
    if(difficulty) params.set('difficulty', difficulty);

    const { questions } = await api(`questions?${params.toString()}`);
    state.remaining = questions;
    state.total = questions.length;
    renderGame();
  }

  function answeredCount(){
    return state.total - (state.remaining.length + (state.currentQuestion ? 1 : 0));
  }

  function progress(){
    const pct = state.total ? Math.round((answeredCount()/state.total)*100) : 0;
    return `<div class="progress"><div style="width:${pct}%"></div></div>`;
  }

  function pickQuestion(){
    if(state.currentQuestion || !state.remaining.length) return;
    let idx = 0;
    if(state.currentTheme){
      idx = state.remaining.findIndex(q=>q.category === state.currentTheme);
      if(idx === -1) idx = 0;
    }
    state.currentQuestion = state.remaining[idx];
    state.remaining.splice(idx,1);
  }

  function randomTheme(){
    const cats = Array.from(new Set(state.remaining.map(q=>q.category)));
    if(!cats.length) return;
    state.currentTheme = cats[Math.floor(Math.random()*cats.length)];
    state.currentQuestion = null;
    renderGame();
  }

  function scoreboard(){
    return `
      <div class="scoreboard">
        ${state.players.map((p,i)=>`
          <div class="pill ${i===state.currentPlayer?'active':''}">
            <span>${p.name}</span>
            <strong>${p.score} pts</strong>
          </div>
        `).join('')}
      </div>
    `;
  }

  function renderGame(){
    if(state.autoTheme && !state.currentTheme){
      randomTheme();
      return; // randomTheme re-renders
    }
    if(!state.currentQuestion){
      pickQuestion();
    }
    const q = state.currentQuestion;
    if(!q){
      return renderResult();
    }
    const header = `
      <div class="meta">Turno de <strong>${state.players[state.currentPlayer].name}</strong> · Pregunta ${answeredCount()+1}/${state.total}</div>
      <div class="meta">Categoría: ${q.category} · Dificultad: ${q.difficulty} ${state.currentTheme ? '· Tema fijado: '+state.currentTheme : ''}</div>
      <h2 class="title">${q.question}</h2>
    `;
    let body = '';
    if(q.type === 'choice'){
      body = '<div class="grid">' + q.choices.map((c,i)=>`
        <div class="choice" data-i="${i}">${c}</div>
      `).join('') + '</div>';
    }else if(q.type === 'truefalse'){
      body = '<div class="grid">' + ['Verdadero','Falso'].map((c,i)=>`
        <div class="choice" data-i="${i===0}">${c}</div>
      `).join('') + '</div>';
    }
    const themeBtn = `<div class="bar">${state.currentTheme ? `<span class="badge">Tema: ${state.currentTheme}</span>` : ''}<button class="ghost" id="random-theme">Tema aleatorio para este turno</button></div>`;
    root.innerHTML = `<section class="card">${progress()}${scoreboard()}${themeBtn}${header}${body}</section>`;
    document.getElementById('random-theme').onclick = () => randomTheme();
    Array.from(root.querySelectorAll('.choice')).forEach(el=>{
      el.onclick = () => choose(el.getAttribute('data-i'));
    });
  }

  function choose(val){
    if(state.answered) return;
    state.answered = true;
    const q = state.currentQuestion;
    const correct = String(q.answer);
    const player = state.players[state.currentPlayer];

    const nodes = Array.from(root.querySelectorAll('.choice'));
    nodes.forEach(n=>{
      const chosen = n.getAttribute('data-i');
      if(chosen === correct){
        n.classList.add('correct');
      } else if(chosen === val){
        n.classList.add('wrong');
      }
    });

    if(val === correct){
      const elapsed = (Date.now() - state.startAt)/1000;
      let gain = Math.max(10, 200 - Math.floor(elapsed));
      if(state.mode === 'party') gain = Math.round(gain * 1.3);
      player.combo = Math.min((player.combo||0)+1, 5);
      gain += player.combo*5;
      player.score += gain;
      playTone(880, 120);
      if(player.combo>=3) playTone(1250, 90);
    } else {
      player.combo = 0;
      playTone(200, 160);
    }

    setTimeout(()=>{
      state.currentQuestion = null;
      state.answered = false;
      state.currentPlayer = (state.currentPlayer + 1) % state.players.length;
      renderGame();
    }, 700);
  }

  async function renderResult(){
    const duration = Math.round((Date.now()-state.startAt)/1000);
    const standings = [...state.players].sort((a,b)=> b.score - a.score);
    const winner = standings[0];
    const bestScore = winner ? winner.score : 0;
    root.innerHTML = `
      <section class="card">
        <h2 class="title">Resultado</h2>
        <p class="meta">Ganador: <strong>${winner ? winner.name : 'Nadie'}</strong> · Mejor puntuación: ${bestScore} · Tiempo: ${duration}s</p>
        <div class="card">
          <h3>Marcador final</h3>
          <ul class="rank-list">
            ${standings.map((p,i)=>`<li><span>${i+1}. ${p.name}</span><span>${p.score} pts</span></li>`).join('')}
          </ul>
          <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap">
            <button id="play-again">Jugar otra vez</button>
            <button id="go-lb" class="ghost">Ver ranking global</button>
          </div>
        </div>
      </section>
    `;
    fireConfetti(140);
    document.getElementById('play-again').onclick = () => renderHome();
    document.getElementById('go-lb').onclick = () => renderLeaderboard();
    // guarda la mejor marca en el ranking global
    if(winner){
      api('score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: winner.name, score: bestScore, duration, mode: state.mode })
      }).catch(()=>{});
    }
  }

  async function renderLeaderboard(){
    const { leaderboard } = await api('leaderboard');
    root.innerHTML = `
      <section class="card">
        <h2 class="title">Ranking global</h2>
        <ul class="rank-list">
          ${leaderboard.map((r,i)=>`<li><span>${i+1}. ${r.name}</span><span>${r.score} pts · ${r.mode}</span></li>`).join('')}
        </ul>
        <div style="margin-top:12px"><button id="back-home">Volver</button></div>
      </section>
    `;
    document.getElementById('back-home').onclick = () => renderHome();
  }

  function fireConfetti(n){
    const canvas = document.createElement('canvas');
    canvas.style.position='fixed';canvas.style.inset='0';canvas.style.pointerEvents='none';
    canvas.width=window.innerWidth;canvas.height=window.innerHeight;
    document.body.appendChild(canvas);
    const ctx=canvas.getContext('2d');
    let pieces = Array.from({length:n},()=>({
      x: Math.random()*canvas.width,
      y: -10,
      vx: (Math.random()-0.5)*3,
      vy: Math.random()*3+2,
      r: Math.random()*4+2,
      c: `hsl(${Math.floor(Math.random()*360)},80%,60%)`
    }));
    (function tick(){
      ctx.clearRect(0,0,canvas.width,canvas.height);
      pieces.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy*=0.99;ctx.fillStyle=p.c;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();});
      pieces = pieces.filter(p=>p.y<canvas.height+10);
      if(pieces.length) requestAnimationFrame(tick); else document.body.removeChild(canvas);
    })();
  }

  // Minimal SFX with WebAudio
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  function playTone(freq=800, ms=120, vol=0.05){
    try{
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.type = 'sine';
      o.frequency.value = freq;
      g.gain.value = vol;
      o.connect(g).connect(audioCtx.destination);
      o.start();
      setTimeout(()=>o.stop(), ms);
    }catch(e){}
  }

  window.addEventListener('keydown', (e)=>{
    const choices = Array.from(root.querySelectorAll('.choice'));
    if(!choices.length) return;
    if(e.key>='1' && e.key<='4'){
      const idx = parseInt(e.key,10)-1;
      if(choices[idx]) choices[idx].click();
    }
  });

  renderHome();
})();
