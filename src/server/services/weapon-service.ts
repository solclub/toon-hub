import warriorEquipmentModel, {
  Slot,
  WarriorEquipment,
} from "server/database/models/equipped-weapon.model";
import paymentService from "./payment-service";
import WeaponModel from "server/database/models/weapon.model";
import weaponModel from "server/database/models/weapon.model";

export interface RandomWeaponRequest {
  mintAddress: string;
  wallet: string;
  verifiedOwner: string;
  serializedTx: string;
  nftType: string;
  slot: number;
}

export const confirmAndSave = async (req: RandomWeaponRequest) => {
  const result = paymentService.proccessPayment<RandomWeaponRequest>(
    {
      mint: req.mintAddress,
      serializedTx: req.serializedTx,
      wallet: req.wallet,
      service: "WEAPON_SLOT_" + req.slot,
    },
    async (txId, verifiedOwner) => {
      return await saveWeaponEquipped({ ...req, verifiedOwner });
    }
  );

  return result;
};

export const saveWeaponEquipped = async (req: RandomWeaponRequest) => {
  //   const featured = await WeaponModel().create({
  //     createdAt: new Date(),
  //     mint: req.mintAddress,
  //     wallet: req.wallet,
  //     nftType: req.nftType,
  //     featured: false,
  //   });
  return req;
};

export const getWeaponsEquipped = async (mint: string, owner: string) => {
  const defaultSlots: Slot[] = [
    {
      status: "locked",
      itemMetadata: { slotNumber: 1 },
    },
    {
      status: "locked",
      itemMetadata: { slotNumber: 2 },
    },
    {
      status: "locked",
      itemMetadata: { slotNumber: 3 },
    },
    {
      status: "locked",
      itemMetadata: { slotNumber: 4 },
    },
  ];

  const equippedWeapons = await warriorEquipmentModel()
    .findOne({
      warriorId: mint,
      ownerId: owner,
    })
    .lean();

  if (!equippedWeapons) {
    return null;
  }

  const currentSlots: Slot[] = equippedWeapons.slots;
  const mergedSlots: Slot[] = await Promise.all(
    defaultSlots.map(async (defaultSlot) => {
      const existingSlot = currentSlots.find(
        (slot) => slot?.itemMetadata?.slotNumber === defaultSlot?.itemMetadata?.slotNumber
      );
      return existingSlot || defaultSlot;
    })
  );

  return { ...equippedWeapons, slots: mergedSlots } as WarriorEquipment;
};

const service = {
  confirmAndSave,
  saveWeaponEquipped,
  getWeaponsEquipped,
};

export default service;
