import Head from "next/head";
import { Drawer } from "components/topbar/Drawer";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { useRouter } from "next/router";

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
      <main className="mx-auto h-screen w-screen">
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
      </main>
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

export default Layout;
