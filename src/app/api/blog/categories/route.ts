import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { blogPosts, blogCategories } from "@/lib/db/schema";
import { eq, sql, isNull, and, lte } from "drizzle-orm";

/**
 * GET /api/blog/categories - Get all blog categories with post counts
 */
export async function GET() {
  try {
    // Get categories with post counts
    const categories = await db
      .select({
        id: blogCategories.id,
        name: blogCategories.name,
        slug: blogCategories.slug,
        description: blogCategories.description,
        color: blogCategories.color,
        order: blogCategories.order,
      })
      .from(blogCategories)
      .orderBy(blogCategories.order, blogCategories.name);

    // Get post counts per category
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

    // Get total published posts count
    const [totalResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(blogPosts)
      .where(
        and(
          eq(blogPosts.status, "published"),
          isNull(blogPosts.deletedAt),
          lte(blogPosts.publishedAt, new Date())
        )
      );

    const countMap = new Map(
      postCounts.map((pc) => [pc.categoryId, pc.count])
    );

    // Format categories with counts
    const formattedCategories = [
      { name: "All", slug: null, count: totalResult?.count || 0 },
      ...categories.map((cat) => ({
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        color: cat.color,
        count: countMap.get(cat.id) || 0,
      })),
    ];

    return NextResponse.json({
      categories: formattedCategories,
    });
  } catch (error) {
    console.error("Get blog categories error:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
