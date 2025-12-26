import { builder } from "../builder";
import { db } from "@/lib/db";
import { subjects, units } from "@/lib/db/schema/curriculum";
import { eq, and } from "drizzle-orm";

// Subject GraphQL type
export const SubjectType = builder.objectRef<typeof subjects.$inferSelect>("Subject");

builder.objectType(SubjectType, {
  description: "An educational subject (Math, Reading, etc.)",
  fields: (t) => ({
    id: t.exposeString("id"),
    name: t.exposeString("name"),
    slug: t.exposeString("slug"),
    description: t.exposeString("description", { nullable: true }),
    iconName: t.exposeString("iconName", { nullable: true }),
    color: t.exposeString("color", { nullable: true }),
    order: t.exposeInt("order", { nullable: true }),
    isDefault: t.exposeBoolean("isDefault", { nullable: true }),
    createdAt: t.expose("createdAt", { type: "Date" }),
    units: t.field({
      type: [UnitType],
      args: {
        gradeLevel: t.arg.int({ required: false }),
      },
      resolve: async (parent, args) => {
        const gradeLevel = args.gradeLevel;
        if (gradeLevel != null) {
          return db.query.units.findMany({
            where: and(
              eq(units.subjectId, parent.id),
              eq(units.gradeLevel, gradeLevel)
            ),
            orderBy: (units, { asc }) => [asc(units.order)],
          });
        }
        return db.query.units.findMany({
          where: eq(units.subjectId, parent.id),
          orderBy: (units, { asc }) => [asc(units.order)],
        });
      },
    }),
  }),
});

// Unit GraphQL type
export const UnitType = builder.objectRef<typeof units.$inferSelect>("Unit");

builder.objectType(UnitType, {
  description: "A chapter/module within a subject",
  fields: (t) => ({
    id: t.exposeString("id"),
    title: t.exposeString("title"),
    slug: t.exposeString("slug"),
    description: t.exposeString("description", { nullable: true }),
    gradeLevel: t.exposeInt("gradeLevel"),
    order: t.exposeInt("order", { nullable: true }),
    estimatedMinutes: t.exposeInt("estimatedMinutes", { nullable: true }),
    isPublished: t.exposeBoolean("isPublished", { nullable: true }),
    createdAt: t.expose("createdAt", { type: "Date" }),
  }),
});

// Subject queries
builder.queryField("subjects", (t) =>
  t.field({
    type: [SubjectType],
    description: "Get all subjects",
    args: {
      slug: t.arg.string({ required: false }),
    },
    resolve: async (_, args) => {
      if (args.slug) {
        const subject = await db.query.subjects.findFirst({
          where: eq(subjects.slug, args.slug),
        });
        return subject ? [subject] : [];
      }
      return db.query.subjects.findMany({
        orderBy: (subjects, { asc }) => [asc(subjects.order)],
      });
    },
  })
);

builder.queryField("subject", (t) =>
  t.field({
    type: SubjectType,
    nullable: true,
    description: "Get a subject by ID or slug",
    args: {
      id: t.arg.string({ required: false }),
      slug: t.arg.string({ required: false }),
    },
    resolve: async (_, args) => {
      if (args.id) {
        return db.query.subjects.findFirst({
          where: eq(subjects.id, args.id),
        });
      }
      if (args.slug) {
        return db.query.subjects.findFirst({
          where: eq(subjects.slug, args.slug),
        });
      }
      return null;
    },
  })
);
