import { cn } from '../../../../ui-shared-utils'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../atoms/AlertDialog'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../Dialog'
import { closeModal, useModalsState } from './state'
import { ConfirmationModalProps, CustomModalProps } from './types'

function ConfirmationModal(props: ConfirmationModalProps) {
  const {
    id,
    title,
    description,
    onCancel,
    onConfirm,
    closeOnCancel = true,
    closeOnConfirm = true,
    confirmBtnProps,
    cancelBtnProps,
    isLoading,
  } = props

  return (
    <AlertDialog
      open
      onOpenChange={(isOpen) => {
        if (isOpen === false) closeModal(id)
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {cancelBtnProps?.children || props.onCancel ? (
            <AlertDialogCancel
              {...cancelBtnProps}
              disabled={cancelBtnProps?.isLoading || isLoading}
              onClick={() => {
                onCancel?.()
                if (closeOnCancel) close()
              }}
            >
              {cancelBtnProps?.children ?? 'Cancel'}
            </AlertDialogCancel>
          ) : null}

          <AlertDialogAction
            {...confirmBtnProps}
            disabled={confirmBtnProps?.isLoading || isLoading}
            onClick={() => {
              onConfirm?.()
              if (closeOnConfirm) close()
            }}
          >
            {confirmBtnProps?.children ?? 'Confirm'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function Modal(props: CustomModalProps) {
  const { id, title, description, children, className } = props

  return (
    <Dialog
      open
      onOpenChange={(isOpen) => {
        if (isOpen === false) closeModal(id)
      }}
    >
      <DialogContent className={cn('min-w-modal', className)}>
        <DialogHeader>
          {title ? <DialogTitle>{title}</DialogTitle> : null}
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        <div className="grid gap-4 py-4">{children}</div>
      </DialogContent>
    </Dialog>
  )
}

export function ModalManager() {
  const { modals } = useModalsState()
  return modals.map((modal) => {
    if (modal.variant === 'confirmation') return <ConfirmationModal key={modal.id} {...modal} />
    return <Modal key={modal.id} {...modal} />
  })
}
