import Head from "next/head";

import { Drawer } from "../components/topbar/drawer";

type Props = {
  children: JSX.Element;
};

const Layout = ({ children }: Props) => {
  return (
    <>
      <Head>
        <title>Rude Dashboard</title>
        <meta name="description" content="Rude Dashboard" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="container mx-auto h-screen w-screen px-8">
        <Drawer>{children}</Drawer>
      </main>
    </>
  );
};

export default Layout;
