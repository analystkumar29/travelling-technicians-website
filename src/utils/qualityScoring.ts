/**
 * Quality Scoring Engine for Device Models
 * Automatically assesses the quality of device model names using configurable rules
 */

export interface QualityRule {
  id: number;
  rule_name: string;
  rule_type: 'contamination' | 'validation' | 'enhancement';
  description: string;
  pattern_regex: string;
  pattern_flags: string;
  field_targets: string[];
  score_impact: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  is_blocking: boolean;
  priority: number;
  category: string;
  is_active: boolean;
}

export interface QualityAssessment {
  overall_score: number; // 0-100
  confidence_score: number; // 0-1
  contamination_flags: string[];
  rule_matches: RuleMatch[];
  is_blocked: boolean;
  suggestions: string[];
}

export interface RuleMatch {
  rule_name: string;
  rule_type: string;
  severity: string;
  score_impact: number;
  matched_text: string;
  field: string;
  suggestion?: string;
}

export class QualityScorer {
  private rules: QualityRule[] = [];
  private baseScore = 50; // Starting score for all models

  constructor(rules: QualityRule[]) {
    this.rules = rules.filter(rule => rule.is_active)
                     .sort((a, b) => b.priority - a.priority); // Higher priority first
  }

  /**
   * Assess the quality of a device model
   */
  assessModel(modelData: {
    name: string;
    display_name?: string;
    brand_name?: string;
    device_type?: string;
  }): QualityAssessment {
    const ruleMatches: RuleMatch[] = [];
    const contaminationFlags: string[] = [];
    const suggestions: string[] = [];
    let score = this.baseScore;
    let isBlocked = false;

    // Apply each rule
    for (const rule of this.rules) {
      const matches = this.applyRule(rule, modelData);
      
      for (const match of matches) {
        ruleMatches.push(match);
        score += match.score_impact;
        
        // Track contamination flags
        if (rule.rule_type === 'contamination') {
          contaminationFlags.push(rule.rule_name);
        }
        
        // Check if this rule blocks the model
        if (rule.is_blocking) {
          isBlocked = true;
        }
        
        // Add suggestions for improvement
        if (match.suggestion) {
          suggestions.push(match.suggestion);
        }
      }
    }

    // Ensure score stays within bounds
    score = Math.max(0, Math.min(100, score));

    // Calculate confidence based on number of rules applied and their types
    const confidenceScore = this.calculateConfidence(ruleMatches, modelData);

    return {
      overall_score: Math.round(score),
      confidence_score: Math.round(confidenceScore * 100) / 100,
      contamination_flags: [...new Set(contaminationFlags)], // Remove duplicates
      rule_matches: ruleMatches,
      is_blocked: isBlocked,
      suggestions: [...new Set(suggestions)] // Remove duplicates
    };
  }

  /**
   * Apply a single rule to model data
   */
  private applyRule(rule: QualityRule, modelData: any): RuleMatch[] {
    const matches: RuleMatch[] = [];
    
    try {
      const regex = new RegExp(rule.pattern_regex, rule.pattern_flags);
      
      // Check each target field
      for (const field of rule.field_targets) {
        const value = modelData[field];
        if (!value || typeof value !== 'string') continue;
        
        const regexMatches = [...value.matchAll(new RegExp(rule.pattern_regex, rule.pattern_flags + 'g'))];
        
        for (const regexMatch of regexMatches) {
          matches.push({
            rule_name: rule.rule_name,
            rule_type: rule.rule_type,
            severity: rule.severity,
            score_impact: rule.score_impact,
            matched_text: regexMatch[0],
            field: field,
            suggestion: this.generateSuggestion(rule, regexMatch[0], value)
          });
        }
      }
    } catch (error) {
      console.error(`Error applying rule ${rule.rule_name}:`, error);
    }
    
    return matches;
  }

  /**
   * Generate suggestions for fixing issues
   */
  private generateSuggestion(rule: QualityRule, matchedText: string, fullValue: string): string | undefined {
    switch (rule.rule_type) {
      case 'contamination':
        if (rule.rule_name.includes('technical_codes')) {
          return `Remove technical code "${matchedText}" from model name`;
        }
        if (rule.rule_name.includes('part_descriptors')) {
          return `Remove part descriptor "${matchedText}" - this should be a model name, not a part description`;
        }
        if (rule.rule_name.includes('quality_indicators')) {
          return `Remove quality indicator "${matchedText}" from model name`;
        }
        return `Remove contaminated text "${matchedText}" from model name`;
      
      case 'validation':
        return undefined; // Validation rules don't need fixing suggestions
      
      default:
        return undefined;
    }
  }

  /**
   * Calculate confidence score based on rule matches and data quality
   */
  private calculateConfidence(ruleMatches: RuleMatch[], modelData: any): number {
    let confidence = 0.5; // Base confidence
    
    // Increase confidence for positive validations
    const validationMatches = ruleMatches.filter(m => m.rule_type === 'validation');
    confidence += validationMatches.length * 0.1;
    
    // Decrease confidence for contamination
    const contaminationMatches = ruleMatches.filter(m => m.rule_type === 'contamination');
    confidence -= contaminationMatches.length * 0.1;
    
    // Adjust based on severity
    for (const match of ruleMatches) {
      switch (match.severity) {
        case 'critical':
          confidence -= 0.2;
          break;
        case 'high':
          confidence -= 0.1;
          break;
        case 'medium':
          confidence -= 0.05;
          break;
        case 'low':
          confidence += 0.02;
          break;
      }
    }
    
    // Bonus for having brand context
    if (modelData.brand_name && modelData.name && 
        modelData.name.toLowerCase().includes(modelData.brand_name.toLowerCase())) {
      confidence += 0.1;
    }
    
    // Bonus for reasonable length
    if (modelData.name && modelData.name.length >= 5 && modelData.name.length <= 50) {
      confidence += 0.05;
    }
    
    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * Batch assess multiple models
   */
  batchAssess(models: any[]): Map<number, QualityAssessment> {
    const results = new Map<number, QualityAssessment>();
    
    for (const model of models) {
      const assessment = this.assessModel(model);
      results.set(model.id, assessment);
    }
    
    return results;
  }

  /**
   * Get quality statistics for a batch of assessments
   */
  getQualityStats(assessments: QualityAssessment[]): {
    average_score: number;
    contamination_rate: number;
    blocked_count: number;
    high_quality_count: number; // Score >= 80
    low_quality_count: number;  // Score < 50
  } {
    const total = assessments.length;
    if (total === 0) {
      return {
        average_score: 0,
        contamination_rate: 0,
        blocked_count: 0,
        high_quality_count: 0,
        low_quality_count: 0
      };
    }

    const averageScore = assessments.reduce((sum, a) => sum + a.overall_score, 0) / total;
    const contaminatedCount = assessments.filter(a => a.contamination_flags.length > 0).length;
    const blockedCount = assessments.filter(a => a.is_blocked).length;
    const highQualityCount = assessments.filter(a => a.overall_score >= 80).length;
    const lowQualityCount = assessments.filter(a => a.overall_score < 50).length;

    return {
      average_score: Math.round(averageScore * 100) / 100,
      contamination_rate: Math.round((contaminatedCount / total) * 10000) / 100, // Percentage with 2 decimals
      blocked_count: blockedCount,
      high_quality_count: highQualityCount,
      low_quality_count: lowQualityCount
    };
  }
}

/**
 * Utility function to load rules from database
 */
export async function loadQualityRules(): Promise<QualityRule[]> {
  try {
    const response = await fetch('/api/management/quality-rules');
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to load quality rules');
    }
    
    return data.rules || [];
  } catch (error) {
    console.error('Error loading quality rules:', error);
    return [];
  }
}

/**
 * Factory function to create a quality scorer with rules from database
 */
export async function createQualityScorer(): Promise<QualityScorer> {
  const rules = await loadQualityRules();
  return new QualityScorer(rules);
}
