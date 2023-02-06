import React from "react";

interface Props {
    onClick: React.MouseEventHandler<HTMLButtonElement>;
    // onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
    text: string;
}

const Button = ({ onClick, text }: Props) => {
    return <button className="button" onClick={onClick}>{text}</button>
}

export default Button;