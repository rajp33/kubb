import { schemaKeywords } from '@kubb/plugin-oas'
import { Oas } from '@kubb/plugin-oas/components'
import { useOas, useOperation, useOperationManager } from '@kubb/plugin-oas/hooks'
import { File, Parser, useApp } from '@kubb/react'

import { SchemaGenerator } from '../SchemaGenerator.tsx'

import type { OperationSchema as OperationSchemaType } from '@kubb/plugin-oas'
import type { ReactNode } from 'react'
import type { FileMeta, PluginZod } from '../types.ts'
import { Schema } from './Schema.tsx'

type Props = {
  description?: string
  keysToOmit?: string[]
}

export function OperationSchema({ description, keysToOmit }: Props): ReactNode {
  return <Schema keysToOmit={keysToOmit} withTypeAnnotation={false} description={description} />
}

type FileProps = {}

OperationSchema.File = function ({}: FileProps): ReactNode {
  const { pluginManager, plugin, mode } = useApp<PluginZod>()
  const { getSchemas, getFile } = useOperationManager()
  const oas = useOas()
  const operation = useOperation()

  const file = getFile(operation)
  const schemas = getSchemas(operation)
  const generator = new SchemaGenerator(plugin.options, {
    oas,
    plugin,
    pluginManager,
    mode,
    override: plugin.options.override,
  })

  const items = [schemas.pathParams, schemas.queryParams, schemas.headerParams, schemas.statusCodes, schemas.request, schemas.response].flat().filter(Boolean)

  const mapItem = ({ name, schema, description, keysToOmit, ...options }: OperationSchemaType, i: number) => {
    // hack so Params can be optional when needed
    const required = Array.isArray(schema?.required) ? !!schema.required.length : !!schema?.required
    const optional = !required && !!name.includes('Params')
    const tree = generator.parse({ schema, name })

    return (
      <Oas.Schema key={i} name={name} value={schema} tree={[...tree, optional ? { keyword: schemaKeywords.optional } : undefined].filter(Boolean)}>
        {mode === 'split' && <Oas.Schema.Imports />}
        <File.Source>
          <OperationSchema description={description} keysToOmit={keysToOmit} />
        </File.Source>
      </Oas.Schema>
    )
  }

  return (
    <Parser language="typescript">
      <File<FileMeta> baseName={file.baseName} path={file.path} meta={file.meta}>
        <File.Import name={['z']} path={plugin.options.importPath} />
        {items.map(mapItem)}
      </File>
    </Parser>
  )
}
