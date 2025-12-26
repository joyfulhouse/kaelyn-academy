/**
 * Signature Optimization Tests
 */

import { describe, it, expect } from "vitest";
import {
  getVocabularyLevel,
  interpolateTemplate,
  buildSignature,
  calculateOptimizationScore,
  applyConstraints,
  generateVariants,
  optimizeSignature,
  createOptimizedSignature,
  analyzeAndSuggest,
} from "./optimizer";
import { getTemplate, getAllTemplates, READING_LEVELS } from "./templates";
import type { SignatureMetrics, OptimizationConfig, SignatureVariant } from "./types";

describe("Signature Optimization", () => {
  describe("getVocabularyLevel", () => {
    it("should return vocabulary level for valid grade", () => {
      expect(getVocabularyLevel(1)).toBe(READING_LEVELS[1].vocabulary);
      expect(getVocabularyLevel(5)).toBe(READING_LEVELS[5].vocabulary);
      expect(getVocabularyLevel(12)).toBe(READING_LEVELS[12].vocabulary);
    });

    it("should return default level for invalid grade", () => {
      expect(getVocabularyLevel(99)).toBe(READING_LEVELS[5].vocabulary);
    });
  });

  describe("interpolateTemplate", () => {
    it("should replace variables in template", () => {
      const template = "Hello {{name}}, you are in grade {{grade}}!";
      const result = interpolateTemplate(template, { name: "Alice", grade: 5 });
      expect(result).toBe("Hello Alice, you are in grade 5!");
    });

    it("should leave unmatched variables unchanged", () => {
      const template = "Hello {{name}}, {{unknown}} variable";
      const result = interpolateTemplate(template, { name: "Bob" });
      expect(result).toBe("Hello Bob, {{unknown}} variable");
    });
  });

  describe("buildSignature", () => {
    it("should build a signature from template", () => {
      const template = getTemplate("tutor");
      const signature = buildSignature(template, {
        gradeLevel: 5,
        subject: "math",
      });

      expect(signature.id).toMatch(/^sig-/);
      expect(signature.name).toContain("Grade 5");
      expect(signature.systemPrompt).toContain("5");
      expect(signature.systemPrompt).toContain("math");
      expect(signature.temperature).toBe(0.7);
    });

    it("should apply overrides", () => {
      const template = getTemplate("tutor");
      const signature = buildSignature(
        template,
        { gradeLevel: 3, subject: "reading" },
        { temperature: 0.5, maxTokens: 300 }
      );

      expect(signature.temperature).toBe(0.5);
      expect(signature.maxTokens).toBe(300);
    });
  });

  describe("calculateOptimizationScore", () => {
    it("should calculate score for accuracy goal", () => {
      const metrics: SignatureMetrics = {
        responseTime: 1000,
        tokenCount: 200,
        comprehensionScore: 0.9,
      };
      const score = calculateOptimizationScore(metrics, ["accuracy"]);
      expect(score).toBe(90);
    });

    it("should calculate score for brevity goal", () => {
      const shortMetrics: SignatureMetrics = {
        responseTime: 500,
        tokenCount: 100,
      };
      const longMetrics: SignatureMetrics = {
        responseTime: 2000,
        tokenCount: 500,
      };

      const shortScore = calculateOptimizationScore(shortMetrics, ["brevity"]);
      const longScore = calculateOptimizationScore(longMetrics, ["brevity"]);

      expect(shortScore).toBeGreaterThan(longScore);
    });

    it("should return default score for no goals", () => {
      const metrics: SignatureMetrics = { responseTime: 1000, tokenCount: 200 };
      const score = calculateOptimizationScore(metrics, []);
      expect(score).toBe(50);
    });
  });

  describe("applyConstraints", () => {
    it("should apply max tokens constraint", () => {
      const signature: SignatureVariant = {
        id: "test",
        name: "Test",
        systemPrompt: "Test prompt",
        temperature: 0.7,
        maxTokens: 1000,
        metadata: {},
      };
      const config: OptimizationConfig = {
        goals: [],
        constraints: { maxTokens: 500 },
        learnerContext: { gradeLevel: 5, subject: "math" },
      };

      const result = applyConstraints(signature, config);
      expect(result.maxTokens).toBe(500);
    });

    it("should add reading level guidance", () => {
      const signature: SignatureVariant = {
        id: "test",
        name: "Test",
        systemPrompt: "Test prompt",
        temperature: 0.7,
        maxTokens: 500,
        metadata: {},
      };
      const config: OptimizationConfig = {
        goals: [],
        constraints: { readingLevel: 3 },
        learnerContext: { gradeLevel: 3, subject: "reading" },
      };

      const result = applyConstraints(signature, config);
      expect(result.systemPrompt).toContain("grade 3");
    });

    it("should add required keywords", () => {
      const signature: SignatureVariant = {
        id: "test",
        name: "Test",
        systemPrompt: "Test prompt",
        temperature: 0.7,
        maxTokens: 500,
        metadata: {},
      };
      const config: OptimizationConfig = {
        goals: [],
        constraints: { requiredKeywords: ["fraction", "denominator"] },
        learnerContext: { gradeLevel: 4, subject: "math" },
      };

      const result = applyConstraints(signature, config);
      expect(result.systemPrompt).toContain("fraction");
      expect(result.systemPrompt).toContain("denominator");
    });
  });

  describe("generateVariants", () => {
    it("should generate multiple variants", () => {
      const baseSignature: SignatureVariant = {
        id: "base",
        name: "Base",
        systemPrompt: "Test prompt",
        temperature: 0.7,
        maxTokens: 500,
        metadata: {},
      };

      const variants = generateVariants(baseSignature, 3);
      expect(variants.length).toBe(3);
      expect(variants[0]).toEqual(baseSignature);
    });

    it("should create temperature variants", () => {
      const baseSignature: SignatureVariant = {
        id: "base",
        name: "Base",
        systemPrompt: "Test prompt",
        temperature: 0.7,
        maxTokens: 500,
        metadata: {},
      };

      const variants = generateVariants(baseSignature, 3);
      const temps = variants.map((v) => v.temperature);
      expect(new Set(temps).size).toBeGreaterThan(1);
    });
  });

  describe("optimizeSignature", () => {
    it("should optimize signature with goals", () => {
      const template = getTemplate("explanation");
      const config: OptimizationConfig = {
        goals: ["clarity", "age-appropriate"],
        constraints: {},
        learnerContext: { gradeLevel: 3, subject: "science" },
      };

      const result = optimizeSignature(template, config);
      expect(result.signature).toBeDefined();
      expect(result.score).toBeGreaterThan(0);
      expect(result.improvements.length).toBeGreaterThan(0);
    });

    it("should apply brevity goal", () => {
      const template = getTemplate("hint");
      const config: OptimizationConfig = {
        goals: ["brevity"],
        constraints: {},
        learnerContext: { gradeLevel: 5, subject: "math" },
      };

      const result = optimizeSignature(template, config);
      expect(result.signature.maxTokens).toBeLessThanOrEqual(300);
      expect(result.signature.systemPrompt).toContain("concise");
    });
  });

  describe("createOptimizedSignature", () => {
    it("should create tutor signature", () => {
      const result = createOptimizedSignature("tutor", 5, "math");
      expect(result.signature.systemPrompt).toContain("math");
      expect(result.signature.metadata.templateId).toBe("tutor-default");
    });

    it("should create assessment signature", () => {
      const result = createOptimizedSignature("assessment", 8, "science", ["accuracy"]);
      expect(result.signature.systemPrompt).toContain("science");
      expect(result.signature.temperature).toBeLessThan(0.7);
    });
  });

  describe("analyzeAndSuggest", () => {
    it("should suggest reducing tokens for slow responses", () => {
      const metrics: SignatureMetrics[] = [
        { responseTime: 4000, tokenCount: 500 },
        { responseTime: 3500, tokenCount: 450 },
      ];
      const signature: SignatureVariant = {
        id: "test",
        name: "Test",
        systemPrompt: "",
        temperature: 0.7,
        maxTokens: 800,
        metadata: {},
      };

      const suggestions = analyzeAndSuggest(metrics, signature);
      expect(suggestions.some((s) => s.includes("response time"))).toBe(true);
    });

    it("should suggest brevity for long responses", () => {
      const metrics: SignatureMetrics[] = [
        { responseTime: 1000, tokenCount: 500 },
        { responseTime: 1200, tokenCount: 600 },
      ];
      const signature: SignatureVariant = {
        id: "test",
        name: "Test",
        systemPrompt: "",
        temperature: 0.7,
        maxTokens: 800,
        metadata: {},
      };

      const suggestions = analyzeAndSuggest(metrics, signature);
      expect(suggestions.some((s) => s.includes("brevity"))).toBe(true);
    });

    it("should return positive message for good performance", () => {
      const metrics: SignatureMetrics[] = [
        { responseTime: 1000, tokenCount: 200, userSatisfaction: 0.9 },
      ];
      const signature: SignatureVariant = {
        id: "test",
        name: "Test",
        systemPrompt: "",
        temperature: 0.6,
        maxTokens: 500,
        metadata: {},
      };

      const suggestions = analyzeAndSuggest(metrics, signature);
      expect(suggestions[0]).toContain("performing well");
    });
  });

  describe("Templates", () => {
    it("should have all required templates", () => {
      const templates = getAllTemplates();
      expect(templates.length).toBe(6);

      const types = templates.map((t) => t.type);
      expect(types).toContain("tutor");
      expect(types).toContain("assessment");
      expect(types).toContain("feedback");
      expect(types).toContain("explanation");
      expect(types).toContain("hint");
      expect(types).toContain("encouragement");
    });

    it("should have valid default configs", () => {
      const templates = getAllTemplates();
      templates.forEach((template) => {
        expect(template.defaultConfig.temperature).toBeDefined();
        expect(template.defaultConfig.maxTokens).toBeDefined();
      });
    });
  });
});
