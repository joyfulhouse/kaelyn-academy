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

export const metadata: Metadata = {
  title: "Blog | Kaelyn's Academy",
  description:
    "Educational insights, product updates, and learning tips from the Kaelyn's Academy team. Discover the latest in K-12 education technology.",
};

// Placeholder posts - in a real implementation, these would come from the database
const featuredPost = {
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

const recentPosts = [
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

const categories = [
  { name: "All", count: 12 },
  { name: "Announcements", count: 3 },
  { name: "Product", count: 4 },
  { name: "Education", count: 2 },
  { name: "Privacy", count: 1 },
  { name: "Tips", count: 2 },
];

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogPage() {
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
                            category.name === "All"
                              ? "/blog"
                              : `/blog/category/${category.name.toLowerCase()}`
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
                  <form className="space-y-3">
                    <Input type="email" placeholder="your@email.com" />
                    <Button className="w-full">Subscribe</Button>
                  </form>
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
