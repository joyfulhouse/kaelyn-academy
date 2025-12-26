import { builder } from "./builder";

// Import all type definitions
import "./types/subject";

// Build and export the schema
export const schema = builder.toSchema();
