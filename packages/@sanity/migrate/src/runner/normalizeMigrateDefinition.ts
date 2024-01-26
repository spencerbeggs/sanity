import {at, Mutation, NodePatch, Operation, patch, Path} from '@bjoerge/mutiny'
import {SanityDocument} from '@sanity/types'
import arrify from 'arrify'
import {AsyncIterableMigration, Migration, NodeMigration, NodeMigrationContext} from '../types'
import {JsonArray, JsonObject, JsonValue} from '../json'
import {flatMapDeep} from './utils/flatMapDeep'
import {getValueType} from './utils/getValueType'

export function normalizeMigrateDefinition(migration: Migration): AsyncIterableMigration {
  if (typeof migration.migrate == 'function') {
    // assume AsyncIterableMigration
    return migration.migrate
  }
  return createAsyncIterableMutation(migration.migrate, {
    filter: migration.filter,
    documentTypes: migration.documentTypes,
  })
}

function isMutation(mutation: Mutation | NodePatch | Operation): mutation is Mutation {
  return 'type' in mutation
}
function isOperation(value: Mutation | NodePatch | Operation): value is Operation {
  return (
    'type' in value &&
    (value.type === 'set' ||
      value.type === 'unset' ||
      value.type === 'insert' ||
      value.type === 'diffMatchPatch' ||
      value.type === 'dec' ||
      value.type === 'inc' ||
      value.type === 'upsert' ||
      value.type === 'unassign' ||
      value.type === 'truncate' ||
      value.type === 'setIfMissing')
  )
}

export function createAsyncIterableMutation(
  migration: NodeMigration,
  opts: {filter?: string; documentTypes?: string[]},
): AsyncIterableMigration {
  const documentTypesSet = new Set(opts.documentTypes)

  return async function* run(docs, context) {
    for await (const doc of docs) {
      if (!documentTypesSet.has(doc._type)) continue

      const documentMutations = collectDocumentMutations(migration, doc, context)
      if (documentMutations.length > 0) {
        yield documentMutations
      }
    }
  }
}

function collectDocumentMutations(
  migration: NodeMigration,
  doc: SanityDocument,
  context: NodeMigrationContext,
) {
  const documentMutations = migration.document?.(doc, context)
  const nodeMigrations = flatMapDeep(doc as JsonValue, (value, path) => {
    return [
      ...arrify(migration.node?.(value, path, context)),
      ...arrify(migrateNodeType(migration, value, path, context)),
    ].map((change) => normalizeNodeMutation(path, change))
  })

  return [...arrify(documentMutations), ...nodeMigrations].map((change) =>
    normalizeDocumentMutation(doc._id, change),
  )
}

/**
 * Normalize a mutation or a NodePatch to a document mutation
 * @param documentId - The document id
 * @param change - The Mutation or NodePatch
 */
function normalizeDocumentMutation(documentId: string, change: Mutation | NodePatch): Mutation {
  return isMutation(change) ? change : patch(documentId, change)
}

/**
 * Normalize a mutation or a NodePatch to a document mutation
 * @param path - The path the operation should be applied at
 * @param change - The Mutation or NodePatch
 */
function normalizeNodeMutation(
  path: Path,
  change: Mutation | NodePatch | Operation,
): Mutation | NodePatch {
  return isOperation(change) ? at(path, change) : change
}

function migrateNodeType(
  migration: NodeMigration,
  value: JsonValue,
  path: Path,
  context: NodeMigrationContext,
) {
  switch (getValueType(value)) {
    case 'string':
      return migration.string?.(value as string, path, context)
    case 'number':
      return migration.number?.(value as number, path, context)
    case 'boolean':
      return migration.boolean?.(value as boolean, path, context)
    case 'object':
      return migration.object?.(value as JsonObject, path, context)
    case 'array':
      return migration.array?.(value as JsonArray, path, context)
    case 'null':
      return migration.null?.(value as null, path, context)
    default:
      throw new Error('Unknown value type')
  }
}