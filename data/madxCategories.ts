export type CategoryGroup = { name: string; items: string[] };
export type ProductCategory = {
  name: string;
  slug: string;
  groups: CategoryGroup[];
};

export const madxCategories: ProductCategory[] = [
  {
    name: "Boxing",
    slug: "boxing",
    groups: [
      {
        name: "Boxing Gloves",
        items: [
          "Competition Gloves",
          "Sparring Gloves",
          "Training Gloves",
          "Kids Boxing Gloves",
          "Bag Gloves",
          "Boxing Gloves & Pads",
        ],
      },
      {
        name: "Punch Bags",
        items: [
          "Training Punching Bags",
          "Punching Bags & Mitts Sets",
          "Freestanding Punch Bags",
          "Angle & Uppercut Bags",
          "Double End Bags",
          "Speed Bags & Platforms",
          "Kids Punch Bags",
          "Accessories",
        ],
      },
      {
        name: "Coaching Equipment",
        items: [
          "Focus Pads",
          "Paddles Mitts",
          "Training Sticks",
          "Body Protectors",
        ],
      },
      {
        name: "Protective Gear",
        items: [
          "Hand Wraps & Inner Gloves",
          "Head Gear",
          "Mouth Guards",
          "Chest Guards",
          "Groin Protectors",
          "Knee Wraps",
          "Kids Protective Gear",
        ],
      },
      {
        name: "Training Equipment",
        items: ["Jump Ropes", "Fitness Sandbags", "Leg Stretchers"],
      },
      {
        name: "Apparel",
        items: [
          "Boxing Trunks",
          "Compression Wear",
          "T-Shirts & Vests",
          "Sauna Suits",
        ],
      },
    ],
  },
  {
    name: "MMA",
    slug: "mma",
    groups: [
      {
        name: "MMA Gloves",
        items: ["Sparring Gloves", "Training Gloves", "Kids Grappling Gloves"],
      },
      {
        name: "MMA Punch Bags",
        items: [
          "MMA Training Punching Bags",
          "MMA Punching Bags & Mitts Sets",
          "Freestanding Punch Bags",
          "Angle & Uppercut Bags",
          "Accessories",
          "Kids MMA Bags",
          "Speed Bags & Platforms",
        ],
      },
      {
        name: "Coaching Equipment",
        items: ["Focus Mitts", "Kicking Shields", "Thai Pads", "Chest Guard"],
      },
      {
        name: "Protective Gear",
        items: [
          "Hand Wraps & Inner Gloves",
          "Head Gear",
          "Mouth Guards",
          "Chest Guards",
          "Groin Protectors",
          "Knee Wraps",
          "Shin Guards",
        ],
      },
      {
        name: "Training Equipment",
        items: ["Jump Ropes", "Fitness Sandbags", "Leg Stretchers"],
      },
      {
        name: "Apparel",
        items: ["MMA Shorts", "Compression Wear", "Sauna Suits"],
      },
      {
        name: "Equipment Bags",
        items: ["Equipment Bags"],
      },
    ],
  },
  {
    name: "Fitness",
    slug: "fitness",
    groups: [
      {
        name: "Gym Gloves",
        items: ["Fitness & Workout", "Training & Gym", "Heavy Weight Lifting"],
      },
      {
        name: "Weightlifting Belts",
        items: [
          "Leather Belts",
          "Training Belts",
          "Dipping Belts",
          "Powerlifting Belts",
        ],
      },
      {
        name: "Weightlifting Gear",
        items: [
          "Weightlifting Grips & Straps",
          "Arm Blaster",
          "AB Strap & Triceps Rope",
          "Head Harness",
        ],
      },
      {
        name: "Strength Training",
        items: ["Jump Ropes", "Leg Stretchers", "Fitness Bags", "Kettlebells"],
      },
      {
        name: "Stability & Mobility",
        items: [
          "Ab Rollers",
          "Aerobic Step",
          "Balance Boards",
          "Resistance Bands",
          "Resistance Tubes",
        ],
      },
      {
        name: "Braces & Support",
        items: [
          "Elbow Support",
          "Back Support",
          "Wrist Support",
          "Knee Support",
          "Ankle Support",
        ],
      },
      {
        name: "Gym Essentials",
        items: ["Sauna Suits", "Compression Wear", "Equipment Bags"],
      },
    ],
  },
  {
    name: "Yoga",
    slug: "yoga",
    groups: [
      {
        name: "Yoga",
        items: [
          "Cork Yoga Mat",
          "PU Mat",
          "TPE Mat",
          "PVC Mat",
          "Cork Yoga Block",
          "EVA Yoga Block",
          "Plain Yoga Strap",
          "Color Yoga Strap",
          "Gym Ball",
          "Balance Trainer",
        ],
      },
      {
        name: "Yoga Mats",
        items: [
          "PVC Yoga Mats",
          "TPE Yoga Mats",
          "Cork Yoga Mats",
          "PU Yoga Mats",
        ],
      },
      {
        name: "Yoga Blocks",
        items: ["EVA Foam Blocks", "Cork Block"],
      },
      {
        name: "Yoga Strap",
        items: ["Plain Yoga Straps", "Color Yoga Straps"],
      },
      {
        name: "Yoga Balls",
        items: ["Yoga Ball With Base", "Balance Trainer Ball"],
      },
      {
        name: "Stability & Mobility",
        items: [
          "Ab Rollers",
          "Aerobic Steps",
          "Balance Boards",
          "Bands & Tubes",
        ],
      },
    ],
  },
  {
    name: "Apparel",
    slug: "apparel",
    groups: [
      {
        name: "T-Shirts & Tops",
        items: [
          "Compression T-Shirts",
          "Crop Tops",
          "Gym T-Shirts",
          "Hoodies",
          "Long-Sleeve Training Tops",
          "Performance T-Shirts",
          "Sleeveless Training Shirts",
          "Stringer Vests",
          "Tank Tops",
        ],
      },
      {
        name: "Bottoms",
        items: [
          "Compression Shorts",
          "Cycling Shorts",
          "Gym Shorts",
          "Joggers",
          "Running Shorts",
          "Sweatpants",
          "Training Pants",
          "Training Shorts",
        ],
      },
    ],
  },
  {
    name: "Leather Jackets",
    slug: "leather-fashion-jackets",
    groups: [
      { name: "Biker Jackets", items: [] },
      { name: "Bomber Jackets", items: [] },
      { name: "Fashion Jackets", items: [] },
    ],
  },
];

export function getCategory(categorySlug: string) {
  const category = madxCategories.find((item) => item.slug === categorySlug);

  if (!category) {
    throw new Error(`Category not found: ${categorySlug}`);
  }

  return category;
}

export function getGroup(categorySlug: string, groupName: string) {
  const category = getCategory(categorySlug);

  const group = category.groups.find((item) => item.name === groupName);

  if (!group) {
    throw new Error(
      `Group "${groupName}" not found in category "${categorySlug}"`,
    );
  }

  return group;
}

export function getItem(
  categorySlug: string,
  groupName: string,
  itemName: string,
) {
  const group = getGroup(categorySlug, groupName);

  const item = group.items.find((value) => value === itemName);

  if (!item) {
    throw new Error(`Item "${itemName}" not found inside "${groupName}"`);
  }

  return item;
}
