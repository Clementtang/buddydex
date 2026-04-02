// Original ASCII art for BuddyDex species.
// Each species has 3 animation frames, 5 lines tall, ~12 chars wide.
// {E} placeholder is replaced with the rolled eye character at render time.

export const SPECIES = [
  {
    id: "duck",
    name: "Duck",
    description:
      "A cheerful little duck. Quacks softly when idle, wags its tail feathers.",
    frames: [
      [
        "            ",
        "   _        ",
        " >(  {E})~~   ",
        "  (    /    ",
        "   ~-~      ",
      ],
      [
        "            ",
        "   _        ",
        " >(  {E})~~   ",
        "  (    /    ",
        "   ~-~~     ",
      ],
      [
        "            ",
        "   _        ",
        " >(  {E})~~~  ",
        "  (    /    ",
        "   ~-~      ",
      ],
    ],
  },
  {
    id: "goose",
    name: "Goose",
    description:
      "Taller and bolder than the duck. Will honk at you without hesitation.",
    frames: [
      [
        "            ",
        "    >{E})     ",
        "     |      ",
        "   .(__)    ",
        "   ~' '~    ",
      ],
      [
        "            ",
        "   >{E})      ",
        "     |      ",
        "   .(__)    ",
        "   ~' '~    ",
      ],
      [
        "            ",
        "    >>{E})    ",
        "     |      ",
        "   .(__)    ",
        "   ~' '~    ",
      ],
    ],
  },
  {
    id: "cat",
    name: "Cat",
    description:
      "A poised feline. Judges you silently with an air of mild disapproval.",
    frames: [
      [
        "            ",
        "  ^   ^     ",
        " ( {E} {E} )   ",
        " (  w  )    ",
        "  ~~|~~     ",
      ],
      [
        "            ",
        "  ^   ^     ",
        " ( {E} {E} )   ",
        " (  w  )    ",
        "  ~~|~~~    ",
      ],
      [
        "            ",
        "  ^   ^     ",
        " ( {E} {E} )   ",
        " (  -  )    ",
        "  ~~|~~     ",
      ],
    ],
  },
  {
    id: "rabbit",
    name: "Rabbit",
    description: "Long ears, twitchy nose, round body. Perpetually alert.",
    frames: [
      [
        "            ",
        "  /)  /)    ",
        " ( {E}  {E} )  ",
        " (  Y  )    ",
        "  (_||_)    ",
      ],
      [
        "            ",
        "  |)  /)    ",
        " ( {E}  {E} )  ",
        " (  Y  )    ",
        "  (_||_)    ",
      ],
      [
        "            ",
        "  /)  /)    ",
        " ( {E}  {E} )  ",
        " (  o  )    ",
        "  (_||_)    ",
      ],
    ],
  },
  {
    id: "owl",
    name: "Owl",
    description:
      "Round and wide-eyed. Rotates its head slightly between frames.",
    frames: [
      [
        "            ",
        "  /{    }\\  ",
        " (({E})({E})) ",
        "  ( <> )    ",
        "   '--'     ",
      ],
      [
        "            ",
        "  /{    }\\  ",
        " (({E})({E})) ",
        "  ( <> )    ",
        "   .--'     ",
      ],
      [
        "            ",
        "  /{    }\\  ",
        " ((--)({E})) ",
        "  ( <> )    ",
        "   '--'     ",
      ],
    ],
  },
  {
    id: "penguin",
    name: "Penguin",
    description: "A dapper tuxedo bird. Waddles side to side endlessly.",
    frames: [
      [
        "            ",
        "   .~~.     ",
        "  /{E} {E}\\    ",
        "  |(  )|    ",
        "   ^  ^     ",
      ],
      [
        "            ",
        "   .~~.     ",
        "  /{E} {E}\\    ",
        " /|(  )|\\   ",
        "   ^  ^     ",
      ],
      [
        "            ",
        "   .~~.     ",
        "  /{E} {E}\\    ",
        "  |(  )|    ",
        "  ^ ^^ ^    ",
      ],
    ],
  },
  {
    id: "turtle",
    name: "Turtle",
    description: "Slow and steady. Carries its patterned shell with pride.",
    frames: [
      [
        "            ",
        "  ({E} {E})__  ",
        " /[~~~~]\\   ",
        " \\_[--]_/   ",
        "  ''  ''    ",
      ],
      [
        "            ",
        "  ({E} {E})__  ",
        " /[~~~~]\\   ",
        " \\_[--]_/   ",
        "   '' ''    ",
      ],
      [
        "            ",
        "  ({E} {E})__  ",
        " /[====]\\   ",
        " \\_[--]_/   ",
        "  ''  ''    ",
      ],
    ],
  },
  {
    id: "snail",
    name: "Snail",
    description:
      "One eye on a stalk, spiral shell on its back. Leaves a slime trail.",
    frames: [
      [
        "            ",
        "  {E}  .~~.  ",
        "  | ( @@ )  ",
        "  \\_'--'    ",
        " ~~~~~~~    ",
      ],
      [
        "            ",
        " {E}   .~~.  ",
        "  | ( @@ )  ",
        "  \\_'--'    ",
        " ~~~~~~~    ",
      ],
      [
        "            ",
        "  {E}  .~~.  ",
        "  | ( @@ )  ",
        "  \\_'--'    ",
        "  ~~~~~~    ",
      ],
    ],
  },
  {
    id: "dragon",
    name: "Dragon",
    description:
      "Tiny but fierce. Sports horns and occasionally puffs smoke from its nostrils.",
    frames: [
      [
        "            ",
        " v\\    /v   ",
        " ( {E}  {E} )  ",
        " ( \\/ )     ",
        "  -^^^^-    ",
      ],
      [
        "            ",
        " v\\    /v   ",
        " ( {E}  {E} )  ",
        " (    )     ",
        "  -^^^^-    ",
      ],
      [
        "  ~  ~      ",
        " v\\    /v   ",
        " ( {E}  {E} )  ",
        " ( \\/ )     ",
        "  -^^^^-    ",
      ],
    ],
  },
  {
    id: "octopus",
    name: "Octopus",
    description:
      "Round head, wavy tentacles underneath. Squishes and stretches constantly.",
    frames: [
      [
        "            ",
        "   ,---.    ",
        "  ( {E} {E} )  ",
        "  (_____)   ",
        "  ^/^/^/^   ",
      ],
      [
        "            ",
        "   ,---.    ",
        "  ( {E} {E} )  ",
        "  (_____)   ",
        "  /^/^/^/   ",
      ],
      [
        "     o      ",
        "   ,---.    ",
        "  ( {E} {E} )  ",
        "  (_____)   ",
        "  ^/^/^/^   ",
      ],
    ],
  },
  {
    id: "axolotl",
    name: "Axolotl",
    description:
      "Feathery gills fan out from its smiling face. Perpetually happy.",
    frames: [
      [
        "            ",
        " }~(----)~{ ",
        " }~({E}.{E})~{ ",
        "   ( -- )   ",
        "   ~'  '~   ",
      ],
      [
        "            ",
        " ~}(----){~ ",
        " ~}({E}.{E}){~ ",
        "   ( -- )   ",
        "   ~'  '~   ",
      ],
      [
        "            ",
        " }~(----)~{ ",
        " }~({E}.{E})~{ ",
        "   ( ^^ )   ",
        "    '  '    ",
      ],
    ],
  },
  {
    id: "ghost",
    name: "Ghost",
    description:
      "A floating spectre with a wavy hem. Drifts upward when excited.",
    frames: [
      [
        "            ",
        "   ,--.     ",
        "  | {E} {E}|   ",
        "  |  o |    ",
        "  ~~'~~'    ",
      ],
      [
        "            ",
        "   ,--.     ",
        "  | {E} {E}|   ",
        "  |  o |    ",
        "  '~~'~~    ",
      ],
      [
        "    ~ ~     ",
        "   ,--.     ",
        "  | {E} {E}|   ",
        "  |  o |    ",
        "  ~~'~~'    ",
      ],
    ],
  },
  {
    id: "robot",
    name: "Robot",
    description:
      "Boxy head, antenna on top. Its display panel flickers between frames.",
    frames: [
      [
        "            ",
        "   _||_     ",
        "  [{E}  {E}]   ",
        "  [====]    ",
        "  '----'    ",
      ],
      [
        "            ",
        "   _||_     ",
        "  [{E}  {E}]   ",
        "  [-==-]    ",
        "  '----'    ",
      ],
      [
        "     *      ",
        "   _||_     ",
        "  [{E}  {E}]   ",
        "  [====]    ",
        "  '----'    ",
      ],
    ],
  },
  {
    id: "blob",
    name: "Blob",
    description:
      "An amorphous creature. Changes shape every frame — nobody knows its true form.",
    frames: [
      [
        "            ",
        "   .~~.     ",
        "  ( {E} {E} )  ",
        "  (     )   ",
        "   '--'     ",
      ],
      [
        "            ",
        "  .~~~~.    ",
        " (  {E} {E}  ) ",
        " (       )  ",
        "  '~~~~'    ",
      ],
      [
        "            ",
        "    .-.     ",
        "   ({E}{E})    ",
        "   (   )    ",
        "    '-'     ",
      ],
    ],
  },
  {
    id: "cactus",
    name: "Cactus",
    description:
      "A potted succulent with stubby arms. Waves them at different heights.",
    frames: [
      [
        "            ",
        "    .__.    ",
        " ~-|{E} {E}|-~ ",
        "   |    |   ",
        "  [|____|]  ",
      ],
      [
        "            ",
        " ~  .__.    ",
        "  -|{E} {E}|-~ ",
        "   |    |   ",
        "  [|____|]  ",
      ],
      [
        "            ",
        " ~  .__.  ~ ",
        "  -|{E} {E}|- ",
        "   |    |   ",
        "  [|____|]  ",
      ],
    ],
  },
  {
    id: "mushroom",
    name: "Mushroom",
    description:
      "A spotted toadstool. Its cap spots rearrange and it releases spores.",
    frames: [
      [
        "            ",
        "  .o--O-.   ",
        " (________).",
        "   |{E} {E}|   ",
        "   |___|    ",
      ],
      [
        "            ",
        "  .O--o-.   ",
        " (________).",
        "   |{E} {E}|   ",
        "   |___|    ",
      ],
      [
        "    . .     ",
        "  .o--O-.   ",
        " (________).",
        "   |{E} {E}|   ",
        "   |___|    ",
      ],
    ],
  },
  {
    id: "chonk",
    name: "Chonk",
    description:
      "An extra-round cat of magnificent girth. Wears its weight with dignity.",
    frames: [
      [
        "            ",
        "  ^    ^    ",
        " (  {E}  {E} ) ",
        " (  ..   )  ",
        "  '------'  ",
      ],
      [
        "            ",
        "  ^    |    ",
        " (  {E}  {E} ) ",
        " (  ..   )  ",
        "  '------'  ",
      ],
      [
        "            ",
        "  ^    ^    ",
        " (  {E}  {E} ) ",
        " (  ..   )  ",
        "  '------'~ ",
      ],
    ],
  },
  {
    id: "capybara",
    name: "Capybara",
    description:
      "The chillest creature around. Broad face, tiny ears, zero worries.",
    frames: [
      [
        "            ",
        "  n_____n   ",
        " (  {E}  {E} ) ",
        " (  oo   )  ",
        "  '-----'   ",
      ],
      [
        "            ",
        "  n_____n   ",
        " (  {E}  {E} ) ",
        " (  oO   )  ",
        "  '-----'   ",
      ],
      [
        "    ~ ~     ",
        "  u_____n   ",
        " (  {E}  {E} ) ",
        " (  oo   )  ",
        "  '-----'   ",
      ],
    ],
  },
];
