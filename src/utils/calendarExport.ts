import { format } from 'date-fns';
import { EventData } from '../components/shared/event/EventCard';

/**
 * Calendar export utilities for generating .ics files and calendar links
 */

// Helper function to format date for ICS format
const formatICSDate = (date: Date): string => {
  return format(date, "yyyyMMdd'T'HHmmss'Z'");
};

// Helper function to escape ICS text
const escapeICSText = (text: string): string => {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '');
};

// Helper function to wrap long lines in ICS format
const wrapICSLine = (line: string, maxLength: number = 75): string => {
  if (line.length <= maxLength) {
    return line;
  }
  
  const lines: string[] = [];
  let currentLine = line;
  
  while (currentLine.length > maxLength) {
    lines.push(currentLine.substring(0, maxLength));
    currentLine = ' ' + currentLine.substring(maxLength);
  }
  
  if (currentLine.trim()) {
    lines.push(currentLine);
  }
  
  return lines.join('\r\n');
};

/**
 * Generate ICS file content for a single event
 */
export const generateEventICS = (event: EventData): string => {
  const startDate = new Date(event.start_datetime);
  const endDate = new Date(event.end_datetime);
  const now = new Date();
  
  // Create location string
  let location = '';
  if (event.location_name) {
    location = event.location_name;
    if (event.address) {
      location += `, ${event.address}`;
      if (event.city) location += `, ${event.city}`;
      if (event.state) location += `, ${event.state}`;
      if (event.zip_code) location += ` ${event.zip_code}`;
    }
  }
  
  // Create organizer info
  const organizer = event.business?.business_name || 'JaxSaver Business';
  
  // Create unique ID for the event
  const uid = `event-${event.id}@jaxsaver.com`;
  
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//JaxSaver//Event Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTART:${formatICSDate(startDate)}`,
    `DTEND:${formatICSDate(endDate)}`,
    `DTSTAMP:${formatICSDate(now)}`,
    wrapICSLine(`SUMMARY:${escapeICSText(event.title)}`),
    wrapICSLine(`DESCRIPTION:${escapeICSText(event.description)}`),
    ...(location ? [wrapICSLine(`LOCATION:${escapeICSText(location)}`)] : []),
    wrapICSLine(`ORGANIZER;CN=${escapeICSText(organizer)}:MAILTO:events@jaxsaver.com`),
    `STATUS:${event.status.toUpperCase()}`,
    `CLASS:${event.is_public ? 'PUBLIC' : 'PRIVATE'}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
  
  return icsContent;
};

/**
 * Generate ICS file content for multiple events
 */
export const generateMultipleEventsICS = (events: EventData[]): string => {
  const now = new Date();
  
  const header = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//JaxSaver//Event Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH'
  ];
  
  const eventBlocks = events.map(event => {
    const startDate = new Date(event.start_datetime);
    const endDate = new Date(event.end_datetime);
    
    let location = '';
    if (event.location_name) {
      location = event.location_name;
      if (event.address) {
        location += `, ${event.address}`;
        if (event.city) location += `, ${event.city}`;
        if (event.state) location += `, ${event.state}`;
        if (event.zip_code) location += ` ${event.zip_code}`;
      }
    }
    
    const organizer = event.business?.business_name || 'JaxSaver Business';
    const uid = `event-${event.id}@jaxsaver.com`;
    
    return [
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTART:${formatICSDate(startDate)}`,
      `DTEND:${formatICSDate(endDate)}`,
      `DTSTAMP:${formatICSDate(now)}`,
      wrapICSLine(`SUMMARY:${escapeICSText(event.title)}`),
      wrapICSLine(`DESCRIPTION:${escapeICSText(event.description)}`),
      ...(location ? [wrapICSLine(`LOCATION:${escapeICSText(location)}`)] : []),
      wrapICSLine(`ORGANIZER;CN=${escapeICSText(organizer)}:MAILTO:events@jaxsaver.com`),
      `STATUS:${event.status.toUpperCase()}`,
      `CLASS:${event.is_public ? 'PUBLIC' : 'PRIVATE'}`,
      'END:VEVENT'
    ].join('\r\n');
  });
  
  const footer = ['END:VCALENDAR'];
  
  return [...header, ...eventBlocks, ...footer].join('\r\n');
};

/**
 * Download ICS file
 */
export const downloadICSFile = (icsContent: string, filename: string): void => {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.ics') ? filename : `${filename}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

/**
 * Generate Google Calendar URL
 */
export const generateGoogleCalendarURL = (event: EventData): string => {
  const startDate = new Date(event.start_datetime);
  const endDate = new Date(event.end_datetime);
  
  // Format dates for Google Calendar (YYYYMMDDTHHMMSSZ)
  const formatGoogleDate = (date: Date) => format(date, "yyyyMMdd'T'HHmmss'Z'");
  
  let location = '';
  if (event.location_name) {
    location = event.location_name;
    if (event.address) {
      location += `, ${event.address}`;
      if (event.city) location += `, ${event.city}`;
      if (event.state) location += `, ${event.state}`;
      if (event.zip_code) location += ` ${event.zip_code}`;
    }
  }
  
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}`,
    details: event.description,
    ...(location && { location }),
    ...(event.business?.business_name && { 
      details: `${event.description}\n\nOrganized by: ${event.business.business_name}`
    })
  });
  
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

/**
 * Generate Outlook Calendar URL
 */
export const generateOutlookCalendarURL = (event: EventData): string => {
  const startDate = new Date(event.start_datetime);
  const endDate = new Date(event.end_datetime);
  
  // Format dates for Outlook (ISO format)
  const formatOutlookDate = (date: Date) => date.toISOString();
  
  let location = '';
  if (event.location_name) {
    location = event.location_name;
    if (event.address) {
      location += `, ${event.address}`;
      if (event.city) location += `, ${event.city}`;
      if (event.state) location += `, ${event.state}`;
      if (event.zip_code) location += ` ${event.zip_code}`;
    }
  }
  
  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: event.title,
    startdt: formatOutlookDate(startDate),
    enddt: formatOutlookDate(endDate),
    body: event.description,
    ...(location && { location })
  });
  
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
};

/**
 * Generate Apple Calendar URL (webcal format)
 */
export const generateAppleCalendarURL = (event: EventData): string => {
  // For Apple Calendar, we'll generate an ICS file and use a data URL
  const icsContent = generateEventICS(event);
  const blob = new Blob([icsContent], { type: 'text/calendar' });
  return URL.createObjectURL(blob);
};

/**
 * Check if the device is iOS
 */
export const isIOSDevice = (): boolean => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

/**
 * Check if the device is Android
 */
export const isAndroidDevice = (): boolean => {
  return /Android/.test(navigator.userAgent);
};

/**
 * Get the best calendar app URL for the current device
 */
export const getBestCalendarURL = (event: EventData): string => {
  if (isIOSDevice()) {
    return generateAppleCalendarURL(event);
  } else if (isAndroidDevice()) {
    return generateGoogleCalendarURL(event);
  } else {
    // Default to Google Calendar for desktop
    return generateGoogleCalendarURL(event);
  }
};

/**
 * Generate calendar export options for an event
 */
export const getCalendarExportOptions = (event: EventData) => {
  return {
    google: {
      label: 'Google Calendar',
      url: generateGoogleCalendarURL(event),
      icon: 'google'
    },
    outlook: {
      label: 'Outlook',
      url: generateOutlookCalendarURL(event),
      icon: 'outlook'
    },
    apple: {
      label: 'Apple Calendar',
      url: generateAppleCalendarURL(event),
      icon: 'apple'
    },
    ics: {
      label: 'Download ICS',
      action: () => {
        const icsContent = generateEventICS(event);
        downloadICSFile(icsContent, `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-event`);
      },
      icon: 'download'
    }
  };
};

/**
 * Share event via Web Share API or fallback
 */
export const shareEvent = async (event: EventData): Promise<void> => {
  const shareData = {
    title: event.title,
    text: `Join me at "${event.title}" on ${format(new Date(event.start_datetime), 'PPP')}`,
    url: window.location.href
  };
  
  if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
    try {
      await navigator.share(shareData);
    } catch (error) {
      console.log('Web Share API cancelled or failed:', error);
      // Fallback to copy to clipboard
      fallbackShare(shareData);
    }
  } else {
    // Fallback to copy to clipboard
    fallbackShare(shareData);
  }
};

/**
 * Fallback share function using clipboard
 */
const fallbackShare = async (shareData: { title: string; text: string; url: string }) => {
  const shareText = `${shareData.title}\n\n${shareData.text}\n\n${shareData.url}`;
  
  try {
    await navigator.clipboard.writeText(shareText);
    // You could show a toast notification here
    console.log('Event details copied to clipboard');
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    // Could show an error message to user
  }
};