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
      this.userName = ''
      this.hostName = ''
      this.port = '22'
      this.path = ''
    }
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
