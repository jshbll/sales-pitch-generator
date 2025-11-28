import React from 'react';
import { Box, Paper, Typography, Chip, Divider, Collapse, IconButton } from '@mui/material';
import { useQuery } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { ChevronDown, ChevronUp, DollarSign, Zap, Volume2 } from 'lucide-react';

// Only show in development
const isDev = import.meta.env.DEV;

export const DevUsageTracker: React.FC = () => {
  const [expanded, setExpanded] = React.useState(false);
  const usageStats = useQuery(api.audioGenerator.getUsageStats, { days: 30 });

  // Don't render in production
  if (!isDev) return null;

  if (!usageStats) {
    return (
      <Paper
        elevation={0}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          p: 1.5,
          borderRadius: 2,
          bgcolor: '#1e293b',
          color: 'white',
          fontSize: '0.75rem',
          zIndex: 9999,
          opacity: 0.9,
        }}
      >
        <Typography sx={{ fontSize: '0.75rem' }}>Loading usage...</Typography>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        borderRadius: 2,
        bgcolor: '#1e293b',
        color: 'white',
        zIndex: 9999,
        opacity: 0.95,
        maxWidth: 320,
        overflow: 'hidden',
      }}
    >
      {/* Header - always visible */}
      <Box
        sx={{
          p: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          cursor: 'pointer',
          '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <DollarSign size={16} color="#10b981" />
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, flex: 1 }}>
          DEV Usage: ${usageStats.totals.totalCostDollars}
        </Typography>
        <Chip
          label={`${usageStats.totals.requestCount} calls`}
          size="small"
          sx={{
            height: 20,
            fontSize: '0.65rem',
            bgcolor: 'rgba(255,255,255,0.1)',
            color: 'white',
          }}
        />
        <IconButton size="small" sx={{ color: 'white', p: 0 }}>
          {expanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </IconButton>
      </Box>

      {/* Expanded details */}
      <Collapse in={expanded}>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
        <Box sx={{ p: 1.5 }}>
          {/* Qwen stats */}
          <Box sx={{ mb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
              <Zap size={12} color="#fbbf24" />
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#fbbf24' }}>
                Qwen (Script Gen)
              </Typography>
            </Box>
            <Box sx={{ pl: 2, fontSize: '0.65rem', color: '#94a3b8' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Cost:</span>
                <span style={{ color: '#10b981' }}>${usageStats.qwen.costDollars}</span>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Requests:</span>
                <span>{usageStats.qwen.requestCount}</span>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Input tokens:</span>
                <span>{usageStats.qwen.inputTokens.toLocaleString()}</span>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Output tokens:</span>
                <span>{usageStats.qwen.outputTokens.toLocaleString()}</span>
              </Box>
            </Box>
          </Box>

          {/* ElevenLabs stats */}
          <Box sx={{ mb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
              <Volume2 size={12} color="#8b5cf6" />
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#8b5cf6' }}>
                ElevenLabs (TTS)
              </Typography>
            </Box>
            <Box sx={{ pl: 2, fontSize: '0.65rem', color: '#94a3b8' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Cost:</span>
                <span style={{ color: '#10b981' }}>${usageStats.elevenlabs.costDollars}</span>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Characters:</span>
                <span>{usageStats.elevenlabs.characters.toLocaleString()}</span>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Preview:</span>
                <span>{usageStats.elevenlabs.previewCount} calls</span>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>HQ:</span>
                <span>{usageStats.elevenlabs.hqCount} calls</span>
              </Box>
            </Box>
          </Box>

          {/* Period info */}
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 1 }} />
          <Typography sx={{ fontSize: '0.6rem', color: '#64748b', textAlign: 'center' }}>
            Last {usageStats.period.days} days • {usageStats.totals.successCount} success / {usageStats.totals.failureCount} failed
          </Typography>

          {/* Recent activity */}
          {usageStats.recentUsage.length > 0 && (
            <>
              <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 1 }} />
              <Typography sx={{ fontSize: '0.65rem', color: '#64748b', mb: 0.5 }}>
                Recent:
              </Typography>
              {usageStats.recentUsage.slice(0, 5).map((usage, idx) => (
                <Box
                  key={idx}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.6rem',
                    color: '#94a3b8',
                    py: 0.25,
                  }}
                >
                  <span>
                    {usage.service === 'qwen' ? '⚡' : '🔊'} {usage.operation}
                  </span>
                  <span style={{ color: usage.success ? '#10b981' : '#ef4444' }}>
                    {usage.success ? `$${(usage.costCents / 100).toFixed(4)}` : 'failed'}
                  </span>
                </Box>
              ))}
            </>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
};

export default DevUsageTracker;
