import type { MouseEventHandler, ReactNode } from "react";
import styled from "styled-components";

type Color = "yellow" | "blue" | "red";

const Button = styled.button<{ $color: Color }>`
    min-width: 40px;
    height: 35px;
    border-radius: 10px;
    box-shadow: 0px -1.67px 1.67px 0px rgba(0, 0, 0, 0.1) inset;
    border-bottom: 2px solid ${({ $color }) => ({
        yellow: "#d7a534",
        blue: "#746ec1",
        red: "#df6d80"
    }[$color])};
    background: ${({ $color }) => ({
        yellow: "linear-gradient(180deg, #FDD112 0%, #CC8D02 100%)",
        blue: "linear-gradient(180deg, #551ef5 0%, #5348b5 100%)",
        red: "linear-gradient(180deg, #fd173d 0%, #db455d 100%)"
    }[$color])};
`;

const ButtonContainer = styled.div<{ $color: Color }>`
    display: flex;
    height: 40px;
    border-radius: 10px;
    box-shadow: 0px 2.5px 1.67px 0px rgba(0, 0, 0, 0.25);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    cursor: pointer;
    background-color: ${({ $color }) => ({
        yellow: "#9f6f02",
        blue: "#58529a",
        red: "#c1334b"
    }[$color])};

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0px 6px 8px rgba(0, 0, 0, 0.3);
    }

    &:active {
        transform: translateY(0);
        box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.2);
    }
`;

interface MainButtonProps {
    children: ReactNode
    onClick?: MouseEventHandler<HTMLButtonElement>
    className?: string,
    color: Color
}

const MainButton: React.FC<MainButtonProps> = ({ children, onClick, className, color }) => {
    return (
        <ButtonContainer id="button-container" className={className} $color={color}>
            <Button onClick={onClick} $color={color}>
                {children}
            </Button>
        </ButtonContainer>
    )
};

export default MainButton