import React from "react";

interface Props {
    className?: string;
    disabled?: boolean;
    onClick: React.MouseEventHandler<HTMLButtonElement>;
    text: string;
}

const Button = ({ className, disabled, onClick, text }: Props) => {
    return (
        <button
            className={className}
            disabled={disabled}
            onClick={onClick}>
            {text}
        </button>
    )
}

export default Button;