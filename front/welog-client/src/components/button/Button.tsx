import React from "react";

interface Props {
    onClick: React.MouseEventHandler<HTMLButtonElement>;
    // onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
    text: string;
    disabled? : boolean;
}

const Button = ({ onClick, text, disabled }: Props) => {
    return <button className="button" onClick={onClick} disabled={disabled}>{text}</button>
}

export default Button;