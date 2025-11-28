import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { 
  Box, 
  Container, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  Alert,
  TextField,
  CircularProgress,
  Divider
} from '@mui/material';

const LinkBusinessToClerk: React.FC = () => {
  const { user: clerkUser, isSignedIn } = useUser();
  const businessProfile = useQuery(api.authClerk.getCurrentBusinessQuery, isSignedIn ? {} : 'skip');
  const linkByEmail = useMutation(api.migrations.linkBusinessToClerk.linkBusinessByEmail);
  const forceLink = useMutation(api.migrations.linkBusinessToClerk.forceLinkBusiness);
  const addLogo = useMutation(api.migrations.addDefaultLogo.addDefaultLogoToCurrentBusiness);
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [forceEmail, setForceEmail] = useState('josh@somethingelse.com');
  
  const handleLinkByEmail = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const res = await linkByEmail();
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Failed to link business');
    } finally {
      setLoading(false);
    }
  };
  
  const handleForceLink = async () => {
    if (!forceEmail) {
      setError('Please enter a business email');
      return;
    }
    
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const res = await forceLink({ businessEmail: forceEmail });
      setResult(res);
      // Reload to refresh the business profile
      setTimeout(() => window.location.reload(), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to force link business');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddLogo = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const res = await addLogo({});
      setResult(res);
      // Reload to refresh the business profile
      setTimeout(() => window.location.reload(), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to add logo');
    } finally {
      setLoading(false);
    }
  };
  
  if (!isSignedIn) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">
          You must be signed in with Clerk to link a business profile.
        </Alert>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Link Business to Clerk User
      </Typography>
      
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Current Status</Typography>
          <Typography>Clerk User ID: {clerkUser?.id}</Typography>
          <Typography>Clerk Email: {clerkUser?.primaryEmailAddress?.emailAddress}</Typography>
          <Typography>
            Business Profile: {businessProfile ? `${businessProfile.name} (${businessProfile.email})` : 'Not linked'}
          </Typography>
          {businessProfile?.clerk_user_id && (
            <Typography color="success">
              ✓ Business is linked to Clerk user: {businessProfile.clerk_user_id}
            </Typography>
          )}
          {businessProfile && !businessProfile.logo_url && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              ⚠️ Business is missing a logo, which is required for baseline onboarding
            </Alert>
          )}
        </CardContent>
      </Card>
      
      {!businessProfile && (
        <>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Auto-Link by Email Match
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                This will link a business with email matching your Clerk account email.
              </Typography>
              <Button 
                variant="contained" 
                onClick={handleLinkByEmail}
                disabled={loading}
                sx={{ mt: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Link Business by Email'}
              </Button>
            </CardContent>
          </Card>
          
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Force Link Specific Business
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Enter the email of the business you want to link to your Clerk account.
              </Typography>
              <TextField
                fullWidth
                label="Business Email"
                value={forceEmail}
                onChange={(e) => setForceEmail(e.target.value)}
                sx={{ mt: 2, mb: 2 }}
              />
              <Button 
                variant="contained" 
                color="warning"
                onClick={handleForceLink}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Force Link Business'}
              </Button>
            </CardContent>
          </Card>
        </>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {result && (
        <Alert severity="success" sx={{ mb: 2 }}>
          <Typography variant="subtitle1">{result.message}</Typography>
          <Typography variant="body2">Business: {result.businessName}</Typography>
          <Typography variant="body2">Business ID: {result.businessId}</Typography>
          {result.previouslyLinked && (
            <Typography variant="body2">Previously linked: {result.previouslyLinked}</Typography>
          )}
        </Alert>
      )}
      
      {businessProfile && !businessProfile.logo_url && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Add Default Logo
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Your business needs a logo to pass baseline onboarding requirements.
            </Typography>
            <Button 
              variant="contained" 
              color="secondary"
              onClick={handleAddLogo}
              disabled={loading}
              sx={{ mt: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Add Default Logo'}
            </Button>
          </CardContent>
        </Card>
      )}
      
      {businessProfile && businessProfile.logo_url && (
        <Alert severity="success">
          Your Clerk account is linked to a business profile with all required fields. 
          You should now be able to access the business dashboard.
        </Alert>
      )}
    </Container>
  );
};

export default LinkBusinessToClerk;