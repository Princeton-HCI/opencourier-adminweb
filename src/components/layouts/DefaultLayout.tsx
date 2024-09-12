import { EAdminRoutes } from '@/hooks/useAdminPageNavigator'
import { setAccessToken } from '@/modules/auth/slices/authSlice'
import {
  Button,
  Separator,
  TooltipProvider,
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '../../admin-web-components'
import { cn, useAppDispatch, useScreenSize } from '../../ui-shared-utils'
import {
  BuildingIcon,
  CarTaxiFrontIcon,
  LayoutDashboardIcon,
  ScrollTextIcon,
} from 'lucide-react'
import React, { useContext, useState } from 'react'
import { Nav, NavLink } from '../Nav'
import { ChatContext } from '@/modules/chat/components/ChatProvider'

interface ghostLayoutProps extends React.HTMLAttributes<HTMLDivElement> {}

const sidebarNavItems: NavLink[] = [
  {
    title: 'Overview',
    icon: LayoutDashboardIcon,
    href: EAdminRoutes.HOME,
  },
  {
    title: 'Deliveries',
    icon: BuildingIcon,
    href: EAdminRoutes.DELIVERIES,
  },
  {
    title: 'Couriers',
    icon: ScrollTextIcon,
    href: EAdminRoutes.COURIERS,
  },
  {
    title: 'Instance Configuration',
    icon: CarTaxiFrontIcon,
    href: EAdminRoutes.INSTANCE_CONFIGURATION,
  },
]

export function DefaultLayout({ children, className }: ghostLayoutProps) {
  const screen = useScreenSize()
  const [isCollapsed, setIsCollapsed] = React.useState(screen.width < 400)
  const dispatch = useAppDispatch()
  const chat = useContext(ChatContext)
  const [navItems, setNavItems] = useState<NavLink[]>(sidebarNavItems)

  // useEffect(() => {
  // }, [chat?.allUnreadMessagesCount])

  return (
    <div className="flex flex-col lg:flex-row">
      <ResizablePanelGroup direction="horizontal" className="items-stretch">
        <TooltipProvider delayDuration={0}>
          <ResizablePanel
            defaultSize={240}
            collapsedSize={4}
            collapsible={true}
            minSize={12}
            maxSize={14}
            onCollapse={(collapsed) => {
              setIsCollapsed(collapsed)
            }}
            className={cn(isCollapsed && 'min-w-[50px] transition-all duration-300 ease-in-out')}
            style={{ height: '100svh' }}
          >
            <Nav isCollapsed={isCollapsed} links={navItems} />

            <Separator />

            <Button variant="link" onClick={() => dispatch(setAccessToken(null))}>
              Log out
            </Button>
          </ResizablePanel>
        </TooltipProvider>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={1080} minSize={30}>
          <div className={cn('flex-1 max-h-screen md:overflow-auto p-4', className)}>{children}</div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
