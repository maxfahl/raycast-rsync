import RsyncLocation, { RsyncLocationRaw } from './rsync-location'
import { RsyncDataOption } from '../data/rsync-options'

export type SshSelection = 'none' | 'source' | 'destination'
export type RsyncOption = {
  value: string
} & RsyncDataOption
type Options = { [key: string]: RsyncOption }

export default class RsyncEntry {
  public name: string
  public source: RsyncLocation
  public destination: RsyncLocation
  public options: Options
  public sshSelection: SshSelection

  constructor(rawData?: RsyncEntryRaw) {
    if (rawData) {
      this.name = rawData.name
      this.source = new RsyncLocation(rawData.source)
      this.destination = new RsyncLocation(rawData.destination)
      this.options = rawData.options
      this.sshSelection = rawData.sshSelection
    } else {
      this.name = ''
      this.source = new RsyncLocation()
      this.destination = new RsyncLocation()
      this.options = {}
      this.sshSelection = 'none'
    }
  }

  toRawData(): RsyncEntryRaw {
    return {
      name: this.name,
      source: this.source.toRawData(),
      destination: this.destination.toRawData(),
      options: this.options,
      sshSelection: this.sshSelection,
    } as RsyncEntryRaw
  }

  clone() {
    return new RsyncEntry(this.toRawData())
  }
}

export type RsyncEntryRaw = {
  name: string
  source: RsyncLocationRaw
  destination: RsyncLocationRaw
  options: Options
  sshSelection: SshSelection
}
