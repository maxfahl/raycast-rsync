import RsyncLocation, { RsyncLocationRaw } from './rsync-location'
import RsyncOption, { RsyncOptionRaw } from './rsync-option'

export type SshSelection = 'none' | 'source' | 'destination'
type OptionMap = Map<string, RsyncOption>

export default class RsyncEntry {
  public name: string
  public source: RsyncLocation
  public destination: RsyncLocation
  public options: OptionMap
  public sshSelection: SshSelection

  constructor(rawData?: RsyncEntryRaw) {
    if (rawData) {
      this.name = rawData.name
      this.source = new RsyncLocation(rawData.source)
      this.destination = new RsyncLocation(rawData.destination)
      this.options = new Map()
      for (const [key, optionRaw] of Object.entries(rawData.options)) {
        this.options.set(key, new RsyncOption(optionRaw))
      }
      this.sshSelection = rawData.sshSelection
    } else {
      this.name = ''
      this.source = new RsyncLocation()
      this.destination = new RsyncLocation()
      this.options = new Map()
      this.sshSelection = 'none'
    }
  }

  toRawData(): RsyncEntryRaw {
    const raw = {
      name: this.name,
      source: this.source.toRawData(),
      destination: this.destination.toRawData(),
      options: {},
      sshSelection: this.sshSelection,
    } as RsyncEntryRaw
    for (const [key, option] of Object.entries(this.options)) {
      raw.options[key] = option.toRawData()
    }
    return raw
  }

  clone() {
    return new RsyncEntry(this.toRawData())
  }
}

export type RsyncEntryRaw = {
  name: string
  source: RsyncLocationRaw
  destination: RsyncLocationRaw
  options: { [key: string]: RsyncOptionRaw }
  sshSelection: SshSelection
}
