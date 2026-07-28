export interface ChapterMeta {
  id: string
  path: string
  index: string
  title: string
  navLabel: string
  blurb: string
  lede: string
}

export const CHAPTERS: ChapterMeta[] = [
  {
    id: 'global',
    path: '/global-stage',
    index: 'Chapter 01',
    title: 'India on the global stage',
    navLabel: 'Global stage',
    blurb:
      'The fifth-largest economy, the most populous country, the largest recipient of remittances — and about 140th in the world by income per person. All at once.',
    lede: 'Size and rank are the easiest facts about India to state and the easiest to misread. This chapter puts the aggregate story and the per-person story on the same page, because only one of them describes a life.',
  },
  {
    id: 'living',
    path: '/living-standards',
    index: 'Chapter 02',
    title: 'What a household actually has',
    navLabel: 'Living standards',
    blurb:
      'Electricity, a toilet, a gas connection, a tap, a bank account, a phone. The unglamorous indicators that moved fastest — and the ones that did not move at all.',
    lede: 'Growth is an abstraction until it arrives as a light bulb. This chapter tracks the household amenities that changed within a single generation, and is careful about the gap between a connection provided and a service delivered.',
  },
  {
    id: 'defence',
    path: '/defence',
    index: 'Chapter 03',
    title: 'Defence: spending, building, depending',
    navLabel: 'Defence',
    blurb:
      "The world's fifth-largest military budget, a thirty-fold rise in exports from a tiny base, and an import dependence that is falling more slowly than the announcements suggest.",
    lede: 'Self-reliance in defence is a policy with a scoreboard. This chapter reads the scoreboard: what India spends, what it now builds, what it still buys, and from whom.',
  },
  {
    id: 'economy',
    path: '/economic-reform',
    index: 'Chapter 04',
    title: 'The plumbing: reform and what it moved',
    navLabel: 'Economic reform',
    blurb:
      'A single indirect tax, a bankruptcy code, an inflation target, and a payments rail carrying more transactions than any other on earth.',
    lede: 'The reforms of the last decade were mostly infrastructure — tax plumbing, insolvency procedure, digital identity, payment rails. This chapter asks what each of them measurably changed.',
  },
  {
    id: 'law',
    path: '/law-and-order',
    index: 'Chapter 05',
    title: 'Law and order',
    navLabel: 'Law & order',
    blurb:
      'A low and falling murder rate, a rising recorded rate of crimes against women, three in four prisoners awaiting trial, and five crore pending cases.',
    lede: 'This is the chapter where the data is weakest and the stakes are highest. Recorded crime measures reporting as much as offending — so this chapter is as much about how India counts as about what happens.',
  },
]

export function chapterByPath(path: string): ChapterMeta | undefined {
  return CHAPTERS.find((c) => c.path === path)
}

export function neighbours(id: string): { prev?: ChapterMeta; next?: ChapterMeta } {
  const i = CHAPTERS.findIndex((c) => c.id === id)
  return { prev: CHAPTERS[i - 1], next: CHAPTERS[i + 1] }
}
