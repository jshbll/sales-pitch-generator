import { GalleryImage } from "../../components/shared/ContentImageGallery";

// Qwen API configuration
const QWEN_API_BASE = import.meta.env.VITE_QWEN_API_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1';
const QWEN_API_KEY = import.meta.env.VITE_QWEN_API_KEY;
const QWEN_MODEL = import.meta.env.VITE_QWEN_MODEL || 'qwen2.5-32b-instruct';

interface ImageAnalysisResult {
  description: string;
  elements: string[];
  mood: string;
  colors: string[];
  productType?: string;
  targetAudience?: string;
}

interface HeadlineGenerationParams {
  discountType: 'percentage' | 'fixed' | 'bogo';
  discountValue: number;
  bogoDetails?: {
    needToBuy: number;
    discountPercent: number;
  };
  discountAppliesTo?: 'single_item' | 'total_order' | 'tiered';
  appliesToItem?: string;
  imageAnalysis?: ImageAnalysisResult;
  businessCategory?: string;
  businessName?: string;
  businessDescription?: string;
  businessLocation?: string;
}

interface DescriptionGenerationParams {
  selectedHeadline: string;
  discountType: 'percentage' | 'fixed' | 'bogo';
  discountValue: number;
  bogoDetails?: {
    needToBuy: number;
    discountPercent: number;
  };
  discountAppliesTo?: 'single_item' | 'total_order' | 'tiered';
  appliesToItem?: string;
  imageAnalysis?: ImageAnalysisResult;
  businessCategory?: string;
  businessDescription?: string;
  businessLocation?: string;
}

interface KeywordGenerationParams {
  selectedHeadline?: string;
  selectedDescription?: string;
  discountType?: 'percentage' | 'fixed' | 'bogo';
  discountValue?: number;
  imageAnalysis?: ImageAnalysisResult;
  businessCategory?: string;
  businessName?: string;
  businessDescription?: string;
  businessLocation?: string;
}

interface TermsConditionsParams {
  discountType: 'percentage' | 'fixed' | 'bogo';
  discountValue: number;
  bogoDetails?: {
    needToBuy: number;
    discountPercent: number;
  };
  discountAppliesTo?: 'single_item' | 'total_order' | 'tiered';
  appliesToItem?: string;
  businessCategory?: string;
  businessName?: string;
  businessDescription?: string;
}

interface EventTitleGenerationParams {
  eventBrief?: string; // HIGHEST PRIORITY - user's brief description
  eventCategory?: string;
  eventType?: string;
  imageAnalysis?: ImageAnalysisResult;
  businessCategory?: string;
  businessName?: string;
  businessDescription?: string;
  businessLocation?: string;
  maxCapacity?: number;
  isVirtual?: boolean;
  startDate?: Date;
  endDate?: Date;
}

interface EventDescriptionGenerationParams {
  eventBrief?: string; // HIGHEST PRIORITY - user's brief description
  selectedTitle: string;
  eventCategory?: string;
  eventType?: string;
  imageAnalysis?: ImageAnalysisResult;
  businessCategory?: string;
  businessDescription?: string;
  businessLocation?: string;
  maxCapacity?: number;
  isVirtual?: boolean;
}

interface EventKeywordGenerationParams {
  eventBrief?: string; // HIGHEST PRIORITY - user's brief description
  selectedTitle?: string;
  selectedDescription?: string;
  eventCategory?: string;
  eventType?: string;
  imageAnalysis?: ImageAnalysisResult;
  businessCategory?: string;
  businessName?: string;
  businessDescription?: string;
  businessLocation?: string;
  isVirtual?: boolean;
}

interface EventGuidelinesParams {
  eventBrief?: string; // HIGHEST PRIORITY - user's brief description
  eventCategory?: string;
  eventType?: string;
  businessCategory?: string;
  businessName?: string;
  businessDescription?: string;
  maxCapacity?: number;
  isVirtual?: boolean;
  startDate?: Date;
  endDate?: Date;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class QwenService {
  private apiKey: string;
  private baseUrl: string;
  private model: string;
  private cache: Map<string, CacheEntry<any>>;
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    if (!QWEN_API_KEY) {
      console.warn('Qwen API key not configured. AI suggestions will fall back to static templates.');
    }
    this.apiKey = QWEN_API_KEY || '';
    this.baseUrl = QWEN_API_BASE;
    this.model = QWEN_MODEL;
    this.cache = new Map();

    // Debug logging
    console.log('[QwenService] Configuration:', {
      hasApiKey: !!this.apiKey,
      keyPrefix: this.apiKey ? this.apiKey.substring(0, 8) + '...' : 'none',
      baseUrl: this.baseUrl,
      model: this.model
    });
  }

  /**
   * Get cached data if available and not expired
   */
  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    console.log('[QwenService] 💾 Cache hit for key:', key);
    return entry.data as T;
  }

  /**
   * Store data in cache
   */
  private setCache<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
    console.log('[QwenService] 💾 Cached data for key:', key, 'TTL:', ttl);
  }

  /**
   * Generate cache key from parameters
   */
  private generateCacheKey(prefix: string, params: any): string {
    return `${prefix}:${JSON.stringify(params)}`;
  }

  /**
   * Check if the Qwen API is configured and available
   */
  isAvailable(): boolean {
    return !!this.apiKey;
  }

  /**
   * Analyze promotion images to extract context for better suggestions
   */
  async analyzePromotionImages(images: GalleryImage[]): Promise<ImageAnalysisResult | null> {
    if (!this.isAvailable() || !images.length) {
      return null;
    }
    
    console.log('[QwenService] 🖼️ analyzePromotionImages called with', images.length, 'images');

    try {
      // Get the primary image or first image
      const primaryImage = images.find(img => img.is_primary) || images[0];
      
      const prompt = `IMPORTANT: Only describe what you can clearly and definitively see in this image. Do not guess or assume.

Analyze this promotional image and tell me:

1. What SPECIFIC products, items, or services are clearly visible? (Be precise - if you see food, specify what type; if you see clothing, specify what items)
2. What text, logos, or branding can you read in the image?
3. What is the setting or environment shown?
4. What are the exact colors you can see?
5. What is the overall visual style (modern, vintage, minimalist, busy, etc.)?
6. What emotions or mood does the visual composition create?

Only state what you can definitively observe. If something is unclear or ambiguous, say so rather than guessing.`;

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      };
      
      console.log('[QwenService] Making image analysis request:', {
        url: `${this.baseUrl}/chat/completions`,
        hasAuth: !!this.apiKey,
        authHeader: this.apiKey ? `Bearer ${this.apiKey.substring(0, 8)}...` : 'none',
        imageUrl: primaryImage.image_url,
        imageIsPrimary: primaryImage.is_primary,
        imageUrlLength: primaryImage.image_url?.length,
        isValidUrl: primaryImage.image_url?.startsWith('http')
      });
      
      // Validate image URL
      if (!primaryImage.image_url || !primaryImage.image_url.startsWith('http')) {
        console.error('[QwenService] ❌ Invalid image URL:', primaryImage.image_url);
        throw new Error('Invalid image URL provided');
      }
      
      const requestBody = {
        model: 'qwen-vl-plus',  // Use stable vision model
        messages: [
          {
            role: 'user',
            content: [
              { 
                type: 'text', 
                text: `You are a precise visual analyst specializing in promotional imagery. Analyze only what you can clearly see in the image. Do not make assumptions or guess about items that are not clearly visible.\n\n${prompt}` 
              },
              { 
                type: 'image_url', 
                image_url: { url: primaryImage.image_url } 
              }
            ]
          }
        ],
        temperature: 0.3,  // Lower temperature for more accurate, less creative responses
        max_tokens: 600    // More tokens for detailed analysis
      };
      
      console.log('[QwenService] Request body:', JSON.stringify(requestBody, null, 2));
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('[QwenService] Image Analysis API Error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorBody
        });
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('[QwenService] 🖼️ Raw image analysis response:', {
        status: response.status,
        data: data,
        hasChoices: !!data.choices,
        choicesLength: data.choices?.length,
        firstChoice: data.choices?.[0],
        messageContent: data.choices?.[0]?.message?.content
      });
      
      // Parse the response
      const content = data.choices[0].message.content;
      console.log('[QwenService] 📝 Image analysis content to parse:', content);
      
      let analysis;
      
      try {
        // Try to parse as JSON first
        analysis = JSON.parse(content);
        console.log('[QwenService] ✅ Successfully parsed JSON analysis:', analysis);
      } catch (e) {
        // If not JSON, parse manually from text response
        console.log('[QwenService] ⚠️ JSON parsing failed, using text parsing:', e.message);
        analysis = this.parseImageAnalysisText(content);
        console.log('[QwenService] 🔄 Parsed analysis from text:', analysis);
      }
      
      const finalAnalysis = {
        description: analysis.description || '',
        elements: analysis.elements || [],
        mood: analysis.mood || '',
        colors: analysis.colors || [],
        productType: analysis.productType,
        targetAudience: analysis.targetAudience
      };
      
      console.log('[QwenService] ✅ Final image analysis result:', finalAnalysis);
      return finalAnalysis;
    } catch (error) {
      console.error('Error analyzing images:', error);
      return null;
    }
  }

  /**
   * Generate dynamic headlines based on discount type and optional image analysis
   */
  async generateHeadlines(params: HeadlineGenerationParams): Promise<string[]> {
    console.log('[QwenService] 🚀 generateHeadlines called with params:', {
      discountType: params.discountType,
      discountValue: params.discountValue,
      bogoDetails: params.bogoDetails,
      businessCategory: params.businessCategory,
      businessName: params.businessName,
      businessDescription: params.businessDescription,
      businessLocation: params.businessLocation,
      hasImageAnalysis: !!params.imageAnalysis
    });

    if (!this.isAvailable()) {
      console.log('[QwenService] ❌ API not available, using fallback headlines');
      return this.getFallbackHeadlines(params);
    }

    // Check cache first (exclude imageAnalysis from cache key for better hit rate)
    const cacheParams = {
      discountType: params.discountType,
      discountValue: params.discountValue,
      bogoDetails: params.bogoDetails,
      businessCategory: params.businessCategory,
      businessName: params.businessName
    };
    const cacheKey = this.generateCacheKey('headlines', cacheParams);
    const cached = this.getFromCache<string[]>(cacheKey);
    if (cached) {
      return cached;
    }

    console.log('[QwenService] ✅ API available, proceeding with generation');

    try {
      // Build the discount description with item-specific context
      let discountDescription = '';
      const itemContext = params.appliesToItem ? ` on ${params.appliesToItem}` : '';

      if (params.discountType === 'percentage') {
        if (params.discountAppliesTo === 'single_item' && params.appliesToItem) {
          discountDescription = `${params.discountValue}% off ${params.appliesToItem}`;
        } else {
          discountDescription = `${params.discountValue}% off sale`;
        }
      } else if (params.discountType === 'fixed') {
        if (params.discountAppliesTo === 'single_item' && params.appliesToItem) {
          discountDescription = `$${params.discountValue} off ${params.appliesToItem}`;
        } else {
          discountDescription = `$${params.discountValue} off promotion`;
        }
      } else if (params.discountType === 'bogo' && params.bogoDetails) {
        if (params.bogoDetails.discountPercent === 100) {
          discountDescription = `Buy ${params.bogoDetails.needToBuy} Get 1 Free promotion${itemContext}`;
        } else {
          discountDescription = `Buy ${params.bogoDetails.needToBuy} Get ${params.bogoDetails.discountPercent}% Off deal${itemContext}`;
        }
      }

      // Build image context if available
      let imageContext = '';
      if (params.imageAnalysis) {
        imageContext = `. The promotion features ${params.imageAnalysis.description}. Visual elements include: ${params.imageAnalysis.elements.join(', ')}. The mood is ${params.imageAnalysis.mood}`;
        if (params.imageAnalysis.productType) {
          imageContext += `. Product type: ${params.imageAnalysis.productType}`;
        }
        if (params.imageAnalysis.targetAudience) {
          imageContext += `. Target audience: ${params.imageAnalysis.targetAudience}`;
        }
      }

      // Add business context if available
      let businessContext = '';
      if (params.businessName) {
        businessContext = `. Business: ${params.businessName}`;
      }
      if (params.businessCategory) {
        businessContext += `. Category: ${params.businessCategory}`;
      }
      if (params.businessDescription) {
        businessContext += `. About: ${params.businessDescription}`;
      }
      if (params.businessLocation) {
        businessContext += `. Location: ${params.businessLocation}`;
      }

      const prompt = `Suggest 4 catchy, unique promotional headlines for a ${discountDescription}${imageContext}${businessContext}. 
      
Requirements:
- Each headline should include the discount amount (${params.discountValue}${params.discountType === 'percentage' ? '%' : params.discountType === 'fixed' ? '$' : ''}) when possible
- Each headline should be 5-8 words maximum
- Make them attention-grabbing and action-oriented
- Vary the style (urgent, value-focused, exclusive, benefit-driven)
- If images were analyzed, incorporate relevant visual elements
- Keep them concise and impactful

Return exactly 4 headlines, one per line, numbered 1-4.

IMPORTANT REQUIREMENTS:
- Each headline should be approximately 20-26 characters
- Do not use asterisks, bold formatting, or any markdown
- Keep headlines punchy and direct
- Focus on the key benefit and discount
- Use short, impactful words
- Avoid long phrases
- NEVER include character counts, parentheses with numbers, or any metadata in the headlines
- Only return the headline text itself, nothing else

Example format:
1. 20% Off Walk-In Showers
2. Save Big on Bathroom
3. Limited Time: 20% Off
4. Premium Showers Sale

Count your characters silently to stay within 20-26 characters per headline, but only return the headline text.`;

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'qwen-plus',  // Use text model for headline generation
          messages: [
            {
              role: 'system',
              content: 'You are a creative marketing copywriter specializing in promotional headlines. Create compelling, concise headlines that drive customer action.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,  // Reduced from 0.9 for faster, more consistent results
          max_tokens: 150     // Reduced from 200 for faster response
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('[QwenService] Raw headline generation response:', {
        status: response.status,
        data: data,
        hasChoices: !!data.choices,
        choicesLength: data.choices?.length,
        firstChoice: data.choices?.[0],
        messageContent: data.choices?.[0]?.message?.content
      });
      
      const content = data.choices[0].message.content;
      console.log('[QwenService] Headline content to parse:', content);
      
      // Parse headlines from text response
      let headlines: string[] = [];
      
      try {
        // Try JSON parsing first
        const jsonContent = JSON.parse(content);
        console.log('[QwenService] Successfully parsed JSON headlines:', jsonContent);
        let rawHeadlines = [];
        if (Array.isArray(jsonContent)) {
          rawHeadlines = jsonContent;
        } else if (jsonContent.headlines && Array.isArray(jsonContent.headlines)) {
          rawHeadlines = jsonContent.headlines;
        }
        
        // Clean and validate JSON headlines
        headlines = rawHeadlines.map(headline => {
          let cleaned = headline.trim()
            .replace(/["']/g, '')
            .replace(/\*\*/g, '')
            .replace(/\*/g, '')
            .replace(/^["\u201c\u201d]+|["\u201c\u201d]+$/g, '')
            .replace(/\s*\(\d+\s*chars?\)\s*$/gi, '') // Remove character count info
            .replace(/\s*\(\d+\s*characters?\)\s*$/gi, '') // Remove "characters" variant
            .replace(/\s*\[\d+\s*chars?\]\s*$/gi, '') // Remove square bracket variant
            .replace(/\s*-\s*\d+\s*chars?\s*$/gi, '') // Remove dash variant
            .replace(/\d+\s*chars?\s*$/gi, ''); // Remove any trailing char count
          
          // Log if headline is too long (but don't truncate)
          if (cleaned.length > 26) {
            console.warn('[QwenService] ⚠️ JSON headline too long:', `"${cleaned}" (${cleaned.length} chars)`);
          }
          
          return cleaned;
        });
        
        console.log('[QwenService] 🧙 Cleaned JSON headlines:', headlines.map(h => `"${h}" (${h.length} chars)`));
      } catch (e) {
        console.log('[QwenService] JSON parsing failed, using text parsing:', e.message);
        // Parse from text format
        headlines = this.parseHeadlinesFromText(content);
        console.log('[QwenService] Parsed headlines from text:', headlines);
      }

      // Ensure we have exactly 4 headlines
      if (headlines.length < 4) {
        console.log('[QwenService] Not enough headlines, adding fallbacks. Current count:', headlines.length);
        const fallback = this.getFallbackHeadlines(params);
        headlines = [...headlines, ...fallback.slice(0, 4 - headlines.length)];
      }

      const finalHeadlines = headlines.slice(0, 4);
      console.log('[QwenService] Final headlines returned:', finalHeadlines);

      // Cache the result
      this.setCache(cacheKey, finalHeadlines);

      return finalHeadlines;
    } catch (error) {
      console.error('[QwenService] 🚫 Error generating headlines:', {
        error: error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        params: params
      });
      console.log('[QwenService] 🔄 Falling back to static headlines');
      return this.getFallbackHeadlines(params);
    }
  }

  /**
   * Generate descriptions based on the selected headline
   */
  async generateDescriptions(params: DescriptionGenerationParams): Promise<Array<{title: string, text: string}>> {
    console.log('[QwenService] 🚀 generateDescriptions called with params:', {
      selectedHeadline: params.selectedHeadline,
      discountType: params.discountType,
      discountValue: params.discountValue,
      bogoDetails: params.bogoDetails,
      businessCategory: params.businessCategory,
      businessDescription: params.businessDescription,
      businessLocation: params.businessLocation,
      hasImageAnalysis: !!params.imageAnalysis
    });
    
    if (!this.isAvailable()) {
      console.log('[QwenService] ❌ API not available, using fallback descriptions');
      return this.getFallbackDescriptions(params);
    }
    
    console.log('[QwenService] ✅ API available, proceeding with generation');

    try {
      // Build image context if available
      let imageContext = '';
      if (params.imageAnalysis) {
        imageContext = `The promotion visuals show: ${params.imageAnalysis.description}. `;
        if (params.imageAnalysis.productType) {
          imageContext += `Product focus: ${params.imageAnalysis.productType}. `;
        }
      }

      // Build business context if available
      let businessContext = '';
      if (params.businessName) {
        businessContext = `Business: ${params.businessName}. `;
      }
      if (params.businessDescription) {
        businessContext += `About the business: ${params.businessDescription}. `;
      }
      if (params.businessCategory) {
        businessContext += `Category: ${params.businessCategory}. `;
      }
      if (params.businessLocation) {
        businessContext += `Located in: ${params.businessLocation}. `;
      }

      // Build discount description for clear inclusion with item-specific context
      let discountDescription = '';
      if (params.discountType === 'percentage') {
        if (params.discountAppliesTo === 'single_item' && params.appliesToItem) {
          discountDescription = `${params.discountValue}% off ${params.appliesToItem}`;
        } else {
          discountDescription = `${params.discountValue}% off`;
        }
      } else if (params.discountType === 'fixed') {
        if (params.discountAppliesTo === 'single_item' && params.appliesToItem) {
          discountDescription = `$${params.discountValue} off ${params.appliesToItem}`;
        } else {
          discountDescription = `$${params.discountValue} off`;
        }
      } else if (params.discountType === 'bogo' && params.bogoDetails) {
        const itemContext = params.appliesToItem ? ` on ${params.appliesToItem}` : '';
        if (params.bogoDetails.discountPercent === 100) {
          discountDescription = `Buy ${params.bogoDetails.needToBuy} Get 1 FREE${itemContext}`;
        } else {
          discountDescription = `Buy ${params.bogoDetails.needToBuy} Get ${params.bogoDetails.discountPercent}% off${itemContext}`;
        }
      }

      const prompt = `Based on the headline "${params.selectedHeadline}", create 4 promotional descriptions with these specific styles:

1. Simple & Direct - Clear, straightforward language that explains the offer
2. Urgency & Scarcity - Creates FOMO with time-sensitive language
3. Value-Focused - Emphasizes savings and value proposition
4. Customer Appreciation - Thanks customers and makes them feel special

DISCOUNT TO MENTION: ${discountDescription}
${businessContext}${imageContext}

IMPORTANT: Each description MUST clearly mention the discount (${discountDescription}) so customers know the exact savings. Each description should be 2-3 sentences, engaging, and incorporate the promotion details naturally. Use the business context to make descriptions more personalized and relevant.

CHARACTER LIMIT: Keep each description under 160 characters total. Be concise but compelling.

Format your response as:
1. Simple & Direct: [description]
2. Urgency & Scarcity: [description] 
3. Value-Focused: [description]
4. Customer Appreciation: [description]`;

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'qwen-plus',  // Use text model for description generation
          messages: [
            {
              role: 'system',
              content: 'You are a marketing copywriter creating compelling promotional descriptions. Match each description style exactly as requested.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 600
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('[QwenService] Raw description generation response:', {
        status: response.status,
        data: data,
        hasChoices: !!data.choices,
        choicesLength: data.choices?.length,
        firstChoice: data.choices?.[0],
        messageContent: data.choices?.[0]?.message?.content
      });
      
      const content = data.choices[0].message.content;
      console.log('[QwenService] Description content to parse:', content);
      
      // Parse descriptions from text response
      let descriptions: Array<{title: string, text: string}> = [];
      
      try {
        // Try JSON parsing first
        const jsonContent = JSON.parse(content);
        console.log('[QwenService] Successfully parsed JSON descriptions:', jsonContent);
        if (Array.isArray(jsonContent)) {
          descriptions = jsonContent;
        } else if (jsonContent.descriptions && Array.isArray(jsonContent.descriptions)) {
          descriptions = jsonContent.descriptions;
        }
      } catch (e) {
        console.log('[QwenService] JSON parsing failed, using text parsing:', e.message);
        // Parse from text format
        descriptions = this.parseDescriptionsFromText(content);
        console.log('[QwenService] Parsed descriptions from text:', descriptions);
      }

      // Ensure we have all 4 description types
      const requiredTitles = ['Simple & Direct', 'Urgency & Scarcity', 'Value-Focused', 'Customer Appreciation'];
      const finalDescriptions = requiredTitles.map(title => {
        const found = descriptions.find(d => d.title === title);
        if (found) return found;
        
        // Fallback for missing description
        const fallback = this.getFallbackDescriptions(params);
        return fallback.find(d => d.title === title) || { title, text: 'Special offer available now!' };
      });

      console.log('[QwenService] Final descriptions returned:', finalDescriptions);
      return finalDescriptions;
    } catch (error) {
      console.error('[QwenService] 🚫 Error generating descriptions:', {
        error: error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        params: params
      });
      console.log('[QwenService] 🔄 Falling back to static descriptions');
      return this.getFallbackDescriptions(params);
    }
  }

  /**
   * Generate relevant keywords based on promotion content
   */
  async generateKeywords(params: KeywordGenerationParams): Promise<string[]> {
    console.log('[QwenService] 🚀 generateKeywords called with params:', {
      selectedHeadline: params.selectedHeadline,
      selectedDescription: params.selectedDescription,
      businessCategory: params.businessCategory,
      businessName: params.businessName,
      hasImageAnalysis: !!params.imageAnalysis
    });

    if (!this.isAvailable()) {
      console.log('[QwenService] ❌ API not available, using fallback keywords');
      return this.getFallbackKeywords(params);
    }

    console.log('[QwenService] ✅ API available, proceeding with generation');

    try {
      // Build context from available information
      let context = '';

      if (params.businessCategory) {
        context += `Business Category: ${params.businessCategory}. `;
      }

      if (params.businessName) {
        context += `Business Name: ${params.businessName}. `;
      }

      if (params.businessDescription) {
        context += `Business Description: ${params.businessDescription}. `;
      }

      if (params.selectedHeadline) {
        context += `Promotion Headline: "${params.selectedHeadline}". `;
      }

      if (params.selectedDescription) {
        context += `Promotion Description: "${params.selectedDescription}". `;
      }

      if (params.imageAnalysis) {
        context += `Visual Context: ${params.imageAnalysis.description}. `;
        if (params.imageAnalysis.productType) {
          context += `Product Type: ${params.imageAnalysis.productType}. `;
        }
      }

      if (params.discountType && params.discountValue) {
        if (params.discountType === 'percentage') {
          context += `Discount: ${params.discountValue}% off. `;
        } else if (params.discountType === 'fixed') {
          context += `Discount: $${params.discountValue} off. `;
        }
      }

      const prompt = `Based on the following promotion information, generate exactly 10 relevant search keywords that customers would use to find this offer:

${context}

IMPORTANT REQUIREMENTS:
- Generate KEYWORDS not key phrases - prefer 1-2 words maximum (e.g., "web design" not "professional web designer")
- Keywords should be SPECIFIC to this business and promotion
- Include the business category or industry (e.g., "web design", "plumbing", "restaurant")
- Include specific products/services if mentioned (e.g., "logos", "bathroom", "pizza")
- Keep keywords concise and search-friendly
- DO NOT include percentages, dollar amounts, or discount values in keywords
- DO NOT use generic keywords like "deal", "discount", "special", "promotion", "sale"
- DO NOT use phrases with adjectives like "professional", "affordable", "quality", "best"
- Focus on WHAT the business does or sells, not promotional language
- Consider what customers would TYPE into a search bar
- Include location-based keywords ONLY if location is provided

Return exactly 10 keywords, one per line, numbered 1-10.
Do NOT include quotes, asterisks, or any formatting - just the keywords.

Example for a web design business:
1. web design
2. logo design
3. branding
4. website
5. graphics
6. UI design
7. responsive
8. development
9. design studio
10. digital design`;

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'qwen-plus',
          messages: [
            {
              role: 'system',
              content: 'You are a search optimization specialist who generates highly relevant, specific keywords for business promotions. Focus on what customers actually search for.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.5,  // Balanced between creativity and relevance
          max_tokens: 200
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('[QwenService] Raw keyword generation response:', {
        status: response.status,
        data: data,
        hasChoices: !!data.choices,
        messageContent: data.choices?.[0]?.message?.content
      });

      const content = data.choices[0].message.content;
      console.log('[QwenService] Keyword content to parse:', content);

      // Parse keywords from text response
      let keywords: string[] = [];

      try {
        // Try JSON parsing first
        const jsonContent = JSON.parse(content);
        console.log('[QwenService] Successfully parsed JSON keywords:', jsonContent);
        if (Array.isArray(jsonContent)) {
          keywords = jsonContent;
        } else if (jsonContent.keywords && Array.isArray(jsonContent.keywords)) {
          keywords = jsonContent.keywords;
        }
      } catch (e) {
        console.log('[QwenService] JSON parsing failed, using text parsing:', e.message);
        // Parse from text format
        keywords = this.parseKeywordsFromText(content);
        console.log('[QwenService] Parsed keywords from text:', keywords);
      }

      // Clean and validate keywords
      keywords = keywords
        .map(k => k.trim().toLowerCase())
        .filter(k => k.length > 0 && k.length < 30) // Reasonable keyword length
        .slice(0, 10); // Limit to 10

      // Ensure we have at least 8 keywords
      if (keywords.length < 8) {
        console.log('[QwenService] Not enough keywords, adding fallbacks. Current count:', keywords.length);
        const fallback = this.getFallbackKeywords(params);
        keywords = [...keywords, ...fallback.slice(0, 10 - keywords.length)];
      }

      const finalKeywords = keywords.slice(0, 10);
      console.log('[QwenService] Final keywords returned:', finalKeywords);
      return finalKeywords;
    } catch (error) {
      console.error('[QwenService] 🚫 Error generating keywords:', {
        error: error,
        message: error instanceof Error ? error.message : 'Unknown error',
        params: params
      });
      console.log('[QwenService] 🔄 Falling back to static keywords');
      return this.getFallbackKeywords(params);
    }
  }

  /**
   * Generate relevant terms & conditions based on business and promotion context
   */
  async generateTermsConditions(params: TermsConditionsParams): Promise<string[]> {
    console.log('[QwenService] 🚀 generateTermsConditions called with params:', {
      discountType: params.discountType,
      discountValue: params.discountValue,
      businessCategory: params.businessCategory,
      businessName: params.businessName,
      discountAppliesTo: params.discountAppliesTo,
      appliesToItem: params.appliesToItem
    });

    if (!this.isAvailable()) {
      console.log('[QwenService] ❌ API not available, using fallback terms');
      return this.getFallbackTermsConditions(params);
    }

    console.log('[QwenService] ✅ API available, proceeding with generation');

    try {
      // Build context
      let context = '';
      if (params.businessCategory) {
        context += `Business Category: ${params.businessCategory}. `;
      }
      if (params.businessName) {
        context += `Business Name: ${params.businessName}. `;
      }
      if (params.appliesToItem) {
        context += `Specific Item/Service: ${params.appliesToItem}. `;
      }

      // Build discount description
      let discountDescription = '';
      if (params.discountType === 'percentage') {
        discountDescription = `${params.discountValue}% off${params.appliesToItem ? ` ${params.appliesToItem}` : ''}`;
      } else if (params.discountType === 'fixed') {
        discountDescription = `$${params.discountValue} off${params.appliesToItem ? ` ${params.appliesToItem}` : ''}`;
      } else if (params.discountType === 'bogo' && params.bogoDetails) {
        const itemContext = params.appliesToItem ? ` ${params.appliesToItem}` : '';
        discountDescription = params.bogoDetails.discountPercent === 100
          ? `Buy ${params.bogoDetails.needToBuy} Get 1 Free${itemContext}`
          : `Buy ${params.bogoDetails.needToBuy} Get ${params.bogoDetails.discountPercent}% off${itemContext}`;
      }

      const prompt = `Based on the following promotion details, generate 8 relevant, business-appropriate terms & conditions:

${context}
Discount: ${discountDescription}

IMPORTANT REQUIREMENTS:
- Generate terms that are SPECIFIC to this business type and promotion
- Each term should be concise (5-10 words maximum)
- Terms should be practical and enforceable
- Avoid generic restaurant terms like "Valid for dine-in only" or "Valid for takeout only" unless the business is a restaurant
- For service businesses (web design, salons, etc.), include service-specific terms
- For retail businesses, include product-specific terms
- For BOGO deals, include quantity and eligibility terms
- Include standard terms like "One per customer", "Cannot be combined with other offers", "Must present coupon"
- Terms should protect the business while being fair to customers

DO NOT include:
- Restaurant-specific terms (dine-in/takeout/delivery) unless it's a restaurant/food business
- Physical product terms for service businesses
- Service appointment terms for retail businesses

Return exactly 8 terms, one per line, numbered 1-8.
Do NOT include quotes, asterisks, or any formatting - just the term text.

Example for a web design business:
1. Valid for new projects only
2. One per customer
3. Must be redeemed at time of quote
4. Cannot be combined with other offers
5. Not valid on rush orders
6. Expires at end of promotional period
7. Must mention coupon when requesting quote
8. Non-transferable`;

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'qwen-plus',
          messages: [
            {
              role: 'system',
              content: 'You are a legal and business consultant specializing in creating fair, enforceable promotional terms & conditions. Generate terms that are specific to the business type and protect both the business and customer.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.5,  // Balanced for consistency
          max_tokens: 250
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('[QwenService] Raw terms generation response:', {
        status: response.status,
        data: data,
        hasChoices: !!data.choices,
        messageContent: data.choices?.[0]?.message?.content
      });

      const content = data.choices[0].message.content;
      console.log('[QwenService] Terms content to parse:', content);

      // Parse terms from text response
      let terms: string[] = [];

      try {
        // Try JSON parsing first
        const jsonContent = JSON.parse(content);
        console.log('[QwenService] Successfully parsed JSON terms:', jsonContent);
        if (Array.isArray(jsonContent)) {
          terms = jsonContent;
        } else if (jsonContent.terms && Array.isArray(jsonContent.terms)) {
          terms = jsonContent.terms;
        }
      } catch (e) {
        console.log('[QwenService] JSON parsing failed, using text parsing:', e.message);
        // Parse from text format (similar to keywords parsing)
        terms = this.parseTermsFromText(content);
        console.log('[QwenService] Parsed terms from text:', terms);
      }

      // Clean and validate terms
      terms = terms
        .map(t => t.trim())
        .filter(t => t.length > 0 && t.length < 100) // Reasonable term length
        .slice(0, 8); // Limit to 8

      // Ensure we have at least 6 terms
      if (terms.length < 6) {
        console.log('[QwenService] Not enough terms, adding fallbacks. Current count:', terms.length);
        const fallback = this.getFallbackTermsConditions(params);
        terms = [...terms, ...fallback.slice(0, 8 - terms.length)];
      }

      const finalTerms = terms.slice(0, 8);
      console.log('[QwenService] Final terms returned:', finalTerms);
      return finalTerms;
    } catch (error) {
      console.error('[QwenService] 🚫 Error generating terms:', {
        error: error,
        message: error instanceof Error ? error.message : 'Unknown error',
        params: params
      });
      console.log('[QwenService] 🔄 Falling back to static terms');
      return this.getFallbackTermsConditions(params);
    }
  }

  /**
   * Parse terms & conditions from text response
   */
  private parseTermsFromText(content: string): string[] {
    const lines = content.split('\n').filter(line => line.trim());
    const terms: string[] = [];

    for (const line of lines) {
      // Look for numbered lines (1. 2. 3.) or bullet points
      const match = line.match(/^(?:\d+\.\s*|[•-]\s*)(.+)$/);
      if (match && match[1]) {
        const term = match[1].trim()
          .replace(/["']/g, '')        // Remove quotes
          .replace(/\*\*/g, '')        // Remove bold markdown
          .replace(/\*/g, '')          // Remove italic markdown
          .replace(/^["\u201c\u201d]+|["\u201c\u201d]+$/g, ''); // Remove smart quotes

        if (term.length > 0) {
          terms.push(term);
        }
      } else if (line.trim() && !line.includes(':') && terms.length < 8) {
        // If it's a clean line without colons, might be a term
        const term = line.trim()
          .replace(/["']/g, '')
          .replace(/\*\*/g, '')
          .replace(/\*/g, '')
          .replace(/^["\u201c\u201d]+|["\u201c\u201d]+$/g, '');

        if (term.length > 0) {
          terms.push(term);
        }
      }
    }

    console.log('[QwenService] 📋 Parsed terms:', terms);
    return terms.slice(0, 8);
  }

  /**
   * Fallback terms & conditions when API is unavailable
   */
  private getFallbackTermsConditions(params: TermsConditionsParams): string[] {
    const category = params.businessCategory?.toLowerCase() || '';

    // Category-specific terms
    if (category.includes('restaurant') || category.includes('food')) {
      return [
        'Not valid with other offers',
        'One per customer',
        'Valid for dine-in only',
        'Valid for takeout only',
        'Must present coupon',
        'Cannot be combined with other discounts',
        'Valid while supplies last',
        'Expires at end of business day'
      ];
    } else if (category.includes('salon') || category.includes('spa') || category.includes('beauty')) {
      return [
        'Valid for new clients only',
        'One per customer',
        'Must schedule appointment',
        'Cannot be combined with other offers',
        'Not valid on product purchases',
        'Must present coupon at time of service',
        'Gratuity not included',
        'Non-transferable'
      ];
    } else if (category.includes('retail') || category.includes('shop')) {
      return [
        'Not valid with other offers',
        'One per customer per visit',
        'Valid on in-stock items only',
        'Cannot be combined with other discounts',
        'Must present coupon at checkout',
        'Valid while supplies last',
        'No cash value',
        'Non-transferable'
      ];
    }

    // Generic service business terms
    return [
      'Not valid with other offers',
      'One per customer',
      'Must be redeemed at time of purchase',
      'Cannot be combined with other discounts',
      'Must present coupon',
      'Expires at end of promotional period',
      'Non-transferable',
      'No cash value'
    ];
  }

  /**
   * Fallback headlines when API is unavailable
   */
  private getFallbackHeadlines(params: HeadlineGenerationParams): string[] {
    const { discountType, discountValue, bogoDetails } = params;
    
    switch (discountType) {
      case 'percentage':
        return [
          `${discountValue}% Off Everything`,
          `Save ${discountValue}% Today Only`,
          `Flash Sale: ${discountValue}% Off`,
          `Limited Time: ${discountValue}% Discount`
        ];
      
      case 'fixed':
        return [
          `$${discountValue} Off Your Order`,
          `Save $${discountValue} Today`,
          `$${discountValue} Off Everything`,
          `Get $${discountValue} Off Now`
        ];
      
      case 'bogo':
        if (bogoDetails?.discountPercent === 100) {
          return [
            `Buy ${bogoDetails.needToBuy} Get 1 FREE`,
            `${bogoDetails.needToBuy} for ${bogoDetails.needToBuy - 1} Special`,
            `Buy ${bogoDetails.needToBuy} Get One Free`,
            `Volume Deal: ${bogoDetails.needToBuy} Items Special`
          ];
        } else if (bogoDetails) {
          return [
            `Buy ${bogoDetails.needToBuy} Get ${bogoDetails.discountPercent}% Off`,
            `${bogoDetails.needToBuy}-Item Deal: ${bogoDetails.discountPercent}% Off Extra`,
            `Special: Buy ${bogoDetails.needToBuy} Save ${bogoDetails.discountPercent}%`,
            `${bogoDetails.needToBuy}+ Items: ${bogoDetails.discountPercent}% Discount`
          ];
        }
        return ['Special Offer', 'Limited Time Deal', 'Flash Sale', 'Exclusive Discount'];
      
      default:
        return ['Special Offer', 'Limited Time Deal', 'Flash Sale', 'Exclusive Discount'];
    }
  }

  /**
   * Fallback descriptions when API is unavailable
   */
  private getFallbackDescriptions(params: DescriptionGenerationParams): Array<{title: string, text: string}> {
    const discountText = this.formatDiscountForDescription(params);
    
    return [
      {
        title: 'Simple & Direct',
        text: `Take advantage of our ${discountText} promotion! Perfect for trying something new or stocking up on favorites. Limited time only!`
      },
      {
        title: 'Urgency & Scarcity',
        text: `🔥 ${discountText} for a limited time only! This deal won't last long. Hurry in and save big on everything you love!`
      },
      {
        title: 'Value-Focused',
        text: `Why pay full price? Enjoy ${discountText} on our entire selection. Quality products, unbeatable prices, exceptional service!`
      },
      {
        title: 'Customer Appreciation',
        text: `Thank you to our amazing customers! We're offering ${discountText} on everything. Your support means the world to us!`
      }
    ];
  }

  /**
   * Parse descriptions from text response
   */
  private parseDescriptionsFromText(content: string): Array<{title: string, text: string}> {
    const requiredTitles = ['Simple & Direct', 'Urgency & Scarcity', 'Value-Focused', 'Customer Appreciation'];
    const descriptions: Array<{title: string, text: string}> = [];
    
    const lines = content.split('\n').filter(line => line.trim());
    let currentTitle = '';
    let currentText = '';
    
    for (const line of lines) {
      // Look for numbered sections or title patterns
      const titleMatch = line.match(/^\d+\.\s*([^:]+):?\s*(.*)$/);
      if (titleMatch) {
        // Save previous description if we have one
        if (currentTitle && currentText) {
          descriptions.push({ title: currentTitle, text: currentText.trim() });
        }
        
        // Find matching title
        const matchedTitle = requiredTitles.find(title => 
          titleMatch[1].toLowerCase().includes(title.toLowerCase().split(' ')[0])
        );
        
        currentTitle = matchedTitle || titleMatch[1];
        currentText = titleMatch[2] || '';
      } else if (currentTitle && line.trim()) {
        // Continue building current description
        currentText += (currentText ? ' ' : '') + line.trim();
      }
    }
    
    // Don't forget the last one
    if (currentTitle && currentText) {
      descriptions.push({ title: currentTitle, text: currentText.trim() });
    }
    
    // Ensure we have all required descriptions
    const fallback = this.getFallbackDescriptions({
      selectedHeadline: '',
      discountType: 'percentage',
      discountValue: 20
    });
    
    return requiredTitles.map(title => {
      const found = descriptions.find(d => d.title === title);
      return found || fallback.find(d => d.title === title) || { title, text: 'Special offer available now!' };
    });
  }

  /**
   * Parse headlines from text response
   */
  private parseHeadlinesFromText(content: string): string[] {
    const lines = content.split('\n').filter(line => line.trim());
    const headlines: string[] = [];
    
    for (const line of lines) {
      // Look for numbered lines (1. 2. 3. 4.) or bullet points
      const match = line.match(/^(?:\d+\.\s*|[•-]\s*)(.+)$/);
      if (match && match[1]) {
        let headline = match[1].trim()
          .replace(/["']/g, '')        // Remove quotes
          .replace(/\*\*/g, '')       // Remove bold markdown
          .replace(/\*/g, '')         // Remove italic markdown
          .replace(/^["\u201c\u201d]+|["\u201c\u201d]+$/g, '') // Remove smart quotes
          .replace(/\s*\(\d+\s*chars?\)\s*$/gi, '') // Remove character count info
          .replace(/\s*\(\d+\s*characters?\)\s*$/gi, '') // Remove "characters" variant
          .replace(/\s*\[\d+\s*chars?\]\s*$/gi, '') // Remove square bracket variant
          .replace(/\s*-\s*\d+\s*chars?\s*$/gi, '') // Remove dash variant
          .replace(/\d+\s*chars?\s*$/gi, ''); // Remove any trailing char count
        
        // Log if headline is too long (but don't truncate)
        if (headline.length > 26) {
          console.warn('[QwenService] ⚠️ Headline too long:', `"${headline}" (${headline.length} chars)`);
        }
        
        headlines.push(headline);
      } else if (line.trim() && !line.includes(':') && headlines.length < 4) {
        // If it's a clean line without colons, might be a headline
        let headline = line.trim()
          .replace(/["']/g, '')
          .replace(/\*\*/g, '')
          .replace(/\*/g, '')
          .replace(/^["\u201c\u201d]+|["\u201c\u201d]+$/g, '')
          .replace(/\s*\(\d+\s*chars?\)\s*$/gi, '') // Remove character count info
          .replace(/\s*\(\d+\s*characters?\)\s*$/gi, '') // Remove "characters" variant
          .replace(/\s*\[\d+\s*chars?\]\s*$/gi, '') // Remove square bracket variant
          .replace(/\s*-\s*\d+\s*chars?\s*$/gi, '') // Remove dash variant
          .replace(/\d+\s*chars?\s*$/gi, ''); // Remove any trailing char count
        
        // Log if headline is too long (but don't truncate)
        if (headline.length > 26) {
          console.warn('[QwenService] ⚠️ Headline too long:', `"${headline}" (${headline.length} chars)`);
        }
        
        headlines.push(headline);
      }
    }
    
    console.log('[QwenService] 📏 Parsed and cleaned headlines:', headlines.map(h => `"${h}" (${h.length} chars)`));
    
    // Ensure we have exactly 4 headlines
    while (headlines.length < 4) {
      headlines.push(`Special Deal ${headlines.length + 1}`);
    }
    
    return headlines.slice(0, 4);
  }

  /**
   * Parse image analysis from text response when JSON parsing fails
   */
  private parseImageAnalysisText(content: string): ImageAnalysisResult {
    const defaultResult = {
      description: 'Image shows promotional content',
      elements: ['promotional content'],
      mood: 'engaging',
      colors: ['various colors'],
      productType: 'general',
      targetAudience: 'customers'
    };
    
    try {
      // Extract key information from conversational text response
      const text = content.toLowerCase();
      const result = { ...defaultResult };
      
      // Extract description - look for products/services mentioned
      const productMatches = text.match(/(?:products?|services?|items?)\s+[a-z\s,]+/g);
      if (productMatches) {
        result.description = productMatches[0];
        result.productType = productMatches[0].replace(/(?:products?|services?|items?)\s+/, '').trim();
      }
      
      // Extract mood/feeling
      const moodMatches = text.match(/(?:mood|feeling|convey[s]?)\s+[a-z\s,]+/g);
      if (moodMatches) {
        result.mood = moodMatches[0].replace(/(?:mood|feeling|convey[s]?)\s+/, '').trim();
      }
      
      // Extract colors
      const colorPattern = /(?:colors?|colored?)\s+[a-z\s,]+/g;
      const colorMatches = text.match(colorPattern);
      if (colorMatches) {
        const colorText = colorMatches[0].replace(/(?:colors?|colored?)\s+/, '');
        result.colors = colorText.split(/[,\s]+/).filter(c => c.length > 2).slice(0, 3);
      }
      
      // Extract target audience
      const audienceMatches = text.match(/(?:target audience|audience)\s+[a-z\s,]+/g);
      if (audienceMatches) {
        result.targetAudience = audienceMatches[0].replace(/(?:target audience|audience)\s+/, '').trim();
      }
      
      // Extract visual elements from general description
      const sentences = content.split(/[.!?]/);
      result.elements = sentences
        .map(s => s.trim())
        .filter(s => s.length > 10)
        .slice(0, 3);
      
      // Use the full content as description if no specific match found
      if (result.description === defaultResult.description && content.length > 20) {
        result.description = content.slice(0, 100) + '...';
      }
      
      console.log('[QwenService] 🎨 Extracted image analysis:', result);
      return result;
    } catch (e) {
      console.log('[QwenService] ❌ Failed to parse text response, using defaults:', e);
      return defaultResult;
    }
  }

  /**
   * Format discount for description text
   */
  private formatDiscountForDescription(params: DescriptionGenerationParams): string {
    switch (params.discountType) {
      case 'percentage':
        return `${params.discountValue}% OFF`;
      case 'fixed':
        return `$${params.discountValue} OFF`;
      case 'bogo':
        if (params.bogoDetails?.discountPercent === 100) {
          return `Buy ${params.bogoDetails.needToBuy} Get 1 FREE`;
        } else if (params.bogoDetails) {
          return `Buy ${params.bogoDetails.needToBuy} Get ${params.bogoDetails.discountPercent}% OFF`;
        }
        return 'special offer';
      default:
        return 'special discount';
    }
  }

  /**
   * Parse keywords from text response
   */
  private parseKeywordsFromText(content: string): string[] {
    const lines = content.split('\n').filter(line => line.trim());
    const keywords: string[] = [];

    for (const line of lines) {
      // Look for numbered lines (1. 2. 3.) or bullet points
      const match = line.match(/^(?:\d+\.\s*|[•-]\s*)(.+)$/);
      if (match && match[1]) {
        const keyword = match[1].trim()
          .replace(/["']/g, '')        // Remove quotes
          .replace(/\*\*/g, '')        // Remove bold markdown
          .replace(/\*/g, '')          // Remove italic markdown
          .replace(/^["\u201c\u201d]+|["\u201c\u201d]+$/g, '') // Remove smart quotes
          .toLowerCase();

        if (keyword.length > 0) {
          keywords.push(keyword);
        }
      } else if (line.trim() && !line.includes(':') && keywords.length < 10) {
        // If it's a clean line without colons, might be a keyword
        const keyword = line.trim()
          .replace(/["']/g, '')
          .replace(/\*\*/g, '')
          .replace(/\*/g, '')
          .replace(/^["\u201c\u201d]+|["\u201c\u201d]+$/g, '')
          .toLowerCase();

        if (keyword.length > 0) {
          keywords.push(keyword);
        }
      }
    }

    console.log('[QwenService] 🔤 Parsed keywords:', keywords);
    return keywords.slice(0, 10);
  }

  /**
   * Fallback keywords when API is unavailable
   */
  private getFallbackKeywords(params: KeywordGenerationParams): string[] {
    const keywords: string[] = [];

    // Add category-specific keywords if available
    if (params.businessCategory) {
      const category = params.businessCategory.toLowerCase();
      keywords.push(category);

      // Add related terms based on category
      if (category.includes('restaurant') || category.includes('food')) {
        keywords.push('dining', 'food', 'restaurant', 'takeout', 'delivery');
      } else if (category.includes('retail') || category.includes('shop')) {
        keywords.push('shopping', 'retail', 'store', 'products');
      } else if (category.includes('service')) {
        keywords.push('services', 'professional', 'local business');
      } else if (category.includes('health') || category.includes('fitness')) {
        keywords.push('wellness', 'health', 'fitness');
      } else if (category.includes('beauty') || category.includes('salon')) {
        keywords.push('beauty', 'grooming', 'salon', 'spa');
      } else if (category.includes('auto')) {
        keywords.push('automotive', 'car service', 'vehicle');
      }
    }

    // Add generic but useful keywords
    keywords.push('local', 'discount', 'deal', 'sale', 'promotion', 'savings', 'special offer');

    // Remove duplicates and limit to 10
    return [...new Set(keywords)].slice(0, 10);
  }

  /**
   * Generate event titles based on event type and category
   */
  async generateEventTitles(params: EventTitleGenerationParams): Promise<string[]> {
    console.log('[QwenService] 🚀 generateEventTitles called with params:', params);

    if (!this.isAvailable()) {
      console.log('[QwenService] ❌ API not available, using fallback titles');
      return this.getFallbackEventTitles(params);
    }

    // Check cache first (include eventBrief to ensure fresh results when description changes)
    const cacheParams = {
      eventBrief: params.eventBrief,
      eventCategory: params.eventCategory,
      eventType: params.eventType,
      businessCategory: params.businessCategory
    };
    const cacheKey = this.generateCacheKey('event_titles', cacheParams);
    const cached = this.getFromCache<string[]>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Build context - EVENT BRIEF FIRST (HIGHEST PRIORITY)
      let context = '';

      // 🔥 HIGHEST PRIORITY: User's own description of the event
      if (params.eventBrief) {
        context += `Event Description (from organizer): "${params.eventBrief}". `;
      }

      // Secondary context
      if (params.businessName) context += `Business: ${params.businessName}. `;
      if (params.businessCategory) context += `Business Category: ${params.businessCategory}. `;
      if (params.eventCategory) context += `Event Category: ${params.eventCategory}. `;
      if (params.businessDescription) context += `About: ${params.businessDescription}. `;
      if (params.isVirtual) context += `Event Type: Virtual/Online. `;
      if (params.maxCapacity) context += `Capacity: ${params.maxCapacity} attendees. `;

      // Build image context if available
      let imageContext = '';
      if (params.imageAnalysis) {
        imageContext = `. The event images show: ${params.imageAnalysis.description}`;
      }

      const prompt = `Suggest 4 compelling event titles for an event with these details:

${context}${imageContext}

Requirements:
- MOST IMPORTANT: Base titles primarily on the event description provided by the organizer
- Each title should be 5-10 words maximum
- Make them attention-grabbing and clear about what the event is
- Vary the style (exciting, professional, community-focused, informative)
- If images were analyzed, incorporate relevant visual elements
- Keep them concise and impactful

Return exactly 4 titles, one per line, numbered 1-4.

IMPORTANT REQUIREMENTS:
- Each title should be approximately 30-60 characters
- Do not use asterisks, bold formatting, or any markdown
- Keep titles clear and descriptive
- Focus on the event type and benefit from the organizer's description
- Avoid generic words like "amazing" or "incredible"

Example format:
1. Jacksonville Fitness Boot Camp
2. Summer Yoga Workshop Series
3. Community Art & Wine Night
4. Local Business Networking Mixer`;

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'qwen-plus',
          messages: [
            {
              role: 'system',
              content: 'You are a creative event marketing specialist. Create compelling event titles that clearly communicate what the event is about.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 150
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;

      // Parse titles from text response
      let titles: string[] = [];

      try {
        const jsonContent = JSON.parse(content);
        let rawTitles = [];
        if (Array.isArray(jsonContent)) {
          rawTitles = jsonContent;
        } else if (jsonContent.titles && Array.isArray(jsonContent.titles)) {
          rawTitles = jsonContent.titles;
        }

        titles = rawTitles.map(title => title.trim()
          .replace(/["']/g, '')
          .replace(/\*\*/g, '')
          .replace(/\*/g, '')
          .replace(/^["\u201c\u201d]+|["\u201c\u201d]+$/g, ''));
      } catch (e) {
        titles = this.parseHeadlinesFromText(content);
      }

      // Ensure we have exactly 4 titles
      if (titles.length < 4) {
        const fallback = this.getFallbackEventTitles(params);
        titles = [...titles, ...fallback.slice(0, 4 - titles.length)];
      }

      const finalTitles = titles.slice(0, 4);
      console.log('[QwenService] Final event titles returned:', finalTitles);

      // Cache the result
      this.setCache(cacheKey, finalTitles);

      return finalTitles;
    } catch (error) {
      console.error('[QwenService] 🚫 Error generating event titles:', error);
      return this.getFallbackEventTitles(params);
    }
  }

  /**
   * Generate event descriptions based on selected title
   */
  async generateEventDescriptions(params: EventDescriptionGenerationParams): Promise<Array<{title: string, text: string}>> {
    console.log('[QwenService] 🚀 generateEventDescriptions called with params:', params);

    if (!this.isAvailable()) {
      console.log('[QwenService] ❌ API not available, using fallback descriptions');
      return this.getFallbackEventDescriptions(params);
    }

    try {
      // Build context - EVENT BRIEF FIRST (HIGHEST PRIORITY)
      let context = '';

      // 🔥 HIGHEST PRIORITY: User's own description of the event
      if (params.eventBrief) {
        context += `Event Description (from organizer): "${params.eventBrief}". `;
      }

      // Secondary context
      if (params.businessName) context += `Business: ${params.businessName}. `;
      if (params.businessCategory) context += `Category: ${params.businessCategory}. `;
      if (params.eventCategory) context += `Event Category: ${params.eventCategory}. `;
      if (params.isVirtual) context += `Format: Virtual/Online. `;
      if (params.maxCapacity) context += `Capacity: ${params.maxCapacity} people. `;

      // Build image context if available
      let imageContext = '';
      if (params.imageAnalysis) {
        imageContext = `. The event images show: ${params.imageAnalysis.description}`;
      }

      const prompt = `Based on the event title "${params.selectedTitle}", create 4 event descriptions with these specific styles:

1. Simple & Inviting - Clear, welcoming language that explains the event
2. Detailed & Informative - Thorough explanation of what attendees can expect
3. Urgency & Excitement - Creates enthusiasm and FOMO
4. Community Focused - Emphasizes connections and community building

${context}${imageContext}

IMPORTANT REQUIREMENTS:
- MOST IMPORTANT: Use the organizer's original event description as the PRIMARY source about what this event is
- Each description should be 2-3 sentences, engaging, and clearly explain what the event is about
- Base all descriptions on the event details provided by the organizer
- Use the business context to make descriptions more personalized
- If images were analyzed, incorporate relevant visual elements naturally

CHARACTER LIMIT: Keep each description under 200 characters total. Be concise but compelling.

Format your response as:
1. Simple & Inviting: [description]
2. Detailed & Informative: [description]
3. Urgency & Excitement: [description]
4. Community Focused: [description]`;

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'qwen-plus',
          messages: [
            {
              role: 'system',
              content: 'You are an event marketing copywriter creating compelling event descriptions. Match each description style exactly as requested.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 600
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;

      let descriptions: Array<{title: string, text: string}> = [];

      try {
        const jsonContent = JSON.parse(content);
        if (Array.isArray(jsonContent)) {
          descriptions = jsonContent;
        } else if (jsonContent.descriptions && Array.isArray(jsonContent.descriptions)) {
          descriptions = jsonContent.descriptions;
        }
      } catch (e) {
        descriptions = this.parseDescriptionsFromText(content);
      }

      const requiredTitles = ['Simple & Inviting', 'Detailed & Informative', 'Urgency & Excitement', 'Community Focused'];
      const finalDescriptions = requiredTitles.map(title => {
        const found = descriptions.find(d => d.title === title || d.title.includes(title.split(' ')[0]));
        if (found) return found;

        const fallback = this.getFallbackEventDescriptions(params);
        return fallback.find(d => d.title === title) || { title, text: 'Join us for a special event!' };
      });

      console.log('[QwenService] Final event descriptions returned:', finalDescriptions);
      return finalDescriptions;
    } catch (error) {
      console.error('[QwenService] 🚫 Error generating event descriptions:', error);
      return this.getFallbackEventDescriptions(params);
    }
  }

  /**
   * Generate event keywords
   */
  async generateEventKeywords(params: EventKeywordGenerationParams): Promise<string[]> {
    console.log('[QwenService] 🚀 generateEventKeywords called with params:', params);

    if (!this.isAvailable()) {
      return this.getFallbackEventKeywords(params);
    }

    try {
      // Build context - EVENT BRIEF FIRST (HIGHEST PRIORITY)
      let context = '';

      // 🔥 HIGHEST PRIORITY: User's own description of the event
      if (params.eventBrief) {
        context += `Event Description (from organizer): "${params.eventBrief}". `;
      }

      // Secondary context
      if (params.selectedTitle) context += `Event Title: "${params.selectedTitle}". `;
      if (params.selectedDescription) context += `Selected Event Description: "${params.selectedDescription}". `;
      if (params.businessCategory) context += `Business Category: ${params.businessCategory}. `;
      if (params.eventCategory) context += `Event Category: ${params.eventCategory}. `;
      if (params.isVirtual) context += `Format: Virtual/Online. `;

      // Build image context if available
      let imageContext = '';
      if (params.imageAnalysis) {
        imageContext = `. The event images show: ${params.imageAnalysis.description}`;
      }

      const prompt = `Based on the following event information, generate exactly 10 relevant search keywords that people would use to find this event:

${context}${imageContext}

IMPORTANT REQUIREMENTS:
- MOST IMPORTANT: Base keywords primarily on the organizer's event description
- Generate KEYWORDS not phrases - prefer 1-2 words maximum (e.g., "yoga workshop" not "beginner yoga workshop for adults")
- Keywords should be SPECIFIC to this event type based on what the organizer described
- Include the event category (e.g., "workshop", "networking", "class", "festival")
- Include the activity or focus (e.g., "yoga", "art", "business", "fitness")
- Keep keywords concise and search-friendly
- DO NOT use generic words like "event", "fun", "exciting", "amazing"
- Focus on WHAT the event is about, not promotional language
- Consider what people would TYPE into a search bar

Return exactly 10 keywords, one per line, numbered 1-10.`;

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'qwen-plus',
          messages: [
            {
              role: 'system',
              content: 'You are a search optimization specialist for events. Generate specific, searchable keywords.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.5,
          max_tokens: 200
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;

      let keywords: string[] = [];

      try {
        const jsonContent = JSON.parse(content);
        if (Array.isArray(jsonContent)) {
          keywords = jsonContent;
        } else if (jsonContent.keywords && Array.isArray(jsonContent.keywords)) {
          keywords = jsonContent.keywords;
        }
      } catch (e) {
        keywords = this.parseKeywordsFromText(content);
      }

      keywords = keywords
        .map(k => k.trim().toLowerCase())
        .filter(k => k.length > 0 && k.length < 30)
        .slice(0, 10);

      if (keywords.length < 8) {
        const fallback = this.getFallbackEventKeywords(params);
        keywords = [...keywords, ...fallback.slice(0, 10 - keywords.length)];
      }

      console.log('[QwenService] Final event keywords returned:', keywords);
      return keywords.slice(0, 10);
    } catch (error) {
      console.error('[QwenService] 🚫 Error generating event keywords:', error);
      return this.getFallbackEventKeywords(params);
    }
  }

  /**
   * Generate event guidelines/requirements
   */
  async generateEventGuidelines(params: EventGuidelinesParams): Promise<string[]> {
    console.log('[QwenService] 🚀 generateEventGuidelines called with params:', params);

    if (!this.isAvailable()) {
      return this.getFallbackEventGuidelines(params);
    }

    try {
      // Build context - EVENT BRIEF FIRST (HIGHEST PRIORITY)
      let context = '';

      // 🔥 HIGHEST PRIORITY: User's own description of the event
      if (params.eventBrief) {
        context += `Event Description (from organizer): "${params.eventBrief}". `;
      }

      // Secondary context
      if (params.businessCategory) context += `Business Category: ${params.businessCategory}. `;
      if (params.eventCategory) context += `Event Category: ${params.eventCategory}. `;
      if (params.maxCapacity) context += `Capacity: ${params.maxCapacity} attendees. `;
      if (params.isVirtual) context += `Format: Virtual/Online. `;

      const prompt = `Based on the following event details, generate 8 relevant event guidelines or requirements:

${context}

IMPORTANT REQUIREMENTS:
- MOST IMPORTANT: Base guidelines on the specifics of the organizer's event description
- Generate guidelines that are SPECIFIC to this event type and what the organizer described
- Each guideline should be concise (5-10 words maximum)
- Guidelines should be practical and clear
- Include standard event requirements (RSVP, age restrictions, what to bring, dress code, etc.)
- For virtual events, include online-specific guidelines (login info, technical requirements)
- For in-person events, include physical guidelines (parking, arrival time, accessibility)
- Guidelines should set clear expectations for attendees based on the event description

DO NOT include:
- Promotional language
- Sales-focused terms
- Generic guidelines that apply to everything

Return exactly 8 guidelines, one per line, numbered 1-8.

Example for a fitness class:
1. Please arrive 10 minutes early
2. Bring your own yoga mat
3. Wear comfortable athletic clothing
4. Must be 18 or older
5. RSVP required by day before
6. Water bottles provided
7. Beginner to intermediate skill level
8. Limited to 20 participants`;

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'qwen-plus',
          messages: [
            {
              role: 'system',
              content: 'You are an event planning specialist. Generate clear, practical event guidelines that help attendees prepare.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.5,
          max_tokens: 250
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;

      let guidelines: string[] = [];

      try {
        const jsonContent = JSON.parse(content);
        if (Array.isArray(jsonContent)) {
          guidelines = jsonContent;
        } else if (jsonContent.guidelines && Array.isArray(jsonContent.guidelines)) {
          guidelines = jsonContent.guidelines;
        }
      } catch (e) {
        guidelines = this.parseTermsFromText(content);
      }

      guidelines = guidelines
        .map(g => g.trim())
        .filter(g => g.length > 0 && g.length < 100)
        .slice(0, 8);

      if (guidelines.length < 6) {
        const fallback = this.getFallbackEventGuidelines(params);
        guidelines = [...guidelines, ...fallback.slice(0, 8 - guidelines.length)];
      }

      console.log('[QwenService] Final event guidelines returned:', guidelines);
      return guidelines.slice(0, 8);
    } catch (error) {
      console.error('[QwenService] 🚫 Error generating event guidelines:', error);
      return this.getFallbackEventGuidelines(params);
    }
  }

  /**
   * Fallback event titles
   */
  private getFallbackEventTitles(params: EventTitleGenerationParams): string[] {
    const category = params.eventCategory || 'Event';
    const business = params.businessName || 'Our';

    return [
      `${business} Special ${category}`,
      `Join Us for ${category}`,
      `Exciting ${category} Coming Soon`,
      `Community ${category}`
    ];
  }

  /**
   * Fallback event descriptions
   */
  private getFallbackEventDescriptions(params: EventDescriptionGenerationParams): Array<{title: string, text: string}> {
    const eventType = params.eventCategory || 'event';

    return [
      {
        title: 'Simple & Inviting',
        text: `Join us for an exciting ${eventType}! This is a great opportunity to connect with others and experience something special. Limited spaces available!`
      },
      {
        title: 'Detailed & Informative',
        text: `We're hosting a ${eventType} that offers something for everyone. Come experience great atmosphere, meet interesting people, and create lasting memories!`
      },
      {
        title: 'Urgency & Excitement',
        text: `🎉 Don't miss this incredible ${eventType}! Spaces are filling up fast. Join us for an unforgettable experience!`
      },
      {
        title: 'Community Focused',
        text: `Bring friends and family to this ${eventType}! We're building community connections. Be part of something special!`
      }
    ];
  }

  /**
   * Fallback event keywords
   */
  private getFallbackEventKeywords(params: EventKeywordGenerationParams): string[] {
    const keywords: string[] = [];

    if (params.eventCategory) {
      keywords.push(params.eventCategory.toLowerCase());
    }
    if (params.businessCategory) {
      keywords.push(params.businessCategory.toLowerCase());
    }

    keywords.push('local event', 'community', 'Jacksonville', 'workshop', 'class', 'gathering', 'social', 'networking');

    return [...new Set(keywords)].slice(0, 10);
  }

  /**
   * Fallback event guidelines
   */
  private getFallbackEventGuidelines(params: EventGuidelinesParams): string[] {
    if (params.isVirtual) {
      return [
        'Zoom link will be sent 24 hours before',
        'Test your audio and video beforehand',
        'Arrive 5 minutes early for tech check',
        'Stable internet connection required',
        'RSVP required',
        'Recording will be available',
        'Interactive participation encouraged',
        'Questions welcome in chat'
      ];
    }

    return [
      'Please arrive 10 minutes early',
      'RSVP required',
      'Limited space available',
      'All ages welcome unless noted',
      'Free parking available',
      'Refreshments will be provided',
      'Business casual attire recommended',
      'Please bring valid ID'
    ];
  }
}

export default new QwenService();