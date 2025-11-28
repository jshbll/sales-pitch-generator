import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  FormControlLabel, 
  Switch, 
  TextField,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import { BusinessHours, DayHours, defaultBusinessHours } from '../../types/businessHours';

interface BusinessHoursStepProps {
  businessData: { businessHours?: BusinessHours };
  updateBusinessData: (data: { businessHours?: BusinessHours }) => void;
}

const days = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' }
];

const BusinessHoursStep: React.FC<BusinessHoursStepProps> = ({ businessData, updateBusinessData }) => {
  // Initialize business hours: merge defaults with incoming to ensure all days defined
  const [hours, setHours] = useState<BusinessHours>(() => ({
    ...defaultBusinessHours,
    ...((businessData.businessHours as BusinessHours) || {})
  }));

  const handleHoursChange = (day: string, field: keyof DayHours, value: string | boolean) => {
    const updatedHours = {
      ...hours,
      [day]: {
        ...hours[day],
        [field]: field === 'closed' ? value : value,
        // Sync closed with the opposite of isOpen for backwards compatibility
        ...(field === 'closed' && { closed: value as boolean }),
        ...(field === 'open' && { open: value as string }),
        ...(field === 'close' && { close: value as string })
      }
    };
    
    setHours(updatedHours);
    updateBusinessData({ businessHours: updatedHours });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Business Hours
      </Typography>
      <Typography variant="body2" color="textSecondary" paragraph>
        Set your regular business hours. This helps customers know when they can visit or contact you.
      </Typography>
      
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          {days.map((day, index) => (
            <React.Fragment key={day.key}>
              <Grid container spacing={2} alignItems="center" sx={{ py: 1 }}>
                <Grid item xs={3}>
                  <Typography variant="body1">{day.label}</Typography>
                </Grid>
                
                <Grid item xs={3}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={!hours[day.key].closed}
                        onChange={(e) => handleHoursChange(day.key, 'closed', !e.target.checked)}
                        color="primary"
                      />
                    }
                    label={!hours[day.key].closed ? "Open" : "Closed"}
                  />
                </Grid>
                
                <Grid item xs={3}>
                  <TextField
                    label="Open"
                    type="time"
                    value={hours[day.key].open}
                    onChange={(e) => handleHoursChange(day.key, 'open', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ step: 300 }}
                    disabled={hours[day.key].closed}
                    size="small"
                    fullWidth
                  />
                </Grid>
                
                <Grid item xs={3}>
                  <TextField
                    label="Close"
                    type="time"
                    value={hours[day.key].close}
                    onChange={(e) => handleHoursChange(day.key, 'close', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ step: 300 }}
                    disabled={hours[day.key].closed}
                    size="small"
                    fullWidth
                  />
                </Grid>
              </Grid>
              {index < days.length - 1 && <Divider sx={{ my: 1 }} />}
            </React.Fragment>
          ))}
        </CardContent>
      </Card>
      
      <Typography variant="body2" color="textSecondary">
        Note: You can update your business hours anytime from your business profile settings.
      </Typography>
    </Box>
  );
};

export default BusinessHoursStep;
