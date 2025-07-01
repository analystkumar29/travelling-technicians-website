import Layout from '@/components/layout/Layout';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <Layout 
      title="Privacy Policy"
      metaDescription="Our privacy policy explains how we collect, use, and protect your personal information when you use our mobile and laptop repair services."
    >
      <div className="py-16 bg-white">
        <div className="container-custom max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
            <p className="text-lg text-gray-600">
              Last updated: {new Date().toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="prose prose-lg max-w-none">
            <div className="bg-blue-50 border-l-4 border-blue-400 p-6 mb-8">
              <p className="text-blue-800 font-medium">
                At The Travelling Technicians, we are committed to protecting your privacy and personal information. 
                This policy explains how we collect, use, and safeguard your data when you use our services.
              </p>
            </div>

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
            </section>

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
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Information Sharing and Disclosure</h2>
              <p className="text-gray-700 mb-4">
                We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li><strong>Service Providers:</strong> Trusted third-party vendors who assist with payment processing, email services, and website hosting</li>
                <li><strong>Legal Requirements:</strong> When required by law, court order, or government regulation</li>
                <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of business assets</li>
                <li><strong>Safety and Security:</strong> To protect the rights, property, or safety of our company, customers, or others</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Security</h2>
              <p className="text-gray-700 mb-4">
                We implement appropriate technical and organizational measures to protect your personal information:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>Secure data transmission using SSL encryption</li>
                <li>Regular security assessments and updates</li>
                <li>Restricted access to personal information on a need-to-know basis</li>
                <li>Secure storage of physical and digital records</li>
                <li>Employee training on data protection and privacy practices</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Retention</h2>
              <p className="text-gray-700 mb-4">
                We retain your personal information for as long as necessary to:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>Provide ongoing services and support</li>
                <li>Honor warranty obligations</li>
                <li>Comply with legal and regulatory requirements</li>
                <li>Resolve disputes and enforce agreements</li>
              </ul>
              <p className="text-gray-700 mb-6">
                Typically, we retain customer information for 7 years after the last service interaction, 
                unless a longer retention period is required by law.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Your Rights and Choices</h2>
              <p className="text-gray-700 mb-4">
                You have the following rights regarding your personal information:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal requirements)</li>
                <li><strong>Objection:</strong> Object to certain processing of your personal information</li>
                <li><strong>Portability:</strong> Request transfer of your data to another service provider</li>
              </ul>
              <p className="text-gray-700 mb-6">
                To exercise any of these rights, please contact us using the information provided below.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Cookies and Tracking Technologies</h2>
              <p className="text-gray-700 mb-4">
                Our website uses cookies and similar technologies to enhance your experience:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li><strong>Essential Cookies:</strong> Required for website functionality and security</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how visitors use our website</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
              </ul>
              <p className="text-gray-700 mb-6">
                You can control cookie settings through your browser, though disabling certain cookies may affect website functionality.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Third-Party Services</h2>
              <p className="text-gray-700 mb-4">
                Our website may contain links to third-party services with their own privacy policies:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>Payment processors for secure transaction handling</li>
                <li>Google Maps for location services</li>
                <li>Email service providers for communications</li>
              </ul>
              <p className="text-gray-700 mb-6">
                We are not responsible for the privacy practices of these third parties and encourage you to review their policies.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Children's Privacy</h2>
              <p className="text-gray-700 mb-6">
                Our services are not directed to children under 13 years of age. We do not knowingly collect 
                personal information from children under 13. If we become aware that we have collected such information, 
                we will take steps to delete it promptly.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Changes to This Privacy Policy</h2>
              <p className="text-gray-700 mb-6">
                We may update this privacy policy from time to time to reflect changes in our practices or 
                applicable laws. We will post the updated policy on our website and update the "last modified" 
                date at the top of this page. For significant changes, we may provide additional notice through 
                email or our website.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Contact Information</h2>
              <p className="text-gray-700 mb-4">
                If you have questions about this privacy policy or how we handle your personal information, please contact us:
              </p>
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="space-y-2">
                  <p><strong>The Travelling Technicians</strong></p>
                  <p>Email: <a href="mailto:privacy@travellingtechnicians.ca" className="text-primary-600 hover:text-primary-800">privacy@travellingtechnicians.ca</a></p>
                  <p>Phone: <a href="tel:+17783899251" className="text-primary-600 hover:text-primary-800">(778) 389-9251</a></p>
                  <p>Service Area: Lower Mainland, British Columbia, Canada</p>
                </div>
              </div>
            </section>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mt-8">
              <p className="text-yellow-800 font-medium">
                <strong>Note:</strong> This privacy policy is governed by the laws of British Columbia, Canada. 
                If you have concerns about our privacy practices that we cannot resolve, you may contact the 
                Office of the Privacy Commissioner of Canada.
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