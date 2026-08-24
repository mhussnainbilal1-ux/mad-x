async function imageUrlToDataUrl(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Could not load ${url}`);
  const blob = await response.blob();
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function safeFileDate() {
  return new Date().toISOString().slice(0, 10);
}

export async function generateProductListPdf(
  items,
  listType = "sample",
  customerDetails = {},
) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  const title =
    listType === "combined"
      ? "Product Selection List"
      : `${listType === "sample" ? "Sample" : "Order"} List`;
  const reference = `MADX-${listType === "sample" ? "SMP" : listType === "order" ? "ORD" : "LST"}-${Date.now().toString().slice(-8)}`;
  const relevantItems =
    listType === "combined"
      ? items
      : items.filter((item) => item.listType === listType);
  let pageNumber = 1;
  let y = 16;

  function addImageContained(dataUrl, x, imageY, boxWidth, boxHeight) {
    const properties = doc.getImageProperties(dataUrl);
    const scale = Math.min(
      boxWidth / properties.width,
      boxHeight / properties.height,
    );
    const width = properties.width * scale;
    const height = properties.height * scale;
    doc.addImage(
      dataUrl,
      properties.fileType,
      x + (boxWidth - width) / 2,
      imageY + (boxHeight - height) / 2,
      width,
      height,
      undefined,
      "FAST",
    );
  }

  let logo = null;
  try {
    logo = await imageUrlToDataUrl("/images/common/logo2.png");
  } catch {}

  function addHeader() {
    doc.setFillColor(7, 24, 43);
    doc.rect(0, 0, pageWidth, 38, "F");
    if (logo) {
      try {
        doc.addImage(logo, "PNG", margin, 8, 42, 17, undefined, "FAST");
      } catch {}
    } else {
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("MADX SPORTS", margin, 18);
    }
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(17);
    doc.text(title.toUpperCase(), pageWidth - margin, 15, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(206, 216, 226);
    doc.text(`REFERENCE  ${reference}`, pageWidth - margin, 22, {
      align: "right",
    });
    doc.text(
      new Intl.DateTimeFormat("en-GB", { dateStyle: "long" }).format(
        new Date(),
      ),
      pageWidth - margin,
      27,
      { align: "right" },
    );
    doc.setFillColor(247, 249, 251);
    doc.setDrawColor(223, 228, 233);
    doc.roundedRect(margin, 44, contentWidth, 23, 2.5, 2.5, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(105, 116, 128);
    doc.text("COMPANY", margin + 5, 50);
    doc.text("EMAIL", margin + 73, 50);
    doc.text("WHATSAPP NUMBER", margin + 127, 50);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(20, 37, 54);
    doc.text(String(customerDetails.companyName || "—"), margin + 5, 58, {
      maxWidth: 62,
    });
    doc.text(String(customerDetails.email || "—"), margin + 73, 58, {
      maxWidth: 48,
    });
    doc.text(String(customerDetails.contactNumber || "—"), margin + 127, 58, {
      maxWidth: 46,
    });
    y = 74;
  }

  function addFooter() {
    doc.setDrawColor(220, 225, 230);
    doc.line(margin, pageHeight - 13, pageWidth - margin, pageHeight - 13);
    doc.setTextColor(100, 111, 123);
    doc.setFontSize(8);
    doc.text(
      "MADX Sports · OEM & Private Label Manufacturing",
      margin,
      pageHeight - 8,
    );
    doc.text(`Page ${pageNumber}`, pageWidth - margin, pageHeight - 8, {
      align: "right",
    });
  }

  function nextPage() {
    addFooter();
    doc.addPage();
    pageNumber += 1;
    addHeader();
  }

  addHeader();
  const imageResults = await Promise.all(
    relevantItems?.map(async (item) => {
      try {
        return await imageUrlToDataUrl(item.product.image);
      } catch {
        return null;
      }
    }),
  );

  for (let index = 0; index < relevantItems.length; index += 1) {
    const item = relevantItems[index];
    const rowHeight = Math.max(48, 27 + item.selections.length * 7);
    if (y + rowHeight > pageHeight - 20) nextPage();

    doc.setFillColor(247, 249, 251);
    doc.setDrawColor(223, 228, 233);
    doc.roundedRect(margin, y, contentWidth, rowHeight, 2.5, 2.5, "FD");
    const imageX = margin + 4;
    const imageY = y + 4;
    const imageWidth = 30;
    const imageHeight = Math.min(38, rowHeight - 8);
    doc.setFillColor(232, 236, 240);
    doc.roundedRect(imageX, imageY, imageWidth, imageHeight, 2, 2, "F");
    if (imageResults[index]) {
      try {
        addImageContained(
          imageResults[index],
          imageX,
          imageY,
          imageWidth,
          imageHeight,
        );
      } catch {}
    }

    const textX = imageX + imageWidth + 5;
    const rightX = pageWidth - margin - 5;
    doc.setTextColor(14, 31, 49);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    const productName = doc.splitTextToSize(item.product.name, 82);
    doc.text(productName.slice(0, 2), textX, y + 9);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(105, 116, 128);
    doc.text(
      `${item.product.category || "Product"} · ${item.product.type || "Custom product"}`,
      textX,
      y + 19,
      { maxWidth: 85 },
    );
    if (listType === "combined") {
      doc.setTextColor(197, 32, 47);
      doc.setFont("helvetica", "bold");
      doc.text(item.listType.toUpperCase(), textX, y + 25);
    }
    const productUrl = `${window.location.origin}/products/${encodeURIComponent(item.product.slug)}`;
    const productLinkY = listType === "combined" ? y + 33 : y + 27;
    doc.setTextColor(197, 32, 47);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.textWithLink("View product online", textX, productLinkY, {
      url: productUrl,
    });

    doc.setTextColor(85, 97, 110);
    doc.setFont("helvetica", "bold");
    doc.text("SIZE", rightX - 45, y + 8);
    doc.text("UNITS", rightX, y + 8, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setTextColor(20, 37, 54);
    item.selections.forEach((selection, selectionIndex) => {
      const lineY = y + 15 + selectionIndex * 7;
      doc.text(String(selection.size), rightX - 45, lineY);
      doc.text(String(selection.units), rightX, lineY, { align: "right" });
    });
    const itemUnits = item.selections.reduce(
      (sum, selection) => sum + Number(selection.units),
      0,
    );
    doc.setFont("helvetica", "bold");
    doc.text(`Total: ${itemUnits}`, rightX, y + rowHeight - 5, {
      align: "right",
    });
    y += rowHeight + 5;
  }

  const totalUnits = relevantItems.reduce(
    (sum, item) =>
      sum +
      item.selections.reduce(
        (itemSum, selection) => itemSum + Number(selection.units),
        0,
      ),
    0,
  );
  if (y + 28 > pageHeight - 20) nextPage();
  doc.setFillColor(197, 32, 47);
  doc.roundedRect(margin, y + 2, contentWidth, 21, 2.5, 2.5, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(`PRODUCT ENTRIES  ${relevantItems.length}`, margin + 7, y + 15);
  doc.text(`TOTAL UNITS  ${totalUnits}`, pageWidth - margin - 7, y + 15, {
    align: "right",
  });
  addFooter();
  doc.save(`MADX-${title.replaceAll(" ", "-")}-${safeFileDate()}.pdf`);
}
