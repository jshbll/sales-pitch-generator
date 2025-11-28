import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Box, TextField, MenuItem, Button, Typography, FormControl, InputLabel, Select, Chip, SelectChangeEvent, Switch, FormControlLabel, ToggleButton, ToggleButtonGroup, OutlinedInput, Checkbox, ListItemText, FormHelperText, Autocomplete, Alert } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useAuth } from '../../hooks/useAuth';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { useThemeMode } from '../../contexts/ThemeContext';
import { useAction, useMutation } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { Id } from '../../../../../convex/_generated/dataModel';
import { geocodeAddress } from '../../utils/geocodeUtils';
import AddressAutocomplete from '../common/AddressAutocomplete';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import BusinessIcon from '@mui/icons-material/Business';
import RoomServiceIcon from '@mui/icons-material/RoomService';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import PinterestIcon from '@mui/icons-material/Pinterest';
import LanguageIcon from '@mui/icons-material/Language';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckIcon from '@mui/icons-material/Check';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { BusinessFormData, FormErrorType } from '../../types';
import { defaultBusinessHours } from '../../types/businessHours';
import { validateStep } from './utils/WizardValidation';
import { handleSubmission } from './utils/WizardSubmissionHandler';
import { useFormStatePersistence } from '../../hooks/useFormStatePersistence';
import { FormError } from './utils/BusinessFormErrorHandler';
import AddressModal, { AddressData } from './AddressModal';
import ImageCropper from './ImageCropper';
import { useQuery } from 'convex/react';
import PhoneInput from '../common/PhoneInput';
import { isValidUSPhoneNumber } from '../../utils/phoneUtils';

// US States list with Florida as default
const US_STATES = [
  { value: 'FL', label: 'Florida' },
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
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
  { value: 'WY', label: 'Wyoming' }
];

// Typeform-style container component
interface TypeformContainerProps {
  children: React.ReactNode;
  currentQuestion: number;
  totalQuestions: number;
  onClose?: () => void;
}

const TypeformContainer: React.FC<TypeformContainerProps> = ({
  children,
  currentQuestion,
  totalQuestions,
  onClose
}) => {
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
        position: 'relative',
        width: '100%',
        overflow: 'auto'
      }}
    >
      {/* Header with progress */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          bgcolor: 'background.default',
          borderBottom: '1px solid',
          borderColor: 'divider',
          px: 3,
          py: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="caption" color="text.secondary">
            {currentQuestion + 1} of {totalQuestions}
          </Typography>
          {onClose && (
            <Button
              onClick={onClose}
              size="small"
              variant="text"
              sx={{ minWidth: 'auto', p: 1 }}
            >
              <CloseIcon />
            </Button>
          )}
        </Box>
        <Box
          sx={{
            mt: 1,
            height: 2,
            bgcolor: 'grey.200',
            borderRadius: 1,
            overflow: 'hidden'
          }}
        >
          <Box
            sx={{
              height: '100%',
              bgcolor: 'primary.main',
              width: `${progress}%`,
              transition: 'width 0.5s ease'
            }}
          />
        </Box>
      </Box>

      {/* Main content */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 3,
          py: 8
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

// Typeform-style question component
interface TypeformQuestionProps {
  question: string;
  description?: string;
  children: React.ReactNode;
  onContinue: () => void;
  onBack?: () => void;
  onSkip?: () => void;
  continueLabel?: string;
  isValid?: boolean;
  showContinue?: boolean;
  showSkip?: boolean;
  helpText?: string;
  showBackButton?: boolean;
  error?: string;
  isRequiredForPublishing?: boolean;
}

const TypeformQuestion: React.FC<TypeformQuestionProps> = ({
  question,
  description,
  children,
  onContinue,
  onBack,
  onSkip,
  continueLabel = "OK",
  isValid = true,
  showContinue = true,
  showSkip = false,
  helpText,
  showBackButton = false,
  error,
  isRequiredForPublishing = false
}) => {
  const { mode } = useThemeMode();

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isValid && !e.shiftKey) {
      onContinue();
    }
  };

  return (
    <Box
      onKeyPress={handleKeyPress}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        width: '100%',
        maxWidth: '600px',
        mx: 'auto'
      }}
    >
      {/* Question */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%' }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{
            mb: 2,
            fontWeight: 500,
            fontSize: { xs: '1.75rem', sm: '2.125rem', md: '2.5rem' },
            lineHeight: 1.3,
            color: 'text.primary'
          }}
        >
          {question}
        </Typography>
      </motion.div>

      {/* Description */}
      {description && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{ width: '100%' }}
        >
          <Typography
            variant="body1"
            sx={{
              mb: 4,
              color: 'text.secondary',
              fontSize: { xs: '0.95rem', sm: '1.05rem' }
            }}
          >
            {description}
          </Typography>
        </motion.div>
      )}

      {/* Input area */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        style={{ width: '100%' }}
      >
        <Box sx={{ mb: 4, width: '100%' }}>
          {children}
        </Box>
      </motion.div>

      {/* Error message */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          style={{ width: '100%' }}
        >
          <Typography
            variant="body2"
            sx={{
              mb: 3,
              color: 'error.main',
              fontSize: '0.875rem',
              textAlign: 'left'
            }}
          >
            {error}
          </Typography>
        </motion.div>
      )}

      {/* Help text */}
      {helpText && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={{ width: '100%' }}
        >
          <Typography
            variant="caption"
            sx={{
              mb: 3,
              color: 'text.secondary',
              fontSize: '0.875rem'
            }}
          >
            {helpText}
          </Typography>
        </motion.div>
      )}

      {/* Continue, Back, and Skip buttons */}
      {(showContinue || showBackButton || showSkip) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
            {/* Required for Publishing notation */}
            {isRequiredForPublishing && showSkip && (
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'warning.main',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  mb: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5
                }}
              >
                ⚠️ Required to Publish Profile
              </Typography>
            )}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', alignItems: 'center' }}>
              {showBackButton && onBack && (
                <Button
                  variant="outlined"
                  size="large"
                  onClick={onBack}
                  startIcon={<ArrowBackIcon />}
                  sx={{
                    px: 3,
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 500,
                    borderRadius: 2,
                    borderColor: 'grey.400',
                    color: 'text.secondary',
                    '&:hover': {
                      borderColor: 'grey.600',
                      bgcolor: 'grey.50'
                    }
                  }}
                >
                  Back
                </Button>
              )}
              {showContinue && (
                <Button
                  variant="contained"
                  size="large"
                  onClick={onContinue}
                  disabled={!isValid}
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 600,
                    borderRadius: 2,
                    background: isValid
                      ? mode === 'dark'
                        ? '#FFFFFF'  // White for dark mode
                        : '#000000'  // Black for light mode
                      : '#9e9e9e',
                    color: mode === 'dark' ? '#000' : '#FFFFFF',
                    boxShadow: isValid
                      ? mode === 'dark'
                        ? '0 4px 15px rgba(255, 255, 255, 0.3)'
                        : '0 4px 15px rgba(0, 0, 0, 0.3)'
                      : 'none',
                    '&:hover': {
                      background: isValid
                        ? mode === 'dark'
                          ? '#F5F5F5'  // Light gray for dark mode hover
                          : '#1F1F1F'  // Dark gray for light mode hover
                        : '#9e9e9e',
                      boxShadow: isValid
                        ? mode === 'dark'
                          ? '0 6px 20px rgba(255, 255, 255, 0.4)'
                          : '0 6px 20px rgba(0, 0, 0, 0.4)'
                        : 'none',
                      transform: isValid ? 'translateY(-2px)' : 'none'
                    },
                    '&.Mui-disabled': {
                      color: mode === 'dark' ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.7)',
                      background: '#9e9e9e'
                    }
                  }}
                >
                  {continueLabel}
                </Button>
              )}
            </Box>
            {showSkip && onSkip && (
              <Button
                variant="text"
                size="medium"
                onClick={onSkip}
                sx={{
                  color: 'text.secondary',
                  fontSize: '0.9rem',
                  textDecoration: 'underline',
                  '&:hover': {
                    textDecoration: 'underline',
                    bgcolor: 'transparent'
                  }
                }}
              >
                Skip For Now
              </Button>
            )}
          </Box>
        </motion.div>
      )}
    </Box>
  );
};

// Props for the wizard component
interface InitialBusinessOnboardingWizardProps {
  customTitle?: string;
  redirectAfterCompletion?: string;
  isLocationMode?: boolean;
  businessId?: Id<"businesses">;
  onSuccess?: (locationId?: string) => void; // Pass locationId when creating location
  onCancel?: () => void;
}

// Main wizard component
const InitialBusinessOnboardingWizard: React.FC<InitialBusinessOnboardingWizardProps> = ({
  customTitle,
  redirectAfterCompletion,
  isLocationMode = false,
  businessId: locationBusinessId,
  onSuccess,
  onCancel
}) => {
  // Log component initialization
  console.log('[OnboardingWizard] Component initialized with:', {
    isLocationMode,
    locationBusinessId,
    customTitle,
  });

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { user, updateUser } = useAuth();
  const { markOnboardingCompleted, businessProfile, isOnboardingComplete, createBusinessProfile } = useOnboarding();
  const { mode } = useThemeMode();
  const updateBusinessCoordinates = useMutation(api.businesses.updateBusinessCoordinates);
  const createLocation = useMutation(api.businessLocations.createLocation);
  const createLocationWithGeocode = useAction(api.businessLocations.createLocationWithGeocode);
  const uploadImageFromBase64 = useAction(api.images.uploadImageFromBase64);
  const markOnboardingAsComplete = useMutation(api.businesses.markOnboardingAsComplete);

  // Helper function to convert File to base64 data URL
  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Fetch business categories from Convex database (alphabetically sorted)
  const categoriesData = useQuery(api.businessCategories.getBusinessCategories, { activeOnly: true });
  
  // Debug logging for categories
  useEffect(() => {
    console.log('[TypeformWizard] Categories data:', categoriesData);
    console.log('[TypeformWizard] Categories count:', categoriesData?.length);
    if (categoriesData && categoriesData.length > 0) {
      console.log('[TypeformWizard] First category:', categoriesData[0]);
    }
  }, [categoriesData]);
  
  // Allow starting at a specific step for testing
  const urlParams = new URLSearchParams(window.location.search);
  const testStep = urlParams.get('step');
  const initialStep = testStep ? parseInt(testStep) : 0;
  
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showLocationSuccess, setShowLocationSuccess] = useState(false);
  
  // Logo cropper state
  const [cropperOpen, setCropperOpen] = useState(false);
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);
  
  // Address type state
  const [addressType, setAddressType] = useState<'physical' | 'service'>('physical');
  const [customersDoNotVisit, setCustomersDoNotVisit] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isEditingServiceArea, setIsEditingServiceArea] = useState(false);
  
  // Social media validation state
  const [socialFieldErrors, setSocialFieldErrors] = useState<Record<string, string>>({});
  const [socialFieldHelpers, setSocialFieldHelpers] = useState<Record<string, string>>({});
  
  // Category search term state
  const [categorySearchTerm, setCategorySearchTerm] = useState('');

  // Removed categorySearchTerm - now handled by Autocomplete component internally

  // Ref for autofocusing the first input field in each step
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Set default state to Florida if not already set
  useEffect(() => {
    if (!formData.state) {
      updateFormData({ state: 'FL' });
    }
  }, []);

  // Reset category search term when step changes
  useEffect(() => {
    setCategorySearchTerm('');
  }, [currentStep]);

  // Prepare initial data from existing business profile
  const initialFormData = useMemo(() => {
    console.log('[InitialBusinessOnboardingWizard] businessProfile:', businessProfile);
    
    const baseData: Partial<BusinessFormData> = {
      state: 'FL', // Default to Florida
      businessHours: defaultBusinessHours // Default business hours
    };

    // Populate with existing business data if available
    if (businessProfile) {
      console.log('[InitialBusinessOnboardingWizard] Populating with existing data');
      return {
        ...baseData,
        business_name: businessProfile.name || baseData.business_name,
        description: businessProfile.description || baseData.description,
        address: businessProfile.address || baseData.address,
        city: businessProfile.city || baseData.city,
        state: businessProfile.state || baseData.state || 'FL',
        zip: businessProfile.zip || baseData.zip,
        phone: businessProfile.phone || baseData.phone,
        email: businessProfile.email || baseData.email, // business_locations.email field
        website: businessProfile.website || baseData.website,
        category: businessProfile.category || baseData.category,
        categories: businessProfile.categories || baseData.categories,
        businessHours: businessProfile.business_hours || businessProfile.businessHours || baseData.businessHours,
        customersDoNotVisit: businessProfile.customersDoNotVisit || false,
        serviceZip: businessProfile.serviceZip || baseData.serviceZip,
        serviceRadius: businessProfile.serviceRadius || baseData.serviceRadius,
        instagramUrl: businessProfile.instagram_url || baseData.instagramUrl,
        facebookUrl: businessProfile.facebook_url || baseData.facebookUrl,
        twitterUrl: businessProfile.twitter_url || baseData.twitterUrl,
        linkedinUrl: businessProfile.linkedin_url || baseData.linkedinUrl,
        tiktokUrl: businessProfile.tiktok_url || baseData.tiktokUrl,
        pinterestUrl: businessProfile.pinterest_url || baseData.pinterestUrl,
        // Load logo data from database for validation
        logo_url: businessProfile.logo_url || baseData.logo_url,
        logo_id: businessProfile.logo_id || baseData.logo_id,
        existingLogoUrl: businessProfile.logo_url
      };
    }

    return baseData;
  }, [businessProfile]);

  // Form state persistence
  const {
    formData,
    updateFormData: originalUpdateFormData,
    clearPersistedData
  } = useFormStatePersistence<Partial<BusinessFormData>>({
    storageKey: `business-onboarding-${user?.id || 'anonymous'}`,
    initialData: initialFormData,
    enabled: true,
    useSessionStorage: true
  });

  // Wrapped updateFormData with logging for debugging
  const updateFormData = (updates: Partial<BusinessFormData>) => {
    // Log important field changes
    const importantFields = ['logoFile', 'address', 'city', 'state', 'zip', 'latitude', 'longitude'];
    const changedImportantFields = Object.keys(updates).filter(key => importantFields.includes(key));

    if (changedImportantFields.length > 0 || isLocationMode) {
      console.log('[OnboardingWizard] Form data update:', {
        isLocationMode,
        changedFields: Object.keys(updates),
        updates: {
          ...updates,
          logoFile: updates.logoFile ? `File(${updates.logoFile.name}, ${updates.logoFile.size} bytes)` : undefined
        }
      });
    }

    originalUpdateFormData(updates);
  };

  // Update form data with business profile data when it loads
  useEffect(() => {
    if (businessProfile && Object.keys(businessProfile).length > 0) {
      console.log('[InitialBusinessOnboardingWizard] Updating form with business profile data');
      
      // Only update fields that are empty in the current form data
      const updates: Partial<BusinessFormData> = {};
      
      // Check and update each field only if it's not already set
      if (!formData.business_name && businessProfile.name) {
        updates.business_name = businessProfile.name;
      }
      if (!formData.description && businessProfile.description) {
        updates.description = businessProfile.description;
      }
      if (!formData.address && businessProfile.address) {
        updates.address = businessProfile.address;
      }
      if (!formData.city && businessProfile.city) {
        updates.city = businessProfile.city;
      }
      if (!formData.state && businessProfile.state) {
        updates.state = businessProfile.state;
      }
      if (!formData.zip && businessProfile.zip) {
        updates.zip = businessProfile.zip;
      }
      if (!formData.phone && businessProfile.phone) {
        updates.phone = businessProfile.phone;
      }
      if (!formData.email && businessProfile.email) {
        updates.email = businessProfile.email; // business_locations.email field
      }
      if (!formData.website && businessProfile.website) {
        updates.website = businessProfile.website;
      }
      if (!formData.category && businessProfile.category) {
        updates.category = businessProfile.category;
      }
      if ((!formData.categories || formData.categories.length === 0) && businessProfile.categories) {
        updates.categories = businessProfile.categories;
      }
      if (!formData.businessHours && businessProfile.business_hours) {
        updates.businessHours = businessProfile.business_hours;
      }
      if (!formData.existingLogoUrl && businessProfile.logo_url) {
        updates.existingLogoUrl = businessProfile.logo_url;
      }
      
      // Social media links
      if (!formData.instagramUrl && businessProfile.instagram_url) {
        updates.instagramUrl = businessProfile.instagram_url;
      }
      if (!formData.facebookUrl && businessProfile.facebook_url) {
        updates.facebookUrl = businessProfile.facebook_url;
      }
      if (!formData.twitterUrl && businessProfile.twitter_url) {
        updates.twitterUrl = businessProfile.twitter_url;
      }
      if (!formData.linkedinUrl && businessProfile.linkedin_url) {
        updates.linkedinUrl = businessProfile.linkedin_url;
      }
      
      // Service area
      if (businessProfile.customersDoNotVisit !== undefined) {
        updates.customersDoNotVisit = businessProfile.customersDoNotVisit;
      }
      if (!formData.serviceZip && businessProfile.serviceZip) {
        updates.serviceZip = businessProfile.serviceZip;
      }
      if (!formData.serviceRadius && businessProfile.serviceRadius) {
        updates.serviceRadius = businessProfile.serviceRadius;
      }
      
      // Only update if there are changes
      if (Object.keys(updates).length > 0) {
        console.log('[InitialBusinessOnboardingWizard] Applying updates:', updates);
        updateFormData(updates);
      }
    }
  }, [businessProfile]); // Don't include formData in deps to avoid infinite loop

  const questions = useMemo(() => {
    const baseQuestions = [
      {
        id: 'welcome',
        question: isLocationMode ? "Let's add a new location! 📍" : (customTitle || "Let's set up your business profile! 🚀"),
        description: isLocationMode ? "We'll walk you through setting up your new business location with address validation." : (customTitle ? "Complete your business location setup to continue." : "We'll walk you through a few quick questions to get your business listed and ready for customers."),
        type: 'welcome',
        skippable: false
      }
    ];
    
    // Only add business_name question if NOT in location mode
    if (!isLocationMode) {
      baseQuestions.push({
        id: 'business_name',
        question: "What's your business name?",
        description: "This will be used for the account interntally. ",
        type: 'text',
        field: 'business_name',
        placeholder: 'Your Legal Business Name LLC',
        required: true,
        skippable: false  // Step 1 - Required for business creation
      });
    }
    
    // Continue with the rest of the questions
    baseQuestions.push(
    {
      id: 'internal_name',
      question: "What do you call this location?",
      description: "Nickname for internal use ('Headquarters', 'Dalton Street').",
      type: 'text',
      field: 'internal_name',
      placeholder: 'The Headquarters',
      required: true,
      skippable: false  // Step 2 - Required for location setup
    },
    {
      id: 'profile_name',
      question: "What name would you like to appear on your profile?",
      description: "Your Profile Business Name ('Business Name', 'Business Name Park St').",
      type: 'text',
      field: 'profile_name',
      placeholder: 'Business Name',
      required: true,
      skippable: false  // Step 3 - Required for location display
    },
    {
      id: 'business_category',
      question: "What's your primary business category?",
      description: "Choose the main category that best describes your business.",
      type: 'select',
      field: 'category',
      required: true,
      skippable: false,  // Step 4 - Required for categorization
      options: categoriesData?.map(cat => cat.name) || []
    },
    {
      id: 'business_description',
      question: `What is ${formData.business_name || 'your business'}`,
      description: "This will be shown on your profile. Describe in 1-2 sentences.",
      type: 'textarea',
      field: 'description',
      placeholder: 'We are a full-service restaurant offering a variety of dishes made from fresh ingredients.',
      required: true,
      skippable: false   // Step 5 - Required for complete profile
    },
    {
      id: 'business_logo',
      question: "Upload your business logo",
      description: "This logo will appear on your profile.",
      type: 'logo',
      field: 'logoFile',
      required: true,
      skippable: false   // Step 6 - Required for professional appearance
    },
    {
      id: 'contact_info',
      question: `What is ${formData.business_name || 'your business'} contact information?`,
      description: "Provide your business phone number and email address for customers to reach your business.",
      type: 'contact',
      required: true,
      skippable: false   // Step 7 - Required for customer contact
    },
    {
      id: 'location',
      question: "Where is your business located?",
      description: "Choose either a physical address OR a service area - not both.",
      type: 'address',
      required: true,
      skippable: false   // Step 8 - Required for location services
    },
    {
      id: 'hours',
      question: "When are you open?",
      description: "Let customers know your business hours.",
      type: 'hours',
      required: true,
      skippable: false   // Step 9 - Required for customer planning
    });
    
    return baseQuestions;
  }, [categoriesData, customTitle, isLocationMode]); // Dependencies include isLocationMode

  // Sync customersDoNotVisit state with formData after it's initialized
  useEffect(() => {
    if (formData.customersDoNotVisit !== undefined) {
      setCustomersDoNotVisit(formData.customersDoNotVisit);
    }
  }, [formData.customersDoNotVisit]);

  // Auto-focus the first input field when step changes
  useEffect(() => {
    const timer = setTimeout(() => {
      // First try the ref
      if (firstInputRef.current) {
        firstInputRef.current.focus();
        return;
      }

      // Fallback: find the first focusable input in the current step
      const currentQuestion = questions[currentStep];
      if (currentQuestion?.type === 'select' || currentQuestion?.type === 'multi_select') {
        // For select dropdowns, find the input element inside Autocomplete
        const autoCompleteInput = document.querySelector('.MuiAutocomplete-input') as HTMLElement;
        if (autoCompleteInput) {
          autoCompleteInput.focus();
        } else {
          // Fallback for regular select
          const selectElement = document.querySelector('.MuiSelect-select') as HTMLElement;
          if (selectElement) {
            selectElement.focus();
          }
        }
      } else if (currentQuestion?.type === 'welcome') {
        // For welcome step, focus the continue button
        const continueButton = document.querySelector('button[type="button"]') as HTMLElement;
        if (continueButton) {
          continueButton.focus();
        }
      } else if (currentQuestion?.type === 'social_media') {
        // Focus the first social media input field
        const firstSocialInput = document.querySelector('input[type="text"]') as HTMLElement;
        if (firstSocialInput) {
          firstSocialInput.focus();
        }
      } else if (currentQuestion?.type === 'address') {
        // Focus the first address input or button
        const addressInput = document.querySelector('input[type="text"], button') as HTMLElement;
        if (addressInput) {
          addressInput.focus();
        }
      } else if (currentQuestion?.type === 'hours') {
        // Focus the first time input
        const timeInput = document.querySelector('input[type="time"]') as HTMLElement;
        if (timeInput) {
          timeInput.focus();
        }
      } else {
        // For other steps, try to find any input field
        const inputElement = document.querySelector('input:not([type="hidden"]), textarea') as HTMLElement;
        if (inputElement) {
          inputElement.focus();
        }
      }
    }, 400); // Slightly longer delay to ensure animations complete

    return () => clearTimeout(timer);
  }, [currentStep, questions]);

  const currentQuestion = questions[currentStep];
  
  // Use centralized phone validation from phoneUtils
  const validatePhoneNumber = (phone: string): boolean => {
    return isValidUSPhoneNumber(phone);
  };

  // Email validation regex
  const validateEmail = (email: string): boolean => {
    if (!email || email.trim() === '') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  // Website validation
  const validateWebsite = (url: string): { isValid: boolean; error?: string } => {
    if (!url || url.trim() === '') {
      return { isValid: true }; // Website is optional, empty is valid
    }
    
    const trimmedUrl = url.trim();
    
    // Check if it starts with http:// or https://
    if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
      return { 
        isValid: false, 
        error: 'Website must start with http:// or https://' 
      };
    }
    
    // Basic URL validation
    try {
      const urlObj = new URL(trimmedUrl);
      // Must have a domain with at least one dot
      if (!urlObj.hostname.includes('.')) {
        return { 
          isValid: false, 
          error: 'Please enter a valid website URL' 
        };
      }
      return { isValid: true };
    } catch {
      return { 
        isValid: false, 
        error: 'Please enter a valid website URL' 
      };
    }
  };
  
  // Social media URL validation
  const validateSocialUrl = (field: string, value: string) => {
    // Clear validation for empty values
    if (!value || value.trim() === '') {
      setSocialFieldErrors(prev => ({ ...prev, [field]: '' }));
      setSocialFieldHelpers(prev => ({ ...prev, [field]: '' }));
      return true;
    }

    const trimmedValue = value.trim();
    
    // Check for missing protocol
    if (!trimmedValue.includes('://')) {
      setSocialFieldErrors(prev => ({ ...prev, [field]: 'URL must start with https://' }));
      setSocialFieldHelpers(prev => ({ 
        ...prev, 
        [field]: `Tip: Try adding https:// at the beginning` 
      }));
      return false;
    }

    // Check for http instead of https
    if (trimmedValue.startsWith('http://')) {
      setSocialFieldErrors(prev => ({ ...prev, [field]: 'Please use https:// for security' }));
      setSocialFieldHelpers(prev => ({ 
        ...prev, 
        [field]: `Change http:// to https://` 
      }));
      return false;
    }

    // Platform-specific validation
    const platformValidations: Record<string, RegExp> = {
      instagramUrl: /^https:\/\/(www\.)?instagram\.com\/.+/,
      facebookUrl: /^https:\/\/(www\.)?facebook\.com\/.+/,
      tiktokUrl: /^https:\/\/(www\.)?tiktok\.com\/.+/,
      linkedinUrl: /^https:\/\/(www\.)?linkedin\.com\/(company|in)\/.+/,
      twitterUrl: /^https:\/\/((www\.)?twitter\.com|(www\.)?x\.com)\/.+/,
      pinterestUrl: /^https:\/\/(www\.)?pinterest\.com\/.+/
    };
    
    if (platformValidations[field]) {
      if (!platformValidations[field].test(trimmedValue)) {
        const platformName = field.replace('Url', '').replace('website', 'Website');
        setSocialFieldErrors(prev => ({ 
          ...prev, 
          [field]: `Invalid ${platformName} URL format` 
        }));
        setSocialFieldHelpers(prev => ({ 
          ...prev, 
          [field]: `Check the URL format for ${platformName}` 
        }));
        return false;
      }
    }

    // Clear errors if valid
    setSocialFieldErrors(prev => ({ ...prev, [field]: '' }));
    setSocialFieldHelpers(prev => ({ ...prev, [field]: '' }));
    return true;
  };

  // Calculate isValid without causing side effects during render
  const isValid = useMemo(() => {
    if (currentQuestion?.type === 'welcome') return true;
    
    const question = questions[currentStep];
    console.log('Validation check for step', currentStep, ':', {
      question: question,
      questionType: question?.type,
      required: question?.required,
      logoFile: formData.logoFile
    });
    
    if (!question || !question.required) return true;

    // Special handling for contact type which has multiple fields
    if (question.type === 'contact') {
      const phone = formData.phone || '';
      const email = formData.email || '';
      
      const hasValidPhone = phone.trim() !== '' && validatePhoneNumber(phone);
      const hasValidEmail = email.trim() !== '' && email.includes('@');
      
      return hasValidPhone && hasValidEmail;
    }

    // Special handling for address type which has multiple fields
    if (question.type === 'address') {
      if (addressType === 'physical') {
        const address = formData.address || '';
        const city = formData.city || '';
        const state = formData.state || '';
        const zip = formData.zip || '';
        
        return address.trim() !== '' && city.trim() !== '' && state.trim() !== '' && zip.trim() !== '';
      } else {
        // Service area validation
        const serviceZip = formData.serviceZip || '';
        const serviceRadius = formData.serviceRadius || 0;
        
        return serviceZip.trim().length >= 5 && serviceRadius > 0;
      }
    }

    // Special handling for hours type - optional step
    if (question.type === 'hours') {
      return true; // Hours are optional, always allow continue
    }
    
    // Special handling for logo type - required for onboarding
    if (question.type === 'logo') {
      console.log('Logo validation check:', {
        questionType: question.type,
        logoFile: formData.logoFile,
        logoFileType: typeof formData.logoFile,
        logoFileName: formData.logoFile?.name,
        logoFileSize: formData.logoFile?.size,
        hasLogo: !!formData.logoFile,
        existingLogoUrl: formData.existingLogoUrl,
        isValidFile: formData.logoFile instanceof File && formData.logoFile.size > 0
      });
      // Check if it's a valid file with content OR existing logo URL
      return (formData.logoFile instanceof File && formData.logoFile.size > 0) || !!formData.existingLogoUrl;
    }

    // Special handling for multi_select type - at least one option must be selected
    if (question.type === 'multi_select') {
      const selectedValues = formData[question.field as keyof BusinessFormData] as string[];
      return selectedValues && selectedValues.length > 0;
    }

    // For other types, check the single field value
    const value = formData[question.field as keyof BusinessFormData];
    
    // Special handling for website field (optional but must be valid if provided)
    if (question.field === 'website') {
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        return true; // Website is optional
      }
      const validation = validateWebsite(value as string);
      return validation.isValid;
    }
    
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return false;
    }

    // Special validation for description field - must be at least 20 characters
    if (question.field === 'description' && typeof value === 'string' && value.trim().length < 20) {
      return false;
    }
    
    // Special validation for email field
    if (question.type === 'email' && typeof value === 'string') {
      if (!value || value.trim() === '') {
        return !question.required; // Email is optional
      }
      return validateEmail(value);
    }

    return true;
  }, [currentStep, formData, formData.phone, formData.address, formData.city, formData.state, formData.zip, formData.serviceZip, formData.serviceRadius, formData.logoFile, addressType, questions, currentQuestion?.type]);

  function validateCurrentStep(): boolean {
    const question = questions[currentStep];
    if (!question || !question.required) return true;

    // Special handling for contact type which has multiple fields
    if (question.type === 'contact') {
      const phone = formData.phone || '';
      const email = formData.email || '';
      
      // Check if we have a phone number
      if (phone.trim() === '') {
        setErrors({ contact: 'Please provide a phone number for your business' });
        return false;
      }
      
      // Validate phone number
      if (!validatePhoneNumber(phone)) {
        setErrors({ contact: 'Please enter a valid 10-digit phone number (e.g., 904-555-1234)' });
        return false;
      }
      
      // Check if we have an email
      if (email.trim() === '') {
        setErrors({ contact: 'Please provide a public email address for your business' });
        return false;
      }
      
      // Validate email format
      if (!email.includes('@') || !email.includes('.')) {
        setErrors({ contact: 'Please enter a valid email address' });
        return false;
      }
      
      setErrors({});
      return true;
    }

    // Special handling for address type which has multiple fields
    if (question.type === 'address') {
      // Physical address is always required
      const address = formData.address || '';
      const city = formData.city || '';
      const state = formData.state || '';
      const zip = formData.zip || '';
      
      if (!address.trim() || !city.trim() || !state.trim() || !zip.trim()) {
        setErrors({ address: 'Please provide a complete business address with street, city, state, and ZIP code' });
        return false;
      }
      
      // If checkbox is checked, service area is also required
      if (formData.customersDoNotVisit) {
        const serviceZip = formData.serviceZip || '';
        const serviceRadius = formData.serviceRadius || 0;
        
        if (serviceZip.trim().length < 5) {
          setErrors({ address: 'Service area ZIP code is required (5 digits)' });
          return false;
        }
        
        if (serviceRadius <= 0) {
          setErrors({ address: 'Please select a service radius' });
          return false;
        }
      }
      
      setErrors({});
      return true;
    }

    // Special handling for hours type - optional step
    if (question.type === 'hours') {
      setErrors({});
      return true; // Hours are optional, always allow continue
    }
    
    // Special handling for logo type - required for onboarding
    if (question.type === 'logo') {
      if ((!formData.logoFile || !(formData.logoFile instanceof File) || formData.logoFile.size === 0) && !formData.existingLogoUrl) {
        setErrors({ logo: 'Please upload a business logo' });
        return false;
      }
      setErrors({});
      return true;
    }

    // For other types, check the single field value
    const value = formData[question.field as keyof BusinessFormData];
    
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      setErrors({ [question.field!]: 'This field is required' });
      return false;
    }

    // Special validation for description field - must be between 20 and 160 characters
    if (question.field === 'description' && typeof value === 'string') {
      const descLength = value.length;
      if (descLength < 20) {
        setErrors({ description: 'Business description must be at least 20 characters long' });
        return false;
      }
      if (descLength > 160) {
        setErrors({ description: 'Business description must be 160 characters or less' });
        return false;
      }
    }
    
    // Special validation for email field
    if (question.type === 'email' && typeof value === 'string') {
      if (value && value.trim() !== '' && !validateEmail(value)) {
        setErrors({ [question.field!]: 'Please enter a valid email address' });
        return false;
      }
    }

    setErrors({});
    return true;
  }

  // Format phone number as user types
  const formatPhoneNumber = (value: string): string => {
    // Remove all non-digit characters
    const digitsOnly = value.replace(/\D/g, '');
    
    // Limit to 10 digits
    const truncated = digitsOnly.substring(0, 10);
    
    // Format as (XXX) XXX-XXXX
    if (truncated.length >= 6) {
      return `(${truncated.substring(0, 3)}) ${truncated.substring(3, 6)}-${truncated.substring(6)}`;
    } else if (truncated.length >= 3) {
      return `(${truncated.substring(0, 3)}) ${truncated.substring(3)}`;
    } else if (truncated.length > 0) {
      return `(${truncated}`;
    }
    
    return '';
  };

  const handleNext = async () => {
    if (currentStep === 0) {
      // Welcome step, just proceed
      setCurrentStep(1);
      return;
    }

    if (!validateCurrentStep()) {
      return;
    }

    // Note: Geocoding and location sync will happen after the full profile is saved in onSuccess callback

    if (currentStep === questions.length - 1) {
      handleSubmit();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    }
  };

  const handleSkip = () => {
    // Skip to next step without validation
    if (currentStep === questions.length - 1) {
      // Last step, submit with partial data (skip validation for optional fields)
      handleSubmit(true); // Pass true to indicate skip mode
    } else {
      setCurrentStep(currentStep + 1);
      setErrors({});
    }
  };

  /**
   * Handle location creation - extracted for clarity and single responsibility
   * This function is called when isLocationMode=true and user submits the form
   */
  const handleLocationSubmit = async () => {
    console.log('[OnboardingWizard] ========== LOCATION SUBMISSION STARTED ==========');
    console.log('[OnboardingWizard] Creating new location for business:', locationBusinessId);
    console.log('[OnboardingWizard] Form data:', {
      hasLogoFile: !!formData.logoFile,
      logoFileName: formData.logoFile?.name,
      logoFileSize: formData.logoFile?.size,
      profile_name: formData.profile_name,
      internal_name: formData.internal_name,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zip: formData.zip,
      category: formData.category,
      phone: formData.phone,
      email: formData.email,
    });

    setIsLoading(true);

    try {
      // Step 1: Upload logo to Cloudflare if provided
      let logoUrl: string | undefined;
      let logoId: string | undefined;

      if (formData.logoFile) {
        try {
          console.log('[LocationMode] Uploading logo to Cloudflare...');
          const dataUrl = await fileToDataUrl(formData.logoFile);
          const uploadResult = await uploadImageFromBase64({
            dataUrl,
            filename: `location_logo_${Date.now()}.jpg`,
            metadata: { category: 'business-logo', businessId: locationBusinessId }
          });

          if (uploadResult) {
            logoUrl = uploadResult.url;
            logoId = uploadResult.id;
            console.log('[LocationMode] Logo uploaded successfully:', logoUrl);
          }
        } catch (logoError) {
          console.error('[LocationMode] Error uploading logo:', logoError);
          enqueueSnackbar('Failed to upload logo, but continuing with location creation', { variant: 'warning' });
        }
      } else {
        console.log('[LocationMode] No logo file provided');
      }

      // Step 2: Create location with geocoding (automatically geocodes the address)
      console.log('[LocationMode] Creating location with geocoding...');
      console.log('[LocationMode] Location data being sent:', {
        businessId: locationBusinessId,
        name: formData.internal_name || 'New Location',
        profile_name: formData.profile_name || '',
        address: formData.address || '',
        city: formData.city || '',
        state: formData.state || '',
        zip: formData.zip || '',
        phone: formData.phone || '',
        email: formData.email || '',
        category: formData.category,
        logo_url: logoUrl,
        logo_id: logoId,
      });

      const result = await createLocationWithGeocode({
        businessId: locationBusinessId!,
        name: formData.internal_name || 'New Location',
        profile_name: formData.profile_name || '',
        address: formData.address || '',
        city: formData.city || '',
        state: formData.state || '',
        zip: formData.zip || '',
        country: 'United States', // Default to US
        phone: formData.phone || '',
        email: formData.email || '',
        description: formData.description,
        category: formData.category,
        categories: formData.categories || [],
        business_hours: formData.businessHours || {},
        website: formData.website,
        logo_url: logoUrl,
        logo_id: logoId,
        instagramUrl: formData.instagramUrl,
        facebookUrl: formData.facebookUrl,
        twitterUrl: formData.twitterUrl,
        linkedinUrl: formData.linkedinUrl,
        pinterestUrl: formData.pinterestUrl,
      });

      console.log('[LocationMode] Location created with result:', result);

      // Check if geocoding succeeded
      if (result.geocoded === false) {
        console.warn('[LocationMode] Geocoding failed:', result.geocodeError);
        enqueueSnackbar(
          `Location created but address could not be verified. ${result.warning || 'Please verify the address manually.'}`,
          { variant: 'warning', autoHideDuration: 5000 }
        );
      } else {
        console.log('[LocationMode] Location geocoded successfully');
        enqueueSnackbar('Location added successfully!', { variant: 'success' });
      }

      // Clear persisted form data
      clearPersistedData();

      // Set a flag to show success message
      setShowLocationSuccess(true);

      // Call onSuccess callback with the newly created locationId
      if (onSuccess) {
        console.log('[LocationMode] Calling onSuccess callback with locationId:', result.locationId);
        onSuccess(result.locationId);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('[LocationMode] Error creating location:', error);
      setIsLoading(false);
      enqueueSnackbar('Failed to create location', { variant: 'error' });
    }
  };

  /**
   * Handle business creation - extracted for clarity and single responsibility
   * This function is called when isLocationMode=false (regular business onboarding)
   */
  const handleBusinessSubmit = async (skipValidation = false) => {
    console.log('[OnboardingWizard] ========== BUSINESS SUBMISSION STARTED ==========');
    setIsLoading(true);

    try {
      const callbacks = {
        onProgress: (step: number, message: string) => {
          // Handle progress updates
        },
        onSuccess: async (businessId: any) => {
          setIsLoading(false);
          clearPersistedData();

          enqueueSnackbar('Business profile created successfully!', { variant: 'success' });
          console.log('[TypeformWizard] Business creation success, businessId:', businessId);
          
          // Geocode the address and sync to location after successful save
          if (businessId && formData.address && formData.city && formData.state && formData.zip) {
            try {
              // Build the full address for geocoding
              const fullAddress = `${formData.address}, ${formData.city}, ${formData.state} ${formData.zip}`;
              console.log('[TypeformWizard] Geocoding address after save:', fullAddress);
              
              // Geocode the address
              const coordinates = await geocodeAddress(fullAddress);
              
              if (coordinates) {
                // Update the business with coordinates
                await updateBusinessCoordinates({
                  businessId: businessId,
                  latitude: coordinates.latitude,
                  longitude: coordinates.longitude,
                  geocoded_address: fullAddress,
                  geocoded_at: Date.now()
                });
                console.log('[TypeformWizard] Successfully geocoded and saved coordinates:', coordinates);
              } else {
                console.warn('[TypeformWizard] Could not geocode address:', fullAddress);
              }
            } catch (geoError) {
              console.error('[TypeformWizard] Error geocoding address:', geoError);
              // Don't fail the whole process if geocoding fails
            }
          }

          // Note: syncBusinessToLocation() was removed - not needed for new businesses
          // since createBusinessProfile() already creates the location table correctly

          // Update user's businessId in context before marking onboarding complete
          if (updateUser && businessId) {
            console.log('[TypeformWizard] Updating user with businessId:', businessId);
            updateUser({ businessId: businessId });
            
            // Small delay to ensure state update is processed
            await new Promise(resolve => setTimeout(resolve, 100));
          }
          
          // Mark onboarding as completed in database AND context
          console.log('[TypeformWizard] Marking onboarding as completed');
          try {
            // First update the database
            await markOnboardingAsComplete({ businessId });
            console.log('[TypeformWizard] Database updated with onboarding completion');
          } catch (error) {
            console.error('[TypeformWizard] Error marking onboarding complete in database:', error);
          }
          
          // Then update the context state
          markOnboardingCompleted({ id: businessId });
          
          // Dispatch event to refresh business profile in dashboard
          console.log('[TypeformWizard] Dispatching business-profile-updated event');
          const profileUpdateEvent = new CustomEvent('business-profile-updated', { 
            detail: { businessId, source: 'onboarding-complete' } 
          });
          window.dispatchEvent(profileUpdateEvent);
          
          // Navigate to specified redirect or business profile page
          console.log('[TypeformWizard] Navigating after completion');
          setTimeout(() => {
            if (redirectAfterCompletion) {
              navigate(redirectAfterCompletion);
            } else {
              navigate('/business/profile?onboarding_complete=true');
            }
          }, 200);
        },
        onError: (error: string) => {
          setIsLoading(false);
          enqueueSnackbar(error, { variant: 'error' });
        },
        onComplete: () => {
          setIsLoading(false);
        }
      };

      // Add addressType to form data for validation
      const formDataWithAddressType = {
        ...formData,
        addressType,
        // Ensure business hours always have default values if not set
        businessHours: formData.businessHours || defaultBusinessHours
      };

      console.log('[TypeformWizard] Submitting onboarding with:', {
        hasBusinessName: !!formDataWithAddressType.business_name,
        hasProfileName: !!formDataWithAddressType.profile_name,
        hasInternalName: !!formDataWithAddressType.internal_name,
        addressType
      });

      // Call the business creation flow
      await handleSubmission(formDataWithAddressType as BusinessFormData, user, true, callbacks, businessProfile, null, createBusinessProfile, skipValidation);
    } catch (error) {
      setIsLoading(false);
      enqueueSnackbar('Failed to create business profile', { variant: 'error' });
    }
  };

  /**
   * Main submission router - directs to appropriate handler based on mode
   * This is the entry point called by the form submission
   */
  const handleSubmit = async (skipValidation = false) => {
    console.log('[OnboardingWizard] ========== FORM SUBMISSION STARTED ==========');
    console.log('[OnboardingWizard] Mode:', isLocationMode ? 'LOCATION MODE' : 'BUSINESS MODE');
    console.log('[OnboardingWizard] Current form data summary:', {
      hasLogoFile: !!formData.logoFile,
      logoFileName: formData.logoFile?.name,
      logoFileSize: formData.logoFile?.size,
      profile_name: formData.profile_name,
      internal_name: formData.internal_name,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zip: formData.zip,
      category: formData.category,
      phone: formData.phone,
      email: formData.email,
    });

    // Early return pattern - clear control flow
    if (isLocationMode && locationBusinessId) {
      console.log('[OnboardingWizard] Routing to location submission handler');
      return handleLocationSubmit();
    }

    // Otherwise, business creation flow
    console.log('[OnboardingWizard] Routing to business submission handler');
    return handleBusinessSubmit(skipValidation);
  };

  // Address modal handlers
  const handleOpenAddressModal = () => {
    setShowAddressModal(true);
  };

  const handleCloseAddressModal = () => {
    setShowAddressModal(false);
  };

  const handleSaveAddress = (addressData: AddressData) => {
    console.log('[TypeformWizard] Saving address:', addressData);
    updateFormData({
      address: addressData.address,
      city: addressData.city,
      state: addressData.state,
      zip: addressData.zipCode,
      latitude: addressData.latitude,
      longitude: addressData.longitude
    });
    setShowAddressModal(false);
    console.log('[TypeformWizard] Form data updated, modal closed');
  };

  const getCurrentAddressData = (): AddressData => ({
    address: formData.address || '',
    city: formData.city || '',
    state: formData.state || '',
    zipCode: formData.zip || '',
    latitude: formData.latitude,
    longitude: formData.longitude
  });

  const renderQuestionContent = () => {
    const question = questions[currentStep];
    
    switch (question.type) {
      case 'welcome':
        return (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
              Ready to get started?
            </Typography>
          </Box>
        );

      case 'text':
      case 'textarea':
      case 'email':
        const fieldValue = formData[question.field! as keyof BusinessFormData] || '';
        const isDescription = question.field === 'description';
        const isWebsite = question.field === 'website';
        const isEmail = question.type === 'email';
        const fieldLength = typeof fieldValue === 'string' ? fieldValue.length : 0;
        const descriptionTooShort = isDescription && fieldLength > 0 && fieldLength < 20;
        const descriptionTooLong = isDescription && fieldLength > 160;
        const descriptionError = descriptionTooShort || descriptionTooLong;
        
        // Email validation for inline error display
        const emailError = isEmail && fieldValue && !validateEmail(fieldValue as string);
        
        // Website validation
        const websiteValidation = isWebsite ? validateWebsite(fieldValue as string) : { isValid: true };
        const websiteError = isWebsite && !websiteValidation.isValid && !!fieldValue;
        const websiteTooLong = isWebsite && fieldLength > 255;
        
        return (
          <TextField
            ref={firstInputRef}
            fullWidth
            autoFocus
            multiline={question.type === 'textarea'}
            rows={question.type === 'textarea' ? 4 : 1}
            type={isEmail ? 'email' : 'text'}
            placeholder={question.placeholder}
            value={fieldValue}
            onChange={(e) => {
              // For description, enforce 160 character limit
              if (isDescription && e.target.value.length > 160) {
                return;
              }
              // For website, enforce 255 character limit
              if (isWebsite && e.target.value.length > 255) {
                return;
              }
              updateFormData({ [question.field!]: e.target.value });
              // Clear existing errors when user starts typing
              if (errors[question.field!]) {
                setErrors(prev => {
                  const newErrors = { ...prev };
                  delete newErrors[question.field!];
                  return newErrors;
                });
              }
            }}
            error={!!errors[question.field!] || descriptionError || websiteError || websiteTooLong || emailError}
            helperText={
              errors[question.field!] || 
              (descriptionTooShort ? `${fieldLength}/160 characters - Description must be at least 20 characters` :
               descriptionTooLong ? `${fieldLength}/160 characters - Maximum 160 characters` :
               isDescription ? `${fieldLength}/160 characters` :
               websiteTooLong ? `${fieldLength}/255 characters - Maximum 255 characters` :
               websiteError ? websiteValidation.error :
               emailError ? 'Please enter a valid email address' :
               isWebsite && fieldValue ? `${fieldLength}/255 characters - Valid website URL` :
               isWebsite ? `${fieldLength}/255 characters` :
               isEmail && fieldValue ? 'Valid email address' : '')
            }
            inputProps={{
              maxLength: isDescription ? 160 : (isWebsite ? 255 : undefined),
              enterKeyHint: "next"
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                fontSize: '1.1rem',
                borderRadius: 1, // Use consistent 8px radius
                '& fieldset': {
                  borderRadius: 1, // Ensure fieldset matches
                  borderWidth: 1
                },
                '&:hover fieldset': {
                  borderWidth: 1
                },
                '&.Mui-focused fieldset': {
                  borderWidth: 2
                }
              }
            }}
          />
        );

      case 'select':
        const selectedValue = formData[question.field! as keyof BusinessFormData] || null;
        
        return (
          <FormControl fullWidth error={!!errors[question.field!]}>
            <Autocomplete
              options={question.options || []}
              value={selectedValue}
              onChange={(event, newValue) => {
                updateFormData({ 
                  [question.field!]: newValue || '' 
                });
              }}
              filterOptions={(options, params) => {
                const filtered = options.filter(option =>
                  option.toLowerCase().includes(params.inputValue.toLowerCase())
                );
                // Limit the number of options shown for better performance
                return filtered.slice(0, 50);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  autoFocus
                  placeholder="Search to see more categories..."
                  inputProps={{
                    ...params.inputProps,
                    enterKeyHint: "next"
                  }}
                  sx={{
                    '& .MuiInputBase-root': {
                      fontSize: '1.1rem',
                      borderRadius: 1, // Use consistent 8px radius
                      '& fieldset': {
                        borderRadius: 1
                      }
                    }
                  }}
                />
              )}
              noOptionsText="No categories found"
              sx={{
                '& .MuiAutocomplete-listbox': {
                  maxHeight: '300px'
                }
              }}
            />
            {errors[question.field!] && (
              <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                {errors[question.field!]}
              </Typography>
            )}
          </FormControl>
        );

      case 'multi_select':
        const selectedCategories = (formData[question.field! as keyof BusinessFormData] as string[]) || [];
        
        return (
          <FormControl fullWidth error={!!errors[question.field!]}>
            <Autocomplete
              multiple
              options={question.options || []}
              value={selectedCategories}
              onChange={(event, newValue) => {
                updateFormData({ 
                  [question.field!]: newValue 
                });
              }}
              disableCloseOnSelect
              limitTags={3}
              filterOptions={(options, params) => {
                const filtered = options.filter(option =>
                  option.toLowerCase().includes(params.inputValue.toLowerCase())
                );
                // Limit the number of options shown for better performance
                return filtered.slice(0, 50);
              }}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => {
                  const { key, ...tagProps } = getTagProps({ index });
                  return (
                    <Chip
                      key={key}
                      variant="outlined"
                      label={option}
                      size="small"
                      {...tagProps}
                      sx={{ height: '24px' }}
                    />
                  );
                })
              }
              renderOption={(props, option, { selected }) => {
                const { key, ...otherProps } = props;
                return (
                  <li key={key} {...otherProps}>
                    <Checkbox
                      icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                      checkedIcon={<CheckBoxIcon fontSize="small" />}
                      style={{ marginRight: 8 }}
                      checked={selected}
                    />
                    {option}
                  </li>
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Categories *"
                  autoFocus
                  placeholder={selectedCategories.length === 0 ? "Search and select categories..." : ""}
                  variant="outlined"
                  inputRef={question.id === questions[currentStep].id ? firstInputRef : undefined}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontSize: '1.1rem',
                      borderRadius: 1, // Use consistent 8px radius
                      '& fieldset': {
                        borderRadius: 1
                      }
                    }
                  }}
                />
              )}
              ListboxProps={{
                style: {
                  maxHeight: 300,
                }
              }}
              sx={{
                '& .MuiAutocomplete-tag': {
                  maxWidth: '150px',
                },
                '& .MuiAutocomplete-listbox': {
                  '& .MuiAutocomplete-option': {
                    '&[aria-selected="true"]': {
                      backgroundColor: 'primary.light',
                    }
                  }
                }
              }}
            />
            <FormHelperText>
              {selectedCategories.length > 0 
                ? `${selectedCategories.length} categories selected` 
                : 'Select all categories that apply to your business'}
            </FormHelperText>
            {errors[question.field!] && (
              <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                {errors[question.field!]}
              </Typography>
            )}
          </FormControl>
        );

      case 'contact':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                Phone Number
              </Typography>
              <PhoneInput
                ref={firstInputRef}
                fullWidth
                autoFocus
                value={formData.phone || ''}
                onChange={(formatted, normalized, isValid) => {
                  updateFormData({ phone: formatted });
                  // Clear error if phone becomes valid
                  if (isValid && errors.contact) {
                    setErrors({});
                  }
                }}
                required
                validateOnBlur
                clearable
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontSize: '1.1rem',
                    borderRadius: 1,
                    '& fieldset': {
                      borderRadius: 1
                    }
                  }
                }}
              />
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                Public Email Address
              </Typography>
              <TextField
                fullWidth
                type="email"
                value={formData.email || ''}
                onChange={(e) => updateFormData({ email: e.target.value })}
                placeholder="contact@yourbusiness.com"
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontSize: '1.1rem',
                    borderRadius: 1,
                    '& fieldset': {
                      borderRadius: 1
                    }
                  }
                }}
              />
            </Box>
            {errors.contact && (
              <Typography variant="body2" color="error" sx={{ mt: 1, textAlign: 'left' }}>
                {errors.contact}
              </Typography>
            )}
          </Box>
        );

      case 'address':
        // Physical address is always complete when all fields are filled
        const hasCompletePhysicalAddress = Boolean(
          formData.address && 
          formData.city && 
          formData.state && 
          formData.zip &&
          formData.address.trim().length > 0 &&
          formData.city.trim().length > 0 &&
          formData.zip.trim().length >= 5
        );
        
        // Service area is complete when both fields are filled
        const hasCompleteServiceArea = Boolean(
          formData.serviceZip && 
          formData.serviceRadius &&
          formData.serviceZip.trim().length >= 5 &&
          formData.serviceRadius > 0
        );
        
        const fullDisplayAddress = [
          formData.address,
          formData.city,
          formData.state,
          formData.zip
        ].filter(Boolean).join(', ');

        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 1 }}>
              We need your business location for your profile. This helps establish trust with customers.
            </Typography>

            {/* Physical Address Section (Always Required) */}
            <Box sx={{ width: '100%', maxWidth: '500px' }}>
              <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
                Business Address
              </Typography>
              
              {(hasCompletePhysicalAddress && !isEditingAddress) ? (
                <Box sx={{ 
                  width: '100%', 
                  p: 3, 
                  border: '2px solid', 
                  borderColor: 'primary.main',
                  borderRadius: 2,
                  bgcolor: 'primary.light',
                  color: 'primary.contrastText',
                  textAlign: 'center',
                  mb: 3
                }}>
                  <LocationOnIcon sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h6" gutterBottom>
                    Address Confirmed
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {fullDisplayAddress}
                  </Typography>
                  {formData.latitude && formData.longitude && (
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      ✓ Coordinates verified
                    </Typography>
                  )}
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      setIsEditingAddress(true);
                    }}
                    sx={{ 
                      mt: 2,
                      color: 'primary.contrastText',
                      borderColor: 'primary.contrastText',
                      '&:hover': {
                        borderColor: 'primary.contrastText',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)'
                      }
                    }}
                  >
                    Edit Address
                  </Button>
                </Box>
              ) : (
                <>
                  <AddressAutocomplete
                    value={formData.address ? `${formData.address}, ${formData.city || ''}, ${formData.state || ''} ${formData.zip || ''}`.trim() : ''}
                    onChange={(address, validated, coordinates) => {
                      console.log('[AddressAutocomplete] Address changed:', { address, validated, coordinates });
                      // If we get coordinates, store them
                      if (coordinates) {
                        updateFormData({
                          latitude: coordinates.lat,
                          longitude: coordinates.lng
                        });
                      }
                    }}
                W    onComponentsChange={(components) => {
                      console.log('[AddressAutocomplete] Components received:', components);
                      // Update form with individual address components
                      updateFormData({
                        address: components.street || formData.address,
                        city: components.city || formData.city,
                        state: components.state || formData.state,
                        zip: components.zip || formData.zip
                      });
                    }}
                    label="Business Address"
                    required
                    fullWidth
                  />
                  
                  {/* Show current address values for debugging */}
                  {(formData.address || formData.city || formData.state || formData.zip) && (
                    <Box sx={{
                      mt: 2,
                      p: 2,
                      bgcolor: (theme) => theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50',
                      borderRadius: 2
                    }}>
                      <Typography variant="body2" color="text.secondary">
                        Current address components:
                      </Typography>
                      <Typography variant="body2" color="text.primary">
                        Street: {formData.address || '(empty)'}<br/>
                        City: {formData.city || '(empty)'}<br/>
                        State: {formData.state || '(empty)'}<br/>
                        ZIP: {formData.zip || '(empty)'}
                        {formData.latitude && formData.longitude && (
                          <><br/>Coordinates: {formData.latitude}, {formData.longitude}</>
                        )}
                      </Typography>
                    </Box>
                  )}
                  
                  {/* Hidden fields to maintain form data */}
                  <input type="hidden" value={formData.address || ''} />
                  <input type="hidden" value={formData.city || ''} />
                  <input type="hidden" value={formData.state || ''} />
                  <input type="hidden" value={formData.zip || ''} />
                  {isEditingAddress && hasCompletePhysicalAddress && (
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => {
                        setIsEditingAddress(false);
                      }}
                      sx={{ mt: 2 }}
                    >
                      Save Address
                    </Button>
                  )}
                </>
              )}
            </Box>
            
            {/* Checkbox for "customers do not visit" */}
            {hasCompletePhysicalAddress && !isEditingAddress && (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={customersDoNotVisit}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setCustomersDoNotVisit(checked);
                      updateFormData({ customersDoNotVisit: checked });
                      // Clear service area if unchecking
                      if (!checked) {
                        updateFormData({ serviceZip: '', serviceRadius: undefined });
                      }
                    }}
                  />
                }
                label="Customers do not visit this location (service-based business)"
                sx={{ mb: 2 }}
              />
            )}
            
            {/* Service Area Section (Required when checkbox is checked) */}
            {customersDoNotVisit && (
              <Box sx={{ width: '100%', maxWidth: '500px' }}>
                <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
                  Service Area (Required)
                </Typography>
                {(hasCompleteServiceArea && !isEditingServiceArea) ? (
                  <Box sx={{ 
                    width: '100%', 
                    p: 3, 
                    border: '2px solid', 
                    borderColor: 'success.main',
                    borderRadius: 2,
                    bgcolor: 'success.light',
                    color: 'success.contrastText',
                    textAlign: 'center'
                  }}>
                    <RoomServiceIcon sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h6" gutterBottom>
                      Service Area Confirmed
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {formData.serviceRadius} mile radius from {formData.serviceZip}
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        setIsEditingServiceArea(true);
                      }}
                      sx={{ 
                        color: 'success.contrastText',
                        borderColor: 'success.contrastText',
                        '&:hover': {
                          borderColor: 'success.contrastText',
                          backgroundColor: 'rgba(255, 255, 255, 0.1)'
                        }
                      }}
                    >
                      Edit Service Area
                    </Button>
                  </Box>
                ) : (
                  <>
                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                      <TextField
                        placeholder="Service ZIP Code"
                        value={formData.serviceZip || ''}
                        onChange={(e) => {
                          // Only allow numeric input and limit to 5 digits
                          const value = e.target.value.replace(/\D/g, '').slice(0, 5);
                          updateFormData({ serviceZip: value });
                        }}
                        inputProps={{ 
                          maxLength: 5,
                          pattern: '[0-9]*',
                          inputMode: 'numeric'
                        }}
                        sx={{
                          flex: 1,
                          '& .MuiOutlinedInput-root': {
                            fontSize: '1.1rem',
                            borderRadius: 1, // Use consistent 8px radius
                            '& fieldset': {
                              borderRadius: 1
                            }
                          }
                        }}
                      />
                      <FormControl sx={{ flex: 1 }}>
                        <InputLabel id="radius-select-label">Radius</InputLabel>
                        <Select
                          labelId="radius-select-label"
                          id="radius-select"
                          value={formData.serviceRadius ? formData.serviceRadius.toString() : ''}
                          label="Radius"
                          onChange={(e: SelectChangeEvent<string>) => {
                            const radius = parseInt(e.target.value);
                            updateFormData({ serviceRadius: radius });
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              fontSize: '1.1rem',
                              borderRadius: 1, // Use consistent 8px radius
                              '& fieldset': {
                                borderRadius: 1
                              }
                            }
                          }}
                        >
                          <MenuItem value={5}>5 miles</MenuItem>
                          <MenuItem value={10}>10 miles</MenuItem>
                          <MenuItem value={15}>15 miles</MenuItem>
                          <MenuItem value={20}>20 miles</MenuItem>
                          <MenuItem value={25}>25 miles</MenuItem>
                          <MenuItem value={30}>30 miles</MenuItem>
                          <MenuItem value={50}>50 miles</MenuItem>
                          <MenuItem value={75}>75 miles</MenuItem>
                          <MenuItem value={100}>100 miles</MenuItem>
                          <MenuItem value={150}>150 miles</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                      Tell us where you provide services so customers in that area can find you
                    </Typography>
                    {isEditingServiceArea && hasCompleteServiceArea && (
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={() => {
                          setIsEditingServiceArea(false);
                        }}
                        sx={{ mt: 2 }}
                      >
                        Save Service Area
                      </Button>
                    )}
                  </>
                )}
              </Box>
            )}
          </Box>
        );

      case 'logo':
        const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
          const file = event.target.files?.[0];
          if (file) {
            // Check for AVIF format early
            if (file.type === 'image/avif' || file.name.toLowerCase().endsWith('.avif')) {
              setErrors({ logo: 'AVIF format is not supported. If you\'re unable to upload image you can use https://picflow.com/image-converter to convert the image to JPG format' });
              return;
            }
            
            // Validate file type
            const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!validTypes.includes(file.type)) {
              setErrors({ logo: 'Please upload a valid image file (JPEG, PNG, GIF, or WebP). If you\'re unable to upload image you can use https://picflow.com/image-converter to convert the image to JPG format' });
              return;
            }
            
            // Validate file size (5MB max)
            const maxSize = 5 * 1024 * 1024;
            if (file.size > maxSize) {
              setErrors({ logo: 'Image size must be less than 5MB' });
              return;
            }
            
            // Clear any previous errors
            setErrors({});
            
            // Set the selected file and open the cropper
            setSelectedLogoFile(file);
            setCropperOpen(true);
          }
          // Reset the input value so the same file can be selected again
          event.target.value = '';
        };
        
        // Handle cropped image result
        const handleCropComplete = (croppedFile: File) => {
          updateFormData({ logoFile: croppedFile });
          setCropperOpen(false);
          setSelectedLogoFile(null);
        };
        
        // Handle cropper close
        const handleCropperClose = () => {
          setCropperOpen(false);
          setSelectedLogoFile(null);
        };
        
        // Generate preview URL for current logo
        let logoPreviewUrl: string | null = null;
        if (formData.logoFile && formData.logoFile instanceof File) {
          // For security, we'll create object URL instead of reading as data URL
          logoPreviewUrl = URL.createObjectURL(formData.logoFile);
        } else if (formData.existingLogoUrl) {
          // Use existing logo URL if no new file uploaded
          logoPreviewUrl = formData.existingLogoUrl;
        }
        
        return (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: 3,
            width: '100%'
          }}>
            {logoPreviewUrl ? (
              <Box sx={{ 
                position: 'relative',
                width: 200,
                height: 200,
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: 3
              }}>
                <img 
                  src={logoPreviewUrl} 
                  alt="Business logo preview" 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover' 
                  }}
                />
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => {
                    updateFormData({ logoFile: null });
                  }}
                  sx={{
                    position: 'absolute',
                    bottom: 8,
                    right: 8,
                    minWidth: 'auto',
                    px: 2
                  }}
                >
                  Remove
                </Button>
              </Box>
            ) : (
              <Box 
                sx={{ 
                  width: 200, 
                  height: 200, 
                  border: '2px dashed',
                  borderColor: 'grey.400',
                  borderRadius: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'grey.50'
                  }
                }}
                onClick={() => document.getElementById('logo-upload-input')?.click()}
              >
                <PhotoCamera sx={{ fontSize: 48, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  Click to upload logo
                </Typography>
              </Box>
            )}
            
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              style={{ display: 'none' }}
              id="logo-upload-input"
            />
            
            <label htmlFor="logo-upload-input" style={{ width: '100%', maxWidth: 300 }}>
              <Button
                variant="outlined"
                component="span"
                fullWidth
                startIcon={<PhotoCamera />}
                sx={{ py: 1.5 }}
              >
                {logoPreviewUrl ? 'Change Logo' : 'Choose Logo Image'}
              </Button>
            </label>
            
            {errors.logo && (
              <Typography variant="body2" color="error" sx={{ textAlign: 'center' }}>
                {errors.logo}
              </Typography>
            )}
            
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', maxWidth: 400 }}>
              Recommended: Square image, at least 500x500 pixels, less than 5MB
            </Typography>
            
            {/* Image Cropper Dialog */}
            <ImageCropper
              open={cropperOpen}
              onClose={handleCropperClose}
              onCrop={handleCropComplete}
              file={selectedLogoFile}
              title="Crop your business logo"
            />
          </Box>
        );

      case 'hours':
        const daysOfWeek = [
          { key: 'monday', label: 'Monday' },
          { key: 'tuesday', label: 'Tuesday' },
          { key: 'wednesday', label: 'Wednesday' },
          { key: 'thursday', label: 'Thursday' },
          { key: 'friday', label: 'Friday' },
          { key: 'saturday', label: 'Saturday' },
          { key: 'sunday', label: 'Sunday' }
        ];

        const businessHours = formData.businessHours || defaultBusinessHours;

        // Generate 15-minute interval time options
        const timeOptions = Array.from({ length: 24 * 4 }, (_, i) => {
          const hour = Math.floor(i / 4);
          const minute = (i % 4) * 15;
          const minuteStr = minute.toString().padStart(2, '0');
          const time24 = `${hour.toString().padStart(2, '0')}:${minuteStr}`;
          const time12 = hour === 0 ? `12:${minuteStr} AM` :
                        hour < 12 ? `${hour}:${minuteStr} AM` :
                        hour === 12 ? `12:${minuteStr} PM` :
                        `${hour - 12}:${minuteStr} PM`;
          return { value: time24, label: time12 };
        });

        const handleHoursChange = (day: string, field: 'open' | 'close' | 'closed', value: string | boolean) => {
          console.log('[TypeformWizard] 🔍 HOURS CHANGE: Day:', day, 'Field:', field, 'Value:', value);
          console.log('[TypeformWizard] 🔍 HOURS CHANGE: Current businessHours before update:', businessHours);
          console.log('[TypeformWizard] 🔍 HOURS CHANGE: Current formData.businessHours before update:', formData.businessHours);
          
          const updatedBusinessHours = {
            ...businessHours,
            [day]: {
              ...businessHours[day],
              [field]: value
            }
          };
          
          console.log('[TypeformWizard] 🔍 HOURS CHANGE: Updated business hours object:', updatedBusinessHours);
          console.log('[TypeformWizard] 🔍 HOURS CHANGE: Calling updateFormData with:', { businessHours: updatedBusinessHours });
          
          updateFormData({
            businessHours: updatedBusinessHours
          });
          
          // Verify the update after a short delay
          setTimeout(() => {
            console.log('[TypeformWizard] 🔍 HOURS CHANGE: formData.businessHours after update:', formData.businessHours);
          }, 100);
        };

        const applyMondayToAllDays = () => {
          const mondayHours = businessHours.monday || { open: '09:00', close: '17:00', closed: false };
          const updatedHours = { ...businessHours };
          
          // Apply Monday's hours to all other days
          daysOfWeek.forEach((day) => {
            if (day.key !== 'monday') {
              updatedHours[day.key] = { ...mondayHours };
            }
          });
          
          updateFormData({
            businessHours: updatedHours
          });
        };

        return (
          <Box sx={{ width: '100%', maxWidth: '600px', px: { xs: 1, sm: 2 } }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center', fontSize: { xs: '0.875rem', sm: '1rem' } }}>
              Set your operating hours so customers know when you're available
            </Typography>

            {daysOfWeek.map((day, index) => {
              const dayHours = businessHours[day.key] || { open: '09:00', close: '17:00', closed: false };

              return (
                <React.Fragment key={day.key}>
                  <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'stretch', sm: 'center' },
                    justifyContent: { xs: 'flex-start', sm: 'space-between' },
                    mb: 2,
                    px: { xs: 1.5, sm: 3 },
                    py: { xs: 1.5, sm: 2 },
                    border: '1px solid',
                    borderColor: 'grey.300',
                    borderRadius: 2,
                    bgcolor: dayHours.closed ? 'action.hover' : 'background.paper',
                    minHeight: { xs: 'auto', sm: 60 },
                    width: '100%',
                    boxSizing: 'border-box',
                    gap: { xs: 1, sm: 0 }
                  }}>
                    <Typography
                      variant="body1"
                      sx={{
                        minWidth: { xs: 'auto', sm: 100 },
                        fontWeight: 500,
                        flexShrink: 0,
                        mb: { xs: 0.5, sm: 0 },
                        fontSize: { xs: '0.9rem', sm: '1rem' }
                      }}
                    >
                      {day.label}
                    </Typography>

                    <Box sx={{
                      display: 'flex',
                      flexDirection: { xs: 'row', sm: 'row' },
                      alignItems: 'center',
                      gap: { xs: 1, sm: 2 },
                      flex: 1,
                      justifyContent: { xs: 'flex-start', sm: 'center' },
                      flexWrap: { xs: 'wrap', sm: 'nowrap' }
                    }}>
                      {!dayHours.closed ? (
                        <>
                          <Select
                            value={dayHours.open}
                            onChange={(e) => handleHoursChange(day.key, 'open', e.target.value)}
                            size="small"
                            sx={{
                              minWidth: { xs: 90, sm: 120 },
                              flex: { xs: '1 1 auto', sm: '0 0 auto' }
                            }}
                          >
                            {timeOptions.map(option => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </Select>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                            to
                          </Typography>
                          <Select
                            value={dayHours.close}
                            onChange={(e) => handleHoursChange(day.key, 'close', e.target.value)}
                            size="small"
                            sx={{
                              minWidth: { xs: 90, sm: 120 },
                              flex: { xs: '1 1 auto', sm: '0 0 auto' }
                            }}
                          >
                            {timeOptions.map(option => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                          Closed
                        </Typography>
                      )}
                    </Box>

                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleHoursChange(day.key, 'closed', !dayHours.closed)}
                      sx={{
                        minWidth: { xs: 70, sm: 80 },
                        fontSize: { xs: '0.7rem', sm: '0.75rem' },
                        borderColor: dayHours.closed ? 'success.main' : 'grey.400',
                        color: dayHours.closed ? 'success.main' : 'text.secondary',
                        flexShrink: 0,
                        py: { xs: 0.5, sm: 0.75 },
                        alignSelf: { xs: 'flex-end', sm: 'center' }
                      }}
                    >
                      {dayHours.closed ? 'Open' : 'Closed'}
                    </Button>
                  </Box>
                  
                  {/* Add "Apply to all days" button after Monday */}
                  {day.key === 'monday' && (
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      mb: 3,
                      mt: 1
                    }}>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={applyMondayToAllDays}
                        sx={{
                          bgcolor: 'primary.main',
                          color: 'primary.contrastText',
                          fontSize: '0.75rem',
                          px: 3,
                          py: 1,
                          '&:hover': {
                            bgcolor: 'primary.dark',
                          }
                        }}
                      >
                        Apply Monday's hours to all days
                      </Button>
                    </Box>
                  )}
                </React.Fragment>
              );
            })}
          </Box>
        );

      case 'social_media':
        const socialPlatforms = [
          {
            key: 'instagramUrl',
            label: 'Instagram',
            icon: <InstagramIcon sx={{ fontSize: 24 }} />,
            placeholder: 'https://instagram.com/yourbusiness',
            color: '#E4405F',
            example: 'https://instagram.com/yourbusiness',
          },
          {
            key: 'facebookUrl',
            label: 'Facebook',
            icon: <FacebookIcon sx={{ fontSize: 24 }} />,
            placeholder: 'https://facebook.com/yourbusiness',
            color: '#1877F2',
            example: 'https://facebook.com/yourbusiness',
          },
          {
            key: 'tiktokUrl',
            label: 'TikTok',
            icon: (
              <Box component="span" sx={{ fontWeight: 900, fontSize: '24px', lineHeight: 1 }}>
                T
              </Box>
            ),
            placeholder: 'https://tiktok.com/@yourbusiness',
            color: '#000000',
            example: 'https://tiktok.com/@yourbusiness',
          },
          {
            key: 'linkedinUrl',
            label: 'LinkedIn',
            icon: <LinkedInIcon sx={{ fontSize: 24 }} />,
            placeholder: 'https://linkedin.com/company/yourbusiness',
            color: '#0A66C2',
            example: 'https://linkedin.com/company/yourbusiness',
          },
          {
            key: 'twitterUrl',
            label: 'X (Twitter)',
            icon: <TwitterIcon sx={{ fontSize: 24 }} />,
            placeholder: 'https://x.com/yourbusiness',
            color: '#000000',
            example: 'https://x.com/yourbusiness',
          },
          {
            key: 'pinterestUrl',
            label: 'Pinterest',
            icon: <PinterestIcon sx={{ fontSize: 24 }} />,
            placeholder: 'https://pinterest.com/yourbusiness',
            color: '#E60023',
            example: 'https://pinterest.com/yourbusiness',
          },
        ];
        
        // Count connected platforms
        const connectedPlatforms = socialPlatforms.filter(
          platform => formData[platform.key as keyof BusinessFormData]
        ).length;

        return (
          <Box sx={{ width: '100%', maxWidth: '600px', px: 2 }}>
            {/* Header with connection count */}
            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Connect your social media accounts to increase your online visibility
              </Typography>
              <Chip 
                label={`${connectedPlatforms} of ${socialPlatforms.length} connected`}
                color={connectedPlatforms >= 3 ? 'success' : 'default'}
                size="small"
              />
            </Box>
            
            {/* Alert with tips */}
            <Alert 
              severity="info" 
              sx={{ mb: 3 }}
              icon={<LanguageIcon />}
            >
              <Typography variant="body2">
                <strong>Tip:</strong> All URLs should start with https:// for security. 
                This step is optional but helps customers find you online.
              </Typography>
            </Alert>
            
            {socialPlatforms.map((platform) => {
              const value = formData[platform.key as keyof BusinessFormData] as string || '';
              const hasError = socialFieldErrors[platform.key];
              const helper = socialFieldHelpers[platform.key];
              
              return (
                <Box key={platform.key} sx={{ mb: 3 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2,
                    mb: 1
                  }}>
                    <Box sx={{ 
                      color: hasError ? 'error.main' : platform.color,
                      display: 'flex',
                      alignItems: 'center',
                      minWidth: 32,
                      flexShrink: 0
                    }}>
                      {platform.key === 'tiktokUrl' ? (
                        platform.icon
                      ) : (
                        React.cloneElement(platform.icon as React.ReactElement, {
                          sx: { fontSize: 24 }
                        })
                      )}
                    </Box>
                    
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        fontWeight: 600,
                        minWidth: '100px',
                        flexShrink: 0,
                        color: hasError ? 'error.main' : 'text.primary'
                      }}
                    >
                      {platform.label}
                    </Typography>
                    
                    {value && !hasError && (
                      <CheckIcon sx={{ color: 'success.main', fontSize: 20 }} />
                    )}
                  </Box>
                  
                  <TextField
                    fullWidth
                    value={value}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      // Enforce 200 character limit for social media URLs
                      if (newValue.length > 200) {
                        return;
                      }
                      updateFormData({ [platform.key]: newValue });
                      // Validate as user types
                      validateSocialUrl(platform.key, newValue);
                    }}
                    onBlur={(e) => {
                      // Final validation on blur
                      validateSocialUrl(platform.key, e.target.value);
                    }}
                    placeholder={platform.placeholder}
                    variant="outlined"
                    size="small"
                    error={!!hasError}
                    helperText={
                      hasError || helper || (value ? `${value.length}/200` : `Example: ${platform.example}`)
                    }
                    inputProps={{
                      maxLength: 200
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontSize: '1rem',
                        backgroundColor: value && !hasError ? `${platform.color}08` : 'transparent',
                      },
                      '& .MuiFormHelperText-root': {
                        fontSize: '0.75rem',
                        mt: 0.5
                      }
                    }}
                    InputProps={{
                      sx: {
                        '&.Mui-error': {
                          backgroundColor: 'error.lighter',
                        }
                      }
                    }}
                  />
                </Box>
              );
            })}
            
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                You can always add or update these links later in your dashboard
              </Typography>
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  // Show success screen for location creation
  if (showLocationSuccess && isLocationMode) {
    return (
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: 'background.default',
          p: 3,
        }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Box sx={{ textAlign: 'center', maxWidth: '600px' }}>
            {/* Success Icon */}
            <Box
              sx={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                bgcolor: 'success.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 4,
              }}
            >
              <CheckCircleIcon sx={{ fontSize: 60, color: 'white' }} />
            </Box>
            
            {/* Success Message */}
            <Typography variant="h3" sx={{ mb: 2, fontWeight: 700 }}>
              Great! 🎉
            </Typography>
            <Typography variant="h5" sx={{ mb: 4, color: 'text.secondary' }}>
              Your location has been added successfully!
            </Typography>
            
            {/* Enhancement Suggestions */}
            <Box sx={{ 
              bgcolor: 'background.paper',
              borderRadius: 2,
              p: 3,
              mb: 4,
              border: '1px solid',
              borderColor: 'divider',
              textAlign: 'left'
            }}>
              <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
                Enhance Your Profile
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary' }}>
                Make your location stand out by adding:
              </Typography>
              <Box component="ul" sx={{ pl: 2, color: 'text.secondary' }}>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  📸 Photos of your business and products
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  📱 Social media links to connect with customers
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  📋 Menu or services list with pricing
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  ⭐ Special offers and promotions
                </Typography>
                <Typography component="li" variant="body2">
                  🕐 Detailed business hours and holiday schedules
                </Typography>
              </Box>
            </Box>
            
            {/* Action Button */}
            <Button
              variant="contained"
              size="large"
              onClick={() => {
                if (onSuccess) {
                  onSuccess();
                }
              }}
              sx={{
                px: 6,
                py: 2,
                fontSize: '1.1rem',
                textTransform: 'none',
                borderRadius: 2,
              }}
              endIcon={<ArrowForwardIcon />}
            >
              Continue to Profile
            </Button>
          </Box>
        </motion.div>
      </Box>
    );
  }
  
  return (
    <TypeformContainer
      currentQuestion={currentStep}
      totalQuestions={questions.length}
      onClose={isLocationMode ? onCancel : (isOnboardingComplete ? () => navigate('/business/dashboard') : undefined)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          style={{ width: '100%', maxWidth: '800px' }}
        >
          <TypeformQuestion
            question={currentQuestion.question}
            description={currentQuestion.description}
            onContinue={handleNext}
            onBack={currentStep > 0 ? handleBack : undefined}
            onSkip={currentQuestion.skippable ? handleSkip : undefined}
            continueLabel={
              currentStep === 0 ? "Let's do this!" :
              currentStep === questions.length - 1 ? "Complete Setup" :
              "Next"
            }
            isValid={isValid && !isLoading}
            showBackButton={currentStep > 0}
            showSkip={currentQuestion.skippable === true}
            error={Object.values(errors)[0]}
            isRequiredForPublishing={
              ['business_name', 'business_description', 'business_logo', 'business_category', 'contact_info', 'location'].includes(currentQuestion.id)
            }
          >
            {renderQuestionContent()}
          </TypeformQuestion>
        </motion.div>
      </AnimatePresence>
      
      {/* Address Modal */}
      <AddressModal
        open={showAddressModal}
        onClose={handleCloseAddressModal}
        onSave={handleSaveAddress}
        initialAddressData={getCurrentAddressData()}
      />
    </TypeformContainer>
  );
};

export default InitialBusinessOnboardingWizard;