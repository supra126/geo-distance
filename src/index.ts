/**
 * Earth's radius in each unit
 */
export const Unit = {
  km: 6378.137,
  m: 6378137,
  ft: 20902231.52,
} as const

export type Unit = keyof typeof Unit

/**
 * Coordinate
 * @property name Coordinate name
 * @property lat Latitude
 * @property lng Longitude
 */
export interface Coord {
  name?: string
  lat: number
  lng: number
}

/**
 * Bounding box
 * @property minLat Minimum latitude
 * @property maxLat Maximum latitude
 * @property minLng Minimum longitude
 * @property maxLng Maximum longitude
 */
export interface BoundingBox {
  minLat: number
  maxLat: number
  minLng: number
  maxLng: number
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180)
}

function rad2deg(rad: number): number {
  return rad * (180 / Math.PI)
}

function round(value: number, digits: number): number {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

/**
 * Calculate distance between two coordinates using the Haversine formula
 * @param a Coordinate A
 * @param b Coordinate B
 * @param unit Unit of measurement (default: 'km')
 * @param digits Decimal places (default: 4)
 * @returns Distance in the specified unit
 * @example between({ lat: 25.0853151, lng: 121.3966888 }, { lat: 21.9578574, lng: 120.7790883 })
 */
export function between(a: Coord, b: Coord, unit: Unit = 'km', digits = 4): number {
  const dLat = deg2rad(b.lat - a.lat)
  const dLon = deg2rad(b.lng - a.lng)
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(deg2rad(a.lat)) * Math.cos(deg2rad(b.lat)) * Math.sin(dLon / 2) ** 2
  const y = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
  return round(y * Unit[unit], digits)
}

/**
 * Calculate the initial bearing (forward azimuth) from coordinate A to B
 * @param a Origin coordinate
 * @param b Destination coordinate
 * @param digits Decimal places (default: 4)
 * @returns Bearing in degrees (0-360)
 * @example bearing({ lat: 25.08, lng: 121.39 }, { lat: 21.95, lng: 120.77 })
 */
export function bearing(a: Coord, b: Coord, digits = 4): number {
  const aLatRad = deg2rad(a.lat)
  const bLatRad = deg2rad(b.lat)
  const dLon = deg2rad(b.lng - a.lng)
  const x = Math.sin(dLon) * Math.cos(bLatRad)
  const y = Math.cos(aLatRad) * Math.sin(bLatRad) - Math.sin(aLatRad) * Math.cos(bLatRad) * Math.cos(dLon)
  return round(((rad2deg(Math.atan2(x, y)) % 360) + 360) % 360, digits)
}

/**
 * Calculate the geographic midpoint between two coordinates
 * @param a Coordinate A
 * @param b Coordinate B
 * @param digits Decimal places (default: 6)
 * @returns Midpoint coordinate
 * @example midpoint({ lat: 25.08, lng: 121.39 }, { lat: 21.95, lng: 120.77 })
 */
export function midpoint(a: Coord, b: Coord, digits = 6): Coord {
  const aLatRad = deg2rad(a.lat)
  const bLatRad = deg2rad(b.lat)
  const dLon = deg2rad(b.lng - a.lng)
  const bx = Math.cos(bLatRad) * Math.cos(dLon)
  const by = Math.cos(bLatRad) * Math.sin(dLon)
  const lat = rad2deg(
    Math.atan2(Math.sin(aLatRad) + Math.sin(bLatRad), Math.sqrt((Math.cos(aLatRad) + bx) ** 2 + by ** 2)),
  )
  const lng = rad2deg(deg2rad(a.lng) + Math.atan2(by, Math.cos(aLatRad) + bx))
  return { lat: round(lat, digits), lng: round(lng, digits) }
}

/**
 * Calculate the destination coordinate given a start point, distance, and bearing
 * @param origin Starting coordinate
 * @param distance Distance to travel
 * @param brng Bearing in degrees (0-360)
 * @param unit Unit of measurement (default: 'km')
 * @param digits Decimal places (default: 6)
 * @returns Destination coordinate
 * @example destination({ lat: 25.08, lng: 121.39 }, 100, 180)
 */
export function destination(origin: Coord, distance: number, brng: number, unit: Unit = 'km', digits = 6): Coord {
  const radius = Unit[unit]
  const angularDist = distance / radius
  const brngRad = deg2rad(brng)
  const latRad = deg2rad(origin.lat)
  const lngRad = deg2rad(origin.lng)
  const destLat = Math.asin(
    Math.sin(latRad) * Math.cos(angularDist) + Math.cos(latRad) * Math.sin(angularDist) * Math.cos(brngRad),
  )
  const destLng =
    lngRad +
    Math.atan2(
      Math.sin(brngRad) * Math.sin(angularDist) * Math.cos(latRad),
      Math.cos(angularDist) - Math.sin(latRad) * Math.sin(destLat),
    )
  return { lat: round(rad2deg(destLat), digits), lng: round(rad2deg(destLng), digits) }
}

/**
 * Calculate a bounding box around a center point with a given radius
 * @param center Center coordinate
 * @param radius Radius distance
 * @param unit Unit of measurement (default: 'km')
 * @param digits Decimal places (default: 6)
 * @returns Bounding box with min/max lat/lng
 * @example boundingBox({ lat: 25.08, lng: 121.39 }, 10)
 */
export function boundingBox(center: Coord, radius: number, unit: Unit = 'km', digits = 6): BoundingBox {
  const r = Unit[unit]
  const latDelta = rad2deg(radius / r)
  const lngDelta = rad2deg(radius / (r * Math.cos(deg2rad(center.lat))))
  return {
    minLat: round(center.lat - latDelta, digits),
    maxLat: round(center.lat + latDelta, digits),
    minLng: round(center.lng - lngDelta, digits),
    maxLng: round(center.lng + lngDelta, digits),
  }
}

/**
 * Check if two coordinates are within a given distance
 * @param a Coordinate A
 * @param b Coordinate B
 * @param radius Maximum distance
 * @param unit Unit of measurement (default: 'km')
 * @returns True if within the radius
 * @example isWithin({ lat: 25.08, lng: 121.39 }, { lat: 25.04, lng: 121.56 }, 20)
 */
export function isWithin(a: Coord, b: Coord, radius: number, unit: Unit = 'km'): boolean {
  return between(a, b, unit) <= radius
}

/**
 * Find the nearest coordinate to the target
 * @param target Target coordinate
 * @param coords Array of coordinates (must not be empty)
 * @param unit Unit of measurement (default: 'km')
 * @returns The nearest coordinate
 * @example nearest({ lat: 25.08, lng: 121.39 }, [{ lat: 24.18, lng: 120.55 }, { lat: 21.95, lng: 120.77 }])
 */
export function nearest(target: Coord, coords: Coord[], unit: Unit = 'km'): Coord {
  let minDist = Infinity
  let result = coords[0]
  for (const coord of coords) {
    const dist = between(target, coord, unit)
    if (dist < minDist) {
      minDist = dist
      result = coord
    }
  }
  return result
}

/**
 * Filter coordinates within a given radius from the target
 * @param target Target coordinate
 * @param coords Array of coordinates
 * @param radius Maximum distance
 * @param unit Unit of measurement (default: 'km')
 * @returns Coordinates within the radius
 * @example filterWithin({ lat: 25.08, lng: 121.39 }, coords, 100)
 */
export function filterWithin(target: Coord, coords: Coord[], radius: number, unit: Unit = 'km'): Coord[] {
  return coords.filter((coord) => between(target, coord, unit) <= radius)
}

/**
 * Sort coordinates by distance from the target, nearest first
 * @param target Target coordinate
 * @param coords Array of coordinates
 * @param unit Unit of measurement (default: 'km')
 * @returns Sorted array of coordinates
 * @example nearSort({ lat: 25.0853151, lng: 121.3966888 }, [{ lat: 21.9578574, lng: 120.7790883 }, { lat: 25.0853151, lng: 121.3966888 }])
 */
export function nearSort(target: Coord, coords: Coord[], unit: Unit = 'km'): Coord[] {
  return coords.toSorted((a, b) => between(target, a, unit) - between(target, b, unit))
}
