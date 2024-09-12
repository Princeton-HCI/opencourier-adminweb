const tagTypes = {
  addresses: 'Addresses',
  me: 'Me',
  merchant: 'Merchant',
  catalog: 'Catalog',
  orders: 'Orders',
}

export const Tags = {
  tagTypes: Object.keys(tagTypes).map((key) => (tagTypes as Record<string, string>)[key]),

  addresses: tagTypes['addresses'],
  me: tagTypes['me'],
  merchant: tagTypes['merchant'],
  catalog: tagTypes['catalog'],
  orders: tagTypes['orders'],
}
