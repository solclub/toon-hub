import Head from "next/head";
import { Drawer } from "components/topbar/Drawer";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { useRouter } from "next/router";
import styled from "styled-components";
import GiblatoonsLogo from '../assets/images/footerGiblatoonsLogo.svg'
import footerbg from '../assets/images/footerbg.png'
import mainbg from "../assets/images/mainbg.png";

type Props = {
  children: JSX.Element;
};

const Layout = ({ children }: Props) => {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>
          {router.pathname === "/toon-of-ladder" ? "Toon of the Ladder" : "The Hub"}
        </title>
        <meta name="description" content="The Hub" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <MainComponent>
        <Drawer>{children}</Drawer>
        <ToastContainer
          position="bottom-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
      </MainComponent>
      <FooterStyled>
        <div>
          <GiblatoonsLogo />
          <span className="text-[#ffe75c]">All rights reserved 2024 &copy;</span>
          <p className="font-sans text-xs text-gray-500">I have read the terms and conditions and i hereby accept and agree to the terms and conditions as stated in <a className="text-[#ffe75c]" href="">here.</a></p>
        </div>
      </FooterStyled>
      {/* Rounded filter */}
      <svg className='invisible absolute' width="0" height="0" xmlns="http://www.w3.org/2000/svg" version="1.1">
        <defs>
          <filter id="round"><feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="round" />
            <feComposite in="SourceGraphic" in2="round" operator="atop" />
          </filter>
        </defs>
      </svg>
    </>
  );
};

const MainComponent = styled.main`
  background: url(${mainbg.src}) bottom/cover no-repeat;
`;

const FooterStyled = styled.footer`
  background: url(${footerbg.src}) center no-repeat;
  @media (max-width: 1024px) {
    background-size: contain;
  }
  padding-top: 24rem;
  padding-bottom: 8rem;
  & > div {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: end;
    text-align: center;
    gap: 1rem;    
  }
`;

export default Layout;