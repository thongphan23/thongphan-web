# Task 1 Report — Versioned Public Experience Registry

## Status

DONE

Commit: `b41622ed371e254e40b3edb32283b92a8b2c87c4`

## Những gì đã làm

- Tạo registry thuần TypeScript tại `lib/experiences.ts` với các type công khai `ExperienceDefinition`, `ExperienceType`, `ExperienceAvailability`, `ExperienceAccess`, `ExperienceStatus`.
- Khai báo đúng ba experience có version `1.0.0`: `expertise-asset-map`, `brain2-21-days`, `ai-foundation`.
- Thêm `getPublishedExperiences({ includeLearn })` theo fail-closed release gate: hai experience `always` luôn public; `ai-foundation` chỉ xuất hiện khi `includeLearn: true`.
- Giữ nguyên văn toàn bộ nội dung, route, access copy và metadata media theo brief.
- Thêm contract test vào `scripts/experience-registry.test.ts` và nối test này vào `package.json` ngay trước `scripts/site-journey.test.ts`.
- Không sửa repo/worktree Learn và không triển khai Task 2 trở đi.

## TDD — RED

Command:

```bash
node --import tsx --test scripts/experience-registry.test.ts
```

Kết quả liên quan: exit code `1`, failure đúng nguyên nhân expected:

```text
Error: Cannot find module '../lib/experiences'
code: 'MODULE_NOT_FOUND'
not ok 1 - scripts/experience-registry.test.ts
# pass 0
# fail 1
```

## TDD — GREEN

Command:

```bash
node --import tsx --test scripts/experience-registry.test.ts
```

Kết quả: exit code `0`.

```text
ok 1 - registry exposes stable versioned experiences with complete user-facing contracts
ok 2 - Learn is fail-closed while always-available experiences remain public
ok 3 - current Brain2 access copy stays truthful
# tests 3
# pass 3
# fail 0
```

TypeScript:

```bash
npx tsc --noEmit
```

Kết quả: exit code `0`, không có diagnostic. File cache `tsconfig.tsbuildinfo` bị TypeScript cập nhật trong lúc kiểm tra đã được phục hồi đúng HEAD và không nằm trong diff Task 1.

## Full test suite

Command:

```bash
npm test
```

Kết quả: exit code `0`.

```text
# tests 214
# pass 214
# fail 0
# cancelled 0
# skipped 0
# todo 0
```

## Files changed

- `lib/experiences.ts` — new public registry and filter.
- `scripts/experience-registry.test.ts` — new three-test contract.
- `package.json` — adds the contract test to the explicit `test` file list.

## Self-review

- Scope: chỉ ba implementation/test/config file trong brief; không chạm Learn repo/worktree, route UI, navigation hay Task 2+.
- Contract: ID order, semver shape, publication status, user-facing minimums, truth-copy và Learn fail-closed behavior đều được test bằng real module, không mock.
- Truthfulness: cả ba referenced asset paths tồn tại trong `public/images`.
- Simplicity: không thêm dependency, factory, helper hoặc abstraction ngoài interface được yêu cầu.
- Hygiene: `git diff --check` pass trước staging; generated TypeScript cache đã được loại khỏi diff.

## Concerns

Không có concern trong phạm vi Task 1.

---

## Reviewer fix — readonly public return contract

### Finding resolved

- Thêm explicit return type `readonly ExperienceDefinition[]` cho `getPublishedExperiences`.
- Thêm type-level assertion `PublishedExperiencesStayReadonly`; `npx tsc --noEmit` sẽ lỗi nếu `ReturnType<typeof getPublishedExperiences>` trở lại mutable array.
- Đổi release filter sang allowlist rõ: chỉ `always`, hoặc `learn-public` khi `includeLearn: true`; availability tương lai vẫn fail-closed.
- Thêm runtime assertions cho `access.label`, `media.position` và cặp `media.source`/`media.rights`.
- Không dùng `as`, `@ts-ignore`, runtime placeholder test hoặc dependency mới.

### RED evidence

Command:

```bash
npx tsc --noEmit
```

Kết quả trước khi thêm return annotation: exit code `2`.

```text
scripts/experience-registry.test.ts(9,3): error TS2344: Type 'false' does not satisfy the constraint 'true'.
```

Command:

```bash
node --import tsx --test scripts/experience-registry.test.ts
```

Kết quả trước khi thêm availability allowlist: exit code `1`; regression mới thất bại đúng vì `future-gate` bị public khi `includeLearn: true`.

```text
not ok 3 - unknown future availability remains fail-closed even when Learn is public
Expected values to be strictly equal:
true !== false
# pass 3
# fail 1
```

### Final verification

```bash
node --import tsx --test scripts/experience-registry.test.ts
```

Kết quả: exit code `0`; 4/4 tests pass, 0 fail, gồm regression cho unknown future availability.

```bash
npx tsc --noEmit
```

Kết quả: exit code `0`, không có diagnostic.

Scope giữ nguyên Task 1; không sửa repo Learn và không triển khai Task 2.
