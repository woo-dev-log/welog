import React from 'react';

interface Props {
    placeholder: string;
    type?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    onKeyUp?: (e: React.KeyboardEvent<HTMLInputElement>) => void
}

const Input = ({ placeholder, type, value, onChange, onKeyUp }: Props) => {
    return <input value={value} className="input" placeholder={placeholder} type={type} onChange={onChange} onKeyUp={onKeyUp}/>
}

export default Input;