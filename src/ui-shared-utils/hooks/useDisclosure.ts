import { useCallbackRef } from './useCallbackRef'
import React, { useCallback, useState, useId } from 'react'

export interface UseDisclosureProps {
  isOpen?: boolean
  defaultIsOpen?: boolean
  onClose?(): void
  onOpen?(): void
  id?: string
}

type HTMLProps = React.HTMLAttributes<HTMLElement>

/**
 * `useDisclosure` is a custom hook used to help handle common open, close, or toggle scenarios.
 * It can be used to control feedback component such as `Modal`, `AlertDialog`, `Drawer`, etc.
 */
export function useDisclosure(props: UseDisclosureProps = {}) {
  const { onClose: onCloseProp, onOpen: onOpenProp, isOpen: isOpenProp, id: idProp } = props

  const handleOpen = useCallbackRef(onOpenProp)
  const handleClose = useCallbackRef(onCloseProp)

  const [isOpenState, setIsOpen] = useState(props.defaultIsOpen || false)

  const isOpen = isOpenProp !== undefined ? isOpenProp : isOpenState

  const isControlled = isOpenProp !== undefined

  const uid = useId()
  const id = idProp ?? `disclosure-${uid}`

  const onClose = useCallback(() => {
    if (!isControlled) {
      setIsOpen(false)
    }
    handleClose()
  }, [isControlled, handleClose])

  const onOpen = useCallback(() => {
    if (!isControlled) {
      setIsOpen(true)
    }
    handleOpen()
  }, [isControlled, handleOpen])

  const onToggle = useCallback(() => {
    if (isOpen) {
      onClose()
    } else {
      onOpen()
    }
  }, [isOpen, onOpen, onClose])

  function getButtonProps(buttonProps: HTMLProps = {}): HTMLProps {
    return {
      ...buttonProps,
      'aria-expanded': isOpen,
      'aria-controls': id,
      onClick(event) {
        buttonProps.onClick?.(event)
        onToggle()
      },
    }
  }

  function getDisclosureProps(disclosureProps: HTMLProps = {}): HTMLProps {
    return {
      ...disclosureProps,
      hidden: !isOpen,
      id,
    }
  }

  return {
    isOpen,
    onOpen,
    onClose,
    onToggle,
    isControlled,
    getButtonProps,
    getDisclosureProps,
  }
}

export type UseDisclosureReturn = ReturnType<typeof useDisclosure>
