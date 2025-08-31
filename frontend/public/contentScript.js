function getVehicleInfo() {

  // Get fields from HTML doc
  const makeModel =
    document.querySelector('[data-testid="advert-title"]')?.innerText || "";
  const modelVariant =
    document.querySelector('[data-testid="advert-subtitle"]')?.innerText || "";
  const price =
    document.querySelector('[data-testid="advert-price"]')?.innerText || "";

  // Engine size and doors are nested in multiple divs so we search through each inner div for "Engine"/"Doors"
  const engineSize = [...document.querySelectorAll("div.bFkjBL")]
    .find((div) => div.textContent.includes("Engine"))
    ?.querySelector('[data-testid="details"]')
    ?.textContent.trim();

  const doors = [...document.querySelectorAll("div.bFkjBL")]
    .find((div) => div.textContent.includes("Doors"))
    ?.querySelector('[data-testid="details"]')
    ?.textContent.trim();


  // Mileage, fuel type, year and transmission all have the same id so we loop through each list item and search.
  const items = document.querySelectorAll(
    "ul.at__sc-1ebejir-0.nvjVA.ppa-enabled li"
  );

  let mileage, yearReg, transmission, fuelType;

  items.forEach((li) => {
    const text = li.textContent.trim();
    if (text.toLowerCase().includes("mile")) {
      mileage = text;
    } else if (text.includes("reg")) {
      yearReg = text;
    } else if (
      text.toLowerCase().includes("manual") ||
      text.toLowerCase().includes("auto")
    ) {
      transmission = text;
    } else if (
      text.toLowerCase().includes("petrol") ||
      text.toLowerCase().includes("diesel") ||
      text.toLowerCase().includes("hybrid") ||
      text.toLowerCase().includes("natural gas") ||
      text.toLowerCase().includes("hydrogen") ||
      text.toLowerCase().includes("bi fuel") ||
      text.toLowerCase().includes("electric")
    ) {
      fuelType = text;
    }
  });

  return {
    makeModel,
    modelVariant,
    yearReg,
    price,
    mileage,
    engineSize,
    fuelType,
    transmission,
    doors,
  };
}

// Listen for incoming requests

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getVehicleInfo") {
    sendResponse(getVehicleInfo());
  }
});
