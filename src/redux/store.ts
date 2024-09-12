import { configureStore, ThunkAction, Action, combineReducers } from '@reduxjs/toolkit'
import { createWrapper } from 'next-redux-wrapper'
import { FLUSH, PAUSE, PERSIST, persistReducer, persistStore, PURGE, REGISTER, REHYDRATE } from 'redux-persist'
import { api } from '@/api'
import { authSlice } from '@/modules/auth/slices/authSlice'
import { sheetsSlice } from '@/modules/shared/slices/sheetManagerSlice'
import { setupListeners } from '@reduxjs/toolkit/query'
import { storage } from '../ui-shared-utils'

const rootReducer = combineReducers({
  [authSlice.name]: authSlice.reducer,
  [api.reducerPath]: api.reducer,
  [sheetsSlice.name]: sheetsSlice.reducer,
})

export const makeStore = () => {
  const isServer = typeof window === 'undefined'
  if (isServer) {
    const store = configureStore({
      reducer: rootReducer,
      devTools: true,
    })
    return {
      ...store,
      __persistor: persistStore(store),
    }
  }
  // we need it only on client side
  const persistConfig = {
    key: 'opencourier',
    whitelist: ['auth'], // make sure it does not clash with server keys
    storage,
  }
  const persistedReducer = persistReducer(persistConfig, rootReducer)
  const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }).concat(api.middleware) as any,
    devTools: process.env.NODE_ENV !== 'production',
  })
  setupListeners(store.dispatch)
  return {
    ...store,
    __persistor: persistStore(store),
  }
}

export type AppStore = ReturnType<typeof makeStore>
export type AppState = ReturnType<AppStore['getState']>
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, AppState, unknown, Action>

export const wrapper = createWrapper<AppStore>(makeStore)
