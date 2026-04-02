// ASCII art sourced from the Claude Code buddy system (sprites.ts).
// Each species has 3 animation frames, 5 lines tall, 12 chars wide.
// {E} placeholder is replaced with the rolled eye character at render time.

export const SPECIES = [
  {
    id: "duck",
    name: "Duck",
    description:
      "A cheerful little duck. Loyal companion since the earliest days of Claude Code.",
    frames: [
      [
        "            ",
        "    __      ",
        "  <({E} )___  ",
        "   (  ._>   ",
        "    `--\u00b4    ",
      ],
      [
        "            ",
        "    __      ",
        "  <({E} )___  ",
        "   (  ._>   ",
        "    `--\u00b4~   ",
      ],
      [
        "            ",
        "    __      ",
        "  <({E} )___  ",
        "   (  .__>  ",
        "    `--\u00b4    ",
      ],
    ],
  },
  {
    id: "goose",
    name: "Goose",
    description:
      "Taller and bolder than the duck. Known for its assertive honking.",
    frames: [
      [
        "            ",
        "     ({E}>    ",
        "     ||     ",
        "   _(__)_   ",
        "    ^^^^    ",
      ],
      [
        "            ",
        "    ({E}>     ",
        "     ||     ",
        "   _(__)_   ",
        "    ^^^^    ",
      ],
      [
        "            ",
        "     ({E}>>   ",
        "     ||     ",
        "   _(__)_   ",
        "    ^^^^    ",
      ],
    ],
  },
  {
    id: "cat",
    name: "Cat",
    description:
      "A classic feline companion. The omega mouth gives it an air of quiet judgement.",
    frames: [
      [
        "            ",
        "   /\\_/\\    ",
        "  ( {E}   {E})  ",
        "  (  \u03c9  )   ",
        '  (")_(")   ',
      ],
      [
        "            ",
        "   /\\_/\\    ",
        "  ( {E}   {E})  ",
        "  (  \u03c9  )   ",
        '  (")_(")~  ',
      ],
      [
        "            ",
        "   /\\-/\\    ",
        "  ( {E}   {E})  ",
        "  (  \u03c9  )   ",
        '  (")_(")   ',
      ],
    ],
  },
  {
    id: "rabbit",
    name: "Rabbit",
    description: "Long ears and whiskers. Twitchy but endearing.",
    frames: [
      [
        "            ",
        "   (\\__/)   ",
        "  ( {E}  {E} )  ",
        " =(  ..  )= ",
        '  (")__(")  ',
      ],
      [
        "            ",
        "   (|__/)   ",
        "  ( {E}  {E} )  ",
        " =(  ..  )= ",
        '  (")__(")  ',
      ],
      [
        "            ",
        "   (\\__/)   ",
        "  ( {E}  {E} )  ",
        " =( .  . )= ",
        '  (")__(")  ',
      ],
    ],
  },
  {
    id: "owl",
    name: "Owl",
    description:
      "Wide-eyed and wise. The concentric eye rings give it an intense stare.",
    frames: [
      [
        "            ",
        "   /\\  /\\   ",
        "  (({E})({E}))  ",
        "  (  ><  )  ",
        "   `----\u00b4   ",
      ],
      [
        "            ",
        "   /\\  /\\   ",
        "  (({E})({E}))  ",
        "  (  ><  )  ",
        "   .----.   ",
      ],
      [
        "            ",
        "   /\\  /\\   ",
        "  (({E})(-))  ",
        "  (  ><  )  ",
        "   `----\u00b4   ",
      ],
    ],
  },
  {
    id: "penguin",
    name: "Penguin",
    description: "A tuxedo-clad bird. Waddles in place between frames.",
    frames: [
      [
        "            ",
        "  .---.     ",
        "  ({E}>{E})     ",
        " /(   )\\    ",
        "  `---\u00b4     ",
      ],
      [
        "            ",
        "  .---.     ",
        "  ({E}>{E})     ",
        " |(   )|    ",
        "  `---\u00b4     ",
      ],
      [
        "  .---.     ",
        "  ({E}>{E})     ",
        " /(   )\\    ",
        "  `---\u00b4     ",
        "   ~ ~      ",
      ],
    ],
  },
  {
    id: "turtle",
    name: "Turtle",
    description: "Slow and steady. Its shell pattern changes between frames.",
    frames: [
      [
        "            ",
        "   _,--._   ",
        "  ( {E}  {E} )  ",
        " /[______]\\ ",
        "  ``    ``  ",
      ],
      [
        "            ",
        "   _,--._   ",
        "  ( {E}  {E} )  ",
        " /[______]\\ ",
        "   ``  ``   ",
      ],
      [
        "            ",
        "   _,--._   ",
        "  ( {E}  {E} )  ",
        " /[======]\\ ",
        "  ``    ``  ",
      ],
    ],
  },
  {
    id: "snail",
    name: "Snail",
    description:
      "A single eye on a stalk, carrying its spiral shell. Leaves a trail of tildes.",
    frames: [
      [
        "            ",
        " {E}    .--.  ",
        "  \\  ( @ )  ",
        "   \\_`--\u00b4   ",
        "  ~~~~~~~   ",
      ],
      [
        "            ",
        "  {E}   .--.  ",
        "  |  ( @ )  ",
        "   \\_`--\u00b4   ",
        "  ~~~~~~~   ",
      ],
      [
        "            ",
        " {E}    .--.  ",
        "  \\  ( @  ) ",
        "   \\_`--\u00b4   ",
        "   ~~~~~~   ",
      ],
    ],
  },
  {
    id: "dragon",
    name: "Dragon",
    description:
      "Horned and fierce, with a zigzag maw. Occasionally puffs smoke.",
    frames: [
      [
        "            ",
        "  /^\\  /^\\  ",
        " <  {E}  {E}  > ",
        " (   ~~   ) ",
        "  `-vvvv-\u00b4  ",
      ],
      [
        "            ",
        "  /^\\  /^\\  ",
        " <  {E}  {E}  > ",
        " (        ) ",
        "  `-vvvv-\u00b4  ",
      ],
      [
        "   ~    ~   ",
        "  /^\\  /^\\  ",
        " <  {E}  {E}  > ",
        " (   ~~   ) ",
        "  `-vvvv-\u00b4  ",
      ],
    ],
  },
  {
    id: "octopus",
    name: "Octopus",
    description:
      "Round head, wavy tentacles. The tentacles alternate direction each frame.",
    frames: [
      [
        "            ",
        "   .----.   ",
        "  ( {E}  {E} )  ",
        "  (______)  ",
        "  /\\/\\/\\/\\  ",
      ],
      [
        "            ",
        "   .----.   ",
        "  ( {E}  {E} )  ",
        "  (______)  ",
        "  \\/\\/\\/\\/  ",
      ],
      [
        "     o      ",
        "   .----.   ",
        "  ( {E}  {E} )  ",
        "  (______)  ",
        "  /\\/\\/\\/\\  ",
      ],
    ],
  },
  {
    id: "axolotl",
    name: "Axolotl",
    description: "Feathery gills frame its face. The gill fronds wave gently.",
    frames: [
      [
        "            ",
        "}~(______)~{",
        "}~({E} .. {E})~{",
        "  ( .--. )  ",
        "  (_/  \\_)  ",
      ],
      [
        "            ",
        "~}(______){~",
        "~}({E} .. {E}){~",
        "  ( .--. )  ",
        "  (_/  \\_)  ",
      ],
      [
        "            ",
        "}~(______)~{",
        "}~({E} .. {E})~{",
        "  (  --  )  ",
        "  ~_/  \\_~  ",
      ],
    ],
  },
  {
    id: "ghost",
    name: "Ghost",
    description:
      "A floating spectre with a wavy bottom edge. Occasionally drifts upward.",
    frames: [
      [
        "            ",
        "   .----.   ",
        "  / {E}  {E} \\  ",
        "  |      |  ",
        "  ~`~``~`~  ",
      ],
      [
        "            ",
        "   .----.   ",
        "  / {E}  {E} \\  ",
        "  |      |  ",
        "  `~`~~`~`  ",
      ],
      [
        "    ~  ~    ",
        "   .----.   ",
        "  / {E}  {E} \\  ",
        "  |      |  ",
        "  ~~`~~`~~  ",
      ],
    ],
  },
  {
    id: "robot",
    name: "Robot",
    description:
      "Boxy head with an antenna. Its display panel flickers between frames.",
    frames: [
      [
        "            ",
        "   .[||].   ",
        "  [ {E}  {E} ]  ",
        "  [ ==== ]  ",
        "  `------\u00b4  ",
      ],
      [
        "            ",
        "   .[||].   ",
        "  [ {E}  {E} ]  ",
        "  [ -==- ]  ",
        "  `------\u00b4  ",
      ],
      [
        "     *      ",
        "   .[||].   ",
        "  [ {E}  {E} ]  ",
        "  [ ==== ]  ",
        "  `------\u00b4  ",
      ],
    ],
  },
  {
    id: "blob",
    name: "Blob",
    description:
      "An amorphous, squishy creature. Changes shape slightly each frame.",
    frames: [
      [
        "            ",
        "   .----.   ",
        "  ( {E}  {E} )  ",
        "  (      )  ",
        "   `----\u00b4   ",
      ],
      [
        "            ",
        "  .------.  ",
        " (  {E}  {E}  ) ",
        " (        ) ",
        "  `------\u00b4  ",
      ],
      [
        "            ",
        "    .--.    ",
        "   ({E}  {E})   ",
        "   (    )   ",
        "    `--\u00b4    ",
      ],
    ],
  },
  {
    id: "cactus",
    name: "Cactus",
    description:
      "A potted succulent with stubby arms. The arms shift position between frames.",
    frames: [
      [
        "            ",
        " n  ____  n ",
        " | |{E}  {E}| | ",
        " |_|    |_| ",
        "   |    |   ",
      ],
      [
        "            ",
        "    ____    ",
        " n |{E}  {E}| n ",
        " |_|    |_| ",
        "   |    |   ",
      ],
      [
        " n        n ",
        " |  ____  | ",
        " | |{E}  {E}| | ",
        " |_|    |_| ",
        "   |    |   ",
      ],
    ],
  },
  {
    id: "mushroom",
    name: "Mushroom",
    description:
      "A spotted toadstool with a face on its stem. The cap spots rearrange.",
    frames: [
      [
        "            ",
        " .-o-OO-o-. ",
        "(__________)",
        "   |{E}  {E}|   ",
        "   |____|   ",
      ],
      [
        "            ",
        " .-O-oo-O-. ",
        "(__________)",
        "   |{E}  {E}|   ",
        "   |____|   ",
      ],
      [
        "   . o  .   ",
        " .-o-OO-o-. ",
        "(__________)",
        "   |{E}  {E}|   ",
        "   |____|   ",
      ],
    ],
  },
  {
    id: "chonk",
    name: "Chonk",
    description:
      "An extra-round cat of considerable girth. Proud of every ounce.",
    frames: [
      [
        "            ",
        "  /\\    /\\  ",
        " ( {E}    {E} ) ",
        " (   ..   ) ",
        "  `------\u00b4  ",
      ],
      [
        "            ",
        "  /\\    /|  ",
        " ( {E}    {E} ) ",
        " (   ..   ) ",
        "  `------\u00b4  ",
      ],
      [
        "            ",
        "  /\\    /\\  ",
        " ( {E}    {E} ) ",
        " (   ..   ) ",
        "  `------\u00b4~ ",
      ],
    ],
  },
  {
    id: "capybara",
    name: "Capybara",
    description:
      "The chillest rodent alive. Broad face, tiny ears, unbothered expression.",
    frames: [
      [
        "            ",
        "  n______n  ",
        " ( {E}    {E} ) ",
        " (   oo   ) ",
        "  `------\u00b4  ",
      ],
      [
        "            ",
        "  n______n  ",
        " ( {E}    {E} ) ",
        " (   Oo   ) ",
        "  `------\u00b4  ",
      ],
      [
        "    ~  ~    ",
        "  u______n  ",
        " ( {E}    {E} ) ",
        " (   oo   ) ",
        "  `------\u00b4  ",
      ],
    ],
  },
];
