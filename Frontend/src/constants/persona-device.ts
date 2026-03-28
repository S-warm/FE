const personaDeviceOptions = [
  { label: "Mac", value: "mac" },
  { label: "Windows", value: "windows" },
  { label: "iPhone", value: "iphone" },
  { label: "Android", value: "android" },
  { label: "iPad", value: "ipad" },
  { label: "Android Tablet", value: "android_tablet" },
] as const

type PersonaDevice = (typeof personaDeviceOptions)[number]["value"]

const personaDeviceLabelMap = personaDeviceOptions.reduce<Record<PersonaDevice, string>>((acc, option) => {
  acc[option.value] = option.label
  return acc
}, {} as Record<PersonaDevice, string>)

export { personaDeviceOptions, personaDeviceLabelMap }
export type { PersonaDevice }
