import type { NextApiRequest, NextApiResponse } from "next";
import { getWarriorsPower } from "server/services/war-service";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "OPTIONS") {
    // send status ok
    res.status(200).end();
    return;
  }
  console.log("war api called", req.method);
  console.log(req.body);
  const { warriorList } = req.body;
  console.log(warriorList);
  const totalPower = await getWarriorsPower(warriorList);
  console.log(totalPower);
  res.status(200).json({ totalPower: totalPower });
}
