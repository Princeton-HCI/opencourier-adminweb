import IMask from 'imask'
import parsePhoneNumber from 'libphonenumber-js'

export function formatPhone(phone: string) {
  return parsePhoneNumber(phone, 'US')?.formatNational() || phone
}

/**
 * Function to check if the phone number is valid. A valid phone number contains at least 5
 * numbers without the prefix.
 */
export function phoneNumberIsValid(p: string): boolean {
  return /^\d{5,10}$/.test(p)
}

const mask = { mask: '(000) 000-0000' }
export const phoneMask = {
  toMask: IMask.createPipe(mask, IMask.PIPE_TYPE.UNMASKED, IMask.PIPE_TYPE.MASKED),
  toRawValue: IMask.createPipe(mask, IMask.PIPE_TYPE.MASKED, IMask.PIPE_TYPE.UNMASKED),
}
