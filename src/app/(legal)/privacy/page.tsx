import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy | ColorSketch",
    description: "Learn how ColorSketch collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
    return (
        <article className="prose prose-lg max-w-none">
            {/* Header */}
            <div className="not-prose mb-10">
                <h1 className="text-3xl sm:text-4xl font-headline font-bold text-on-surface mb-3">
                    Privacy Policy
                </h1>
                <p className="text-on-surface-variant">
                    Last updated: April 4, 2026
                </p>
            </div>

            {/* Content */}
            <div className="space-y-8 text-on-surface-variant">
                <section>
                    <h2 className="text-xl font-headline font-semibold text-on-surface mb-4">
                        1. Information We Collect
                    </h2>
                    <p className="mb-4">
                        When you use ColorSketch, we collect information you provide directly to us, including:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Account information (name, email address, profile picture)</li>
                        <li>Artwork and coloring progress data</li>
                        <li>Preferences and settings</li>
                        <li>Communications with us</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-headline font-semibold text-on-surface mb-4">
                        2. How We Use Your Information
                    </h2>
                    <p className="mb-4">We use the information we collect to:</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Provide, maintain, and improve our services</li>
                        <li>Sync your artwork and progress across devices</li>
                        <li>Send you technical notices and support messages</li>
                        <li>Respond to your comments and questions</li>
                        <li>Analyze usage patterns to improve user experience</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-headline font-semibold text-on-surface mb-4">
                        3. Data Storage and Security
                    </h2>
                    <p>
                        Your data is stored securely using industry-standard encryption. We use Supabase
                        for authentication and data storage, which employs robust security measures to
                        protect your information. We implement appropriate technical and organizational
                        measures to ensure the security of your personal data.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-headline font-semibold text-on-surface mb-4">
                        4. Sharing of Information
                    </h2>
                    <p className="mb-4">
                        We do not sell, trade, or rent your personal information to third parties.
                        We may share information only in the following circumstances:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>With your consent</li>
                        <li>To comply with legal obligations</li>
                        <li>To protect our rights and safety</li>
                        <li>With service providers who assist our operations (under strict confidentiality)</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-headline font-semibold text-on-surface mb-4">
                        5. Your Public Artworks
                    </h2>
                    <p>
                        When you choose to make your artworks public, they become visible to other
                        users on the platform. Other users may like, save, or interact with your public
                        artworks. You can change the visibility of your artworks at any time from your
                        profile settings. Private artworks are only visible to you.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-headline font-semibold text-on-surface mb-4">
                        6. Your Rights
                    </h2>
                    <p className="mb-4">You have the right to:</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Access your personal data</li>
                        <li>Correct inaccurate data</li>
                        <li>Request deletion of your data</li>
                        <li>Export your data in a portable format</li>
                        <li>Withdraw consent at any time</li>
                        <li>Object to processing of your data</li>
                    </ul>
                    <p className="mt-4">
                        To exercise any of these rights, please contact us at{" "}
                        <a href="mailto:privacy@colorsketch.app" className="text-primary hover:underline">
                            privacy@colorsketch.app
                        </a>
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-headline font-semibold text-on-surface mb-4">
                        7. Cookies and Local Storage
                    </h2>
                    <p>
                        We use local storage to save your coloring progress offline, enabling you to
                        continue your work even without an internet connection. We use cookies for
                        authentication and to remember your preferences. You can manage cookie
                        preferences in your browser settings, though this may affect some features.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-headline font-semibold text-on-surface mb-4">
                        8. Children&apos;s Privacy
                    </h2>
                    <p>
                        ColorSketch is designed to be family-friendly. We do not knowingly collect
                        personal information from children under 13 without verifiable parental consent.
                        If you are a parent and believe your child has provided us with personal
                        information without your consent, please contact us and we will take steps
                        to remove such information.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-headline font-semibold text-on-surface mb-4">
                        9. International Data Transfers
                    </h2>
                    <p>
                        Your information may be transferred to and processed in countries other than
                        your own. We ensure appropriate safeguards are in place to protect your
                        information in accordance with this privacy policy.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-headline font-semibold text-on-surface mb-4">
                        10. Changes to This Policy
                    </h2>
                    <p>
                        We may update this privacy policy from time to time. We will notify you of
                        any material changes by posting the new policy on this page, updating the
                        &quot;Last updated&quot; date, and where appropriate, sending you a notification.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-headline font-semibold text-on-surface mb-4">
                        11. Contact Us
                    </h2>
                    <p>
                        If you have any questions about this Privacy Policy or our data practices,
                        please contact us at:
                    </p>
                    <div className="mt-4 p-4 bg-surface-container rounded-xl">
                        <p className="font-medium text-on-surface">ColorSketch Privacy Team</p>
                        <p>
                            Email:{" "}
                            <a href="mailto:privacy@colorsketch.app" className="text-primary hover:underline">
                                privacy@colorsketch.app
                            </a>
                        </p>
                    </div>
                </section>
            </div>
        </article>
    );
}
