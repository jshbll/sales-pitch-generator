import React from 'react';
import { Box, Container, Typography, Paper, Divider } from '@mui/material';
import { usePageTitle } from '../hooks/usePageTitle';
import { LandingLayout } from '../layouts/LandingLayout';

const PrivacyPolicyPage: React.FC = () => {
  usePageTitle('Privacy Policy');

  return (
    <LandingLayout>
    <Box sx={{ 
      minHeight: '100vh', 
      py: { xs: 4, md: 8 },
      backgroundColor: 'background.default'
    }}>
      <Container maxWidth="md">
        <Paper elevation={0} sx={{ p: { xs: 3, md: 6 }, backgroundColor: 'background.paper' }}>
          <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
            Privacy Policy
          </Typography>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            <strong>Effective Date: September 16, 2024</strong>
          </Typography>
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="body1" paragraph>
            Jax Saver LLC ("Jax Saver," "we," "us," or "our") operates the Jax Saver website and mobile 
            applications (the "Service"). This Privacy Policy explains how we collect, use, share, and 
            protect personal information. By using the Service, you agree to this Privacy Policy.
          </Typography>
          
          <Typography variant="body1" paragraph>
            If you do not agree, please do not use the Service.
          </Typography>

          <Typography variant="h6" component="h3" fontWeight="bold" sx={{ mt: 4, mb: 2 }}>
            1. Who We Are and Scope
          </Typography>
          <Typography variant="body1" component="div" paragraph>
            <ul>
              <li><strong>Controller:</strong> Jax Saver LLC, dba "Jax Saver"</li>
              <li><strong>Contact:</strong> privacy@jaxsaver.com | Jacksonville, FL</li>
              <li>This Policy applies to users of our consumer app and to businesses using our business tools.</li>
            </ul>
          </Typography>

          <Typography variant="h6" component="h3" fontWeight="bold" sx={{ mt: 4, mb: 2 }}>
            2. Personal Information We Collect
          </Typography>
          <Typography variant="body1" paragraph>
            We collect information directly from you, automatically from your device and activity, and from third parties.
          </Typography>
          
          <Typography variant="body1" paragraph>
            <strong>Account and Profile</strong>
          </Typography>
          <Typography variant="body1" component="div" paragraph>
            <ul>
              <li>Name, email address, password, profile photo, business name (for Business accounts), role/title, phone number.</li>
            </ul>
          </Typography>
          
          <Typography variant="body1" paragraph>
            <strong>App Activity and Social Features</strong>
          </Typography>
          <Typography variant="body1" component="div" paragraph>
            <ul>
              <li>Saves, likes/hearts, follows, RSVPs, check-ins, comments/reviews, redemptions, shares, search queries, viewed promotions/events.</li>
            </ul>
          </Typography>
          
          <Typography variant="body1" paragraph>
            <strong>Transaction and Redemption</strong>
          </Typography>
          <Typography variant="body1" component="div" paragraph>
            <ul>
              <li>Redemption codes, timestamps, participating business/location, items or categories redeemed, quantity, price/discount (if shown), receipts or proof you upload.</li>
            </ul>
          </Typography>
          
          <Typography variant="body1" paragraph>
            <strong>Communications</strong>
          </Typography>
          <Typography variant="body1" component="div" paragraph>
            <ul>
              <li>Messages and interactions with businesses or support; preferences (e.g., opt-ins/outs).</li>
            </ul>
          </Typography>
          
          <Typography variant="body1" paragraph>
            <strong>Device and Technical</strong>
          </Typography>
          <Typography variant="body1" component="div" paragraph>
            <ul>
              <li>IP address, device IDs, OS/browser type, app version, language, time zone, crash logs, cookies/SDK data, analytics identifiers, referral/UTM, and approximate geolocation. If you enable precise location, we may collect GPS/BLE/Wi‑Fi for nearby promotions.</li>
            </ul>
          </Typography>
          
          <Typography variant="body1" paragraph>
            <strong>Marketing and Inferences</strong>
          </Typography>
          <Typography variant="body1" component="div" paragraph>
            <ul>
              <li>Segments and preferences inferred from your activity (e.g., "coffee deals," "fitness," "weekday lunch").</li>
            </ul>
          </Typography>
          
          <Typography variant="body1" paragraph>
            <strong>Third-Party Sources</strong>
          </Typography>
          <Typography variant="body1" component="div" paragraph>
            <ul>
              <li>Data from sign-in providers (e.g., Apple/Google), ad networks, analytics, or social platforms you connect.</li>
            </ul>
          </Typography>

          <Typography variant="h6" component="h3" fontWeight="bold" sx={{ mt: 4, mb: 2 }}>
            3. How We Use Information
          </Typography>
          <Typography variant="body1" paragraph>
            We use your information to:
          </Typography>
          <Typography variant="body1" component="div" paragraph>
            <ul>
              <li>Provide and operate the Service, including accounts, listings, RSVPs, saves, follows, redemptions, and check-ins.</li>
              <li>Share your information with participating businesses, as described in Section 4.</li>
              <li>Personalize content and recommendations, and measure performance of promotions/events.</li>
              <li>Communicate with you about accounts, redemptions, security alerts, and marketing (where permitted).</li>
              <li>Prevent fraud, enforce terms, secure the Service, debug, and perform analytics and product improvement.</li>
              <li>Comply with law and exercise legal claims.</li>
            </ul>
          </Typography>

          <Typography variant="h6" component="h3" fontWeight="bold" sx={{ mt: 4, mb: 2 }}>
            4. How We Share Information
          </Typography>
          <Typography variant="body1" paragraph>
            We share information in the following ways:
          </Typography>
          
          <Typography variant="body1" paragraph sx={{ mt: 3 }}>
            <strong>With Participating Businesses (Core Feature)</strong>
          </Typography>
          <Typography variant="body1" paragraph>
            When you interact with a business's promotion/event (e.g., save, like, follow, RSVP, check in, or redeem), we may share your:
          </Typography>
          <Typography variant="body1" component="div" paragraph>
            <ul>
              <li>Name</li>
              <li>Email address</li>
              <li>Relevant app activity related to that business (e.g., saves, likes, follows, RSVPs, redemptions, timestamps, counts)</li>
              <li>Any information you submit as part of the interaction (e.g., RSVP party size, comments, preferences)</li>
            </ul>
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>Purpose:</strong> So businesses can verify redemptions and RSVPs, provide customer service, 
            honor promotions, analyze performance, and send you communications consistent with law and your choices.
          </Typography>
          <Typography variant="body1" paragraph>
            Businesses are independent controllers of the data they receive from us. Their use of your information 
            is governed by their own privacy policies and practices.
          </Typography>
          
          <Typography variant="body1" paragraph sx={{ mt: 3 }}>
            <strong>Service Providers and Partners</strong>
          </Typography>
          <Typography variant="body1" component="div" paragraph>
            <ul>
              <li>Vendors that provide hosting, analytics, customer support, communications/SMS, email delivery, payment processing, security, and advertising/measurement.</li>
            </ul>
          </Typography>
          
          <Typography variant="body1" paragraph sx={{ mt: 3 }}>
            <strong>Legal, Safety, and Rights</strong>
          </Typography>
          <Typography variant="body1" component="div" paragraph>
            <ul>
              <li>To comply with law, legal process, or lawful requests; to protect the rights, safety, or property of Jax Saver, users, or others; or to enforce our terms and policies.</li>
            </ul>
          </Typography>
          
          <Typography variant="body1" paragraph sx={{ mt: 3 }}>
            <strong>Business Transfers</strong>
          </Typography>
          <Typography variant="body1" component="div" paragraph>
            <ul>
              <li>In connection with a merger, financing, acquisition, reorganization, bankruptcy, or sale of assets. We will continue to protect your data and notify you of material changes as required by law.</li>
            </ul>
          </Typography>
          
          <Typography variant="body1" paragraph sx={{ mt: 3 }}>
            <strong>With Your Direction or Consent</strong>
          </Typography>
          <Typography variant="body1" component="div" paragraph>
            <ul>
              <li>If you ask us to share or link accounts, or participate in features where sharing is part of the service.</li>
            </ul>
          </Typography>

          <Typography variant="h6" component="h3" fontWeight="bold" sx={{ mt: 4, mb: 2 }}>
            5. Your Choices and Controls
          </Typography>
          <Typography variant="body1" component="div" paragraph>
            <ul>
              <li><strong>Account Settings:</strong> Update profile info, preferences, and notification settings in the app.</li>
              <li><strong>Marketing Communications:</strong> Opt out of marketing emails via the unsubscribe link; opt out of SMS via reply "STOP". We may still send transactional messages (e.g., receipts, security).</li>
              <li><strong>Location:</strong> Disable precise location in device settings. The app may still use IP-based approximate location.</li>
              <li><strong>Cookies/Tracking:</strong> Manage browser settings and, where offered, our cookie controls. Some features may not function without certain cookies.</li>
              <li><strong>Data Sharing With Businesses:</strong> The Service is built to share your activity with businesses when you interact with them. If you do not want a business to receive your info, do not engage with that business's promotions/events. You may unfollow or delete saved items to limit future sharing.</li>
            </ul>
          </Typography>

          <Typography variant="h6" component="h3" fontWeight="bold" sx={{ mt: 4, mb: 2 }}>
            6. Retention
          </Typography>
          <Typography variant="body1" paragraph>
            We keep information for as long as necessary to provide the Service, for legitimate business 
            purposes (e.g., analytics, security, legal), and as required by law. We may anonymize or 
            aggregate data so it can no longer identify you.
          </Typography>

          <Typography variant="h6" component="h3" fontWeight="bold" sx={{ mt: 4, mb: 2 }}>
            7. Security
          </Typography>
          <Typography variant="body1" paragraph>
            We use administrative, technical, and physical safeguards designed to protect information, 
            including encryption in transit, access controls, and logging. No method of transmission or 
            storage is 100% secure.
          </Typography>

          <Typography variant="h6" component="h3" fontWeight="bold" sx={{ mt: 4, mb: 2 }}>
            8. Children's Privacy
          </Typography>
          <Typography variant="body1" paragraph>
            The Service is not directed to children under 13 (or 16 where applicable). We do not knowingly 
            collect data from children under these ages. If we learn we have, we will delete it.
          </Typography>

          <Typography variant="h6" component="h3" fontWeight="bold" sx={{ mt: 4, mb: 2 }}>
            9. International Users
          </Typography>
          <Typography variant="body1" paragraph>
            If you access the Service from outside the United States, your information may be transferred to, 
            stored, and processed in the U.S. and other countries with different data protection laws. Where 
            required, we use appropriate safeguards for cross-border transfers.
          </Typography>

          <Typography variant="h6" component="h3" fontWeight="bold" sx={{ mt: 4, mb: 2 }}>
            10. State/Regional Privacy Rights
          </Typography>
          <Typography variant="body1" paragraph>
            Depending on your location (e.g., California, Colorado, Virginia, Connecticut, Utah; EU/UK), you may have rights such as:
          </Typography>
          <Typography variant="body1" component="div" paragraph>
            <ul>
              <li>Access/know, correct, delete, and obtain a portable copy of your information.</li>
              <li>Opt out of targeted advertising, sale, or sharing for cross-context behavioral advertising.</li>
              <li>Appeal a denial of your request (where applicable).</li>
              <li>Non-discrimination for exercising your rights.</li>
            </ul>
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>How to exercise:</strong> Submit a request to privacy@jaxsaver.com with your email and 
            request type. We will verify your identity and respond within the required timeframe. Authorized 
            agents may act on your behalf subject to verification. Additional disclosures for California are 
            in Section 11.
          </Typography>

          <Typography variant="h6" component="h3" fontWeight="bold" sx={{ mt: 4, mb: 2 }}>
            11. California Privacy Notice (CPRA)
          </Typography>
          <Typography variant="body1" component="div" paragraph>
            <ul>
              <li><strong>Categories Collected:</strong> Identifiers (name, email), commercial info (redemptions, reservations), internet activity (app usage), geolocation (if enabled), inferences (segments), and sensitive data only if you provide it.</li>
              <li><strong>Sources:</strong> You, your devices, Jax Saver partners, and participating businesses.</li>
              <li><strong>Purposes:</strong> As detailed in Sections 3–4, including targeted advertising/measurement where permitted.</li>
              <li><strong>Disclosure for Business Purposes:</strong> We disclose categories above to service providers and participating businesses to provide the Service.</li>
              <li><strong>"Share" and "Sell":</strong> Some data practices for ads/analytics may be considered "sharing" or "selling" under CA law. You can opt out via "Do Not Sell or Share My Personal Information" in the app/web and by enabling a supported opt-out preference signal (e.g., GPC) where applicable.</li>
              <li><strong>Retention:</strong> As outlined in Section 6.</li>
              <li><strong>Rights:</strong> Access, delete, correct, limit sensitive PI (if applicable), and opt out of sale/sharing. Submit requests at privacy@jaxsaver.com.</li>
              <li><strong>Minors:</strong> We do not knowingly sell/share data of consumers under 16.</li>
            </ul>
          </Typography>

          <Typography variant="h6" component="h3" fontWeight="bold" sx={{ mt: 4, mb: 2 }}>
            12. Cookies, SDKs, and Ads
          </Typography>
          <Typography variant="body1" paragraph>
            We and our partners use cookies and mobile SDKs to:
          </Typography>
          <Typography variant="body1" component="div" paragraph>
            <ul>
              <li>Authenticate users, remember settings, and keep sessions secure.</li>
              <li>Measure app performance and promotion/event analytics.</li>
              <li>Personalize content and ads and perform cross-device linking where permitted.</li>
            </ul>
          </Typography>
          <Typography variant="body1" paragraph>
            Manage preferences in-app, via browser settings, or through platform ad settings (e.g., iOS 
            "Limit Ad Tracking," Android Ads Settings).
          </Typography>

          <Typography variant="h6" component="h3" fontWeight="bold" sx={{ mt: 4, mb: 2 }}>
            13. Data Relating to Businesses
          </Typography>
          <Typography variant="body1" paragraph>
            If you are a business user, we may display your business profile, contact details, and activity 
            to Consumers. We also provide aggregated or de-identified insights to businesses; you must not 
            attempt to re-identify individuals.
          </Typography>

          <Typography variant="h6" component="h3" fontWeight="bold" sx={{ mt: 4, mb: 2 }}>
            14. Third-Party Links and Services
          </Typography>
          <Typography variant="body1" paragraph>
            The Service may link to or integrate third-party sites/services. Their privacy practices are 
            governed by their policies, not ours.
          </Typography>

          <Typography variant="h6" component="h3" fontWeight="bold" sx={{ mt: 4, mb: 2 }}>
            15. Changes to This Policy
          </Typography>
          <Typography variant="body1" paragraph>
            We may update this Policy from time to time. If we make material changes, we will notify you by 
            posting the updated Policy and updating the Effective Date, and we may provide additional notice 
            (email/in-app). Your continued use means you accept the changes.
          </Typography>

          <Typography variant="h6" component="h3" fontWeight="bold" sx={{ mt: 4, mb: 2 }}>
            16. Contact Us
          </Typography>
          <Typography variant="body1" paragraph>
            Questions or requests: <strong>privacy@jaxsaver.com</strong>
          </Typography>
          <Typography variant="body1" paragraph>
            Postal: Jax Saver LLC, Attn: Privacy, Jacksonville, FL
          </Typography>

          <Divider sx={{ my: 4 }} />
          
          <Typography variant="body2" color="text.secondary" paragraph>
            © 2024 Jax Saver LLC. All rights reserved.
          </Typography>
        </Paper>
      </Container>
    </Box>
    </LandingLayout>
  );
};

export default PrivacyPolicyPage;