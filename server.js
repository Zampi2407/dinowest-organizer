const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const initDatabase = require("./database");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");

// Carregar variáveis de ambiente
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configurar multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "public/uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Variável global do banco de dados
let db;

function query(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const results = [];
  while (stmt.step()) results.push(stmt.getAsObject());
  stmt.free();
  return results;
}

function run(sql, params = []) {
  db.run(sql, params);
  const idStmt = db.prepare("SELECT last_insert_rowid() as id");
  idStmt.step();
  const lastId = idStmt.getAsObject().id;
  idStmt.free();

  // Salvar banco de dados
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(path.join(__dirname, "dinowest.db"), buffer);

  return { lastInsertRowid: lastId };
}

function get(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const result = stmt.step() ? stmt.getAsObject() : null;
  stmt.free();
  return result;
}

// ==========================================
// ROTAS DA API
// ==========================================

app.get("/api/dashboard", (req, res) => {
  const hoje = new Date().toISOString().split("T")[0];
  const mes = hoje.substring(0, 7);
  const tarefasPendentes = get(
    "SELECT COUNT(*) as c FROM tarefas WHERE concluida = 0",
  ).c;
  const aguaHoje = get("SELECT copos, meta FROM agua WHERE data = ?", [
    hoje,
  ]) || { copos: 0, meta: 8 };
  const eventosHoje = get(
    "SELECT COUNT(*) as c FROM eventos WHERE date(data_inicio) = ?",
    [hoje],
  ).c;
  const financasMes = query(
    'SELECT tipo, SUM(valor) as total FROM financas WHERE strftime("%Y-%m", data) = ? GROUP BY tipo',
    [mes],
  );
  const lembretesAtivos = get(
    "SELECT COUNT(*) as c FROM lembretes WHERE concluido = 0",
  ).c;
  res.json({
    tarefasPendentes,
    agua: aguaHoje,
    eventosHoje,
    financasMes,
    lembretesAtivos,
    dataHoje: hoje,
  });
});

app.get("/api/tarefas", (req, res) =>
  res.json(
    query("SELECT * FROM tarefas ORDER BY concluida ASC, data_criacao DESC"),
  ),
);
app.post("/api/tarefas", (req, res) => {
  const { titulo, descricao, prioridade, categoria, data_limite } = req.body;
  run(
    "INSERT INTO tarefas (titulo, descricao, prioridade, categoria, data_limite) VALUES (?, ?, ?, ?, ?)",
    [
      titulo,
      descricao || "",
      prioridade || "media",
      categoria || "geral",
      data_limite || null,
    ],
  );
  res.json({ message: "OK" });
});
app.put("/api/tarefas/:id", (req, res) => {
  run("UPDATE tarefas SET concluida = ? WHERE id = ?", [
    req.body.concluida ? 1 : 0,
    req.params.id,
  ]);
  res.json({ message: "OK" });
});
app.delete("/api/tarefas/:id", (req, res) => {
  run("DELETE FROM tarefas WHERE id = ?", [req.params.id]);
  res.json({ message: "OK" });
});

app.get("/api/eventos", (req, res) =>
  res.json(query("SELECT * FROM eventos ORDER BY data_inicio ASC")),
);
app.post("/api/eventos", (req, res) => {
  const { titulo, descricao, data_inicio, data_fim, cor } = req.body;
  run(
    "INSERT INTO eventos (titulo, descricao, data_inicio, data_fim, cor) VALUES (?, ?, ?, ?, ?)",
    [titulo, descricao || "", data_inicio, data_fim || null, cor || "#e91e8c"],
  );
  res.json({ message: "OK" });
});
app.delete("/api/eventos/:id", (req, res) => {
  run("DELETE FROM eventos WHERE id = ?", [req.params.id]);
  res.json({ message: "OK" });
});

app.get("/api/ciclo", (req, res) =>
  res.json(query("SELECT * FROM ciclo ORDER BY data_inicio DESC")),
);
app.post("/api/ciclo", (req, res) => {
  const { data_inicio, data_fim, fluxo, sintomas, humor, notas } = req.body;
  run(
    "INSERT INTO ciclo (data_inicio, data_fim, fluxo, sintomas, humor, notas) VALUES (?, ?, ?, ?, ?, ?)",
    [
      data_inicio,
      data_fim || null,
      fluxo || "medio",
      sintomas || "",
      humor || "",
      notas || "",
    ],
  );
  res.json({ message: "OK" });
});

app.get("/api/agua", (req, res) => {
  const hoje = new Date().toISOString().split("T")[0];
  let registro = get("SELECT * FROM agua WHERE data = ?", [hoje]);
  if (!registro) {
    run("INSERT INTO agua (data, copos, meta) VALUES (?, 0, 8)", [hoje]);
    registro = get("SELECT * FROM agua WHERE data = ?", [hoje]);
  }
  res.json(registro);
});
app.put("/api/agua", (req, res) => {
  const hoje = new Date().toISOString().split("T")[0];
  const { copos, meta } = req.body;
  const existente = get("SELECT id FROM agua WHERE data = ?", [hoje]);
  if (existente)
    run("UPDATE agua SET copos = ?, meta = ? WHERE data = ?", [
      copos,
      meta || 8,
      hoje,
    ]);
  else
    run("INSERT INTO agua (data, copos, meta) VALUES (?, ?, ?)", [
      hoje,
      copos,
      meta || 8,
    ]);
  res.json({ message: "OK" });
});

app.get("/api/financas", (req, res) =>
  res.json(query("SELECT * FROM financas ORDER BY data DESC")),
);
app.post("/api/financas", (req, res) => {
  const { tipo, descricao, valor, categoria, data } = req.body;
  run(
    "INSERT INTO financas (tipo, descricao, valor, categoria, data) VALUES (?, ?, ?, ?, ?)",
    [
      tipo,
      descricao,
      valor,
      categoria || "outros",
      data || new Date().toISOString().split("T")[0],
    ],
  );
  res.json({ message: "OK" });
});
app.delete("/api/financas/:id", (req, res) => {
  run("DELETE FROM financas WHERE id = ?", [req.params.id]);
  res.json({ message: "OK" });
});

app.get("/api/compras", (req, res) =>
  res.json(
    query("SELECT * FROM compras ORDER BY comprado ASC, criado_em DESC"),
  ),
);
app.post("/api/compras", (req, res) => {
  const { item, quantidade, categoria } = req.body;
  run("INSERT INTO compras (item, quantidade, categoria) VALUES (?, ?, ?)", [
    item,
    quantidade || "1",
    categoria || "geral",
  ]);
  res.json({ message: "OK" });
});
app.put("/api/compras/:id", (req, res) => {
  run("UPDATE compras SET comprado = ? WHERE id = ?", [
    req.body.comprado ? 1 : 0,
    req.params.id,
  ]);
  res.json({ message: "OK" });
});
app.delete("/api/compras/:id", (req, res) => {
  run("DELETE FROM compras WHERE id = ?", [req.params.id]);
  res.json({ message: "OK" });
});

app.get("/api/medicamentos", (req, res) =>
  res.json(
    query("SELECT * FROM medicamentos WHERE ativo = 1 ORDER BY horario ASC"),
  ),
);
app.post("/api/medicamentos", (req, res) => {
  const { nome, dosagem, frequencia, horario } = req.body;
  run(
    "INSERT INTO medicamentos (nome, dosagem, frequencia, horario) VALUES (?, ?, ?, ?)",
    [nome, dosagem || "", frequencia || "diario", horario || "08:00"],
  );
  res.json({ message: "OK" });
});
app.delete("/api/medicamentos/:id", (req, res) => {
  run("UPDATE medicamentos SET ativo = 0 WHERE id = ?", [req.params.id]);
  res.json({ message: "OK" });
});

app.get("/api/diario", (req, res) =>
  res.json(query("SELECT * FROM diario ORDER BY data DESC, criado_em DESC")),
);
app.post("/api/diario", (req, res) => {
  const { titulo, conteudo, humor, data } = req.body;
  run(
    "INSERT INTO diario (titulo, conteudo, humor, data) VALUES (?, ?, ?, ?)",
    [
      titulo || "",
      conteudo,
      humor || "😊",
      data || new Date().toISOString().split("T")[0],
    ],
  );
  res.json({ message: "OK" });
});
app.delete("/api/diario/:id", (req, res) => {
  run("DELETE FROM diario WHERE id = ?", [req.params.id]);
  res.json({ message: "OK" });
});

app.get("/api/habitos", (req, res) => {
  const habitos = query("SELECT * FROM habitos WHERE ativo = 1");
  const hoje = new Date().toISOString().split("T")[0];
  const logs = query("SELECT * FROM habitos_log WHERE data = ?", [hoje]);
  const logMap = {};
  logs.forEach((l) => (logMap[l.habito_id] = l.concluido));
  habitos.forEach((h) => (h.hoje = logMap[h.id] || 0));
  res.json(habitos);
});
app.post("/api/habitos", (req, res) => {
  const { nome, icone, cor } = req.body;
  run("INSERT INTO habitos (nome, icone, cor) VALUES (?, ?, ?)", [
    nome,
    icone || "⭐",
    cor || "#e91e8c",
  ]);
  res.json({ message: "OK" });
});
app.post("/api/habitos/:id/toggle", (req, res) => {
  const hoje = new Date().toISOString().split("T")[0];
  const habitoId = req.params.id;
  const existente = get(
    "SELECT * FROM habitos_log WHERE habito_id = ? AND data = ?",
    [habitoId, hoje],
  );
  if (existente) {
    const novo = existente.concluido ? 0 : 1;
    run("UPDATE habitos_log SET concluido = ? WHERE id = ?", [
      novo,
      existente.id,
    ]);
  } else {
    run(
      "INSERT INTO habitos_log (habito_id, data, concluido) VALUES (?, ?, 1)",
      [habitoId, hoje],
    );
  }
  res.json({ message: "OK" });
});

app.get("/api/dias-juntos", (req, res) => {
  const dataInicio = get("SELECT valor FROM config WHERE chave = ?", [
    "data_inicio_relacionamento",
  ]);
  res.json({ dataInicio: dataInicio ? dataInicio.valor : null });
});
app.put("/api/dias-juntos", (req, res) => {
  const { dataInicio } = req.body;
  const existente = get("SELECT chave FROM config WHERE chave = ?", [
    "data_inicio_relacionamento",
  ]);
  if (existente)
    run("UPDATE config SET valor = ? WHERE chave = ?", [
      dataInicio,
      "data_inicio_relacionamento",
    ]);
  else
    run("INSERT INTO config (chave, valor) VALUES (?, ?)", [
      "data_inicio_relacionamento",
      dataInicio,
    ]);
  res.json({ message: "Data atualizada!" });
});

app.get("/api/fotos", (req, res) => {
  try {
    const fotos = query("SELECT * FROM fotos ORDER BY data_adicionada DESC");
    res.json(fotos);
  } catch (err) {
    console.error("Erro ao listar fotos:", err);
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/fotos", upload.single("imagem"), async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ error: "Nenhuma imagem enviada" });
    const legenda = req.body.legenda || "";
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "dinowest-fotos",
      transformation: [
        { width: 800, crop: "limit" },
        { quality: "auto", fetch_format: "auto" },
      ],
    });
    run("INSERT INTO fotos (legenda, imagem) VALUES (?, ?)", [
      legenda,
      result.secure_url,
    ]);
    try {
      fs.unlinkSync(req.file.path);
    } catch (e) {}
    res.json({ message: "Foto adicionada!", url: result.secure_url });
  } catch (err) {
    console.error("Erro no upload:", err);
    res.status(500).json({ error: "Erro interno", details: err.message });
  }
});
app.delete("/api/fotos/:id", (req, res) => {
  const foto = get("SELECT imagem FROM fotos WHERE id = ?", [req.params.id]);
  if (foto && foto.imagem) {
    const urlParts = foto.imagem.split("/");
    const publicId =
      "dinowest-fotos/" + urlParts[urlParts.length - 1].split(".")[0];
    cloudinary.uploader.destroy(publicId).catch(() => {});
  }
  run("DELETE FROM fotos WHERE id = ?", [req.params.id]);
  res.json({ message: "OK" });
});

app.get("/api/sonhos", (req, res) =>
  res.json(
    query("SELECT * FROM sonhos ORDER BY realizado ASC, criado_em DESC"),
  ),
);
app.post("/api/sonhos", (req, res) => {
  const { texto, categoria, prioridade } = req.body;
  const result = run(
    "INSERT INTO sonhos (texto, categoria, prioridade) VALUES (?, ?, ?)",
    [texto, categoria || "outro", prioridade || "media"],
  );
  res.json({ id: result.lastInsertRowid, message: "Sonho adicionado!" });
});
app.put("/api/sonhos/:id", (req, res) => {
  run("UPDATE sonhos SET realizado = ? WHERE id = ?", [
    req.body.realizado ? 1 : 0,
    req.params.id,
  ]);
  res.json({ message: "OK" });
});
app.delete("/api/sonhos/:id", (req, res) => {
  run("DELETE FROM sonhos WHERE id = ?", [req.params.id]);
  res.json({ message: "OK" });
});

app.get("/api/lembretes", (req, res) =>
  res.json(
    query("SELECT * FROM lembretes WHERE concluido = 0 ORDER BY data_hora ASC"),
  ),
);
app.post("/api/lembretes", (req, res) => {
  const { texto, data_hora } = req.body;
  run("INSERT INTO lembretes (texto, data_hora) VALUES (?, ?)", [
    texto,
    data_hora || null,
  ]);
  res.json({ message: "OK" });
});
app.put("/api/lembretes/:id", (req, res) => {
  run("UPDATE lembretes SET concluido = 1 WHERE id = ?", [req.params.id]);
  res.json({ message: "OK" });
});

// SPA fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ==========================================
// INICIALIZAÇÃO DO SERVIDOR (ÚNICA VEZ!)
// ==========================================
initDatabase()
  .then((database) => {
    db = database;
    console.log("🤠 Banco de dados inicializado!");
    console.log(
      `☁️ Cloudinary configurado: ${process.env.CLOUDINARY_CLOUD_NAME ? "SIM" : "NÃO"}`,
    );

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🦕🤠 DinoWest Ranch rodando com sucesso na porta ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Erro ao iniciar o banco de dados:", err);
    process.exit(1);
  });
