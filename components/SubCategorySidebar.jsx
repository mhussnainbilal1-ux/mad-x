"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { madxCategories } from "@/data/madxCategories";
export default function SubCategorySidebar() {
  const searchParams = useSearchParams();

  const selectedCategory = searchParams.get("category");
  const selectedSubCategory = searchParams.get("subCategory");

  const activeCategory =
    madxCategories.find((category) => category.name === selectedCategory) ||
    madxCategories[0];

  return (
    <aside className="subcategorySidebar">
      <div className="subcategorySidebarHeader">
        <span>Browse catalogue</span>
        <h2>{activeCategory.name}</h2>
      </div>

      <div className="sidebarCategories">
        {madxCategories
          .filter(
            (category) =>
              category.groups.length > 0 &&
              !["sale", "gift-card"].includes(category.slug),
          )
          ?.map((category) => {
            const isActive = category.name === activeCategory.name;

            return (
              <div
                key={category.slug}
                className={`sidebarCategory ${isActive ? "active" : ""}`}
              >
                <Link
                  scroll={true}
                  href={`/products?category=${encodeURIComponent(
                    category.name,
                  )}`}
                  className="sidebarCategoryTitle"
                >
                  {category.name}
                  <span>→</span>
                </Link>

                {isActive && (
                  <div className="sidebarSubcategories">
                    <Link
                      scroll={true}
                      href={`/products?category=${encodeURIComponent(
                        category.name,
                      )}`}
                      className={!selectedSubCategory ? "active" : ""}
                    >
                      All {category.name}
                    </Link>

                    {category.groups?.map((group) => (
                      <div key={group.name}>
                        <Link
                          scroll={true}
                          href={`/products?category=${encodeURIComponent(
                            category.name,
                          )}&subCategory=${encodeURIComponent(group.name)}`}
                          className={
                            selectedSubCategory === group.name ? "active" : ""
                          }
                        >
                          {group.name}
                          <span>→</span>
                        </Link>

                        {category.slug === "apparel" &&
                          group.items.length > 0 && (
                            <div className="apparelSidebarChildren">
                              {group.items?.map((item) => (
                                <Link
                                  scroll={true}
                                  key={item}
                                  href={`/products?category=${encodeURIComponent(
                                    category.name,
                                  )}&subCategory=${encodeURIComponent(item)}`}
                                  className={
                                    selectedSubCategory === item ? "active" : ""
                                  }
                                >
                                  <span aria-hidden="true">›</span>
                                  {item}
                                </Link>
                              ))}
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </aside>
  );
}
