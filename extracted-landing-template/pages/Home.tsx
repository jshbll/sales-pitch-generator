import React from 'react';
import { BusinessLandingPage } from './BusinessLandingPage';

const Home: React.FC = () => {
  // REMOVED: Old checkout redirect logic - now using returnUrl in SubscriptionRequiredModal
  // This was causing redirect loops after checkout completion

  return <BusinessLandingPage />;
};

export default Home;