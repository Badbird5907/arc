'use client'

import { useState, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Check, Copy } from 'lucide-react'
import { toast } from 'sonner'

export default function SecretReveal({ secret }: { secret: string }) {
  const [isHovered, setIsHovered] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  const handleCopy = useCallback(() => {
    void navigator.clipboard.writeText(secret).then(() => {
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
      toast.success("Copied to clipboard!")
    })
  }, [secret])

  const visiblePart = secret.slice(0, 4)
  const hiddenPart = secret.slice(4)
  const obfuscatedHiddenPart = '•'.repeat(hiddenPart.length)

  return (
    <div className="max-w-md mx-auto p-4">
      <div className="flex items-center space-x-2">
        <div
          className="flex-grow p-2 rounded cursor-pointer overflow-hidden"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="font-mono flex">
            <span>{visiblePart}</span>
            <div className="relative flex-1 overflow-hidden">
              <span 
                className="absolute left-0 transition-transform duration-300 ease-in-out"
                style={{ transform: isHovered ? 'translateY(0)' : 'translateY(-100%)' }}
              >
                {hiddenPart}
              </span>
              <span 
                className="absolute left-0 transition-transform duration-300 ease-in-out"
                style={{ transform: isHovered ? 'translateY(100%)' : 'translateY(0)' }}
              >
                {obfuscatedHiddenPart}
              </span>
            </div>
          </div>
        </div>
        <Button
          onClick={handleCopy}
          variant="outline"
          size="icon"
          className="w-10 h-10"
        >
          {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          <span className="sr-only">Copy</span>
        </Button>
      </div>
    </div>
  )
}