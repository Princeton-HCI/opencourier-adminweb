import Link, { LinkProps } from 'next/link'
import { ComponentPropsWithoutRef, ReactNode } from 'react'

type NavBarMenuRootProps = ComponentPropsWithoutRef<'nav'>
function NavBarMenu({ children, ...props }: NavBarMenuRootProps) {
  return (
    <nav {...props}>
      <ul role="menubar" className="flex gap-2 list-none">
        {children}
      </ul>
    </nav>
  )
}

type NavBarMenuItemProps =
  | ({ as: 'link'; children: string | ReactNode } & LinkProps)
  | { as: 'button'; children: string | ReactNode }
function NavBarMenuItem(props: NavBarMenuItemProps) {
  return (
    <li className="cursor-pointer rounded-3xl px-4 py-2 list-none text-sm hover:bg-gray-100">
      {props.as === 'link' ? <Link {...props} /> : props.children}
    </li>
  )
}

export { NavBarMenu, NavBarMenuItem }
