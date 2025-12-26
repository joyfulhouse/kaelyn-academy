import SchemaBuilder from "@pothos/core";

// Context type for GraphQL resolvers
export interface GraphQLContext {
  user?: {
    id: string;
    email: string;
    role: string;
    organizationId?: string;
  };
}

// Create the Pothos schema builder
// Note: Using manual resolvers instead of Drizzle plugin for Neon HTTP compatibility
export const builder = new SchemaBuilder<{
  Context: GraphQLContext;
  Scalars: {
    Date: {
      Input: Date;
      Output: Date;
    };
    JSON: {
      Input: Record<string, unknown>;
      Output: Record<string, unknown>;
    };
  };
}>({});

// Define custom scalars
builder.scalarType("Date", {
  serialize: (value) => value.toISOString(),
  parseValue: (value) => new Date(value as string),
});

builder.scalarType("JSON", {
  serialize: (value) => value,
  parseValue: (value) => value as Record<string, unknown>,
});

// Initialize Query and Mutation types
builder.queryType({});
builder.mutationType({});
