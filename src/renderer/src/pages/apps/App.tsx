import MinAppLogo from '@renderer/components/Icons/MinAppLogo'
import MinApp from '@renderer/components/MinApp'
import { useMinapps } from '@renderer/hooks/useMinapps'
import { MinAppType } from '@renderer/types'
import type { MenuProps } from 'antd'
import { Dropdown, message } from 'antd'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import AddAppPopup from './AddAppPopup'

interface Props {
  app: MinAppType
  onClick?: () => void
  size?: number
}

const App: FC<Props> = ({ app, onClick, size = 60 }) => {
  const { t } = useTranslation()
  const { minapps, custom, pinned, updatePinnedMinapps, updateCustomMinapps, updateMinapps } = useMinapps()
  const isPinned = pinned.some((p) => p.id === app.id)
  const isCustom = app.type === 'custom'
  const isVisible = minapps.some((m) => m.id === app.id) || custom?.some((c) => c.id === app.id)

  const handleClick = () => {
    MinApp.start(app)
    onClick?.()
  }

  const handleEdit = async () => {
    const result = await AddAppPopup.show(app)
    if (result) {
      const newCustomApps = custom.map((c) => (c.id === app.id ? result : c))
      updateCustomMinapps(newCustomApps)

      const newMinapps = minapps.map((m) => (m.id === app.id ? result : m))
      updateMinapps(newMinapps)

      if (isPinned) {
        const newPinned = pinned.map((p) => (p.id === app.id ? result : p))
        updatePinnedMinapps(newPinned)
      }

      message.success(t('minapp.edit.success'))
    }
  }

  const handleDelete = () => {
    const newCustomApps = custom.filter((c) => c.id !== app.id)
    updateCustomMinapps(newCustomApps)

    const newMinapps = minapps.filter((m) => m.id !== app.id)
    updateMinapps(newMinapps)

    if (isPinned) {
      const newPinned = pinned.filter((p) => p.id !== app.id)
      updatePinnedMinapps(newPinned)
    }

    message.success(t('minapp.delete.success'))
  }

  const menuItems: MenuProps['items'] = [
    {
      key: 'togglePin',
      label: isPinned ? t('minapp.sidebar.remove.title') : t('minapp.sidebar.add.title'),
      onClick: () => {
        const newPinned = isPinned ? pinned.filter((item) => item.id !== app.id) : [...(pinned || []), app]
        updatePinnedMinapps(newPinned)
      }
    }
  ]

  if (isCustom) {
    menuItems.push(
      {
        key: 'edit',
        label: t('common.edit'),
        onClick: handleEdit
      },
      {
        key: 'delete',
        label: t('common.delete'),
        onClick: handleDelete
      }
    )
  }

  if (!isVisible) return null

  return (
    <Dropdown menu={{ items: menuItems }} trigger={['contextMenu']}>
      <Container onClick={handleClick}>
        <MinAppLogo name={app.name} logo={app.logo} size={size} />
        <AppTitle>{app.name}</AppTitle>
      </Container>
    </Dropdown>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  overflow: hidden;
`

const AppTitle = styled.div`
  font-size: 12px;
  margin-top: 5px;
  color: var(--color-text-soft);
  text-align: center;
  user-select: none;
  white-space: nowrap;
`

export default App
