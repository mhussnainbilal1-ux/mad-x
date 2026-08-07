import boxingGlovesProducts from "@/data/boxingGloves.json";
import focusPad from "@/data/boxingFocusPad.json";
import headGaurd from "@/data/boxingHeadGaurd.json";

export const getProductRange = (index, skipType) => {

  const products = [
    skipType !== "Boxing Gloves"
      ? boxingGlovesProducts.find((item) => item.index === index)
      : null,

    skipType !== "Focus Pads"
      ? focusPad.find((item) => item.index === index)
      : null,

    skipType !== "Head Guard"
      ? headGaurd.find((item) => item.index === index)
      : null,
  ];

  return products.filter(Boolean);
};