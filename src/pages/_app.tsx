import AuthGuard from '@/modules/auth/components/auth-guard'
import { SheetsManager } from '@/modules/shared/components/SheetManager'
import { wrapper } from '@/redux/store'
import {
	ModalManager,
	Toaster,
	TooltipProvider,
} from '../admin-web-components';
import '../admin-web-components/styles/globals.css';
import dayjs from 'dayjs'
import enLocale from 'dayjs/locale/en'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import weekday from 'dayjs/plugin/weekday'
import { NextPage } from 'next'
import { AppProps } from 'next/app'
import Head from 'next/head'
import { ReactElement, ReactNode } from 'react'
import { PersistGate } from 'redux-persist/integration/react'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(weekday)
dayjs.locale({
  ...enLocale,
  weekStart: 1,
})

export type NextPageWithLayout<P = object, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode
}

export type WithLayout = {
  Component: NextPageWithLayout
}

export type WithAuth = {
  Component: {
    public?: boolean
  }
}

type AppPropsWithExtras = AppProps & WithLayout & WithAuth

function App({ Component, ...rest }: AppPropsWithExtras) {
  const { store, props } = wrapper.useWrappedStore(rest)
  const getLayout = Component.getLayout ?? ((page) => page)

  return (
    <TooltipProvider>
      <Head>
        <title>OpenCourier Admin</title>
      </Head>
      <PersistGate persistor={store.__persistor} loading={null}>
        {Component.public ? (
          getLayout(<Component {...props.pageProps} />)
        ) : (
          // <WebSocketProvider>
            <AuthGuard>
              {/* <GlobalEventListener /> */}
              <main>{getLayout(<Component {...props.pageProps} />)}</main>
            </AuthGuard>
          // </WebSocketProvider>
        )}
      </PersistGate>
      <Toaster />
      <SheetsManager />
      <ModalManager />
    </TooltipProvider>
  )
}

export default wrapper.withRedux(App)
