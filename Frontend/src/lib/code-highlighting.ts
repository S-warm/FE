import type { HighlighterCore } from "@shikijs/types"

const CODE_THEME = "dark-plus"
const SHIKI_SUPPORTED_LANGUAGES = {
  tsx: () => import("@shikijs/langs/tsx"),
  ts: () => import("@shikijs/langs/typescript"),
  js: () => import("@shikijs/langs/javascript"),
  html: () => import("@shikijs/langs/html"),
  css: () => import("@shikijs/langs/css"),
  json: () => import("@shikijs/langs/json"),
} as const

type ShikiSupportedLanguage = keyof typeof SHIKI_SUPPORTED_LANGUAGES

let highlighterPromise: Promise<HighlighterCore> | null = null
const loadedLanguages = new Set<ShikiSupportedLanguage>()
const highlightResultCache = new Map<
  string,
  Promise<{
    html: string
    language: string
    languageLabel: string
    formattedCode: string
  }>
>()

export {
  formatCodeForDisplay,
  formatCodeLanguageLabel,
  guessCodeLanguage,
} from "@/lib/code-formatting"
import {
  formatCodeForDisplay,
  formatCodeLanguageLabel,
  guessCodeLanguage,
} from "@/lib/code-formatting"

function isShikiSupportedLanguage(language: string): language is ShikiSupportedLanguage {
  return language in SHIKI_SUPPORTED_LANGUAGES
}

async function getHighlighter(): Promise<HighlighterCore> {
  if (!highlighterPromise) {
    highlighterPromise = (async () => {
      const [{ createHighlighterCore }, { createJavaScriptRegexEngine }, themeModule] =
        await Promise.all([
          import("@shikijs/core"),
          import("@shikijs/engine-javascript"),
          import("@shikijs/themes/dark-plus"),
        ])

      return createHighlighterCore({
        engine: createJavaScriptRegexEngine(),
        themes: [themeModule.default],
      })
    })()
  }

  return highlighterPromise
}

async function ensureLanguageLoaded(language: ShikiSupportedLanguage) {
  if (loadedLanguages.has(language)) {
    return
  }

  const [highlighter, languageModule] = await Promise.all([
    getHighlighter(),
    SHIKI_SUPPORTED_LANGUAGES[language](),
  ])

  await highlighter.loadLanguage(languageModule.default)
  loadedLanguages.add(language)
}

export async function highlightCodeToHtml(code: string) {
  const formattedCode = formatCodeForDisplay(code)
  const language = guessCodeLanguage(formattedCode)

  if (!isShikiSupportedLanguage(language)) {
    return {
      html: "",
      language,
      languageLabel: formatCodeLanguageLabel(language),
      formattedCode,
    }
  }

  const cacheKey = `${language}:${formattedCode}`
  const cachedResult = highlightResultCache.get(cacheKey)
  if (cachedResult) {
    return cachedResult
  }

  const resultPromise = (async () => {
    await ensureLanguageLoaded(language)
    const highlighter = await getHighlighter()
    const html = highlighter.codeToHtml(formattedCode, {
      lang: language,
      theme: CODE_THEME,
    })

    return {
      html,
      language,
      languageLabel: formatCodeLanguageLabel(language),
      formattedCode,
    }
  })()

  highlightResultCache.set(cacheKey, resultPromise)

  try {
    return await resultPromise
  } catch (error) {
    highlightResultCache.delete(cacheKey)
    throw error
  }
}
