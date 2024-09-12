import { Meta, StoryObj } from '@storybook/react'
import { Avatar, AvatarFallback, AvatarImage } from '../components/atoms/Avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/molecules/DropdownMenu'

const meta = {
  title: 'Molecules/DropdownMenu',
  component: DropdownMenu,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof DropdownMenu>

export default meta
type Story = StoryObj<typeof meta>

export const ProfileMenu: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar>
          <AvatarImage src="https://avatars.githubusercontent.com" alt="@shadcn" />
          <AvatarFallback>T</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="min-w-[240px]" side="bottom" align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <p>Messages</p>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <p>Trips</p>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <p>Wishlist</p>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem>
            <p>Manage listings</p>
          </DropdownMenuItem>

          <DropdownMenuItem>
            <p>Refer a Host</p>
          </DropdownMenuItem>

          <DropdownMenuItem>
            <p>Account</p>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem>
            <p>Help center</p>
          </DropdownMenuItem>

          <DropdownMenuItem>
            <p>Log out</p>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
}
