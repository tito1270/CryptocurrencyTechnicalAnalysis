// Anti-spam validation utilities

interface SpamCheckResult {
  isSpam: boolean;
  confidence: number;
  reasons: string[];
}

interface FormData {
  [key: string]: string;
}

// Common spam keywords and patterns
const SPAM_KEYWORDS = [
  'viagra', 'cialis', 'casino', 'poker', 'lottery', 'winner', 'congratulations',
  'urgent', 'immediate', 'limited time', 'act now', 'free money', 'earn money',
  'work from home', 'make money fast', 'guaranteed', 'no investment',
  'click here', 'visit our website', 'unsubscribe', 'remove me',
  'binary options', 'forex trading', 'cryptocurrency mining', 'bitcoin generator'
];

const SUSPICIOUS_PATTERNS = [
  /\b(?:\d{1,3}\.){3}\d{1,3}\b/g, // IP addresses
  /https?:\/\/[^\s]+/gi, // URLs
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, // Email addresses
  /\b(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/g, // Phone numbers
  /(.)\1{4,}/g, // Repeated characters (5+ times)
  /[^\x00-\x7F]/g // Non-ASCII characters (potential encoding issues)
];

export class AntiSpamValidator {
  private static honeypotFieldName = 'website_url'; // Hidden field name
  
  /**
   * Comprehensive spam check for form submissions
   */
  static checkSpam(formData: FormData, timeToFill?: number): SpamCheckResult {
    const reasons: string[] = [];
    let spamScore = 0;
    
    // Check honeypot field
    if (formData[this.honeypotFieldName]) {
      spamScore += 0.9;
      reasons.push('Honeypot field filled');
    }
    
    // Check submission time (too fast = likely bot)
    if (timeToFill && timeToFill < 5000) { // Less than 5 seconds
      spamScore += 0.7;
      reasons.push('Form submitted too quickly');
    }
    
    // Analyze text content
    const textContent = Object.values(formData).join(' ').toLowerCase();
    
    // Check for spam keywords
    const spamKeywordCount = SPAM_KEYWORDS.filter(keyword => 
      textContent.includes(keyword.toLowerCase())
    ).length;
    
    if (spamKeywordCount > 0) {
      spamScore += Math.min(spamKeywordCount * 0.2, 0.8);
      reasons.push(`Contains ${spamKeywordCount} spam keyword(s)`);
    }
    
    // Check for suspicious patterns
    let patternCount = 0;
    SUSPICIOUS_PATTERNS.forEach(pattern => {
      const matches = textContent.match(pattern);
      if (matches && matches.length > 0) {
        patternCount += matches.length;
      }
    });
    
    if (patternCount > 2) {
      spamScore += Math.min(patternCount * 0.15, 0.6);
      reasons.push(`Contains ${patternCount} suspicious pattern(s)`);
    }
    
    // Check for excessive capitalization
    const capsRatio = (textContent.match(/[A-Z]/g) || []).length / textContent.length;
    if (capsRatio > 0.3 && textContent.length > 20) {
      spamScore += 0.4;
      reasons.push('Excessive use of capital letters');
    }
    
    // Check for repetitive content
    const words = textContent.split(/\s+/);
    const uniqueWords = new Set(words);
    const repetitionRatio = 1 - (uniqueWords.size / words.length);
    
    if (repetitionRatio > 0.5 && words.length > 10) {
      spamScore += 0.5;
      reasons.push('Highly repetitive content');
    }
    
    // Check message length (too short or too long can be spam)
    const messageLength = textContent.length;
    if (messageLength < 10) {
      spamScore += 0.3;
      reasons.push('Message too short');
    } else if (messageLength > 5000) {
      spamScore += 0.4;
      reasons.push('Message too long');
    }
    
    // Check for gibberish (consonant/vowel ratio)
    const consonants = textContent.match(/[bcdfghjklmnpqrstvwxyz]/gi) || [];
    const vowels = textContent.match(/[aeiou]/gi) || [];
    const consonantVowelRatio = vowels.length > 0 ? consonants.length / vowels.length : 10;
    
    if (consonantVowelRatio > 5 || consonantVowelRatio < 0.5) {
      spamScore += 0.3;
      reasons.push('Unusual character distribution (possible gibberish)');
    }
    
    return {
      isSpam: spamScore > 0.6,
      confidence: Math.min(spamScore, 1),
      reasons
    };
  }
  
  /**
   * Validate email format and check for suspicious domains
   */
  static validateEmail(email: string): { isValid: boolean; isSuspicious: boolean; reason?: string } {
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    
    if (!emailRegex.test(email)) {
      return { isValid: false, isSuspicious: false, reason: 'Invalid email format' };
    }
    
    const domain = email.split('@')[1].toLowerCase();
    
    // Suspicious domains (common spam domains)
    const suspiciousDomains = [
      '10minutemail.com', 'tempmail.org', 'guerrillamail.com', 'mailinator.com',
      'throwaway.email', 'temp-mail.org', 'getnada.com', 'maildrop.cc'
    ];
    
    const isSuspicious = suspiciousDomains.some(suspDomain => 
      domain.includes(suspDomain)
    );
    
    return {
      isValid: true,
      isSuspicious,
      reason: isSuspicious ? 'Temporary/disposable email domain' : undefined
    };
  }
  
  /**
   * Generate honeypot field for forms
   */
  static getHoneypotField(): { name: string; style: React.CSSProperties } {
    return {
      name: this.honeypotFieldName,
      style: {
        position: 'absolute',
        left: '-9999px',
        top: '-9999px',
        opacity: 0,
        pointerEvents: 'none',
        tabIndex: -1
      }
    };
  }
  
  /**
   * Sanitize input to prevent XSS and other injection attacks
   */
  static sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove < and > to prevent HTML injection
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }
  
  /**
   * Check if form submission frequency is suspicious
   */
  static checkSubmissionFrequency(identifier: string): boolean {
    const key = `submission_${identifier}`;
    const now = Date.now();
    const submissions = JSON.parse(localStorage.getItem(key) || '[]');
    
    // Remove submissions older than 1 hour
    const recentSubmissions = submissions.filter((timestamp: number) => 
      now - timestamp < 3600000
    );
    
    // Check if more than 3 submissions in the last hour
    if (recentSubmissions.length >= 3) {
      return true; // Suspicious
    }
    
    // Add current submission
    recentSubmissions.push(now);
    localStorage.setItem(key, JSON.stringify(recentSubmissions));
    
    return false;
  }
}

export default AntiSpamValidator;
