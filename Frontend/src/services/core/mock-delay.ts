export async function mockDelay(durationMs = 150) {
  await new Promise((resolve) => {
    window.setTimeout(resolve, durationMs)
  })
}
