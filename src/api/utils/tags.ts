const tagTypes = {
  addresses: 'Addresses',
  me: 'Me',
  merchant: 'Merchant',
  catalog: 'Catalog',
  deliveries: 'Deliveries',
  customer: 'Customer',
  payment: 'Payment',
  config: 'Config',
  couriers: 'Couriers', // Added couriers tag type
  matchingResults: 'MatchingResults', // Added matching results tag type
}

export const Tags = {
  tagTypes: Object.keys(tagTypes)
    .map((key) => (tagTypes as Record<string, string>)[key])
    .filter((key): key is string => typeof key !== 'undefined'),

  addresses: tagTypes['addresses'],
  me: tagTypes['me'],
  merchant: tagTypes['merchant'],
  catalog: tagTypes['catalog'],
  deliveries: tagTypes['deliveries'],
  customer: tagTypes['customer'],
  payment: tagTypes['payment'],
  config: tagTypes['config'],
  couriers: tagTypes['couriers'], // Added couriers tag
  matchingResults: tagTypes['matchingResults'], // Added matching results tag
}
