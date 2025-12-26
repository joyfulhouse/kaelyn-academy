import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { blogPosts } from "@/lib/db/schema";

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
