// AlarmAddressOffsetForm.tsx
import React, { useState, useEffect } from 'react';
import { AddressRange } from '../types/plc';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ALARM_LABELS } from '../localization/constants/alarm-labels';

interface AddressOffsetFormProps {
  addressRanges: AddressRange[];
  onOffsetChange: (addressType: string, address: string) => void;
}

const AddressOffsetForm: React.FC<AddressOffsetFormProps> = ({ addressRanges, onOffsetChange }) => {
  const [selectedAddressType, setSelectedAddressType] = useState<string>('');
  const [offsetAddress, setOffsetAddress] = useState<string>('0');

  useEffect(() => {
    if (addressRanges.length > 0 && !selectedAddressType) {
      setSelectedAddressType(addressRanges[0].address_type);
      onOffsetChange(addressRanges[0].address_type, '0');
    }
  }, [addressRanges, selectedAddressType, onOffsetChange]);

  const handleAddressTypeChange = (value: string) => {
    setSelectedAddressType(value);
    setOffsetAddress('0');
    onOffsetChange(value, '0');
  };

  const handleOffsetAddressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newOffsetAddress = event.target.value.toUpperCase();
    setOffsetAddress(newOffsetAddress);
    onOffsetChange(selectedAddressType, newOffsetAddress);
  };

  const isAddressValid = (address: string) => {
    const range = addressRanges.find(range => range.address_type === selectedAddressType);
    if (!range) return false;

    const [start, end] = range.address_range.split('-').map(addr => parseInt(addr, range.numerical_base === 'hex' ? 16 : 10));
    const addressNum = parseInt(address, range.numerical_base === 'hex' ? 16 : 10);

    return !isNaN(addressNum) && addressNum >= start && addressNum <= end;
  };

  const isInvalid = !!offsetAddress && !isAddressValid(offsetAddress);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="address-type">{ALARM_LABELS.FIELDS.ADDRESS_TYPE}</Label>
        <Select value={selectedAddressType} onValueChange={handleAddressTypeChange}>
          <SelectTrigger id="address-type">
            <SelectValue placeholder={ALARM_LABELS.PLACEHOLDERS.SELECT_ADDRESS_TYPE} />
          </SelectTrigger>
          <SelectContent>
            {addressRanges.map((range) => (
              <SelectItem key={range.address_type} value={range.address_type}>
                {range.address_type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="offset-address">{ALARM_LABELS.FIELDS.OFFSET_ADDRESS}</Label>
        <Input
          id="offset-address"
          value={offsetAddress}
          onChange={handleOffsetAddressChange}
          className={isInvalid ? 'border-destructive' : ''}
          placeholder={ALARM_LABELS.PLACEHOLDERS.OFFSET_ADDRESS}
        />
        {isInvalid && (
          <p className="text-sm text-destructive">{ALARM_LABELS.VALIDATION.ADDRESS_OUT_OF_RANGE}</p>
        )}
      </div>
    </div>
  );
};

export default AddressOffsetForm;
