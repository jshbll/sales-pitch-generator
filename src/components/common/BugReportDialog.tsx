import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

interface BugReportDialogProps {
  open: boolean;
  onClose: () => void;
}

const BugReportDialog: React.FC<BugReportDialogProps> = ({ open, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Report a Bug</DialogTitle>
      <DialogContent>
        <p>Bug reporting feature coming soon.</p>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default BugReportDialog;
