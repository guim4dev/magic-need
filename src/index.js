#!/usr/bin/env node
/**
 * magic-need CLI
 * Registra necessidades de ferramentas/dados que o agente identifica
 * Uso: magic-need "descrição da necessidade"
 */

const fs = require('fs');
const path = require('path');

// Determina diretório de dados (preferência: ~/.magic-need, fallback: ./data)
function getDataDir() {
  const homeDir = require('os').homedir();
  const globalDataDir = path.join(homeDir, '.magic-need');
  
  // Se estiver instalado globalmente ou ~/.magic-need existir, usa lá
  if (process.env.MAGIC_NEED_DATA || fs.existsSync(globalDataDir)) {
    return globalDataDir;
  }
  
  // Fallback para diretório local (desenvolvimento)
  return path.join(process.cwd(), 'data');
}

const DATA_DIR = getDataDir();
const DATA_FILE = path.join(DATA_DIR, 'needs.json');

// Garante que diretório existe
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Carrega dados existentes
function loadNeeds() {
  if (!fs.existsSync(DATA_FILE)) {
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return [];
  }
}

// Salva dados
function saveNeeds(needs) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(needs, null, 2));
}

// Gera ID curto
function generateId() {
  return Math.random().toString(36).substring(2, 8);
}

// Comando: add
function addNeed(description) {
  const needs = loadNeeds();
  const need = {
    id: generateId(),
    description: description.trim(),
    createdAt: new Date().toISOString(),
    status: 'pending',
    category: inferCategory(description)
  };
  needs.push(need);
  saveNeeds(needs);
  console.log(`✅ Need registrado: #${need.id}`);
  console.log(`   "${need.description}"`);
  return need.id;
}

// Infer categoria baseada no texto
function inferCategory(description) {
  const lower = description.toLowerCase();
  if (lower.includes('api') || lower.includes('endpoint')) return 'integration';
  if (lower.includes('metric') || lower.includes('log') || lower.includes('monitor')) return 'observability';
  if (lower.includes('deploy') || lower.includes('pipeline') || lower.includes('ci')) return 'devops';
  if (lower.includes('user') || lower.includes('auth') || lower.includes('login')) return 'auth';
  if (lower.includes('database') || lower.includes('db') || lower.includes('query')) return 'database';
  if (lower.includes('file') || lower.includes('storage') || lower.includes('upload')) return 'storage';
  return 'general';
}

// Comando: list
function listNeeds() {
  const needs = loadNeeds();
  if (needs.length === 0) {
    console.log('📭 Nenhum need registrado ainda.');
    return;
  }
  
  console.log(`📋 ${needs.length} need(s) registrado(s):\n`);
  needs.forEach(n => {
    const date = new Date(n.createdAt).toLocaleDateString('pt-BR');
    const status = n.status === 'pending' ? '⏳' : '✅';
    console.log(`${status} #${n.id} [${n.category}] (${date})`);
    console.log(`   ${n.description}\n`);
  });
}

// Comando: report (para cronjob)
function generateReport() {
  const needs = loadNeeds();
  const pending = needs.filter(n => n.status === 'pending');
  
  if (pending.length === 0) {
    return null;
  }
  
  // Agrupa por categoria
  const byCategory = {};
  pending.forEach(n => {
    if (!byCategory[n.category]) byCategory[n.category] = [];
    byCategory[n.category].push(n);
  });
  
  // Formata relatório
  let report = `🪄 **Magic Need Report** — ${pending.length} pendente(s)\n\n`;
  
  Object.entries(byCategory).forEach(([cat, items]) => {
    const emoji = getCategoryEmoji(cat);
    report += `${emoji} **${cat.toUpperCase()}** (${items.length})\n`;
    items.forEach(n => {
      report += `  • ${n.description}\n`;
    });
    report += '\n';
  });
  
  report += `_Total de needs registrados: ${needs.length} | Gerado em: ${new Date().toLocaleString('pt-BR')}_`;
  
  return report;
}

function getCategoryEmoji(cat) {
  const emojis = {
    integration: '🔌',
    observability: '📊',
    devops: '🚀',
    auth: '🔐',
    database: '🗄️',
    storage: '📁',
    general: '📝'
  };
  return emojis[cat] || '📝';
}

// CLI
const args = process.argv.slice(2);
const command = args[0];

// Se não houver args, ou o primeiro arg não é um comando conhecido, trata como descrição
const knownCommands = ['add', 'list', 'report', 'clear', '--help', '-h'];
const isCommand = command && knownCommands.includes(command);

if (!isCommand) {
  // Descrição passada diretamente
  const description = args.join(' ');
  if (!description) {
    console.log('Uso: magic-need "descrição da necessidade"');
    process.exit(1);
  }
  addNeed(description);
} else if (command === 'add') {
  const description = args.slice(1).join(' ');
  if (!description) {
    console.log('Uso: magic-need add "descrição da necessidade"');
    process.exit(1);
  }
  addNeed(description);
} else if (command === 'list') {
  listNeeds();
} else if (command === 'report') {
  const report = generateReport();
  if (report) {
    console.log(report);
  } else {
    console.log('NO_REPORT');
  }
} else if (command === 'clear') {
  const needs = loadNeeds();
  const pending = needs.filter(n => n.status === 'pending');
  if (pending.length === 0) {
    console.log('Nenhum need pendente para limpar.');
  } else {
    needs.forEach(n => {
      if (n.status === 'pending') n.status = 'archived';
    });
    saveNeeds(needs);
    console.log(`🗑️ ${pending.length} need(s) arquivado(s).`);
  }
} else {
  console.log(`
🪄 magic-need CLI

Uso:
  magic-need "descrição"     Registra uma nova necessidade
  magic-need list            Lista todas as necessidades
  magic-need report          Gera relatório para o cronjob
  magic-need clear           Arquiva needs pendentes

O agente pode usar isso quando identificar que precisa de
uma ferramenta/dado que não tem disponível.
  `);
}
