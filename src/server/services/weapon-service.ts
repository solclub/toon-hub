import type {
  ItemMetadata,
  Slot,
  WarriorEquipment,
} from "server/database/models/equipped-weapon.model";
import warriorEquipmentModel from "server/database/models/equipped-weapon.model";
import paymentService from "./payment-service";
import type { Weapon, WeaponRarity } from "server/database/models/weapon.model";
import WeaponModel from "server/database/models/weapon.model";
import WarriorEquipmentModel from "server/database/models/equipped-weapon.model";
import { getUserNFTbyMint } from "./nfts-service";

export interface RandomWeaponRequest {
  mintAddress: string;
  wallet: string;
  verifiedOwner: string;
  serializedTx: string;
  nftType: string;
  slot: number;
}

const rarityPerSlotTable: Record<number, Record<WeaponRarity, number>> = {
  1: {
    NONE: 0,
    COMMON: 60,
    RARE: 25,
    EPIC: 10,
    LEGENDARY: 4,
    MYTHIC: 1,
    SECRET: 0,
  },
  2: {
    NONE: 0,
    COMMON: 60,
    RARE: 25,
    EPIC: 10,
    LEGENDARY: 4,
    MYTHIC: 1,
    SECRET: 0,
  },
  3: {
    NONE: 0,
    COMMON: 54.5,
    RARE: 20,
    EPIC: 15,
    LEGENDARY: 7,
    MYTHIC: 3,
    SECRET: 0,
  },
  4: {
    NONE: 0,
    COMMON: 54.5,
    RARE: 20,
    EPIC: 15,
    LEGENDARY: 7,
    MYTHIC: 3,
    SECRET: 0.5,
  },
};

export const confirmAndSave = async (req: RandomWeaponRequest) => {
  const result = paymentService.proccessPayment<WarriorEquipment>(
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

export const saveWeaponEquipped = async (req: RandomWeaponRequest): Promise<WarriorEquipment> => {
  if (!req) throw "req is required";

  const nft = await getUserNFTbyMint(req.wallet, req.mintAddress);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const rolledRarity = rollRarity(rarityPerSlotTable[req.slot]!);

  const rolledWeapon = await WeaponModel().findOne({
    slotNumber: req.slot,
    rarity: { $regex: rolledRarity, $options: "i" },
  });

  if (!req) throw "req is required";

  const filters = { warriorId: req.mintAddress, ownerId: req.wallet };
  const options = { upsert: true, new: true, setDefaultsOnInsert: true };

  const existingEquipment = await WarriorEquipmentModel().findOne(filters);

  if (existingEquipment) {
    const updatedSlots = existingEquipment.slots.map((slot) =>
      slot.itemMetadata?.slotNumber === req.slot
        ? ({
            status: "unlocked",
            itemId: rolledWeapon?._id.toString(),
            itemMetadata: rolledWeapon as ItemMetadata,
            updatedAt: new Date(),
          } as Slot)
        : slot
    );

    // Check if the slot needs to be added
    const existingSlotNumbers = existingEquipment.slots.map(
      (slot) => slot.itemMetadata?.slotNumber
    );
    if (!existingSlotNumbers.includes(req.slot)) {
      updatedSlots.push({
        status: "unlocked",
        itemId: rolledWeapon?._id.toString(),
        itemMetadata: rolledWeapon?.toObject() as ItemMetadata,
        updatedAt: new Date(),
      });
    }

    let warriorWeaponsPower = 0;

    for (const slot of updatedSlots) {
      if (slot.itemMetadata?.powerType === "fixed") {
        warriorWeaponsPower += slot.itemMetadata.powerValue ?? 0;
        slot.itemMetadata.computedPowerValue = slot.itemMetadata.powerValue ?? 0;
      } else if (slot.itemMetadata?.powerType === "multiplier") {
        const computedValue =
          Math.round((nft.power ?? 0) * (slot.itemMetadata.powerValue ?? 0) * 100) / 100;
        slot.itemMetadata.computedPowerValue = computedValue;
        warriorWeaponsPower += computedValue;
      }
    }

    const warriorTotalPower = (nft.power ?? 0) + warriorWeaponsPower;
    const newItemData: WarriorEquipment = {
      ...filters,
      slots: updatedSlots,
      warriorWeaponsPower,
      warriorTotalPower,
    };

    const updatedItem = await WarriorEquipmentModel().findOneAndUpdate(
      filters,
      newItemData,
      options
    );

    return updatedItem as WarriorEquipment;
  } else {
    const castedWeapon = rolledWeapon as Weapon;
    const warriorWeaponsPower =
      castedWeapon.powerType === "fixed"
        ? castedWeapon.powerValue
        : (nft.power ?? 0) * castedWeapon.powerValue;
    const warriorTotalPower = (nft.power ?? 0) + warriorWeaponsPower;

    const newItemData: WarriorEquipment = {
      ...filters,
      slots: [
        {
          status: "unlocked",
          itemMetadata: {
            ...(rolledWeapon?.toObject<Weapon>() as ItemMetadata),
            computedPowerValue: warriorWeaponsPower,
          },
          updatedAt: new Date(),
          itemId: rolledWeapon?._id.toString(),
        },
      ],
      warriorWeaponsPower,
      warriorTotalPower,
    };
    const savedItem = await WarriorEquipmentModel().create(newItemData);
    return savedItem.toObject<WarriorEquipment>();
  }
};

export const getWeaponsEquipped = async (mint: string, owner: string) => {
  const defaultSlots: Slot[] = [
    {
      status: "locked",
      itemMetadata: { slotNumber: 1, name: "Slot 1" },
    },
    {
      status: "locked",
      itemMetadata: { slotNumber: 2, name: "Slot 2" },
    },
    {
      status: "locked",
      itemMetadata: { slotNumber: 3, name: "Slot 3" },
    },
    {
      status: "locked",
      itemMetadata: { slotNumber: 4, name: "Slot 4" },
    },
  ];

  const equippedWeapons = await warriorEquipmentModel()
    .findOne({
      warriorId: mint,
      ownerId: owner,
    })
    .lean();

  const currentSlots: Slot[] = equippedWeapons?.slots;
  const mergedSlots: Slot[] = await Promise.all(
    defaultSlots.map(async (defaultSlot) => {
      const existingSlot = currentSlots?.find(
        (slot) => slot?.itemMetadata?.slotNumber === defaultSlot?.itemMetadata?.slotNumber
      );
      return existingSlot || defaultSlot;
    })
  );

  return { ...equippedWeapons, slots: mergedSlots } as WarriorEquipment;
};

const rollRarity = (slotProbabilities: Record<WeaponRarity, number>): WeaponRarity => {
  const rarities = Object.keys(slotProbabilities) as WeaponRarity[];
  const probabilities = Object.values(slotProbabilities) as number[]; // Type assertion

  if (!rarities.length || !probabilities.length) {
    throw "No defined rarities";
  }

  const totalProbability = probabilities.reduce((sum, prob) => sum + prob, 0);

  const randomValue = Math.random() * totalProbability;

  let accumulatedProbability = 0;
  let rolledRarity = rarities[rarities.length - 1] ?? "NONE";

  for (const [i, rarity] of rarities.entries()) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    accumulatedProbability += probabilities[i]!;
    if (randomValue <= accumulatedProbability) {
      rolledRarity = rarity;
      break;
    }
  }

  return rolledRarity;
};

const service = {
  confirmAndSave,
  saveWeaponEquipped,
  getWeaponsEquipped,
};

export default service;
