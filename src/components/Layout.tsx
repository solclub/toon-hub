import Head from "next/head";
import { Drawer } from "components/topbar/Drawer";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

type Props = {
  children: JSX.Element;
};

const Layout = ({ children }: Props) => {
  return (
    <>
      <Head>
        <title>The Hub</title>
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
    </>
  );
};

export default Layout;
