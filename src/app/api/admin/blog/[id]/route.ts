import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { blogPosts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const updatePostSchema = z.object({
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

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const data = updatePostSchema.parse(body);

    // Check if post exists
    const existingPost = await db.query.blogPosts.findFirst({
      where: eq(blogPosts.id, id),
    });

    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Determine if we need to set publishedAt
    const shouldSetPublishedAt =
      data.status === "published" && existingPost.status !== "published";

    const [post] = await db
      .update(blogPosts)
      .set({
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        categoryId: data.categoryId || null,
        coverImageUrl: data.coverImageUrl || null,
        metaTitle: data.metaTitle || null,
        metaDescription: data.metaDescription || null,
        status: data.status,
        publishedAt: shouldSetPublishedAt
          ? new Date()
          : existingPost.publishedAt,
        updatedAt: new Date(),
      })
      .where(eq(blogPosts.id, id))
      .returning({ id: blogPosts.id, slug: blogPosts.slug });

    return NextResponse.json({
      success: true,
      message: "Blog post updated successfully",
      post,
    });
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

    console.error("Update blog post error:", error);
    return NextResponse.json(
      {
        error: "Failed to update blog post",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Soft delete by setting status to archived
    await db
      .update(blogPosts)
      .set({
        status: "archived",
        updatedAt: new Date(),
      })
      .where(eq(blogPosts.id, id));

    return NextResponse.json({
      success: true,
      message: "Blog post archived successfully",
    });
  } catch (error) {
    console.error("Delete blog post error:", error);
    return NextResponse.json(
      {
        error: "Failed to delete blog post",
      },
      { status: 500 }
    );
  }
}
