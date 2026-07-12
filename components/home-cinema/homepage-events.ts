export const homepageEvents = {
  primary: 'homepage_primary_cta_clicked',
  proof: 'homepage_proof_opened',
  path: 'homepage_path_selected',
  conan: 'homepage_conan_handoff_clicked',
  originStory: 'origin_story_opened',
} as const

export type HomepageEvent = (typeof homepageEvents)[keyof typeof homepageEvents]
