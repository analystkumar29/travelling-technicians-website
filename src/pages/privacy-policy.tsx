import Layout from '@/components/layout/Layout';
import Link from 'next/link';

const EFFECTIVE_DATE = 'February 6, 2026';
const VERSION = '2026-02-06-v1';

export default function PrivacyPolicyPage() {
  return (
    <Layout
      title="Privacy Policy"
      metaDescription="Privacy policy for The Travelling Technicians. Compliant with PIPEDA and BC PIPA. Learn how we collect, use, and protect your personal information."
    >
      <div className="py-16 bg-white">
        <div className="container-custom max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
            <p className="text-lg text-gray-600">
              Effective Date: {EFFECTIVE_DATE} &middot; Version: {VERSION}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Compliant with the <em>Personal Information Protection and Electronic Documents Act</em> (PIPEDA)
              and the BC <em>Personal Information Protection Act</em> (PIPA)
            </p>
          </div>

          <div className="prose prose-lg max-w-none">
            <div className="bg-primary-50 border-l-4 border-primary-400 p-6 mb-8">
              <p className="text-primary-900 font-medium">
                At The Travelling Technicians, we are committed to protecting your privacy and personal information
                in accordance with Canadian federal and provincial privacy legislation. This policy explains how we
                collect, use, and safeguard your data when you use our services.
              </p>
            </div>

            {/* 1. Information We Collect */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">Personal Information</h3>
              <p className="text-gray-700 mb-4">
                When you book our services or contact us, we may collect the following personal information:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>Full name and contact information (phone number, email address)</li>
                <li>Service address and location details</li>
                <li>Device information (brand, model, issue description)</li>
                <li>Payment information (processed securely through third-party providers)</li>
                <li>Communication records and service history</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">Device Data During Repair</h3>
              <p className="text-gray-700 mb-4">
                During the course of repairing your device, our technicians may have <strong>incidental access</strong> to
                personal data stored on your device (such as lock screen content, notification previews, or files visible
                during functionality testing). We want you to understand:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li><strong>Purpose limitation:</strong> Any data accessed is strictly for the purpose of diagnosing the reported issue and verifying the repair was successful</li>
                <li><strong>No collection or copying:</strong> We do not copy, download, photograph, transfer, or otherwise retain any personal data from your device</li>
                <li><strong>No browsing:</strong> Technicians are trained and instructed not to browse personal files, photos, messages, emails, or open applications unrelated to the repair</li>
                <li><strong>Passcode handling:</strong> If you provide a device passcode to facilitate repair, it is used solely for that purpose and is not recorded or retained after service</li>
                <li><strong>Confidentiality:</strong> All technicians are bound by confidentiality obligations regarding any information they may incidentally observe on your device</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">Automatically Collected Information</h3>
              <p className="text-gray-700 mb-4">
                When you visit our website, we may automatically collect:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>IP address and browser information</li>
                <li>Website usage patterns and page views</li>
                <li>Device type and operating system</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">Terms Acceptance Records</h3>
              <p className="text-gray-700 mb-6">
                When you book a repair and accept our Terms and Conditions, we record the version of the terms you
                accepted, along with the date, time, your IP address, and browser information. These records are
                maintained for legal compliance and audit purposes.
              </p>
            </section>

            {/* 2. How We Use Your Information */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. How We Use Your Information</h2>
              <p className="text-gray-700 mb-4">
                We use your personal information for the following purposes:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>Providing and scheduling repair services</li>
                <li>Communicating about appointments, updates, and service status</li>
                <li>Processing payments and maintaining service records</li>
                <li>Improving our services and customer experience</li>
                <li>Sending service reminders and warranty information</li>
                <li>Complying with legal obligations and resolving disputes</li>
                <li>Maintaining records of terms acceptance for legal compliance</li>
              </ul>
            </section>

            {/* 3. Information Sharing and Disclosure */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Information Sharing and Disclosure</h2>
              <p className="text-gray-700 mb-4">
                We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li><strong>Service Providers:</strong> Trusted third-party vendors who assist with payment processing (Stripe/Square), email services (SendGrid), and website hosting (Vercel, Supabase), under contractual obligations to protect your data</li>
                <li><strong>Legal Requirements:</strong> When required by law, court order, or government regulation</li>
                <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of business assets, with prior notice to affected individuals</li>
                <li><strong>Safety and Security:</strong> To protect the rights, property, or safety of our company, customers, or others</li>
              </ul>
            </section>

            {/* 4. Data Security */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Security</h2>
              <p className="text-gray-700 mb-4">
                We implement appropriate technical and organizational measures to protect your personal information:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>Secure data transmission using TLS/SSL encryption</li>
                <li>Database-level row-level security (RLS) policies to restrict data access</li>
                <li>Regular security assessments and updates</li>
                <li>Restricted access to personal information on a need-to-know basis</li>
                <li>Secure storage of physical and digital records</li>
                <li>Employee and technician training on data protection and privacy practices</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">Breach Notification</h3>
              <p className="text-gray-700 mb-4">
                In accordance with PIPEDA, s. 10.1, and the <em>Breach of Security Safeguards Regulations</em>
                (SOR/2018-64), in the event of a breach of security safeguards involving your personal information
                that creates a <strong>real risk of significant harm</strong> (RROSH), we will:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Report the breach to the <strong>Office of the Privacy Commissioner of Canada</strong> as soon as feasible</li>
                <li><strong>Notify you directly</strong> as soon as feasible, including a description of the breach, the types of personal information involved, steps we are taking to mitigate risk, and steps you can take to protect yourself</li>
                <li>Notify any other organization or government institution that may be able to reduce the risk of harm</li>
                <li>Maintain a <strong>record of every breach</strong> of security safeguards for a minimum of <strong>24 months</strong>, regardless of whether RROSH is determined, as required by PIPEDA</li>
              </ul>
              <p className="text-gray-700 mb-6">
                Where BC PIPA applies, we will also comply with any additional breach notification requirements
                under that legislation as they come into force.
              </p>
            </section>

            {/* 5. Data Retention */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Retention</h2>
              <p className="text-gray-700 mb-4">
                We retain your personal information only for as long as necessary to fulfill the purposes for which
                it was collected, or as required by law. Specific retention periods:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li><strong>Booking and service records:</strong> 7 years after the last service interaction (for tax and legal compliance)</li>
                <li><strong>Terms acceptance records:</strong> Retained indefinitely as part of our legal audit trail (document version, acceptance timestamp, and associated booking reference)</li>
                <li><strong>Device repair notes:</strong> 2 years after service completion, then anonymized or deleted</li>
                <li><strong>Payment records:</strong> 7 years (as required by Canada Revenue Agency)</li>
                <li><strong>Warranty records:</strong> Duration of the warranty period plus 1 year</li>
                <li><strong>Website analytics data:</strong> 26 months</li>
                <li><strong>Breach records:</strong> Minimum 24 months, as required by PIPEDA</li>
              </ul>
              <p className="text-gray-700 mb-6">
                After the applicable retention period, personal information is securely deleted or anonymized.
                You may request earlier deletion of your data, subject to our legal obligations (see Section 6).
              </p>
            </section>

            {/* 6. Your Rights and Choices */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Your Rights and Choices</h2>
              <p className="text-gray-700 mb-4">
                Under PIPEDA and BC PIPA, you have the following rights regarding your personal information:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li><strong>Access (PIPEDA s. 4.9; PIPA s. 23):</strong> Request a copy of the personal information we hold about you. We will respond within 30 days</li>
                <li><strong>Correction (PIPEDA s. 4.9.5; PIPA s. 24):</strong> Request correction of inaccurate or incomplete information</li>
                <li><strong>Withdrawal of Consent (PIPEDA s. 4.3.8; PIPA s. 9):</strong> Withdraw your consent to the collection, use, or disclosure of your personal information, subject to legal or contractual restrictions. We will inform you of the implications of withdrawal</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information, subject to our legal retention obligations</li>
                <li><strong>Complaint:</strong> File a complaint with us or with the applicable privacy commissioner (see Section 11)</li>
              </ul>
              <p className="text-gray-700 mb-6">
                To exercise any of these rights, please contact us using the information provided in Section 11.
                We will verify your identity before processing any request and will respond within 30 days.
              </p>
            </section>

            {/* 7. Cookies and Tracking Technologies */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Cookies and Tracking Technologies</h2>
              <p className="text-gray-700 mb-4">
                Our website uses cookies and similar technologies to enhance your experience:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li><strong>Essential Cookies:</strong> Required for website functionality and security</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how visitors use our website</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences (e.g., saved location for booking)</li>
              </ul>
              <p className="text-gray-700 mb-6">
                You can control cookie settings through your browser, though disabling certain cookies may affect website functionality.
              </p>
            </section>

            {/* 8. Third-Party Services */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Third-Party Services</h2>
              <p className="text-gray-700 mb-4">
                Our website and services integrate with third-party providers, each with their own privacy policies:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li><strong>Payment processors</strong> for secure transaction handling</li>
                <li><strong>OpenStreetMap / Leaflet</strong> for location and map services</li>
                <li><strong>SendGrid</strong> for email communications</li>
                <li><strong>Supabase</strong> for secure data storage</li>
                <li><strong>Vercel</strong> for website hosting</li>
              </ul>
              <p className="text-gray-700 mb-6">
                We are not responsible for the privacy practices of these third parties and encourage you to review
                their respective privacy policies. All third-party providers are contractually required to protect
                your personal information.
              </p>
            </section>

            {/* 9. Children's Privacy */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Children&apos;s Privacy</h2>
              <p className="text-gray-700 mb-6">
                Our services are not directed to children under 13 years of age. We do not knowingly collect
                personal information from children under 13. If we become aware that we have collected such information,
                we will take steps to delete it promptly. If you believe we have inadvertently collected information
                from a child, please contact us immediately.
              </p>
            </section>

            {/* 10. Changes to This Privacy Policy */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Changes to This Privacy Policy</h2>
              <p className="text-gray-700 mb-6">
                We may update this Privacy Policy from time to time to reflect changes in our practices or
                applicable laws. When we do, we will post the updated policy on our website with a new version
                number and effective date. For material changes, we will provide at least 30 days&apos; notice
                through our website or via email. Changes do not apply retroactively. Previous versions of this
                policy are available upon request.
              </p>
            </section>

            {/* 11. Contact Information & Complaints */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Contact Information and Complaints</h2>
              <p className="text-gray-700 mb-4">
                If you have questions about this Privacy Policy, wish to exercise your privacy rights, or have
                concerns about how we handle your personal information, please contact us:
              </p>
              <div className="bg-gray-50 p-6 rounded-lg mb-6">
                <div className="space-y-2">
                  <p><strong>The Travelling Technicians &mdash; Privacy Inquiries</strong></p>
                  <p>Email: <a href="mailto:privacy@travellingtechnicians.ca" className="text-primary-600 hover:text-primary-800">privacy@travellingtechnicians.ca</a></p>
                  <p>Phone: <a href="tel:+16048495329" className="text-primary-600 hover:text-primary-800">(604) 849-5329</a></p>
                  <p>Service Area: Lower Mainland, British Columbia, Canada</p>
                </div>
              </div>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">Filing a Complaint</h3>
              <p className="text-gray-700 mb-4">
                If you are not satisfied with our response to your privacy concern, you have the right to file
                a complaint with the applicable privacy commissioner:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li><strong>Federal:</strong> Office of the Privacy Commissioner of Canada &mdash;{' '}
                  <a href="https://www.priv.gc.ca" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-800 underline">www.priv.gc.ca</a>{' '}
                  &mdash; 1-800-282-1376</li>
                <li><strong>British Columbia:</strong> Office of the Information and Privacy Commissioner for BC &mdash;{' '}
                  <a href="https://www.oipc.bc.ca" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-800 underline">www.oipc.bc.ca</a>{' '}
                  &mdash; 250-387-5629</li>
              </ul>
            </section>

            <div className="bg-amber-50 border-l-4 border-amber-400 p-6 mt-8">
              <p className="text-amber-900 font-medium">
                <strong>Legal Framework:</strong> This Privacy Policy is governed by the <em>Personal Information
                Protection and Electronic Documents Act</em> (PIPEDA) at the federal level, and the
                BC <em>Personal Information Protection Act</em> (PIPA) at the provincial level. Where there is a
                conflict between federal and provincial legislation, the legislation that provides the greater
                protection for your personal information will apply.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link href="/" className="btn-primary mr-4">
              Back to Home
            </Link>
            <Link href="/contact" className="btn-outline">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
