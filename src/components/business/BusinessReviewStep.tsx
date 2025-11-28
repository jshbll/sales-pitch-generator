import React from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { BusinessHours } from '../../types/businessHours';

interface BusinessReviewStepProps {
  businessData: {
    businessHours?: BusinessHours;
    name?: string;
    description?: string;
    website?: string;
    industry?: string;
    subIndustry?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    phone?: string;
    email?: string;
  };
}

const BusinessReviewStep: React.FC<BusinessReviewStepProps> = ({ businessData }) => {
  // Format business hours for display
  const formatBusinessHours = () => {
    if (!businessData.businessHours) return 'Not specified';
    
    const hours = businessData.businessHours;
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    return (
      <List dense>
        {days.map(day => {
          const dayHours = hours[day];
          if (!dayHours) return null;
          
          const formattedDay = day.charAt(0).toUpperCase() + day.slice(1);
          let hoursText = 'Closed';
          
          if (!dayHours.closed) {
            hoursText = `${dayHours.open} - ${dayHours.close}`;
          }
          
          return (
            <ListItem key={day} sx={{ py: 0.5 }}>
              <ListItemText 
                primary={`${formattedDay}: ${hoursText}`}
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
          );
        })}
      </List>
    );
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Review Your Business Profile
      </Typography>
      <Typography variant="body2" color="textSecondary" paragraph>
        Please review your business profile information before submitting. You can go back to any step to make changes.
      </Typography>
      
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {businessData.name || 'Business Name Not Provided'}
          </Typography>
          
          <Divider sx={{ my: 2 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                Business Information
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="Business Name"
                    secondary={businessData.name || 'Not provided'}
                    primaryTypographyProps={{ variant: 'body2', color: 'textSecondary' }}
                    secondaryTypographyProps={{ variant: 'body1' }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Description"
                    secondary={businessData.description || 'Not provided'}
                    primaryTypographyProps={{ variant: 'body2', color: 'textSecondary' }}
                    secondaryTypographyProps={{ variant: 'body1' }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Website"
                    secondary={businessData.website || 'Not provided'}
                    primaryTypographyProps={{ variant: 'body2', color: 'textSecondary' }}
                    secondaryTypographyProps={{ variant: 'body1' }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Industry"
                    secondary={businessData.industry || 'Not provided'}
                    primaryTypographyProps={{ variant: 'body2', color: 'textSecondary' }}
                    secondaryTypographyProps={{ variant: 'body1' }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Sub-Industry"
                    secondary={businessData.subIndustry || 'Not provided'}
                    primaryTypographyProps={{ variant: 'body2', color: 'textSecondary' }}
                    secondaryTypographyProps={{ variant: 'body1' }}
                  />
                </ListItem>
              </List>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                Contact Information
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="Address"
                    secondary={businessData.address || 'Not provided'}
                    primaryTypographyProps={{ variant: 'body2', color: 'textSecondary' }}
                    secondaryTypographyProps={{ variant: 'body1' }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="City"
                    secondary={businessData.city || 'Not provided'}
                    primaryTypographyProps={{ variant: 'body2', color: 'textSecondary' }}
                    secondaryTypographyProps={{ variant: 'body1' }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="State"
                    secondary={businessData.state || 'Not provided'}
                    primaryTypographyProps={{ variant: 'body2', color: 'textSecondary' }}
                    secondaryTypographyProps={{ variant: 'body1' }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Zip Code"
                    secondary={businessData.zip || 'Not provided'}
                    primaryTypographyProps={{ variant: 'body2', color: 'textSecondary' }}
                    secondaryTypographyProps={{ variant: 'body1' }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Phone"
                    secondary={businessData.phone || 'Not provided'}
                    primaryTypographyProps={{ variant: 'body2', color: 'textSecondary' }}
                    secondaryTypographyProps={{ variant: 'body1' }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Email"
                    secondary={businessData.email || 'Not provided'}
                    primaryTypographyProps={{ variant: 'body2', color: 'textSecondary' }}
                    secondaryTypographyProps={{ variant: 'body1' }}
                  />
                </ListItem>
              </List>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2" color="primary" gutterBottom>
                Business Hours
              </Typography>
              {formatBusinessHours()}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      <Typography variant="body2" color="textSecondary">
        By submitting this information, you confirm that all details provided are accurate and up-to-date.
      </Typography>
    </Box>
  );
};

export default BusinessReviewStep;
