import Link from 'next/link'
import { appConfig } from '@/app/app-config'
import { getVersionString } from '@badbird5907/mc-utils';

export async function Footer() {
  const { version, url } = await getVersionString();

  return (
    <footer className="bg-background py-6 border-t border-border relative">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex space-x-4 mb-4 md:mb-0">
            {appConfig.footer.icons.map((icon) => (
              <Link href={icon.link} className="text-muted-foreground hover:text-foreground transition-colors" key={icon.link}>
                <icon.icon className="h-6 w-6" />
                <span className="sr-only">{icon.link}</span>
              </Link>
            ))}
          </div>
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0">
            <Link
              href="https://checkout.tebex.io/payment-history"
              target="_blank"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Manage Subscriptions
            </Link>
            <div className="hidden md:block mx-4 h-4 w-px bg-border" aria-hidden="true" />
            <div className="md:hidden w-full h-px bg-border my-2" aria-hidden="true" />
            <Link
              href="https://arc.badbird.dev/"
              target="_blank"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Powered by Arc
            </Link>
          </div>
        </div>
      </div>
      <div className="absolute bottom-2 left-2 text-xs text-muted-foreground/40">
        <Link href={url} target="_blank" className="hover:text-foreground/40 transition-colors">
          {version}
        </Link>
      </div>
      <div className="absolute bottom-2 right-2 text-xs text-muted-foreground/40">
        <Link href="https://badbird.dev?ref=arc" target="_blank" className="hover:text-foreground/40 transition-colors">
          Designed & Developed by Evan Yu
        </Link>
      </div>
    </footer>
  )
}

