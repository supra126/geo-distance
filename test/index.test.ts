import { describe, expect, it } from 'vitest'
import {
  bearing,
  between,
  boundingBox,
  destination,
  filterWithin,
  isWithin,
  midpoint,
  nearest,
  nearSort,
} from '../src/index'

const taipei = { name: 'Taipei', lat: 25.0853151, lng: 121.3966888 }
const taichung = { name: 'Taichung', lat: 24.1849619, lng: 120.5523295 }
const tainan = { name: 'Tainan', lat: 23.1505381, lng: 120.1772088 }
const kenting = { name: 'Kenting', lat: 21.9578574, lng: 120.7790883 }

describe('between', () => {
  it('calculates distance in km by default', () => {
    const result = between(taipei, kenting)
    expect(result).toBeTypeOf('number')
    expect(result).toBeGreaterThan(0)
  })

  it('calculates distance in ft', () => {
    const result = between(taipei, kenting, 'ft', 2)
    expect(result).toBeTypeOf('number')
    expect(result).toBeGreaterThan(0)
  })

  it('returns 0 for same coordinates', () => {
    expect(between(taipei, taipei)).toBe(0)
  })
})

describe('bearing', () => {
  it('calculates bearing between two coordinates', () => {
    const result = bearing(taipei, kenting)
    expect(result).toBeTypeOf('number')
    expect(result).toBeGreaterThanOrEqual(0)
    expect(result).toBeLessThan(360)
  })

  it('returns roughly south for Taipei to Kenting', () => {
    const result = bearing(taipei, kenting)
    expect(result).toBeGreaterThan(170)
    expect(result).toBeLessThan(200)
  })

  it('returns 0 for same coordinates', () => {
    expect(bearing(taipei, taipei)).toBe(0)
  })
})

describe('midpoint', () => {
  it('calculates midpoint between two coordinates', () => {
    const mid = midpoint(taipei, kenting)
    expect(mid.lat).toBeGreaterThan(kenting.lat)
    expect(mid.lat).toBeLessThan(taipei.lat)
  })

  it('returns same coordinate for identical points', () => {
    const mid = midpoint(taipei, taipei)
    expect(mid.lat).toBeCloseTo(taipei.lat, 4)
    expect(mid.lng).toBeCloseTo(taipei.lng, 4)
  })
})

describe('destination', () => {
  it('calculates destination coordinate', () => {
    const dest = destination(taipei, 100, 180)
    expect(dest.lat).toBeLessThan(taipei.lat)
    expect(dest.lng).toBeCloseTo(taipei.lng, 1)
  })

  it('round-trips with between', () => {
    const dest = destination(taipei, 100, 90)
    const dist = between(taipei, dest)
    expect(dist).toBeCloseTo(100, 0)
  })

  it('heading north increases latitude', () => {
    const dest = destination(taipei, 50, 0)
    expect(dest.lat).toBeGreaterThan(taipei.lat)
  })
})

describe('boundingBox', () => {
  it('returns a box around the center', () => {
    const box = boundingBox(taipei, 10)
    expect(box.minLat).toBeLessThan(taipei.lat)
    expect(box.maxLat).toBeGreaterThan(taipei.lat)
    expect(box.minLng).toBeLessThan(taipei.lng)
    expect(box.maxLng).toBeGreaterThan(taipei.lng)
  })

  it('is symmetric in latitude', () => {
    const box = boundingBox(taipei, 50)
    const latBelow = taipei.lat - box.minLat
    const latAbove = box.maxLat - taipei.lat
    expect(latBelow).toBeCloseTo(latAbove, 6)
  })

  it('contains coordinates within the radius', () => {
    const box = boundingBox(tainan, 200)
    expect(taichung.lat).toBeGreaterThanOrEqual(box.minLat)
    expect(taichung.lat).toBeLessThanOrEqual(box.maxLat)
    expect(taichung.lng).toBeGreaterThanOrEqual(box.minLng)
    expect(taichung.lng).toBeLessThanOrEqual(box.maxLng)
  })
})

describe('isWithin', () => {
  it('returns true when within radius', () => {
    expect(isWithin(taipei, taichung, 200)).toBe(true)
  })

  it('returns false when outside radius', () => {
    expect(isWithin(taipei, kenting, 100)).toBe(false)
  })

  it('returns true when exactly at radius', () => {
    const dist = between(taipei, taichung)
    expect(isWithin(taipei, taichung, dist)).toBe(true)
  })
})

describe('nearest', () => {
  it('finds the nearest coordinate', () => {
    const result = nearest(tainan, [taipei, taichung, kenting])
    expect(result.name).toBe('Taichung')
  })

  it('returns the only coordinate when array has one element', () => {
    const result = nearest(taipei, [kenting])
    expect(result.name).toBe('Kenting')
  })
})

describe('filterWithin', () => {
  it('filters coordinates within radius', () => {
    const result = filterWithin(tainan, [taipei, taichung, kenting], 150)
    expect(result).toHaveLength(2)
    expect(result.map((c) => c.name)).toContain('Taichung')
    expect(result.map((c) => c.name)).toContain('Kenting')
  })

  it('returns empty array when none within radius', () => {
    const result = filterWithin(taipei, [kenting], 10)
    expect(result).toHaveLength(0)
  })

  it('returns all when all within radius', () => {
    const result = filterWithin(tainan, [taipei, taichung, kenting], 500)
    expect(result).toHaveLength(3)
  })
})

describe('nearSort', () => {
  it('sorts coordinates by distance from target', () => {
    const result = nearSort(tainan, [taipei, taichung, kenting])
    expect(result[0].name).toBe('Taichung')
    expect(result[1].name).toBe('Kenting')
    expect(result[2].name).toBe('Taipei')
  })

  it('does not mutate the original array', () => {
    const coords = [taipei, taichung, kenting]
    nearSort(tainan, coords)
    expect(coords[0].name).toBe('Taipei')
  })
})
