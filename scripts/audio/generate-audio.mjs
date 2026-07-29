#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config as loadEnv } from 'dotenv';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '../..');
const INPUT_PATH = path.join(__dirname, 'scripts.json');
const REPORT_DIR = path.join(__dirname, 'reports');
const OUTPUT_ROOT = path.join(ROOT, 'public', 'audio');
const MODEL_ID = 'eleven_multilingual_v2';
const OUTPUT_FORMAT = 'mp3_44100_128';
const ALLOWED_CATEGORIES = new Set(['rituals', 'announcements', 'practice', 'knowledge']);
const ALLOWED_VOICE_KEYS = new Set(['stability', 'similarityBoost', 'style', 'useSpeakerBoost', 'speed']);

loadEnv({ path: path.join(ROOT, '.env') });

function fail(message) {
  throw new Error(message);
}

function parseArgs(argv) {
  let only = null;
  let force = false;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--force') {
      force = true;
      continue;
    }
    if (arg === '--only') {
      const value = argv[i + 1];
      if (!value || value.startsWith('--')) {
        fail('Missing value for --only.');
      }
      if (only) {
        fail('Specify --only at most once.');
      }
      only = value;
      i += 1;
      continue;
    }
    fail(`Unknown argument: ${arg}`);
  }

  return { only, force };
}

function isSafeOutputFilename(filename) {
  return typeof filename === 'string' && /^[a-z0-9][a-z0-9._-]*\.mp3$/i.test(filename) && !filename.includes('/') && !filename.includes('\\') && !filename.includes('..');
}

function isPlainObject(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function validateVoiceSettings(entryId, voiceSettings) {
  if (!isPlainObject(voiceSettings)) {
    fail(`Entry "${entryId}" must include a voiceSettings object.`);
  }

  for (const key of Object.keys(voiceSettings)) {
    if (!ALLOWED_VOICE_KEYS.has(key)) {
      fail(`Entry "${entryId}" uses unsupported voice setting "${key}".`);
    }
  }

  const normalized = {};

  for (const [key, value] of Object.entries(voiceSettings)) {
    if (key === 'useSpeakerBoost') {
      if (typeof value !== 'boolean') {
        fail(`Entry "${entryId}" voice setting "useSpeakerBoost" must be boolean.`);
      }
      normalized[key] = value;
      continue;
    }

    if (typeof value !== 'number' || !Number.isFinite(value)) {
      fail(`Entry "${entryId}" voice setting "${key}" must be a finite number.`);
    }
    if (value < 0) {
      fail(`Entry "${entryId}" voice setting "${key}" must be non-negative.`);
    }
    normalized[key] = value;
  }

  return normalized;
}

function validateScriptEntry(raw, index) {
  if (!isPlainObject(raw)) {
    fail(`Script entry at index ${index} must be an object.`);
  }

  const { id, text, outputFilename, category, language, voiceSettings } = raw;

  if (typeof id !== 'string' || !id.trim()) {
    fail(`Script entry at index ${index} is missing a non-empty id.`);
  }
  if (typeof text !== 'string' || !text.trim()) {
    fail(`Script entry "${id}" must include non-empty text.`);
  }
  if (typeof outputFilename !== 'string' || !isSafeOutputFilename(outputFilename)) {
    fail(`Script entry "${id}" has an unsafe outputFilename.`);
  }
  if (typeof category !== 'string' || !ALLOWED_CATEGORIES.has(category)) {
    fail(`Script entry "${id}" uses an unsupported category.`);
  }
  if (typeof language !== 'string' || !language.trim()) {
    fail(`Script entry "${id}" must include a non-empty language.`);
  }

  return {
    id: id.trim(),
    text: text.trim(),
    outputFilename: outputFilename.trim(),
    category,
    language: language.trim(),
    voiceSettings: validateVoiceSettings(id.trim(), voiceSettings),
  };
}

async function readScripts() {
  let raw;
  try {
    raw = await fs.readFile(INPUT_PATH, 'utf8');
  } catch (error) {
    fail(`Unable to read scripts manifest at ${INPUT_PATH}: ${error instanceof Error ? error.message : String(error)}`);
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    fail(`scripts.json is invalid JSON: ${error instanceof Error ? error.message : String(error)}`);
  }

  if (!isPlainObject(parsed) || !Array.isArray(parsed.scripts)) {
    fail('scripts.json must contain a top-level "scripts" array.');
  }

  const scripts = parsed.scripts.map((entry, index) => validateScriptEntry(entry, index));
  const ids = new Set();
  for (const entry of scripts) {
    if (ids.has(entry.id)) {
      fail(`Duplicate script id found: ${entry.id}`);
    }
    ids.add(entry.id);
  }
  return scripts;
}

function resolveOutputPath(category, outputFilename) {
  const categoryDir = path.join(OUTPUT_ROOT, category);
  const resolved = path.resolve(categoryDir, outputFilename);
  const expectedPrefix = path.resolve(categoryDir) + path.sep;
  if (!resolved.startsWith(expectedPrefix)) {
    fail(`Unsafe output path resolved for ${category}/${outputFilename}.`);
  }
  return resolved;
}

async function streamToBuffer(stream) {
  const reader = stream.getReader();
  const chunks = [];
  let total = 0;

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    if (value) {
      chunks.push(Buffer.from(value));
      total += value.byteLength;
    }
  }

  return Buffer.concat(chunks, total);
}

async function writeAtomicFile(filePath, buffer) {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
  const tempPath = `${filePath}.tmp-${process.pid}-${Date.now()}`;
  await fs.writeFile(tempPath, buffer);
  await fs.rename(tempPath, filePath);
}

async function main() {
  const { only, force } = parseArgs(process.argv.slice(2));
  const scripts = await readScripts();
  const selected = only ? scripts.filter(script => script.id === only) : scripts;

  if (only && selected.length === 0) {
    fail(`Requested --only ${only} does not exist in scripts/audio/scripts.json.`);
  }

  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
  const voiceId = process.env.ELEVENLABS_VOICE_ID?.trim();
  if (!apiKey) {
    fail('ELEVENLABS_API_KEY is missing. Create a local .env file before generating audio.');
  }
  if (!voiceId) {
    fail('ELEVENLABS_VOICE_ID is missing. Create a local .env file before generating audio.');
  }

  const client = new ElevenLabsClient({ apiKey });
  const report = {
    timestamp: new Date().toISOString(),
    selectedVoiceId: voiceId,
    model: MODEL_ID,
    forceMode: force,
    generatedFiles: [],
    skippedFiles: [],
    failedFiles: [],
    charactersSubmitted: 0,
    outputPaths: [],
  };

  for (const entry of selected) {
    const outputPath = resolveOutputPath(entry.category, entry.outputFilename);
    report.outputPaths.push(outputPath);

    try {
      await fs.access(outputPath);
      if (!force) {
        report.skippedFiles.push({
          id: entry.id,
          outputFilename: entry.outputFilename,
          category: entry.category,
          outputPath,
          reason: 'exists',
        });
        continue;
      }
    } catch {
      // File does not exist, continue.
    }

    try {
      const audioStream = await client.textToSpeech.convert(voiceId, {
        text: entry.text,
        modelId: MODEL_ID,
        outputFormat: OUTPUT_FORMAT,
        voiceSettings: entry.voiceSettings,
      });
      const buffer = await streamToBuffer(audioStream);
      await writeAtomicFile(outputPath, buffer);
      report.generatedFiles.push({
        id: entry.id,
        outputFilename: entry.outputFilename,
        category: entry.category,
        outputPath,
        characters: entry.text.length,
      });
      report.charactersSubmitted += entry.text.length;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      report.failedFiles.push({
        id: entry.id,
        outputFilename: entry.outputFilename,
        category: entry.category,
        outputPath,
        error: message,
      });
      console.error(`Failed to generate "${entry.id}": ${message}`);
    }
  }

  await fs.mkdir(REPORT_DIR, { recursive: true });
  const timestampSlug = report.timestamp.replace(/[:.]/g, '-');
  const reportPath = path.join(REPORT_DIR, `${timestampSlug}.json`);
  await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);

  console.log(JSON.stringify({
    reportPath,
    generated: report.generatedFiles.length,
    skipped: report.skippedFiles.length,
    failed: report.failedFiles.length,
    charactersSubmitted: report.charactersSubmitted,
    forceMode: force,
  }, null, 2));

  if (report.failedFiles.length > 0) {
    fail(`Audio generation completed with ${report.failedFiles.length} failure(s).`);
  }
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
