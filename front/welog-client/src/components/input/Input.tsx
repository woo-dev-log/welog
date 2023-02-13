import React from 'react';

interface Props {
    placeholder: string;
    type?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onKeyUp?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
    disabled?: boolean;
}

const Input = ({ placeholder, type, value, onChange, onKeyUp, onFocus, disabled }: Props) => {
    return <input value={value} className="input" placeholder={placeholder} disabled={disabled}
        type={type} onChange={onChange} onKeyUp={onKeyUp} onFocus={onFocus} />
}

export default Input;