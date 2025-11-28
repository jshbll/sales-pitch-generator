# Business Profile Schema Documentation

## Overview

This directory contains the modular components of the business profile schema, refactored from the original monolithic `businessProfile.schema.ts` file. The refactoring improves maintainability, reduces file size, and makes the code more modular while preserving backward compatibility.

## Directory Structure

```
src/schemas/
├── business/                           # Business schema directory
│   ├── index.ts                        # Barrel exports for all business schemas
│   ├── businessCommon.schema.ts        # Common schema patterns and utilities
│   ├── businessCore.schema.ts          # Core business information schema
│   ├── businessHours.schema.ts         # Business hours schema
│   ├── businessContact.schema.ts       # Contact information schema
│   ├── businessSocial.schema.ts        # Social media schema
│   ├── businessLocation.schema.ts      # Location information schema
│   ├── businessClassification.schema.ts # Classification schema
│   ├── businessImage.schema.ts         # Image URLs schema
│   ├── businessValidation.utils.ts     # Validation utilities
│   ├── businessTransformation.utils.ts # Transformation utilities
│   ├── businessError.utils.ts          # Error handling utilities
│   └── businessTest.utils.ts           # Testing utilities
├── businessProfile.schema.ts           # Main schema (imports and composes)
└── tests/                              # Test directory
    └── businessProfile.test.ts         # Tests for backward compatibility
```

## Usage

### Importing the Main Schema

For backward compatibility, continue to import from the main schema file:

```typescript
import { 
  businessProfileSchema, 
  BusinessProfileValidated,
  validateBusinessProfile,
  validateBusinessProfileUpdate,
  validateAndTransformBusinessProfile
} from '../schemas/businessProfile.schema';
```

### Importing Individual Schema Components

For more granular control, you can import individual schema components:

```typescript
import {
  businessCoreSchema,
  businessHoursSchema,
  businessContactSchema,
  // ... other schemas
  validateWithZod,
  transformBusinessProfileData
} from '../schemas/business';
```

## Schema Components

### Core Schema (`businessCore.schema.ts`)

Contains the core business information such as ID, name, and timestamps.

```typescript
const business = {
  id: 'business-123',
  business_name: 'Example Business',
  description: 'An example business'
};
```

### Hours Schema (`businessHours.schema.ts`)

Contains the business hours information.

```typescript
const hours = {
  monday: { open: '09:00', close: '17:00', closed: false },
  tuesday: { open: '09:00', close: '17:00', closed: false }
};
```

### Contact Schema (`businessContact.schema.ts`)

Contains contact information such as email, phone, and website.

```typescript
const contact = {
  email: 'contact@example.com',
  phone: '555-123-4567',
  website: 'https://example.com'
};
```

### Social Schema (`businessSocial.schema.ts`)

Contains social media links.

```typescript
const social = {
  instagramUrl: 'https://instagram.com/example',
  linkedinUrl: 'https://linkedin.com/company/example'
};
```

### Location Schema (`businessLocation.schema.ts`)

Contains location information such as address and coordinates.

```typescript
const location = {
  address: '123 Example St',
  city: 'Example City',
  state: 'EX',
  zip: '12345',
  latitude: 37.7749,
  longitude: -122.4194
};
```

### Classification Schema (`businessClassification.schema.ts`)

Contains business classification information.

```typescript
const classification = {
  category: 'Example Category',
  subcategory: 'Example Subcategory',
  industry: 'Example Industry',
  founded: '2020',
  employees: '1-10'
};
```

### Image Schema (`businessImage.schema.ts`)

Contains image URLs.

```typescript
const images = {
  logo_url: 'https://example.com/logo.png',
  banner_url: 'https://example.com/banner.png'
};
```

## Utility Functions

### Validation Utilities (`businessValidation.utils.ts`)

Generic validation functions for Zod schemas.

```typescript
import { validateWithZod } from '../schemas/business';

const result = validateWithZod(mySchema, data, 'functionName');
```

### Transformation Utilities (`businessTransformation.utils.ts`)

Functions for transforming business profile data.

```typescript
import { transformBusinessProfileData } from '../schemas/business';

const transformed = transformBusinessProfileData(rawData);
```

### Error Utilities (`businessError.utils.ts`)

Functions for handling validation errors.

```typescript
import { formatZodError } from '../schemas/business';

const formattedErrors = formatZodError(zodError);
```

## Backward Compatibility

The refactored schema maintains backward compatibility with existing code. The main `businessProfile.schema.ts` file exports the same functions and types as before:

- `businessProfileSchema`: The main schema object
- `BusinessProfileValidated`: The type derived from the schema
- `BusinessProfileUpdate`: The type for partial updates
- `validateBusinessProfile`: Function to validate a business profile
- `validateBusinessProfileUpdate`: Function to validate a partial update
- `validateAndTransformBusinessProfile`: Function to validate and transform a profile
- `transformBusinessProfileData`: Function to transform raw data

## Testing

Tests are provided in the `tests/businessProfile.test.ts` file to verify backward compatibility and functionality of the refactored schema.

To run the tests:

```bash
npm test -- src/schemas/tests/businessProfile.test.ts
```
