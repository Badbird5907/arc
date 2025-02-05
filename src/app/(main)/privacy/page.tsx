import { appConfig, discord } from "@/app/app-config";

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-3">Introduction</h2>
          <p>
            Welcome to {appConfig.title}&apos;s Privacy Policy. This Privacy Policy explains how we collect, 
            use, disclose, and safeguard your information when you visit our website.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">Information We Collect</h2>
          <p className="mb-3">We collect several types of information for various purposes to provide and improve our service to you:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Email addresses</li>
            <li>IP addresses</li>
            <li>Usage data and analytics</li>
            <li>Payment information (processed securely through our payment providers)</li>
            <li>Communication data (such as support requests)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">How We Use Your Information</h2>
          <p className="mb-3">We use the collected information for various purposes:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>To provide and maintain our service</li>
            <li>To notify you about changes to our service</li>
            <li>To provide customer support</li>
            <li>To detect, prevent and address technical issues</li>
            <li>To process your transactions</li>
            <li>To prevent fraud and ensure security</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">Data Storage and Security</h2>
          <p>
            We implement appropriate technical and organizational security measures to protect 
            your personal information. However, please note that no method of transmission over 
            the internet or electronic storage is 100% secure.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">Third-Party Services</h2>
          <p>
            We may employ third-party companies and individuals to facilitate our service, 
            provide service-related services, or assist us in analyzing how our service is used. 
            These third parties have access to your personal information only to perform these 
            tasks on our behalf and are obligated not to disclose or use it for any other purpose.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at <a href={`mailto:${appConfig.legal.email}`} className="text-blue-600 no-underline hover:underline">{appConfig.legal.email}</a>
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">Changes to This Privacy Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any 
            changes by posting the new Privacy Policy on this page. Changes are effective 
            immediately upon posting.
          </p>
        </section>
      </div>
    </div>
  );
}

export const metadata = {
  title: `Privacy Policy - ${appConfig.title}`,
  description: "Privacy Policy and data collection information",
};
