import boxingGlovesProducts from "@/data/boxingGloves.json";
import focusPad from "@/data/boxingFocusPad.json";
import headGaurd from "@/data/boxingHeadGaurd.json";
import shinGuard from "@/data/boxingShinGuard.json";
import punchBags from "@/data/boxingPunchBag.json"
import chestguard from "@/data/boxingChestguard.json"
import shorts from "@/data/boxingshorts.json"
import shirts from "@/data/boxingShirts.json"
import rashguard from "@/data/boxingRashguard.json"
import mmaSparingGloves from "@/data/mmaSparingGloves.json"
import mmaGrapplingGloves from "@/data/mmaGrapplingGloves.json"
import mmaShorts from "@/data/mmaShorts.json"
import weightLiftingBelt from "@/data/fitnessWeightLiftingBelt.json";
import fitnessGymGloves from "@/data/fitnessGymGloves.json";
export const products = [
  ...weightLiftingBelt,
  ...fitnessGymGloves,

  ...mmaSparingGloves,
  ...mmaGrapplingGloves,
  ...mmaShorts,

  ...boxingGlovesProducts,
  ...focusPad,
  ...headGaurd,
  ...shinGuard,
  ...chestguard,
  ...shorts,
  ...shirts,
  ...rashguard,
  ...punchBags,

]
