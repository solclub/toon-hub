import React from 'react'
import styled from 'styled-components';
import bgImageUrl from '../../assets/images/toon-of-ladder/card-bg.png'
import bgImageUrl1 from '../../assets/images/toon-of-ladder/card-bg1.png'
import bgImageUrl2 from '../../assets/images/toon-of-ladder/card-bg2.png'
import bgImageUrl3 from '../../assets/images/toon-of-ladder/card-bg3.png'
import bgImageUrl4 from '../../assets/images/toon-of-ladder/card-bg4.png'
import bgImageUrl5 from '../../assets/images/toon-of-ladder/card-bg5.png'
import Carousel, { type RenderArrowProps } from "react-elastic-carousel";
import MainButton from 'components/common/MainButton';

const MainToonCard = () => {

    const carouselChildren = {
        children: [
            <DefaultToonCard key={1} $bgImageUrl={bgImageUrl1.src} className='rounded-md' />,
            <DefaultToonCard key={2} $bgImageUrl={bgImageUrl2.src} className='rounded-md' />,
            <DefaultToonCard key={3} $bgImageUrl={bgImageUrl3.src} className='rounded-md' />,
            <DefaultToonCard key={4} $bgImageUrl={bgImageUrl4.src} className='rounded-md' />,
            <DefaultToonCard key={5} $bgImageUrl={bgImageUrl5.src} className='rounded-md' />
        ]
    }

    return (
        <DefaultToonCard
            $bgImageUrl={bgImageUrl.src}
            className='w-96 h-96 border-b-8'
        >
            <div className="
                flex 
                flex-col
                justify-between
                items-center
                py-3
                w-full 
                h-full
            ">
                <h2 className='text-4xl'>Level: Easy</h2>
                <div className='flex flex-col justify-between items-center w-full'>
                    <CarouselStyled
                        disableArrowsOnEnd={false}
                        pagination={false}
                        isRTL={true}
                        enableMouseSwipe
                        itemsToShow={4}
                        itemPadding={[2]}
                        renderArrow={RenderArrow}
                        {...carouselChildren}
                    />
                    <h4>Attackers</h4>
                </div>
            </div>
        </DefaultToonCard >
    )
}

const CarouselStyled = styled(Carousel)`
    & > div {
        position: relative;

        & > div:nth-child(2) {
            margin: 0;
        }

        & > div:first-child, & > div:last-child {
            position: absolute;
            z-index: 2;
            top: 35%;
        }

        & > div:last-child {
            left: 25px;
        }

        & > div:first-child {
            right: 25px;
        }
    }
`;

export default MainToonCard

export const DefaultToonCard = styled.div<{ $bgImageUrl: string }>`
    width: 96px;
    height: 96px;
    border-bottom: 4px solid #fcec76;
    background-image: url(${({ $bgImageUrl }) => $bgImageUrl});
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    border-radius: 16px;
    box-shadow: 0px 2px 0px 0px rgba(0, 0, 0, 0.25);
`;

const RenderArrow = ({ type, onClick }: RenderArrowProps) => {
    return (
        <MainButton onClick={onClick} color="yellow">
            {type === "PREV" ? "<" : ">"}
        </MainButton>
    )
};