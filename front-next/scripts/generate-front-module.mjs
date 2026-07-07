import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const FRONT_SRC = path.join(__dirname, '..', 'src', 'modules')
const BACK_SRC = path.join(__dirname, '..', '..', 'back-nest', 'src')

const toKebab = (s) =>
  s.replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase()

const toPascal = (s) =>
  s.replace(/(^|[-_])(.)/g, (_, __, c) => c.toUpperCase()).replace(/[-_]/g, '')

const write = (filePath, content) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, content)
}

function parseEntityProps(file) {
  const code = fs.readFileSync(file, 'utf8')
  const body = code.match(/class\s+\w+\s*{([\s\S]*?)}/)?.[1] ?? ''
  const lines = body.split('\n')
  const props = []

  for (const l of lines) {
    const m = l.trim().match(/^(\w+)\s*:\s*([\w\[\] \|\?]+);/)
    if (m) {
      let [, name, type] = m
      props.push({ name, type: type.trim() })
    }
  }
  return props
}

function generateDomainFiles(name, props) {
  const kebab = toKebab(name)
  const Pascal = toPascal(name)
  const dir = path.join(FRONT_SRC, kebab, 'domain')

  const zodType = (type, name) => {
    if (name === 'hour') return `z.string().min(1, 'La hora es requerida')`
    if (type.includes('string')) return `z.string()`
    if (type.includes('number')) return `z.number()`
    if (type.includes('boolean')) return `z.boolean()`
    if (type.includes('Date')) return `z.date()`
    return `z.any()`
  }

  const baseType = `export type ${Pascal} = {\n${props
    .map((p) => `  ${p.name}: ${p.type}`)
    .join('\n')}\n}\n`
  write(path.join(dir, `${Pascal}.ts`), baseType)

  const schemaFields = props
    .filter((p) => p.name !== 'id')
    .map((p) => {
      const optional = p.type.includes('undefined') || p.type.includes('null')
      const base = `${p.name}: ${zodType(p.type, p.name)}`
      return `  ${optional ? base + '.optional()' : base},`
    })
    .join('\n')

  const createContent = `import { z } from 'zod'

export const ${Pascal}Schema = z.object({
${schemaFields}
})

export type ${Pascal}Create = z.infer<typeof ${Pascal}Schema>
`
  write(path.join(dir, `${Pascal}Create.ts`), createContent)

  const updateContent = `import { z } from 'zod'
import { ${Pascal}Schema } from './${Pascal}Create'

export const ${Pascal}UpdateSchema = ${Pascal}Schema.partial().extend({
  id: z.number()
})

export type ${Pascal}Update = z.infer<typeof ${Pascal}UpdateSchema>
`
  write(path.join(dir, `${Pascal}Update.ts`), updateContent)

  const repoContent = `import { ${Pascal} } from './${Pascal}'
import { ${Pascal}Create } from './${Pascal}Create'
import { ${Pascal}Update } from './${Pascal}Update'

export interface ${Pascal}Repository {
  create: (data: ${Pascal}Create) => Promise<{ message: string | string[]; error: string }>
  update: (data: ${Pascal}Update) => Promise<{ message: string | string[]; error: string }>
  getAll: (date: Date) => Promise<${Pascal}[]>
  getOne: (id: number) => Promise<${Pascal}>
  delete: (id: number) => Promise<{ message: string | string[]; error: string }>
}
`
  write(path.join(dir, `${Pascal}Repository.ts`), repoContent)
}

const modules = process.argv.slice(2)
if (!modules.length) {
  console.error('❌ Uso: node scripts/generate-front-module.mjs NombreDelModulo')
  process.exit(1)
}

modules.forEach((raw) => {
  const kebab = toKebab(raw)
  const Pascal = toPascal(raw)

  const entityFile = path.join(BACK_SRC, kebab, 'entities', `${kebab}.entity.ts`)
  if (!fs.existsSync(entityFile)) {
    console.error(`❌ No se encontró: ${entityFile}`)
    return
  }

  const props = parseEntityProps(entityFile)
  generateDomainFiles(raw, props)
  console.log(`✅ Dominio generado para: ${raw}`)
})
