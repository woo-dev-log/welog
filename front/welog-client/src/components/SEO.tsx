import { Helmet, HelmetProvider } from 'react-helmet-async';

interface Props {
    title: string;
    contents: string;
}

const SEO = ({ title, contents }: Props) => {
    return (
        <HelmetProvider>
            <Helmet>
                <title>{title} | 우리들의 일지</title>
                <meta name="description" content={contents} />
            </Helmet>
        </HelmetProvider>
    )
}

export default SEO;