import type { NextApiRequest, NextApiResponse } from "next";
import { getWarriorsPower } from "server/services/war-service";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("war api called");
  console.log(req.body);
  const { warriorList } = req.body;
  console.log(warriorList);
  const totalPower = await getWarriorsPower(warriorList);
  console.log(totalPower);
  res.status(200).json({ totalPower: totalPower });
}
