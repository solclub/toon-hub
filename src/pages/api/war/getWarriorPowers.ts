import type { NextApiRequest, NextApiResponse } from "next";
import { getWarriorsPower } from "server/services/war-service";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.status(405).send({ message: "Only POST requests allowed" });
    return;
  }
  const { warriorList } = req.body;
  console.log(warriorList);
  const totalPower = await getWarriorsPower(warriorList);
  res.status(200).json(totalPower);
}
