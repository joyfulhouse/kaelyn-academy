import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { blogPosts, blogCategories } from "@/lib/db/schema";
import { users } from "@/lib/db/schema/users";
import { eq, and, desc, isNull, ilike, or, sql, lte } from "drizzle-orm";

/**
 * GET /api/blog - Get published blog posts for public consumption
 *
 * Query params:
 * - category: Filter by category slug
 * - search: Search in title and excerpt
 * - featured: If "true", only return featured posts
 * - limit: Number of posts to return (default: 20)
 * - offset: Pagination offset (default: 0)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const categorySlug = searchParams.get("category");
    const search = searchParams.get("search");
    const featuredOnly = searchParams.get("featured") === "true";
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);
    const offset = parseInt(searchParams.get("offset") || "0");

    // Build where conditions for published posts only
    const conditions = [
      eq(blogPosts.status, "published"),
      isNull(blogPosts.deletedAt),
      // Only show posts that have been published (publishedAt <= now)
      lte(blogPosts.publishedAt, new Date()),
    ];

    if (featuredOnly) {
      conditions.push(eq(blogPosts.isFeatured, true));
    }

    if (search) {
      conditions.push(
        or(
          ilike(blogPosts.title, `%${search}%`),
          ilike(blogPosts.excerpt, `%${search}%`)
        )!
      );
    }

    // If category filter, we need to join first to get category ID
    let categoryId: string | null = null;
    if (categorySlug) {
      const category = await db
        .select({ id: blogCategories.id })
        .from(blogCategories)
        .where(eq(blogCategories.slug, categorySlug))
        .limit(1);

      if (category.length > 0) {
        categoryId = category[0].id;
        conditions.push(eq(blogPosts.categoryId, categoryId));
      } else {
        // Category not found, return empty results
        return NextResponse.json({
          posts: [],
          total: 0,
          hasMore: false,
        });
      }
    }

    // Get total count for pagination
    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(blogPosts)
      .where(and(...conditions));

    const total = countResult?.count || 0;

    // Get posts with category and author info
    const posts = await db
      .select({
        id: blogPosts.id,
        title: blogPosts.title,
        slug: blogPosts.slug,
        excerpt: blogPosts.excerpt,
        coverImageUrl: blogPosts.coverImageUrl,
        isFeatured: blogPosts.isFeatured,
        readingTimeMinutes: blogPosts.readingTimeMinutes,
        viewCount: blogPosts.viewCount,
        publishedAt: blogPosts.publishedAt,
        categorySlug: blogCategories.slug,
        categoryName: blogCategories.name,
        authorName: users.name,
      })
      .from(blogPosts)
      .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
      .leftJoin(users, eq(blogPosts.authorId, users.id))
      .where(and(...conditions))
      .orderBy(desc(blogPosts.publishedAt))
      .limit(limit)
      .offset(offset);

    // Format posts for response
    const formattedPosts = posts.map((post) => ({
      id: post.slug, // Use slug as public ID for SEO-friendly URLs
      title: post.title,
      excerpt: post.excerpt,
      category: post.categoryName || "Uncategorized",
      categorySlug: post.categorySlug,
      author: post.authorName || "Kaelyn's Academy Team",
      publishedAt: post.publishedAt?.toISOString().split("T")[0] || "",
      readTime: `${post.readingTimeMinutes || 5} min read`,
      imageUrl: post.coverImageUrl,
      isFeatured: post.isFeatured,
      viewCount: post.viewCount,
    }));

    return NextResponse.json({
      posts: formattedPosts,
      total,
      hasMore: offset + limit < total,
    });
  } catch (error) {
    console.error("Get public blog posts error:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog posts" },
      { status: 500 }
    );
  }
}
