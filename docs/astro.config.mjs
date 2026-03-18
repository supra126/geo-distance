// @ts-check

import { createRequire } from 'node:module'
import { defineConfig } from 'astro/config'

const require = createRequire(import.meta.url)
const pkg = require('../package.json')

const repoName = pkg.repository.url.replace(/.*\/(.+?)(?:\.git)?$/, '$1')
const [owner] = pkg.repository.url.replace(/.*github\.com[/:]/, '').split('/')

// https://astro.build/config
export default defineConfig({
  site: `https://${owner}.github.io`,
  base: `/${repoName}`,
})
