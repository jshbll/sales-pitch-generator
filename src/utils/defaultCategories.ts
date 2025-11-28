import { BusinessCategory } from '../types';

/**
 * Default business categories to use as fallback when API fails
 * Structure maintains parent-child relationship for main categories and subcategories
 */
export const DEFAULT_BUSINESS_CATEGORIES: BusinessCategory[] = [
  {
    id: '1',
    name: 'Food & Dining',
    parent_id: null,
    subcategories: [
      { id: '1-1', name: 'Restaurants', parent_id: '1', subcategories: [] },
      { id: '1-2', name: 'Cafes & Bakeries', parent_id: '1', subcategories: [] },
      { id: '1-3', name: 'Bars & Pubs', parent_id: '1', subcategories: [] },
      { id: '1-4', name: 'Food Delivery', parent_id: '1', subcategories: [] }
    ]
  },
  {
    id: '2',
    name: 'Retail & Shopping',
    parent_id: null,
    subcategories: [
      { id: '2-1', name: 'Clothing & Apparel', parent_id: '2', subcategories: [] },
      { id: '2-2', name: 'Electronics', parent_id: '2', subcategories: [] },
      { id: '2-3', name: 'Home Goods', parent_id: '2', subcategories: [] },
      { id: '2-4', name: 'Specialty Shops', parent_id: '2', subcategories: [] }
    ]
  },
  {
    id: '3',
    name: 'Health & Wellness',
    parent_id: null,
    subcategories: [
      { id: '3-1', name: 'Fitness & Gyms', parent_id: '3', subcategories: [] },
      { id: '3-2', name: 'Spas & Salons', parent_id: '3', subcategories: [] },
      { id: '3-3', name: 'Medical Services', parent_id: '3', subcategories: [] },
      { id: '3-4', name: 'Wellness Centers', parent_id: '3', subcategories: [] }
    ]
  },
  {
    id: '4',
    name: 'Professional Services',
    parent_id: null,
    subcategories: [
      { id: '4-1', name: 'Financial Services', parent_id: '4', subcategories: [] },
      { id: '4-2', name: 'Legal Services', parent_id: '4', subcategories: [] },
      { id: '4-3', name: 'Real Estate', parent_id: '4', subcategories: [] },
      { id: '4-4', name: 'Consulting', parent_id: '4', subcategories: [] }
    ]
  },
  {
    id: '5',
    name: 'Home Services',
    parent_id: null,
    subcategories: [
      { id: '5-1', name: 'Cleaning', parent_id: '5', subcategories: [] },
      { id: '5-2', name: 'Repairs & Maintenance', parent_id: '5', subcategories: [] },
      { id: '5-3', name: 'Landscaping', parent_id: '5', subcategories: [] },
      { id: '5-4', name: 'Interior Design', parent_id: '5', subcategories: [] }
    ]
  },
  {
    id: '6',
    name: 'Entertainment & Recreation',
    parent_id: null,
    subcategories: [
      { id: '6-1', name: 'Events & Venues', parent_id: '6', subcategories: [] },
      { id: '6-2', name: 'Arts & Culture', parent_id: '6', subcategories: [] },
      { id: '6-3', name: 'Sports & Recreation', parent_id: '6', subcategories: [] },
      { id: '6-4', name: 'Nightlife', parent_id: '6', subcategories: [] }
    ]
  },
  {
    id: '7',
    name: 'Education & Learning',
    parent_id: null,
    subcategories: [
      { id: '7-1', name: 'Schools & Institutions', parent_id: '7', subcategories: [] },
      { id: '7-2', name: 'Tutoring & Lessons', parent_id: '7', subcategories: [] },
      { id: '7-3', name: 'Training & Workshops', parent_id: '7', subcategories: [] },
      { id: '7-4', name: 'Online Learning', parent_id: '7', subcategories: [] }
    ]
  },
  {
    id: '8',
    name: 'Technology',
    parent_id: null,
    subcategories: [
      { id: '8-1', name: 'Software Development', parent_id: '8', subcategories: [] },
      { id: '8-2', name: 'IT Services', parent_id: '8', subcategories: [] },
      { id: '8-3', name: 'Tech Repair', parent_id: '8', subcategories: [] },
      { id: '8-4', name: 'Digital Marketing', parent_id: '8', subcategories: [] }
    ]
  },
  {
    id: '9',
    name: 'Automotive',
    parent_id: null,
    subcategories: [
      { id: '9-1', name: 'Auto Repair', parent_id: '9', subcategories: [] },
      { id: '9-2', name: 'Car Dealerships', parent_id: '9', subcategories: [] },
      { id: '9-3', name: 'Car Wash & Detailing', parent_id: '9', subcategories: [] },
      { id: '9-4', name: 'Auto Parts & Accessories', parent_id: '9', subcategories: [] }
    ]
  },
  {
    id: '10',
    name: 'Travel & Transportation',
    parent_id: null,
    subcategories: [
      { id: '10-1', name: 'Hotels & Lodging', parent_id: '10', subcategories: [] },
      { id: '10-2', name: 'Transportation Services', parent_id: '10', subcategories: [] },
      { id: '10-3', name: 'Travel Agencies', parent_id: '10', subcategories: [] },
      { id: '10-4', name: 'Tourism', parent_id: '10', subcategories: [] }
    ]
  },
  {
    id: '99',
    name: 'Other',
    parent_id: null,
    subcategories: []
  }
];
