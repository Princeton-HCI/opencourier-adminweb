import { ReactNode } from 'react'
import { ButtonProps } from '../../atoms/Button'

export type SharedModalProps = {
  id: string
  isLoading?: boolean
  title?: string
  description?: string
  className?: string
}

type CustomModal = {
  children: ReactNode
}

type ConfirmationModal = {
  onCancel?: () => void
  onConfirm?: () => void
  closeOnCancel?: boolean
  closeOnConfirm?: boolean
  confirmBtnProps?: Pick<ButtonProps, 'children' | 'isLoading'>
  cancelBtnProps?: Pick<ButtonProps, 'children' | 'isLoading'>
}
export type CustomModalProps = SharedModalProps & CustomModal
export type ConfirmationModalProps = SharedModalProps & ConfirmationModal

export type ModalProps = SharedModalProps & (({ variant: 'custom' } & CustomModal) | { variant: 'confirmation' })
