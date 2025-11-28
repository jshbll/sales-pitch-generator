import React, { useState, useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { Mail, User, MessageSquare, Send } from "lucide-react";
import FloatingLabelInput from "../components/FloatingLabelInput";
import ReCAPTCHA from "react-google-recaptcha";
import { usePageTitle } from '../hooks/usePageTitle';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Card,
  CardContent,
  InputAdornment,
  Container,
  CircularProgress
} from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { LandingLayout } from '../layouts/LandingLayout';
import { trackContactFormSubmit } from '../utils/marketingAnalytics';

const ContactPage: React.FC = () => {
  usePageTitle('Contact Us');
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{ name?: string; email?: string; message?: string }>({});
  const [isMessageFocused, setIsMessageFocused] = useState(false);
  const [viewThreshold, setViewThreshold] = useState(0.5);
  const sectionRef = useRef<HTMLDivElement>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  useEffect(() => {
    const checkIfDesktop = () => {
      const isDesktopView = window.innerWidth >= 768;
      setViewThreshold(isDesktopView ? 0.5 : 0.1);
    };
    checkIfDesktop();
    window.addEventListener('resize', checkIfDesktop);
    return () => window.removeEventListener('resize', checkIfDesktop);
  }, []);

  const isInView = useInView(sectionRef, { amount: viewThreshold, once: true });
  useEffect(() => { if (isInView && !hasAnimated) setHasAnimated(true); }, [isInView, hasAnimated]);

  const validateForm = (): boolean => {
    const errors: { name?: string; email?: string; message?: string } = {};
    let isValid = true;
    if (!formData.name) { errors.name = 'Name is required'; isValid = false; }
    if (!formData.email) {
      errors.email = 'Email address is required'; isValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) { errors.email = 'Please enter a valid email address'; isValid = false; }
    }
    if (!formData.message) { errors.message = 'Message is required'; isValid = false; }
    if (!captchaToken) { alert('Please complete the reCAPTCHA verification'); isValid = false; }
    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      // Replace this URL with your actual webhook endpoint
      const webhookUrl = "https://hook.make.com/your-webhook-endpoint";
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, recaptchaToken: captchaToken, timestamp: new Date().toISOString(), source: "website-contact-form" })
      });
      if (!response.ok) throw new Error("Failed to send message");
      setFormData({ name: "", email: "", message: "" });
      setCaptchaToken(null);
      if (recaptchaRef.current) recaptchaRef.current.reset();
      setIsSuccess(true);
      trackContactFormSubmit(true);
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (error) {
      console.error("Error sending message:", error);
      trackContactFormSubmit(false);
      alert("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCaptchaChange = (token: string | null) => {
    setCaptchaToken(token);
  };

  return (
    <LandingLayout>
      <Box
        sx={{
          bgcolor: '#f8fafc',
          minHeight: '100vh',
          pt: { xs: 12, md: 16 },
          pb: { xs: 6, md: 10 },
          px: { xs: 2, sm: 3, lg: 4 }
        }}
      >
        <Container maxWidth="md">
          <motion.div
            ref={sectionRef}
            initial={{ opacity: 0, y: 20 }}
            animate={hasAnimated ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <Box textAlign="center" mb={6}>
              <Typography
                variant="h2"
                component="h1"
                fontWeight="bold"
                gutterBottom
                sx={{ color: '#1e293b', fontSize: { xs: '2rem', md: '3rem' } }}
              >
                Get In Touch
              </Typography>
              <Typography
                variant="h6"
                sx={{ color: '#64748b', maxWidth: 600, mx: 'auto', fontWeight: 400 }}
              >
                Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
              </Typography>
            </Box>

            <Box
              sx={{
                bgcolor: 'white',
                borderRadius: 2,
                border: '1px solid #e2e8f0',
                p: { xs: 3, md: 5 },
                maxWidth: 600,
                mx: 'auto'
              }}
            >
              {isSuccess ? (
                <Box textAlign="center" py={4}>
                  <CheckCircle
                    sx={{
                      fontSize: 48,
                      color: '#10B981',
                      mb: 2
                    }}
                  />
                  <Typography variant="h5" component="h3" fontWeight="medium" gutterBottom sx={{ color: '#1e293b' }}>
                    Message Sent Successfully!
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    Thank you for reaching out. We'll get back to you as soon as possible.
                  </Typography>
                </Box>
              ) : (
                <form onSubmit={handleSubmit}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <TextField
                      id="contact-name"
                      name="name"
                      placeholder="Your Name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      fullWidth
                      variant="outlined"
                      error={!!formErrors.name}
                      helperText={formErrors.name}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <User className="w-5 h-5" style={{ color: '#64748b' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          bgcolor: '#f8fafc',
                          color: '#1e293b',
                          '& fieldset': {
                            borderColor: '#e2e8f0',
                          },
                          '&:hover fieldset': {
                            borderColor: '#cbd5e1',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#fbbf24',
                          },
                        },
                        '& .MuiInputBase-input::placeholder': {
                          color: '#94a3b8',
                          opacity: 1,
                        },
                      }}
                    />
                    <TextField
                      id="contact-email"
                      name="email"
                      type="email"
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      fullWidth
                      variant="outlined"
                      error={!!formErrors.email}
                      helperText={formErrors.email}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Mail className="w-5 h-5" style={{ color: '#64748b' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          bgcolor: '#f8fafc',
                          color: '#1e293b',
                          '& fieldset': {
                            borderColor: '#e2e8f0',
                          },
                          '&:hover fieldset': {
                            borderColor: '#cbd5e1',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#fbbf24',
                          },
                        },
                        '& .MuiInputBase-input::placeholder': {
                          color: '#94a3b8',
                          opacity: 1,
                        },
                      }}
                    />
                    <TextField
                      id="message"
                      name="message"
                      placeholder="Your Message"
                      multiline
                      rows={6}
                      value={formData.message}
                      onChange={handleChange}
                      required
                      fullWidth
                      variant="outlined"
                      error={!!formErrors.message}
                      helperText={formErrors.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                            <MessageSquare className="w-5 h-5" style={{ color: '#64748b' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          bgcolor: '#f8fafc',
                          color: '#1e293b',
                          '& fieldset': {
                            borderColor: '#e2e8f0',
                          },
                          '&:hover fieldset': {
                            borderColor: '#cbd5e1',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#fbbf24',
                          },
                        },
                        '& .MuiInputBase-input::placeholder': {
                          color: '#94a3b8',
                          opacity: 1,
                        },
                      }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <ReCAPTCHA
                        ref={recaptchaRef}
                        sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
                        onChange={handleCaptchaChange}
                      />
                    </Box>
                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      disabled={isSubmitting}
                      startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <Send className="h-5 w-5" />}
                      sx={{
                        py: 1.5,
                        bgcolor: '#fbbf24',
                        color: 'white',
                        fontWeight: 600,
                        '&:hover': {
                          bgcolor: '#f59e0b',
                        },
                        '&:disabled': {
                          bgcolor: '#e2e8f0',
                          color: '#94a3b8',
                        },
                      }}
                    >
                      {isSubmitting ? "Sending..." : "Send Message"}
                    </Button>
                  </Box>
                </form>
              )}

              <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Typography variant="body2" sx={{ color: '#64748b', mb: 1 }}>
                  Or reach us directly at
                </Typography>
                <Typography
                  component="a"
                  href="mailto:info@jaxsaver.com"
                  sx={{
                    color: '#fbbf24',
                    textDecoration: 'none',
                    fontWeight: 500,
                    '&:hover': {
                      color: '#f59e0b',
                      textDecoration: 'underline',
                    },
                  }}
                >
                  info@jaxsaver.com
                </Typography>
              </Box>
            </Box>
          </motion.div>
        </Container>
      </Box>
    </LandingLayout>
  );
};

export default ContactPage;
