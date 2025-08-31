import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import RatingBar from "../components/RatingBar";
import InfoRow from "../components/InfoRow";
import LoadingIcon from "../components/LoadingIcon";

function Popup() {
  // This is what the content script returns:
  const [vehicleInfo, setVehicleInfo] = useState<{
    makeModel?: string;
    modelVariant?: string;
    yearReg?: string;
    price?: number;
    mileage?: string;
    engineSize?: string;
    fuelType?: string;
    transmission?: string;
    doors?: number;
  } | null>(null);

  // This is the desired layout of the ai res
  const [priceRating, setPriceRating] = useState<number>();
  const [comfortRating, setComfortRating] = useState<number>();
  const [performanceRating, setPerformanceRating] = useState<number>();
  const [reliabilityRating, setReliabilityRating] = useState<number>();

  const [priceComment, setPriceComment] = useState<string>();
  const [comfortComment, setComfortComment] = useState<string>();
  const [performanceComment, setPerformanceComment] = useState<string>();
  const [reliabilityComment, setReliabilityComment] = useState<string>();

  const [similarCars, setSimilarCars] = useState<string>();

  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [summaryLoaded, setSummaryLoaded] = useState(false);

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab || typeof tab.id !== "number") {
        setVehicleInfo({ makeModel: "Cannot access this tab." });
        return;
      }

      const tabUrl = tab.url || null;
      setCurrentUrl(tabUrl);

      const savedSummary = localStorage.getItem("aiVehicleSummary");
      if (savedSummary) {
        const parsed = JSON.parse(savedSummary);
        if (parsed.url === tabUrl) {
          setPriceRating(parsed.priceRating);
          setComfortRating(parsed.comfortRating);
          setPerformanceRating(parsed.performanceRating);
          setReliabilityRating(parsed.reliabilityRating);

          setPriceComment(parsed.priceComment);
          setComfortComment(parsed.comfortComment);
          setPerformanceComment(parsed.performanceComment);
          setReliabilityComment(parsed.reliabilityComment);

          setSimilarCars(parsed.similarCars);
          setSummaryLoaded(true);
        } else {
          localStorage.removeItem("aiVehicleSummary");

          setPriceRating(undefined);
          setComfortRating(undefined);
          setPerformanceRating(undefined);
          setReliabilityRating(undefined);

          setPriceComment(undefined);
          setComfortComment(undefined);
          setPerformanceComment(undefined);
          setReliabilityComment(undefined);

          setSimilarCars(undefined);
        }
      }

      chrome.tabs.sendMessage(
        tab.id,
        { action: "getVehicleInfo" },
        (response) => {
          if (chrome.runtime.lastError) {
            setVehicleInfo({
              makeModel: "Failed to communicate with content script.",
            });
          } else if (response) {
            setVehicleInfo(response);
          } else {
            setVehicleInfo({ makeModel: "No vehicle info found." });
          }
        }
      );
    });
  }, []);

  // This function connects to the backend and gets a AI summary in JSON format from it
  const fetchAISummary = async () => {
    if (!vehicleInfo) return;

    const response = await fetch("http://localhost:3000/get_ai_summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        make: vehicleInfo?.makeModel,
        model: vehicleInfo?.modelVariant,
        year: vehicleInfo?.yearReg,
        engineSize: vehicleInfo?.engineSize,
        fuelType: vehicleInfo?.fuelType,
        transmission: vehicleInfo?.transmission,
        mileage: vehicleInfo?.mileage,
        price: vehicleInfo?.price,
        doors: vehicleInfo?.doors,
      }),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    return response.json();
  };

  // use react query so we can manage loading and errors more easily and also caching
  const {
    data: AIResponse,
    error,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [`AI Response`],
    queryFn: fetchAISummary,
    enabled: false,
  });

  // Save AI response to localStorage when fetched, this persists the ai summary when the popup mounts and unmounts
  useEffect(() => {
    if (!AIResponse || !currentUrl) return;

    setPriceRating(AIResponse.priceRating);
    setComfortRating(AIResponse.comfortRating);
    setPerformanceRating(AIResponse.performanceRating);
    setReliabilityRating(AIResponse.reliabilityRating);

    setPriceComment(AIResponse.priceComment);
    setComfortComment(AIResponse.comfortComment);
    setPerformanceComment(AIResponse.performanceComment);
    setReliabilityComment(AIResponse.reliabilityComment);

    setSimilarCars(AIResponse.similarCars);

    localStorage.setItem(
      "aiVehicleSummary",
      JSON.stringify({ ...AIResponse, url: currentUrl })
    );

    setSummaryLoaded(true);
  }, [AIResponse, currentUrl]);

  return (
    <>
      {currentUrl?.includes("www.autotrader.co.uk") ? (
        <div
          style={{
            padding: "24px",
            fontFamily: "Segoe UI, Roboto, sans-serif",
            backgroundColor: "#ffffff",
            color: "#1a1a1a",
            borderRadius: "12px",
            width: "360px",
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
            fontSize: "16px",
            lineHeight: "1.6",
          }}
        >
          <h2 style={{ fontSize: "22px", marginBottom: "16px" }}>
            Vehicle Information
          </h2>

          {!vehicleInfo ? (
            <p style={{ fontStyle: "italic", color: "#888" }}>
              Loading vehicle info...
            </p>
          ) : (
            <div>
              <InfoRow label="Make & Model" value={vehicleInfo.makeModel} />
              <InfoRow label="Model Variant" value={vehicleInfo.modelVariant} />
              <InfoRow label="Price" value={vehicleInfo.price} />
              <InfoRow label="Year" value={vehicleInfo.yearReg} />
              <InfoRow label="Fuel Type" value={vehicleInfo.fuelType} />
              <InfoRow label="Mileage" value={vehicleInfo.mileage} />
              <InfoRow label="Transmission" value={vehicleInfo.transmission} />
              <InfoRow label="Engine Size" value={vehicleInfo.engineSize} />
              <InfoRow label="Doors" value={vehicleInfo.doors} />
            </div>
          )}

          {!summaryLoaded && (
            <button
              onClick={() => refetch()}
              disabled={!vehicleInfo || isLoading || AIResponse !== undefined}
              style={{
                marginTop: "20px",
                padding: "12px",
                backgroundColor: isLoading ? "#6c757d" : "#007bff",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: isLoading ? "not-allowed" : "pointer",
                width: "100%",
                fontWeight: "600",
                fontSize: "16px",
                transition: "background-color 0.3s",
              }}
            >
              {isLoading ? <LoadingIcon /> : "Generate AI Report"}
            </button>
          )}

          {error && (
            <p style={{ color: "red", marginTop: "12px" }}>
              {error instanceof Error ? error.message : "Something went wrong."}
            </p>
          )}

          {(AIResponse || priceRating) && (
            <>
              <h2 style={{ fontSize: "22px", margin: "28px 0 16px" }}>
                AI Vehicle Summary
              </h2>

              <RatingBar label="Price Rating" value={priceRating} />
              <RatingBar label="Comfort Rating" value={comfortRating} />
              <RatingBar label="Performance Rating" value={performanceRating} />
              <RatingBar label="Reliability Rating" value={reliabilityRating} />

              <InfoRow label="Price Comment" value={priceComment} />
              <InfoRow label="Comfort Comment" value={comfortComment} />
              <InfoRow label="Performance Comment" value={performanceComment} />
              <InfoRow label="Reliability Comment" value={reliabilityComment} />
              <InfoRow label="Similar Cars" value={similarCars} />
            </>
          )}
        </div>
      ) : (
        <div style={{border: '1px solid black', borderRadius: 4, padding: '10px', cursor: 'pointer'}} onClick={(e) => {
            e.preventDefault();
            chrome.tabs.create({url: "https://www.autotrader.co.uk/"});
            window.close();
          }}>
          Go to Autotrader.co.uk
        </div>
      )}
    </>
  );
}

export default Popup;
