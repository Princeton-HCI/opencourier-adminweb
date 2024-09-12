import { Address } from '@/shared-types'

export const transformAddress = (detail: google.maps.places.PlaceResult) => {
  if (!detail.address_components || !detail.geometry?.location) {
    return
  }

  const streetNumber = detail.address_components.find((component) =>
    component.types.includes('street_number')
  )?.long_name

  const route = detail.address_components.find((component) => component.types.includes('route'))?.long_name

  const administrativeDistrictLevel1 = detail.address_components.find((component) =>
    component.types.includes('administrative_area_level_1')
  )?.long_name

  const postalCode = detail.address_components.find((component) => component.types.includes('postal_code'))?.long_name
  const locality = detail.address_components.find((component) => component.types.includes('locality'))?.long_name
  const postalTown = detail.address_components.find((component) => component.types.includes('postal_town'))?.long_name
  const country = detail.address_components.find((component) => component.types.includes('country'))?.short_name

  const latitude = detail.geometry.location.lat()
  const longitude = detail.geometry.location.lng()

  return {
    addressLine1: `${streetNumber} ${route}`,
    locality: locality || postalTown || '',
    administrativeDistrictLevel1: administrativeDistrictLevel1 || '',
    postalCode: postalCode || '',
    country: country || '',
    latitude,
    longitude,
  }
}

export const getAddressDisplay = (address?: Omit<Address, 'country'>) => {
  if (!address) {
    return ''
  }
  return `${address.addressLine1}${address.addressLine2 ? ' ' + address.addressLine2 : ''}, ${address.locality}, ${
    address.postalCode
  }`
}
