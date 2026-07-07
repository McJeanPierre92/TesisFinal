// scripts/generate-resource.mjs
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const schemaPath = path.join(__dirname, '../prisma/schema.prisma')
const modelName = process.argv[2]
if (!modelName) {
  console.error('❌ Por favor indica el nombre del modelo como argumento.')
  process.exit(1)
}

const schema = fs.readFileSync(schemaPath, 'utf-8')

function extractModel(schema, modelName) {
  const regex = new RegExp(`model\\s+${modelName}\\s+{([\\s\\S]*?)}`)
  const match = schema.match(regex)
  return match ? match[1].trim() : null
}

function parseProperties(modelBody) {
  return modelBody
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('//'))
    .map((line) => {
      const [name, type] = line.split(/\s+/)
      return { name, type }
    })
}

function mapToDecorators(type) {
  const base = []
  if (type === 'String') {
    base.push('@IsString()', '@IsNotEmpty()', '@ApiProperty({ type: String })')
  } else if (type === 'Int' || type === 'Float' || type === 'Decimal') {
    base.push('@IsNumber()', '@IsNotEmpty()', '@ApiProperty({ type: Number })')
  } else if (type === 'Boolean') {
    base.push('@IsNotEmpty()', '@ApiProperty({ type: Boolean })')
  } else if (type === 'DateTime') {
    base.push('@ApiProperty({ type: Date })')
  } else {
    base.push('@ApiProperty()')
  }
  return base
}

function tsType(type) {
  if (type === 'Int' || type === 'Float' || type === 'Decimal') return 'number'
  if (type === 'Boolean') return 'boolean'
  if (type === 'DateTime') return 'Date'
  return 'string'
}

function toKebabCase(str) {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase()
}

function generateCreateDto(name, props) {
  const imports = [
    "import { ApiProperty } from '@nestjs/swagger'",
    "import { IsNotEmpty, IsString, IsNumber, IsBoolean } from 'class-validator'"
  ]

  const filteredProps = props.filter((p) => p.name !== 'id')

  const content = filteredProps
    .map((p) => {
      const decorators = mapToDecorators(p.type).join('\n  ')
      return `  ${decorators}\n  ${p.name}: ${tsType(p.type)};`
    })
    .join('\n\n')

  return `${imports.join('\n')}

export class Create${name}Dto {
${content}
}`
}

function generateUpdateDto(name) {
  const kebab = toKebabCase(name)
  const fileName = `create-${kebab}.dto`
  return `import { PartialType, ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber } from 'class-validator'
import { Create${name}Dto } from './${fileName}'

export class Update${name}Dto extends PartialType(Create${name}Dto) {
  @ApiProperty({ type: Number })
  @IsNotEmpty()
  @IsNumber()
  id: number
}`
}

function generateFindAllDto(name, props) {
  const imports = ["import { ApiProperty } from '@nestjs/swagger'"]
  const content = props
    .map((p) => {
      return `  @ApiProperty()\n  ${p.name}: ${tsType(p.type)};`
    })
    .join('\n\n')
  return `${imports.join('\n')}

export class FindAll${name}Dto {
${content}
}`
}

function generateEntity(name, props) {
  const content = props
    .map((p) => {
      return `  ${p.name}: ${tsType(p.type)};`
    })
    .join('\n')
  return `export class ${name}Entity {
${content}
}`
}

function generateService(name, props) {
  const lower = name.charAt(0).toLowerCase() + name.slice(1)
  const kebab = toKebabCase(name)

  return `import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/storage/prisma.service'
import { Create${name}Dto } from './dto/create-${kebab}.dto'
import { Update${name}Dto } from './dto/update-${kebab}.dto'
import { Prisma } from '@prisma/client'

@Injectable()
export class ${name}Service {
  constructor(private readonly prisma: PrismaService) {}

  async create(create${name}Dto: Create${name}Dto) {
    return this.prisma.${lower}.create({
      data: create${name}Dto,
    })
  }

  async findAll(where?: Prisma.${lower}WhereInput) {
    return this.prisma.${lower}.findMany({
      where,
      orderBy: { id: 'desc' }
    })
  }

  async findOne(id: number) {
    return this.prisma.${lower}.findUnique({
      where: { id }
    })
  }

  async update(id: number, update${name}Dto: Update${name}Dto) {
    return this.prisma.${lower}.update({
      where: { id },
      data: update${name}Dto,
    })
  }

  async remove(id: number) {
    return this.prisma.${lower}.delete({
      where: { id },
    })
  }
}`
}

function generateController(name) {
  const lower = name.charAt(0).toLowerCase() + name.slice(1)
  const kebab = toKebabCase(name)
  return `import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  ParseIntPipe
} from '@nestjs/common'
import { Create${name}Dto } from './dto/create-${kebab}.dto'
import { Update${name}Dto } from './dto/update-${kebab}.dto'
import { ${name}Service } from './${lower}.service'

@Controller('${kebab}')
export class ${name}Controller {
  constructor(
    private readonly ${lower}Service: ${name}Service
  ) {}

  @Post()
  create(
    @Body() create${name}Dto: Create${name}Dto
  ) {
    return this.${lower}Service.create(create${name}Dto)
  }

  @Get()
  findAll() {
    return this.${lower}Service.findAll()
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.${lower}Service.findOne(id)
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() update${name}Dto: Update${name}Dto
  ) {
    return this.${lower}Service.update(id, update${name}Dto)
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.${lower}Service.remove(id)
  }
}`
}

function generateModule(name) {
  const lower = name.charAt(0).toLowerCase() + name.slice(1)
  const kebab = toKebabCase(name)
  return `import { Module } from '@nestjs/common';
import { ${name}Service } from './${lower}.service';
import { ${name}Controller } from './${lower}.controller';
import { PrismaService } from 'src/storage/prisma.service';

@Module({
  controllers: [${name}Controller],
  providers: [${name}Service, PrismaService],
})
export class ${name}Module {}
`
}

function generateSpec(name) {
  const lower = name.charAt(0).toLowerCase() + name.slice(1)
  return `import { Test, TestingModule } from '@nestjs/testing';
import { ${name}Service } from './${lower}.service';

describe('${name}Service', () => {
  let service;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [${name}Service],
    }).compile();

    service = module.get(${name}Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});`
}

function writeFile(dir, name, content) {
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, name), content)
}

const modelBody = extractModel(schema, modelName)
if (!modelBody) {
  console.error(`❌ Modelo "${modelName}" no encontrado en schema.prisma`)
  process.exit(1)
}

const props = parseProperties(modelBody)
const className = modelName.charAt(0).toUpperCase() + modelName.slice(1)
const folderName = toKebabCase(modelName)
const baseDir = path.join(__dirname, '../src', folderName)

writeFile(
  path.join(baseDir, 'dto'),
  `create-${folderName}.dto.ts`,
  generateCreateDto(className, props)
)
writeFile(
  path.join(baseDir, 'dto'),
  `update-${folderName}.dto.ts`,
  generateUpdateDto(className)
)
writeFile(
  path.join(baseDir, 'dto'),
  `findAll-${folderName}.dto.ts`,
  generateFindAllDto(className, props)
)
writeFile(
  path.join(baseDir, 'entities'),
  `${folderName}.entity.ts`,
  generateEntity(className, props)
)
writeFile(
  baseDir,
  `${folderName}.service.ts`,
  generateService(className, props)
)
writeFile(baseDir, `${folderName}.service.spec.ts`, generateSpec(className))
writeFile(baseDir, `${folderName}.controller.ts`, generateController(className))
writeFile(baseDir, `${folderName}.module.ts`, generateModule(className))

console.log(`✅ Archivos generados para ${modelName} en src/${folderName}/`)
