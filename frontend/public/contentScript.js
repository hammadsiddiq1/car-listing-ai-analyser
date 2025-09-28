function getVehicleInfo() {
  // Get car props using test-id
  const makeModel =
    document.querySelector('[data-testid="advert-title"]')?.innerText || "";
  const modelVariant =
    document.querySelector('[data-testid="advert-subtitle"]')?.innerText || "";
  const price =
    document.querySelector('[data-testid="advert-price"]')?.innerText || "";

  // Select the list with engine size and door data
  const dlLists = document.querySelectorAll(
    'section[data-gui="key-specs-section"] dl'
  );

  let engineSize = null;
  let doors = null;

  // Loop through the contents of this div
  dlLists.forEach((dl) => {
    const items = dl.querySelectorAll(":scope > div");

    items.forEach((item) => {
      const label = item.querySelector(".term_details")?.textContent?.trim();
      const value = item
        .querySelector('[data-testid="details"]')
        ?.textContent?.trim();

      if (!label || !value) return;

      // Engine size and doors properties are displayed in key value pairs on the Autotrader website
      // Find label and then get val
      if (label.toLowerCase() === "engine") {
        engineSize = value;
      } else if (label.toLowerCase() === "doors") {
        doors = value;
      }
    });
  });

  // Mileage, year, transmission, fuel all contained within a <ul>. Loop through each list item and extract fields
  const ulList = [...document.querySelectorAll("ul")].find(
    (ul) => ul.children.length === 4
  );

  let mileage = "";
  let yearReg = "";
  let transmission = "";
  let fuelType = "";

  if (ulList) {
    [...ulList.children].forEach((li) => {
      const text = li.textContent.trim();

      if (text.toLowerCase().includes("mile")) {
        mileage = text;
      } else if (/\d{4}\s*\(\d{2}\s*reg\)/.test(text)) {
        yearReg = text.match(/\d{4}/)[0]; // just the year
      } else if (
        text.toLowerCase().includes("manual") ||
        text.toLowerCase().includes("auto")
      ) {
        transmission = text;
      } else if (
        [
          "petrol",
          "diesel",
          "hybrid",
          "natural gas",
          "hydrogen",
          "bi fuel",
          "electric",
        ].some((f) => text.toLowerCase().includes(f))
      ) {
        fuelType = text;
      }
    });
  }

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


// TEST TO SEE IF UI COMMUNICATES TO THIS SCRIPT

// function getVehicleInfo() {
//   return {
//     makeModel: "h",
//     modelVariant: "a",
//     yearReg: 17,
//     price: 4000,
//     mileage: "1 mile",
//     engineSize: "2.0",
//     fuelType: "petrol",
//     transmission: "manual",
//     doors: 4,
//   };
// }

// Listen for incoming reqs
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === "getVehicleInfo") {
    sendResponse(getVehicleInfo());
  }
});
