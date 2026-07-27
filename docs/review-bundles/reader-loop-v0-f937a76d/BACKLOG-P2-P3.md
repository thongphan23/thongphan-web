# Backlog P2/P3

These findings came from the single final four-axis audit. They do not block Reader Loop v0 review.

## P2

1. **Rehydrate the completed next-action card on a direct article refresh.** The completed decision persists in D1 and is visible in Inspector, but the article panel currently presents the card only in the completion response lifecycle.
2. **Cross-check curated recommendation URLs against generated library data in CI.** The current six URLs exist and the build passes, but the curation file is manual.
3. **Define preview-data retention and cleanup.** The preview stores anonymous QA records without an automatic TTL; add a bounded cleanup policy before considering any production promotion.
4. **Improve custom-question ranking after evidence exists.** v0 intentionally uses deterministic keyword scoring and one stable fallback; later rules can use more explicit problem/stage signals without introducing an LLM.

## P3

1. **Add route-specific automated accessibility and performance budgets.** Current semantic/keyboard/responsive checks pass, but `/read` does not yet have a dedicated axe-style audit or route-owned performance budget.

## Explicitly still out of scope

Login, email OTP, payment, membership, entitlement, email notification, LLM, embeddings, Vectorize, multi-tenant, CMS, generalized analytics and production rollout remain outside Reader Loop v0.
