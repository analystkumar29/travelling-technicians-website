import Layout from '@/components/layout/Layout';
import Link from 'next/link';

const EFFECTIVE_DATE = 'February 6, 2026';
const VERSION = '2026-02-06-v1';

export default function TermsConditionsPage() {
  return (
    <Layout
      title="Terms and Conditions"
      metaDescription="Terms and conditions for The Travelling Technicians mobile and laptop repair services. Compliant with PIPEDA, BC BPCPA, and applicable Canadian consumer protection laws."
    >
      <div className="py-16 bg-white">
        <div className="container-custom max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms and Conditions</h1>
            <p className="text-lg text-gray-600">
              Effective Date: {EFFECTIVE_DATE} &middot; Version: {VERSION}
            </p>
          </div>

          <div className="prose prose-lg max-w-none">
            <div className="bg-primary-50 border-l-4 border-primary-400 p-6 mb-8">
              <p className="text-primary-900 font-medium">
                Please read these terms and conditions carefully before using our services. By booking a repair,
                checking the &ldquo;I agree to the Terms and Conditions&rdquo; box, or otherwise engaging with
                The Travelling Technicians, you acknowledge that you have read, understood, and agree to be bound
                by these terms. These terms are governed by Canadian federal and British Columbia provincial law.
              </p>
            </div>

            {/* 1. Acceptance of Terms */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 mb-4">
                By accessing our website at <strong>www.travelling-technicians.ca</strong>, booking our services,
                or otherwise engaging with The Travelling Technicians (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;the Company&rdquo;),
                you (&ldquo;the Customer&rdquo;) acknowledge that you have read, understood, and agree to be bound by these
                Terms and Conditions (&ldquo;Terms&rdquo;), along with our{' '}
                <Link href="/privacy-policy" className="text-primary-600 hover:text-primary-800 underline">Privacy Policy</Link>.
              </p>
              <p className="text-gray-700 mb-4">
                If you do not agree with any part of these Terms, you must not use our services. We recommend that
                you save or print a copy of these Terms for your records.
              </p>
              <p className="text-gray-700 mb-6">
                When you book a repair through our website and check the &ldquo;I agree&rdquo; box, we record
                the version of these Terms you accepted, along with the date and time, for our records.
              </p>
            </section>

            {/* 2. Service Description */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Service Description</h2>
              <p className="text-gray-700 mb-4">
                The Travelling Technicians provides <strong>mobile, on-site (doorstep) device repair services</strong> at
                customer-designated locations. Our technicians travel to you rather than requiring you to visit a retail location.
                Our services include but are not limited to:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Mobile phone and tablet screen replacement and repair</li>
                <li>Battery replacement for mobile devices and laptops</li>
                <li>Charging port, speaker, microphone, and camera repairs</li>
                <li>Laptop hardware repairs, keyboard replacement, and component upgrades</li>
                <li>Software troubleshooting and virus/malware removal</li>
                <li>Data recovery services (where technically feasible; no guarantee of success)</li>
              </ul>
              <p className="text-gray-700 mb-6">
                We use a combination of OEM (original equipment manufacturer), OEM-equivalent, and high-quality
                third-party replacement parts. The type of parts used will be disclosed to you before repair begins.
                All parts are sourced from reputable suppliers and meet or exceed industry quality standards.
              </p>
            </section>

            {/* 3. Service Area & Availability */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Service Area and Availability</h2>
              <p className="text-gray-700 mb-4">
                We currently provide on-site repair services throughout the <strong>Lower Mainland of British Columbia</strong>,
                including Vancouver, Burnaby, Surrey, Richmond, Coquitlam, New Westminster, North Vancouver, West Vancouver,
                Delta, Langley, Maple Ridge, Pitt Meadows, and Port Moody.
              </p>
              <p className="text-gray-700 mb-6">
                Service availability is subject to technician scheduling and geographic coverage. We reserve the right
                to decline service requests for locations outside our current service area or where access conditions
                pose safety concerns for our technicians.
              </p>
            </section>

            {/* 4. Booking & Appointments */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Booking and Appointments</h2>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">Appointment Scheduling</h3>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>All services must be booked in advance through our website or by phone</li>
                <li>Appointment times are estimated and may be subject to change due to traffic or previous service delays</li>
                <li>A responsible adult (18 years or older) must be present during the service appointment</li>
                <li>We will provide notification when our technician is en route to your location</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">Pricing Disclosure at Booking</h3>
              <p className="text-gray-700 mb-4">
                In accordance with the <em>Business Practices and Consumer Protection Act</em> (BPCPA), s. 18.2,
                when you book a repair we will provide:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>An itemized price estimate for the specific repair, including parts and labour</li>
                <li>Any applicable travel or diagnostic fees</li>
                <li>The total estimated cost including GST</li>
                <li>Final pricing confirmed in writing (or on-screen) before work begins; no work will be performed without your approval of the final price</li>
              </ul>
            </section>

            {/* 5. Cancellation & Rescheduling */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Cancellation and Rescheduling</h2>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Appointments can be cancelled or rescheduled with at least <strong>2 hours&apos; notice</strong> at no charge</li>
                <li>Late cancellations (less than 2 hours&apos; notice) may incur a $25 service fee</li>
                <li>No-shows may be charged a $50 fee</li>
                <li>We reserve the right to cancel appointments due to weather, safety concerns, or other unforeseen circumstances, with no charge to the Customer</li>
              </ul>

              <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6">
                <p className="text-amber-900 font-medium text-sm">
                  <strong>Ontario Customers:</strong> If you are located in Ontario and the repair constitutes a
                  &ldquo;direct agreement&rdquo; under the <em>Consumer Protection Act, 2002</em> (CPA), s. 43,
                  you have a <strong>10-day cooling-off period</strong> to cancel without penalty after entering
                  into the agreement, provided the service has not been fully performed with your express consent.
                </p>
              </div>
            </section>

            {/* 6. Pricing & Payment */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Pricing and Payment</h2>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">Service Pricing</h3>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>All prices quoted are estimates based on standard repair costs for the identified issue</li>
                <li>Final pricing is confirmed before work begins; you will not be charged more than the confirmed price unless you approve additional work</li>
                <li>If a repair is more complex than initially assessed, we will inform you and obtain your consent before proceeding at a revised price</li>
                <li>There are no hidden fees. All charges (parts, labour, travel, diagnostics, tax) are itemized</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">Payment Terms</h3>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>Payment is due upon completion of service</li>
                <li>We accept cash, credit cards (Visa, Mastercard), debit, and Interac e-Transfer</li>
                <li>A diagnostic fee may apply if you decline the repair after assessment; this fee is disclosed before the assessment begins</li>
                <li>All prices include applicable GST unless otherwise stated</li>
              </ul>
            </section>

            {/* 7. Warranty & Guarantee */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Warranty and Guarantee</h2>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">Our Repair Warranty</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>All standard repairs come with a <strong>90-day warranty</strong> on parts and workmanship</li>
                <li>Premium service tier includes an extended <strong>180-day warranty</strong></li>
                <li>Warranty covers defects in replacement parts and installation errors attributable to our technicians</li>
                <li>Water damage repairs carry a reduced 30-day warranty due to the unpredictable nature of liquid damage</li>
                <li>Data recovery services are provided on a best-effort basis and carry no warranty of success</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">Warranty Exclusions</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Damage caused by misuse, accidents, drops, or liquid exposure after repair</li>
                <li>Normal wear and tear</li>
                <li>Modifications or repairs performed by a third party after our service</li>
                <li>Software issues unrelated to the hardware repair performed</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">Statutory Warranties</h3>
              <p className="text-gray-700 mb-6">
                Nothing in these Terms excludes or limits statutory warranties or conditions that cannot be excluded
                under applicable law, including:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li><strong>British Columbia:</strong> Implied conditions under the <em>Sale of Goods Act</em> (RSBC 1996, c. 410), s. 18, that goods are of merchantable quality and fit for their intended purpose</li>
                <li><strong>Ontario:</strong> Implied warranties and conditions under the <em>Consumer Protection Act, 2002</em>, s. 9, and the <em>Sale of Goods Act</em> (RSO 1990, c. S.1)</li>
                <li><strong>Quebec:</strong> The legal warranty of quality under the <em>Consumer Protection Act</em> (CQLR, c. P-40.1), art. 37&ndash;38, which guarantees that goods will serve the purpose for which they are intended for a reasonable time</li>
              </ul>
            </section>

            {/* 8. Device Data & Privacy */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Device Data and Privacy</h2>
              <p className="text-gray-700 mb-4">
                During the course of repair, our technicians may have <strong>incidental access</strong> to personal
                data stored on your device. By submitting your device for repair, you consent to this incidental access
                strictly for the purpose of diagnosing and repairing the device. We commit to the following:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li><strong>Purpose limitation:</strong> Technicians will only access data as necessary to perform the requested repair and verify its success (e.g., testing screen responsiveness, checking camera functionality)</li>
                <li><strong>No copying:</strong> We will not copy, transfer, photograph, or retain any personal data from your device</li>
                <li><strong>No browsing:</strong> Technicians are trained not to browse personal files, photos, messages, or accounts</li>
                <li><strong>Confidentiality:</strong> All technicians are bound by confidentiality obligations regarding any data they may incidentally observe</li>
                <li><strong>Passwords:</strong> If you provide a device passcode to facilitate repair, it is used solely for that purpose and is not recorded or retained after service completion</li>
              </ul>
              <p className="text-gray-700 mb-4">
                This consent is provided in accordance with the <em>Personal Information Protection and Electronic
                Documents Act</em> (PIPEDA), s. 6.1, and the BC <em>Personal Information Protection Act</em> (PIPA), s. 6.
              </p>
              <p className="text-gray-700 mb-6">
                For complete details on how we collect, use, and protect your personal information, please review our{' '}
                <Link href="/privacy-policy" className="text-primary-600 hover:text-primary-800 underline">Privacy Policy</Link>.
              </p>
            </section>

            {/* 9. Customer Responsibilities */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Customer Responsibilities</h2>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Provide accurate device information and a clear description of the issue</li>
                <li><strong>Back up all important data before your appointment.</strong> While we take every precaution to protect your data during repair, certain repairs (especially those involving storage, motherboard, or water damage) carry inherent risk of data loss</li>
                <li>Remove all personal accessories (cases, screen protectors, SIM cards, SD cards) from devices unless they are relevant to the repair</li>
                <li>Provide a safe, well-lit, and accessible work environment for our technicians (e.g., a clean table or desk)</li>
                <li>Be present during the service appointment or designate a responsible adult to be present</li>
                <li>Test the repaired device and confirm satisfaction before the technician departs</li>
                <li>Disclose any known pre-existing issues with the device, including prior water damage, previous repairs, or software modifications</li>
              </ul>
              <p className="text-gray-700 mb-6">
                Failure to back up your data does not constitute a blanket waiver of liability on our part.
                See Section 10 (Limitation of Liability) for details on how data loss liability is allocated.
              </p>
            </section>

            {/* 10. Limitation of Liability */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Limitation of Liability</h2>
              <p className="text-gray-700 mb-4">
                To the extent permitted by applicable law:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Our total liability for any claim arising from a repair shall not exceed the <strong>amount paid by you for that specific service</strong></li>
                <li>We are not liable for indirect, incidental, consequential, or punitive damages, including lost profits or business interruption, except where such exclusion is prohibited by law</li>
                <li>We are not liable for device damage or data loss resulting from <strong>pre-existing conditions</strong> (e.g., prior water damage, corroded components, failing storage) that were not caused by our repair</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">Data Loss</h3>
              <p className="text-gray-700 mb-4">
                We disclaim liability for data loss <strong>only</strong> in the following circumstances:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Data loss caused by pre-existing device conditions not related to our repair work</li>
                <li>Data loss that could have been prevented by a reasonable backup, where the Customer was advised to back up their data</li>
              </ul>
              <p className="text-gray-700 mb-4">
                We <strong>do not</strong> disclaim liability for data loss caused by our technician&apos;s negligence, error,
                or failure to follow proper repair procedures. If our actions directly cause data loss, we will work in
                good faith to assist with recovery at no additional charge.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">Statutory Protections</h3>
              <p className="text-gray-700 mb-6">
                Nothing in this section excludes or limits any liability that cannot be lawfully excluded under the
                <em> Business Practices and Consumer Protection Act</em> (SBC 2004, c. 2), ss. 8&ndash;10,
                or other applicable consumer protection legislation. Statutory warranties and conditions
                (see Section 7) are not affected by these limitations.
              </p>
            </section>

            {/* 11. Right to Repair */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Right to Repair</h2>
              <p className="text-gray-700 mb-4">
                We support the right of consumers to have their devices repaired by independent service providers.
                In the course of performing repairs, our technicians may need to circumvent technological protection
                measures (TPMs) solely for the purpose of diagnosing and repairing your device.
              </p>
              <p className="text-gray-700 mb-6">
                Such circumvention is permitted under Canadian law, including amendments to the <em>Copyright Act</em>
                (RSC 1985, c. C-42) introduced by Bills C-244 and C-294, which provide exceptions for repair and
                maintenance of products. We do not circumvent TPMs for any purpose other than diagnosis and repair
                of the specific device you have submitted for service.
              </p>
            </section>

            {/* 12. Intellectual Property */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Intellectual Property</h2>
              <p className="text-gray-700 mb-4">
                All content on our website, including text, graphics, logos, and software, is the property of
                The Travelling Technicians and is protected by copyright and other intellectual property laws.
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>You may not reproduce, distribute, or create derivative works without our written permission</li>
                <li>Our business name, logo, and branding are protected trademarks</li>
                <li>Customer reviews and testimonials may be used for marketing purposes with the Customer&apos;s consent</li>
              </ul>
            </section>

            {/* 13. Unclaimed Devices */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Unclaimed Devices</h2>
              <p className="text-gray-700 mb-4">
                As a mobile repair service, we typically complete repairs on-site and return your device immediately.
                However, in the rare event that a device must be taken off-site for repair (with your consent):
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>We will contact you when the repair is complete using the contact information you provided</li>
                <li>If we are unable to reach you for <strong>90 days</strong> after the repair is completed, we will send a written notice to your last known address advising that the device is ready for collection</li>
                <li>Storage fees of <strong>$2.00 per day</strong> may apply after the initial 30-day grace period following completion of repair</li>
                <li>After 90 days&apos; written notice, unclaimed devices may be disposed of in accordance with the <em>Repairers Lien Act</em> (RSBC 1996, c. 404) and the <em>Commercial Liens Act</em> (SBC 2022, c. 9)</li>
              </ul>
              <p className="text-gray-700 mb-6">
                We will make reasonable efforts to contact you before any disposition of an unclaimed device.
              </p>
            </section>

            {/* 14. Dispute Resolution */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Dispute Resolution</h2>
              <p className="text-gray-700 mb-4">
                We are committed to resolving disputes fairly and efficiently. In the event of a dispute:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li><strong>Step 1 &mdash; Direct Resolution:</strong> Contact us directly. Most issues can be resolved through good-faith communication. We aim to respond to all complaints within 5 business days</li>
                <li><strong>Step 2 &mdash; Voluntary Mediation:</strong> If direct communication does not resolve the dispute, either party may propose mediation through a mutually agreed-upon mediator. Mediation costs are shared equally unless otherwise agreed</li>
                <li><strong>Step 3 &mdash; Court or Tribunal:</strong> If mediation is unsuccessful or declined, disputes may be brought before the appropriate court or tribunal</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">BC Civil Resolution Tribunal</h3>
              <p className="text-gray-700 mb-4">
                For claims of <strong>$5,000 or less</strong>, the BC Civil Resolution Tribunal (CRT) provides
                an accessible, online dispute resolution process. Learn more at{' '}
                <a href="https://civilresolutionbc.ca" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-800 underline">civilresolutionbc.ca</a>.
              </p>

              <div className="bg-primary-50 border-l-4 border-primary-400 p-4 mb-6">
                <p className="text-primary-900 font-medium text-sm">
                  <strong>No Mandatory Arbitration.</strong> In accordance with BC consumer protection law (including
                  amendments under Bill 4, <em>Business Practices and Consumer Protection Amendment Act, 2025</em>),
                  these Terms do not contain a mandatory arbitration clause or class action waiver.
                  You retain your full right to pursue claims in court or through applicable tribunals.
                </p>
              </div>
            </section>

            {/* 15. Force Majeure */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">15. Force Majeure</h2>
              <p className="text-gray-700 mb-6">
                We shall not be liable for any failure or delay in performance due to circumstances beyond our
                reasonable control, including but not limited to acts of God, natural disasters, strikes,
                government regulations, pandemics, supply chain disruptions affecting parts availability,
                or other emergencies. If a force majeure event prevents us from fulfilling a booking,
                we will notify you as soon as practicable and offer to reschedule or provide a full refund
                of any amounts paid.
              </p>
            </section>

            {/* 16. Termination */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">16. Termination</h2>
              <p className="text-gray-700 mb-6">
                We reserve the right to refuse service or terminate our relationship with customers who violate
                these Terms, engage in abusive or threatening behavior toward our technicians, or pose safety risks.
                Upon termination, all outstanding fees for services already performed become immediately due and payable.
                Sections that by their nature should survive termination (including warranty obligations, limitation of
                liability, and dispute resolution) will continue in effect.
              </p>
            </section>

            {/* 17. Provincial Addendums */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">17. Provincial Addendums</h2>
              <p className="text-gray-700 mb-4">
                The following additional terms apply to customers in specific provinces. Where a provincial addendum
                conflicts with the general terms above, the provincial addendum prevails for customers in that province.
              </p>

              <div className="bg-gray-50 p-6 rounded-lg mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Ontario</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li><strong>10-Day Cooling-Off Period:</strong> Under the <em>Consumer Protection Act, 2002</em> (CPA), s. 43, if the repair constitutes a &ldquo;direct agreement&rdquo; (a consumer agreement negotiated or concluded in person at a place other than the supplier&apos;s place of business), you may cancel within 10 days of receiving a written copy of the agreement</li>
                  <li><strong>Deemed Warranty:</strong> Under the CPA, s. 9, there is a deemed condition that services will be of a reasonably acceptable quality. This condition cannot be waived or excluded</li>
                  <li><strong>Itemized Receipt:</strong> You will receive an itemized receipt upon completion of service, as required by the CPA</li>
                </ul>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Quebec</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li><strong>Legal Warranty:</strong> Under the <em>Consumer Protection Act</em> (CQLR, c. P-40.1), art. 37&ndash;38, goods must serve the purpose for which they are intended and last for a reasonable time. This legal warranty cannot be excluded or reduced by contract</li>
                  <li><strong>French Language:</strong> You have the right to request these Terms and all associated documentation in French, in accordance with the <em>Charter of the French Language</em> (CQLR, c. C-11)</li>
                  <li><strong>Anti-Repair Prohibition:</strong> Under Quebec Bill 29, a manufacturer cannot void a warranty solely because the device was repaired by an independent service provider such as The Travelling Technicians</li>
                  <li><strong>Governing Law:</strong> For Quebec consumers, these Terms are governed by Quebec law and disputes must be resolved before the courts of Quebec, notwithstanding Section 20</li>
                </ul>
              </div>
            </section>

            {/* 18. Modifications to Terms */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">18. Modifications to Terms</h2>
              <p className="text-gray-700 mb-4">
                We reserve the right to modify these Terms at any time. When we do:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>The updated Terms will be posted on our website with a new version number and effective date</li>
                <li>For material changes, we will provide at least 30 days&apos; notice through our website or via email to customers with active bookings</li>
                <li>Changes do not apply retroactively. Your booking is governed by the version of these Terms in effect at the time of your booking</li>
                <li>Previous versions of these Terms are available upon request</li>
              </ul>
              <p className="text-gray-700 mb-6">
                Continued use of our services after the effective date of updated Terms constitutes acceptance of
                those updated Terms for new bookings placed after that date.
              </p>
            </section>

            {/* 19. Severability */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">19. Severability</h2>
              <p className="text-gray-700 mb-6">
                If any provision of these Terms is found to be unenforceable or invalid by a court of competent
                jurisdiction, the remaining provisions will continue in full force and effect. The invalid provision
                will be interpreted, to the extent possible, to achieve its original intent, or will be replaced with
                a valid provision that most closely achieves the original intent.
              </p>
            </section>

            {/* 20. Governing Law & Jurisdiction */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">20. Governing Law and Jurisdiction</h2>
              <p className="text-gray-700 mb-4">
                These Terms are governed by and construed in accordance with the laws of the Province of British Columbia
                and the federal laws of Canada applicable therein, without regard to conflict of law principles.
              </p>
              <p className="text-gray-700 mb-6">
                Any legal proceedings arising from these Terms or the services provided shall be brought before the
                courts of British Columbia, except where a provincial addendum (Section 17) specifies otherwise,
                or where applicable consumer protection legislation grants you the right to bring proceedings
                in the jurisdiction of your residence.
              </p>
            </section>

            {/* 21. Contact Information */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">21. Contact Information</h2>
              <p className="text-gray-700 mb-4">
                If you have questions about these Terms, wish to exercise any rights described herein, or need to
                file a complaint, please contact us:
              </p>
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="space-y-2">
                  <p><strong>The Travelling Technicians</strong></p>
                  <p>Email: <a href="mailto:info@travellingtechnicians.ca" className="text-primary-600 hover:text-primary-800">info@travellingtechnicians.ca</a></p>
                  <p>Phone: <a href="tel:+17783899251" className="text-primary-600 hover:text-primary-800">(778) 389-9251</a></p>
                  <p>Service Area: Lower Mainland, British Columbia, Canada</p>
                  <p>Website: <a href="https://www.travelling-technicians.ca" className="text-primary-600 hover:text-primary-800">www.travelling-technicians.ca</a></p>
                </div>
              </div>
            </section>

            <div className="bg-green-50 border-l-4 border-green-400 p-6 mt-8">
              <p className="text-green-800 font-medium">
                <strong>Thank you</strong> for choosing The Travelling Technicians. We are committed to providing
                transparent, fair, and high-quality repair services. If you have any questions about these Terms,
                please don&apos;t hesitate to contact us.
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
