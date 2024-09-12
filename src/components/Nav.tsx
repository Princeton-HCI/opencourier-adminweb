import { Badge, Tooltip, TooltipContent, TooltipTrigger, buttonVariants } from '../admin-web-components/index'
import { cn } from '../ui-shared-utils'
import { LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export type NavLink = {
  title: string
  label?: string
  icon: LucideIcon
  href: string
  notification?: string
}
type NavProps = {
  isCollapsed: boolean
  links: NavLink[]
}

function isActive(pathname: string, href: string, allowPrefix = true): boolean {
  pathname = pathname.replace(/\/$/, '')
  href = href.replace(/\/$/, '')

  if (pathname === href) {
    return true
  }
  if (pathname.length === 0 || href.length === 0 || !allowPrefix) {
    return false
  }

  return pathname.startsWith(href)
}

export function Nav({ links, isCollapsed }: NavProps) {
  const pathname = usePathname() || ''

  return (
    <div data-collapsed={isCollapsed} className="group flex flex-col gap-4 py-2 data-[collapsed=true]:py-2">
      <nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
        {links.map((link, index) => {
          const isActiveLink = isActive(pathname, link.href)
          const variant = isActiveLink ? 'default' : 'ghost'
          return isCollapsed ? (
            <Tooltip key={index} delayDuration={0}>
              <TooltipTrigger asChild>
                <Link
                  href={link.href}
                  className={cn(
                    buttonVariants({ variant, size: 'icon' }),
                    'h-9 w-9',
                    variant === 'default' &&
                      'dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white'
                  )}
                >
                  <link.icon className="h-4 w-4" />
                  <span className="sr-only">{link.title}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="flex items-center gap-4">
                {link.title}
                {link.label && <span className="ml-auto text-muted-foreground">{link.label}</span>}
              </TooltipContent>
            </Tooltip>
          ) : (
            <Link
              key={index}
              href={link.href}
              className={cn(
                buttonVariants({ variant: variant, size: 'sm' }),
                variant === 'default' && 'dark:bg-muted dark:text-white dark:hover:bg-muted dark:hover:text-white',
                'justify-between'
              )}
            >
              <div className="flex items-center">
                <link.icon className="mr-2 h-4 w-4" />
                {link.title}
                {link.label && (
                  <span className={cn('ml-auto', variant === 'default' && 'text-background dark:text-white')}>
                    {link.label}
                  </span>
                )}
              </div>
              {link.notification ? <Badge variant="secondary">{link.notification}</Badge> : null}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
