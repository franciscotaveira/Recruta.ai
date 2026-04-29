import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'recrutaria-rag-test-'));
const settingsPath = path.join(tempRoot, 'ai-rag.json');
const corpusPath = path.join(tempRoot, 'rag-corpus.json');

process.env.AI_RAG_SETTINGS_PATH = settingsPath;
process.env.AI_RAG_CORPUS_PATH = corpusPath;

const { updateAIRagSettings, getAIRagSettings } = await import('../admin/ai-rag.js');
const { clearRAGCache, getRAGDiagnostics, retrieveRAGContext } = await import('../ai/rag.js');

await fs.writeFile(
  corpusPath,
  JSON.stringify(
    [
      {
        id: 'doc-1',
        title: 'Triagem com evidência',
        source: 'test',
        tags: ['triagem', 'evidencia'],
        text: 'Perguntas devem seguir formato Situacao Acao Resultado para capturar evidencia prática.',
      },
      {
        id: 'doc-2',
        title: 'Entrevista por áudio',
        source: 'test',
        tags: ['audio', 'entrevista'],
        text: 'Respostas por audio reduzem tempo de processo e facilitam escalabilidade inicial.',
      },
    ],
    null,
    2
  ),
  'utf8'
);

test('RAG settings sanitize applies limits', async () => {
  await updateAIRagSettings(
    {
      topK: 999,
      minScore: -10,
      maxContextChars: 99999,
      cacheTtlSeconds: 1,
    },
    'tester'
  );

  const settings = await getAIRagSettings();
  assert.equal(settings.topK, 10);
  assert.equal(settings.minScore, 0);
  assert.equal(settings.maxContextChars, 5000);
  assert.equal(settings.cacheTtlSeconds, 30);
});

test('retrieveRAGContext returns contextual snippets and citations', async () => {
  await updateAIRagSettings(
    {
      enabled: true,
      topK: 2,
      minScore: 1,
      includeCitations: true,
      maxContextChars: 1000,
      cacheTtlSeconds: 300,
    },
    'tester'
  );

  clearRAGCache();
  const result = await retrieveRAGContext('triagem com evidencia em audio', 'analysis');

  assert.equal(result.used, true);
  assert.ok(result.context.includes('Fonte:'));
  assert.ok(result.selected.length >= 1);
  assert.ok(result.citations.length >= 1);
});

test('retrieveRAGContext uses cache on repeated query', async () => {
  await updateAIRagSettings({ enabled: true, cacheTtlSeconds: 300 }, 'tester');
  clearRAGCache();

  await retrieveRAGContext('entrevista por audio', 'question_generation');
  await retrieveRAGContext('entrevista por audio', 'question_generation');

  const diagnostics = await getRAGDiagnostics();
  assert.ok(diagnostics.cacheHitRate > 0);
});

test('retrieveRAGContext disables retrieval when setting is off', async () => {
  await updateAIRagSettings({ enabled: false }, 'tester');

  const result = await retrieveRAGContext('triagem', 'analysis');
  assert.equal(result.used, false);
  assert.equal(result.context, '');
});

test.after(async () => {
  await fs.rm(tempRoot, { recursive: true, force: true });
});
