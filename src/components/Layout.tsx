import Head from "next/head";

import { Drawer } from "components/topbar/Drawer";

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
      <main className="mx-auto h-screen w-screen">
        <Drawer>{children}</Drawer>
      </main>
    </>
  );
};

export default Layout;
