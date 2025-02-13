import {
  CheckOutlined,
  CloseOutlined,
  CopyOutlined,
  HistoryOutlined,
  SendOutlined,
  SettingOutlined,
  SwapOutlined,
  WarningOutlined
} from '@ant-design/icons'
import { Navbar, NavbarCenter } from '@renderer/components/app/Navbar'
import CopyIcon from '@renderer/components/Icons/CopyIcon'
import { isLocalAi } from '@renderer/config/env'
import { TranslateLanguageOptions } from '@renderer/config/translate'
import db from '@renderer/databases'
import { useDefaultModel } from '@renderer/hooks/useAssistant'
import { fetchTranslate } from '@renderer/services/ApiService'
import { getDefaultTranslateAssistant } from '@renderer/services/AssistantService'
import { Assistant, Message } from '@renderer/types'
import { runAsyncFunction, uuid } from '@renderer/utils'
import { Button, Select, Space } from 'antd'
import TextArea from 'antd/es/input/TextArea'
import { isEmpty } from 'lodash'
import { FC, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

import TranslateHistory, { TranslateRecord } from './TranslateHistory'

let _text = ''
let _result = ''
let _targetLanguage = 'english'

const TranslatePage: FC = () => {
  const { t } = useTranslation()
  const [targetLanguage, setTargetLanguage] = useState(_targetLanguage)
  const [text, setText] = useState(_text)
  const [result, setResult] = useState(_result)
  const { translateModel } = useDefaultModel()
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [history, setHistory] = useState<TranslateRecord[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [maxRecords, setMaxRecords] = useState<number>(50)

  _text = text
  _result = result
  _targetLanguage = targetLanguage

  useEffect(() => {
    runAsyncFunction(async () => {
      const savedHistory = await db.settings.get({ id: 'translate:history' })
      if (savedHistory?.value) {
        try {
          setHistory(savedHistory.value)
        } catch (e) {
          console.error('Failed to parse translate history:', e)
        }
      }
    })
  }, [])

  useEffect(() => {
    runAsyncFunction(async () => {
      await db.settings.put({ id: 'translate:history', value: history })
    })
  }, [history])

  const addToHistory = (source: string, target: string) => {
    if (maxRecords === 0) {
      return
    }

    const newRecord: TranslateRecord = {
      id: uuid(),
      source,
      target,
      timestamp: Date.now(),
      sourceLanguage: t('translate.any.language'),
      targetLanguage: TranslateLanguageOptions.find((opt) => opt.value === targetLanguage)?.label || targetLanguage
    }

    setHistory((prev) => {
      return [newRecord, ...prev].slice(0, maxRecords === Infinity ? undefined : maxRecords)
    })
  }

  const onTranslate = async () => {
    if (!text.trim()) {
      return
    }

    if (!translateModel) {
      window.message.error({
        content: t('translate.error.not_configured'),
        key: 'translate-message'
      })
      return
    }

    const assistant: Assistant = getDefaultTranslateAssistant(targetLanguage, text)
    const message: Message = {
      id: uuid(),
      role: 'user',
      content: '',
      assistantId: assistant.id,
      topicId: uuid(),
      model: translateModel,
      createdAt: new Date().toISOString(),
      type: 'text',
      status: 'sending'
    }

    let translatedResult = ''
    setLoading(true)
    try {
      await fetchTranslate({
        message,
        assistant,
        onResponse: (translatedText) => {
          translatedResult = translatedText
          setResult(translatedText)
        }
      })

      const finalResult = translatedResult.trim()
      if (finalResult) {
        addToHistory(text, finalResult)
      }
    } catch (error: any) {
      setResult('')
      window.message.error({
        content: error.message || t('translate.error.failed'),
        key: 'translate-message'
      })
    } finally {
      setLoading(false)
    }
  }

  const onCopy = () => {
    navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  useEffect(() => {
    isEmpty(text) && setResult('')
  }, [text])

  useEffect(() => {
    runAsyncFunction(async () => {
      const targetLang = await db.settings.get({ id: 'translate:target:language' })
      targetLang && setTargetLanguage(targetLang.value)
    })
  }, [])

  const handleDeleteRecord = (id: string) => {
    setHistory((prev) => prev.filter((record) => record.id !== id))
  }

  const handleClearHistory = () => {
    window.message.success({
      content: t('translate.history.cleared'),
      key: 'history-message'
    })
    setHistory([])
  }

  const handleMaxRecordsChange = (value: number) => {
    setMaxRecords(value)
    if (value === 0) {
      setHistory([])
    } else {
      setHistory((prev) => prev.slice(0, value === Infinity ? undefined : value))
    }
    runAsyncFunction(async () => {
      await db.settings.put({ id: 'translate:history:max-records', value })
    })
  }

  useEffect(() => {
    runAsyncFunction(async () => {
      const savedMaxRecords = await db.settings.get({ id: 'translate:history:max-records' })
      if (savedMaxRecords?.value !== undefined) {
        setMaxRecords(savedMaxRecords.value)
      }
    })
  }, [])

  const SettingButton = () => {
    if (isLocalAi) {
      return null
    }

    if (translateModel) {
      return (
        <Link to="/settings/model" style={{ color: 'var(--color-text-2)' }}>
          <SettingOutlined />
        </Link>
      )
    }

    return (
      <Link to="/settings/model" style={{ marginLeft: -10 }}>
        <Button
          type="link"
          style={{ color: 'var(--color-error)', textDecoration: 'underline' }}
          icon={<WarningOutlined />}>
          {t('translate.error.not_configured')}
        </Button>
      </Link>
    )
  }

  return (
    <Container>
      <Navbar>
        <NavbarCenter style={{ borderRight: 'none' }}>{t('translate.title')}</NavbarCenter>
      </Navbar>
      <ContentContainer id="content-container">
        {showHistory ? (
          <HistoryPanel>
            <HistoryHeader>
              <div>{t('translate.history.title')}</div>
              <CloseButton type="default" icon={<CloseOutlined />} onClick={() => setShowHistory(false)}>
                {t('common.close')}
              </CloseButton>
            </HistoryHeader>
            <TranslateHistory
              records={history}
              onDelete={handleDeleteRecord}
              onClear={handleClearHistory}
              maxRecords={maxRecords}
              onMaxRecordsChange={handleMaxRecordsChange}
            />
          </HistoryPanel>
        ) : (
          <>
            <MenuContainer>
              <Select
                showSearch
                value="any"
                style={{ width: 180 }}
                optionFilterProp="label"
                disabled
                options={[{ label: t('translate.any.language'), value: 'any' }]}
              />
              <SwapOutlined />
              <Select
                showSearch
                value={targetLanguage}
                style={{ width: 180 }}
                optionFilterProp="label"
                options={TranslateLanguageOptions}
                onChange={(value) => {
                  setTargetLanguage(value)
                  db.settings.put({ id: 'translate:target:language', value })
                }}
                optionRender={(option) => (
                  <Space>
                    <span role="img" aria-label={option.data.label}>
                      {option.data.emoji}
                    </span>
                    {option.label}
                  </Space>
                )}
              />
              <SettingButton />
              <Link to="#" style={{ color: 'var(--color-text-2)' }} onClick={() => setShowHistory(true)}>
                <HistoryOutlined />
              </Link>
            </MenuContainer>
            <MainContent>
              <TranslateInputWrapper>
                <InputContainer>
                  <InputWrapper>
                    <Textarea
                      variant="borderless"
                      placeholder={t('translate.input.placeholder')}
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      disabled={loading}
                      spellCheck={false}
                      allowClear
                    />
                    {text && (
                      <InputCopyButton
                        type="text"
                        icon={<CopyOutlined />}
                        onClick={() => {
                          navigator.clipboard.writeText(text)
                          window.message.success({
                            content: t('message.copied'),
                            key: 'copy-message'
                          })
                        }}
                      />
                    )}
                  </InputWrapper>
                  <TranslateButton
                    type="primary"
                    loading={loading}
                    onClick={onTranslate}
                    disabled={!text.trim()}
                    icon={<SendOutlined />}>
                    {t('translate.button.translate')}
                  </TranslateButton>
                </InputContainer>
                <OutputContainer>
                  <OutputText>{result || t('translate.output.placeholder')}</OutputText>
                  <CopyButton
                    onClick={onCopy}
                    disabled={!result}
                    icon={copied ? <CheckOutlined style={{ color: 'var(--color-primary)' }} /> : <CopyIcon />}
                  />
                </OutputContainer>
              </TranslateInputWrapper>
            </MainContent>
          </>
        )}
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
  flex-direction: column;
  height: 100%;
  padding: 20px;
`

const MainContent = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
`

const MenuContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 15px;
  gap: 20px;
`

const TranslateInputWrapper = styled.div`
  display: flex;
  flex-direction: row;
  min-height: 350px;
  gap: 20px;
`

const InputContainer = styled.div`
  position: relative;
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
  border: 1px solid var(--color-border-soft);
  border-radius: 10px;
`

const InputWrapper = styled.div`
  position: relative;
  flex: 1;
  display: flex;
`

const InputCopyButton = styled(Button)`
  position: absolute;
  right: 15px;
  top: 15px;
  opacity: 0;

  ${InputWrapper}:hover & {
    opacity: 1;
  }
`

const Textarea = styled(TextArea)`
  display: flex;
  flex: 1;
  padding: 20px;
  padding-right: 50px;
  font-size: 16px;
  overflow: auto;
`

const OutputContainer = styled.div`
  position: relative;
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
  padding: 10px;
  background-color: var(--color-background-soft);
  border-radius: 10px;
`

const OutputText = styled.div`
  padding: 5px 10px;
  max-height: calc(100vh - var(--navbar-height) - 120px);
  overflow: auto;
  white-space: pre-wrap;
`

const TranslateButton = styled(Button)`
  position: absolute;
  right: 15px;
  bottom: 15px;
  z-index: 10;
`

const CopyButton = styled(Button)`
  position: absolute;
  right: 15px;
  bottom: 15px;
`

const HistoryPanel = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  background: var(--color-background);
  border-radius: 10px;
  border: 1px solid var(--color-border-soft);
  overflow: hidden;
  min-height: 0;
  height: 100%;
`

const HistoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid var(--color-border-soft);
  font-size: 16px;
  font-weight: 500;
  flex-shrink: 0;
`

const CloseButton = styled(Button)`
  font-size: 14px;
  padding: 4px 12px;
  border-radius: 4px;
  color: var(--color-text-2);

  &:hover {
    color: var(--color-text-1);
    background: var(--color-fill-secondary);
  }
`

export default TranslatePage
