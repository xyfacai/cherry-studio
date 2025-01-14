import { generateColorFromChar, getFirstCharacter } from '@renderer/utils'
import { Avatar } from 'antd'
import { FC } from 'react'
import styled from 'styled-components'

interface MinAppLogoProps {
  name: string
  logo?: string
  size?: number
  style?: React.CSSProperties
}

const MinAppLogo: FC<MinAppLogoProps> = ({ name, logo, size = 25, style }) => {
  if (logo) {
    return <AppLogo src={logo} alt={name} size={size} style={style} />
  }

  return (
    <AppAvatar
      size={size}
      shape="square"
      style={{ backgroundColor: generateColorFromChar(name), minWidth: size, ...style }}>
      {getFirstCharacter(name)}
    </AppAvatar>
  )
}

const AppLogo = styled.img<{ size: number }>`
  width: ${(props) => props.size}px;
  height: ${(props) => props.size}px;
  border-radius: 4px;
  object-fit: contain;
`

const AppAvatar = styled(Avatar)`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  font-size: ${(props) => ((props.size as number) || 25) * 0.6}px;
`

export default MinAppLogo
