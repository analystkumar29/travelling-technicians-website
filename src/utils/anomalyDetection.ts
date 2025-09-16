/**
 * Automated Anomaly Detection System
 * Detects suspicious patterns and outliers in scraped data
 */

import { QualityScorer, QualityAssessment, loadQualityRules } from './qualityScoring';

export interface AnomalyDetection {
  anomaly_type: string;
  confidence_level: number; // 0-1
  severity: 'low' | 'medium' | 'high' | 'critical';
  detected_pattern: string;
  context_data: any;
  suggestion: string;
}

export interface ModelAnomalies {
  model_id: number;
  anomalies: AnomalyDetection[];
  overall_risk_score: number; // 0-1
}

export class AnomalyDetector {
  private qualityScorer: QualityScorer | null = null;

  constructor(qualityScorer?: QualityScorer) {
    this.qualityScorer = qualityScorer || null;
  }

  /**
   * Initialize with quality scorer
   */
  async initialize(): Promise<void> {
    if (!this.qualityScorer) {
      const rules = await loadQualityRules();
      this.qualityScorer = new QualityScorer(rules);
    }
  }

  /**
   * Detect anomalies in a single model
   */
  async detectModelAnomalies(modelData: {
    id: number;
    name: string;
    display_name?: string;
    brand_name?: string;
    device_type?: string;
    data_source?: string;
    import_batch_id?: string;
  }): Promise<ModelAnomalies> {
    await this.initialize();
    
    const anomalies: AnomalyDetection[] = [];

    // 1. Quality-based anomalies
    if (this.qualityScorer) {
      const qualityAssessment = this.qualityScorer.assessModel(modelData);
      const qualityAnomalies = this.detectQualityAnomalies(qualityAssessment, modelData);
      anomalies.push(...qualityAnomalies);
    }

    // 2. Pattern-based anomalies
    const patternAnomalies = this.detectPatternAnomalies(modelData);
    anomalies.push(...patternAnomalies);

    // 3. Context-based anomalies
    const contextAnomalies = this.detectContextAnomalies(modelData);
    anomalies.push(...contextAnomalies);

    // 4. Statistical anomalies (if we have batch context)
    // This would be implemented when we have a full batch of models to compare against

    // Calculate overall risk score
    const overallRiskScore = this.calculateRiskScore(anomalies);

    return {
      model_id: modelData.id,
      anomalies,
      overall_risk_score: overallRiskScore
    };
  }

  /**
   * Detect anomalies based on quality assessment
   */
  private detectQualityAnomalies(assessment: QualityAssessment, modelData: any): AnomalyDetection[] {
    const anomalies: AnomalyDetection[] = [];

    // Critical quality score
    if (assessment.overall_score < 30) {
      anomalies.push({
        anomaly_type: 'critical_quality_score',
        confidence_level: 0.9,
        severity: 'critical',
        detected_pattern: `Quality score: ${assessment.overall_score}/100`,
        context_data: {
          quality_score: assessment.overall_score,
          contamination_flags: assessment.contamination_flags,
          rule_matches: assessment.rule_matches.length
        },
        suggestion: 'Model has extremely low quality score and should be rejected'
      });
    }

    // Multiple contamination flags
    if (assessment.contamination_flags.length >= 3) {
      anomalies.push({
        anomaly_type: 'multiple_contamination',
        confidence_level: 0.8,
        severity: 'high',
        detected_pattern: assessment.contamination_flags.join(', '),
        context_data: {
          contamination_count: assessment.contamination_flags.length,
          flags: assessment.contamination_flags
        },
        suggestion: 'Model has multiple contamination issues and likely needs significant cleanup'
      });
    }

    // Blocked by critical rules
    if (assessment.is_blocked) {
      const criticalMatches = assessment.rule_matches.filter(m => m.severity === 'critical');
      anomalies.push({
        anomaly_type: 'blocked_by_critical_rule',
        confidence_level: 1.0,
        severity: 'critical',
        detected_pattern: criticalMatches.map(m => m.matched_text).join(', '),
        context_data: {
          blocking_rules: criticalMatches.map(m => m.rule_name)
        },
        suggestion: 'Model is blocked by critical quality rules and should not be used'
      });
    }

    return anomalies;
  }

  /**
   * Detect pattern-based anomalies
   */
  private detectPatternAnomalies(modelData: any): AnomalyDetection[] {
    const anomalies: AnomalyDetection[] = [];
    const name = modelData.name || '';

    // Suspicious character patterns
    if (this.hasSuspiciousCharacters(name)) {
      anomalies.push({
        anomaly_type: 'suspicious_characters',
        confidence_level: 0.7,
        severity: 'medium',
        detected_pattern: this.extractSuspiciousCharacters(name),
        context_data: { full_name: name },
        suggestion: 'Model name contains unusual characters that may indicate scraping errors'
      });
    }

    // Excessive special characters
    const specialCharCount = (name.match(/[^a-zA-Z0-9\s\-]/g) || []).length;
    if (specialCharCount > 5) {
      anomalies.push({
        anomaly_type: 'excessive_special_characters',
        confidence_level: 0.6,
        severity: 'medium',
        detected_pattern: `${specialCharCount} special characters`,
        context_data: { special_char_count: specialCharCount },
        suggestion: 'Too many special characters may indicate malformed data'
      });
    }

    // Suspiciously long names
    if (name.length > 80) {
      anomalies.push({
        anomaly_type: 'excessive_length',
        confidence_level: 0.8,
        severity: 'medium',
        detected_pattern: `${name.length} characters`,
        context_data: { name_length: name.length },
        suggestion: 'Model name is unusually long and may contain unwanted text'
      });
    }

    // Suspiciously short names
    if (name.length < 3) {
      anomalies.push({
        anomaly_type: 'insufficient_length',
        confidence_level: 0.9,
        severity: 'high',
        detected_pattern: `"${name}" (${name.length} chars)`,
        context_data: { name_length: name.length },
        suggestion: 'Model name is too short to be a valid device model'
      });
    }

    // All caps or all lowercase (potential scraping issues)
    if (name.length > 5 && (name === name.toUpperCase() || name === name.toLowerCase())) {
      anomalies.push({
        anomaly_type: 'abnormal_casing',
        confidence_level: 0.5,
        severity: 'low',
        detected_pattern: name === name.toUpperCase() ? 'ALL CAPS' : 'all lowercase',
        context_data: { casing_type: name === name.toUpperCase() ? 'upper' : 'lower' },
        suggestion: 'Unusual casing may indicate poor data formatting'
      });
    }

    return anomalies;
  }

  /**
   * Detect context-based anomalies
   */
  private detectContextAnomalies(modelData: any): AnomalyDetection[] {
    const anomalies: AnomalyDetection[] = [];
    const name = modelData.name || '';
    const brandName = modelData.brand_name || '';

    // Brand mismatch
    if (brandName && !this.nameContainsBrand(name, brandName)) {
      // Check for common brand abbreviations
      const brandAbbreviations = this.getBrandAbbreviations(brandName);
      const hasAbbreviation = brandAbbreviations.some(abbr => 
        name.toLowerCase().includes(abbr.toLowerCase())
      );

      if (!hasAbbreviation) {
        anomalies.push({
          anomaly_type: 'brand_name_mismatch',
          confidence_level: 0.6,
          severity: 'medium',
          detected_pattern: `"${name}" doesn't contain "${brandName}"`,
          context_data: { 
            model_name: name, 
            expected_brand: brandName,
            brand_abbreviations_checked: brandAbbreviations
          },
          suggestion: `Model name should contain the brand "${brandName}" or its abbreviation`
        });
      }
    }

    // Competitor brand mentions
    const competitorBrands = this.getCompetitorBrands(brandName);
    for (const competitor of competitorBrands) {
      if (name.toLowerCase().includes(competitor.toLowerCase())) {
        anomalies.push({
          anomaly_type: 'competitor_brand_mention',
          confidence_level: 0.8,
          severity: 'high',
          detected_pattern: `Contains "${competitor}" but assigned to "${brandName}"`,
          context_data: { 
            found_brand: competitor, 
            assigned_brand: brandName 
          },
          suggestion: `Model may be assigned to wrong brand - contains "${competitor}"`
        });
      }
    }

    return anomalies;
  }

  /**
   * Calculate overall risk score based on anomalies
   */
  private calculateRiskScore(anomalies: AnomalyDetection[]): number {
    if (anomalies.length === 0) return 0;

    let riskScore = 0;
    const weights = {
      critical: 0.4,
      high: 0.25,
      medium: 0.15,
      low: 0.05
    };

    for (const anomaly of anomalies) {
      const weight = weights[anomaly.severity];
      riskScore += anomaly.confidence_level * weight;
    }

    // Cap at 1.0
    return Math.min(1.0, riskScore);
  }

  /**
   * Helper methods
   */
  private hasSuspiciousCharacters(text: string): boolean {
    // Look for patterns that indicate scraping errors
    const suspiciousPatterns = [
      /[^\x00-\x7F]/g, // Non-ASCII characters
      /\$\$\$/g,       // Multiple dollar signs
      /\[\[.*?\]\]/g,  // Double brackets
      /\{\{.*?\}\}/g,  // Double braces
      /###/g,          // Multiple hashes
      /\|\|/g,         // Double pipes
    ];

    return suspiciousPatterns.some(pattern => pattern.test(text));
  }

  private extractSuspiciousCharacters(text: string): string {
    const suspicious = text.match(/[^\x00-\x7F\w\s\-]/g) || [];
    return [...new Set(suspicious)].join(', ');
  }

  private nameContainsBrand(name: string, brand: string): boolean {
    const nameLower = name.toLowerCase();
    const brandLower = brand.toLowerCase();
    
    // Direct match
    if (nameLower.includes(brandLower)) return true;
    
    // Check for partial matches (first word of brand)
    const brandFirstWord = brandLower.split(' ')[0];
    if (brandFirstWord.length > 2 && nameLower.includes(brandFirstWord)) {
      return true;
    }

    return false;
  }

  private getBrandAbbreviations(brand: string): string[] {
    const abbreviations: { [key: string]: string[] } = {
      'samsung': ['sgn', 'sgs', 'sga', 'sam'],
      'apple': ['iphone', 'ipad', 'ipod'],
      'google': ['pixel', 'nexus'],
      'oneplus': ['op', '1+'],
      'huawei': ['hw', 'honor'],
      'xiaomi': ['mi', 'redmi'],
      'lg': ['lg'],
      'sony': ['xperia'],
      'motorola': ['moto'],
      'nokia': ['nok']
    };

    return abbreviations[brand.toLowerCase()] || [];
  }

  private getCompetitorBrands(currentBrand: string): string[] {
    const allBrands = [
      'samsung', 'apple', 'google', 'oneplus', 'huawei', 
      'xiaomi', 'lg', 'sony', 'motorola', 'nokia'
    ];
    
    return allBrands.filter(brand => 
      brand.toLowerCase() !== currentBrand.toLowerCase()
    );
  }

  /**
   * Batch process multiple models
   */
  async detectBatchAnomalies(models: any[]): Promise<ModelAnomalies[]> {
    const results: ModelAnomalies[] = [];
    
    for (const model of models) {
      const anomalies = await this.detectModelAnomalies(model);
      results.push(anomalies);
    }

    return results;
  }

  /**
   * Get anomaly statistics for a batch
   */
  getAnomalyStats(batchResults: ModelAnomalies[]): {
    total_models: number;
    models_with_anomalies: number;
    high_risk_models: number; // Risk score > 0.7
    critical_anomalies: number;
    most_common_anomalies: { type: string; count: number }[];
  } {
    const total = batchResults.length;
    const withAnomalies = batchResults.filter(r => r.anomalies.length > 0).length;
    const highRisk = batchResults.filter(r => r.overall_risk_score > 0.7).length;
    
    // Count critical anomalies
    const criticalCount = batchResults.reduce((count, result) => {
      return count + result.anomalies.filter(a => a.severity === 'critical').length;
    }, 0);

    // Count anomaly types
    const anomalyTypeCounts: { [key: string]: number } = {};
    for (const result of batchResults) {
      for (const anomaly of result.anomalies) {
        anomalyTypeCounts[anomaly.anomaly_type] = (anomalyTypeCounts[anomaly.anomaly_type] || 0) + 1;
      }
    }

    // Sort by frequency
    const mostCommonAnomalies = Object.entries(anomalyTypeCounts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      total_models: total,
      models_with_anomalies: withAnomalies,
      high_risk_models: highRisk,
      critical_anomalies: criticalCount,
      most_common_anomalies: mostCommonAnomalies
    };
  }
}
