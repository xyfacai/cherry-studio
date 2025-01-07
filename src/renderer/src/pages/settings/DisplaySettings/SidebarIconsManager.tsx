import { CloseOutlined } from '@ant-design/icons'
import { FC } from 'react'
import {
  DragDropContext as DragDropContextType,
  Draggable as DraggableType,
  Droppable as DroppableType
} from 'react-beautiful-dnd'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { SidebarIcon } from '../../../store/settings'

const DragDropContext = DragDropContextType as any
const Droppable = DroppableType as any
const Draggable = DraggableType as any

interface SidebarIconsManagerProps {
  visibleIcons: SidebarIcon[]
  disabledIcons: SidebarIcon[]
  onDragEnd: (result: any) => void
  onMoveIcon: (icon: SidebarIcon, fromList: 'visible' | 'disabled') => void
  renderIcon: (icon: SidebarIcon) => React.ReactNode
}

const SidebarIconsManager: FC<SidebarIconsManagerProps> = ({
  visibleIcons,
  disabledIcons,
  onDragEnd,
  onMoveIcon,
  renderIcon
}) => {
  const { t } = useTranslation()

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <IconSection>
        <IconColumn>
          <h4>{t('settings.display.sidebar.visible')}</h4>
          <Droppable droppableId="visible">
            {(provided) => (
              <IconList ref={provided.innerRef} {...provided.droppableProps}>
                {visibleIcons.map((icon, index) => (
                  <Draggable key={icon.id} draggableId={icon.id} index={index}>
                    {(provided) => (
                      <IconItem ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                        <IconContent>
                          {renderIcon(icon)}
                          <span>{t(icon.title)}</span>
                        </IconContent>
                        {icon.id !== 'chat' && (
                          <CloseButton onClick={() => onMoveIcon(icon, 'visible')}>
                            <CloseOutlined />
                          </CloseButton>
                        )}
                      </IconItem>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </IconList>
            )}
          </Droppable>
        </IconColumn>
        <IconColumn>
          <h4>{t('settings.display.sidebar.disabled')}</h4>
          <Droppable droppableId="disabled">
            {(provided) => (
              <IconList ref={provided.innerRef} {...provided.droppableProps}>
                {disabledIcons.length === 0 ? (
                  <EmptyPlaceholder>{t('settings.display.sidebar.empty')}</EmptyPlaceholder>
                ) : (
                  disabledIcons.map((icon, index) => (
                    <Draggable key={icon.id} draggableId={icon.id} index={index}>
                      {(provided) => (
                        <IconItem ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                          <IconContent>
                            {renderIcon(icon)}
                            <span>{t(icon.title)}</span>
                          </IconContent>
                          <CloseButton onClick={() => onMoveIcon(icon, 'disabled')}>
                            <CloseOutlined />
                          </CloseButton>
                        </IconItem>
                      )}
                    </Draggable>
                  ))
                )}
                {provided.placeholder}
              </IconList>
            )}
          </Droppable>
        </IconColumn>
      </IconSection>
    </DragDropContext>
  )
}

// Styled components remain the same
const IconSection = styled.div`
  display: flex;
  gap: 20px;
  padding: 10px;
  background: var(--color-background);
`

const IconColumn = styled.div`
  flex: 1;

  h4 {
    margin-bottom: 10px;
    color: var(--color-text);
    font-weight: normal;
  }
`

const IconList = styled.div`
  height: 365px;
  min-height: 365px;
  padding: 10px;
  background: var(--color-background-soft);
  border-radius: 8px;
  border: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  overflow-y: hidden;
`

const IconItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  margin-bottom: 8px;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  cursor: move;
`

const IconContent = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  .iconfont {
    font-size: 16px;
    color: var(--color-text);
  }

  span {
    color: var(--color-text);
  }
`

const CloseButton = styled.div`
  cursor: pointer;
  color: var(--color-text-2);
  opacity: 0;
  transition: all 0.2s;

  &:hover {
    color: var(--color-text);
  }

  ${IconItem}:hover & {
    opacity: 1;
  }
`

const EmptyPlaceholder = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  color: var(--color-text-2);
  text-align: center;
  padding: 20px;
  font-size: 14px;
`

export default SidebarIconsManager
