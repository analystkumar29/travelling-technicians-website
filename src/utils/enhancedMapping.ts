import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface MappingResult {
  modelId: number;
  modelName: string;
  confidence: number;
  method: string;
  supplierProduct: any;
  matchedFields: string[];
}

interface MappingQuality {
  supplierProductId: string;
  systemModelId: number;
  confidenceScore: number;
  mappingMethod: string;
  mappedAt: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
}

class EnhancedModelMapper {
  private mappingRules: MappingRule[];

  constructor() {
    this.mappingRules = [
      new ExactMatchRule(),
      new NormalizedMatchRule(),
      new FuzzyMatchRule(),
      new AbbreviationMatchRule(),
      new SynonymMatchRule(),
      new PartialMatchRule()
    ];
  }

  async findBestMatch(supplierProduct: any, existingModels: any[]): Promise<MappingResult | null> {
    let bestMatch: MappingResult | null = null;
    let highestConfidence = 0;

    for (const rule of this.mappingRules) {
      const match = await rule.match(supplierProduct, existingModels);
      if (match && match.confidence > highestConfidence) {
        bestMatch = match;
        highestConfidence = match.confidence;
      }
    }

    // Log mapping quality for monitoring
    if (bestMatch) {
      await this.logMappingQuality({
        supplierProductId: supplierProduct.id || supplierProduct.sku,
        systemModelId: bestMatch.modelId,
        confidenceScore: bestMatch.confidence,
        mappingMethod: bestMatch.method,
        mappedAt: new Date()
      });
    }

    return bestMatch;
  }

  private async logMappingQuality(quality: MappingQuality): Promise<void> {
    try {
      await supabase
        .from('mapping_quality')
        .insert({
          supplier_product_id: quality.supplierProductId,
          system_model_id: quality.systemModelId,
          confidence_score: quality.confidenceScore,
          mapping_method: quality.mappingMethod,
          mapped_at: quality.mappedAt.toISOString()
        });
    } catch (error) {
      console.error('Failed to log mapping quality:', error);
    }
  }

  async getMappingQualityReport(): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('mapping_quality')
        .select(`
          *,
          device_models(name, brands(name))
        `)
        .order('mapped_at', { ascending: false });

      if (error) throw error;

      const report = {
        totalMappings: data.length,
        averageConfidence: 0,
        methodDistribution: {} as Record<string, number>,
        lowConfidenceMappings: [] as any[],
        brandDistribution: {} as Record<string, number>
      };

      if (data.length > 0) {
        const confidences = data.map(m => m.confidence_score);
        report.averageConfidence = confidences.reduce((a, b) => a + b, 0) / confidences.length;

        // Method distribution
        data.forEach(mapping => {
          report.methodDistribution[mapping.mapping_method] = 
            (report.methodDistribution[mapping.mapping_method] || 0) + 1;
        });

        // Low confidence mappings
        report.lowConfidenceMappings = data
          .filter(m => m.confidence_score < 0.7)
          .slice(0, 10);

        // Brand distribution
        data.forEach(mapping => {
          const brandName = mapping.device_models?.brands?.name || 'Unknown';
          report.brandDistribution[brandName] = 
            (report.brandDistribution[brandName] || 0) + 1;
        });
      }

      return report;
    } catch (error) {
      console.error('Failed to get mapping quality report:', error);
      return null;
    }
  }
}

// Base mapping rule class
abstract class MappingRule {
  abstract match(supplierProduct: any, existingModels: any[]): Promise<MappingResult | null>;
  abstract getMethodName(): string;
}

// Exact match rule
class ExactMatchRule extends MappingRule {
  async match(supplierProduct: any, existingModels: any[]): Promise<MappingResult | null> {
    const supplierModelName = supplierProduct.model_name?.toLowerCase().trim();
    
    for (const model of existingModels) {
      const modelName = model.name?.toLowerCase().trim();
      if (supplierModelName === modelName) {
        return {
          modelId: model.id,
          modelName: model.name,
          confidence: 1.0,
          method: this.getMethodName(),
          supplierProduct,
          matchedFields: ['model_name']
        };
      }
    }
    return null;
  }

  getMethodName(): string {
    return 'exact_match';
  }
}

// Normalized match rule
class NormalizedMatchRule extends MappingRule {
  async match(supplierProduct: any, existingModels: any[]): Promise<MappingResult | null> {
    const supplierModelName = this.normalizeModelName(supplierProduct.model_name);
    
    for (const model of existingModels) {
      const modelName = this.normalizeModelName(model.name);
      if (supplierModelName === modelName) {
        return {
          modelId: model.id,
          modelName: model.name,
          confidence: 0.95,
          method: this.getMethodName(),
          supplierProduct,
          matchedFields: ['model_name_normalized']
        };
      }
    }
    return null;
  }

  private normalizeModelName(name: string): string {
    return name
      ?.toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, '')
      .replace(/\s+/g, '') || '';
  }

  getMethodName(): string {
    return 'normalized_match';
  }
}

// Fuzzy match rule
class FuzzyMatchRule extends MappingRule {
  async match(supplierProduct: any, existingModels: any[]): Promise<MappingResult | null> {
    const supplierModelName = supplierProduct.model_name?.toLowerCase().trim();
    
    let bestMatch: MappingResult | null = null;
    let highestSimilarity = 0;

    for (const model of existingModels) {
      const modelName = model.name?.toLowerCase().trim();
      const similarity = this.calculateSimilarity(supplierModelName, modelName);
      
      if (similarity > highestSimilarity && similarity >= 0.8) {
        highestSimilarity = similarity;
        bestMatch = {
          modelId: model.id,
          modelName: model.name,
          confidence: similarity,
          method: this.getMethodName(),
          supplierProduct,
          matchedFields: ['model_name_fuzzy']
        };
      }
    }

    return bestMatch;
  }

  private calculateSimilarity(str1: string, str2: string): number {
    if (!str1 || !str2) return 0;
    
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  getMethodName(): string {
    return 'fuzzy_match';
  }
}

// Abbreviation match rule
class AbbreviationMatchRule extends MappingRule {
  private abbreviations: Record<string, string> = {
    'iphone': 'iphone',
    'ipad': 'ipad',
    'macbook': 'macbook',
    'galaxy': 'galaxy',
    'sgs': 'galaxy',
    'pixel': 'pixel',
    'oneplus': 'oneplus',
    'xiaomi': 'xiaomi',
    'redmi': 'xiaomi'
  };

  async match(supplierProduct: any, existingModels: any[]): Promise<MappingResult | null> {
    const supplierModelName = supplierProduct.model_name?.toLowerCase().trim();
    const normalizedSupplierName = this.normalizeWithAbbreviations(supplierModelName);
    
    for (const model of existingModels) {
      const modelName = model.name?.toLowerCase().trim();
      const normalizedModelName = this.normalizeWithAbbreviations(modelName);
      
      if (normalizedSupplierName === normalizedModelName) {
        return {
          modelId: model.id,
          modelName: model.name,
          confidence: 0.9,
          method: this.getMethodName(),
          supplierProduct,
          matchedFields: ['model_name_abbreviated']
        };
      }
    }
    return null;
  }

  private normalizeWithAbbreviations(name: string): string {
    if (!name) return '';
    
    let normalized = name.toLowerCase().trim();
    
    // Apply abbreviations
    for (const [abbr, full] of Object.entries(this.abbreviations)) {
      normalized = normalized.replace(new RegExp(`\\b${abbr}\\b`, 'g'), full);
    }
    
    // Remove common words and normalize
    normalized = normalized
      .replace(/\b(pro|max|ultra|plus|mini|lite)\b/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    return normalized;
  }

  getMethodName(): string {
    return 'abbreviation_match';
  }
}

// Synonym match rule
class SynonymMatchRule extends MappingRule {
  private synonyms: Record<string, string[]> = {
    'iphone': ['iphone', 'apple iphone', 'iphone mobile'],
    'galaxy': ['galaxy', 'samsung galaxy', 'galaxy mobile'],
    'pixel': ['pixel', 'google pixel', 'pixel mobile'],
    'oneplus': ['oneplus', 'one plus', 'oneplus mobile'],
    'xiaomi': ['xiaomi', 'mi', 'xiaomi mobile'],
    'redmi': ['redmi', 'xiaomi redmi', 'redmi mobile']
  };

  async match(supplierProduct: any, existingModels: any[]): Promise<MappingResult | null> {
    const supplierModelName = supplierProduct.model_name?.toLowerCase().trim();
    const supplierSynonyms = this.getSynonyms(supplierModelName);
    
    for (const model of existingModels) {
      const modelName = model.name?.toLowerCase().trim();
      const modelSynonyms = this.getSynonyms(modelName);
      
      // Check if any synonyms match
      for (const supplierSyn of supplierSynonyms) {
        for (const modelSyn of modelSynonyms) {
          if (supplierSyn === modelSyn) {
            return {
              modelId: model.id,
              modelName: model.name,
              confidence: 0.85,
              method: this.getMethodName(),
              supplierProduct,
              matchedFields: ['model_name_synonym']
            };
          }
        }
      }
    }
    return null;
  }

  private getSynonyms(name: string): string[] {
    if (!name) return [];
    
    const synonyms = [name];
    
    // Add brand-specific synonyms
    for (const [brand, brandSynonyms] of Object.entries(this.synonyms)) {
      if (name.includes(brand)) {
        synonyms.push(...brandSynonyms);
      }
    }
    
    return [...new Set(synonyms)];
  }

  getMethodName(): string {
    return 'synonym_match';
  }
}

// Partial match rule
class PartialMatchRule extends MappingRule {
  async match(supplierProduct: any, existingModels: any[]): Promise<MappingResult | null> {
    const supplierModelName = supplierProduct.model_name?.toLowerCase().trim();
    
    let bestMatch: MappingResult | null = null;
    let highestOverlap = 0;

    for (const model of existingModels) {
      const modelName = model.name?.toLowerCase().trim();
      const overlap = this.calculateOverlap(supplierModelName, modelName);
      
      if (overlap > highestOverlap && overlap >= 0.6) {
        highestOverlap = overlap;
        bestMatch = {
          modelId: model.id,
          modelName: model.name,
          confidence: overlap * 0.8, // Reduce confidence for partial matches
          method: this.getMethodName(),
          supplierProduct,
          matchedFields: ['model_name_partial']
        };
      }
    }

    return bestMatch;
  }

  private calculateOverlap(str1: string, str2: string): number {
    if (!str1 || !str2) return 0;
    
    const words1 = str1.split(/\s+/);
    const words2 = str2.split(/\s+/);
    
    const commonWords = words1.filter(word => words2.includes(word));
    const totalWords = Math.max(words1.length, words2.length);
    
    return commonWords.length / totalWords;
  }

  getMethodName(): string {
    return 'partial_match';
  }
}

// Export the enhanced mapper
export const enhancedModelMapper = new EnhancedModelMapper();

// Utility functions for mapping quality monitoring
export async function getMappingQualityReport() {
  return await enhancedModelMapper.getMappingQualityReport();
}

export async function reviewMapping(mappingId: number, reviewedBy: string, approved: boolean) {
  try {
    await supabase
      .from('mapping_quality')
      .update({
        reviewed_by: reviewedBy,
        reviewed_at: new Date().toISOString(),
        approved: approved
      })
      .eq('id', mappingId);
    
    return { success: true };
  } catch (error) {
    console.error('Failed to review mapping:', error);
    return { success: false, error };
  }
}

export async function getLowConfidenceMappings(limit: number = 20) {
  try {
    const { data, error } = await supabase
      .from('mapping_quality')
      .select(`
        *,
        device_models(name, brands(name))
      `)
      .lt('confidence_score', 0.7)
      .is('reviewed_by', null)
      .order('confidence_score', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Failed to get low confidence mappings:', error);
    return [];
  }
} 