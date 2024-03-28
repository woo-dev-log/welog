import { useCallback, useEffect, useState } from 'react';
import './ProgressBar.scss';

const ProgressBar = () => {
    const [progress, setProgress] = useState(0);

    const handleScroll = useCallback(() => {
        const { scrollHeight, scrollTop, clientHeight } = document.documentElement;

        const windowHeight = scrollHeight - clientHeight;
        setProgress((scrollTop / windowHeight) * 100);
    }, []);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <progress
            value={progress}
            max={100}
            className="progressbar-read"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
        ></progress>
    );
}

export default ProgressBar;