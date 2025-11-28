import React from 'react';
import { Box, Container, Typography, Paper, Divider } from '@mui/material';
import { usePageTitle } from '../hooks/usePageTitle';
import { LandingLayout } from '../layouts/LandingLayout';

const TermsPage: React.FC = () => {
  usePageTitle('Terms of Service');

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
            Terms of Service
          </Typography>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            <strong>Effective Date: September 16, 2024</strong>
          </Typography>
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="h5" component="h2" fontWeight="bold" gutterBottom>
            Welcome to Jax Saver!
          </Typography>
          <Typography variant="body1" paragraph>
            These Terms of Service ("Terms") govern your access to and use of the Jax Saver platform, website, 
            and mobile applications (collectively, the "Service") operated by Jax Saver LLC ("Jax Saver," "we," 
            "us," or "our"). By creating an account, accessing, or using the Service, you agree to be bound by 
            these Terms. If you are entering into these Terms on behalf of a company or other legal entity, you 
            represent that you have authority to bind that entity. If you do not agree, do not use the Service.
          </Typography>

          <Typography variant="h6" component="h3" fontWeight="bold" sx={{ mt: 4, mb: 2 }}>
            1. Definitions
          </Typography>
          <Typography variant="body1" component="div" paragraph>
            <ul>
              <li><strong>"Business"</strong> means a business customer that creates a Business Account to publish Promotions or Events.</li>
              <li><strong>"Consumer"</strong> means an individual user accessing promotions, events, and savings features.</li>
              <li><strong>"Promotion"</strong> means a business offer, deal, discount, coupon, or incentive published via the Service.</li>
              <li><strong>"Event"</strong> means a business event (e.g., sale, special occasion, in-store/online event) published via the Service.</li>
              <li><strong>"Content"</strong> means any data, text, images, graphics, videos, links, offers, promotions, events, profiles, ratings, or other materials posted, uploaded, or transmitted via the Service.</li>
              <li><strong>"You"</strong> and <strong>"your"</strong> mean the party using the Service, including both Businesses and Consumers as context requires.</li>
            </ul>
          </Typography>

          <Typography variant="h6" component="h3" fontWeight="bold" sx={{ mt: 4, mb: 2 }}>
            2. Eligibility
          </Typography>
          <Typography variant="body1" component="div" paragraph>
            <ul>
              <li>You must be at least 18 years old to use the Service.</li>
              <li>Businesses must be duly organized, validly existing, and in good standing in their jurisdiction, and have all licenses, permits, and authorizations to advertise promotions and events as posted.</li>
            </ul>
          </Typography>

          <Typography variant="h6" component="h3" fontWeight="bold" sx={{ mt: 4, mb: 2 }}>
            3. Account Registration and Security
          </Typography>
          <Typography variant="body1" component="div" paragraph>
            <ul>
              <li><strong>Accurate Information:</strong> You agree to provide accurate, current, and complete information during registration and to keep it updated.</li>
              <li><strong>Credentials:</strong> You are responsible for safeguarding your login credentials. You must notify us immediately of any unauthorized use.</li>
              <li><strong>Account Types:</strong> Businesses must register a Business Account to post Promotions and Events; Consumers may register a Consumer Account to save, redeem, and follow.</li>
              <li><strong>Verification:</strong> We may require verification of Business identity, ownership, or authorization. We may refuse, suspend, or terminate accounts that fail verification or violate these Terms.</li>
            </ul>
          </Typography>

          <Typography variant="h6" component="h3" fontWeight="bold" sx={{ mt: 4, mb: 2 }}>
            4. Use of the Service
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>License to You:</strong> Subject to these Terms, we grant you a limited, non-exclusive, 
            non-transferable, revocable license to access and use the Service for its intended purpose.
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>Prohibited Uses:</strong> You will not:
          </Typography>
          <Typography variant="body1" component="div" paragraph>
            <ul>
              <li>Upload unlawful, misleading, deceptive, fraudulent, defamatory, or infringing Content.</li>
              <li>Post Promotions that are deceptive or otherwise prohibited by law (e.g., bait-and-switch, false reference pricing).</li>
              <li>Post Promotions for illegal products/services or those requiring special notices without including those notices.</li>
              <li>Engage in spam, scraping, automated data collection, reverse engineering, or attempts to bypass security.</li>
              <li>Misuse redemption mechanisms or interfere with other users' use of the Service.</li>
            </ul>
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>Local Compliance:</strong> You are solely responsible for compliance with all applicable laws, 
            rules, and regulations (including consumer protection, privacy, advertising, pricing, couponing, and 
            promotional law) in every jurisdiction where your Promotion or Event appears or is redeemable.
          </Typography>

          <Typography variant="h6" component="h3" fontWeight="bold" sx={{ mt: 4, mb: 2 }}>
            5. Business Promotions and Events
          </Typography>
          <Typography variant="body1" component="div" paragraph>
            <ul>
              <li><strong>Accuracy and Availability:</strong> Businesses must ensure all Promotions and Events are accurate, current, and honorable. If inventory or capacity is limited, clearly disclose limitations and terms.</li>
              <li><strong>Disclosures:</strong> Businesses must include required disclosures, eligibility restrictions, expiration dates, blackout dates, geographical restrictions, and redemption instructions. If purchase is required, state it clearly.</li>
              <li><strong>Pricing and Comparatives:</strong> Any "before" prices, discounts, or savings claims must be truthful, substantiated, and consistent with applicable law.</li>
              <li><strong>Redemption:</strong> Jax Saver may provide redemption codes or mechanisms. Businesses are responsible for honoring valid redemptions presented according to the published terms.</li>
              <li><strong>Modifications:</strong> Businesses may modify or end a Promotion/Event prospectively. Changes do not affect Consumers who have already saved or redeemed unless required by law. Material changes should be clearly communicated in the listing.</li>
              <li><strong>Prohibited Categories:</strong> Without prior written approval, Promotions may not include: illegal products/services; adult services; weapons; recreational drugs; pharmaceuticals requiring prescriptions; medical claims; multilevel marketing; payday lending; counterfeit goods; or any category we designate as prohibited.</li>
            </ul>
          </Typography>

          <Typography variant="h6" component="h3" fontWeight="bold" sx={{ mt: 4, mb: 2 }}>
            6. Content Ownership and Licenses
          </Typography>
          <Typography variant="body1" component="div" paragraph>
            <ul>
              <li><strong>Your Content:</strong> You retain ownership of Content you submit. You grant Jax Saver a worldwide, non-exclusive, royalty-free, sublicensable, transferable license to host, store, reproduce, modify, adapt, publish, translate, distribute, publicly display, and otherwise use your Content for operating, improving, marketing, and promoting the Service, including through third-party channels and advertising.</li>
              <li><strong>Consumer Content:</strong> Reviews, follows, saved items, and feedback are user Content. We do not endorse user opinions.</li>
              <li><strong>Representation and Warranty:</strong> You represent that you have all rights necessary to grant the above license and that your Content does not infringe, misappropriate, or violate rights of any person or entity, including intellectual property, privacy, or publicity rights.</li>
              <li><strong>Feedback:</strong> If you provide feedback or suggestions, you grant us a perpetual, irrevocable, royalty-free license to use it without restriction or compensation.</li>
            </ul>
          </Typography>

          <Typography variant="h6" component="h3" fontWeight="bold" sx={{ mt: 4, mb: 2 }}>
            7. IP Infringement and DMCA
          </Typography>
          <Typography variant="body1" paragraph>
            We respect intellectual property rights. If you believe Content infringes your copyright, submit a 
            notice with: (a) your contact info, (b) identification of the work, (c) identification of the 
            infringing material and its location, (d) a statement of good-faith belief, (e) a statement under 
            penalty of perjury of accuracy and authority, and (f) your signature.
          </Typography>
          <Typography variant="body1" paragraph>
            Send notices to: <strong>legal@jaxsaver.com</strong>. We may remove or disable Content and may terminate repeat infringers.
          </Typography>

          <Typography variant="h6" component="h3" fontWeight="bold" sx={{ mt: 4, mb: 2 }}>
            8. Fees, Payments, and Subscriptions
          </Typography>
          <Typography variant="body1" component="div" paragraph>
            <ul>
              <li><strong>Pricing:</strong> Some features may require paid plans or fees (e.g., subscription tiers, featured placement, impressions, redemption fees). Current rates will be disclosed at purchase or in your plan.</li>
              <li><strong>Billing and Auto-Renewal:</strong> Paid subscriptions renew automatically for successive periods unless canceled before the renewal date. You authorize recurring charges to your payment method on file.</li>
              <li><strong>Cancellations:</strong> You may cancel effective at the end of your current billing period unless otherwise stated. Certain promotional plans may have minimum terms.</li>
              <li><strong>Taxes:</strong> Fees exclude taxes unless stated. You are responsible for applicable taxes, duties, and government charges.</li>
              <li><strong>Late Payments:</strong> We may suspend or downgrade service for non-payment. You agree to pay reasonable costs of collection where permitted by law.</li>
              <li><strong>Refunds:</strong> Except where required by law or a specific plan, fees are non-refundable.</li>
            </ul>
          </Typography>

          <Typography variant="h6" component="h3" fontWeight="bold" sx={{ mt: 4, mb: 2 }}>
            9. Data, Privacy, and Communications
          </Typography>
          <Typography variant="body1" component="div" paragraph>
            <ul>
              <li><strong>Privacy:</strong> Our Privacy Policy explains how we collect, use, and share personal data. By using the Service, you consent to our data practices.</li>
              <li><strong>Business Data:</strong> We may provide Businesses with aggregated or de-identified insights. Do not attempt to re-identify users.</li>
              <li><strong>Communications:</strong> You consent to receive transactional and promotional communications via email, in-app, SMS, or push notifications, consistent with applicable law. You may opt out of certain communications, but we may still send transactional or account notices.</li>
              <li><strong>Third-Party Services:</strong> The Service may integrate with third-party services or platforms. Your use of those is governed by their terms and policies. We are not responsible for third-party services.</li>
            </ul>
          </Typography>

          <Typography variant="h6" component="h3" fontWeight="bold" sx={{ mt: 4, mb: 2 }}>
            10. Rankings, Featured Placement, and Algorithms
          </Typography>
          <Typography variant="body1" component="div" paragraph>
            <ul>
              <li>We may rank, sort, recommend, or feature Promotions and Events based on factors such as relevance, proximity, engagement, quality signals, timeliness, paid placement, and our editorial judgment.</li>
              <li>We may test changes and conduct experiments that may affect display, reach, or performance.</li>
            </ul>
          </Typography>

          <Typography variant="h6" component="h3" fontWeight="bold" sx={{ mt: 4, mb: 2 }}>
            11. Consumer Interactions and Disputes
          </Typography>
          <Typography variant="body1" component="div" paragraph>
            <ul>
              <li>Businesses are solely responsible for their products, services, Promotions, Events, and customer service. Jax Saver is not a party to transactions between Businesses and Consumers and does not guarantee redemption or outcomes.</li>
              <li>Disputes between a Business and a Consumer must be resolved by those parties. We may, but are not obligated to, assist.</li>
            </ul>
          </Typography>

          <Typography variant="h6" component="h3" fontWeight="bold" sx={{ mt: 4, mb: 2 }}>
            12. Compliance and Legal Requirements
          </Typography>
          <Typography variant="body1" component="div" paragraph>
            <ul>
              <li>You must comply with advertising, promotions, coupon, gift certificate, unfair/deceptive acts, privacy, data security, email/SMS marketing, and any sector-specific laws in applicable jurisdictions, including required disclosures and any state/federal/local rules (e.g., CAN-SPAM, TCPA, state automatic renewal laws, pricing disclosure rules).</li>
              <li>Alcohol, tobacco, cannabis, health claims, and age-restricted categories have additional legal requirements. You must implement lawful age gates and geographic restrictions where applicable.</li>
            </ul>
          </Typography>

          <Typography variant="h6" component="h3" fontWeight="bold" sx={{ mt: 4, mb: 2 }}>
            13. Termination and Suspension
          </Typography>
          <Typography variant="body1" component="div" paragraph>
            <ul>
              <li><strong>By You:</strong> You may stop using the Service and request account deletion. Termination of a paid plan is governed by Section 8.</li>
              <li><strong>By Us:</strong> We may suspend or terminate your account, remove Content, or restrict access at our discretion for violations of these Terms, legal risk, non-payment, inactivity, or harmful conduct.</li>
              <li><strong>Effect of Termination:</strong> Sections intended to survive (e.g., IP, disclaimers, limitation of liability, indemnity, arbitration) will survive. We may retain Content and data as required or permitted by law.</li>
            </ul>
          </Typography>

          <Typography variant="h6" component="h3" fontWeight="bold" sx={{ mt: 4, mb: 2 }}>
            14. Disclaimers
          </Typography>
          <Typography variant="body1" component="div" paragraph>
            <ul>
              <li><strong>As-Is:</strong> The Service and Content are provided "AS IS" and "AS AVAILABLE." We disclaim all warranties, express or implied, including merchantability, fitness for a particular purpose, non-infringement, and accuracy.</li>
              <li><strong>No Guarantee:</strong> We do not warrant that Promotions will be redeemed, that Events will have attendance, or that the Service will be uninterrupted, timely, secure, or error-free.</li>
              <li><strong>Third-Party Content:</strong> We do not endorse or assume responsibility for third-party Content or websites.</li>
            </ul>
          </Typography>

          <Typography variant="h6" component="h3" fontWeight="bold" sx={{ mt: 4, mb: 2 }}>
            15. Limitation of Liability
          </Typography>
          <Typography variant="body1" component="div" paragraph>
            <ul>
              <li>To the maximum extent permitted by law, Jax Saver and its affiliates, officers, directors, employees, and agents will not be liable for indirect, incidental, special, consequential, exemplary, or punitive damages, or loss of profits, revenues, data, goodwill, or business opportunity, arising out of or related to the Service or these Terms.</li>
              <li>Our aggregate liability for any claim will not exceed the greater of: (a) the amount you paid to us in the 6 months preceding the event giving rise to the claim, or (b) $100.</li>
              <li>Some jurisdictions do not allow certain limitations; in those cases, the limitation applies to the fullest extent permitted.</li>
            </ul>
          </Typography>

          <Typography variant="h6" component="h3" fontWeight="bold" sx={{ mt: 4, mb: 2 }}>
            16. Indemnification
          </Typography>
          <Typography variant="body1" paragraph>
            You agree to defend, indemnify, and hold harmless Jax Saver and its affiliates, officers, directors, 
            employees, and agents from and against any claims, liabilities, damages, losses, and expenses (including 
            reasonable attorneys' fees) arising out of or related to: (a) your use of the Service; (b) your 
            Promotions, Events, or Content; (c) your violation of these Terms or law; or (d) your interactions 
            with Consumers.
          </Typography>

          <Typography variant="h6" component="h3" fontWeight="bold" sx={{ mt: 4, mb: 2 }}>
            17. Changes to the Service and Terms
          </Typography>
          <Typography variant="body1" component="div" paragraph>
            <ul>
              <li>We may modify or discontinue the Service or features at any time.</li>
              <li>We may update these Terms by posting the revised version and updating the "Effective Date." Material changes may be notified via email or in-app. Your continued use after changes means you accept the updated Terms.</li>
            </ul>
          </Typography>

          <Typography variant="h6" component="h3" fontWeight="bold" sx={{ mt: 4, mb: 2 }}>
            18. Beta Features and Trials
          </Typography>
          <Typography variant="body1" paragraph>
            We may offer beta or trial features. They are provided "as is," may be subject to additional terms, 
            and may be modified or discontinued at any time.
          </Typography>

          <Typography variant="h6" component="h3" fontWeight="bold" sx={{ mt: 4, mb: 2 }}>
            19. Governing Law; Dispute Resolution; Arbitration
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>Governing Law:</strong> These Terms are governed by the laws of the State of Florida, 
            without regard to conflict of law rules.
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>Informal Resolution:</strong> Before filing a claim, you agree to try to resolve disputes 
            with us informally by contacting support at <strong>support@jaxsaver.com</strong> and allowing 30 days for a response.
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>Binding Arbitration and Class Action Waiver:</strong>
          </Typography>
          <Typography variant="body1" component="div" paragraph>
            <ul>
              <li>Any dispute arising out of or relating to these Terms or the Service will be resolved by binding arbitration administered by the American Arbitration Association (AAA) under its rules.</li>
              <li>You and Jax Saver agree to bring claims only in your individual capacities and not as plaintiffs or class members in any class or representative proceeding. The arbitrator may not consolidate claims without consent.</li>
              <li><strong>Opt-Out:</strong> You may opt out of arbitration within 30 days of account creation by sending written notice to <strong>legal@jaxsaver.com</strong>.</li>
            </ul>
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>Venue for Non-Arbitrable Claims:</strong> For claims that cannot be arbitrated, the exclusive 
            venue will be the state or federal courts located in Duval County, Florida, and you consent to their jurisdiction.
          </Typography>

          <Typography variant="h6" component="h3" fontWeight="bold" sx={{ mt: 4, mb: 2 }}>
            20. International Use
          </Typography>
          <Typography variant="body1" component="div" paragraph>
            <ul>
              <li>We make no representation that the Service is appropriate or available in all locations. You are responsible for compliance with local laws.</li>
              <li>If you are in the EU, UK, or other regions with specific consumer rights, you may have additional mandatory rights that prevail over conflicting provisions.</li>
            </ul>
          </Typography>

          <Typography variant="h6" component="h3" fontWeight="bold" sx={{ mt: 4, mb: 2 }}>
            21. Notices
          </Typography>
          <Typography variant="body1" component="div" paragraph>
            <ul>
              <li>Legal notices to Jax Saver LLC must be sent to: Attn: Legal, and via email to <strong>legal@jaxsaver.com</strong>.</li>
              <li>We may provide notices to you via the Service, email, or your account contact information.</li>
            </ul>
          </Typography>

          <Typography variant="h6" component="h3" fontWeight="bold" sx={{ mt: 4, mb: 2 }}>
            22. Entire Agreement
          </Typography>
          <Typography variant="body1" paragraph>
            These Terms, along with any order forms, plan-specific terms, and our Privacy Policy, constitute the 
            entire agreement between you and Jax Saver regarding the Service and supersede prior agreements on the subject.
          </Typography>

          <Typography variant="h6" component="h3" fontWeight="bold" sx={{ mt: 4, mb: 2 }}>
            23. Severability; Waiver
          </Typography>
          <Typography variant="body1" paragraph>
            If any provision is found unenforceable, the remaining provisions remain in full force. Our failure 
            to enforce a provision is not a waiver of our right to do so later.
          </Typography>

          <Typography variant="h6" component="h3" fontWeight="bold" sx={{ mt: 4, mb: 2 }}>
            24. Assignment
          </Typography>
          <Typography variant="body1" paragraph>
            You may not assign or transfer these Terms without our prior written consent. We may assign these 
            Terms in connection with a merger, acquisition, sale of assets, or by operation of law.
          </Typography>

          <Typography variant="h6" component="h3" fontWeight="bold" sx={{ mt: 4, mb: 2 }}>
            25. Contact
          </Typography>
          <Typography variant="body1" paragraph>
            For questions about these Terms, contact: <strong>legal@jaxsaver.com</strong> or <strong>support@jaxsaver.com</strong>.
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

export default TermsPage;