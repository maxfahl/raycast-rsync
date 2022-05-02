export default class RsyncOption {
  public enabled: boolean
  public name: string
  public value: string

  constructor(rawData: RsyncOptionRaw) {
    this.enabled = rawData.enabled
    this.name = rawData.name
    this.value = rawData.value
  }

  toRawData() {
    return {
      enabled: this.enabled,
      name: this.name,
      value: this.value,
    } as RsyncOptionRaw
  }
}

export type RsyncOptionRaw = {
  enabled: boolean
  name: string
  value: string
}
