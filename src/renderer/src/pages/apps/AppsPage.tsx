import { PlusOutlined, SearchOutlined } from '@ant-design/icons'
import { Navbar, NavbarCenter } from '@renderer/components/app/Navbar'
import { Center } from '@renderer/components/Layout'
import { useMinapps } from '@renderer/hooks/useMinapps'
import { Empty, Input, message } from 'antd'
import { isEmpty } from 'lodash'
import React, { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import AddAppPopup from './AddAppPopup'
import App from './App'

const AppsPage: FC = () => {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const { minapps, custom, disabled } = useMinapps()

  // 修改过滤逻辑，确保不会出现重复数据
  const allApps = [
    ...minapps,
    ...(custom || []).filter(
      (c) =>
        // 确保自定义应用不在 minapps 中且不在禁用列表中
        !minapps.some((m) => m.id === c.id) && !disabled.some((d) => d.id === c.id)
    )
  ]

  const filteredApps = search
    ? allApps.filter(
        (app) => app.name.toLowerCase().includes(search.toLowerCase()) || app.url.includes(search.toLowerCase())
      )
    : allApps

  // Calculate the required number of lines
  const itemsPerRow = Math.floor(930 / 115) // Maximum width divided by the width of each item (including spacing)
  const rowCount = Math.ceil(filteredApps.length / itemsPerRow)
  // Each line height is 85px (60px icon + 5px margin + 12px text + spacing)
  const containerHeight = rowCount * 85 + (rowCount - 1) * 25 // 25px is the line spacing.

  // Disable right-click menu in blank area
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
  }

  const handleAddMinApp = async () => {
    const result = await AddAppPopup.show()
    if (result) {
      message.success(t('minapp.add.success'))
    }
  }

  return (
    <Container onContextMenu={handleContextMenu}>
      <Navbar>
        <NavbarCenter style={{ borderRight: 'none', justifyContent: 'space-between' }}>
          {t('minapp.title')}
          <Input
            placeholder={t('common.search')}
            className="nodrag"
            style={{ width: '30%', height: 28 }}
            size="small"
            variant="filled"
            suffix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div style={{ width: 80 }} />
        </NavbarCenter>
      </Navbar>
      <ContentContainer id="content-container">
        <AppsContainer style={{ height: containerHeight }}>
          {filteredApps.map((app) => (
            <App key={app.id} app={app} />
          ))}
          <AddAppButton onClick={handleAddMinApp}>
            <PlusOutlined style={{ fontSize: '24px' }} />
            <div>{t('minapp.add.title')}</div>
          </AddAppButton>
          {isEmpty(filteredApps) && (
            <Center style={{ flex: 1 }}>
              <Empty />
            </Center>
          )}
        </AppsContainer>
      </ContentContainer>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
`

const ContentContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: row;
  justify-content: center;
  height: 100%;
  overflow-y: auto;
  padding: 50px;
`

const AppsContainer = styled.div`
  display: grid;
  min-width: 0;
  max-width: 930px;
  width: 100%;
  grid-template-columns: repeat(auto-fill, 90px);
  gap: 25px;
  justify-content: center;
`

const AddAppButton = styled.div`
  width: 90px;
  height: 90px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 1px dashed #d9d9d9;
  border-radius: 8px;

  &:hover {
    border-color: #40a9ff;
    color: #40a9ff;
  }
`

export default AppsPage
