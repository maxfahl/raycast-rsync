import RsyncLocation, { RsyncLocationRaw } from './rsync-location'
import { RsyncDataOption } from '../data/rsync-options'
import { v4 as uuidv4 } from 'uuid'
import Sugar from 'sugar'

export type SshSelection = 'none' | 'source' | 'destination'
export type RsyncOption = {
  value?: string
  enabled?: boolean
} & RsyncDataOption
type Options = { [key: string]: RsyncOption }

export default class RsyncEntry {
  public id: string | undefined
  public name: string
  public description: string
  public source: RsyncLocation
  public destination: RsyncLocation
  public options: Options
  public sshSelection: SshSelection
  public pinned: boolean
  public confirmed: boolean // If the user has confirmed that this entry looks good before running it.

  constructor(rawData?: RsyncEntryRaw) {
    if (rawData) {
      this.id = rawData.id
      this.name = rawData.name
      this.description = rawData.description
      this.source = new RsyncLocation(rawData.source)
      this.destination = new RsyncLocation(rawData.destination)
      this.options = rawData.options
      this.sshSelection = rawData.sshSelection
      this.pinned = rawData.pinned
      this.confirmed = rawData.confirmed
    } else {
      this.id = undefined
      this.name = ''
      this.description = ''
      this.source = new RsyncLocation()
      this.destination = new RsyncLocation()
      this.options = {}
      this.sshSelection = 'none'
      this.pinned = false
      this.confirmed = false
    }
  }

  getCommand(): string {
    const cmd = ['rsync']

    for (const [, option] of Object.entries(this.options)) {
      const { name, param, value } = option
      let optionCommand = `--${name}`
      if (param && !value) throw `Option "${name}" does not have a value.`
      if (value) optionCommand = `${optionCommand}=${value}`
      cmd.push(optionCommand)
    }

    if (this.sshSelection !== 'none') {
      const port = this[this.sshSelection].port
      if (isNaN(Number(port))) throw `Port entered for ${this.sshSelection} has to be a number.`
      cmd.push(port !== '22' ? `-e "ssh -p ${port}"` : `-e ssh`)
    }

    cmd.push(
      ...[
        this.source.getCommandPart('source', this.sshSelection === 'source'),
        this.destination.getCommandPart('source', this.sshSelection === 'destination'),
      ]
    )

    return cmd.join(' ')
  }

  toRawData(): RsyncEntryRaw {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      source: this.source.toRawData(),
      destination: this.destination.toRawData(),
      options: this.options,
      sshSelection: this.sshSelection,
      pinned: this.pinned,
      confirmed: this.confirmed,
    }
  }

  clone(): RsyncEntry {
    return new RsyncEntry(Sugar.Object.clone(this.toRawData(), true) as RsyncEntryRaw)
  }
}

export type RsyncEntryRaw = {
  id: string | undefined
  name: string
  description: string
  source: RsyncLocationRaw
  destination: RsyncLocationRaw
  options: Options
  sshSelection: SshSelection
  pinned: boolean
  confirmed: boolean
}
