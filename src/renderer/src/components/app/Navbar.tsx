import { isMac, isWindows } from '@renderer/config/constant'
import { FC, PropsWithChildren } from 'react'
import styled from 'styled-components'

type Props = PropsWithChildren & JSX.IntrinsicElements['div']

export const Navbar: FC<Props> = ({ children, ...props }) => {
  return (
    <NavbarContainer {...props} style={{ paddingRight: isWindows ? 140 : 12 }}>
      {children}
    </NavbarContainer>
  )
}

export const NavbarLeft: FC<Props> = ({ children, ...props }) => {
  return <NavbarLeftContainer {...props}>{children}</NavbarLeftContainer>
}

export const NavbarCenter: FC<Props> = ({ children, ...props }) => {
  return <NavbarCenterContainer {...props}>{children}</NavbarCenterContainer>
}

export const NavbarRight: FC<Props> = ({ children, ...props }) => {
  return <NavbarRightContainer {...props}>{children}</NavbarRightContainer>
}

const NavbarContainer = styled.div`
  min-width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  min-height: var(--navbar-height);
  max-height: var(--navbar-height);
  -webkit-app-region: drag;
  padding: 0 ${isMac ? '20px' : '15px'};
  font-weight: bold;
`

const NavbarLeftContainer = styled.div`
  min-width: var(--assistants-width);
  padding: 0 10px;
  display: flex;
  flex-direction: row;
  align-items: center;
  font-weight: bold;
  color: var(--color-text-1);
`

const NavbarCenterContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  padding: 0 ${isMac ? '20px' : '15px'};
  font-weight: bold;
  color: var(--color-text-1);
`

const NavbarRightContainer = styled.div`
  min-width: var(--topic-list-width);
  display: flex;
  align-items: center;
  padding: 0 12px;
`
