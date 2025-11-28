import React from 'react';
import {
  Box,
  Avatar,
  Typography,
  Paper,
  useTheme,
  IconButton,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

interface Story {
  id: string;
  username: string;
  avatar: string;
  isViewed: boolean;
  isOwn?: boolean;
}

interface StoriesBarProps {
  stories?: Story[];
  onStoryClick?: (storyId: string) => void;
  onAddStory?: () => void;
}

const StoriesBar: React.FC<StoriesBarProps> = ({
  stories = [],
  onStoryClick,
  onAddStory,
}) => {
  const theme = useTheme();

  // Mock stories data if none provided
  const mockStories: Story[] = [
    {
      id: 'own',
      username: 'Your Story',
      avatar: '/images/avatars/user.jpg',
      isViewed: false,
      isOwn: true,
    },
    {
      id: '1',
      username: 'downtown_deli',
      avatar: '/images/business-avatars/deli.jpg',
      isViewed: false,
    },
    {
      id: '2',
      username: 'fitness_first',
      avatar: '/images/business-avatars/gym.jpg',
      isViewed: true,
    },
    {
      id: '3',
      username: 'coffee_corner',
      avatar: '/images/business-avatars/coffee.jpg',
      isViewed: false,
    },
    {
      id: '4',
      username: 'pizza_palace',
      avatar: '/images/business-avatars/pizza.jpg',
      isViewed: true,
    },
    {
      id: '5',
      username: 'tech_repair',
      avatar: '/images/business-avatars/tech.jpg',
      isViewed: false,
    },
    {
      id: '6',
      username: 'local_bakery',
      avatar: '/images/business-avatars/bakery.jpg',
      isViewed: true,
    },
    {
      id: '7',
      username: 'auto_shop',
      avatar: '/images/business-avatars/auto.jpg',
      isViewed: false,
    },
  ];

  const displayStories = stories.length > 0 ? stories : mockStories;

  const handleStoryClick = (story: Story) => {
    if (story.isOwn && onAddStory) {
      onAddStory();
    } else if (onStoryClick) {
      onStoryClick(story.id);
    }
  };

  return (
    <Paper
      sx={{
        p: 2,
        mb: 2,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 1,
        backgroundColor: theme.palette.background.paper,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          overflowX: 'auto',
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          pb: 1,
        }}
      >
        {displayStories.map((story) => (
          <Box
            key={story.id}
            onClick={() => handleStoryClick(story)}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              minWidth: 66,
              '&:hover': {
                opacity: 0.8,
              },
            }}
          >
            <Box
              sx={{
                position: 'relative',
                mb: 1,
              }}
            >
              <Avatar
                src={story.avatar}
                sx={{
                  width: 56,
                  height: 56,
                  border: story.isViewed 
                    ? `2px solid ${theme.palette.grey[300]}`
                    : `2px solid ${theme.palette.primary.main}`,
                  background: story.isViewed 
                    ? theme.palette.grey[300]
                    : `linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)`,
                  p: story.isViewed ? 0 : '2px',
                }}
              >
                {story.isOwn ? (
                  story.username[0]
                ) : (
                  <img
                    src={story.avatar}
                    alt={story.username}
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      objectFit: 'cover',
                    }}
                  />
                )}
              </Avatar>
              
              {story.isOwn && (
                <IconButton
                  sx={{
                    position: 'absolute',
                    bottom: -2,
                    right: -2,
                    width: 20,
                    height: 20,
                    backgroundColor: '#0095f6',
                    color: 'white',
                    border: `2px solid ${theme.palette.background.paper}`,
                    '&:hover': {
                      backgroundColor: '#0081d6',
                    },
                  }}
                  size="small"
                >
                  <AddIcon sx={{ fontSize: 12 }} />
                </IconButton>
              )}
            </Box>
            
            <Typography
              variant="caption"
              sx={{
                fontSize: '0.75rem',
                textAlign: 'center',
                maxWidth: 66,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                color: theme.palette.text.primary,
              }}
            >
              {story.isOwn ? 'Your Story' : story.username}
            </Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
};

export default StoriesBar;