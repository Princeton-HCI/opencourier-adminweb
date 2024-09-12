import { DefaultLayout } from '@/components/layouts/DefaultLayout'
import { ReactElement } from 'react'
import { NextPageWithLayout } from './_app'

const HomePage: NextPageWithLayout = () => {
  return (
    <>
      <h2 className="mb-4 text-2xl font-bold tracking-tight">Welcome back</h2>
      <p className="text-muted-foreground">What would you like to do today?</p>
    </>
  )
}

HomePage.getLayout = (page: ReactElement) => <DefaultLayout>{page}</DefaultLayout>

export default HomePage
