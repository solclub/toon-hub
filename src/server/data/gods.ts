import { env } from "env/server.mjs";
import type { NFTType } from "server/database/models/nft.model";

interface GodUpgrade {
  mint: string;
  image: string;
}

interface GodsData {
  [NFTType.GOLEM]: {
    ORIGINAL: GodUpgrade[];
    REWORK: GodUpgrade[];
    CARTOON: GodUpgrade[];
  };
  [NFTType.DEMON]: {
    ORIGINAL: GodUpgrade[];
    REWORK: GodUpgrade[];
    CARTOON: GodUpgrade[];
  };
}

const godsProdData: GodsData = {
  GOLEM: {
    ORIGINAL: [],
    REWORK: [
      {
        mint: "2RvZ76hT5uSe7URDnWDwjnGJhisSPHxJyEi9rdrCAYEh",
        image:
          "https://res.cloudinary.com/dfniu7jks/image/upload/v1669889195/rudeGolems/golemUpgrades/2RvZ76hT5uSe7URDnWDwjnGJhisSPHxJyEi9rdrCAYEh.png",
      },
    ],
    CARTOON: [
      {
        mint: "2RvZ76hT5uSe7URDnWDwjnGJhisSPHxJyEi9rdrCAYEh",
        image:
          "https://res.cloudinary.com/dfniu7jks/image/upload/v1713042717/collections/rude_golems/art/toons_art/gods/rebel_golem.png",
      },
      {
        mint: "HyzPwi4aUEvzuVnk9Wyvzk92jEBwe9Z97zX3tBkJRYMC",
        image:
          "https://res.cloudinary.com/dfniu7jks/image/upload/v1713013556/collections/rude_golems/art/toons_art/gods/demantur.png",
      },
      {
        mint: "412z5P2NZ5rtZSWhp86g1kUrkuBM58EEowf93pUvMej7",
        image:
          "https://res.cloudinary.com/dfniu7jks/image/upload/v1713013529/collections/rude_golems/art/toons_art/gods/g7_xsol.png",
      },
      {
        mint: "CS8ianvWnTFcQvRLaq8cgDscEzcrYgFCzJyXZa5bAjyf",
        image:
          "https://res.cloudinary.com/dfniu7jks/image/upload/v1713013793/collections/rude_golems/art/toons_art/gods/giblon.png",
      },
      {
        mint: "6vGmAfBCtKAByd8Gb1q6UCFT8MtD3vfPqtpo8uejW7hW",
        image:
          "https://res.cloudinary.com/dfniu7jks/image/upload/v1713013540/collections/rude_golems/art/toons_art/gods/golowar.png",
      },
      {
        mint: "C7gqLjbELMt6QFVRdHFAihwr11yrfQzCEgmiBxfY21FP",
        image:
          "https://res.cloudinary.com/dfniu7jks/image/upload/v1713013551/collections/rude_golems/art/toons_art/gods/khaos.png",
      },
      {
        mint: "Dek9xS4WpmLifWXfY5EN9mKaFH96jExUXXhj8qMJ725r",
        image:
          "https://res.cloudinary.com/dfniu7jks/image/upload/v1713013522/collections/rude_golems/art/toons_art/gods/leviatan.png",
      },
      {
        mint: "E9U9LorbUDVTdom617Nc6h67K7A8V6GDLPUTQbXRU3Dv",
        image:
          "https://res.cloudinary.com/dfniu7jks/image/upload/v1713041336/collections/rude_golems/art/toons_art/gods/nygthum.png",
      },
      {
        mint: "6VKfKVqRgvNLWSnK9KHdnPEzJ2C5wQdBNGMw7k3GAGgM",
        image:
          "https://res.cloudinary.com/dfniu7jks/image/upload/v1713013535/collections/rude_golems/art/toons_art/gods/rooton.png",
      },
      {
        mint: "8bdjJvD4FtVoqfw8nUknW8rTWRAFjAs8Fh7vvFt6woev",
        image:
          "https://res.cloudinary.com/dfniu7jks/image/upload/v1713013546/collections/rude_golems/art/toons_art/gods/tarblok.png",
      },
      {
        mint: "M5yCkWjzqoG6CtQHijgCCRdy24LphV3jAGNajMdcaxE",
        image:
          "https://res.cloudinary.com/dfniu7jks/image/upload/v1713013562/collections/rude_golems/art/toons_art/gods/tsatsako.png",
      },
    ],
  },
  DEMON: {
    ORIGINAL: [],
    REWORK: [],
    CARTOON: [
      {
        mint: "3szaxSUDLULY9uHSsQSNXYFvZsRdGXkbJeSkEFkPNdJF",
        image:
          "https://res.cloudinary.com/dfniu7jks/image/upload/v1713013397/collections/rude_demons/art/toons_art/gods/ymantus.png",
      },
      {
        mint: "DEMbY2a33WF2RPkbFdqKwv61aDbWWeNTDsu1CzGKLPXP",
        image:
          "https://res.cloudinary.com/dfniu7jks/image/upload/v1713013401/collections/rude_demons/art/toons_art/gods/sylverior.png",
      },
      {
        mint: "aEzrrHAbhkZLEzRvXSkuBFrdxNN3iSbmGxVszLtLttu",
        image:
          "https://res.cloudinary.com/dfniu7jks/image/upload/v1713013386/collections/rude_demons/art/toons_art/gods/garrash.png",
      },
      {
        mint: "6rKB47pKy5kur4hcycMaRjFYnb7gb9xqiSVJqk3ErL3S",
        image:
          "https://res.cloudinary.com/dfniu7jks/image/upload/v1713013390/collections/rude_demons/art/toons_art/gods/dhurko.png",
      },
    ],
  },
};

const godsDevData: GodsData = {
  GOLEM: {
    ORIGINAL: [],
    REWORK: [
      {
        mint: "9ZJakHpYw2TPWVLrpQqV8HnVDtPdzJeUuGFrjJML71Tx",
        image:
          "https://res.cloudinary.com/dfniu7jks/image/upload/v1669889195/rudeGolems/golemUpgrades/2RvZ76hT5uSe7URDnWDwjnGJhisSPHxJyEi9rdrCAYEh.png",
      },
    ],
    CARTOON: [
      {
        mint: "9ZJakHpYw2TPWVLrpQqV8HnVDtPdzJeUuGFrjJML71Tx",
        image:
          "https://res.cloudinary.com/dfniu7jks/image/upload/v1713042717/collections/rude_golems/art/toons_art/gods/rebel_golem.png",
      },
      {
        mint: "86NgwYyDNxN1Fu9FeR4PzuEHxYqKfF8w6yx3PQEsJWHL",
        image:
          "https://res.cloudinary.com/dfniu7jks/image/upload/v1713013556/collections/rude_golems/art/toons_art/gods/demantur.png",
      },
      {
        mint: "4p3moxSt65uw6tpry7KELH16mM4zq7bycdmEEzfpwRNp",
        image:
          "https://res.cloudinary.com/dfniu7jks/image/upload/v1713013529/collections/rude_golems/art/toons_art/gods/g7_xsol.png",
      },
    ],
  },
  DEMON: {
    ORIGINAL: [],
    REWORK: [],
    CARTOON: [
      {
        mint: "A1qC6btSfZ5ALrHBQNqDJrpepzaHUShCL36khRFDRnfA",
        image:
          "https://res.cloudinary.com/dfniu7jks/image/upload/v1713013397/collections/rude_demons/art/toons_art/gods/ymantus.png",
      },
      {
        mint: "F1NsXUVxCLCYa6udX2DuDmUvMQKa8YCLPyvgPUnXBaKD",
        image:
          "https://res.cloudinary.com/dfniu7jks/image/upload/v1713013401/collections/rude_demons/art/toons_art/gods/sylverior.png",
      },
    ],
  },
};

export const godsData = env.NODE_ENV === "development" ? godsDevData : godsProdData;
