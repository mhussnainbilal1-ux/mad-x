import "server-only";

import boxingGlovesProducts from "@/data/boxingGloves.json";
import focusPad from "@/data/boxingFocusPad.json";
import headGaurd from "@/data/boxingHeadGaurd.json";
import shinGuard from "@/data/boxingShinGuard.json";
import punchBags from "@/data/boxingPunchBag.json";
import chestguard from "@/data/boxingChestguard.json";
import shorts from "@/data/boxingshorts.json";
import shirts from "@/data/boxingShirts.json";
import rashguard from "@/data/boxingRashguard.json";
import mmaSparingGloves from "@/data/mmaSparingGloves.json";
import mmaGrapplingGloves from "@/data/mmaGrapplingGloves.json";
import mmaShorts from "@/data/mmaShorts.json";
import weightLiftingBelt from "@/data/fitnessWeightLiftingBelt.json";
import fitnessGymGloves from "@/data/fitnessGymGloves.json";
import activewearCompressionTShirts from "@/data/activewearCompressionTShirts.json";
import activewearGymTShirts from "@/data/activewearGymTShirts.json";
import activewearPerformanceTShirts from "@/data/activewearPerformanceTShirts.json";
import activewearSleevelessTrainingShirts from "@/data/activewearSleevelessTrainingShirts.json";
import activewearStringerVests from "@/data/activewearStringerVests.json";
import activewearTankTops from "@/data/activewearTankTops.json";
import activewearCropTops from "@/data/activewearCropTops.json";
import activewearLongSleeveTrainingTops from "@/data/activewearLongSleeveTrainingTops.json";
import activewearHoodies from "@/data/activewearHoodies.json";
import activewearBottoms from "@/data/activewearBottoms.json";
const productCollections = [
  activewearHoodies,
  activewearLongSleeveTrainingTops,
  activewearCropTops,
  activewearTankTops,
  activewearStringerVests,
  activewearSleevelessTrainingShirts,
  activewearPerformanceTShirts,
  activewearGymTShirts,
  activewearCompressionTShirts,
  activewearBottoms,
  weightLiftingBelt,
  fitnessGymGloves,
  mmaSparingGloves,
  mmaGrapplingGloves,
  mmaShorts,
  boxingGlovesProducts,
  focusPad,
  headGaurd,
  shinGuard,
  chestguard,
  shorts,
  shirts,
  rashguard,
  punchBags,
];

export const allProducts = productCollections.flat();

export const previewProducts = productCollections.flatMap((collection) =>
  collection.slice(0, 3),
);
