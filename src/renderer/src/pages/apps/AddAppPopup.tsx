import { TopView } from '@renderer/components/TopView'
import { useMinapps } from '@renderer/hooks/useMinapps'
import { useAppDispatch } from '@renderer/store'
import { setCustomMinApps } from '@renderer/store/minapps'
import { MinAppType } from '@renderer/types'
import { Divider, Form, Input, Modal } from 'antd'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface Props {
  resolve: (result: MinAppType | null) => void
  app?: MinAppType
}

const PopupContainer: React.FC<Props> = ({ resolve, app }) => {
  const [open, setOpen] = useState(true)
  const [form] = Form.useForm()
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { custom } = useMinapps()

  useEffect(() => {
    if (app) {
      form.setFieldsValue({
        id: app.id,
        name: app.name,
        url: app.url,
        icon: app.logo
      })
    }
  }, [app, form])

  const onOk = async () => {
    try {
      const values = await form.validateFields()
      const newApp: MinAppType = {
        id: app?.id || `custom-${Date.now()}`,
        name: values.name.trim(),
        url: values.url.trim(),
        logo: values.icon,
        type: 'custom',
        bordered: true
      }

      if (!app) {
        dispatch(setCustomMinApps([...(custom || []), newApp]))
      }
      setOpen(false)
      form.resetFields()
      resolve(newApp)
    } catch (error) {
      console.error('Validation failed:', error)
    }
  }

  const onCancel = () => {
    setOpen(false)
    resolve(null)
  }

  return (
    <Modal
      open={open}
      onOk={onOk}
      onCancel={onCancel}
      width={360}
      closable={false}
      centered
      title={app ? t('minapp.edit.title') : t('minapp.add.title')}>
      <Divider style={{ margin: '8px 0' }} />
      <Form form={form} layout="vertical" style={{ gap: 8 }}>
        <Form.Item
          name="name"
          label={t('minapp.add.name')}
          rules={[{ required: true, message: t('minapp.add.name.required') }]}
          style={{ marginBottom: 8 }}>
          <Input placeholder={t('minapp.add.name.placeholder')} maxLength={32} />
        </Form.Item>
        <Form.Item
          name="url"
          label={t('minapp.add.url')}
          rules={[{ required: true, message: t('minapp.add.url.required') }]}
          style={{ marginBottom: 8 }}>
          <Input placeholder={t('minapp.add.url.placeholder')} />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default class AddAppPopup {
  static hide() {
    TopView.hide('AddAppPopup')
  }

  static show(app?: MinAppType) {
    return new Promise<MinAppType | null>((resolve) => {
      TopView.show(
        <PopupContainer
          app={app}
          resolve={(v) => {
            resolve(v)
            this.hide()
          }}
        />,
        'AddAppPopup'
      )
    })
  }
}
