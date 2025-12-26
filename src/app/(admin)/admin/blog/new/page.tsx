import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BlogPostForm } from "@/components/admin/blog-post-form";
import { db } from "@/lib/db";
import { blogCategories } from "@/lib/db/schema";

export const metadata: Metadata = {
  title: "New Blog Post | Admin",
  description: "Create a new blog post.",
};

async function getCategories() {
  return db.query.blogCategories.findMany({
    orderBy: [blogCategories.name],
  });
}

export default async function NewBlogPostPage() {
  const categories = await getCategories();

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
          <h1 className="text-3xl font-bold text-foreground">New Blog Post</h1>
          <p className="text-muted-foreground">
            Create a new blog post for Kaelyn's Academy.
          </p>
        </div>
      </div>

      {/* Form */}
      <BlogPostForm categories={categories} />
    </div>
  );
}
