export interface BlogCategory {
  key: string
  label: string
  journeys?: string[]
  categories?: string[]
  slugs?: string[]
}

export interface BlogPostItem {
  slug: string
  title: string
  description: string
  category: string
  publishedAt?: string
  readingTime?: number
  coverImage?: string
  journeyLabel: string
  readerState?: string
  journeyContext?: string
}

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim()
}

export function filterBlogPosts(
  posts: BlogPostItem[],
  categories: BlogCategory[],
  selectedCategory: string,
  searchQuery: string,
): BlogPostItem[] {
  const selectedFilter = categories.find((category) => category.key === selectedCategory)
  const query = normalize(searchQuery)

  return posts.filter((post) => {
    const matchesCategory =
      selectedCategory === 'all' ||
      selectedFilter?.slugs?.includes(post.slug) ||
      selectedFilter?.journeys?.includes(post.journeyLabel) ||
      selectedFilter?.categories?.includes(post.category) ||
      post.category === selectedCategory
    const searchable = normalize(`${post.title} ${post.description} ${post.journeyLabel} ${post.category}`)

    return Boolean(matchesCategory && (!query || searchable.includes(query)))
  })
}
