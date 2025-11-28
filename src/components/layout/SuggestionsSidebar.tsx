import React from 'react';
import {
  Box,
  Typography,
  Avatar,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Link,
  useTheme,
} from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface SuggestionItem {
  id: string;
  name: string;
  description: string;
  avatar: string;
  type: 'business' | 'user';
  followersCount?: number;
}

interface SuggestionsSidebarProps {
  suggestions?: SuggestionItem[];
}

const SuggestionsSidebar: React.FC<SuggestionsSidebarProps> = ({ suggestions = [] }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Mock suggestions if none provided
  const mockSuggestions: SuggestionItem[] = [
    {
      id: '1',
      name: 'Downtown Deli',
      description: 'Followed by sarah_j and 3 others',
      avatar: '/images/business-avatars/deli.jpg',
      type: 'business',
      followersCount: 1234,
    },
    {
      id: '2',
      name: 'Fitness First Gym',
      description: 'Popular in your area',
      avatar: '/images/business-avatars/gym.jpg',
      type: 'business',
      followersCount: 2456,
    },
    {
      id: '3',
      name: 'Coffee Corner',
      description: 'New business in Jacksonville',
      avatar: '/images/business-avatars/coffee.jpg',
      type: 'business',
      followersCount: 567,
    },
    {
      id: '4',
      name: 'Pizza Palace',
      description: 'Followed by mike_r and 5 others',
      avatar: '/images/business-avatars/pizza.jpg',
      type: 'business',
      followersCount: 3421,
    },
    {
      id: '5',
      name: 'Tech Repair Pro',
      description: 'Trending this week',
      avatar: '/images/business-avatars/tech.jpg',
      type: 'business',
      followersCount: 891,
    },
  ];

  const displaySuggestions = suggestions.length > 0 ? suggestions : mockSuggestions;

  const handleFollow = (suggestionId: string) => {
    // TODO: Implement follow functionality
    console.log('Following:', suggestionId);
  };

  const handleSeeAll = () => {
    navigate('/dashboard/businesses');
  };

  const handleSuggestionClick = (suggestion: SuggestionItem) => {
    if (suggestion.type === 'business') {
      navigate(`/dashboard/businesses/${suggestion.id}`);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* User Profile Section */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            src={user.profileImageId ? `/api/images/${user.profileImageId}` : undefined}
            sx={{ width: 56, height: 56, mr: 2 }}
          >
            {user.firstName?.[0]}{user.lastName?.[0]}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle2" fontWeight={600}>
              {user.firstName} {user.lastName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user.email}
            </Typography>
          </Box>
          <Button
            size="small"
            onClick={() => navigate('/dashboard/profile')}
            sx={{
              textTransform: 'none',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#0095f6',
              '&:hover': {
                backgroundColor: 'transparent',
                opacity: 0.7,
              },
            }}
          >
            Switch
          </Button>
        </Box>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Suggestions Section */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
            Suggested for you
          </Typography>
          <Button
            size="small"
            onClick={handleSeeAll}
            sx={{
              textTransform: 'none',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: theme.palette.text.primary,
              '&:hover': {
                backgroundColor: 'transparent',
                opacity: 0.7,
              },
            }}
          >
            See All
          </Button>
        </Box>

        <List disablePadding>
          {displaySuggestions.slice(0, 5).map((suggestion, index) => (
            <ListItem
              key={suggestion.id}
              disablePadding
              sx={{
                mb: 1.5,
                cursor: 'pointer',
                '&:hover': {
                  '& .MuiListItemText-primary': {
                    textDecoration: 'underline',
                  },
                },
              }}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <ListItemAvatar>
                <Avatar
                  src={suggestion.avatar}
                  sx={{ width: 32, height: 32 }}
                >
                  {suggestion.name[0]}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography variant="subtitle2" fontWeight={600} fontSize="0.875rem">
                    {suggestion.name}
                  </Typography>
                }
                secondary={
                  <Typography variant="caption" color="text.secondary">
                    {suggestion.description}
                  </Typography>
                }
                sx={{ mr: 1 }}
              />
              <ListItemSecondaryAction>
                <Button
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFollow(suggestion.id);
                  }}
                  sx={{
                    textTransform: 'none',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#0095f6',
                    minWidth: 'auto',
                    padding: '4px 8px',
                    '&:hover': {
                      backgroundColor: 'transparent',
                      opacity: 0.7,
                    },
                  }}
                >
                  Follow
                </Button>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Footer Links */}
      <Box>
        <Box sx={{ mb: 2 }}>
          {[
            'About',
            'Help',
            'Privacy',
            'Terms'
          ].map((link, index) => (
            <React.Fragment key={link}>
              <Link
                component="button"
                variant="caption"
                color="text.secondary"
                sx={{
                  textDecoration: 'none',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
                onClick={() => {
                  if (link === 'Privacy') navigate('/privacy-policy');
                  if (link === 'Terms') navigate('/terms');
                  if (link === 'About' || link === 'Help') navigate('/contact');
                }}
              >
                {link}
              </Link>
              {index < 3 && (
                <Typography
                  component="span"
                  variant="caption"
                  color="text.secondary"
                  sx={{ mx: 0.5 }}
                >
                  ·
                </Typography>
              )}
            </React.Fragment>
          ))}
        </Box>
        
        <Typography variant="caption" color="text.secondary">
          © 2025 JaxSaver
        </Typography>
      </Box>
    </Box>
  );
};

export default SuggestionsSidebar;