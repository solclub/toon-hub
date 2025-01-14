import ToonCard from 'components/toon-of-ladder/ToonCard'
import React, { useMemo } from 'react'
import styled from 'styled-components'
import bgImageUrl from '../assets/images/toon-of-ladder/card-bg.png'
import bgImageUrl1 from '../assets/images/toon-of-ladder/card-bg1.png'
import bgImageUrl2 from '../assets/images/toon-of-ladder/card-bg2.png'
import bgImageUrl3 from '../assets/images/toon-of-ladder/card-bg3.png'
import bgImageUrl4 from '../assets/images/toon-of-ladder/card-bg4.png'
import bgImageUrl5 from '../assets/images/toon-of-ladder/card-bg5.png'
import square1 from '../assets/images/toon-of-ladder/square1.png'
import square2 from '../assets/images/toon-of-ladder/square2.png'
import RegisteredUserIcon from '../assets/images/toon-of-ladder/registeredUserIcon.svg'
import ParticipantsIcon from '../assets/images/toon-of-ladder/participantsIcon.svg'
import PointIcon from '../assets/images/toon-of-ladder/pointIcon.svg'
import Image from 'next/image'
import Carousel, { type RenderArrowProps } from "react-elastic-carousel";
import MainButton, { ButtonContainer, ButtonMixin } from 'components/common/MainButton';
import WinnerCard, { ClippedToonCard, Rank } from 'components/toon-of-ladder/WinnerCard'
import { Table, type TableProps, type TableColumnsType } from 'antd'

interface DataType {
  id: number,
  rank: number,
  username: string,
  toonname: string,
  wins: number,
  best_win: string,
  victories: number,
  spent_time: number,
  point: string
}

const Page = () => {

  const mockCards = Array(20).fill(null)

  const mockDataSquares: [(string | null), (string | null), (string | null), (string | null)] = [square1, square2, null, null]

  const carouselChildren = {
    children: [
      <ToonCard key={1} bgImageUrl={bgImageUrl1} className='rounded-md w-full' />,
      <ToonCard key={2} bgImageUrl={bgImageUrl2} className='rounded-md w-full' />,
      <ToonCard key={3} bgImageUrl={bgImageUrl3} className='rounded-md w-full' />,
      <ToonCard key={4} bgImageUrl={bgImageUrl4} className='rounded-md w-full' />,
      <ToonCard key={5} bgImageUrl={bgImageUrl5} className='rounded-md w-full' />,
      <ToonCard key={6} bgImageUrl={bgImageUrl1} className='rounded-md w-full' />,
      <ToonCard key={7} bgImageUrl={bgImageUrl2} className='rounded-md w-full' />,
      <ToonCard key={8} bgImageUrl={bgImageUrl3} className='rounded-md w-full' />,
      <ToonCard key={9} bgImageUrl={bgImageUrl4} className='rounded-md w-full' />,
      <ToonCard key={10} bgImageUrl={bgImageUrl5} className='rounded-md w-full' />,
    ]
  }

  const mockWinnersData = [
    { rank: 1, username: 'charlie_z_t', toonName: 'Golem #2077', points: "20,780", wins: 676, matches: 778 },
    { rank: 2, username: 'mxcaraudio', toonName: 'Golem #6265', points: "19,580", wins: 521, matches: 800 },
    { rank: 3, username: 'mxcaraudio', toonName: 'Golem #6049', points: "19,120", wins: 458, matches: 789 },
  ]

  const mockTableData: DataType[] = [
    {
      id: 1,
      rank: 1,
      username: 'charlie_z_t',
      toonname: 'Golem #2077',
      wins: 676,
      best_win: "43:32",
      victories: 778,
      spent_time: 344,
      point: "20,780"
    },
    {
      id: 2,
      rank: 2,
      username: 'mxcaraudio',
      wins: 521,
      toonname: 'Golem #2077',
      best_win: "2:00",
      victories: 800,
      spent_time: 772,
      point: "19,580"
    },
    {
      id: 3,
      rank: 3,
      username: 'mxcaraudio',
      wins: 458,
      best_win: "00:59",
      toonname: 'Golem #2077',
      victories: 789,
      spent_time: 122,
      point: "19,120"
    },
    {
      id: 4,
      rank: 4,
      username: 'charlie_z_t',
      wins: 676,
      best_win: "43:32",
      toonname: 'Golem #2077',
      victories: 778,
      spent_time: 344,
      point: "20,780"
    },
    {
      id: 5,
      rank: 5,
      username: 'mxcaraudio',
      wins: 521,
      toonname: 'Golem #2077',
      best_win: "2:00",
      victories: 800,
      spent_time: 772,
      point: "19,580"
    },
    {
      id: 6,
      rank: 6,
      username: 'mxcaraudio',
      wins: 458,
      best_win: "00:59",
      victories: 789,
      toonname: 'Golem #2077',
      spent_time: 122,
      point: "19,120"
    },
    {
      id: 7,
      rank: 7,
      username: 'charlie_z_t',
      wins: 676,
      toonname: 'Golem #2077',
      best_win: "43:32",
      victories: 778,
      spent_time: 344,
      point: "20,780"
    },
    {
      id: 8,
      rank: 8,
      username: 'mxcaraudio',
      wins: 521,
      best_win: "2:00",
      toonname: 'Golem #2077',
      victories: 800,
      spent_time: 772,
      point: "19,580"
    },
    {
      id: 9,
      rank: 9,
      username: 'mxcaraudio',
      wins: 458,
      best_win: "00:59",
      toonname: 'Golem #2077',
      victories: 789,
      spent_time: 122,
      point: "19,120"
    },
    {
      id: 10,
      rank: 10,
      username: 'charlie_z_t',
      wins: 676,
      toonname: 'Golem #2077',
      best_win: "43:32",
      victories: 778,
      spent_time: 344,
      point: "20,780"
    },
    {
      id: 11,
      rank: 11,
      username: 'mxcaraudio',
      wins: 521,
      best_win: "2:00",
      toonname: 'Golem #2077',
      victories: 800,
      spent_time: 772,
      point: "19,580"
    },
    {
      id: 12,
      rank: 12,
      username: 'mxcaraudio',
      wins: 458,
      toonname: 'Golem #2077',
      best_win: "00:59",
      victories: 789,
      spent_time: 122,
      point: "19,120"
    },
    {
      id: 13,
      rank: 13,
      username: 'charlie_z_t',
      wins: 676,
      best_win: "43:32",
      toonname: 'Golem #2077',
      victories: 778,
      spent_time: 344,
      point: "20,780"
    },
    {
      id: 14,
      rank: 14,
      username: 'mxcaraudio',
      wins: 521,
      best_win: "2:00",
      toonname: 'Golem #2077',
      victories: 800,
      spent_time: 772,
      point: "19,580"
    },
    {
      id: 15,
      rank: 15,
      username: 'mxcaraudio',
      wins: 458,
      best_win: "00:59",
      toonname: 'Golem #2077',
      victories: 789,
      spent_time: 122,
      point: "19,120"
    },
    {
      id: 16,
      rank: 16,
      username: 'charlie_z_t',
      wins: 676,
      best_win: "43:32",
      victories: 778,
      toonname: 'Golem #2077',
      spent_time: 344,
      point: "20,780"
    },
    {
      id: 17,
      rank: 17,
      username: 'mxcaraudio',
      wins: 521,
      toonname: 'Golem #2077',
      best_win: "2:00",
      victories: 800,
      spent_time: 772,
      point: "19,580"
    },
    {
      id: 18,
      rank: 18,
      username: 'mxcaraudio',
      wins: 458,
      best_win: "00:59",
      toonname: 'Golem #2077',
      victories: 789,
      spent_time: 122,
      point: "19,120"
    },
    {
      id: 19,
      rank: 19,
      username: 'charlie_z_t',
      wins: 676,
      best_win: "43:32",
      victories: 778,
      toonname: 'Golem #2077',
      spent_time: 344,
      point: "20,780"
    },
    {
      id: 20,
      rank: 20,
      username: 'mxcaraudio',
      wins: 521,
      toonname: 'Golem #2077',
      best_win: "2:00",
      victories: 800,
      spent_time: 772,
      point: "19,580"
    },
    {
      id: 21,
      rank: 21,
      username: 'mxcaraudio',
      wins: 458,
      best_win: "00:59",
      toonname: 'Golem #2077',
      victories: 789,
      spent_time: 122,
      point: "19,120"
    },

  ]

  const columns: TableColumnsType<DataType> = useMemo(() => (
    [
      {
        title: "Rank",
        key: "rank",
        dataIndex: 'rank',
        render: (value: number) => <Rank className='rank w-10 h-10 text-base filter-none'>{value}</Rank>
      },
      {
        title: "User name",
        key: "username",
        dataIndex: 'username',
        render: (value: number, row: typeof mockTableData[0]) => (
          <div className='flex items-center gap-4'>
            <ClippedToonCard className='w-14' bgImageUrl={bgImageUrl} />
            <div className='flex flex-col'>
              <span>{value}</span>
              <span className='font-sans text-[#ffe75c] text-sm'>{row.toonname}</span>
            </div>
          </div>
        )
      },
      {
        title: "Match wins",
        key: "wins",
        dataIndex: 'wins',
      },
      {
        title: "Spent time",
        key: "spent_time",
        dataIndex: 'spent_time',
      },
      {
        title: "Victories",
        key: "victories",
        dataIndex: 'victories',
      },
      {
        title: "Best Win (mins)",
        key: "best_win",
        dataIndex: 'best_win',
      },
      {
        title: "Point",
        key: "point",
        dataIndex: 'point',
        render: (value: string) => (
          <div className='flex gap-2 items-center'>
            <PointIcon />
            <span>{value}</span>
          </div>
        )
      }
    ]
  ), [])

  return (
    <div className='flex w-full flex-col gap-32'>
      <div className='flex w-full flex-col lg:flex-row justify-center gap-8'>
        <ToonCard
          bgImageUrl={bgImageUrl}
          className='w-full lg:w-2/5 border-b-8'
        >
          <div className="flex flex-col justify-between items-center py-3 w-full h-full">
            <h2 className='text-5xl'>Level: Easy</h2>
            <div className='flex flex-col h-1/3 justify-around items-center w-full'>
              <CarouselStyled
                disableArrowsOnEnd={false}
                pagination={false}
                isRTL={true}
                enableMouseSwipe
                itemsToShow={5}
                itemPadding={[4]}
                renderArrow={RenderArrow}
                {...carouselChildren} />
              <h4 className='text-xl'>Attackers</h4>
            </div>
          </div>
        </ToonCard>
        <div className='flex flex-col justify-between w-full lg:w-2/5 gap-8'>
          <HealthContainer>
            <div className='flex justify-between'>
              <h3 className='text-3xl'>Total Health</h3>
              <span className='text-lg text-red-600'>2000 / 8000</span>
            </div>
            <HealthBar $percentage={30} />
            <div className='flex justify-between gap-4 w-full'>
              <MainButton color='yellow' className='w-1/2 font-sans font-bold'>
                SIMPLE FIGHT
              </MainButton>
              <MainButton color='yellow' className='w-1/2 font-sans font-bold'>
                BULK FIGHT
              </MainButton>
            </div>
          </HealthContainer>
          <div className='flex justify-between w-full'>
            <MainButton color='yellow' buttonClassName='w-fit px-4 font-sans font-bold'>
              SELECT ALL UNITS
            </MainButton>
            <MainButton color='red' buttonClassName='w-fit px-4 font-sans font-bold'>
              DESELECT ALL
            </MainButton>
          </div>
          <ScrollContainer>
            <CardsContainer>
              {mockCards.map((item, i) => (
                <ToonCard key={i} bgImageUrl={bgImageUrl1} className='rounded-md p-1 w-1/4 lg:w-1/5'>
                  <div className="flex flex-col justify-between items-start w-full h-full">
                    <Square>3</Square>
                    <div className='flex items-center w-full justify-around'>
                      {mockDataSquares.map((item, i) => (
                        <Square key={i} className='font-sans font-bold'>
                          {item ? <Image src={item} alt="" /> : "+"}
                        </Square>
                      ))}
                    </div>
                  </div>
                </ToonCard>
              ))}
            </CardsContainer>
          </ScrollContainer>
        </div>
      </div>
      <div className='w-full'>
        <h1 className='text-4xl text-center lg:text-left mb-16'>Leaderboard</h1>
        <div className='w-full flex flex-col lg:flex-row justify-center items-center gap-8 lg:gap-0'>
          {mockWinnersData.map((item, i) => (
            <WinnerCard key={i} {...item} />
          ))}
        </div>
      </div>
      <div className='w-full flex flex-row gap-4 flex-wrap lg:flex-nowrap justify-between m-auto'>
        <DataRankingContainer>
          <div className='flex gap-8 lg:gap-32 mb-4'>
            <span className='text-3xl'>1777</span>
            <div className='p-2 rounded-full bg-[#ffe75c] w-fit'>
              <RegisteredUserIcon />
            </div>
          </div>
          <span className='font-sans text-xs text-gray-300'>Total Registered</span>
        </DataRankingContainer>
        <DataRankingContainer >
          <div className='flex gap-8 lg:gap-32 mb-4'>
            <span className='text-3xl'>400</span>
            <div className='p-2 rounded-full bg-[#ffe75c] w-fit'>
              <ParticipantsIcon />
            </div>
          </div>
          <span className='font-sans text-xs text-gray-300'>Total Participants</span>
        </DataRankingContainer>
        <DataRankingContainer className='flex-grow gap-4'>
          <span className='text-3xl'>Fighting in progress</span>
          <div className='flex justify-between gap-4'>
            <p className='font-sans text-xs text-gray-300 w-3/5'>
              The more damage, the higher the characters will reach the first positions to get the <span className='text-[#ffe75c]'>Crayon Token</span>.
              Only the first <span className='text-[#ffe75c]'>three positions</span> will be awarded.
            </p>
            <div className='flex'>
              <AvatarContainer>
                <Image src={bgImageUrl} alt='avatar' />
              </AvatarContainer>
              <AvatarContainer>
                <Image src={bgImageUrl2} alt='avatar' />
              </AvatarContainer>
              <AvatarContainer>
                <Image src={bgImageUrl3} alt='avatar' />
              </AvatarContainer>
              <AvatarContainer>
                <Image src={bgImageUrl4} alt='avatar' />
              </AvatarContainer>
              <AvatarContainer className='bg-[#ffe75c] flex justify-center items-center font-sans text-black'>
                +10
              </AvatarContainer>
            </div>
          </div>
        </DataRankingContainer>
      </div>
      <div className='bg-[#0d0d10] w-full p-4 lg:p-16 rounded-2xl'>
        <h1 className='text-4xl text-center lg:text-left mb-16'>Global Ranking</h1>
        <TableStyled
          rowKey={"id"}
          bordered
          columns={columns}
          dataSource={mockTableData}
          scroll={{ x: "max-content" }}
          pagination={{
            itemRender(_page, type, element) {
              return ["prev", "next"].includes(type) ? (
                <ButtonContainerStyled $color='yellow'>
                  {element}
                </ButtonContainerStyled>
              ) : (
                <MainButton color="black" className='w-8'>
                  {element}
                </MainButton>
              )
            },
          }}
        />
      </div>
    </div>
  )
}

export default Page

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

const RenderArrow = ({ type, onClick }: RenderArrowProps) => {
  return (
    <MainButton onClick={onClick} color="yellow">
      {type === "PREV" ? "<" : ">"}
    </MainButton>
  )
};

const HealthContainer = styled.div`
    background-color: #18181b;
    border-radius: 1rem;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
    width: 100%;
    border-bottom: 8px solid #313946;
`;

const HealthBar = styled.div<{ $percentage: number }>`
    background-color: #34171f;
    border-radius: .5rem;
    width: 100%;
    height: 2rem;

    &::before {
        content: '';
        background-color: #ff1037;
        border-radius: .5rem;
        width: ${({ $percentage }) => $percentage}%;
        height: 100%;
        display: block;
    }
`;

const ScrollContainer = styled.div`
    width: 100%;
    height: auto;
    aspect-ratio: 2 / 1;
    overflow-x: scroll;
    padding-bottom: .5rem;
    display: flex;
    align-items: flex-end;

    @media screen and (max-width: 1024px) {
      aspect-ratio: 2 / 1.2;
    }

    &::-webkit-scrollbar {
        height: 12px;
    }

    &::-webkit-scrollbar-track {
        background: #2c2918;
        border-radius: 20px;
    }

    &::-webkit-scrollbar-thumb {
        background-color: #ffe75c; 
        border-radius: 20px;
        border: 3px solid #2c2918;
    }
`;

const CardsContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    width: 100%;
    height: 100%;
    gap: .75rem;
    flex-direction: column;
    align-content: start;
    justify-content: space-evenly;
`;

const Square = styled.div`
  width: 22%;
  background-color: #ffe75c;
  border-radius: 0.125rem;
  aspect-ratio: 1/1;
  display: flex;
  justify-content: center;
  align-items: center;
  color: black;
  line-height: 1;
`;

const DataRankingContainer = styled.div`
  max-width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1rem;
  background-color: #0d0d10;
  border-radius: 1rem;
  border-bottom: 6px solid #313946;
`;

const AvatarContainer = styled.div`
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  margin-left:  -1rem;
  border: 2px solid #18181b;

  img {
    object-fit: cover;
    border-radius: 50%;
    width: 100%;
    height: 100%;
  }
`;

const TableStyled = styled(Table) <TableProps<DataType>>`
  * :not(.rank, .ant-pagination *) {
    background-color: transparent !important;
    border-color: gray !important;
  }

  thead * {
    color: #9ca3af !important;
  }

  th, tbody td {
      border-inline-end: none !important;
  };

  tbody tr:last-child td {
    border-bottom: none ;
  }

  tbody td {
    color: white !important;
    font-family: 'Clarence Pro', sans-serif;
    font-size: 18px
  }

  .ant-table-container {
    border: 1px solid; 
    border-radius: 1rem;
  }

  .ant-pagination {
    @media screen and (max-width: 1024px) {
      flex-wrap: nowrap;
      justify-content: center;
    }

    li {
      background-color: unset;
      border: none;
    }

    * {
      color: white !important;
      font-weight: bold !important;
    }
  }
`;

const ButtonContainerStyled = styled(ButtonContainer)`
  & .ant-pagination-item-link {
      ${ButtonMixin}
      width: 100% !important;
      height: 35px !important;
      border-radius: 10px !important;
    }
`;