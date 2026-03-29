// 承运商名称 → 17TRACK carrier code 映射
// 参考: https://api.17track.net/track/v2.2/getcarrierlist

export const CARRIER_MAP: Record<string, number> = {
  DHL: 100001,
  UPS: 100002,
  FedEx: 100003,
  USPS: 21051,
  'China Post': 3011,
  ChinaPost: 3011,
  EMS: 3013,
  YunExpress: 190012,
  '云途': 190012,
  Yanwen: 190001,
  '燕文': 190001,
  '4PX': 190199,
  '递四方': 190199,
}

export function getCarrierCode(carrier: string): number | undefined {
  if (!carrier) return undefined
  // 精确匹配
  if (CARRIER_MAP[carrier] !== undefined) return CARRIER_MAP[carrier]
  // 不区分大小写匹配
  const lower = carrier.toLowerCase()
  for (const [key, code] of Object.entries(CARRIER_MAP)) {
    if (key.toLowerCase() === lower) return code
  }
  return undefined
}
