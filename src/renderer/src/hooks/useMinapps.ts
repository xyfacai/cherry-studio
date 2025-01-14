import { RootState, useAppDispatch, useAppSelector } from '@renderer/store'
import { setCustomMinApps, setDisabledMinApps, setMinApps, setPinnedMinApps } from '@renderer/store/minapps'
import { MinAppType } from '@renderer/types'

export const useMinapps = () => {
  const { enabled, disabled, pinned, custom } = useAppSelector((state: RootState) => state.minapps)
  const dispatch = useAppDispatch()

  return {
    minapps: enabled,
    disabled,
    pinned,
    custom,
    updateMinapps: (minapps: MinAppType[]) => {
      dispatch(setMinApps(minapps))
    },
    updateDisabledMinapps: (minapps: MinAppType[]) => {
      dispatch(setDisabledMinApps(minapps))
    },
    updatePinnedMinapps: (minapps: MinAppType[]) => {
      dispatch(setPinnedMinApps(minapps))
    },
    updateCustomMinapps: (minapps: MinAppType[]) => {
      dispatch(setCustomMinApps(minapps))
    }
  }
}
