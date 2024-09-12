const tagTypes = {
  addresses: 'Addresses',
  me: 'Me',
  merchant: 'Merchant',
  catalog: 'Catalog',
  deliveries: 'Deliveries',
  customer: 'Customer',
  payment: 'Payment',
  config: 'Config',
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
}
