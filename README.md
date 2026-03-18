# @simoko/geo-distance

Lightweight, zero-dependency geographic distance and coordinate utilities for JavaScript and TypeScript.

[Documentation & Playground](https://supra126.github.io/geo-distance/)

## Features

- **Zero dependencies** — pure math, nothing to install beyond this package
- **Tree-shakable** — import only what you need
- **ESM + CJS** — works everywhere
- **Full TypeScript support** — types included, not bolted on
- **Haversine formula** — accurate distance calculation for real-world coordinates

## Install

```bash
npm install @simoko/geo-distance
```

## Quick Start

```ts
import { between, nearest, filterWithin } from '@simoko/geo-distance'

const taipei = { lat: 25.0853, lng: 121.3967 }
const taichung = { lat: 24.1850, lng: 120.5523 }
const tainan = { lat: 23.1505, lng: 120.1772 }
const kenting = { lat: 21.9579, lng: 120.7791 }

// Distance between two points (km by default)
between(taipei, kenting) // 353.8059

// Find the nearest point
nearest(tainan, [taipei, taichung, kenting]) // taichung

// Filter points within 150 km
filterWithin(tainan, [taipei, taichung, kenting], 150) // [taichung, kenting]
```

[Try it live in the playground](https://supra126.github.io/geo-distance/)

## API

### Distance

#### `between(a, b, unit?, digits?)`

Calculate distance between two coordinates using the Haversine formula.

```ts
between({ lat: 25.0853, lng: 121.3967 }, { lat: 21.9579, lng: 120.7791 })
// 353.8059 (km)

between({ lat: 25.0853, lng: 121.3967 }, { lat: 21.9579, lng: 120.7791 }, 'ft', 2)
// 1160585.03 (ft)
```

### Navigation

#### `bearing(a, b, digits?)`

Calculate the initial bearing (forward azimuth) from point A to point B. Returns degrees (0–360).

```ts
bearing({ lat: 25.0853, lng: 121.3967 }, { lat: 21.9579, lng: 120.7791 })
// 190.597 (roughly south)
```

#### `midpoint(a, b, digits?)`

Calculate the geographic midpoint between two coordinates.

```ts
midpoint({ lat: 25.0853, lng: 121.3967 }, { lat: 21.9579, lng: 120.7791 })
// { lat: 23.5231, lng: 121.0845 }
```

#### `destination(origin, distance, bearing, unit?, digits?)`

Calculate the destination coordinate given a start point, distance, and bearing.

```ts
destination({ lat: 25.0853, lng: 121.3967 }, 100, 180)
// { lat: 24.1866, lng: 121.3967 } (100 km due south)
```

### Query

#### `isWithin(a, b, radius, unit?)`

Check if two coordinates are within a given distance.

```ts
isWithin(taipei, taichung, 200) // true
isWithin(taipei, kenting, 100)  // false
```

#### `nearest(target, coords, unit?)`

Find the nearest coordinate to the target. O(n), no sorting overhead.

```ts
nearest(tainan, [taipei, taichung, kenting])
// taichung
```

#### `filterWithin(target, coords, radius, unit?)`

Filter coordinates within a given radius from the target.

```ts
filterWithin(tainan, [taipei, taichung, kenting], 150)
// [taichung, kenting]
```

#### `nearSort(target, coords, unit?)`

Sort coordinates by distance from the target, nearest first. Returns a new array.

```ts
nearSort(tainan, [taipei, taichung, kenting])
// [taichung, kenting, taipei]
```

### Spatial

#### `boundingBox(center, radius, unit?, digits?)`

Calculate a bounding box around a center point. Useful for fast pre-filtering in database queries before applying precise distance calculations.

```ts
boundingBox({ lat: 25.0853, lng: 121.3967 }, 10)
// { minLat: 24.995413, maxLat: 25.175187, minLng: 121.296788, maxLng: 121.496589 }
```

Database pre-filtering example:

```sql
SELECT * FROM locations
WHERE lat BETWEEN :minLat AND :maxLat
  AND lng BETWEEN :minLng AND :maxLng
```

## Types

```ts
interface Coord {
  name?: string
  lat: number
  lng: number
}

interface BoundingBox {
  minLat: number
  maxLat: number
  minLng: number
  maxLng: number
}

type Unit = 'km' | 'm' | 'ft'
```

## Supported Units

| Unit | Description | Earth's Radius |
|------|-------------|----------------|
| `km` | Kilometers (default) | 6,378.137 |
| `m` | Meters | 6,378,137 |
| `ft` | Feet | 20,902,231.52 |

## License

[MIT](./LICENSE)
