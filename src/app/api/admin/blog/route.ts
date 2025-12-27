import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { blogPosts, blogCategories } from "@/lib/db/schema";
import { users } from "@/lib/db/schema/users";
import { eq, sql, ilike, or, and, desc, ne } from "drizzle-orm";

// GET /api/admin/blog - Get all blog posts with search/filter
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const [currentUser] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, session.user.id));

    if (!currentUser || (currentUser.role !== "platform_admin" && currentUser.role !== "school_admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const categoryId = searchParams.get("categoryId") || "";

    // Build where conditions
    const conditions = [];

    // Don't show archived posts by default unless specifically filtering for them
    if (status && status !== "all") {
      conditions.push(eq(blogPosts.status, status));
    } else if (!status || status === "all") {
      // Show all non-archived by default
      conditions.push(ne(blogPosts.status, "archived"));
    }

    if (search) {
      conditions.push(
        or(
          ilike(blogPosts.title, `%${search}%`),
          ilike(blogPosts.excerpt, `%${search}%`)
        )
      );
    }

    if (categoryId && categoryId !== "all") {
      conditions.push(eq(blogPosts.categoryId, categoryId));
    }

    // Get posts with category and author info
    const posts = await db
      .select({
        id: blogPosts.id,
        title: blogPosts.title,
        slug: blogPosts.slug,
        excerpt: blogPosts.excerpt,
        status: blogPosts.status,
        categoryId: blogPosts.categoryId,
        categoryName: blogCategories.name,
        authorId: blogPosts.authorId,
        authorName: users.name,
        coverImageUrl: blogPosts.coverImageUrl,
        publishedAt: blogPosts.publishedAt,
        createdAt: blogPosts.createdAt,
        updatedAt: blogPosts.updatedAt,
      })
      .from(blogPosts)
      .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
      .leftJoin(users, eq(blogPosts.authorId, users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(blogPosts.createdAt))
      .limit(100);

    // Get stats
    const [totalResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(blogPosts);

    const [publishedResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(blogPosts)
      .where(eq(blogPosts.status, "published"));

    const [draftResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(blogPosts)
      .where(eq(blogPosts.status, "draft"));

    // Get categories for filter dropdown
    const categories = await db
      .select({
        id: blogCategories.id,
        name: blogCategories.name,
      })
      .from(blogCategories)
      .orderBy(blogCategories.name);

    return NextResponse.json({
      posts,
      categories,
      stats: {
        total: totalResult?.count || 0,
        published: publishedResult?.count || 0,
        drafts: draftResult?.count || 0,
      },
    });
  } catch (error) {
    console.error("Get blog posts error:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog posts" },
      { status: 500 }
    );
  }
}

const createPostSchema = z.object({
  title: z.string().min(5),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/),
  excerpt: z.string().min(50).max(300),
  content: z.string().min(100),
  categoryId: z.string().optional(),
  coverImageUrl: z.string().url().optional().or(z.literal("")),
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  status: z.enum(["draft", "published", "archived"]),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const data = createPostSchema.parse(body);

    const [post] = await db
      .insert(blogPosts)
      .values({
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        categoryId: data.categoryId || null,
        coverImageUrl: data.coverImageUrl || null,
        metaTitle: data.metaTitle || null,
        metaDescription: data.metaDescription || null,
        status: data.status,
        authorId: session.user.id,
        publishedAt: data.status === "published" ? new Date() : null,
      })
      .returning({ id: blogPosts.id, slug: blogPosts.slug });

    return NextResponse.json(
      {
        success: true,
        message: "Blog post created successfully",
        post,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: error.issues,
        },
        { status: 400 }
      );
    }

    console.error("Create blog post error:", error);
    return NextResponse.json(
      {
        error: "Failed to create blog post",
      },
      { status: 500 }
    );
  }
}
