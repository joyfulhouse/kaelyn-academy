import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  BookOpen,
  Calendar,
  User,
  ArrowRight,
  Tag,
  Clock,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { NewsletterForm } from "@/components/marketing/newsletter-form";
import { db } from "@/lib/db";
import { blogPosts, blogCategories } from "@/lib/db/schema";
import { users } from "@/lib/db/schema/users";
import { eq, and, desc, isNull, sql, lte } from "drizzle-orm";

export const metadata: Metadata = {
  title: "Blog | Kaelyn's Academy",
  description:
    "Educational insights, product updates, and learning tips from the Kaelyn's Academy team. Discover the latest in K-12 education technology.",
};

// Fallback posts for when database is empty
const fallbackFeaturedPost = {
  id: "welcome-to-kaelyns-academy",
  title: "Welcome to Kaelyn's Academy: Our Vision for the Future of Education",
  excerpt:
    "Today we're excited to publicly launch Kaelyn's Academy, a platform that combines adaptive learning, interactive 3D visualizations, and AI-powered tutoring to make K-12 education personal, engaging, and effective for every student.",
  category: "Announcements",
  author: "Kaelyn's Academy Team",
  publishedAt: "2025-01-15",
  readTime: "5 min read",
  imageUrl: "/blog/welcome.jpg",
};

const fallbackPosts = [
  {
    id: "why-3d-visualizations-matter",
    title: "Why 3D Visualizations Matter in Education",
    excerpt:
      "Research shows that interactive visualizations can significantly improve understanding of complex concepts. Here's how we're using Three.js to bring learning to life.",
    category: "Product",
    author: "Engineering Team",
    publishedAt: "2025-01-10",
    readTime: "7 min read",
  },
  {
    id: "coppa-compliance-guide",
    title: "Understanding COPPA Compliance for Educational Apps",
    excerpt:
      "A comprehensive guide to the Children's Online Privacy Protection Act and how educational platforms can protect student privacy.",
    category: "Privacy",
    author: "Legal Team",
    publishedAt: "2025-01-08",
    readTime: "10 min read",
  },
  {
    id: "adaptive-learning-explained",
    title: "How Adaptive Learning Personalizes Education",
    excerpt:
      "Discover how AI-powered adaptive learning systems can identify knowledge gaps and create personalized learning paths for each student.",
    category: "Education",
    author: "Curriculum Team",
    publishedAt: "2025-01-05",
    readTime: "6 min read",
  },
  {
    id: "tips-for-homeschooling-parents",
    title: "10 Tips for Homeschooling Parents Using Digital Tools",
    excerpt:
      "Practical advice for parents navigating the world of digital education, from setting schedules to tracking progress effectively.",
    category: "Tips",
    author: "Education Team",
    publishedAt: "2025-01-03",
    readTime: "8 min read",
  },
  {
    id: "introducing-foreign-languages",
    title: "Introducing Foreign Language Courses: Spanish, French, and More",
    excerpt:
      "We're expanding our curriculum to include six foreign languages with interactive lessons and pronunciation practice.",
    category: "Product",
    author: "Curriculum Team",
    publishedAt: "2025-01-01",
    readTime: "4 min read",
  },
];

const fallbackCategories = [
  { name: "All", slug: null, count: 12 },
  { name: "Announcements", slug: "announcements", count: 3 },
  { name: "Product", slug: "product", count: 4 },
  { name: "Education", slug: "education", count: 2 },
  { name: "Privacy", slug: "privacy", count: 1 },
  { name: "Tips", slug: "tips", count: 2 },
];

interface BlogPost {
  id: string;
  title: string;
  excerpt: string | null;
  category: string;
  author: string;
  publishedAt: string;
  readTime: string;
  imageUrl?: string | null;
}

interface Category {
  name: string;
  slug: string | null;
  count: number;
}

async function getBlogData(): Promise<{
  featuredPost: BlogPost | null;
  recentPosts: BlogPost[];
  categories: Category[];
}> {
  try {
    // Get all published posts
    const allPosts = await db
      .select({
        id: blogPosts.slug,
        title: blogPosts.title,
        excerpt: blogPosts.excerpt,
        coverImageUrl: blogPosts.coverImageUrl,
        isFeatured: blogPosts.isFeatured,
        readingTimeMinutes: blogPosts.readingTimeMinutes,
        publishedAt: blogPosts.publishedAt,
        categoryName: blogCategories.name,
        authorName: users.name,
      })
      .from(blogPosts)
      .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
      .leftJoin(users, eq(blogPosts.authorId, users.id))
      .where(
        and(
          eq(blogPosts.status, "published"),
          isNull(blogPosts.deletedAt),
          lte(blogPosts.publishedAt, new Date())
        )
      )
      .orderBy(desc(blogPosts.publishedAt))
      .limit(20);

    // Get categories with counts
    const categoryData = await db
      .select({
        name: blogCategories.name,
        slug: blogCategories.slug,
      })
      .from(blogCategories)
      .orderBy(blogCategories.order, blogCategories.name);

    const postCounts = await db
      .select({
        categoryId: blogPosts.categoryId,
        count: sql<number>`count(*)::int`,
      })
      .from(blogPosts)
      .where(
        and(
          eq(blogPosts.status, "published"),
          isNull(blogPosts.deletedAt),
          lte(blogPosts.publishedAt, new Date())
        )
      )
      .groupBy(blogPosts.categoryId);

    // If no posts in database, use fallback
    if (allPosts.length === 0) {
      return {
        featuredPost: fallbackFeaturedPost,
        recentPosts: fallbackPosts,
        categories: fallbackCategories,
      };
    }

    // Format posts
    const formattedPosts: BlogPost[] = allPosts.map((post) => ({
      id: post.id,
      title: post.title,
      excerpt: post.excerpt,
      category: post.categoryName || "Uncategorized",
      author: post.authorName || "Kaelyn's Academy Team",
      publishedAt: post.publishedAt?.toISOString().split("T")[0] || "",
      readTime: `${post.readingTimeMinutes || 5} min read`,
      imageUrl: post.coverImageUrl,
    }));

    // Find featured post or use first post
    const featured = allPosts.find((p) => p.isFeatured);
    const featuredPost = featured
      ? formattedPosts.find((p) => p.id === featured.id)!
      : formattedPosts[0];

    // Recent posts exclude the featured one
    const recentPosts = formattedPosts.filter((p) => p.id !== featuredPost.id);

    // Build categories with counts
    const countMap = new Map<string | null, number>();
    for (const pc of postCounts) {
      countMap.set(pc.categoryId, pc.count);
    }

    const totalCount = allPosts.length;
    const categories: Category[] = [
      { name: "All", slug: null, count: totalCount },
      ...categoryData.map((cat) => ({
        name: cat.name,
        slug: cat.slug,
        count: countMap.get(cat.slug) || 0,
      })),
    ];

    return { featuredPost, recentPosts, categories };
  } catch (error) {
    console.error("Error fetching blog data:", error);
    // Return fallback on error
    return {
      featuredPost: fallbackFeaturedPost,
      recentPosts: fallbackPosts,
      categories: fallbackCategories,
    };
  }
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogPage() {
  const { featuredPost, recentPosts, categories } = await getBlogData();
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-4" variant="secondary">
            <BookOpen className="h-3 w-3 mr-1" />
            Blog
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            Insights & Updates
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Educational insights, product updates, and learning tips from our
            team of educators and engineers.
          </p>
          {/* Search Bar */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search articles..."
              className="pl-10"
            />
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {featuredPost && (
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-6">Featured</h2>
            <Card className="overflow-hidden">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="bg-gradient-to-br from-primary/20 to-primary/5 p-8 flex items-center justify-center min-h-[250px]">
                  <BookOpen className="h-24 w-24 text-primary/50" />
                </div>
                <div className="p-6 flex flex-col justify-center">
                  <Badge className="w-fit mb-3" variant="secondary">
                    {featuredPost.category}
                  </Badge>
                  <CardTitle className="text-2xl mb-3">
                    <Link
                      href={`/blog/${featuredPost.id}`}
                      className="hover:text-primary transition-colors"
                    >
                      {featuredPost.title}
                    </Link>
                  </CardTitle>
                  <CardDescription className="text-base mb-4">
                    {featuredPost.excerpt}
                  </CardDescription>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {featuredPost.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(featuredPost.publishedAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {featuredPost.readTime}
                    </span>
                  </div>
                  <Link href={`/blog/${featuredPost.id}`}>
                    <Button className="gap-2 w-fit">
                      Read More
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </section>
      )}

      <Separator className="max-w-6xl mx-auto" />

      {/* Main Content */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Posts Grid */}
            <div className="lg:col-span-3">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Recent Posts
              </h2>
              <div className="grid sm:grid-cols-2 gap-6">
                {recentPosts.map((post) => (
                  <Card key={post.id} className="flex flex-col">
                    <CardHeader>
                      <Badge className="w-fit mb-2" variant="outline">
                        <Tag className="h-3 w-3 mr-1" />
                        {post.category}
                      </Badge>
                      <CardTitle className="text-lg">
                        <Link
                          href={`/blog/${post.id}`}
                          className="hover:text-primary transition-colors"
                        >
                          {post.title}
                        </Link>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <CardDescription>{post.excerpt}</CardDescription>
                    </CardContent>
                    <CardFooter className="flex items-center justify-between text-sm text-muted-foreground border-t pt-4">
                      <span>{formatDate(post.publishedAt)}</span>
                      <span>{post.readTime}</span>
                    </CardFooter>
                  </Card>
                ))}
              </div>

              {/* Load More */}
              <div className="text-center mt-12">
                <Button variant="outline" size="lg">
                  Load More Posts
                </Button>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Categories */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {categories.map((category) => (
                      <li key={category.name}>
                        <Link
                          href={
                            category.slug === null
                              ? "/blog"
                              : `/blog/category/${category.slug}`
                          }
                          className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted transition-colors"
                        >
                          <span className="text-foreground">
                            {category.name}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {category.count}
                          </Badge>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Newsletter Signup */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Stay Updated</CardTitle>
                  <CardDescription>
                    Get the latest articles and updates delivered to your inbox.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <NewsletterForm source="blog" />
                  <p className="text-xs text-muted-foreground mt-3">
                    No spam. Unsubscribe anytime.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-primary/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Want to Contribute?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            We're always looking for guest contributors who are passionate about
            education. Share your insights with our community.
          </p>
          <Link href="/contact">
            <Button size="lg" variant="outline" className="gap-2">
              Get in Touch
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
