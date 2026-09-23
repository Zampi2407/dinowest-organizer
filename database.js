const initSqlJs = require("sql.js");
const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "dinowest.db");

module.exports = async function initDatabase() {
  const SQL = await initSqlJs();

  let db;
  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS config (chave TEXT PRIMARY KEY, valor TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS tarefas (id INTEGER PRIMARY KEY AUTOINCREMENT, titulo TEXT NOT NULL, descricao TEXT DEFAULT '', prioridade TEXT DEFAULT 'media', categoria TEXT DEFAULT 'geral', concluida INTEGER DEFAULT 0, data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP, data_limite DATETIME);
    CREATE TABLE IF NOT EXISTS eventos (id INTEGER PRIMARY KEY AUTOINCREMENT, titulo TEXT NOT NULL, descricao TEXT DEFAULT '', data_inicio DATETIME NOT NULL, data_fim DATETIME, cor TEXT DEFAULT '#e91e8c', criado_em DATETIME DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS ciclo (id INTEGER PRIMARY KEY AUTOINCREMENT, data_inicio DATE NOT NULL, data_fim DATE, fluxo TEXT DEFAULT 'medio', sintomas TEXT DEFAULT '', humor TEXT DEFAULT '', notas TEXT DEFAULT '');
    CREATE TABLE IF NOT EXISTS agua (id INTEGER PRIMARY KEY AUTOINCREMENT, data DATE NOT NULL UNIQUE, copos INTEGER DEFAULT 0, meta INTEGER DEFAULT 8);
    CREATE TABLE IF NOT EXISTS financas (id INTEGER PRIMARY KEY AUTOINCREMENT, tipo TEXT NOT NULL, descricao TEXT NOT NULL, valor REAL NOT NULL, categoria TEXT DEFAULT 'outros', data DATE DEFAULT CURRENT_DATE, criado_em DATETIME DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS compras (id INTEGER PRIMARY KEY AUTOINCREMENT, item TEXT NOT NULL, quantidade TEXT DEFAULT '1', comprado INTEGER DEFAULT 0, categoria TEXT DEFAULT 'geral', criado_em DATETIME DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS medicamentos (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL, dosagem TEXT DEFAULT '', frequencia TEXT DEFAULT 'diario', horario TEXT DEFAULT '08:00', ativo INTEGER DEFAULT 1, criado_em DATETIME DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS diario (id INTEGER PRIMARY KEY AUTOINCREMENT, titulo TEXT DEFAULT '', conteudo TEXT NOT NULL, humor TEXT DEFAULT '😊', data DATE DEFAULT CURRENT_DATE, criado_em DATETIME DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS habitos (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL, icone TEXT DEFAULT '⭐', cor TEXT DEFAULT '#e91e8c', ativo INTEGER DEFAULT 1, criado_em DATETIME DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS habitos_log (id INTEGER PRIMARY KEY AUTOINCREMENT, habito_id INTEGER NOT NULL, data DATE NOT NULL, concluido INTEGER DEFAULT 1, FOREIGN KEY (habito_id) REFERENCES habitos(id) ON DELETE CASCADE, UNIQUE(habito_id, data));
    CREATE TABLE IF NOT EXISTS lembretes (id INTEGER PRIMARY KEY AUTOINCREMENT, texto TEXT NOT NULL, data_hora DATETIME, concluido INTEGER DEFAULT 0, criado_em DATETIME DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS fotos (id INTEGER PRIMARY KEY AUTOINCREMENT, legenda TEXT DEFAULT '', data_adicionada DATETIME DEFAULT CURRENT_TIMESTAMP, imagem TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS sonhos (id INTEGER PRIMARY KEY AUTOINCREMENT, texto TEXT NOT NULL, categoria TEXT DEFAULT 'outro', prioridade TEXT DEFAULT 'media', realizado INTEGER DEFAULT 0, criado_em DATETIME DEFAULT CURRENT_TIMESTAMP);
  `);

  // Salvar banco de dados inicial
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);

  return db;
};
