import type { MouseEventHandler, ReactNode } from "react";
import styled, { css } from "styled-components";

export type ButtonColor = "yellow" | "blue" | "red" | "black" | "gray";

export const ButtonContainerMixin = css<{ $color: ButtonColor }>`
    min-width: 40px;
    padding-bottom: 5px;
    border-radius: 12px;
    box-shadow: 0 0 15px ${({ $color }) => ({
        yellow: "rgba(253, 209, 18, 0.4)",
        blue: "rgba(85, 30, 245, 0.4)",
        red: "rgba(253, 23, 61, 0.4)",
        black: "rgba(255, 255, 255, 0.1)",
        gray: "rgba(125, 128, 135, 0.2)"
    }[$color])}, 0 4px 8px rgba(0, 0, 0, 0.3);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
    background-color: ${({ $color }) => ({
        yellow: "#9f6f02",
        blue: "#58529a",
        red: "#c1334b",
        black: "black",
        gray: "#131313"
    }[$color])};

    &:hover {
        transform: translateY(-3px) scale(1.02);
        box-shadow: 0 0 25px ${({ $color }) => ({
            yellow: "rgba(253, 209, 18, 0.6)",
            blue: "rgba(85, 30, 245, 0.6)",
            red: "rgba(253, 23, 61, 0.6)",
            black: "rgba(255, 255, 255, 0.2)",
            gray: "rgba(125, 128, 135, 0.4)"
        }[$color])}, 0 8px 16px rgba(0, 0, 0, 0.4);
    }

    &:active {
        transform: translateY(-1px) scale(0.98);
        box-shadow: 0 0 20px ${({ $color }) => ({
            yellow: "rgba(253, 209, 18, 0.8)",
            blue: "rgba(85, 30, 245, 0.8)",
            red: "rgba(253, 23, 61, 0.8)",
            black: "rgba(255, 255, 255, 0.3)",
            gray: "rgba(125, 128, 135, 0.5)"
        }[$color])}, 0 4px 12px rgba(0, 0, 0, 0.5);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
        box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
    }
`;

export const ButtonMixin = css<{ $color: ButtonColor }>`
    width: 100%;
    padding: 8px 16px;
    border-radius: 12px;
    border: none;
    font-family: 'MedievalSharp', 'Clarence Pro', sans-serif;
    font-weight: 900;
    font-size: 1em;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
    color: #ffffff;
    position: relative;
    overflow: hidden;
    background: ${({ $color }) => ({
        yellow: "linear-gradient(135deg, #FDD112 0%, #F59E0B 50%, #CC8D02 100%)",
        blue: "linear-gradient(135deg, #60A5FA 0%, #3B82F6 50%, #1D4ED8 100%)",
        red: "linear-gradient(135deg, #FB7185 0%, #EF4444 50%, #DC2626 100%)",
        black: "linear-gradient(135deg, #374151 0%, #1F2937 50%, #111827 100%)",
        gray: "linear-gradient(135deg, #6B7280 0%, #4B5563 50%, #374151 100%)"
    }[$color])};
    
    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0) 100%);
        border-radius: 12px;
        pointer-events: none;
    }

    &:hover {
        text-shadow: 2px 2px 6px rgba(0, 0, 0, 0.9), 0 0 10px rgba(255, 255, 255, 0.3);
    }

    &:active {
        text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.9);
    }

    &:disabled {
        color: #9CA3AF;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
    }
`;

const Button = styled.button<{ $color: ButtonColor }>`
    ${ButtonMixin}
`;

export const ButtonContainer = styled.div<{ $color: ButtonColor }>`
    ${ButtonContainerMixin}
`;

interface MainButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode
    onClick?: MouseEventHandler<HTMLButtonElement>
    className?: string,
    buttonClassName?: string,
    color: ButtonColor
}

const MainButton: React.FC<MainButtonProps> = ({ children, onClick, className, color, buttonClassName, ...props }) => {
    return (
        <ButtonContainer id="button-container" className={className} $color={color}>
            <Button onClick={onClick} $color={color} className={buttonClassName} {...props}>
                {children}
            </Button>
        </ButtonContainer>
    )
};

export default MainButton