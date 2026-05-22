type HighlightResult = {
  language: string
  languageLabel: string
  formattedCode: string
}

const highlightCache = new Map<string, HighlightResult>()
const inflightHighlightCache = new Map<string, Promise<HighlightResult>>()

function looksLikeJson(code: string) {
  const trimmed = code.trim()

  if (!trimmed) {
    return false
  }

  if (!(trimmed.startsWith("{") || trimmed.startsWith("["))) {
    return false
  }

  try {
    JSON.parse(trimmed)
    return true
  } catch {
    return false
  }
}

export function guessCodeLanguage(code: string) {
  const trimmed = code.trim()

  if (!trimmed) {
    return "text"
  }

  if (
    /className=|<\/?[A-Z][\w-]*|use[A-Z]\w+\(|export default|return \(|<>\s*$/m.test(trimmed)
  ) {
    return "tsx"
  }

  if (/<\/?[a-z][\w-]*[\s/>]/.test(trimmed)) {
    return "html"
  }

  if (looksLikeJson(trimmed)) {
    return "json"
  }

  if (/@media|^\s*[.#]?[\w-]+\s*\{|\bdisplay:\s*|\bcolor:\s*/m.test(trimmed)) {
    return "css"
  }

  if (/\binterface\b|\btype\b|\benum\b|:\s*(string|number|boolean|React\.)|\bas const\b/.test(trimmed)) {
    return "ts"
  }

  if (/\bconst\b|\blet\b|\bfunction\b|=>|\bimport\b|\bexport\b/.test(trimmed)) {
    return "js"
  }

  return "text"
}

export function formatCodeLanguageLabel(language: string) {
  switch (language) {
    case "tsx":
      return "TSX"
    case "ts":
      return "TypeScript"
    case "js":
      return "JavaScript"
    case "html":
      return "HTML"
    case "css":
      return "CSS"
    case "json":
      return "JSON"
    default:
      return "Plain text"
  }
}

function formatCssForDisplay(code: string) {
  const compact = code.replace(/\s+/g, " ").trim()

  return compact
    .replace(/\s*\{\s*/g, " {\n  ")
    .replace(/;\s*/g, ";\n  ")
    .replace(/\s*\}\s*/g, "\n}")
    .replace(/\n {2}\n}/g, "\n}")
    .trim()
}

export function formatCodeForDisplay(code: string) {
  const language = guessCodeLanguage(code)

  if (language === "css") {
    return formatCssForDisplay(code)
  }

  return code
}

export async function highlightCodeToHtml(code: string) {
  const formattedCode = formatCodeForDisplay(code)
  const language = guessCodeLanguage(formattedCode)
  const cacheKey = `${language}::${formattedCode}`
  const cachedResult = highlightCache.get(cacheKey)

  if (cachedResult) {
    return cachedResult
  }

  const inflightResult = inflightHighlightCache.get(cacheKey)
  if (inflightResult) {
    return inflightResult
  }

  const highlightTask = Promise.resolve().then(() => {
    const result = {
      language,
      languageLabel: formatCodeLanguageLabel(language),
      formattedCode,
    }

    highlightCache.set(cacheKey, result)
    inflightHighlightCache.delete(cacheKey)

    return result
  }).catch((error) => {
    inflightHighlightCache.delete(cacheKey)
    throw error
  })

  inflightHighlightCache.set(cacheKey, highlightTask)

  return highlightTask
}
