import React from 'react';
import styled from 'styled-components';
import { grey128, grey160, grey32 } from '../style/colors.js';

export const SidePanelContainer = styled.div`
  background: ${grey32};

  :first-child {
    border-top: none;
  }
`;

export const SidePanelHeader = styled.div`
  height: 40px;
  padding: 0 4px 0 24px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

type TitleProps = {
  label: string;
  componentName?: string;
};

export function SidePanelTitle({ label, componentName }: TitleProps) {
  return (
    <TitleContainer>
      <TitleLabel>{label}</TitleLabel>
      {typeof componentName === 'string' && (
        <ComponentName>
          {componentName ? componentName : `(anonymous)`}
        </ComponentName>
      )}
    </TitleContainer>
  );
}

export const SidePanelActions = styled.div`
  display: flex;
  flex-direction: row;
  gap: 4px;
`;

export const SidePanelBody = styled.div`
  padding: 0 4px 8px 4px;
`;

const TitleContainer = styled.div`
  color: ${grey128};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TitleLabel = styled.span`
  text-transform: uppercase;
`;

const ComponentName = styled.span`
  padding-left: 8px;
  color: ${grey160};
`;
