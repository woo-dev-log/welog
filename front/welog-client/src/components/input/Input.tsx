import React from 'react';

interface Props {
    type?: string;
    className?: string;
    placeholder: string;
    autoFocus?: boolean;
    value?: string;
    disabled?: boolean;
    onChange: React.ChangeEventHandler<HTMLInputElement>;
    onKeyUp?: React.KeyboardEventHandler<HTMLInputElement>;
    onFocus?: React.FocusEventHandler<HTMLInputElement>;
}

const Input = ({ type = "text", className = "input", placeholder, autoFocus, disabled, value = "", ...rest }: Props) => {
    return (
        <input
            name="input"
            type={type}
            className={className}
            placeholder={placeholder}
            autoFocus={autoFocus}
            disabled={disabled}
            value={value}
            {...rest}
        />
    );
}

export default Input;