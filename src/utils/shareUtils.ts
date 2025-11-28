import { enqueueSnackbar } from 'notistack';

/**
 * Base URL for share links
 */
const SHARE_BASE_URL = 'https://t.jaxsaver.app';

/**
 * Generate a shareable URL for a business profile
 */
export const getBusinessShareUrl = (businessId: string): string => {
  return `${SHARE_BASE_URL}/b/${businessId}`;
};

/**
 * Generate a shareable URL for a promotion
 */
export const getPromotionShareUrl = (promotionId: string): string => {
  return `${SHARE_BASE_URL}/p/${promotionId}`;
};

/**
 * Generate a shareable URL for an event
 */
export const getEventShareUrl = (eventId: string): string => {
  return `${SHARE_BASE_URL}/e/${eventId}`;
};

/**
 * Share data via Web Share API or fallback to clipboard
 */
export const shareContent = async (
  title: string,
  text: string,
  url: string
): Promise<boolean> => {
  const shareData = {
    title,
    text,
    url
  };

  // Check if Web Share API is available
  if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
    try {
      await navigator.share(shareData);
      return true;
    } catch (error: any) {
      // User cancelled the share or error occurred
      if (error.name !== 'AbortError') {
        console.error('Error sharing:', error);
        // Fall through to clipboard fallback
      } else {
        // User cancelled, don't show error
        return false;
      }
    }
  }

  // Fallback to clipboard
  return copyToClipboard(url);
};

/**
 * Copy text to clipboard with notification
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      enqueueSnackbar('Link copied to clipboard!', { variant: 'success' });
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (successful) {
        enqueueSnackbar('Link copied to clipboard!', { variant: 'success' });
        return true;
      } else {
        throw new Error('Copy failed');
      }
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    enqueueSnackbar('Failed to copy link', { variant: 'error' });
    return false;
  }
};

/**
 * Share business profile
 */
export const shareBusinessProfile = async (
  businessId: string,
  businessName: string
): Promise<boolean> => {
  const url = getBusinessShareUrl(businessId);
  const title = businessName;
  const text = `Check out ${businessName} on JaxSaver for exclusive deals and promotions!`;
  
  return shareContent(title, text, url);
};

/**
 * Share promotion
 */
export const sharePromotion = async (
  promotionId: string,
  promotionTitle: string,
  businessName: string
): Promise<boolean> => {
  const url = getPromotionShareUrl(promotionId);
  const title = promotionTitle;
  const text = `Save with this exclusive deal from ${businessName} on JaxSaver!`;
  
  return shareContent(title, text, url);
};

/**
 * Share event
 */
export const shareEvent = async (
  eventId: string,
  eventTitle: string,
  businessName: string,
  eventDate?: Date
): Promise<boolean> => {
  const url = getEventShareUrl(eventId);
  const title = eventTitle;
  let text = `Join us for "${eventTitle}" hosted by ${businessName}`;
  
  if (eventDate) {
    const dateStr = new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(eventDate);
    text += ` on ${dateStr}`;
  }
  
  text += ' - Learn more on JaxSaver!';
  
  return shareContent(title, text, url);
};