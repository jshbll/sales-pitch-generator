import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  CircularProgress,
  IconButton,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useAction, useMutation } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { Id } from '../../../../../convex/_generated/dataModel';
import {
  Play,
  Pause,
  Download,
  RefreshCw,
  ArrowLeft,
  Copy,
  Check,
  Sparkles,
  Volume2,
} from 'lucide-react';
import { VOICE_OPTIONS } from '../../audio-generator/types/audio.types';
import { estimateCost } from '../../audio-generator/promptBuilder';
import { DevUsageTracker } from '../../components/audio-generator';

export const AudioPreview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('custom');
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  // Query the generation
  const generation = useQuery(api.audioGenerator.get, id ? { id: id as Id<"audio_generations"> } : "skip");

  // Actions
  const generateScript = useAction(api.audioGenerator.generateScript);
  const generateAudio = useAction(api.audioGenerator.generateAudio);

  // Auto-generate script when page loads if status is draft
  useEffect(() => {
    if (generation && generation.status === 'draft' && !isGeneratingScript) {
      handleGenerateScript();
    }
  }, [generation?.status]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioElement) {
        audioElement.pause();
        audioElement.src = '';
      }
    };
  }, [audioElement]);

  const handleGenerateScript = async () => {
    if (!generation || !id) return;

    setIsGeneratingScript(true);
    try {
      await generateScript({
        id: id as Id<"audio_generations">,
        prompt: generation.prompt,
      });
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const handleGeneratePreviewAudio = async () => {
    if (!generation || !id || !generation.script_text) return;

    setIsGeneratingAudio(true);
    try {
      await generateAudio({
        id: id as Id<"audio_generations">,
        script_text: generation.script_text,
        voice: selectedVoice,
        model: 'tts-1',
      });
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const handleGenerateHQAudio = async () => {
    if (!generation || !id || !generation.script_text) return;

    setIsGeneratingAudio(true);
    try {
      await generateAudio({
        id: id as Id<"audio_generations">,
        script_text: generation.script_text,
        voice: selectedVoice,
        model: 'tts-1-hd',
      });
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const handleCopyScript = () => {
    if (generation?.script_text) {
      navigator.clipboard.writeText(generation.script_text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePlayPause = () => {
    const audioUrl = generation?.hq_url || generation?.preview_url;
    if (!audioUrl) return;

    if (audioElement && isPlaying) {
      audioElement.pause();
      setIsPlaying(false);
    } else {
      const audio = new Audio(audioUrl);
      audio.onended = () => setIsPlaying(false);
      audio.play();
      setAudioElement(audio);
      setIsPlaying(true);
    }
  };

  const handleDownload = () => {
    const audioUrl = generation?.hq_url || generation?.preview_url;
    if (!audioUrl) return;

    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `sales-pitch-${id}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate costs
  const pitchLength = generation?.answers?.pitchLength || '60-second';
  const costs = estimateCost(pitchLength);

  if (!id) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography>Invalid generation ID</Typography>
      </Container>
    );
  }

  if (generation === undefined) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress sx={{ color: '#fbbf24' }} />
      </Box>
    );
  }

  if (generation === null) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography>Generation not found</Typography>
      </Container>
    );
  }

  const isScriptReady = generation.status === 'script_ready' ||
    generation.status === 'preview_ready' ||
    generation.status === 'hq_ready';

  const hasPreviewAudio = !!generation.preview_url;
  const hasHQAudio = !!generation.hq_url;
  const isGenerating = generation.status === 'script_generating' ||
    generation.status === 'preview_generating' ||
    generation.status === 'hq_generating';

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#f8fafc',
        py: { xs: 4, md: 6 },
      }}
    >
      <Container maxWidth="md">
        {/* Back button */}
        <Button
          startIcon={<ArrowLeft size={18} />}
          onClick={() => navigate('/admin/audio-generator/new')}
          sx={{
            mb: 3,
            color: '#64748b',
            textTransform: 'none',
            '&:hover': { bgcolor: '#f1f5f9' },
          }}
        >
          New Script
        </Button>

        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: '#1e293b',
              mb: 1,
            }}
          >
            {isScriptReady ? 'Your Script is Ready!' : 'Generating Script...'}
          </Typography>
          <Typography sx={{ color: '#64748b' }}>
            {isScriptReady
              ? 'Review your script below and generate audio when ready'
              : 'Please wait while we craft your perfect sales pitch'}
          </Typography>
        </Box>

        {/* Status indicator */}
        {isGenerating && (
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              borderRadius: 2,
              bgcolor: '#fef3c7',
              border: '1px solid #fde68a',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <CircularProgress size={24} sx={{ color: '#f59e0b' }} />
            <Typography sx={{ color: '#92400e', fontWeight: 500 }}>
              {generation.status === 'script_generating' && 'Generating your script...'}
              {generation.status === 'preview_generating' && 'Creating preview audio...'}
              {generation.status === 'hq_generating' && 'Creating high-quality audio...'}
            </Typography>
          </Paper>
        )}

        {/* Error state */}
        {generation.status === 'failed' && (
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              borderRadius: 2,
              bgcolor: '#fef2f2',
              border: '1px solid #fecaca',
            }}
          >
            <Typography sx={{ color: '#dc2626', fontWeight: 500, mb: 1 }}>
              Generation Failed
            </Typography>
            <Typography sx={{ color: '#b91c1c', fontSize: '0.875rem', mb: 2 }}>
              {generation.error_message || 'An unknown error occurred'}
            </Typography>
            <Button
              variant="outlined"
              startIcon={<RefreshCw size={16} />}
              onClick={handleGenerateScript}
              sx={{ borderColor: '#dc2626', color: '#dc2626' }}
            >
              Try Again
            </Button>
          </Paper>
        )}

        {/* Script display */}
        {isScriptReady && generation.script_text && (
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 4 },
              mb: 3,
              borderRadius: 3,
              bgcolor: 'white',
              border: '1px solid #e2e8f0',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography sx={{ fontWeight: 600, color: '#1e293b' }}>
                Generated Script
              </Typography>
              <IconButton
                onClick={handleCopyScript}
                sx={{
                  color: copied ? '#10b981' : '#64748b',
                  '&:hover': { bgcolor: '#f1f5f9' },
                }}
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
              </IconButton>
            </Box>

            <Typography
              sx={{
                color: '#475569',
                lineHeight: 1.8,
                fontSize: '1rem',
                whiteSpace: 'pre-wrap',
                p: 2,
                bgcolor: '#f8fafc',
                borderRadius: 2,
                border: '1px solid #e2e8f0',
              }}
            >
              {generation.script_text}
            </Typography>

            <Typography sx={{ mt: 2, fontSize: '0.75rem', color: '#94a3b8' }}>
              ~{generation.script_text.length} characters
            </Typography>
          </Paper>
        )}

        {/* Voice selection and audio generation */}
        {isScriptReady && (
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 4 },
              mb: 3,
              borderRadius: 3,
              bgcolor: 'white',
              border: '1px solid #e2e8f0',
            }}
          >
            <Typography sx={{ fontWeight: 600, color: '#1e293b', mb: 3 }}>
              Generate Audio
            </Typography>

            {/* Voice selector */}
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Voice</InputLabel>
              <Select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                label="Voice"
              >
                {VOICE_OPTIONS.map((voice) => (
                  <MenuItem key={voice.value} value={voice.value}>
                    <Box>
                      <Typography sx={{ fontWeight: 500 }}>{voice.label}</Typography>
                      <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {voice.description}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Audio buttons */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Preview audio button */}
              {!hasPreviewAudio && !hasHQAudio && (
                <Button
                  variant="contained"
                  startIcon={isGeneratingAudio ? <CircularProgress size={18} /> : <Volume2 size={18} />}
                  onClick={handleGeneratePreviewAudio}
                  disabled={isGeneratingAudio}
                  sx={{
                    bgcolor: '#fbbf24',
                    color: '#000',
                    fontWeight: 600,
                    textTransform: 'none',
                    py: 1.5,
                    '&:hover': { bgcolor: '#f59e0b' },
                  }}
                >
                  Generate Preview Audio
                </Button>
              )}

              {/* HQ audio button */}
              {hasPreviewAudio && !hasHQAudio && (
                <Button
                  variant="contained"
                  startIcon={isGeneratingAudio ? <CircularProgress size={18} /> : <Sparkles size={18} />}
                  onClick={handleGenerateHQAudio}
                  disabled={isGeneratingAudio}
                  sx={{
                    bgcolor: '#8b5cf6',
                    color: 'white',
                    fontWeight: 600,
                    textTransform: 'none',
                    py: 1.5,
                    '&:hover': { bgcolor: '#7c3aed' },
                  }}
                >
                  Upgrade to HQ Audio
                </Button>
              )}

              {/* Audio player */}
              {(hasPreviewAudio || hasHQAudio) && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 2,
                    bgcolor: '#f8fafc',
                    borderRadius: 2,
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <IconButton
                    onClick={handlePlayPause}
                    sx={{
                      bgcolor: '#fbbf24',
                      color: '#000',
                      '&:hover': { bgcolor: '#f59e0b' },
                    }}
                  >
                    {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                  </IconButton>

                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
                      {hasHQAudio ? 'High Quality Audio' : 'Preview Audio'}
                    </Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                      ElevenLabs {hasHQAudio ? 'Multilingual v2' : 'Turbo v2.5'} • {selectedVoice}
                    </Typography>
                  </Box>

                  <IconButton onClick={handleDownload}>
                    <Download size={18} />
                  </IconButton>
                </Box>
              )}
            </Box>
          </Paper>
        )}

        {/* Cost info */}
        <Typography sx={{ textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8' }}>
          Powered by ElevenLabs TTS
        </Typography>
      </Container>

      {/* Dev usage tracker - only shows in development */}
      <DevUsageTracker />
    </Box>
  );
};

export default AudioPreview;
