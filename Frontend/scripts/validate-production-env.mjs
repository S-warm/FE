import fs from "node:fs"
import path from "node:path"

const projectRoot = process.cwd()
const envPath = path.join(projectRoot, ".env.production")

function parseEnvFile(contents) {
  return contents
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .reduce((acc, line) => {
      const separatorIndex = line.indexOf("=")
      if (separatorIndex === -1) {
        return acc
      }

      const key = line.slice(0, separatorIndex).trim()
      const value = line.slice(separatorIndex + 1).trim()
      acc[key] = value
      return acc
    }, {})
}

function fail(messages) {
  console.error("Production env preflight failed:\n")
  messages.forEach((message) => {
    console.error(`- ${message}`)
  })
  process.exit(1)
}

if (!fs.existsSync(envPath)) {
  fail([
    ".env.production file is missing.",
    "Create Frontend/.env.production before running the production build.",
  ])
}

const env = parseEnvFile(fs.readFileSync(envPath, "utf8"))
const errors = []

const apiBaseUrl = env.VITE_API_BASE_URL ?? ""
const defaultUserId = env.VITE_DEFAULT_USER_ID ?? ""
const accessToken = env.VITE_API_ACCESS_TOKEN ?? ""

if (!apiBaseUrl) {
  errors.push("VITE_API_BASE_URL is required.")
} else {
  if (apiBaseUrl.startsWith("/")) {
    if (!apiBaseUrl.startsWith("/api")) {
      errors.push("Relative VITE_API_BASE_URL must start with /api.")
    }
  } else {
    try {
      const parsed = new URL(apiBaseUrl)
      const host = parsed.hostname.toLowerCase()

      if (host === "localhost" || host === "127.0.0.1" || host === "::1") {
        errors.push("VITE_API_BASE_URL still points to localhost.")
      }

      if (apiBaseUrl.includes("XX.XX")) {
        errors.push("VITE_API_BASE_URL still contains placeholder host text.")
      }
    } catch {
      errors.push("VITE_API_BASE_URL must be a valid absolute URL or start with /api.")
    }
  }
}

if (!defaultUserId) {
  errors.push("VITE_DEFAULT_USER_ID is required.")
} else {
  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

  if (!uuidPattern.test(defaultUserId)) {
    errors.push("VITE_DEFAULT_USER_ID must be a valid UUID.")
  }

  if (defaultUserId === "prod-user-id") {
    errors.push("VITE_DEFAULT_USER_ID still contains the placeholder value.")
  }
}

if (accessToken && accessToken.toLowerCase().includes("token")) {
  errors.push("VITE_API_ACCESS_TOKEN looks like a placeholder value.")
}

if (errors.length > 0) {
  fail(errors)
}

console.log("Production env preflight passed.")
