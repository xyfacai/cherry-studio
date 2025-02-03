import { NavigateFunction } from 'react-router-dom'

interface INavigationService {
  navigate: NavigateFunction | null
  setNavigate: (navigateFunc: NavigateFunction) => void
  goBack: () => void
}

const NavigationService: INavigationService = {
  navigate: null,

  setNavigate: (navigateFunc: NavigateFunction): void => {
    NavigationService.navigate = navigateFunc
  },

  goBack: (): void => {
    NavigationService.navigate?.(-1)
  }
}

export default NavigationService
