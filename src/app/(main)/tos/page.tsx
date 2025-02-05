import { appConfig } from "@/app/app-config";

export default function TosPage() {
    return (
        <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
            
            <h2 className="text-2xl font-semibold mb-4">Definitions</h2>
            <p className="mb-8">
                Throughout these Terms of Service:<br/>
                - &ldquo;We,&rdquo; &ldquo;us,&rdquo; &ldquo;our,&rdquo; and &ldquo;{appConfig.legal.operator}&rdquo; refer to the operators and owners of this website and service.<br/>
                - &ldquo;Service&rdquo; refers to the {appConfig.title} website, platform, and any related services or features.<br/>
                - &ldquo;You&rdquo; and &ldquo;your&rdquo; refer to the user accessing or using our Service.<br/>
                - &ldquo;Terms&rdquo; refers to these Terms of Service.
            </p>

            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="mb-8">
                By using our services, you agree to these terms of service. If you do not agree to these terms, do not use our services.
            </p>

            <h2 className="text-2xl font-semibold mb-4">2. Changes to Terms</h2>
            <p className="mb-8">
                We reserve the right to modify these terms at any time. We will notify you of any changes by posting the new terms on our website. Your continued use of the service after any such changes constitutes your acceptance of the new terms.
            </p>

            <h2 className="text-2xl font-semibold mb-4">3. User Responsibilities</h2>
            <p className="mb-8">
                Users are responsible for maintaining the confidentiality of their account information and for all activities that occur under their account. You agree to notify us immediately of any unauthorized use of your account or any other breach of security.
            </p>

            <h2 className="text-2xl font-semibold mb-4">4. Termination</h2>
            <p className="mb-8">
                We may terminate or suspend your access to our services immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the terms.
            </p>

            <h2 className="text-2xl font-semibold mb-4">5. Limitation of Liability</h2>
            <p className="mb-8">
                In no event shall we, nor our directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the service.
            </p>

            <h2 className="text-2xl font-semibold mb-4">6. Governing Law</h2>
            <p className="mb-8">
                These terms shall be governed and construed in accordance with the laws of the United States of America, without regard to its conflict of law provisions.
            </p>

            <h2 className="text-2xl font-semibold mb-4">7. Contact</h2>
            <p className="mb-8">
                If you have any questions about these Terms, please contact us at{' '}
                <a href={`mailto:${appConfig.legal.email}`} className="text-blue-600 no-underline hover:underline">
                    {appConfig.legal.email}
                </a>.
            </p>

            <p className="prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline">
                We partner with Tebex Limited (<a href="https://www.tebex.io" target="_blank" rel="noopener noreferrer">www.tebex.io</a>), 
                who are the official merchant of digital content produced by us. If you wish to purchase licenses to use digital content we produce,
                you must do so through Tebex as our licensed reseller and merchant of record. In order to make any such purchase from Tebex, you must agree to their terms,
                available at <a href="https://checkout.tebex.io/terms" target="_blank" rel="noopener noreferrer">https://checkout.tebex.io/terms</a>. 
                If you have any queries about a purchase made through Tebex, including but not limited to refund requests, technical issues
                or billing enquiries, you should contact Tebex support at <a href="https://www.tebex.io/contact/checkout" target="_blank" rel="noopener noreferrer">https://www.tebex.io/contact/checkout</a> in 
                the first instance.
            </p>
        </div>
    )
}
