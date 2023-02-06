import "./Label.scss";

interface Props {
    text: string;
}

const Label = ({ text }: Props) => {
    return <div className="label">{text}</div>
}

export default Label;