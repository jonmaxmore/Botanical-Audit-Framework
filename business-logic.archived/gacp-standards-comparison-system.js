/**
 * 🔍 GACP Standards Comparison System - Complete Standards Analysis Platform
 * ระบบเปรียบเทียบมาตรฐาน GACP แบบครบถ้วน สำหรับการวิเคราะห์และเปรียบเทียบมาตรฐานต่างๆ
 *
 * Features:
 * - Multi-standards Comparison (GACP, GAP, Organic, EU-GMP, USP)
 * - Real-time Compliance Scoring
 * - Gap Analysis & Recommendations
 * - Standards Mapping & Cross-referencing
 * - Compliance Roadmap Generation
 * - Multi-language Documentation
 */

const EventEmitter = require('events');
const { v4: uuidv4 } = require('uuid');

class GACPStandardsComparisonSystem extends EventEmitter {
  constructor() {
    super();
    this.standards = new Map();
    this.comparisons = new Map();
    this.complianceProfiles = new Map();
    this.gapAnalyses = new Map();

    this.supportedStandards = [
      'GACP',
      'GAP',
      'ORGANIC',
      'EU_GMP',
      'USP',
      'WHO_GMP',
      'ISO_22000',
      'HACCP'
    ];

    this.initializeStandards();
  }

  async initialize() {
    console.log('🚀 Initializing GACP Standards Comparison System...');

    // Initialize all standards data
    this.initializeStandards();

    // Setup comparison algorithms
    this.setupComparisonAlgorithms();

    // Load existing comparisons
    await this.loadExistingComparisons();

    console.log('✅ GACP Standards Comparison System initialized successfully');
    this.emit('system:initialized');
  }

  initializeStandards() {
    // 🌿 GACP (Good Agricultural and Collection Practices) Standard
    const gacpStandard = {
      id: 'GACP',
      name: {
        th: 'มาตรฐานการปฏิบัติทางการเกษตรและการเก็บรวบรวมที่ดี',
        en: 'Good Agricultural and Collection Practices'
      },
      description: {
        th: 'มาตรฐานสำหรับการปลูกและเก็บรวบรวมพืชสมุนไพรเพื่อการแพทย์',
        en: 'Standards for cultivation and collection of medicinal plants'
      },
      version: '2024.1',
      applicableProducts: ['cannabis', 'herbs', 'medicinal_plants'],
      categories: [
        {
          id: 'personnel',
          name: { th: 'บุคลากร', en: 'Personnel' },
          weight: 15,
          requirements: [
            {
              id: 'personnel_training',
              title: { th: 'การฝึกอบรมบุคลากร', en: 'Personnel Training' },
              description: {
                th: 'บุคลากรต้องได้รับการฝึกอบรมเกี่ยวกับ GACP',
                en: 'Personnel must be trained in GACP practices'
              },
              mandatory: true,
              verificationMethod: ['documents', 'interview', 'observation'],
              points: 20
            },
            {
              id: 'hygiene_practices',
              title: { th: 'การปฏิบัติด้านสุขอนามัย', en: 'Hygiene Practices' },
              description: {
                th: 'บุคลากรต้องปฏิบัติตามหลักสุขอนามัยที่กำหนด',
                en: 'Personnel must follow established hygiene practices'
              },
              mandatory: true,
              verificationMethod: ['observation', 'records'],
              points: 15
            }
          ]
        },
        {
          id: 'premises',
          name: { th: 'สถานที่', en: 'Premises' },
          weight: 20,
          requirements: [
            {
              id: 'facility_design',
              title: { th: 'การออกแบบสิ่งปลูกสร้าง', en: 'Facility Design' },
              description: {
                th: 'สิ่งปลูกสร้างต้องออกแบบให้เหมาะสมกับการปลูกพืช',
                en: 'Facilities must be designed appropriately for plant cultivation'
              },
              mandatory: true,
              verificationMethod: ['inspection', 'blueprints'],
              points: 25
            },
            {
              id: 'environmental_control',
              title: { th: 'การควบคุมสภาพแวดล้อม', en: 'Environmental Control' },
              description: {
                th: 'มีระบบควบคุมอุณหภูมิ ความชื้น และการระบายอากาศ',
                en: 'Systems for controlling temperature, humidity, and ventilation'
              },
              mandatory: true,
              verificationMethod: ['monitoring_data', 'calibration_records'],
              points: 30
            }
          ]
        },
        {
          id: 'cultivation',
          name: { th: 'การปลูก', en: 'Cultivation' },
          weight: 25,
          requirements: [
            {
              id: 'seed_selection',
              title: { th: 'การเลือกเมล็ดพันธุ์', en: 'Seed Selection' },
              description: {
                th: 'ใช้เมล็ดพันธุ์ที่ได้รับการรับรองคุณภาพ',
                en: 'Use quality-certified seeds'
              },
              mandatory: true,
              verificationMethod: ['certificates', 'supplier_audit'],
              points: 20
            },
            {
              id: 'soil_management',
              title: { th: 'การจัดการดิน', en: 'Soil Management' },
              description: {
                th: 'ตรวจสอบและจัดการคุณภาพดินอย่างสม่ำเสมอ',
                en: 'Regular soil quality testing and management'
              },
              mandatory: true,
              verificationMethod: ['soil_test_reports', 'treatment_records'],
              points: 25
            },
            {
              id: 'water_quality',
              title: { th: 'คุณภาพน้ำ', en: 'Water Quality' },
              description: {
                th: 'ใช้น้ำที่มีคุณภาพเหมาะสมสำหรับการปลูก',
                en: 'Use water of appropriate quality for cultivation'
              },
              mandatory: true,
              verificationMethod: ['water_test_reports', 'source_monitoring'],
              points: 25
            }
          ]
        },
        {
          id: 'harvesting',
          name: { th: 'การเก็บเกี่ยว', en: 'Harvesting' },
          weight: 15,
          requirements: [
            {
              id: 'harvest_timing',
              title: { th: 'จังหวะการเก็บเกี่ยว', en: 'Harvest Timing' },
              description: {
                th: 'เก็บเกี่ยวในช่วงเวลาที่เหมาะสมเพื่อคุณภาพสูงสุด',
                en: 'Harvest at optimal timing for maximum quality'
              },
              mandatory: true,
              verificationMethod: ['harvest_records', 'quality_tests'],
              points: 20
            },
            {
              id: 'harvest_methods',
              title: { th: 'วิธีการเก็บเกี่ยว', en: 'Harvest Methods' },
              description: {
                th: 'ใช้วิธีการเก็บเกี่ยวที่ไม่ทำลายคุณภาพ',
                en: 'Use harvesting methods that preserve quality'
              },
              mandatory: true,
              verificationMethod: ['procedures', 'training_records'],
              points: 15
            }
          ]
        },
        {
          id: 'post_harvest',
          name: { th: 'หลังการเก็บเกี่ยว', en: 'Post-Harvest' },
          weight: 15,
          requirements: [
            {
              id: 'drying_curing',
              title: { th: 'การอบแห้งและบ่ม', en: 'Drying and Curing' },
              description: {
                th: 'กระบวนการอบแห้งและบ่มที่เหมาะสม',
                en: 'Appropriate drying and curing processes'
              },
              mandatory: true,
              verificationMethod: ['process_records', 'environmental_monitoring'],
              points: 25
            },
            {
              id: 'storage_conditions',
              title: { th: 'สภาพการเก็บรักษา', en: 'Storage Conditions' },
              description: {
                th: 'จัดเก็บในสภาพแวดล้อมที่เหมาะสม',
                en: 'Store in appropriate environmental conditions'
              },
              mandatory: true,
              verificationMethod: ['storage_monitoring', 'inventory_records'],
              points: 20
            }
          ]
        },
        {
          id: 'quality_assurance',
          name: { th: 'การประกันคุณภาพ', en: 'Quality Assurance' },
          weight: 10,
          requirements: [
            {
              id: 'testing_procedures',
              title: { th: 'ขั้นตอนการทดสอบ', en: 'Testing Procedures' },
              description: {
                th: 'มีขั้นตอนการทดสอบคุณภาพที่เหมาะสม',
                en: 'Appropriate quality testing procedures'
              },
              mandatory: true,
              verificationMethod: ['sop_documents', 'test_results'],
              points: 30
            }
          ]
        }
      ],
      totalPoints: 345,
      passingScore: 70
    };

    this.standards.set('GACP', gacpStandard);

    // 🌱 GAP (Good Agricultural Practices) Standard
    const gapStandard = {
      id: 'GAP',
      name: {
        th: 'มาตรฐานการปฏิบัติทางการเกษตรที่ดี',
        en: 'Good Agricultural Practices'
      },
      description: {
        th: 'มาตรฐานการเกษตรทั่วไปเพื่อความปลอดภัยของอาหาร',
        en: 'General agricultural standards for food safety'
      },
      version: '2023.2',
      applicableProducts: ['fruits', 'vegetables', 'grains', 'cannabis'],
      categories: [
        {
          id: 'site_management',
          name: { th: 'การจัดการพื้นที่', en: 'Site Management' },
          weight: 20,
          requirements: [
            {
              id: 'site_selection',
              title: { th: 'การเลือกพื้นที่', en: 'Site Selection' },
              description: {
                th: 'เลือกพื้นที่ที่เหมาะสมสำหรับการปลูก',
                en: 'Select appropriate sites for cultivation'
              },
              mandatory: true,
              verificationMethod: ['site_assessment', 'soil_analysis'],
              points: 25
            }
          ]
        },
        {
          id: 'crop_management',
          name: { th: 'การจัดการพืช', en: 'Crop Management' },
          weight: 30,
          requirements: [
            {
              id: 'variety_selection',
              title: { th: 'การเลือกพันธุ์', en: 'Variety Selection' },
              description: {
                th: 'เลือกพันธุ์ที่เหมาะสมกับสภาพแวดล้อม',
                en: 'Select varieties suitable for local conditions'
              },
              mandatory: true,
              verificationMethod: ['variety_records', 'performance_data'],
              points: 20
            }
          ]
        }
      ],
      totalPoints: 200,
      passingScore: 80
    };

    this.standards.set('GAP', gapStandard);

    // 🌿 Organic Standard
    const organicStandard = {
      id: 'ORGANIC',
      name: {
        th: 'มาตรฐานอินทรีย์',
        en: 'Organic Standards'
      },
      description: {
        th: 'มาตรฐานการผลิตอินทรีย์ที่ไม่ใช้สารเคมีสังเคราะห์',
        en: 'Organic production standards without synthetic chemicals'
      },
      version: '2024.1',
      applicableProducts: ['all_crops'],
      categories: [
        {
          id: 'prohibited_substances',
          name: { th: 'สารต้องห้าม', en: 'Prohibited Substances' },
          weight: 40,
          requirements: [
            {
              id: 'no_synthetic_pesticides',
              title: { th: 'ไม่ใช้ยาฆ่าแมลงสังเคราะห์', en: 'No Synthetic Pesticides' },
              description: {
                th: 'ห้ามใช้ยาฆ่าแมลงสังเคราะห์ทุกชนิด',
                en: 'Prohibition of all synthetic pesticides'
              },
              mandatory: true,
              verificationMethod: ['residue_testing', 'input_records'],
              points: 50
            }
          ]
        },
        {
          id: 'natural_inputs',
          name: { th: 'วัตถุดิบธรรมชาติ', en: 'Natural Inputs' },
          weight: 30,
          requirements: [
            {
              id: 'organic_fertilizers',
              title: { th: 'ปุ่ยอินทรีย์', en: 'Organic Fertilizers' },
              description: { th: 'ใช้ปุ่ยอินทรีย์เท่านั้น', en: 'Use only organic fertilizers' },
              mandatory: true,
              verificationMethod: ['supplier_certificates', 'application_records'],
              points: 30
            }
          ]
        }
      ],
      totalPoints: 250,
      passingScore: 95
    };

    this.standards.set('ORGANIC', organicStandard);

    // 🏭 EU-GMP (European Union Good Manufacturing Practices)
    const euGmpStandard = {
      id: 'EU_GMP',
      name: {
        th: 'มาตรฐานการผลิตที่ดีของสหภาพยุโรป',
        en: 'European Union Good Manufacturing Practices'
      },
      description: {
        th: 'มาตรฐานการผลิตยาและผลิตภัณฑ์สุขภาพของ EU',
        en: 'EU standards for pharmaceutical and health product manufacturing'
      },
      version: '2024.1',
      applicableProducts: ['pharmaceuticals', 'medical_cannabis', 'health_products'],
      categories: [
        {
          id: 'quality_management',
          name: { th: 'การจัดการคุณภาพ', en: 'Quality Management' },
          weight: 25,
          requirements: [
            {
              id: 'quality_system',
              title: { th: 'ระบบคุณภาพ', en: 'Quality System' },
              description: {
                th: 'มีระบบการจัดการคุณภาพที่ครบถ้วน',
                en: 'Comprehensive quality management system'
              },
              mandatory: true,
              verificationMethod: ['documentation_review', 'audit'],
              points: 40
            }
          ]
        },
        {
          id: 'premises_equipment',
          name: { th: 'สถานที่และอุปกรณ์', en: 'Premises and Equipment' },
          weight: 25,
          requirements: [
            {
              id: 'facility_qualification',
              title: { th: 'การรับรองสถานที่', en: 'Facility Qualification' },
              description: {
                th: 'สถานที่ผลิตต้องได้รับการรับรองมาตรฐาน',
                en: 'Manufacturing facilities must be qualified'
              },
              mandatory: true,
              verificationMethod: ['qualification_documents', 'inspection'],
              points: 35
            }
          ]
        }
      ],
      totalPoints: 400,
      passingScore: 85
    };

    this.standards.set('EU_GMP', euGmpStandard);

    // 🔬 USP (United States Pharmacopeia)
    const uspStandard = {
      id: 'USP',
      name: {
        th: 'เภสัชตำรับสหรัฐอเมริกา',
        en: 'United States Pharmacopeia'
      },
      description: {
        th: 'มาตรฐานเภสัชกรรมของสหรัฐอเมริกา',
        en: 'US pharmaceutical standards and monographs'
      },
      version: 'USP-NF 2024',
      applicableProducts: ['pharmaceuticals', 'dietary_supplements', 'medical_cannabis'],
      categories: [
        {
          id: 'identity_purity',
          name: { th: 'เอกลักษณ์และความบริสุทธิ์', en: 'Identity and Purity' },
          weight: 50,
          requirements: [
            {
              id: 'analytical_methods',
              title: { th: 'วิธีการวิเคราะห์', en: 'Analytical Methods' },
              description: {
                th: 'ใช้วิธีการวิเคราะห์ที่ได้รับการรับรอง',
                en: 'Use validated analytical methods'
              },
              mandatory: true,
              verificationMethod: ['method_validation', 'test_results'],
              points: 60
            }
          ]
        }
      ],
      totalPoints: 300,
      passingScore: 90
    };

    this.standards.set('USP', uspStandard);
  }

  setupComparisonAlgorithms() {
    this.comparisonAlgorithms = {
      // Algorithm to find overlapping requirements
      findOverlaps: (standard1, standard2) => {
        const overlaps = [];

        standard1.categories.forEach(cat1 => {
          cat1.requirements.forEach(req1 => {
            standard2.categories.forEach(cat2 => {
              cat2.requirements.forEach(req2 => {
                const similarity = this.calculateSimilarity(req1, req2);
                if (similarity > 0.7) {
                  // 70% similarity threshold
                  overlaps.push({
                    standard1Req: req1,
                    standard2Req: req2,
                    similarity,
                    category1: cat1.name,
                    category2: cat2.name
                  });
                }
              });
            });
          });
        });

        return overlaps;
      },

      // Algorithm to identify gaps
      findGaps: (currentStandard, targetStandard) => {
        const gaps = [];

        targetStandard.categories.forEach(targetCat => {
          targetCat.requirements.forEach(targetReq => {
            let hasEquivalent = false;

            currentStandard.categories.forEach(currentCat => {
              currentCat.requirements.forEach(currentReq => {
                const similarity = this.calculateSimilarity(currentReq, targetReq);
                if (similarity > 0.7) {
                  hasEquivalent = true;
                }
              });
            });

            if (!hasEquivalent) {
              gaps.push({
                requirement: targetReq,
                category: targetCat.name,
                priority: targetReq.mandatory ? 'high' : 'medium',
                estimatedEffort: this.estimateImplementationEffort(targetReq)
              });
            }
          });
        });

        return gaps;
      },

      // Algorithm to calculate compliance score mapping
      mapComplianceScores: (fromStandard, toStandard, currentScore) => {
        const fromTotal = fromStandard.totalPoints;
        const toTotal = toStandard.totalPoints;
        const fromPassing = fromStandard.passingScore;
        const toPassing = toStandard.passingScore;

        // Linear mapping with adjustment for different passing thresholds
        const normalizedScore = (currentScore - fromPassing) / (100 - fromPassing);
        const mappedScore = toPassing + normalizedScore * (100 - toPassing);

        return Math.max(0, Math.min(100, Math.round(mappedScore)));
      }
    };
  }

  calculateSimilarity(req1, req2) {
    // Simple similarity calculation based on keywords and concepts
    const keywords1 = this.extractKeywords(req1.title.en + ' ' + req1.description.en);
    const keywords2 = this.extractKeywords(req2.title.en + ' ' + req2.description.en);

    const intersection = keywords1.filter(word => keywords2.includes(word));
    const union = [...new Set([...keywords1, ...keywords2])];

    return intersection.length / union.length;
  }

  extractKeywords(text) {
    // Extract meaningful keywords from text
    const stopWords = [
      'the',
      'and',
      'or',
      'but',
      'in',
      'on',
      'at',
      'to',
      'for',
      'of',
      'with',
      'by',
      'a',
      'an'
    ];
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.includes(word));

    return [...new Set(words)];
  }

  estimateImplementationEffort(requirement) {
    // Estimate implementation effort based on requirement complexity
    const complexityFactors = {
      documentation: 1,
      training: 2,
      equipment: 3,
      facility: 4,
      testing: 3,
      certification: 2
    };

    let effort = 1; // Base effort
    const description = requirement.description.en.toLowerCase();

    Object.keys(complexityFactors).forEach(factor => {
      if (description.includes(factor)) {
        effort = Math.max(effort, complexityFactors[factor]);
      }
    });

    return {
      level: effort <= 1 ? 'low' : effort <= 2 ? 'medium' : effort <= 3 ? 'high' : 'very_high',
      estimatedDays: effort * 5,
      estimatedCost: effort * 10000 // Base cost in THB
    };
  }

  async loadExistingComparisons() {
    // Load existing comparison data from database
    console.log('📂 Loading existing standards comparisons...');

    // Generate sample comparison data
    this.generateSampleComparisons();
  }

  generateSampleComparisons() {
    // Generate sample comparison between GACP and GAP
    const gacpGapComparison = {
      id: uuidv4(),
      standardA: 'GACP',
      standardB: 'GAP',
      comparisonType: 'full_comparison',
      results: {
        overlapPercentage: 65,
        gapsFromAToB: 8,
        gapsFromBToA: 12,
        commonRequirements: 24,
        totalRequirements: {
          standardA: 32,
          standardB: 18
        }
      },
      createdAt: new Date(),
      lastUpdated: new Date()
    };

    this.comparisons.set(gacpGapComparison.id, gacpGapComparison);
  }

  // 🔍 Core Comparison Functions

  async compareStandards(standardAId, standardBId, options = {}) {
    const standardA = this.standards.get(standardAId);
    const standardB = this.standards.get(standardBId);

    if (!standardA || !standardB) {
      throw new Error('One or both standards not found');
    }

    const comparisonId = uuidv4();
    const comparison = {
      id: comparisonId,
      standardA: standardAId,
      standardB: standardBId,
      standardAInfo: {
        name: standardA.name,
        version: standardA.version,
        totalPoints: standardA.totalPoints,
        passingScore: standardA.passingScore
      },
      standardBInfo: {
        name: standardB.name,
        version: standardB.version,
        totalPoints: standardB.totalPoints,
        passingScore: standardB.passingScore
      },
      comparisonType: options.type || 'full_comparison',
      results: {},
      createdAt: new Date(),
      options
    };

    // Find overlapping requirements
    const overlaps = this.comparisonAlgorithms.findOverlaps(standardA, standardB);

    // Find gaps in both directions
    const gapsAToB = this.comparisonAlgorithms.findGaps(standardA, standardB);
    const gapsBToA = this.comparisonAlgorithms.findGaps(standardB, standardA);

    // Calculate statistics
    const totalReqA = this.getTotalRequirements(standardA);
    const totalReqB = this.getTotalRequirements(standardB);
    const commonReqs = overlaps.length;

    comparison.results = {
      overview: {
        overlapPercentage: Math.round((commonReqs / Math.max(totalReqA, totalReqB)) * 100),
        commonRequirements: commonReqs,
        totalRequirements: {
          [standardAId]: totalReqA,
          [standardBId]: totalReqB
        },
        gapCounts: {
          fromAToB: gapsAToB.length,
          fromBToA: gapsBToA.length
        }
      },
      overlaps: overlaps.map(overlap => ({
        similarity: Math.round(overlap.similarity * 100),
        requirementA: {
          id: overlap.standard1Req.id,
          title: overlap.standard1Req.title,
          category: overlap.category1.en,
          points: overlap.standard1Req.points
        },
        requirementB: {
          id: overlap.standard2Req.id,
          title: overlap.standard2Req.title,
          category: overlap.category2.en,
          points: overlap.standard2Req.points
        },
        mapping: this.createRequirementMapping(overlap.standard1Req, overlap.standard2Req)
      })),
      gaps: {
        [standardAId]: gapsBToA.map(gap => ({
          requirement: {
            id: gap.requirement.id,
            title: gap.requirement.title,
            description: gap.requirement.description,
            category: gap.category.en,
            mandatory: gap.requirement.mandatory,
            points: gap.requirement.points
          },
          priority: gap.priority,
          estimatedEffort: gap.estimatedEffort,
          recommendations: this.generateGapRecommendations(gap.requirement)
        })),
        [standardBId]: gapsAToB.map(gap => ({
          requirement: {
            id: gap.requirement.id,
            title: gap.requirement.title,
            description: gap.requirement.description,
            category: gap.category.en,
            mandatory: gap.requirement.mandatory,
            points: gap.requirement.points
          },
          priority: gap.priority,
          estimatedEffort: gap.estimatedEffort,
          recommendations: this.generateGapRecommendations(gap.requirement)
        }))
      },
      scoreMapping: {
        fromAToB: this.createScoreMapping(standardA, standardB),
        fromBToA: this.createScoreMapping(standardB, standardA)
      },
      implementationRoadmap: this.generateImplementationRoadmap(gapsAToB, standardBId),
      costAnalysis: this.generateCostAnalysis(gapsAToB, gapsBToA)
    };

    this.comparisons.set(comparisonId, comparison);
    this.emit('comparison:completed', { comparisonId, comparison });

    return comparison;
  }

  getTotalRequirements(standard) {
    return standard.categories.reduce((total, category) => {
      return total + category.requirements.length;
    }, 0);
  }

  createRequirementMapping(reqA, reqB) {
    return {
      equivalence: 'partial', // can be 'full', 'partial', 'none'
      mappingNotes: {
        th: 'ข้อกำหนดมีความคล้ายคลึงกันในเรื่องหลักการแต่อาจแตกต่างในรายละเอียด',
        en: 'Requirements share core principles but may differ in details'
      },
      implementationGuidance: {
        th: 'สามารถใช้ระบบเดียวกันตอบสนองทั้งสองข้อกำหนดได้โดยปรับเพิ่มเติมบางส่วน',
        en: 'Can use the same system to address both requirements with some modifications'
      }
    };
  }

  generateGapRecommendations(requirement) {
    const baseRecommendations = {
      immediate: [],
      shortTerm: [],
      longTerm: []
    };

    // Generate recommendations based on requirement type
    const description = requirement.description.en.toLowerCase();

    if (description.includes('training')) {
      baseRecommendations.immediate.push({
        action: 'Develop training program',
        description: 'Create comprehensive training materials and schedule',
        timeframe: '2-4 weeks',
        resources: ['Training materials', 'Qualified instructor']
      });
    }

    if (description.includes('documentation')) {
      baseRecommendations.immediate.push({
        action: 'Create documentation',
        description: 'Develop required procedures and record-keeping systems',
        timeframe: '1-3 weeks',
        resources: ['Technical writer', 'Subject matter expert']
      });
    }

    if (description.includes('testing') || description.includes('analysis')) {
      baseRecommendations.shortTerm.push({
        action: 'Establish testing capability',
        description: 'Set up testing procedures or identify qualified laboratory',
        timeframe: '4-8 weeks',
        resources: ['Testing equipment', 'Laboratory partnership']
      });
    }

    if (description.includes('facility') || description.includes('equipment')) {
      baseRecommendations.longTerm.push({
        action: 'Facility/Equipment upgrade',
        description: 'Plan and implement necessary facility or equipment changes',
        timeframe: '3-6 months',
        resources: ['Capital investment', 'Engineering support']
      });
    }

    return baseRecommendations;
  }

  createScoreMapping(fromStandard, toStandard) {
    const mappingTable = [];

    for (let score = 0; score <= 100; score += 10) {
      const mappedScore = this.comparisonAlgorithms.mapComplianceScores(
        fromStandard,
        toStandard,
        score
      );

      mappingTable.push({
        original: score,
        mapped: mappedScore,
        interpretation: this.getScoreInterpretation(mappedScore, toStandard)
      });
    }

    return {
      mappingTable,
      conversionFormula: {
        description: {
          th: 'การแปลงคะแนนใช้การปรับสเกลเชิงเส้นตามค่าขั้นต่ำที่ผ่านเกณฑ์',
          en: 'Score conversion uses linear scaling based on passing thresholds'
        },
        passingScoreEquivalent: this.comparisonAlgorithms.mapComplianceScores(
          fromStandard,
          toStandard,
          fromStandard.passingScore
        )
      }
    };
  }

  getScoreInterpretation(score, standard) {
    if (score >= standard.passingScore) {
      if (score >= 90) {
        return { level: 'excellent', color: 'success' };
      } else if (score >= 80) {
        return { level: 'good', color: 'primary' };
      } else {
        return { level: 'passing', color: 'warning' };
      }
    } else {
      return { level: 'failing', color: 'error' };
    }
  }

  generateImplementationRoadmap(gaps, targetStandardId) {
    const roadmap = {
      phases: [],
      totalTimeframe: '6-12 months',
      criticalPath: [],
      milestones: []
    };

    // Sort gaps by priority and effort
    const sortedGaps = gaps.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const effortOrder = { low: 1, medium: 2, high: 3, very_high: 4 };

      // Priority first, then effort (easier items first within same priority)
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;

      return effortOrder[a.estimatedEffort.level] - effortOrder[b.estimatedEffort.level];
    });

    // Create phases
    const phases = [
      {
        id: 1,
        name: { th: 'เตรียมการและวางแผน', en: 'Preparation and Planning' },
        duration: '2-4 weeks',
        gaps: [],
        objectives: [
          { th: 'วิเคราะห์ช่องว่างและจัดลำดับความสำคัญ', en: 'Analyze gaps and prioritize' },
          { th: 'จัดทำแผนการดำเนินงานรายละเอียด', en: 'Create detailed implementation plan' }
        ]
      },
      {
        id: 2,
        name: { th: 'การดำเนินงานเร่งด่วน', en: 'Critical Implementation' },
        duration: '4-8 weeks',
        gaps: [],
        objectives: []
      },
      {
        id: 3,
        name: { th: 'การพัฒนาระบบหลัก', en: 'Core System Development' },
        duration: '8-16 weeks',
        gaps: [],
        objectives: []
      },
      {
        id: 4,
        name: { th: 'การตรวจสอบและปรับปรุง', en: 'Verification and Improvement' },
        duration: '4-8 weeks',
        gaps: [],
        objectives: []
      }
    ];

    // Distribute gaps across phases
    sortedGaps.forEach((gap, index) => {
      let phaseIndex;

      if (gap.priority === 'high' && gap.estimatedEffort.level === 'low') {
        phaseIndex = 1; // Critical implementation
      } else if (gap.priority === 'high') {
        phaseIndex = 2; // Core system development
      } else if (gap.estimatedEffort.level === 'very_high') {
        phaseIndex = 2; // Core system development
      } else {
        phaseIndex = 3; // Verification and improvement
      }

      phases[phaseIndex].gaps.push({
        requirementId: gap.requirement.id,
        title: gap.requirement.title,
        priority: gap.priority,
        effort: gap.estimatedEffort,
        dependencies: this.identifyDependencies(gap, sortedGaps)
      });
    });

    roadmap.phases = phases;

    // Identify critical path
    roadmap.criticalPath = this.identifyCriticalPath(phases);

    // Create milestones
    roadmap.milestones = [
      {
        id: 1,
        name: { th: 'เสร็จสิ้นการวางแผน', en: 'Planning Complete' },
        targetWeek: 4,
        deliverables: ['Implementation plan', 'Resource allocation', 'Timeline']
      },
      {
        id: 2,
        name: { th: 'ข้อกำหนดเร่งด่วนเสร็จสิ้น', en: 'Critical Requirements Complete' },
        targetWeek: 12,
        deliverables: ['High priority items', 'Basic compliance', 'Documentation']
      },
      {
        id: 3,
        name: { th: 'ระบบหลักพร้อมใช้งาน', en: 'Core Systems Operational' },
        targetWeek: 28,
        deliverables: ['All major systems', 'Training completed', 'Initial certification']
      },
      {
        id: 4,
        name: { th: 'การรับรองเสร็จสิ้น', en: 'Certification Complete' },
        targetWeek: 36,
        deliverables: ['Full compliance', 'Final audit', 'Certificate issued']
      }
    ];

    return roadmap;
  }

  identifyDependencies(currentGap, allGaps) {
    const dependencies = [];

    // Simple dependency identification based on requirement types
    const currentType = this.categorizeRequirement(currentGap.requirement);

    allGaps.forEach(otherGap => {
      if (otherGap.requirement.id === currentGap.requirement.id) return;

      const otherType = this.categorizeRequirement(otherGap.requirement);

      // Basic dependency rules
      if (currentType === 'testing' && otherType === 'equipment') {
        dependencies.push({
          requirementId: otherGap.requirement.id,
          type: 'prerequisite',
          reason: 'Equipment needed before testing can be implemented'
        });
      }

      if (currentType === 'advanced_process' && otherType === 'basic_process') {
        dependencies.push({
          requirementId: otherGap.requirement.id,
          type: 'prerequisite',
          reason: 'Basic processes must be established first'
        });
      }
    });

    return dependencies;
  }

  categorizeRequirement(requirement) {
    const description = requirement.description.en.toLowerCase();

    if (description.includes('equipment') || description.includes('facility')) {
      return 'equipment';
    } else if (description.includes('testing') || description.includes('analysis')) {
      return 'testing';
    } else if (description.includes('training') || description.includes('personnel')) {
      return 'training';
    } else if (description.includes('documentation') || description.includes('records')) {
      return 'documentation';
    } else {
      return 'general';
    }
  }

  identifyCriticalPath(phases) {
    // Simplified critical path identification
    const criticalItems = [];

    phases.forEach(phase => {
      const highPriorityItems = phase.gaps.filter(gap => gap.priority === 'high');
      const longEffortItems = phase.gaps.filter(
        gap => gap.effort.level === 'high' || gap.effort.level === 'very_high'
      );

      [...highPriorityItems, ...longEffortItems].forEach(item => {
        if (!criticalItems.find(ci => ci.requirementId === item.requirementId)) {
          criticalItems.push(item);
        }
      });
    });

    return criticalItems;
  }

  generateCostAnalysis(gapsAToB, gapsBToA) {
    const analysis = {
      standardAToB: this.calculateImplementationCost(gapsAToB),
      standardBToA: this.calculateImplementationCost(gapsBToA),
      summary: {}
    };

    analysis.summary = {
      lowerCostDirection:
        analysis.standardAToB.total < analysis.standardBToA.total ? 'AToB' : 'BToA',
      costDifference: Math.abs(analysis.standardAToB.total - analysis.standardBToA.total),
      recommendedPath:
        analysis.standardAToB.total < analysis.standardBToA.total
          ? 'Implement standard B requirements'
          : 'Implement standard A requirements'
    };

    return analysis;
  }

  calculateImplementationCost(gaps) {
    const costBreakdown = {
      immediate: 0,
      shortTerm: 0,
      longTerm: 0,
      total: 0,
      breakdown: {
        training: 0,
        documentation: 0,
        equipment: 0,
        certification: 0,
        consulting: 0
      }
    };

    gaps.forEach(gap => {
      const baseCost = gap.estimatedEffort.estimatedCost;

      // Categorize costs
      const description = gap.requirement.description.en.toLowerCase();

      if (description.includes('training')) {
        costBreakdown.breakdown.training += baseCost;
        costBreakdown.shortTerm += baseCost;
      } else if (description.includes('documentation')) {
        costBreakdown.breakdown.documentation += baseCost;
        costBreakdown.immediate += baseCost;
      } else if (description.includes('equipment') || description.includes('facility')) {
        costBreakdown.breakdown.equipment += baseCost * 2; // Equipment typically costs more
        costBreakdown.longTerm += baseCost * 2;
      } else if (description.includes('certification') || description.includes('audit')) {
        costBreakdown.breakdown.certification += baseCost;
        costBreakdown.longTerm += baseCost;
      } else {
        costBreakdown.breakdown.consulting += baseCost;
        costBreakdown.shortTerm += baseCost;
      }
    });

    costBreakdown.total =
      costBreakdown.immediate + costBreakdown.shortTerm + costBreakdown.longTerm;

    return costBreakdown;
  }

  // 📊 Analysis and Reporting Functions

  async generateComplianceProfile(organizationId, currentCompliance) {
    const profileId = uuidv4();
    const profile = {
      id: profileId,
      organizationId,
      currentStandards: currentCompliance.standards || [],
      complianceScores: currentCompliance.scores || {},
      targetStandards: currentCompliance.targets || [],
      gaps: [],
      recommendations: [],
      roadmap: null,
      createdAt: new Date(),
      lastUpdated: new Date()
    };

    // Analyze current vs target standards
    for (const targetStandardId of profile.targetStandards) {
      for (const currentStandardId of profile.currentStandards) {
        if (currentStandardId !== targetStandardId) {
          const comparison = await this.compareStandards(currentStandardId, targetStandardId);

          profile.gaps.push({
            fromStandard: currentStandardId,
            toStandard: targetStandardId,
            gapCount: comparison.results.gaps[targetStandardId].length,
            criticalGaps: comparison.results.gaps[targetStandardId].filter(
              g => g.priority === 'high'
            ).length,
            estimatedCost: comparison.results.costAnalysis.standardAToB.total,
            estimatedTimeframe: '6-12 months'
          });
        }
      }
    }

    // Generate overall recommendations
    profile.recommendations = this.generateProfileRecommendations(profile);

    this.complianceProfiles.set(profileId, profile);
    return profile;
  }

  generateProfileRecommendations(profile) {
    const recommendations = [];

    // Analyze gaps and suggest priorities
    if (profile.gaps.length > 0) {
      const highestPriorityGap = profile.gaps.reduce((prev, current) => {
        return prev.criticalGaps > current.criticalGaps ? prev : current;
      });

      recommendations.push({
        type: 'priority_standard',
        priority: 'high',
        title: {
          th: `ควรเริ่มดำเนินการปรับปรุงเพื่อให้ตรงตามมาตรฐาน ${highestPriorityGap.toStandard} ก่อน`,
          en: `Should prioritize compliance with ${highestPriorityGap.toStandard} standard first`
        },
        reasoning: {
          th: 'มีช่องว่างสำคัญน้อยที่สุดและสามารถดำเนินการได้เร็วที่สุด',
          en: 'Has the fewest critical gaps and can be implemented most quickly'
        },
        expectedBenefits: [
          { th: 'ลดความเสี่ยงด้านกฎระเบียบ', en: 'Reduce regulatory risk' },
          { th: 'เพิ่มความน่าเชื่อถือของผลิตภัณฑ์', en: 'Increase product credibility' },
          { th: 'เตรียมพร้อมสำหรับมาตรฐานอื่น', en: 'Prepare for other standards' }
        ]
      });
    }

    // Cost optimization recommendations
    const totalEstimatedCost = profile.gaps.reduce((sum, gap) => sum + gap.estimatedCost, 0);
    if (totalEstimatedCost > 100000) {
      // 100,000 THB threshold
      recommendations.push({
        type: 'cost_optimization',
        priority: 'medium',
        title: {
          th: 'พิจารณาการดำเนินการแบบเป็นขั้นตอน',
          en: 'Consider phased implementation approach'
        },
        reasoning: {
          th: 'ค่าใช้จ่ายรวมสูง ควรแบ่งการดำเนินการเป็นระยะเพื่อกระจายต้นทุน',
          en: 'High total cost suggests phased approach to spread investment'
        },
        suggestedPhases: [
          { phase: 1, focus: 'Critical requirements', budget: '30%' },
          { phase: 2, focus: 'Core systems', budget: '50%' },
          { phase: 3, focus: 'Enhancement', budget: '20%' }
        ]
      });
    }

    return recommendations;
  }

  // 🔍 Query and Search Functions

  async searchStandards(query, filters = {}) {
    const results = [];

    this.standards.forEach((standard, id) => {
      let matches = false;

      // Text search in name and description
      if (query) {
        const searchText = (
          standard.name.en +
          ' ' +
          standard.name.th +
          ' ' +
          standard.description.en +
          ' ' +
          standard.description.th
        ).toLowerCase();

        matches = searchText.includes(query.toLowerCase());
      } else {
        matches = true; // No query means show all
      }

      // Apply filters
      if (filters.applicableProducts && filters.applicableProducts.length > 0) {
        const hasMatchingProduct = filters.applicableProducts.some(product =>
          standard.applicableProducts.includes(product)
        );
        matches = matches && hasMatchingProduct;
      }

      if (filters.minPoints) {
        matches = matches && standard.totalPoints >= filters.minPoints;
      }

      if (filters.maxPoints) {
        matches = matches && standard.totalPoints <= filters.maxPoints;
      }

      if (matches) {
        results.push({
          id,
          name: standard.name,
          description: standard.description,
          version: standard.version,
          totalPoints: standard.totalPoints,
          passingScore: standard.passingScore,
          applicableProducts: standard.applicableProducts,
          categoryCount: standard.categories.length,
          requirementCount: this.getTotalRequirements(standard)
        });
      }
    });

    return results;
  }

  async findSimilarRequirements(requirementId, standardId, threshold = 0.7) {
    const standard = this.standards.get(standardId);
    if (!standard) {
      throw new Error(`Standard '${standardId}' not found`);
    }

    let targetRequirement = null;

    // Find the target requirement
    standard.categories.forEach(category => {
      const found = category.requirements.find(req => req.id === requirementId);
      if (found) {
        targetRequirement = found;
      }
    });

    if (!targetRequirement) {
      throw new Error(`Requirement '${requirementId}' not found in standard '${standardId}'`);
    }

    const similarRequirements = [];

    // Search in all other standards
    this.standards.forEach((otherStandard, otherStandardId) => {
      if (otherStandardId === standardId) return;

      otherStandard.categories.forEach(category => {
        category.requirements.forEach(requirement => {
          const similarity = this.calculateSimilarity(targetRequirement, requirement);

          if (similarity >= threshold) {
            similarRequirements.push({
              standardId: otherStandardId,
              standardName: otherStandard.name,
              categoryName: category.name,
              requirement: {
                id: requirement.id,
                title: requirement.title,
                description: requirement.description,
                mandatory: requirement.mandatory,
                points: requirement.points
              },
              similarity: Math.round(similarity * 100),
              mappingPotential: similarity > 0.9 ? 'high' : similarity > 0.8 ? 'medium' : 'low'
            });
          }
        });
      });
    });

    // Sort by similarity
    similarRequirements.sort((a, b) => b.similarity - a.similarity);

    return {
      targetRequirement: {
        id: targetRequirement.id,
        title: targetRequirement.title,
        description: targetRequirement.description,
        standardId: standardId
      },
      similarRequirements,
      searchParameters: {
        threshold: threshold * 100,
        standardsSearched: this.standards.size - 1
      }
    };
  }

  // 📤 Export and Integration Functions

  async exportComparison(comparisonId, format = 'json') {
    const comparison = this.comparisons.get(comparisonId);
    if (!comparison) {
      throw new Error(`Comparison '${comparisonId}' not found`);
    }

    switch (format.toLowerCase()) {
      case 'pdf':
        return this.exportToPDF(comparison);
      case 'excel':
        return this.exportToExcel(comparison);
      case 'csv':
        return this.exportToCSV(comparison);
      case 'json':
      default:
        return JSON.stringify(comparison, null, 2);
    }
  }

  exportToPDF(comparison) {
    // This would require a PDF library like 'pdfkit' or 'puppeteer'
    // For now, return a structured object that can be converted to PDF
    return {
      type: 'pdf_structure',
      title: `Standards Comparison: ${comparison.standardA} vs ${comparison.standardB}`,
      sections: [
        {
          title: 'Executive Summary',
          content: {
            overlapPercentage: comparison.results.overview.overlapPercentage,
            gapCounts: comparison.results.overview.gapCounts,
            recommendation:
              comparison.results.overview.overlapPercentage > 70
                ? 'High compatibility - implementation feasible'
                : 'Significant differences - thorough planning required'
          }
        },
        {
          title: 'Detailed Gap Analysis',
          content: comparison.results.gaps
        },
        {
          title: 'Implementation Roadmap',
          content: comparison.results.implementationRoadmap
        },
        {
          title: 'Cost Analysis',
          content: comparison.results.costAnalysis
        }
      ]
    };
  }

  exportToExcel(comparison) {
    // This would require 'xlsx' library for full Excel export
    // For now, return CSV-like structure
    return this.exportToCSV(comparison);
  }

  exportToCSV(comparison) {
    let csv = 'Standards Comparison Report\n';
    csv += `Standard A,${comparison.standardA}\n`;
    csv += `Standard B,${comparison.standardB}\n`;
    csv += `Overlap Percentage,${comparison.results.overview.overlapPercentage}%\n`;
    csv += `\nGaps Analysis\n`;
    csv += 'Standard,Requirement ID,Title,Priority,Estimated Days,Estimated Cost\n';

    // Add gaps data
    Object.keys(comparison.results.gaps).forEach(standardId => {
      comparison.results.gaps[standardId].forEach(gap => {
        csv += `${standardId},${gap.requirement.id},"${gap.requirement.title.en}",${gap.priority},${gap.estimatedEffort.estimatedDays},${gap.estimatedEffort.estimatedCost}\n`;
      });
    });

    return csv;
  }

  // 🎯 Public API Methods

  getAvailableStandards() {
    return Array.from(this.standards.values()).map(standard => ({
      id: standard.id,
      name: standard.name,
      description: standard.description,
      version: standard.version,
      totalPoints: standard.totalPoints,
      passingScore: standard.passingScore,
      applicableProducts: standard.applicableProducts,
      categoryCount: standard.categories.length
    }));
  }

  getStandardById(standardId) {
    return this.standards.get(standardId);
  }

  getComparisonById(comparisonId) {
    return this.comparisons.get(comparisonId);
  }

  async getSystemStatistics() {
    return {
      totalStandards: this.standards.size,
      totalComparisons: this.comparisons.size,
      totalComplianceProfiles: this.complianceProfiles.size,
      supportedProducts: [
        ...new Set(Array.from(this.standards.values()).flatMap(s => s.applicableProducts))
      ],
      lastUpdated: new Date().toISOString()
    };
  }
}

module.exports = GACPStandardsComparisonSystem;
