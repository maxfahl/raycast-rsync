import RsyncLocation, { RsyncLocationRaw } from './rsync-location'
import { RsyncDataOption } from '../data/rsync-options'
import { v4 as uuidv4 } from 'uuid'
import Sugar from 'sugar'

export type SshSelection = 'none' | 'source' | 'destination'
export type RsyncOption = {
  value?: string
} & RsyncDataOption
type Options = { [key: string]: RsyncOption }

export default class RsyncEntry {
  public id: string
  public name: string
  public source: RsyncLocation
  public destination: RsyncLocation
  public options: Options
  public sshSelection: SshSelection

  constructor(rawData?: RsyncEntryRaw) {
    if (rawData) {
      this.id = rawData.id
      this.name = rawData.name
      this.source = new RsyncLocation(rawData.source)
      this.destination = new RsyncLocation(rawData.destination)
      this.options = rawData.options
      this.sshSelection = rawData.sshSelection
    } else {
      this.id = uuidv4()
      this.name = ''
      this.source = new RsyncLocation()
      this.destination = new RsyncLocation()
      this.options = {}
      this.sshSelection = 'none'
    }
  }

  //rsync -av -e "ssh -p 2222" /Users/maxfahl/Desktop/Current/RECOLAB/UPDATE/PIXILAN-UPDATE.jar pixi-server@blocks.recolab.se:/home/pixi-server --progress
  getCommand(): string {
    const cmd = ['rsync']

    for (const [, option] of Object.entries(this.options)) {
      let optionCommand = `--${option.name}`
      if (option.value) optionCommand = `${optionCommand}=${option.value}`
      cmd.push(optionCommand)
    }

    if (this.sshSelection !== 'none') {
      const port = this[this.sshSelection].port
      cmd.push(port !== '22' ? `-e "ssh -p ${port}"` : `-e ssh`)
    }

    cmd.push(
      ...[
        this.source.getCommandPart(this.sshSelection === 'source'),
        this.destination.getCommandPart(this.sshSelection === 'destination'),
      ]
    )

    return cmd.join(' ')
  }

  toRawData(): RsyncEntryRaw {
    return {
      id: this.id,
      name: this.name,
      source: this.source.toRawData(),
      destination: this.destination.toRawData(),
      options: this.options,
      sshSelection: this.sshSelection,
    }
  }

  clone(): RsyncEntry {
    return new RsyncEntry(Sugar.Object.clone(this.toRawData(), true) as RsyncEntryRaw)
  }
}

export type RsyncEntryRaw = {
  id: string
  name: string
  source: RsyncLocationRaw
  destination: RsyncLocationRaw
  options: Options
  sshSelection: SshSelection
}
