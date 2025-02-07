import type { NextApiHandler } from "next";

const handler: NextApiHandler = (req, res) => {
  const version: string | undefined = process.env.npm_package_version;
  console.log(version);

  if (version) {
    res.status(200).json({ version });
  } else {
    res.status(500).json({ error: "Version not available" });
  }
};

export default handler;
