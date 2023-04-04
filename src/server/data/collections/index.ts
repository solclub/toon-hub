export const collectionsSchemas = {
  GOLEM: {
    name: "Rude golems",
    path: "rude_golems",
    uri: "rdg",
    gotTraits: true,
    //mints: RudeGolemsMints,
    updateAuthority: "DKbzXS7D5CW5yVxhhjP1bYvAfmKokeeUW3roEP6enuZp",
    overlayLayers: {
      head: {
        label: "Head",
        layers: {
          mc_hat: {
            src: "/images/pimp/rude_golems/mc_hat.png",
            x: 0,
            y: 0,
            label: "Mc Hat",
            trait: "head",
          },
          rude_service_hat: {
            src: "/images/pimp/rude_golems/rude_service_hat.png",
            x: 0,
            y: 0,
            label: "Rude service hat",
            trait: "head",
          },
        },
      },
      armor: {
        label: "Armor",
        layers: {
          rude_service_shirt: {
            src: "/images/pimp/rude_golems/rude_service_shirt.png",
            x: 0,
            y: 0,
            label: "Rude service shirt",
            trait: "armor",
          },
        },
      },
    },
    traitsOrder: [
      "background",
      "skin",
      "armor",
      "chain",
      "mouth",
      "eyes",
      "over_head",
      "rebel",
      "special",
    ],
  },
  DEMON: {
    name: "Rude Demons",
    path: "rude_demons",
    uri: "rdd",
    gotTraits: true,
    updateAuthority: "DKbzXS7D5CW5yVxhhjP1bYvAfmKokeeUW3roEP6enuZp",
    overlayLayers: {
      armor: {
        label: "Armor",
        layers: {
          pato_armor: {
            src: "/assets/upgrade-items/pato-armor.png",
            x: 0,
            y: 0,
            label: "Pato armor",
            trait: "armor",
          },
        },
      },
    },
    traitsOrder: [
      "background",
      "wings",
      "skin",
      "armor",
      "mouth",
      "eyes",
      "chain",
      "head",
      "horns",
      "special",
    ],
  },
};
