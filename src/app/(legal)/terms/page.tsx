import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Terms of Service | ColorSketch",
    description: "Read the terms and conditions for using ColorSketch digital coloring platform.",
};

export default function TermsPage() {
    return (
        <article className="prose prose-lg max-w-none">
            {/* Header */}
            <div className="not-prose mb-10">
                <h1 className="text-3xl sm:text-4xl font-headline font-bold text-on-surface mb-3">
                    Terms of Service
                </h1>
                <p className="text-on-surface-variant">
                    Last updated: April 4, 2026
                </p>
            </div>

            {/* Content */}
            <div className="space-y-8 text-on-surface-variant">
                <section>
                    <h2 className="text-xl font-headline font-semibold text-on-surface mb-4">
                        1. Acceptance of Terms
                    </h2>
                    <p>
                        By accessing or using ColorSketch, you agree to be bound by these Terms of
                        Service and all applicable laws and regulations. If you do not agree with
                        any part of these terms, you may not use our service. These terms apply to
                        all visitors, users, and others who access or use the service.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-headline font-semibold text-on-surface mb-4">
                        2. Description of Service
                    </h2>
                    <p>
                        ColorSketch is a digital coloring application that allows users to color
                        pre-designed sketches, save their progress, share artworks with the community,
                        and connect with other artists. We reserve the right to modify, suspend, or
                        discontinue any aspect of the service at any time without prior notice.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-headline font-semibold text-on-surface mb-4">
                        3. User Accounts
                    </h2>
                    <p className="mb-4">
                        To access certain features, you must create an account. When creating an
                        account, you agree to:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Provide accurate, current, and complete information</li>
                        <li>Maintain the security of your password and account credentials</li>
                        <li>Notify us immediately of any unauthorized access or security breach</li>
                        <li>Accept responsibility for all activities that occur under your account</li>
                        <li>Not share your account with others or create multiple accounts</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-headline font-semibold text-on-surface mb-4">
                        4. User Content
                    </h2>
                    <p className="mb-4">
                        You retain full ownership of the colored artworks you create using ColorSketch.
                        By making your artwork public, you grant ColorSketch a non-exclusive, worldwide,
                        royalty-free license to display your artwork within the platform for the purpose
                        of operating and promoting the service.
                    </p>
                    <p className="mb-4">You agree not to create or share content that:</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Is illegal, harmful, threatening, abusive, or offensive</li>
                        <li>Infringes on intellectual property rights of others</li>
                        <li>Contains malware, viruses, or harmful code</li>
                        <li>Violates the privacy or publicity rights of others</li>
                        <li>Is spam, misleading, or deceptive</li>
                        <li>Impersonates another person or entity</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-headline font-semibold text-on-surface mb-4">
                        5. Intellectual Property
                    </h2>
                    <p>
                        The sketches, designs, graphics, logos, icons, and software that comprise
                        ColorSketch are owned by us or our licensors and are protected by copyright,
                        trademark, and other intellectual property laws. You may not copy, modify,
                        distribute, sell, or create derivative works of our content without explicit
                        written permission.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-headline font-semibold text-on-surface mb-4">
                        6. Acceptable Use
                    </h2>
                    <p className="mb-4">You agree not to:</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Use the service for any illegal or unauthorized purpose</li>
                        <li>Attempt to gain unauthorized access to our systems or networks</li>
                        <li>Interfere with or disrupt the service or servers</li>
                        <li>Use automated systems, bots, or scrapers to access the service</li>
                        <li>Harass, abuse, stalk, or harm other users</li>
                        <li>Circumvent any access restrictions or technical measures</li>
                        <li>Reverse engineer or decompile any part of the service</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-headline font-semibold text-on-surface mb-4">
                        7. Community Guidelines
                    </h2>
                    <p>
                        ColorSketch is a creative community. We expect all users to treat each other
                        with respect. Public artworks and interactions should be appropriate for all
                        ages. We reserve the right to remove any content that violates these guidelines
                        and may suspend or terminate accounts of repeat offenders.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-headline font-semibold text-on-surface mb-4">
                        8. Termination
                    </h2>
                    <p>
                        We may suspend or terminate your account and access to the service at any time,
                        with or without cause and with or without notice, for conduct that we believe
                        violates these terms, is harmful to other users, or is harmful to our business
                        interests. Upon termination, your right to use the service will immediately cease.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-headline font-semibold text-on-surface mb-4">
                        9. Disclaimers
                    </h2>
                    <p>
                        ColorSketch is provided on an &quot;as is&quot; and &quot;as available&quot; basis without
                        warranties of any kind, either express or implied. We do not warrant that the
                        service will be uninterrupted, timely, secure, or error-free. We do not warrant
                        the accuracy or reliability of any content obtained through the service.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-headline font-semibold text-on-surface mb-4">
                        10. Limitation of Liability
                    </h2>
                    <p>
                        To the maximum extent permitted by applicable law, ColorSketch and its officers,
                        directors, employees, and agents shall not be liable for any indirect, incidental,
                        special, consequential, or punitive damages, including loss of profits, data, or
                        goodwill, resulting from your access to or use of the service.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-headline font-semibold text-on-surface mb-4">
                        11. Indemnification
                    </h2>
                    <p>
                        You agree to indemnify and hold harmless ColorSketch from any claims, damages,
                        losses, or expenses arising from your use of the service, your violation of
                        these terms, or your violation of any rights of another party.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-headline font-semibold text-on-surface mb-4">
                        12. Changes to Terms
                    </h2>
                    <p>
                        We reserve the right to modify these terms at any time. We will provide notice
                        of material changes by posting the updated terms on the service and updating
                        the &quot;Last updated&quot; date. Your continued use of the service after such changes
                        constitutes your acceptance of the new terms.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-headline font-semibold text-on-surface mb-4">
                        13. Governing Law
                    </h2>
                    <p>
                        These terms shall be governed by and construed in accordance with the laws
                        of the jurisdiction in which ColorSketch operates, without regard to its
                        conflict of law provisions.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-headline font-semibold text-on-surface mb-4">
                        14. Contact Us
                    </h2>
                    <p>
                        If you have any questions about these Terms of Service, please contact us:
                    </p>
                    <div className="mt-4 p-4 bg-surface-container rounded-xl">
                        <p className="font-medium text-on-surface">ColorSketch Legal Team</p>
                        <p>
                            Email:{" "}
                            <a href="mailto:legal@colorsketch.app" className="text-primary hover:underline">
                                legal@colorsketch.app
                            </a>
                        </p>
                    </div>
                </section>
            </div>
        </article>
    );
}
