import type { MouseEventHandler, ReactNode } from "react";
import styled, { css } from "styled-components";

export type ButtonColor = "yellow" | "blue" | "red" | "black";

export const ButtonContainerMixin = css<{ $color: ButtonColor }>`
    min-width: 40px;
    padding-bottom: 5px;
    border-radius: 10px;
    box-shadow: 0px 2.5px 1.67px 0px rgba(0, 0, 0, 0.25);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    cursor: pointer;
    background-color: ${({ $color }) => ({
        yellow: "#9f6f02",
        blue: "#58529a",
        red: "#c1334b",
        black: "black"
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

export const ButtonMixin = css<{ $color: ButtonColor }>`
    width: 100%;
    padding: 5px 10px;
    border-radius: 10px;
    box-shadow: 0px -1.67px 1.67px 0px rgba(0, 0, 0, 0.1) inset;
    border-bottom: 2px solid ${({ $color }) => ({
        yellow: "#d7a534",
        blue: "#746ec1",
        red: "#df6d80",
        black: "#7c8087"
    }[$color])};
    background: ${({ $color }) => ({
        yellow: "linear-gradient(180deg, #FDD112 0%, #CC8D02 100%)",
        blue: "linear-gradient(180deg, #551ef5 0%, #5348b5 100%)",
        red: "linear-gradient(180deg, #fd173d 0%, #db455d 100%)",
        black: "black"
    }[$color])};
`;

const Button = styled.button<{ $color: ButtonColor }>`
    ${ButtonMixin}
`;

export const ButtonContainer = styled.div<{ $color: ButtonColor }>`
    ${ButtonContainerMixin}
`;

interface MainButtonProps {
    children: ReactNode
    onClick?: MouseEventHandler<HTMLButtonElement>
    className?: string,
    buttonClassName?: string,
    color: ButtonColor
}

const MainButton: React.FC<MainButtonProps> = ({ children, onClick, className, color, buttonClassName }) => {
    return (
        <ButtonContainer id="button-container" className={className} $color={color}>
            <Button onClick={onClick} $color={color} className={buttonClassName}>
                {children}
            </Button>
        </ButtonContainer>
    )
};

export default MainButton