/**
 * Validate business social media URLs
 */
export function validateBusinessSocialMedia(socialMedia: Record<string, string>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  const urlPatterns: Record<string, RegExp> = {
    facebook: /^https?:\/\/(www\.)?facebook\.com\/.+/i,
    instagram: /^https?:\/\/(www\.)?instagram\.com\/.+/i,
    twitter: /^https?:\/\/(www\.)?(twitter|x)\.com\/.+/i,
    linkedin: /^https?:\/\/(www\.)?linkedin\.com\/.+/i,
    youtube: /^https?:\/\/(www\.)?youtube\.com\/.+/i,
    tiktok: /^https?:\/\/(www\.)?tiktok\.com\/.+/i,
  };

  for (const [platform, url] of Object.entries(socialMedia)) {
    if (!url) continue;

    const pattern = urlPatterns[platform.toLowerCase()];
    if (pattern && !pattern.test(url)) {
      errors.push(`Invalid ${platform} URL`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
