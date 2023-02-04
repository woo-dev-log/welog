import React from 'react';
import './Input.scss';

interface Props {
    placeholder: string;
    type?: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const Input = ({ placeholder, type, onChange }: Props) => {
    return <input className="input" placeholder={placeholder} type={type} onChange={onChange} />
}

export default Input;