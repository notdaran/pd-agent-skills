import * as fs from 'fs'
import * as path from 'path'
import { renderPng } from '../renderers/playwright-renderer'
import { buildFigmaRenderPlan } from '../renderers/figma-renderer'
import type { FigmaRenderPlan } from '../renderers/figma-renderer'
import { buildPaperRenderPlan } from '../renderers/paper-renderer'
import { templates, templateIds } from '../templates/registry'
import {
  AssetSpecSchema,
  DevInputSchema,
  OutputModeSchema,
  SizeSchema,
} from '../types'
import type { AssetSpec, DevInput, OutputMode, Size } from '../types'

// agent-entry: orchestration helpers for the /feature-demo slash command.
//
// The main agent (Claude in session) drives the conversational loop:
//   1. AskUserQuestion for mode/size
//   2. callClaude with prompts to pick template + write copy
//   3. invoke renderAsset() / buildFigmaPlan() / readFeatureSpec() helpers here
//   4. orchestrate Figma MCP calls (whoami → create_new_file → upload_assets → use_figma)
//   5. classify user feedback, loop
//
// This file does NOT call LLMs or MCPs. Pure node-side helpers + Zod validation.
// Keep it deterministic so the agent can rely on these as primitives.

export const ALLOWED_TEMPLATES = templateIds

export interface AssetAgentInputs {
  featureSpecPath: string
  screenshotPaths: string[]
  size: Size
  mode: OutputMode
  heading: string
  bullets: string[]
  templateId: string
  variation: string
  theme?: 'dark' | 'light'
}

// Read and lightly normalize the feature spec markdown. Used by pick-template
// and write-copy prompts; agent reads, passes string in. Validation enforces
// the path resolves inside the repo to avoid arbitrary file reads.
export function readFeatureSpec(featureSpecPath: string, repoRoot: string): string {
  const abs = path.isAbsolute(featureSpecPath)
    ? featureSpecPath
    : path.resolve(repoRoot, featureSpecPath)
  const rel = path.relative(repoRoot, abs)
  if (rel.startsWith('..') || path.isAbsolute(rel)) {
    throw new Error(`featureSpec path escapes repo root: ${featureSpecPath}`)
  }
  if (!fs.existsSync(abs)) {
    throw new Error(`featureSpec not found: ${abs}`)
  }
  return fs.readFileSync(abs, 'utf-8')
}

// Verify each screenshot path exists. Returns absolute paths.
export function resolveScreenshots(paths: string[], repoRoot: string): string[] {
  if (paths.length === 0 || paths.length > 3) {
    throw new Error(`screenshots must be 1-3 paths, got ${paths.length}`)
  }
  return paths.map((p) => {
    const abs = path.isAbsolute(p) ? p : path.resolve(repoRoot, p)
    if (!fs.existsSync(abs)) {
      throw new Error(`screenshot not found: ${abs}`)
    }
    return abs
  })
}

// Parse a "WIDTHxHEIGHT" string. Returns validated Size or throws.
export function parseSize(input: string, label?: string): Size {
  const m = input.trim().toLowerCase().match(/^(\d+)x(\d+)$/)
  if (!m) throw new Error(`invalid size '${input}'. Expected WIDTHxHEIGHT, e.g. 1600x900`)
  return SizeSchema.parse({
    width: parseInt(m[1], 10),
    height: parseInt(m[2], 10),
    label,
  })
}

// Build a validated AssetSpec from agent-collected inputs. Single source of
// truth for spec shape so renderers always receive Zod-checked data.
export function buildAssetSpec(inputs: AssetAgentInputs): AssetSpec {
  const tpl = templates[inputs.templateId]
  if (!tpl) {
    throw new Error(
      `unknown templateId '${inputs.templateId}'. Known: ${ALLOWED_TEMPLATES.join(', ')}`,
    )
  }
  if (!tpl.variations.includes(inputs.variation)) {
    throw new Error(
      `unknown variation '${inputs.variation}' for template '${inputs.templateId}'. ` +
        `Known: ${tpl.variations.join(', ')}`,
    )
  }
  return AssetSpecSchema.parse({
    size: inputs.size,
    mode: inputs.mode,
    theme: inputs.theme ?? 'dark',
    heading: inputs.heading,
    bullets: inputs.bullets,
    screenshots: inputs.screenshotPaths.map((p) => ({ path: p })),
    templateId: inputs.templateId,
    variation: inputs.variation,
  })
}

// Validate DevInput (free-form text bounded to one-liner; everything else
// must be passed as discrete fields). Used by agent before pick/write step.
export function validateDevInput(raw: unknown): DevInput {
  return DevInputSchema.parse(raw)
}

// Validate output mode string from user input.
export function validateMode(raw: unknown): OutputMode {
  return OutputModeSchema.parse(raw)
}

export type RenderResult =
  | { mode: 'png'; pngPath: string; bytes: number; durationMs: number }
  | { mode: 'figma'; plan: FigmaRenderPlan; planPath: string; codePath: string }
  | { mode: 'paper'; error: string }

// PNG render: writes file to outputs/. Returns absolute path.
export async function renderAssetPng(
  spec: AssetSpec,
  outDir: string,
): Promise<Extract<RenderResult, { mode: 'png' }>> {
  fs.mkdirSync(outDir, { recursive: true })
  const t0 = Date.now()
  const png = await renderPng(spec)
  const dt = Date.now() - t0
  const stackTag = spec.screenshots.length > 1 ? `-stack${spec.screenshots.length}` : ''
  const filename = `${spec.templateId}-${spec.variation}-${spec.theme}${stackTag}.png`
  const pngPath = path.join(outDir, filename)
  fs.writeFileSync(pngPath, png)
  return { mode: 'png', pngPath, bytes: png.length, durationMs: dt }
}

// Figma plan: pure function returns plan + writes plan.json + plugin.js to
// outputs/. Agent (in main context) then runs the MCP orchestration sequence
// using these artifacts.
export function buildAssetFigmaPlan(
  spec: AssetSpec,
  outDir: string,
): Extract<RenderResult, { mode: 'figma' }> {
  fs.mkdirSync(outDir, { recursive: true })
  const plan = buildFigmaRenderPlan(spec)
  const base = `${spec.templateId}-${spec.variation}-${spec.theme}`
  const planPath = path.join(outDir, `${base}-figma-plan.json`)
  const codePath = path.join(outDir, `${base}-figma-plugin.js`)
  fs.writeFileSync(
    planPath,
    JSON.stringify(
      {
        fileName: plan.fileName,
        canvas: plan.canvas,
        screenshotsToUpload: plan.screenshotsToUpload,
        intent: plan.intent,
      },
      null,
      2,
    ),
  )
  fs.writeFileSync(codePath, plan.pluginCode)
  return { mode: 'figma', plan, planPath, codePath }
}

// Paper renderer is not configured. Returns explicit error for agent to
// surface back to user (do NOT silently fall back).
export function buildAssetPaperPlan(
  spec: AssetSpec,
): Extract<RenderResult, { mode: 'paper' }> {
  try {
    buildPaperRenderPlan(spec)
    return { mode: 'paper', error: '' }
  } catch (e) {
    return { mode: 'paper', error: e instanceof Error ? e.message : String(e) }
  }
}

// Single entry point the slash command can call when it has a fully-formed
// AssetSpec. Mode-switches to the correct renderer. PNG is async; Figma is
// synchronous (returns the plan for the agent to execute via MCP).
export async function renderByMode(
  spec: AssetSpec,
  outDir: string,
): Promise<RenderResult> {
  if (spec.mode === 'png') return await renderAssetPng(spec, outDir)
  if (spec.mode === 'figma') return buildAssetFigmaPlan(spec, outDir)
  return buildAssetPaperPlan(spec)
}

// Path to the outputs/ dir relative to this file. Agent uses this so all
// renders land in one place for review.
export const DEFAULT_OUTPUT_DIR = path.resolve(__dirname, '../outputs')

// Surface the prompt file paths so the agent can read + use them as system
// prompts when calling Claude for pick/write/classify steps.
export const PROMPT_PATHS = {
  pickTemplate: path.resolve(__dirname, '../prompts/pick-template.md'),
  writeCopy: path.resolve(__dirname, '../prompts/write-copy.md'),
  classifyFeedback: path.resolve(__dirname, '../prompts/classify-feedback.md'),
}

// ---- Figma session cache ----
// Persist fileKey + planKey across renders so the agent doesn't have to call
// whoami / create_new_file every time. Stored in outputs/.figma-session.json
// (gitignored). Agent decides when to invalidate via user feedback.

export interface FigmaSession {
  fileKey?: string
  fileUrl?: string
  planKey?: string
  lastUsed?: string
}

export const FIGMA_SESSION_PATH = path.resolve(
  __dirname,
  '../outputs/.figma-session.json',
)

export function readFigmaSession(): FigmaSession {
  if (!fs.existsSync(FIGMA_SESSION_PATH)) return {}
  try {
    const raw = fs.readFileSync(FIGMA_SESSION_PATH, 'utf-8')
    return JSON.parse(raw) as FigmaSession
  } catch {
    return {}
  }
}

export function writeFigmaSession(patch: Partial<FigmaSession>): FigmaSession {
  const current = readFigmaSession()
  const next: FigmaSession = {
    ...current,
    ...patch,
    lastUsed: new Date().toISOString(),
  }
  fs.mkdirSync(path.dirname(FIGMA_SESSION_PATH), { recursive: true })
  fs.writeFileSync(FIGMA_SESSION_PATH, JSON.stringify(next, null, 2))
  return next
}

export function clearFigmaSession(): void {
  if (fs.existsSync(FIGMA_SESSION_PATH)) fs.unlinkSync(FIGMA_SESSION_PATH)
}

// Parse a Figma file URL or raw key into a normalized { fileKey, fileUrl }.
// Accepts:
//   - https://www.figma.com/file/ABC123/Name
//   - https://www.figma.com/design/ABC123/Name
//   - ABC123 (raw key, 22 chars alphanumeric)
export function parseFigmaFileKey(input: string): { fileKey: string; fileUrl: string } {
  const trimmed = input.trim()
  const urlMatch = trimmed.match(/figma\.com\/(?:file|design)\/([A-Za-z0-9]+)/)
  if (urlMatch) {
    return { fileKey: urlMatch[1], fileUrl: trimmed }
  }
  if (/^[A-Za-z0-9]{10,}$/.test(trimmed)) {
    return {
      fileKey: trimmed,
      fileUrl: `https://www.figma.com/file/${trimmed}/`,
    }
  }
  throw new Error(
    `Invalid Figma file input: '${input}'. Expected a Figma URL or raw file key.`,
  )
}
