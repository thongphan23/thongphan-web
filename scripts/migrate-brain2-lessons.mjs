import { createHash } from 'node:crypto'

import ts from 'typescript'

const fail = (sourceName, message) => {
  throw new Error(`${sourceName}: ${message}`)
}

const readLesson = (node, day, sourceName) => {
  if (!ts.isObjectLiteralExpression(node)) {
    fail(sourceName, `day ${day} must be an object literal`)
  }

  let title
  let content
  const seenFields = new Set()

  for (const field of node.properties) {
    if (ts.isSpreadAssignment(field)) {
      fail(sourceName, `day ${day} contains a spread field`)
    }
    if (!ts.isPropertyAssignment(field) || !ts.isIdentifier(field.name)) {
      fail(sourceName, `day ${day} fields must be plain property assignments`)
    }

    const fieldName = field.name.text
    if (fieldName !== 'title' && fieldName !== 'content') {
      fail(sourceName, `day ${day} contains unknown field ${fieldName}`)
    }
    if (seenFields.has(fieldName)) {
      fail(sourceName, `day ${day} contains duplicate field ${fieldName}`)
    }
    seenFields.add(fieldName)

    if (fieldName === 'title') {
      if (!ts.isStringLiteral(field.initializer)) {
        fail(sourceName, `day ${day} title must be a string literal`)
      }
      title = field.initializer.text
      continue
    }

    if (!ts.isNoSubstitutionTemplateLiteral(field.initializer)) {
      fail(sourceName, `day ${day} content must be a no-substitution template literal`)
    }
    content = field.initializer.text
  }

  if (title === undefined) fail(sourceName, `day ${day} is missing title`)
  if (content === undefined) fail(sourceName, `day ${day} is missing content`)
  return { day, title, content }
}

export function extractDayContent(sourceText, sourceName = '<memory>') {
  if (typeof sourceText !== 'string') fail(sourceName, 'source must be a string')

  const sourceFile = ts.createSourceFile(
    sourceName,
    sourceText,
    ts.ScriptTarget.Latest,
    false,
    ts.ScriptKind.JS,
  )
  const diagnosticCount = sourceFile.parseDiagnostics.length
  if (diagnosticCount > 0) {
    fail(
      sourceName,
      `source contains ${diagnosticCount} TypeScript parse diagnostic${diagnosticCount === 1 ? '' : 's'}`,
    )
  }
  const declarations = sourceFile.statements
    .filter(ts.isVariableStatement)
    .flatMap(({ declarationList }) => declarationList.declarations)
    .filter(({ name }) => ts.isIdentifier(name) && name.text === 'DAY_CONTENT')

  if (declarations.length === 0) fail(sourceName, 'expected one top-level DAY_CONTENT declaration')
  if (declarations.length > 1) fail(sourceName, 'multiple top-level DAY_CONTENT declarations')

  const initializer = declarations[0].initializer
  if (!initializer || !ts.isObjectLiteralExpression(initializer)) {
    fail(sourceName, 'DAY_CONTENT must be an object literal')
  }
  if (initializer.properties.some(ts.isSpreadAssignment)) {
    fail(sourceName, 'DAY_CONTENT contains a spread property')
  }
  if (initializer.properties.length !== 21) {
    fail(sourceName, `DAY_CONTENT must contain exactly 21 lessons; found ${initializer.properties.length}`)
  }

  const entries = []
  const seenDays = new Set()
  for (const [index, property] of initializer.properties.entries()) {
    if (!ts.isPropertyAssignment(property)) {
      fail(sourceName, 'DAY_CONTENT members must be numeric property assignments')
    }
    if (ts.isComputedPropertyName(property.name)) {
      fail(sourceName, 'DAY_CONTENT does not allow computed day keys')
    }
    if (!ts.isNumericLiteral(property.name)) {
      fail(sourceName, 'DAY_CONTENT day keys must be numeric literals')
    }

    const day = Number(property.name.text)
    if (!Number.isInteger(day) || day < 1 || day > 21) {
      fail(sourceName, `DAY_CONTENT day ${property.name.text} is out of range 1..21`)
    }
    if (seenDays.has(day)) fail(sourceName, `DAY_CONTENT contains duplicate day ${day}`)
    seenDays.add(day)

    const expectedDay = index + 1
    if (day !== expectedDay) {
      fail(sourceName, `DAY_CONTENT lessons must be ordered 1..21; expected day ${expectedDay}, found ${day}`)
    }
    entries.push(readLesson(property.initializer, day, sourceName))
  }

  return entries
}

export function sourceFragmentSha256(entry) {
  return createHash('sha256')
    .update(`${entry.title}\n${entry.content}`, 'utf8')
    .digest('hex')
}
