import proofJson from '@/content/proof/about-proof.json'

export type AboutProofMetric = {
  value: string
  label: string
  sourceHref: string
  sourceLabel: string
}

function validateAboutProof(input: unknown): AboutProofMetric[] {
  const manifest = input as { version?: number; metrics?: AboutProofMetric[] }
  if (manifest.version !== 1 || !Array.isArray(manifest.metrics)) throw new Error('Invalid About proof manifest')
  for (const metric of manifest.metrics) {
    if (!metric.value || !metric.label || !metric.sourceLabel || !metric.sourceHref?.startsWith('/library/')) {
      throw new Error('Every About metric needs a public evidence source')
    }
  }
  return manifest.metrics
}

export const aboutProof = validateAboutProof(proofJson)
