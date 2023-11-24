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

const Input = ({ type, className, placeholder, autoFocus, disabled, ...rest }: Props) => {
    return (
        <input
            name="input"
            type={type}
            className={className}
            placeholder={placeholder}
            autoFocus={autoFocus}
            disabled={disabled}
            {...rest}
        />
    );
}

export default Input;