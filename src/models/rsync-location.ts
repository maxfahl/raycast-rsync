export default class RsyncLocation {
  public userName: string
  public hostName: string
  public port: string
  public path: string

  constructor(rawData?: RsyncLocationRaw) {
    if (rawData) {
      this.userName = rawData.userName
      this.hostName = rawData.hostName
      this.port = rawData.port
      this.path = rawData.path
    } else {
      this.userName = ""
      this.hostName = ""
      this.port = "22"
      this.path = ""
    }
  }

  getCommandPart(identifier: string, includeRemote: boolean): string {
    const userName = this.userName.trim()
    const hostName = this.hostName.trim()
    const path = this.path.trim()

    if (!path) throw `Path is missing for ${identifier}`
    if (userName && !hostName) throw `Host name is missing for ${identifier}`

    return userName && includeRemote ? `${userName}@${hostName}:${path}` : path
  }

  toRawData() {
    return {
      userName: this.userName,
      hostName: this.hostName,
      port: this.port,
      path: this.path,
    } as RsyncLocationRaw
  }
}

export type RsyncLocationRaw = {
  userName: string
  hostName: string
  port: string
  path: string
}
