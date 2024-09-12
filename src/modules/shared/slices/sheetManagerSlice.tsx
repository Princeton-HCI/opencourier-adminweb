import { AppState } from '@/redux/store'
import { createSlice } from '@reduxjs/toolkit'
import { ReactNode } from 'react'

type SheetProps = {
  id: string
  isLoading?: boolean
  children: ReactNode
}

export const sheetsSlice = createSlice({
  name: 'sheets',
  initialState: { sheets: [] as SheetProps[] },
  reducers: {
    openSheet: (state, action) => {
      const sheetIndex = state.sheets.findIndex((m) => m.id === action.payload.id)
      if (sheetIndex === -1) {
        state.sheets.push({ variant: 'custom', ...action.payload })
      }
    },
    closeSheet: (state, action) => {
      state.sheets = state.sheets.filter((sheet) => sheet.id !== action.payload)
    },
  },
})

export const { openSheet, closeSheet } = sheetsSlice.actions
export const selectSheets = (state: AppState) => state.sheets.sheets
export default sheetsSlice.reducer
