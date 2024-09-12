import { create } from '../../../../ui-shared-utils'
import { ConfirmationModalProps, CustomModalProps, ModalProps } from './types'

export const useModalsState = create<{ modals: ModalProps[] }>(() => ({ modals: [] }))

export const openModal = (modal: CustomModalProps) =>
  useModalsState.setState(({ modals }) => {
    const modalIndex = modals.findIndex((m) => m.id === modal.id)
    if (modalIndex === -1) {
      return { modals: [...modals, { variant: 'custom', ...modal }] }
    }
    return { modals }
  })

export const openConfirmationModal = (modal: ConfirmationModalProps) =>
  useModalsState.setState(({ modals }) => {
    const modalIndex = modals.findIndex((m) => m.id === modal.id)
    if (modalIndex === -1) {
      return { modals: [...modals, { variant: 'confirmation', ...modal }] }
    }
    return { modals }
  })

export const closeModal = (modalId: string) =>
  useModalsState.setState(({ modals }) => ({
    modals: modals.filter((modal) => modal.id !== modalId),
  }))
