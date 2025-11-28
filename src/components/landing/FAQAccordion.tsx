import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Typography, Container } from '@mui/material';
import { Plus, Minus } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

export const FAQAccordion: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      question: 'How is this different from social media?',
      answer: 'JaxSaver is location-first. When someone opens the app, they see the nearest, most relevant promotions first. No competing with viral videos, no algorithms—just local businesses reaching nearby customers.'
    },
    {
      question: 'What areas do you serve?',
      answer: "We're starting in Jacksonville and expanding rapidly. Sign up to see if we're in your area, or join our waitlist."
    },
    {
      question: 'Can I cancel anytime?',
      answer: 'Yes. No contracts, no cancellation fees. Cancel with one click from your dashboard.'
    },
    {
      question: 'How long does setup take?',
      answer: 'Most businesses complete their profile and first promotion in under 10 minutes.'
    },
    {
      question: 'What kind of businesses use JaxSaver?',
      answer: 'Restaurants, retail shops, salons, gyms, services, entertainment venues—any local business wanting to reach nearby customers.'
    },
    {
      question: 'Do I need technical skills?',
      answer: 'Not at all. If you can post on social media, you can use JaxSaver.'
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <Box
      component={motion.section}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5 }}
      sx={{
        py: { xs: 10, md: 14 },
        bgcolor: 'background.default',
        overflow: 'hidden'
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' },
              fontWeight: 700,
              color: 'text.primary',
              mb: 2
            }}
          >
            Frequently asked questions
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          {faqs.map((faq, index) => (
            <Box
              key={index}
              sx={{
                borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
              }}
            >
              {/* Question */}
              <Box
                onClick={() => toggleFAQ(index)}
                sx={{
                  py: 3,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 2,
                  userSelect: 'none'
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: { xs: '1rem', md: '1.0625rem' },
                    fontWeight: 500,
                    color: 'text.primary',
                  }}
                >
                  {faq.question}
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    color: '#fbbf24',
                  }}
                >
                  {openIndex === index ? <Minus size={20} /> : <Plus size={20} />}
                </Box>
              </Box>

              {/* Answer */}
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <Box sx={{ pb: 3 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: { xs: '0.875rem', md: '1rem' },
                          color: 'text.secondary',
                          lineHeight: 1.6
                        }}
                      >
                        {faq.answer}
                      </Typography>
                    </Box>
                  </motion.div>
                )}
              </AnimatePresence>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
};
