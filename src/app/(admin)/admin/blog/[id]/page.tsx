import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BlogPostForm } from "@/components/admin/blog-post-form";
import { db } from "@/lib/db";
import { blogPosts, blogCategories } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const metadata: Metadata = {
  title: "Edit Blog Post | Admin",
  description: "Edit an existing blog post.",
};

async function getPost(id: string) {
  return db.query.blogPosts.findFirst({
    where: eq(blogPosts.id, id),
  });
}

async function getCategories() {
  return db.query.blogCategories.findMany({
    orderBy: [blogCategories.name],
  });
}

interface EditBlogPostPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBlogPostPage({ params }: EditBlogPostPageProps) {
  const { id } = await params;
  const [post, categories] = await Promise.all([getPost(id), getCategories()]);

  if (!post) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/blog">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Edit Blog Post</h1>
          <p className="text-muted-foreground">
            Update "{post.title}"
          </p>
        </div>
      </div>

      {/* Form */}
      <BlogPostForm post={post} categories={categories} />
    </div>
  );
}
