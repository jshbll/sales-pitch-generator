import { StepConfig, EventFormData } from '../../types/event';
import { 
  Event as EventIcon,
  LocationOn as LocationIcon,
  Description as DescriptionIcon,
  CalendarMonth as CalendarIcon,
  People as PeopleIcon,
  Image as ImageIcon,
  FlashOn as BoostIcon,
  Preview as PreviewIcon,
} from '@mui/icons-material';

// Event Types
export const EVENT_TYPES = {
  workshop: { label: 'Workshop', icon: '🎓', description: 'Educational or training session' },
  sale: { label: 'Sale', icon: '🏷️', description: 'Special deals or discounts' },
  opening: { label: 'Grand Opening', icon: '🎉', description: 'New business or location' },
  meetup: { label: 'Meetup', icon: '👥', description: 'Community gathering' },
  other: { label: 'Other', icon: '📅', description: 'Custom event type' },
} as const;

// Field Limits
export const FIELD_LIMITS = {
  title: { min: 10, max: 100 },
  description: { min: 50, max: 1000 },
  keywords: { max: 10 },
  capacity: { min: 1, max: 10000 },
  minimumAge: { min: 0, max: 99 },
  ticketPrice: { min: 0, max: 9999 },
  images: { max: 10 },
} as const;

// Validation Messages
export const VALIDATION_MESSAGES = {
  required: 'This field is required',
  tooShort: (min: number) => `Must be at least ${min} characters`,
  tooLong: (max: number) => `Must be no more than ${max} characters`,
  invalidEmail: 'Please enter a valid email address',
  invalidPhone: 'Please enter a valid phone number',
  invalidUrl: 'Please enter a valid URL',
  invalidDate: 'Please select a valid date',
  endBeforeStart: 'End date must be after start date',
  pastDate: 'Date must be in the future',
  capacityTooLow: 'Capacity must be at least 1',
  capacityTooHigh: (max: number) => `Capacity cannot exceed ${max}`,
  priceTooHigh: (max: number) => `Price cannot exceed $${max}`,
  tooManyKeywords: (max: number) => `Maximum ${max} keywords allowed`,
  invalidLocation: 'Please provide a valid location',
  virtualUrlRequired: 'Virtual meeting URL is required for online events',
} as const;

// Event Steps Configuration
export const EVENT_STEPS: StepConfig[] = [
  {
    label: 'Event Type',
    description: 'What kind of event is this?',
    icon: EventIcon,
    fields: ['eventType', 'categoryId', 'subcategory'],
  },
  {
    label: 'Basic Info',
    description: 'Event title and description',
    icon: DescriptionIcon,
    fields: ['title', 'description', 'keywords'],
  },
  {
    label: 'Date & Time',
    description: 'When is your event?',
    icon: CalendarIcon,
    fields: ['startDate', 'endDate', 'isAllDay', 'recurringType'],
  },
  {
    label: 'Location',
    description: 'Where is your event?',
    icon: LocationIcon,
    fields: ['isVirtual', 'locationName', 'address', 'city', 'state', 'zipCode', 'virtualMeetingUrl'],
  },
  {
    label: 'Attendance',
    description: 'Guest settings and capacity',
    icon: PeopleIcon,
    fields: ['hasCapacityLimit', 'maxCapacity', 'rsvpRequired', 'requiresPayment', 'ticketPrice'],
  },
  {
    label: 'Images',
    description: 'Add photos for your event',
    icon: ImageIcon,
    fields: ['primaryImage', 'galleryImages'],
    optional: true,
  },
  {
    label: 'Business Locations',
    description: 'Select which locations host this event',
    icon: LocationIcon,
    fields: ['location_ids'],
    optional: true,
  },
  {
    label: 'Boost',
    description: 'Increase event visibility',
    icon: BoostIcon,
    fields: ['isBoostEnabled', 'boostTargetTier'],
    optional: true,
  },
  {
    label: 'Review',
    description: 'Review and create your event',
    icon: PreviewIcon,
    fields: [],
  },
];

// Default Form Values
export const DEFAULT_FORM_DATA: EventFormData = {
  title: '',
  description: '',
  eventType: 'meetup',
  categoryId: '',
  subcategory: '',
  
  startDate: null,
  endDate: null,
  isAllDay: false,
  
  isVirtual: false,
  locationName: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  virtualMeetingUrl: '',
  location_ids: [], // Empty array means all locations
  
  hasCapacityLimit: false,
  maxCapacity: undefined,
  rsvpRequired: false,
  requiresPayment: false,
  ticketPrice: undefined,
  registrationDeadline: null,
  
  isAgeRestricted: false,
  minimumAge: undefined,
  
  galleryImages: [],
  
  isBoostEnabled: false,
  boostTargetTier: undefined,
  boostCost: 0,
  
  keywords: [],
  keywordsInput: '',
  
  status: 'draft',
  visibility: 'public',
  
  allowComments: true,
  allowSharing: true,
  sendReminders: true,
};

// Boost Pricing Configuration
export const BOOST_PRICING = {
  bronze: {
    name: 'Bronze',
    dailyRate: 500, // $5 per day in cents
    reach: 1000,
    description: 'Basic visibility boost',
    features: ['Homepage listing', 'Category highlight'],
  },
  silver: {
    name: 'Silver', 
    dailyRate: 1000, // $10 per day
    reach: 2500,
    description: 'Enhanced visibility',
    features: ['Priority listing', 'Search boost', 'Social shares'],
  },
  gold: {
    name: 'Gold',
    dailyRate: 2000, // $20 per day
    reach: 5000,
    description: 'Maximum exposure',
    features: ['Featured placement', 'Newsletter inclusion', 'Push notifications'],
  },
  diamond: {
    name: 'Diamond',
    dailyRate: 3500, // $35 per day
    reach: 10000,
    description: 'Premium campaign',
    features: ['Top placement everywhere', 'Dedicated email blast', 'Social media promotion'],
  },
} as const;

// Default Categories
export const DEFAULT_CATEGORIES = [
  { id: '1', name: 'Arts & Culture', subcategories: ['Art Show', 'Theater', 'Museum', 'Concert'] },
  { id: '2', name: 'Food & Drink', subcategories: ['Restaurant', 'Bar', 'Food Festival', 'Wine Tasting'] },
  { id: '3', name: 'Health & Wellness', subcategories: ['Fitness', 'Yoga', 'Meditation', 'Wellness Workshop'] },
  { id: '4', name: 'Music & Entertainment', subcategories: ['Live Music', 'DJ', 'Comedy', 'Dance'] },
  { id: '5', name: 'Sports & Recreation', subcategories: ['Sports Game', 'Tournament', 'Outdoor Activity', 'Fitness Class'] },
  { id: '6', name: 'Education & Learning', subcategories: ['Workshop', 'Seminar', 'Class', 'Lecture'] },
  { id: '7', name: 'Business & Networking', subcategories: ['Networking', 'Conference', 'Career Fair', 'Business Meeting'] },
  { id: '8', name: 'Community & Social', subcategories: ['Community Event', 'Fundraiser', 'Volunteer', 'Social Gathering'] },
];

// US States
export const US_STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
];

// Boost Tiers Configuration
export const BOOST_TIERS = [
  {
    id: 'starter',
    name: 'Starter Boost',
    price: 25,
    color: 'primary.main' as const,
    features: [
      '2x visibility in listings',
      'Featured badge',
      'Email newsletter inclusion',
    ],
    popular: false,
  },
  {
    id: 'professional',
    name: 'Professional Boost',
    price: 50,
    color: 'secondary.main' as const,
    features: [
      '5x visibility in listings',
      'Premium featured badge',
      'Top placement in category',
      'Email + push notifications',
      'Social media promotion',
    ],
    popular: true,
  },
  {
    id: 'premium',
    name: 'Premium Boost',
    price: 100,
    color: 'error.main' as const,
    features: [
      '10x visibility in listings',
      'Exclusive featured badge',
      'Homepage spotlight',
      'All notification channels',
      'Dedicated social campaign',
      'Analytics dashboard',
    ],
    popular: false,
  },
];