export type CatalogViewKind = 'results' | 'topic' | 'playlist'
export type CatalogViewParameters = {
  filters: { limit: number; query?: string; topic?: string }
  heading: string
}

export function catalogParameters(view: CatalogViewKind, params: Pick<URLSearchParams, 'get'>): CatalogViewParameters {
  const query = view === 'results' ? params.get('search_query')?.trim() ?? '' : ''
  const topic = view === 'topic' ? params.get('slug') || 'all' : undefined
  return {
    filters: {
      limit: 24,
      query: query || undefined,
      topic: topic === 'all' ? undefined : topic,
    },
    heading: view === 'results'
      ? (query ? `Kết quả cho “${query}”` : 'Tìm trong thư viện')
      : view === 'playlist'
        ? 'Danh sách phát'
        : topic === 'all' ? 'Tất cả chủ đề' : `Chủ đề: ${topic}`,
  }
}
