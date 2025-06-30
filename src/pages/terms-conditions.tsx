import Layout from '@/components/layout/Layout';
import Link from 'next/link';

export default function TermsConditionsPage() {
  return (
    <Layout 
      title="Terms and Conditions"
      metaDescription="Terms and conditions for using The Travelling Technicians mobile and laptop repair services in the Lower Mainland, BC."
    >
      <div className="py-16 bg-white">
        <div className="container-custom max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms and Conditions</h1>
            <p className="text-lg text-gray-600">
              Last updated: {new Date().toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="prose prose-lg max-w-none">
            <div className="bg-blue-50 border-l-4 border-blue-400 p-6 mb-8">
              <p className="text-blue-800 font-medium">
                Please read these terms and conditions carefully before using our services. By booking a repair or using our website, 
                you agree to be bound by these terms.
              </p>
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 mb-4">
                By accessing our website, booking our services, or otherwise engaging with The Travelling Technicians, 
                you acknowledge that you have read, understood, and agree to be bound by these terms and conditions, 
                along with our Privacy Policy.
              </p>
              <p className="text-gray-700 mb-6">
                If you do not agree with any part of these terms, you must not use our services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Service Description</h2>
              <p className="text-gray-700 mb-4">
                The Travelling Technicians provides mobile device and laptop repair services at customer locations 
                throughout the Lower Mainland, British Columbia. Our services include but are not limited to:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>Mobile phone and tablet screen replacement and repair</li>
                <li>Battery replacement for mobile devices and laptops</li>
                <li>Charging port and audio component repairs</li>
                <li>Laptop hardware repairs and upgrades</li>
                <li>Software troubleshooting and virus removal</li>
                <li>Data recovery services (where technically feasible)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Booking and Appointments</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Appointment Scheduling</h3>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>All services must be booked in advance through our website or by phone</li>
                <li>Appointment times are estimated and may be subject to change due to traffic or previous service delays</li>
                <li>A responsible adult (18+) must be present during the service appointment</li>
                <li>We will provide notification when our technician is en route to your location</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">Cancellation Policy</h3>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>Appointments can be cancelled or rescheduled with at least 2 hours notice</li>
                <li>Late cancellations (less than 2 hours notice) may incur a $25 service fee</li>
                <li>No-shows will be charged a $50 fee</li>
                <li>We reserve the right to cancel appointments due to weather, safety concerns, or other unforeseen circumstances</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Pricing and Payment</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Service Pricing</h3>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>All prices quoted are estimates based on standard repair costs</li>
                <li>Final pricing will be confirmed before work begins</li>
                <li>Additional charges may apply for complex repairs or premium parts</li>
                <li>Travel fees may apply for locations outside our standard service area</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">Payment Terms</h3>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>Payment is due upon completion of service</li>
                <li>We accept cash, credit cards, and e-transfer</li>
                <li>A diagnostic fee may apply if repair is declined after assessment</li>
                <li>Prices include applicable taxes unless otherwise stated</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Warranty and Guarantee</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Standard Warranty</h3>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>All repairs come with a 90-day warranty on parts and workmanship</li>
                <li>Premium service tier includes extended 180-day warranty</li>
                <li>Warranty covers defects in parts or installation errors</li>
                <li>Warranty does not cover damage caused by misuse, accidents, or normal wear</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">Warranty Limitations</h3>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>Water damage repairs carry a reduced 30-day warranty</li>
                <li>Data recovery services are not guaranteed and carry no warranty</li>
                <li>Third-party software installations are provided as-is</li>
                <li>Warranty is void if device is opened or repaired by another party</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Customer Responsibilities</h2>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>Provide accurate device information and problem description</li>
                <li>Back up important data before service (we recommend regular backups)</li>
                <li>Remove all personal items and cases from devices</li>
                <li>Provide safe and accessible work environment for technicians</li>
                <li>Be present during the service appointment</li>
                <li>Test repaired device before technician departure</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Limitation of Liability</h2>
              <p className="text-gray-700 mb-4">
                To the maximum extent permitted by law:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>Our total liability for any claim shall not exceed the amount paid for the specific service</li>
                <li>We are not liable for data loss, business interruption, or consequential damages</li>
                <li>We do not guarantee data recovery and are not liable for lost data</li>
                <li>Liability for device damage is limited to repair or replacement cost</li>
                <li>We are not responsible for software compatibility issues after hardware repairs</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Intellectual Property</h2>
              <p className="text-gray-700 mb-4">
                All content on our website, including text, graphics, logos, and software, is the property of 
                The Travelling Technicians and is protected by copyright and other intellectual property laws.
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>You may not reproduce, distribute, or create derivative works without written permission</li>
                <li>Our business name, logo, and branding are protected trademarks</li>
                <li>Customer reviews and testimonials may be used for marketing purposes</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Privacy and Data Protection</h2>
              <p className="text-gray-700 mb-4">
                We are committed to protecting your privacy and personal information. Please review our 
                <Link href="/privacy-policy" className="text-primary-600 hover:text-primary-800 underline">Privacy Policy</Link> 
                for detailed information about how we collect, use, and protect your data.
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>Customer information is kept confidential and secure</li>
                <li>Device data may be viewed only as necessary for repair purposes</li>
                <li>We do not intentionally access or copy personal files</li>
                <li>Customer data is retained according to our privacy policy</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Force Majeure</h2>
              <p className="text-gray-700 mb-6">
                We shall not be liable for any failure or delay in performance due to circumstances beyond our 
                reasonable control, including but not limited to acts of God, natural disasters, strikes, 
                government regulations, pandemics, or other emergencies.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Dispute Resolution</h2>
              <p className="text-gray-700 mb-4">
                In the event of a dispute:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>We encourage direct communication to resolve issues amicably</li>
                <li>Disputes will first be addressed through good faith negotiation</li>
                <li>If necessary, disputes may be resolved through mediation or arbitration</li>
                <li>These terms are governed by the laws of British Columbia, Canada</li>
                <li>Any legal proceedings must be brought in the courts of British Columbia</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Termination</h2>
              <p className="text-gray-700 mb-6">
                We reserve the right to refuse service or terminate our relationship with customers who violate 
                these terms, engage in abusive behavior, or pose safety risks to our technicians. Upon termination, 
                all outstanding fees become immediately due and payable.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Modifications to Terms</h2>
              <p className="text-gray-700 mb-6">
                We reserve the right to modify these terms at any time. Changes will be posted on our website 
                with an updated effective date. Continued use of our services after changes constitutes acceptance 
                of the modified terms. For significant changes, we may provide additional notice through email 
                or our website.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Severability</h2>
              <p className="text-gray-700 mb-6">
                If any provision of these terms is found to be unenforceable or invalid, the remaining provisions 
                will continue in full force and effect. The invalid provision will be replaced with a valid 
                provision that most closely achieves the original intent.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">15. Contact Information</h2>
              <p className="text-gray-700 mb-4">
                If you have questions about these terms and conditions, please contact us:
              </p>
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="space-y-2">
                  <p><strong>The Travelling Technicians</strong></p>
                  <p>Email: <a href="mailto:info@travellingtechnicians.ca" className="text-primary-600 hover:text-primary-800">info@travellingtechnicians.ca</a></p>
                  <p>Phone: <a href="tel:+17783899251" className="text-primary-600 hover:text-primary-800">(778) 389-9251</a></p>
                  <p>Service Area: Lower Mainland, British Columbia, Canada</p>
                </div>
              </div>
            </section>

            <div className="bg-green-50 border-l-4 border-green-400 p-6 mt-8">
              <p className="text-green-800 font-medium">
                <strong>Thank you</strong> for choosing The Travelling Technicians. We look forward to providing 
                you with excellent repair services at your convenience.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link href="/" className="btn-primary mr-4">
              Back to Home
            </Link>
            <Link href="/book-online" className="btn-outline">
              Book a Repair
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
} 