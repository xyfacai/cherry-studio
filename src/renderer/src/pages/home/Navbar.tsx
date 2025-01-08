import { FormOutlined, SearchOutlined } from '@ant-design/icons'
import { Navbar } from '@renderer/components/app/Navbar'
import { HStack } from '@renderer/components/Layout'
import AppStorePopover from '@renderer/components/Popups/AppStorePopover'
import SearchPopup from '@renderer/components/Popups/SearchPopup'
import { useAssistant } from '@renderer/hooks/useAssistant'
import { useSettings } from '@renderer/hooks/useSettings'
import { useShortcut } from '@renderer/hooks/useShortcuts'
import { useShowAssistants, useShowTopics } from '@renderer/hooks/useStore'
import AssistantSettingsPopup from '@renderer/pages/settings/AssistantSettings'
import { EVENT_NAMES, EventEmitter } from '@renderer/services/EventService'
import { useAppDispatch } from '@renderer/store'
import { setNarrowMode } from '@renderer/store/settings'
import { Assistant, Topic } from '@renderer/types'
import { FC } from 'react'
import styled from 'styled-components'

import SelectModelButton from './components/SelectModelButton'

interface Props {
  activeAssistant: Assistant
  activeTopic: Topic
  setActiveTopic: (topic: Topic) => void
}

const HeaderNavbar: FC<Props> = ({ activeAssistant }) => {
  const { assistant } = useAssistant(activeAssistant.id)
  const { showAssistants, toggleShowAssistants } = useShowAssistants()
  const { topicPosition, sidebarIcons, narrowMode } = useSettings()
  const { showTopics, toggleShowTopics } = useShowTopics()
  const dispatch = useAppDispatch()

  useShortcut('toggle_show_assistants', () => {
    toggleShowAssistants()
  })

  useShortcut('toggle_show_topics', () => {
    if (topicPosition === 'right') {
      toggleShowTopics()
    } else {
      EventEmitter.emit(EVENT_NAMES.SHOW_TOPIC_SIDEBAR)
    }
  })

  useShortcut('search_message', () => {
    SearchPopup.show()
  })

  return (
    <Navbar className="home-navbar">
      <HStack alignItems="center" gap={8}>
        {showAssistants ? (
          <NavbarIcon onClick={toggleShowAssistants}>
            <i className="iconfont icon-hide-sidebar" />
          </NavbarIcon>
        ) : (
          <NavbarIcon onClick={() => toggleShowAssistants()}>
            <i className="iconfont icon-show-sidebar" />
          </NavbarIcon>
        )}
        <TitleText
          style={{ marginRight: 10, cursor: 'pointer' }}
          className="nodrag"
          onClick={() => AssistantSettingsPopup.show({ assistant })}>
          {assistant.name}
        </TitleText>
        <SelectModelButton assistant={assistant} />
      </HStack>
      <HStack alignItems="center" gap={8}>
        <NavbarIcon onClick={() => EventEmitter.emit(EVENT_NAMES.ADD_NEW_TOPIC)}>
          <FormOutlined />
        </NavbarIcon>
        <NarrowIcon onClick={() => SearchPopup.show()}>
          <SearchOutlined />
        </NarrowIcon>
        <NarrowIcon onClick={() => dispatch(setNarrowMode(!narrowMode))}>
          <i className="iconfont icon-icon-adaptive-width"></i>
        </NarrowIcon>
        {sidebarIcons.visible.includes('minapp') && (
          <AppStorePopover>
            <NarrowIcon>
              <i className="iconfont icon-appstore" />
            </NarrowIcon>
          </AppStorePopover>
        )}
        {topicPosition === 'right' && (
          <NarrowIcon onClick={toggleShowTopics}>
            <i className={`iconfont icon-${showTopics ? 'show' : 'hide'}-sidebar`} />
          </NarrowIcon>
        )}
      </HStack>
    </Navbar>
  )
}

export const NavbarIcon = styled.div`
  -webkit-app-region: none;
  border-radius: 8px;
  height: 30px;
  padding: 0 7px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  transition: all 0.2s ease-in-out;
  cursor: pointer;
  .iconfont {
    font-size: 18px;
    color: var(--color-icon);
    &.icon-a-addchat {
      font-size: 20px;
    }
    &.icon-a-darkmode {
      font-size: 20px;
    }
    &.icon-appstore {
      font-size: 20px;
    }
  }
  .anticon {
    color: var(--color-icon);
    font-size: 16px;
  }
  &:hover {
    background-color: var(--color-background-mute);
    color: var(--color-icon-white);
  }
`

const TitleText = styled.span`
  margin-left: 5px;
  font-family: Ubuntu;
  font-size: 12px;
  user-select: none;
  @media (max-width: 1080px) {
    display: none;
  }
`

const NarrowIcon = styled(NavbarIcon)`
  @media (max-width: 1000px) {
    display: none;
  }
`

export default HeaderNavbar
