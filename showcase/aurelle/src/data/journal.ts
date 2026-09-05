export interface JournalPost {
  category: string;
  title: string;
  excerpt: string;
  image: string;
}

export const JOURNAL_SECTION = {
  eyebrow: "Journal",
  headingLines: ["Notes from", "the atelier."],
};

export const JOURNAL_POSTS: JournalPost[] = [
  {
    category: "Craft",
    title: "The Art of the First Note",
    excerpt: "Why the first thirty seconds of a fragrance decide everything that follows.",
    image: "/assets/perfume/journal/post-01.jpg",
  },
  {
    category: "Memory",
    title: "Why Memory Lives in Scent",
    excerpt: "Smell is the only sense wired straight into memory — here's what that means for design.",
    image: "/assets/perfume/journal/post-02.jpg",
  },
  {
    category: "Palette",
    title: "Inside the Aurelle Palette",
    excerpt: "How five ingredients became the vocabulary for an entire house.",
    image: "/assets/perfume/journal/post-03.jpg",
  },
];
