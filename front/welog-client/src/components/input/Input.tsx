import React from 'react';

interface Props {
    placeholder: string;
    type?: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    value: string;
}

const Input = ({ placeholder, type, onChange }: Props) => {
    return <input className="input" placeholder={placeholder} type={type} onChange={onChange} />
}

export default Input;