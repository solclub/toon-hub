import styled from 'styled-components';
import Image from 'next/image'

const Container = styled.div`
    width: 96px;
    position: relative;
    height: auto;
    aspect-ratio: 1 / 1;
    border-bottom: 6px solid #fcec76;
    border-radius: 16px;
    box-shadow: 0px 2px 0px 0px rgba(0, 0, 0, 0.25);

    & > img {
        left: 0;
        top: 0;
        position: absolute;
        object-fit: cover;
        width: 100%;
        height: 100%;
        z-index: -1;
    }
`;

interface ToonCardProps {
    bgImageUrl: string;
    children?: JSX.Element;
    className?: string;
}

const ToonCard: React.FC<ToonCardProps> = ({ bgImageUrl, children, className }) => {
    return (
        <Container className={className}>
            <Image src={bgImageUrl} alt="toon card" />
            {children}
        </Container>
    )
}

export default ToonCard;