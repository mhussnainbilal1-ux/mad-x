const fs = require("fs");
const path = require("path");

const dataDirectory = path.join(process.cwd(), "data");

const colorAliases = {
  black: ["black", "onyx", "dark"],
  white: ["white", "pearl"],
  grey: [
    "grey",
    "gray",
    "silver",
    "graphite",
    "charcoal",
    "slate",
    "steel",
    "gunmetal",
  ],
  red: ["red", "crimson", "burgundy", "maroon", "scarlet"],
  blue: ["blue", "navy", "cobalt", "royal blue", "sky blue"],
  green: ["green", "forest", "emerald", "olive", "sage", "lime"],
  purple: ["purple", "plum", "violet"],
  orange: ["orange"],
  yellow: ["yellow", "gold"],
  brown: ["brown", "bronze", "tan", "taupe"],
  beige: ["beige", "cream", "sand", "khaki", "taupe"],
};

const motifAliases = {
  fire: ["fire", "flame", "inferno", "volcano", "molten"],
  skull: ["skull", "skeleton"],
  eagle: ["eagle", "bird"],
  tiger: ["tiger", "cat"],
  crown: ["crown", "king", "royal"],
  checkered: ["checkered", "checker", "racing", "race"],
  lightning: ["lightning", "electric", "voltage", "thunder"],
  camouflage: ["camouflage", "camo", "military"],
  spider: ["spider", "web"],
  fighter: ["fighter", "warrior", "champion"],
  graphic: ["graphic", "printed", "pattern", "design"],
};

const typeGroups = [
  {
    match: ["compression shorts"],
    aliases: [
      "compression shorts",
      "compression short",
      "tight shorts",
      "base layer shorts",
      "lycra shorts",
      "nikker",
      "nicker",
      "knickers",
    ],
  },
  {
    match: ["cycling shorts"],
    aliases: [
      "cycling shorts",
      "bike shorts",
      "bicycle shorts",
      "biker shorts",
      "cycle wear",
      "nikker",
      "nicker",
      "knickers",
    ],
  },
  {
    match: ["shorts"],
    aliases: [
      "shorts",
      "short",
      "short pant",
      "short pants",
      "nikker",
      "nicker",
      "knicker",
      "knickers",
      "half pant",
      "bottoms",
    ],
  },
  {
    match: ["jogger", "sweatpant", "training pants"],
    aliases: [
      "pants",
      "pant",
      "trousers",
      "trouser",
      "track pants",
      "track bottoms",
      "joggers",
      "sweatpants",
      "lower",
      "bottoms",
    ],
  },
  {
    match: ["crop top"],
    aliases: [
      "crop top",
      "cropped shirt",
      "women shirt",
      "ladies top",
      "gym crop",
      "workout top",
      "tee",
      "t shirt",
      "tshirt",
    ],
  },
  {
    match: ["compression t-shirt", "compression t shirt"],
    aliases: [
      "compression shirt",
      "compression tee",
      "compression tshirt",
      "compression t shirt",
      "base layer shirt",
      "tight shirt",
      "gym shirt",
    ],
  },
  {
    match: ["rashguard", "rash guard"],
    aliases: [
      "rashguard",
      "rash guard",
      "compression shirt",
      "bjj shirt",
      "grappling shirt",
      "mma shirt",
      "long sleeve shirt",
    ],
  },
  {
    match: ["long-sleeve", "long sleeve"],
    aliases: [
      "long sleeve shirt",
      "full sleeve shirt",
      "full sleeves",
      "training shirt",
      "training top",
      "sports shirt",
      "tee",
      "t shirt",
      "tshirt",
    ],
  },
  {
    match: ["sleeveless", "tank top", "stringer", "vest"],
    aliases: [
      "sleeveless shirt",
      "tank top",
      "vest",
      "stringer",
      "gym vest",
      "gym tank",
      "training top",
      "muscle shirt",
      "singlet",
    ],
  },
  {
    match: ["t-shirt", "t shirt", "shirt"],
    aliases: [
      "shirt",
      "t shirt",
      "t-shirt",
      "tshirt",
      "tee",
      "top",
      "jersey",
      "sports shirt",
      "gym shirt",
      "training shirt",
    ],
  },
  {
    match: ["hoodie"],
    aliases: [
      "hoodie",
      "hooded sweatshirt",
      "sweatshirt",
      "pullover",
      "jacket",
      "training hoodie",
    ],
  },
  {
    match: ["boxing gloves"],
    aliases: [
      "boxing gloves",
      "boxing glove",
      "fight gloves",
      "training gloves",
      "sparring gloves",
      "punching gloves",
    ],
  },
  {
    match: ["mma sparring gloves"],
    aliases: [
      "mma sparring gloves",
      "sparring gloves",
      "padded mma gloves",
      "training mma gloves",
      "open finger gloves",
    ],
  },
  {
    match: ["mma grappling gloves"],
    aliases: [
      "mma grappling gloves",
      "grappling gloves",
      "fight gloves",
      "open palm gloves",
      "open finger gloves",
      "ufc gloves",
    ],
  },
  {
    match: ["mma gloves"],
    aliases: [
      "mma gloves",
      "mma glove",
      "fight gloves",
      "open palm gloves",
      "open finger gloves",
      "fingerless gloves",
      "ufc gloves",
    ],
  },
  {
    match: [
      "gym gloves",
      "workout gloves",
      "weight lifting gloves",
      "weightlifting gloves",
    ],
    aliases: [
      "gym gloves",
      "workout gloves",
      "fitness gloves",
      "lifting gloves",
      "weightlifting gloves",
      "weight lifting gloves",
      "fingerless gloves",
    ],
  },
  {
    match: ["focus mitt", "target mitt"],
    aliases: [
      "focus mitts",
      "focus pads",
      "focus pad",
      "target mitts",
      "punch mitts",
      "boxing pads",
      "coaching pads",
    ],
  },
  {
    match: ["headguard", "head guard"],
    aliases: [
      "headguard",
      "head guard",
      "boxing helmet",
      "head protection",
      "face guard",
      "sparring helmet",
    ],
  },
  {
    match: ["shin guard", "shin & instep"],
    aliases: [
      "shin guards",
      "shin guard",
      "shin pads",
      "leg guards",
      "instep guards",
      "kickboxing guards",
      "muay thai guards",
    ],
  },
  {
    match: ["body protector", "chest"],
    aliases: [
      "body protector",
      "chest guard",
      "chest protector",
      "body armour",
      "body armor",
      "coaching vest",
      "boxing chestguard",
    ],
  },
  {
    match: ["punch bag", "heavy bag"],
    aliases: [
      "punch bag",
      "punching bag",
      "boxing bag",
      "heavy bag",
      "hanging bag",
      "training bag",
      "kick bag",
    ],
  },
  {
    match: [
      "powerlifting belt",
      "weightlifting belt",
      "gym belt",
      "dipping belt",
    ],
    aliases: [
      "gym belt",
      "lifting belt",
      "weightlifting belt",
      "weight lifting belt",
      "powerlifting belt",
      "workout belt",
      "back support belt",
    ],
  },
];

function clean(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function unique(values) {
  return [...new Set(values.map(clean).filter(Boolean))];
}

function includesPhrase(text, phrase) {
  return ` ${text} `.includes(` ${clean(phrase)} `);
}

function tagsFor(product) {
  const searchable = clean(
    [
      product.name,
      product.type,
      product.category,
      product.subCategory,
      product.summary,
      ...(product.features || []),
    ].join(" "),
  );
  const tags = [
    "madx",
    "mad x",
    "custom",
    "customizable",
    "oem",
    "wholesale",
    "manufacturer",
  ];

  for (const [canonical, variants] of Object.entries(colorAliases)) {
    if (variants.some((variant) => includesPhrase(searchable, variant))) {
      tags.push(canonical, ...variants);
    }
  }

  for (const [canonical, variants] of Object.entries(motifAliases)) {
    if (variants.some((variant) => includesPhrase(searchable, variant))) {
      tags.push(canonical, ...variants);
    }
  }

  for (const group of typeGroups) {
    if (group.match.some((term) => searchable.includes(clean(term)))) {
      tags.push(...group.aliases);
    }
  }

  if (searchable.includes("boxing"))
    tags.push("boxing", "boxer", "fight gear", "combat sports");
  if (searchable.includes("mma"))
    tags.push(
      "mma",
      "mixed martial arts",
      "fight gear",
      "combat sports",
      "cage fighting",
    );
  if (searchable.includes("fitness") || searchable.includes("gym"))
    tags.push("fitness", "gym", "workout", "exercise", "training gear");
  if (searchable.includes("activewear") || searchable.includes("apparel"))
    tags.push(
      "activewear",
      "sportswear",
      "gym wear",
      "workout clothes",
      "training wear",
    );

  return unique(tags);
}

for (const filename of fs
  .readdirSync(dataDirectory)
  .filter((name) => name.endsWith(".json"))) {
  const filepath = path.join(dataDirectory, filename);
  const products = JSON.parse(fs.readFileSync(filepath, "utf8"));
  for (const product of products) product.searchTags = tagsFor(product);
  fs.writeFileSync(filepath, `${JSON.stringify(products, null, 2)}\n`);
}
