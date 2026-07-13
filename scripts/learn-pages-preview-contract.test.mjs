import assert from 'node:assert/strict'
import test from 'node:test'
import {
  assertAlignedControls,
  assertDisabledLearnDocument,
  assertEnabledDiscoveryDocument,
  assertEnabledLearnDocument,
  assertNoLearnDiscoveryDocument,
} from './learn-pages-preview-contract.mjs'

test('disabled exported Learn HTML cannot pass as enabled through hidden React payload text', () => {
  const disabled = `<!doctype html><html id="__next_error__"><head>
    <meta name="robots" content="noindex"><title>Thông Phan</title>
  </head><body><div>404</div><script>Học AI để làm việc tốt hơn AI Foundation</script></body></html>`

  assert.throws(
    () => assertEnabledLearnDocument(disabled, '/learn'),
    /canonical|indexable|disabled|noindex|error/i,
  )
  assert.doesNotThrow(() => assertDisabledLearnDocument(disabled, '/learn'))
})

test('enabled Learn requires exact canonical, indexable head and semantic page content', () => {
  const enabled = `<!doctype html><html><head>
    <link rel="canonical" href="https://thongphan.com/learn">
    <title>Học AI tương tác cho công việc | Thông Phan Learn</title>
  </head><body><main><h1>Học AI để làm việc tốt hơn.</h1></main></body></html>`

  assert.doesNotThrow(() => assertEnabledLearnDocument(enabled, '/learn'))
  assert.throws(
    () => assertEnabledLearnDocument(enabled.replace('</head>', '<meta name="robots" content="noindex"></head>'), '/learn'),
    /indexable|noindex/i,
  )
  assert.throws(
    () => assertEnabledLearnDocument(enabled.replace('Học AI để làm việc tốt hơn.', 'Học AI để làm việc nhanh hơn.'), '/learn'),
    /exact semantic H1/i,
  )
})

test('discovery assertions use exact anchors and reject text-only payload matches', () => {
  const enabled = '<html><head></head><body><nav><a href="/learn">Học</a></nav><a href="/learn/free">AI Foundation</a></body></html>'
  const disabled = '<html><head></head><body><script>href:"/learn" href:"/learn/free"</script></body></html>'

  assert.doesNotThrow(() => assertEnabledDiscoveryDocument(enabled))
  assert.doesNotThrow(() => assertNoLearnDiscoveryDocument(disabled))
  assert.throws(() => assertEnabledDiscoveryDocument(disabled), /anchor|discovery/i)
})

test('deployment controls must be aligned even when each mismatched artifact is inspected', () => {
  assert.doesNotThrow(() => assertAlignedControls({ buildEnabled: true, runtimeEnabled: true }))
  assert.doesNotThrow(() => assertAlignedControls({ buildEnabled: false, runtimeEnabled: false }))
  assert.throws(
    () => assertAlignedControls({ buildEnabled: true, runtimeEnabled: false }),
    /incoherent|aligned|deployment/i,
  )
  assert.throws(
    () => assertAlignedControls({ buildEnabled: false, runtimeEnabled: true }),
    /incoherent|aligned|deployment/i,
  )
})
