export declare class AMapWX {
  constructor(options: { key: string })
  getRegeo(options: {
    location?: string
    iconPath?: string
    iconWidth?: number
    iconHeight?: number
    success: (data: Array<{
      name: string
      desc: string
      latitude: number | string
      longitude: number | string
      regeocodeData?: Record<string, any>
      id: number
    }>) => void
    fail: (err: { errCode: string; errMsg: string }) => void
  }): void
}
