import { CopyOutlined, DeleteOutlined } from '@ant-design/icons'
import { Button, Input, Select, Typography } from 'antd'
import dayjs from 'dayjs'
import { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

export interface TranslateRecord {
  id: string
  source: string
  target: string
  timestamp: number
  sourceLanguage: string
  targetLanguage: string
}

interface Props {
  records: TranslateRecord[]
  onDelete: (id: string) => void
  onClear: () => void
  maxRecords: number
  onMaxRecordsChange: (value: number) => void
}

const TranslateHistory: FC<Props> = ({ records, onDelete, onClear, maxRecords, onMaxRecordsChange }) => {
  const { Text } = Typography
  const { t } = useTranslation()
  const [customValue, setCustomValue] = useState<string>('')
  const [isCustomizing, setIsCustomizing] = useState(false)

  const historyLimitOptions = [
    { value: 20, label: '20' },
    { value: 50, label: '50' },
    { value: 100, label: '100' },
    { value: 200, label: '200' },
    { value: 500, label: '500' },
    { value: 1000, label: '1000' },
    { value: -1, label: t('translate.history.limit.custom') },
    { value: Infinity, label: t('translate.history.limit.unlimited') },
    { value: 0, label: t('translate.history.limit.disabled') }
  ]

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    window.message.success({
      content: t('common.copied'),
      key: 'copy-message'
    })
  }

  const formatTime = (timestamp: number) => dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss')

  const handleMaxRecordsChange = (value: number) => {
    if (value === -1) {
      setIsCustomizing(true)
      return
    }
    onMaxRecordsChange(value)
  }

  const handleCustomInputBlur = () => {
    setIsCustomizing(false)
    const numValue = parseInt(customValue, 10)
    if (!isNaN(numValue) && numValue > 0) {
      onMaxRecordsChange(numValue)
    } else {
      setCustomValue('')
    }
  }

  return (
    <HistoryContainer>
      <HistoryToolbar>
        <ToolbarContent>
          <HistorySettings>
            <Text type="secondary">{t('translate.history.count')}</Text>
            {isCustomizing ? (
              <CustomInput
                size="small"
                value={customValue}
                onChange={(e) => setCustomValue(e.target.value)}
                onBlur={handleCustomInputBlur}
                onPressEnter={handleCustomInputBlur}
                autoFocus
                variant="borderless"
              />
            ) : (
              <StyledSelect
                value={maxRecords === Infinity ? Infinity : maxRecords}
                onChange={(value: number) => handleMaxRecordsChange(value)}
                options={historyLimitOptions}
                popupMatchSelectWidth={false}
                size="small"
                variant="borderless"
              />
            )}
          </HistorySettings>
          <ClearButton type="text" danger size="small" onClick={onClear}>
            {t('translate.history.clear')}
          </ClearButton>
        </ToolbarContent>
      </HistoryToolbar>
      <RecordsList>
        {records.map((record) => (
          <RecordItem key={record.id}>
            <TimeStamp>
              <TimeText>{formatTime(record.timestamp)}</TimeText>
              <DeleteButton type="text" size="small" icon={<DeleteOutlined />} onClick={() => onDelete(record.id)} />
            </TimeStamp>
            <RecordContent>
              <RecordBox>
                <LanguageLabel>{record.sourceLanguage}</LanguageLabel>
                <TextContent>{record.source}</TextContent>
                <CopyButton type="text" icon={<CopyOutlined />} onClick={() => handleCopy(record.source)} />
              </RecordBox>
              <RecordBox>
                <LanguageLabel>{record.targetLanguage}</LanguageLabel>
                <TextContent>{record.target}</TextContent>
                <CopyButton type="text" icon={<CopyOutlined />} onClick={() => handleCopy(record.target)} />
              </RecordBox>
            </RecordContent>
          </RecordItem>
        ))}
      </RecordsList>
    </HistoryContainer>
  )
}

const HistoryContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--color-background);
`

const HistoryToolbar = styled.div`
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border-soft);
  flex-shrink: 0;
  background: var(--color-background);
`

const ToolbarContent = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const HistorySettings = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  .ant-typography {
    font-size: 13px;
    color: var(--color-text-2);
    white-space: nowrap;
  }
`

const StyledSelect = styled(Select<number>)`
  width: 120px;

`

const ClearButton = styled(Button)`
  font-size: 13px;
  padding: 4px 8px;
  height: 28px;

  &:hover {
    background: var(--color-error-bg);
  }
`

const RecordsList = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px;
  overflow-y: auto;
  height: 100%;
  gap: 16px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: var(--color-border);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-track {
    background-color: var(--color-background-soft);
  }
`

const RecordItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: var(--color-background);
  border-radius: 8px;
  border: 1px solid var(--color-border-soft);
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--color-primary);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`

const TimeStamp = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: var(--color-background-soft);
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  border-bottom: 1px solid var(--color-border-soft);
`

const TimeText = styled.span`
  font-size: 12px;
  color: var(--color-text-3);
`

const RecordContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 12px;
`

const RecordBox = styled.div`
  position: relative;
  padding: 12px;
  background: var(--color-fill-secondary);
  border-radius: 6px;
  transition: all 0.2s ease;
  min-height: 100px;
  cursor: pointer;

  &:hover {
    background: var(--color-background-soft);
  }
`

const LanguageLabel = styled.div`
  font-size: 12px;
  color: var(--color-text-3);
  margin-bottom: 8px;
  font-weight: 500;
`

const TextContent = styled.div`
  padding-right: 32px;
  word-break: break-word;
  line-height: 1.6;
  font-size: 14px;
  color: var(--color-text-1);
  white-space: pre-wrap;
  min-height: 42px;
`

const CopyButton = styled(Button)`
  position: absolute;
  right: 8px;
  top: 8px;
  opacity: 0;
  padding: 4px;
  height: 24px;
  width: 24px;
  transition: all 0.2s ease;

  ${RecordBox}:hover & {
    opacity: 1;
  }

  &:hover {
    color: var(--color-primary);
    background: var(--color-fill-secondary);
  }
`

const DeleteButton = styled(Button)`
  opacity: 0;
  padding: 4px;
  height: 24px;
  width: 24px;
  transition: all 0.2s ease;

  ${TimeStamp}:hover & {
    opacity: 1;
  }

  &:hover {
    color: var(--color-error);
    background: var(--color-fill-secondary);
  }
`

const CustomInput = styled(Input)`
  width: 80px !important;
  height: 28px !important;
  padding: 0 8px !important;
  font-size: 13px !important;

  &:focus {
    box-shadow: none;
  }

  &::placeholder {
    color: var(--color-text-3);
  }
`

export default TranslateHistory
