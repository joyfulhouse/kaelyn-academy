import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { blogPosts, blogCategories } from "@/lib/db/schema";
import { users } from "@/lib/db/schema/users";
import { eq, and, isNull, sql, desc, ne, lte } from "drizzle-orm";

/**
 * GET /api/blog/[slug] - Get a single published blog post by slug
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Get the post with author and category
    const result = await db
      .select({
        id: blogPosts.id,
        title: blogPosts.title,
        slug: blogPosts.slug,
        excerpt: blogPosts.excerpt,
        content: blogPosts.content,
        coverImageUrl: blogPosts.coverImageUrl,
        isFeatured: blogPosts.isFeatured,
        readingTimeMinutes: blogPosts.readingTimeMinutes,
        viewCount: blogPosts.viewCount,
        publishedAt: blogPosts.publishedAt,
        tags: blogPosts.tags,
        metaTitle: blogPosts.metaTitle,
        metaDescription: blogPosts.metaDescription,
        categorySlug: blogCategories.slug,
        categoryName: blogCategories.name,
        authorId: users.id,
        authorName: users.name,
        authorImage: users.image,
      })
      .from(blogPosts)
      .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
      .leftJoin(users, eq(blogPosts.authorId, users.id))
      .where(
        and(
          eq(blogPosts.slug, slug),
          eq(blogPosts.status, "published"),
          isNull(blogPosts.deletedAt),
          lte(blogPosts.publishedAt, new Date())
        )
      )
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    const post = result[0];

    // Increment view count (fire and forget)
    db.update(blogPosts)
      .set({ viewCount: sql`${blogPosts.viewCount} + 1` })
      .where(eq(blogPosts.id, post.id))
      .execute()
      .catch(console.error);

    // Get related posts (same category, different post)
    const relatedPosts = await db
      .select({
        id: blogPosts.slug,
        title: blogPosts.title,
        excerpt: blogPosts.excerpt,
        publishedAt: blogPosts.publishedAt,
        readingTimeMinutes: blogPosts.readingTimeMinutes,
        categoryName: blogCategories.name,
      })
      .from(blogPosts)
      .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
      .where(
        and(
          eq(blogPosts.status, "published"),
          isNull(blogPosts.deletedAt),
          ne(blogPosts.slug, slug),
          lte(blogPosts.publishedAt, new Date())
        )
      )
      .orderBy(desc(blogPosts.publishedAt))
      .limit(3);

    // Format the response
    const formattedPost = {
      id: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      category: post.categoryName || "Uncategorized",
      categorySlug: post.categorySlug,
      author: {
        name: post.authorName || "Kaelyn's Academy Team",
        image: post.authorImage,
      },
      publishedAt: post.publishedAt?.toISOString().split("T")[0] || "",
      readTime: `${post.readingTimeMinutes || 5} min read`,
      imageUrl: post.coverImageUrl,
      tags: post.tags || [],
      viewCount: post.viewCount,
      meta: {
        title: post.metaTitle || post.title,
        description: post.metaDescription || post.excerpt,
      },
    };

    const formattedRelated = relatedPosts.map((p) => ({
      id: p.id,
      title: p.title,
      excerpt: p.excerpt,
      category: p.categoryName || "Uncategorized",
      publishedAt: p.publishedAt?.toISOString().split("T")[0] || "",
      readTime: `${p.readingTimeMinutes || 5} min read`,
    }));

    return NextResponse.json({
      post: formattedPost,
      relatedPosts: formattedRelated,
    });
  } catch (error) {
    console.error("Get blog post error:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog post" },
      { status: 500 }
    );
  }
}
