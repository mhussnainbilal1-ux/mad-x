const relatedProductTypes = ["Boxing Gloves", "Focus Pads", "Head Guard"];

export const getProductRange = (products, index, skipType) =>
  relatedProductTypes
    .filter((type) => type !== skipType)
    .map((type) =>
      products.find((item) => item.type === type && item.index === index),
    )
    .filter(Boolean);
