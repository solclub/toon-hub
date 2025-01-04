import React from 'react'
import styled from 'styled-components';
import ToonCard from './ToonCard';
import Image from 'next/image';
import winnerbg from '../../assets/images/toon-of-ladder/winnerbg.png'
import MedalImage from '../../assets/images/toon-of-ladder/medal.svg'
import twitterIcon from '../../assets/images/twitter.png'
import bgImageUrl from '../../assets/images/toon-of-ladder/card-bg.png'

interface WinnerCardProps {
    className?: string,
    rank: number,
    username: string,
    toonName: string,
    points: string,
    wins: number,
    matches: number
}

const WinnerCard: React.FC<WinnerCardProps> = ({ className, matches, points, rank, toonName, username, wins }) => {
    return (
        <WinnerContainer className={className} $order={rank}>
            <MedalImage className="mr-[-8px]" />
            <ClippedToonCard bgImageUrl={bgImageUrl} >
                <Rank>{rank}</Rank>
            </ClippedToonCard>
            <div className='flex flex-wrap items-end justify-center mb-6 mt-4'>
                <Image src={twitterIcon} alt='twitter icon' className='w-6 h-6 mr-2' />
                <span className='text-2xl'>{username}</span>
                <span className='w-full text-sm text-[#ffe75c] font-sans text-center'>{toonName}</span>
            </div>
            <div className='flex flex-col items-center gap-2'>
                <span className='text-4xl lg:text-5xl'>{points}</span>
                <span className='font-sans text-gray-400 text-xs'>POINTS</span>
            </div>
            <ScoreContainer>
                <div>
                    <span className='text-4xl'>{wins}</span>
                    <span className='font-sans text-gray-400 text-xs'>WINS</span>
                </div>
                <div>
                    <span className='text-4xl'>{matches}</span>
                    <span className='font-sans text-gray-400 text-xs'>MATCHES</span>
                </div>
            </ScoreContainer>
        </WinnerContainer>
    )
}

const WinnerContainer = styled.div<{ $order: number }>`
  width: 100%;
  max-width: 25rem;
  height: auto;
  aspect-ratio: 25 / 42;
  background: url(${winnerbg.src}) center/cover no-repeat;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(211, 211, 211, .1);
  align-items: center;
  padding: .5rem;
  padding-top: 0;
  clip-path: polygon(50% 0%, 100% 15%, 100% 94%, 50% 100%, 0% 94%, 0% 15%);
  filter: url("#round");
  user-select: none;

  @media screen and (min-width: 1024px) {
    width: 25rem;
    ${({ $order }) => ({
        1: `
        z-index: 2;
        order: 2;
        `,
        2: `
        margin-right: -5rem;
        order: 1;
        zoom: 90%;
        `,
        3: `
        margin-left: -5rem;
        order: 3;
        zoom: 90%;
        `
    }[$order])};
  }
`;

export const ClippedToonCard = styled(ToonCard)`
  width: 50%;
  display: flex;
  justify-content: center;
  align-items: end;
  padding: 1rem;
  clip-path: polygon(50% 0%, 100% 15%, 100% 85%, 50% 100%, 0% 85%, 0% 15%);
`;

export const Rank = styled.div`
  width: 30%;
  height: auto;
  aspect-ratio: 1 / 1;
  display: flex;
  justify-content: center;
  align-items: center;
  color: black;
  font-size: 1.5rem;
  background-color: #ffe75c;
  clip-path: polygon(50% 0%, 100% 20%, 100% 80%, 50% 100%, 0% 80%, 0% 20%);
  filter: url("#round");
`;

const ScoreContainer = styled.div`
  width: 100%;
  min-height: 8rem;
  display: flex;
  justify-content: center;
  align-items: start;
  padding-top: 1rem;
  margin-top: 2.5rem;
  background-color: white;
  flex-grow: 1;
  clip-path: polygon(0% 0%, 100% 0%, 100% 60%, 50% 90%, 0% 60%);
  border-radius: 1rem;

  & > * {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: .5rem;
    color: black;
    padding: 0 1rem;

    &:first-child {
      border-right: 1px solid lightgray
    }
  }
`;

export default WinnerCard