import React from 'react';
import { FixtureStateSelectControl } from '../../../utils/fixtureState/types';
import { Select } from '../../components/inputs/Select';
import {
  Label,
  ValueDataContainer,
  ValueInputContainer,
} from '../../components/ValueInputTree/ValueInput/shared';
import { lightBlue } from '../../style/colors';

type Props = {
  name: string;
  control: FixtureStateSelectControl;
  onChange: (name: string, select: FixtureStateSelectControl) => unknown;
};

export function SelectValueInput({ name, control, onChange }: Props) {
  const { options, currentValue } = control;
  const id = `select-${name}`;
  return (
    <ValueInputContainer key={name}>
      <Label title={name} htmlFor={id}>
        {name}
      </Label>
      <ValueDataContainer>
        <Select
          id={id}
          options={options.map(option => ({ value: option, label: option }))}
          value={currentValue}
          color={lightBlue}
          height={24}
          padding={5}
          onChange={newValue =>
            onChange(name, {
              ...control,
              currentValue: newValue.value,
            })
          }
        />
      </ValueDataContainer>
    </ValueInputContainer>
  );
}
