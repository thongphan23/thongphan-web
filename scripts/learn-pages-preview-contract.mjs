import assert from 'node:assert/strict'
import { parse } from 'parse5'

const enabledLearnExpectations = {
  '/learn': {
    title: 'Học AI tương tác cho công việc | Thông Phan Learn',
    h1: 'Học AI để làm việc tốt hơn.',
  },
  '/learn/free': {
    title: 'AI Foundation miễn phí | Thông Phan Learn',
    h1: 'AI Foundation',
  },
}

function descendants(node) {
  return [node, ...(node.childNodes ?? []).flatMap(descendants)]
}

function attribute(node, name) {
  return node.attrs?.find((item) => item.name === name)?.value
}

function visibleText(node) {
  if (node.tagName === 'script' || node.tagName === 'style') return ''
  if (node.nodeName === '#text') return node.value ?? ''
  return (node.childNodes ?? []).map(visibleText).join(' ')
}

function inspectDocument(html) {
  const document = parse(html)
  const nodes = descendants(document)
  const htmlNode = nodes.find((node) => node.tagName === 'html')
  const titleNode = nodes.find((node) => node.tagName === 'title')
  const robots = nodes
    .filter((node) => node.tagName === 'meta' && attribute(node, 'name')?.toLowerCase() === 'robots')
    .map((node) => attribute(node, 'content')?.toLowerCase() ?? '')
  return {
    errorRoot: attribute(htmlNode, 'id') === '__next_error__',
    title: visibleText(titleNode ?? {}).replace(/\s+/g, ' ').trim(),
    visibleText: visibleText(document).replace(/\s+/g, ' ').trim(),
    robots,
    canonical: nodes.find((node) => node.tagName === 'link' && attribute(node, 'rel')?.toLowerCase() === 'canonical')
      ? attribute(nodes.find((node) => node.tagName === 'link' && attribute(node, 'rel')?.toLowerCase() === 'canonical'), 'href')
      : undefined,
    h1: nodes.filter((node) => node.tagName === 'h1').map((node) => visibleText(node).replace(/\s+/g, ' ').trim()),
    anchors: nodes.filter((node) => node.tagName === 'a').map((node) => attribute(node, 'href')).filter(Boolean),
  }
}

export function assertEnabledLearnDocument(html, route) {
  const document = inspectDocument(html)
  const expected = enabledLearnExpectations[route]
  assert.ok(expected, `${route}: no enabled-document contract is defined`)
  assert.equal(document.errorRoot, false, `${route}: enabled artifact cannot use the Next error root`)
  assert.equal(document.canonical, `https://thongphan.com${route}`, `${route}: exact canonical`)
  assert.equal(document.robots.some((value) => value.includes('noindex')), false, `${route}: must be indexable`)
  assert.equal(document.title, expected.title, `${route}: exact document title`)
  assert.deepEqual(document.h1, [expected.h1], `${route}: exact semantic H1`)
  assert.doesNotMatch(document.visibleText, /TP\s*\/\s*LEARN\s*\/\s*CHƯA MỞ|Chương học này chưa lên sóng/i)
}

export function assertDisabledLearnDocument(html, route) {
  const document = inspectDocument(html)
  assert.ok(document.robots.some((value) => value.includes('noindex')), `${route}: disabled artifact must be noindex`)
  assert.ok(
    document.errorRoot || /chưa mở|404/i.test(`${document.title} ${document.visibleText}`),
    `${route}: disabled artifact marker missing`,
  )
}

export function assertEnabledDiscoveryDocument(html) {
  const { anchors } = inspectDocument(html)
  assert.ok(anchors.includes('/learn'), 'enabled discovery must contain an exact /learn anchor')
  assert.ok(anchors.includes('/learn/free'), 'enabled discovery must contain an exact /learn/free anchor')
}

export function assertNoLearnDiscoveryDocument(html) {
  const { anchors } = inspectDocument(html)
  assert.deepEqual(anchors.filter((href) => href === '/learn' || href.startsWith('/learn/')), [])
}

export function assertAlignedControls({ buildEnabled, runtimeEnabled }) {
  assert.equal(
    buildEnabled,
    runtimeEnabled,
    `incoherent deployment controls: build=${buildEnabled} runtime=${runtimeEnabled}; controls must be aligned`,
  )
}
