// ==========================================
// 🤠 DINOWEST RANCH - VERSÃO FINAL ESTÁVEL
// ==========================================

const API = "";
let tutorialStep = 1;
const totalSteps = 4;
let somAtivo = false;
let audioContext = null;

// ==========================================
// 🎵 SISTEMA DE SONS SINTETIZADOS
// ==========================================
function initAudio() {
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.log("Audio não suportado");
    }
  }
}

function playTone(frequency, duration, type = "sine", volume = 0.3) {
  if (!somAtivo || !audioContext) return;
  try {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = type;
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(volume, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + duration,
    );
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.start();
    osc.stop(audioContext.currentTime + duration);
  } catch (e) {}
}

function playNoise(duration, volume = 0.2) {
  if (!somAtivo || !audioContext) return;
  try {
    const bufferSize = audioContext.sampleRate * duration;
    const buffer = audioContext.createBuffer(
      1,
      bufferSize,
      audioContext.sampleRate,
    );
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = audioContext.createBufferSource();
    noise.buffer = buffer;
    const gain = audioContext.createGain();
    gain.gain.setValueAtTime(volume, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + duration,
    );
    const filter = audioContext.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 1000;
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioContext.destination);
    noise.start();
  } catch (e) {}
}

function somPorta() {
  playNoise(0.3, 0.15);
  setTimeout(() => playTone(200, 0.2, "triangle", 0.2), 100);
}
function somGalope() {
  [150, 180, 150, 200].forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.1, "square", 0.15), i * 80);
  });
}
function somTiro() {
  playNoise(0.15, 0.4);
  playTone(80, 0.3, "sawtooth", 0.3);
}
function somMoeda() {
  playTone(800, 0.1, "sine", 0.2);
  setTimeout(() => playTone(1200, 0.2, "sine", 0.15), 100);
}
function somConquista() {
  [523, 659, 784, 1047].forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.3, "triangle", 0.2), i * 150);
  });
}
function somClique() {
  playTone(600, 0.05, "sine", 0.1);
}

function ativarSom() {
  initAudio();
  somAtivo = true;
  const btn = document.getElementById("btn-ativar-som");
  if (btn) {
    btn.textContent = "🔊 Som Ativado";
    btn.classList.add("ativo");
    setTimeout(() => btn.classList.add("hidden"), 2000);
  }
  playTone(800, 0.1, "sine", 0.2);
  localStorage.setItem("dinowest_som_ativo", "true");
}

if (localStorage.getItem("dinowest_som_ativo") === "true") {
  window.addEventListener("load", () => {
    initAudio();
    somAtivo = true;
    const btn = document.getElementById("btn-ativar-som");
    if (btn) btn.classList.add("hidden");
  });
}

// ==========================================
//  SAUDAÇÃO DINÂMICA
// ==========================================
function getSaudacaoDinamica() {
  const hora = new Date().getHours();
  if (hora >= 6 && hora < 12) {
    return {
      classe: "saudacao-manha",
      titulo: "Bom dia, Cowgirl! ️",
      mensagem: "O sol já nasceu no rancho! Hora de cavalgar com energia!",
      emoji: "☀️",
    };
  } else if (hora >= 12 && hora < 18) {
    return {
      classe: "saudacao-tarde",
      titulo: "Boa tarde, Cowgirl! ",
      mensagem: "Sol a pino! Hora da sesta ou da cavalgada?",
      emoji: "",
    };
  } else if (hora >= 18 && hora < 24) {
    return {
      classe: "saudacao-noite",
      titulo: "Boa noite, Cowgirl! 🌙",
      mensagem: "O rancho descansa sob as estrelas. Bom trabalho hoje!",
      emoji: "🌙",
    };
  } else {
    return {
      classe: "saudacao-madrugada",
      titulo: "Tá acordada tão tarde? 🦉",
      mensagem: "Até o T-Rex já dormiu! Vai descansar, cowgirl!",
      emoji: "",
    };
  }
}

// ==========================================
// 💌 MENSAGENS SURPRESA
// ==========================================
const mensagensSurpresa = [
  '💜 "Você está incrível hoje!"',
  '❤️ "Alguém te ama muito!"',
  '🤠 "Orgulho de você, cowgirl!"',
  '⭐ "Você é minha lenda do Oeste!"',
  ' "Cada dia com você é uma aventura!"',
  '💪 "Tô torcendo por você!"',
  '🎯 "Você consegue, sempre!"',
  '💖 "Te amo mais que tudo!"',
];

function mostrarMensagemSurpresa() {
  const container = document.getElementById("mensagem-container");
  if (!container) return;
  const existente = container.querySelector(".mensagem-surpresa");
  if (existente) existente.remove();
  const mensagem =
    mensagensSurpresa[Math.floor(Math.random() * mensagensSurpresa.length)];
  const div = document.createElement("div");
  div.className = "mensagem-surpresa";
  div.innerHTML = `<button class="close-msg" onclick="this.parentElement.remove()">✕</button><p>${mensagem}</p>`;
  container.appendChild(div);
  if (somAtivo) playTone(700, 0.15, "sine", 0.15);
  setTimeout(() => {
    if (div.parentElement) {
      div.style.opacity = "0";
      div.style.transform = "translateX(400px)";
      setTimeout(() => div.remove(), 500);
    }
  }, 8000);
}

function agendarProximaMensagem() {
  const minutos = Math.random() * 10 + 5;
  setTimeout(
    () => {
      mostrarMensagemSurpresa();
      agendarProximaMensagem();
    },
    minutos * 60 * 1000,
  );
}

// ==========================================
// 🐎 MASCOTE
// ==========================================
const mascoteDicas = [
  ' "Você bebeu água hoje?"',
  '📋 "Tem tarefa pendente!"',
  '🎯 "Bora completar um hábito?"',
  '📝 "Que tal escrever no diário?"',
  '🦕 "Tô aqui por você!"',
  '🤠 "Yeehaw, cowgirl!"',
  '⭐ "Você é incrível!"',
  ' "Bora dominar o Oeste!"',
];

let mascoteClickCount = 0;

function initMascote() {
  const mascote = document.getElementById("mascote");
  if (!mascote) return;
  mascote.addEventListener("click", () => {
    mascoteClickCount++;
    somClique();
    const bubble = document.getElementById("mascote-bubble");
    const dica = mascoteDicas[Math.floor(Math.random() * mascoteDicas.length)];
    bubble.textContent = dica;
    bubble.classList.add("visible");
    setTimeout(() => bubble.classList.remove("visible"), 3000);
    if (mascoteClickCount >= 10) {
      bubble.textContent = ' "PARABÉNS! 10 cliques! YEEHAW!"';
      bubble.classList.add("visible");
      if (somAtivo) somConquista();
      mascoteClickCount = 0;
      setTimeout(() => bubble.classList.remove("visible"), 5000);
    }
  });
}

// ==========================================
// 🌪️ EFEITOS VISUAIS (EM TODAS AS ABAS)
// ==========================================
function criarVentania() {
  for (let i = 0; i < 8; i++) {
    setTimeout(() => {
      const linha = document.createElement("div");
      linha.style.cssText = `
        position: fixed;
        top: ${Math.random() * 100}%;
        left: -200px;
        width: 200px;
        height: 2px;
        background: linear-gradient(90deg, transparent, #c9a961, transparent);
        z-index: 9998;
        pointer-events: none;
        animation: vento 3s linear forwards;
      `;
      document.body.appendChild(linha);
      setTimeout(() => linha.remove(), 3000);
    }, i * 200);
  }
  if (!document.getElementById("vento-style")) {
    const style = document.createElement("style");
    style.id = "vento-style";
    style.textContent = `@keyframes vento { 0% { transform: translateX(0); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateX(calc(100vw + 200px)); opacity: 0; } }`;
    document.head.appendChild(style);
  }
}

function criarFeno() {
  const feno = document.createElement("div");
  feno.textContent = "";
  feno.style.cssText = `
    position: fixed;
    bottom: 20%;
    left: -100px;
    font-size: 60px;
    z-index: 9997;
    pointer-events: none;
    animation: rolar 10s linear forwards;
  `;
  document.body.appendChild(feno);
  if (!document.getElementById("rolar-style")) {
    const style = document.createElement("style");
    style.id = "rolar-style";
    style.textContent = `@keyframes rolar { 0% { left: -100px; transform: rotate(0deg); } 100% { left: 110vw; transform: rotate(720deg); } }`;
    document.head.appendChild(style);
  }
  setTimeout(() => feno.remove(), 10000);
}

function criarPoeira() {
  for (let i = 0; i < 15; i++) {
    setTimeout(() => {
      const particula = document.createElement("div");
      particula.style.cssText = `
        position: fixed;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        width: 3px;
        height: 3px;
        background: #c9a961;
        border-radius: 50%;
        opacity: 0.5;
        z-index: 9996;
        pointer-events: none;
        animation: flutuar 5s ease-in-out forwards;
      `;
      document.body.appendChild(particula);
      setTimeout(() => particula.remove(), 5000);
    }, i * 100);
  }
  if (!document.getElementById("flutuar-style")) {
    const style = document.createElement("style");
    style.id = "flutuar-style";
    style.textContent = `@keyframes flutuar { 0% { transform: translate(0, 0); opacity: 0; } 20% { opacity: 0.5; } 80% { opacity: 0.5; } 100% { transform: translate(100px, -100px); opacity: 0; } }`;
    document.head.appendChild(style);
  }
}

function aplicarEfeitosAmbientais() {
  criarVentania();
  criarPoeira();
  criarFeno();
}

// ==========================================
// INICIALIZAÇÃO
// ==========================================
window.addEventListener("load", () => {
  console.log("🤠 App carregado!");

  let progress = 0;
  const interval = setInterval(() => {
    progress += 10;
    if (progress >= 100) progress = 100;
    const progressBar = document.getElementById("loading-progress");
    if (progressBar) progressBar.style.width = progress + "%";
    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        const loadingScreen = document.getElementById("loading-screen");
        if (loadingScreen) loadingScreen.classList.add("hidden");
        checkTutorial();
      }, 400);
    }
  }, 100);

  const hoje = new Date().toISOString().split("T")[0];
  const diarioData = document.getElementById("diario-data");
  const financaData = document.getElementById("financa-data");
  if (diarioData) diarioData.value = hoje;
  if (financaData) financaData.value = hoje;

  initMascote();
  setupAllForms();
  loadPageData("dashboard");

  setTimeout(
    () => {
      mostrarMensagemSurpresa();
      agendarProximaMensagem();
    },
    2 * 60 * 1000,
  );
});

// ==========================================
// TUTORIAL
// ==========================================
function checkTutorial() {
  if (!localStorage.getItem("dinowest_tutorial_done")) {
    const tutorial = document.getElementById("tutorial-overlay");
    if (tutorial) {
      tutorial.classList.remove("hidden");
      updateTutorial();
    }
  }
}

function updateTutorial() {
  document
    .querySelectorAll(".tutorial-step")
    .forEach((s) => s.classList.remove("active"));
  const step = document.querySelector(`[data-step="${tutorialStep}"]`);
  if (step) step.classList.add("active");
  const progressEl = document.querySelector(".tutorial-progress");
  if (progressEl)
    progressEl.textContent = `Passo ${tutorialStep} de ${totalSteps}`;
  const btnPrev = document.getElementById("btn-prev");
  const btnNext = document.getElementById("btn-next");
  if (btnPrev) btnPrev.disabled = tutorialStep === 1;
  if (btnNext)
    btnNext.textContent =
      tutorialStep === totalSteps ? "Começar! 🤠" : "Próximo →";
}

function nextTutorialStep() {
  somClique();
  if (tutorialStep < totalSteps) {
    tutorialStep++;
    updateTutorial();
  } else completeTutorial();
}

function prevTutorialStep() {
  somClique();
  if (tutorialStep > 1) {
    tutorialStep--;
    updateTutorial();
  }
}

function completeTutorial() {
  somConquista();
  const tutorial = document.getElementById("tutorial-overlay");
  if (tutorial) tutorial.classList.add("hidden");
  localStorage.setItem("dinowest_tutorial_done", "true");
}

// ==========================================
// MENU E NAVEGAÇÃO
// ==========================================
function toggleMenu() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  if (sidebar) sidebar.classList.toggle("open");
  if (overlay) overlay.classList.toggle("active");
}

function navigateTo(page) {
  console.log("Navegando para:", page);
  somPorta();
  document
    .querySelectorAll(".nav-item")
    .forEach((n) => n.classList.remove("active"));
  document
    .querySelectorAll(".page")
    .forEach((p) => p.classList.remove("active"));
  const navItem = document.querySelector(`[data-page="${page}"]`);
  if (navItem) navItem.classList.add("active");
  const pageEl = document.getElementById(`page-${page}`);
  if (pageEl) {
    pageEl.classList.add("active");
    loadPageData(page);
    toggleMenu();
    // Efeitos ambientais em TODAS as abas
    setTimeout(aplicarEfeitosAmbientais, 300);
  }
}

// ==========================================
// API
// ==========================================
async function api(endpoint, method = "GET", body = null) {
  const opts = { method, headers: { "Content-Type": "application/json" } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${API}${endpoint}`, opts);
  return res.json();
}

function formatDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("pt-BR");
}
function formatDateTime(d) {
  if (!d) return "";
  return new Date(d).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
function formatMoney(v) {
  return `R$ ${Number(v).toFixed(2).replace(".", ",")}`;
}

function showNotification(message, icon = "") {
  const container = document.getElementById("notifications");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function updateEl(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function loadPageData(page) {
  const loaders = {
    dashboard: loadDashboard,
    tarefas: loadTarefas,
    agenda: loadEventos,
    ciclo: loadCiclo,
    agua: loadAgua,
    financas: loadFinancas,
    compras: loadCompras,
    medicamentos: loadMedicamentos,
    diario: loadDiario,
    habitos: loadHabitos,
    lembretes: loadLembretes,
  };
  if (loaders[page]) loaders[page]();
}

// ==========================================
// 🔧 SETUP SEGURO DE FORMULÁRIOS
// ==========================================
function setupAllForms() {
  const forms = [
    {
      id: "form-tarefa",
      api: "/api/tarefas",
      reload: loadTarefas,
      msg: "Tarefa adicionada!",
      icon: "✓",
      som: somClique,
    },
    {
      id: "form-evento",
      api: "/api/eventos",
      reload: loadEventos,
      msg: "Evento agendado!",
      icon: "📅",
      som: somClique,
    },
    {
      id: "form-ciclo",
      api: "/api/ciclo",
      reload: loadCiclo,
      msg: "Ciclo registrado!",
      icon: "🩸",
      som: somClique,
    },
    {
      id: "form-financa",
      api: "/api/financas",
      reload: loadFinancas,
      msg: "Transação registrada!",
      icon: "💰",
      som: somMoeda,
    },
    {
      id: "form-remedio",
      api: "/api/medicamentos",
      reload: loadMedicamentos,
      msg: "Medicamento cadastrado!",
      icon: "💊",
      som: somClique,
    },
    {
      id: "form-diario",
      api: "/api/diario",
      reload: loadDiario,
      msg: "Entrada salva!",
      icon: "",
      som: somClique,
    },
    {
      id: "form-habito",
      api: "/api/habitos",
      reload: loadHabitos,
      msg: null,
      icon: null,
      som: somClique,
    },
    {
      id: "form-lembrete",
      api: "/api/lembretes",
      reload: loadLembretes,
      msg: "Lembrete criado!",
      icon: "⏰",
      som: somClique,
    },
  ];

  forms.forEach((cfg) => {
    const form = document.getElementById(cfg.id);
    if (!form) return;
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      try {
        if (cfg.som) cfg.som();
        const body = getFormData(cfg.id);
        await api(cfg.api, "POST", body);
        form.reset();
        // Reset valores padrão
        if (cfg.id === "form-habito")
          document.getElementById("habito-icone").value = "⭐";
        if (cfg.id === "form-diario")
          document.getElementById("diario-data").value = new Date()
            .toISOString()
            .split("T")[0];
        if (cfg.id === "form-compra")
          document.getElementById("compra-qtd").value = "1";
        if (cfg.msg) showNotification(cfg.msg, cfg.icon);
        if (cfg.reload) cfg.reload();
      } catch (err) {
        console.error("Erro:", err);
        showNotification("Erro ao salvar", "❌");
      }
      return false;
    });
  });

  // Compra (form inline)
  const formCompra = document.getElementById("form-compra");
  if (formCompra) {
    formCompra.addEventListener("submit", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      try {
        somClique();
        await api("/api/compras", "POST", {
          item: document.getElementById("compra-item").value,
          quantidade: document.getElementById("compra-qtd").value,
        });
        formCompra.reset();
        document.getElementById("compra-qtd").value = "1";
        loadCompras();
      } catch (err) {
        console.error("Erro compra:", err);
      }
      return false;
    });
  }
}

function getFormData(formId) {
  switch (formId) {
    case "form-tarefa":
      return {
        titulo: document.getElementById("tarefa-titulo").value,
        prioridade: document.getElementById("tarefa-prioridade").value,
        categoria: document.getElementById("tarefa-categoria").value,
        data_limite: document.getElementById("tarefa-limite")?.value || null,
      };
    case "form-evento":
      return {
        titulo: document.getElementById("evento-titulo").value,
        descricao: document.getElementById("evento-desc").value,
        data_inicio: document.getElementById("evento-inicio").value,
        data_fim: document.getElementById("evento-fim")?.value || null,
      };
    case "form-ciclo":
      return {
        data_inicio: document.getElementById("ciclo-inicio").value,
        data_fim: document.getElementById("ciclo-fim")?.value || null,
        fluxo: document.getElementById("ciclo-fluxo").value,
        humor: document.getElementById("ciclo-humor").value,
        sintomas: document.getElementById("ciclo-sintomas").value,
        notas: document.getElementById("ciclo-notas").value,
      };
    case "form-financa":
      return {
        tipo: document.getElementById("financa-tipo").value,
        descricao: document.getElementById("financa-desc").value,
        valor: parseFloat(document.getElementById("financa-valor").value),
        categoria: document.getElementById("financa-categoria").value,
        data:
          document.getElementById("financa-data").value ||
          new Date().toISOString().split("T")[0],
      };
    case "form-remedio":
      return {
        nome: document.getElementById("remedio-nome").value,
        dosagem: document.getElementById("remedio-dosagem").value,
        frequencia: document.getElementById("remedio-frequencia").value,
        horario: document.getElementById("remedio-horario").value,
      };
    case "form-diario":
      return {
        titulo: document.getElementById("diario-titulo").value,
        conteudo: document.getElementById("diario-conteudo").value,
        humor: document.getElementById("diario-humor").value,
        data:
          document.getElementById("diario-data").value ||
          new Date().toISOString().split("T")[0],
      };
    case "form-habito":
      return {
        nome: document.getElementById("habito-nome").value,
        icone: document.getElementById("habito-icone").value || "⭐",
      };
    case "form-lembrete":
      return {
        texto: document.getElementById("lembrete-texto").value,
        data_hora: document.getElementById("lembrete-data")?.value || null,
      };
    default:
      return {};
  }
}

// ==========================================
// DASHBOARD
// ==========================================
async function loadDashboard() {
  try {
    const data = await api("/api/dashboard");
    const saudacao = getSaudacaoDinamica();
    const greeting = document.getElementById("dashboard-greeting");
    if (greeting) {
      greeting.className = `welcome-card ${saudacao.classe}`;
      greeting.innerHTML = `
        <div class="welcome-decoration">
          <span class="deco-left">${saudacao.emoji}</span>
          <h2>${saudacao.titulo}</h2>
          <p>${saudacao.mensagem}</p>
          <span class="deco-right">🦕</span>
        </div>
      `;
    }
    updateEl("dash-tarefas", data.tarefasPendentes || 0);
    updateEl("dash-agua", `${data.agua?.copos || 0}/${data.agua?.meta || 8}`);
    updateEl("dash-eventos", data.eventosHoje || 0);
    updateEl("dash-lembretes", data.lembretesAtivos || 0);
    let receitas = 0,
      despesas = 0;
    if (data.financasMes) {
      data.financasMes.forEach((f) => {
        if (f.tipo === "receita") receitas += f.total;
        if (f.tipo === "despesa") despesas += f.total;
      });
    }
    const elFinancas = document.getElementById("dash-financas");
    if (elFinancas) {
      elFinancas.innerHTML = `
        <div style="display:flex; gap:1rem; justify-content:center; flex-wrap:wrap; font-size:0.9rem;">
          <span style="color:var(--success)">💚 ${formatMoney(receitas)}</span>
          <span style="color:var(--danger)">💔 ${formatMoney(despesas)}</span>
          <span style="color:var(--accent-gold); font-weight:bold;">💰 ${formatMoney(receitas - despesas)}</span>
        </div>
      `;
    }
  } catch (e) {
    console.error("Erro dashboard:", e);
  }
}

// ==========================================
// TAREFAS
// ==========================================
async function loadTarefas() {
  try {
    const tarefas = await api("/api/tarefas");
    const container = document.getElementById("lista-tarefas");
    if (!container) return;
    if (tarefas.length === 0) {
      container.innerHTML =
        '<p style="text-align:center; color:var(--text-muted); padding:2rem;">Nenhuma tarefa ainda. Adicione sua primeira tarefa acima!</p>';
      return;
    }
    container.innerHTML = tarefas
      .map(
        (t) => `
      <div class="list-item prioridade-${t.prioridade} ${t.concluida ? "completed" : ""}">
        <div class="item-info">
          <div class="item-title">${t.titulo}</div>
          <div class="item-meta">${t.categoria} · ${t.prioridade} ${t.data_limite ? "· até " + formatDate(t.data_limite) : ""}</div>
        </div>
        <button class="btn-small" onclick="toggleTarefa(${t.id}, ${!t.concluida})">${t.concluida ? "↩️" : "✓"}</button>
        <button class="btn-small btn-delete" onclick="deleteTarefa(${t.id})">🗑️</button>
      </div>
    `,
      )
      .join("");
  } catch (e) {
    console.error("Erro tarefas:", e);
  }
}

window.toggleTarefa = async function (id, concluida) {
  try {
    await api(`/api/tarefas/${id}`, "PUT", { concluida });
    loadTarefas();
    if (concluida) {
      somGalope();
      showNotification("Tarefa concluída! 🎉");
    }
  } catch (e) {
    console.error("Erro:", e);
  }
};

window.deleteTarefa = async function (id) {
  if (confirm("Remover esta tarefa?")) {
    somTiro();
    await api(`/api/tarefas/${id}`, "DELETE");
    loadTarefas();
  }
};

// ==========================================
// EVENTOS
// ==========================================
async function loadEventos() {
  try {
    const eventos = await api("/api/eventos");
    const container = document.getElementById("lista-eventos");
    if (!container) return;
    if (eventos.length === 0) {
      container.innerHTML =
        '<p style="text-align:center; color:var(--text-muted); padding:2rem;">Nenhum evento agendado.</p>';
      return;
    }
    container.innerHTML = eventos
      .map(
        (ev) => `
      <div class="list-item">
        <div class="item-info">
          <div class="item-title">${ev.titulo}</div>
          <div class="item-meta">${formatDateTime(ev.data_inicio)} ${ev.descricao ? "· " + ev.descricao : ""}</div>
        </div>
        <button class="btn-small btn-delete" onclick="deleteEvento(${ev.id})">🗑️</button>
      </div>
    `,
      )
      .join("");
  } catch (e) {
    console.error("Erro eventos:", e);
  }
}

window.deleteEvento = async function (id) {
  await api(`/api/eventos/${id}`, "DELETE");
  loadEventos();
};

// ==========================================
// CICLO
// ==========================================
async function loadCiclo() {
  try {
    const ciclos = await api("/api/ciclo");
    const container = document.getElementById("lista-ciclo");
    if (!container) return;
    if (ciclos.length === 0) {
      container.innerHTML =
        '<p style="text-align:center; color:var(--text-muted); padding:2rem;">Nenhum ciclo registrado ainda.</p>';
      return;
    }
    container.innerHTML = ciclos
      .map(
        (c) => `
      <div class="list-item">
        <div class="item-info">
          <div class="item-title">${c.humor} ${formatDate(c.data_inicio)} → ${c.data_fim ? formatDate(c.data_fim) : "Em andamento"}</div>
          <div class="item-meta">Fluxo: ${c.fluxo} ${c.sintomas ? "· " + c.sintomas : ""}</div>
          ${c.notas ? `<div class="item-meta" style="margin-top:0.3rem; font-style:italic;">${c.notas}</div>` : ""}
        </div>
      </div>
    `,
      )
      .join("");
  } catch (e) {
    console.error("Erro ciclo:", e);
  }
}

// ==========================================
// ÁGUA
// ==========================================
var aguaData = { copos: 0, meta: 8 };

async function loadAgua() {
  try {
    aguaData = await api("/api/agua");
    renderAgua();
  } catch (e) {
    console.error("Erro agua", e);
  }
}

function renderAgua() {
  updateEl("agua-count", aguaData.copos);
  updateEl("agua-meta", aguaData.meta);
  const fill = document.getElementById("agua-fill");
  if (fill) {
    const percentage = Math.min((aguaData.copos / aguaData.meta) * 100, 100);
    fill.style.height = percentage + "%";
  }
  const frases = [
    '🦕 "Um dinossauro hidratado é um dinossauro feliz!"',
    ' "Até no deserto a cowgirl bebe água!"',
    '🦖 "T-Rex também precisa de H2O!"',
    '🌵 "O cacto guarda água, você bebe!"',
  ];
  const fraseEl = document.getElementById("agua-frase");
  if (fraseEl) {
    if (aguaData.copos >= aguaData.meta)
      fraseEl.innerHTML = `<span>🎉</span><p>"Meta batida! Você é incrível!"</p>`;
    else
      fraseEl.innerHTML = `<span>💧</span><p>${frases[aguaData.copos % frases.length]}</p>`;
  }
}

window.addAgua = async function (n) {
  aguaData.copos = Math.max(0, aguaData.copos + n);
  await api("/api/agua", "PUT", { copos: aguaData.copos, meta: aguaData.meta });
  renderAgua();
  if (n > 0) {
    playTone(500 + aguaData.copos * 50, 0.1, "sine", 0.2);
    showNotification("+1 copo de água!", "💧");
  }
};

// ==========================================
// FINANÇAS
// ==========================================
async function loadFinancas() {
  try {
    const financas = await api("/api/financas");
    let receitas = 0,
      despesas = 0;
    financas.forEach((f) => {
      if (f.tipo === "receita") receitas += f.valor;
      else despesas += f.valor;
    });
    const resumo = document.getElementById("financas-resumo");
    if (resumo) {
      resumo.innerHTML = `
        <div class="financa-stat"><span class="label">Entradas</span><span class="valor valor-receita">${formatMoney(receitas)}</span></div>
        <div class="financa-stat"><span class="label">Saídas</span><span class="valor valor-despesa">${formatMoney(despesas)}</span></div>
        <div class="financa-stat"><span class="label">Saldo</span><span class="valor valor-saldo">${formatMoney(receitas - despesas)}</span></div>
      `;
    }
    const lista = document.getElementById("lista-financas");
    if (lista) {
      if (financas.length === 0) {
        lista.innerHTML =
          '<p style="text-align:center; color:var(--text-muted); padding:2rem;">Nenhuma transação registrada.</p>';
        return;
      }
      lista.innerHTML = financas
        .map(
          (f) => `
        <div class="list-item">
          <div class="item-info">
            <div class="item-title">${f.tipo === "receita" ? "💚" : ""} ${f.descricao}</div>
            <div class="item-meta">${f.categoria} · ${formatDate(f.data)}</div>
          </div>
          <div style="font-weight:bold; color:${f.tipo === "receita" ? "var(--success)" : "var(--danger)"}">${f.tipo === "receita" ? "+" : "-"} ${formatMoney(f.valor)}</div>
          <button class="btn-small btn-delete" onclick="deleteFinanca(${f.id})">🗑️</button>
        </div>
      `,
        )
        .join("");
    }
  } catch (e) {
    console.error("Erro finanças:", e);
  }
}

window.deleteFinanca = async function (id) {
  await api(`/api/financas/${id}`, "DELETE");
  loadFinancas();
};

// ==========================================
// COMPRAS
// ==========================================
async function loadCompras() {
  try {
    const compras = await api("/api/compras");
    updateEl("compras-total", compras.length);
    updateEl("compras-comprados", compras.filter((c) => c.comprado).length);
    const container = document.getElementById("lista-compras");
    if (!container) return;
    if (compras.length === 0) {
      container.innerHTML =
        '<p style="text-align:center; color:var(--text-muted); padding:2rem;">Lista vazia. Adicione itens acima!</p>';
      return;
    }
    container.innerHTML = compras
      .map(
        (c) => `
      <div class="list-item ${c.comprado ? "completed" : ""}">
        <div class="item-info">
          <div class="item-title">${c.item}</div>
          <div class="item-meta">Qtd: ${c.quantidade}</div>
        </div>
        <button class="btn-small" onclick="toggleCompra(${c.id}, ${!c.comprado})">${c.comprado ? "↩️" : "✓"}</button>
        <button class="btn-small btn-delete" onclick="deleteCompra(${c.id})">️</button>
      </div>
    `,
      )
      .join("");
  } catch (e) {
    console.error("Erro compras:", e);
  }
}

window.toggleCompra = async function (id, comprado) {
  await api(`/api/compras/${id}`, "PUT", { comprado });
  loadCompras();
};

window.deleteCompra = async function (id) {
  await api(`/api/compras/${id}`, "DELETE");
  loadCompras();
};

// ==========================================
// MEDICAMENTOS
// ==========================================
async function loadMedicamentos() {
  try {
    const meds = await api("/api/medicamentos");
    const container = document.getElementById("lista-remedios");
    if (!container) return;
    if (meds.length === 0) {
      container.innerHTML =
        '<p style="text-align:center; color:var(--text-muted); padding:2rem;">Nenhum medicamento cadastrado.</p>';
      return;
    }
    container.innerHTML = meds
      .map(
        (m) => `
      <div class="list-item">
        <div class="item-info">
          <div class="item-title">💊 ${m.nome}</div>
          <div class="item-meta">${m.dosagem} · ${m.frequencia} · ⏰ ${m.horario}</div>
        </div>
        <button class="btn-small btn-delete" onclick="deleteMedicamento(${m.id})">🗑️</button>
      </div>
    `,
      )
      .join("");
  } catch (e) {
    console.error("Erro medicamentos:", e);
  }
}

window.deleteMedicamento = async function (id) {
  await api(`/api/medicamentos/${id}`, "DELETE");
  loadMedicamentos();
};

// ==========================================
// DIÁRIO
// ==========================================
async function loadDiario() {
  try {
    const entradas = await api("/api/diario");
    const container = document.getElementById("lista-diario");
    if (!container) return;
    if (entradas.length === 0) {
      container.innerHTML =
        '<p style="text-align:center; color:var(--text-muted); padding:2rem;">Nenhuma entrada no diário ainda.</p>';
      return;
    }
    container.innerHTML = entradas
      .map(
        (d) => `
      <div class="list-item" style="flex-direction:column; align-items:flex-start;">
        <div style="display:flex; justify-content:space-between; width:100%; margin-bottom:0.5rem;">
          <div style="display:flex; align-items:center; gap:0.8rem;">
            <span style="font-size:1.5rem;">${d.humor}</span>
            <div>
              <div style="font-weight:bold; color:var(--accent-gold);">${d.titulo || "Sem título"}</div>
              <div style="font-size:0.85rem; color:var(--text-muted);">${formatDate(d.data)}</div>
            </div>
          </div>
          <button class="btn-small btn-delete" onclick="deleteDiario(${d.id})">🗑️</button>
        </div>
        <div style="color:var(--text-secondary); white-space:pre-wrap; width:100%;">${d.conteudo}</div>
      </div>
    `,
      )
      .join("");
  } catch (e) {
    console.error("Erro diário:", e);
  }
}

window.deleteDiario = async function (id) {
  if (confirm("Apagar esta entrada?")) {
    await api(`/api/diario/${id}`, "DELETE");
    loadDiario();
  }
};

// ==========================================
// HÁBITOS
// ==========================================
async function loadHabitos() {
  try {
    const habitos = await api("/api/habitos");
    const container = document.getElementById("lista-habitos");
    if (!container) return;
    if (habitos.length === 0) {
      container.innerHTML =
        '<p style="text-align:center; color:var(--text-muted); padding:2rem; grid-column:1/-1;">Nenhum hábito criado ainda.</p>';
      return;
    }
    container.innerHTML = habitos
      .map(
        (h) => `
      <div class="habito-card ${h.hoje ? "feito" : ""}" onclick="toggleHabito(${h.id})">
        <span class="habito-icone">${h.icone}</span>
        <span class="habito-nome">${h.nome}</span>
        <div style="font-size:0.75rem; color:var(--text-muted); margin-top:0.5rem;">${h.hoje ? "✓ Feito" : "⬜ Pendente"}</div>
      </div>
    `,
      )
      .join("");
  } catch (e) {
    console.error("Erro hábitos:", e);
  }
}

window.addHabitoSugestao = function (nome, icone) {
  document.getElementById("habito-nome").value = nome;
  document.getElementById("habito-icone").value = icone;
  document.getElementById("habito-nome").focus();
};

window.toggleHabito = async function (id) {
  await api(`/api/habitos/${id}/toggle`, "POST");
  loadHabitos();
  somGalope();
  showNotification("Hábito registrado!", "✓");
};

// ==========================================
// LEMBRETES
// ==========================================
async function loadLembretes() {
  try {
    const lembretes = await api("/api/lembretes");
    const container = document.getElementById("lista-lembretes");
    if (!container) return;
    if (lembretes.length === 0) {
      container.innerHTML =
        '<p style="text-align:center; color:var(--text-muted); padding:2rem;">Nenhum lembrete criado.</p>';
      return;
    }
    container.innerHTML = lembretes
      .map(
        (l) => `
      <div class="list-item">
        <div class="item-info">
          <div class="item-title">🔔 ${l.texto}</div>
          <div class="item-meta">${l.data_hora ? formatDateTime(l.data_hora) : "Lembrete geral"}</div>
        </div>
        <button class="btn-small" onclick="concluirLembrete(${l.id})">✓</button>
      </div>
    `,
      )
      .join("");
  } catch (e) {
    console.error("Erro lembretes:", e);
  }
}

window.concluirLembrete = async function (id) {
  await api(`/api/lembretes/${id}`, "PUT");
  loadLembretes();
};

// ==========================================
// 💝 CONTADOR DE DIAS JUNTOS
// ==========================================
async function loadDiasJuntos() {
  try {
    const data = await api("/api/dias-juntos");
    const dataInicioEl = document.getElementById("data-inicio-relacionamento");
    const contadorEl = document.getElementById("dias-contador");
    const detalleEl = document.getElementById("dias-detalle");

    if (data.dataInicio) {
      const inicio = new Date(data.dataInicio);
      const hoje = new Date();
      const diffTime = Math.abs(hoje - inicio);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (contadorEl) contadorEl.textContent = diffDays;
      if (dataInicioEl)
        dataInicioEl.textContent = `Desde: ${inicio.toLocaleDateString("pt-BR")}`;

      // Calcular anos, meses e dias
      let anos = hoje.getFullYear() - inicio.getFullYear();
      let meses = hoje.getMonth() - inicio.getMonth();
      let dias = hoje.getDate() - inicio.getDate();

      if (dias < 0) {
        meses--;
        dias += new Date(hoje.getFullYear(), hoje.getMonth(), 0).getDate();
      }
      if (meses < 0) {
        anos--;
        meses += 12;
      }

      if (detalleEl) {
        let texto = `${diffDays} dias de amor!`;
        if (anos > 0) texto += ` (${anos} ano${anos > 1 ? "s" : ""}`;
        if (meses > 0)
          texto += `${anos > 0 ? ", " : ""}${meses} mês${meses > 1 ? "es" : ""}`;
        if (anos > 0 || meses > 0) texto += ")";
        detalleEl.textContent = texto;
      }
    } else {
      if (contadorEl) contadorEl.textContent = "0";
      if (dataInicioEl) dataInicioEl.textContent = "Data não configurada";
      if (detalleEl)
        detalleEl.textContent = 'Clique em "Alterar Data" para começar!';
    }
  } catch (e) {
    console.error("Erro dias juntos:", e);
  }
}

window.mudarDataInicio = function () {
  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.innerHTML = `
    <div class="modal-content">
      <h3>📅 Data de Início do Relacionamento</h3>
      <p style="color:var(--text-secondary); margin-bottom:1rem;">Quando vocês começaram a namorar?</p>
      <input type="date" id="nova-data-inicio" style="width:100%; padding:0.8rem; border-radius:8px; border:1px solid var(--accent-gold); background:var(--bg-primary); color:var(--text-primary);">
      <div class="modal-buttons">
        <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancelar</button>
        <button class="btn btn-primary" onclick="salvarDataInicio()">Salvar</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  // Carregar data atual se existir
  api("/api/dias-juntos").then((data) => {
    if (data.dataInicio) {
      document.getElementById("nova-data-inicio").value = data.dataInicio;
    }
  });
};

window.salvarDataInicio = async function () {
  const novaData = document.getElementById("nova-data-inicio").value;
  if (novaData) {
    await api("/api/dias-juntos", "PUT", { dataInicio: novaData });
    document.querySelector(".modal-overlay").remove();
    loadDiasJuntos();
    showNotification("Data atualizada! 💝", "💝");
  }
};

// ==========================================
// 📸 GALERIA DE FOTOS
// ==========================================
async function loadFotos() {
  try {
    const fotos = await api("/api/fotos");
    const container = document.getElementById("lista-fotos");
    if (!container) return;

    if (fotos.length === 0) {
      container.innerHTML =
        '<p style="text-align:center; color:var(--text-muted); padding:2rem; grid-column:1/-1;">Nenhuma foto ainda. Adicione a primeira!</p>';
      return;
    }

    container.innerHTML = fotos
      .map(
        (f) => `
      <div class="foto-card">
        <button class="foto-delete" onclick="deleteFoto(${f.id})">🗑️</button>
        <img src="${f.imagem}" alt="${f.legenda || "Foto"}">
        ${f.legenda ? `<div class="foto-legenda">${f.legenda}</div>` : ""}
      </div>
    `,
      )
      .join("");
  } catch (e) {
    console.error("Erro fotos:", e);
  }
}

// ====== GALERIA DE FOTOS COM COMPRESSÃO ======
// ====== GALERIA DE FOTOS COM COMPRESSÃO ROBUSTA ======
async function loadFotos() {
  try {
    const fotos = await api("/api/fotos");
    const container = document.getElementById("lista-fotos");
    if (!container) return;

    if (fotos.length === 0) {
      container.innerHTML =
        '<p style="text-align:center; color:var(--text-muted); padding:2rem; grid-column:1/-1;">Nenhuma foto ainda. Adicione a primeira!</p>';
      return;
    }

    container.innerHTML = fotos
      .map(
        (f) => `
      <div class="foto-card">
        <button class="foto-delete" onclick="deleteFoto(${f.id})">🗑️</button>
        <img src="${f.imagem}" alt="${f.legenda || "Foto"}" loading="lazy">
        ${f.legenda ? `<div class="foto-legenda">${f.legenda}</div>` : ""}
      </div>
    `,
      )
      .join("");
  } catch (e) {
    console.error("Erro fotos:", e);
  }
}

// ====== GALERIA DE FOTOS (VERSÃO ÚNICA E DEFINITIVA) ======
async function loadFotos() {
  try {
    const fotos = await api("/api/fotos");
    const container = document.getElementById("lista-fotos");
    if (!container) return;

    if (fotos.length === 0) {
      container.innerHTML =
        '<p style="text-align:center; color:var(--text-muted); padding:2rem; grid-column:1/-1;">Nenhuma foto ainda. Adicione a primeira!</p>';
      return;
    }

    container.innerHTML = fotos
      .map(
        (f) => `
      <div class="foto-card">
        <button class="foto-delete" onclick="deleteFoto(${f.id})">🗑️</button>
        <img src="${f.imagem}" alt="${f.legenda || "Foto"}" loading="lazy">
        ${f.legenda ? `<div class="foto-legenda">${f.legenda}</div>` : ""}
      </div>
    `,
      )
      .join("");
  } catch (e) {
    console.error("Erro fotos:", e);
  }
}

function setupFormFoto() {
  const formFoto = document.getElementById("form-foto");
  if (!formFoto) return;

  formFoto.addEventListener("submit", async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const fileInput = document.getElementById("foto-file");
    const legendaInput = document.getElementById("foto-legenda");
    const file = fileInput.files[0];

    if (!file) {
      showNotification("Selecione uma foto primeiro!", "⚠️");
      return false;
    }

    try {
      showNotification("Enviando foto...", "📸");

      const formData = new FormData();
      formData.append("imagem", file);
      formData.append("legenda", legendaInput.value);

      const response = await fetch("/api/fotos", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao enviar");
      }

      formFoto.reset();
      showNotification("Foto adicionada com sucesso! 🎉", "📸");

      setTimeout(loadFotos, 500);
    } catch (err) {
      console.error("Erro ao enviar foto:", err);
      showNotification("Erro: " + err.message, "❌");
    }

    return false;
  });
}

window.deleteFoto = async function (id) {
  if (confirm("Remover esta foto?")) {
    try {
      await api(`/api/fotos/${id}`, "DELETE");
      loadFotos();
      showNotification("Foto removida!", "🗑️");
    } catch (e) {
      console.error("Erro ao deletar:", e);
    }
  }
};

// Chamar a setup quando o app carregar
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupFormFoto);
} else {
  setupFormFoto();
}

// ==========================================
// ✨ SONHOS DO CASAL
// ==========================================
async function loadSonhos() {
  try {
    const sonhos = await api("/api/sonhos");
    const container = document.getElementById("lista-sonhos");
    if (!container) return;

    if (sonhos.length === 0) {
      container.innerHTML =
        '<p style="text-align:center; color:var(--text-muted); padding:2rem;">Nenhum sonho adicionado ainda. Comece a sonhar!</p>';
      return;
    }

    const categorias = {
      viagem: "✈️",
      casa: "🏠",
      experiencia: "🎯",
      familia: "‍👩‍👧",
      outro: "📦",
    };

    container.innerHTML = sonhos
      .map(
        (s) => `
      <div class="sonho-card sonho-prioridade-${s.prioridade} ${s.realizado ? "realizado" : ""}">
        <div class="sonho-categoria">${categorias[s.categoria] || "📦"}</div>
        <div class="sonho-info">
          <div class="sonho-texto">${s.texto}</div>
          <div class="sonho-meta">${s.categoria} · ${s.prioridade}</div>
        </div>
        <button class="btn-small" onclick="toggleSonho(${s.id}, ${!s.realizado})">${s.realizado ? "↩️" : "✓"}</button>
        <button class="btn-small btn-delete" onclick="deleteSonho(${s.id})">🗑️</button>
      </div>
    `,
      )
      .join("");
  } catch (e) {
    console.error("Erro sonhos:", e);
  }
}

const formSonho = document.getElementById("form-sonho");
if (formSonho) {
  formSonho.addEventListener("submit", async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      somClique();
      await api("/api/sonhos", "POST", {
        texto: document.getElementById("sonho-texto").value,
        categoria: document.getElementById("sonho-categoria").value,
        prioridade: document.getElementById("sonho-prioridade").value,
      });
      formSonho.reset();
      showNotification("Sonho adicionado! ✨", "✨");
      loadSonhos();
    } catch (err) {
      console.error("Erro sonho:", err);
    }
    return false;
  });
}

window.toggleSonho = async function (id, realizado) {
  await api(`/api/sonhos/${id}`, "PUT", { realizado });
  loadSonhos();
  if (realizado) {
    somConquista();
    showNotification("Sonho realizado! 🎉", "🎉");
  }
};

window.deleteSonho = async function (id) {
  if (confirm("Remover este sonho?")) {
    await api(`/api/sonhos/${id}`, "DELETE");
    loadSonhos();
  }
};

// Atualizar loadPageData para incluir as novas páginas
const originalLoadPageData = loadPageData;
loadPageData = function (page) {
  originalLoadPageData(page);
  if (page === "dias-juntos") loadDiasJuntos();
  if (page === "galeria") loadFotos();
  if (page === "sonhos") loadSonhos();
};

console.log(" Funcionalidades do casal carregadas!");

console.log("🤠 DinoWest Ranch FINAL carregado!");
