"use client";

import useIsMobile from "@/app/hooks/useIsMobile";
import MobileSideMenu from "./MobileSideMenu";
import SubCategorySidebar from "./SubCategorySidebar";

export default function ResponsiveSidebar({
  selectedCategory,
  selectedSubCategory,
}) {
  const isMobile = useIsMobile();

  return isMobile ? (
    <MobileSideMenu
      selectedCategory={selectedCategory}
      selectedSubCategory={selectedSubCategory}
    />
  ) : (
    <SubCategorySidebar
      selectedCategory={selectedCategory}
      selectedSubCategory={selectedSubCategory}
    />
  );
}