// components/ui/separator.tsx
export function Separator({ className }: { className?: string }) {
    return <hr className={`border-t border-gray-300 ${className || ''}`} />
  }
  