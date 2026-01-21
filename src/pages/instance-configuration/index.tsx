import {
  useGetInstanceConfigOptionsQuery,
  useGetInstanceConfigQuery,
  useSetInstanceConfigMutation,
} from "@/api/configApi";
import { useGetUserCountQuery } from "@/api/userApi";
import { DefaultLayout } from "@/components/layouts/DefaultLayout";
import type { NextPage } from "next";
import { Input, Label, useToast } from "@/admin-web-components";
import {
  COURIER_DELIVERY_COMPENSATION_TYPE_TO_HUMAN,
  COURIER_DIETARY_RESTRICTIONS_TO_HUMAN,
  COURIER_MATCHER_TYPE_TO_HUMAN,
  CURRENCY_TO_HUMAN,
  DELIVERY_DURATION_CALCULATION_TYPE_TO_HUMAN,
  DISTANCE_UNIT_TO_HUMAN,
  GEO_CALCULATION_TYPE_TO_HUMAN,
  QUOTE_CALCULATION_TYPE_TO_HUMAN,
} from "@/shared-types";
import { normalizeRegionForRegistry } from "@/utils/geoJsonUtils";
import {
  openModal,
  closeModal,
} from "@/admin-web-components/components/molecules/modal";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { featureCollection } from "@turf/turf";
import ReactMarkdown from "react-markdown";

const AdminMap = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-4/5 bg-gray-100 animate-pulse rounded-lg items-center justify-center flex">
      Loading Map...
    </div>
  ),
});

const validateURL = (url: string): boolean => {
  if (!url) return true; // Allow empty fields
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const sanitizeURL = (url: string): string => {
  if (!url) return url;
  return url.replace(/\/$/, ""); // Remove trailing slash
};

const InstanceConfigurationPage: NextPage = () => {
  const instanceConfigOptionsResponse = useGetInstanceConfigOptionsQuery({});
  const instanceConfigResponse = useGetInstanceConfigQuery({});
  const { data: userCountData, isLoading: isUserCountLoading } =
    useGetUserCountQuery();
  const [setInstanceConfigMutation] = useSetInstanceConfigMutation();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [urlErrors, setUrlErrors] = useState<{
    link?: string;
    websocketLink?: string;
    imageUrl?: string;
  }>({});
  const [registryLink, setRegistryLink] = useState("");
  const [registryLinkError, setRegistryLinkError] = useState("");

  const regionDataRef = useRef<any>(null);

  // Local state for all config fields
  const [config, setConfig] = useState({
    name: "",
    link: "",
    websocketLink: "",
    imageUrl: "",
    region: null,
    courierMatcherType: "",
    quoteCalculationType: "",
    geoCalculationType: "",
    deliveryDurationCalculationType: "",
    courierCompensationCalculationType: "",
    defaultDietaryRestrictions: [] as string[],
    currency: "",
    distanceUnit: "",
    maxAssignmentDistance: 0,
    maxDriftDistance: 0,
    quoteExpirationMinutes: 0,
    defaultCourierPayRate: 0,
    defaultMinimumCourierPay: 0,
    defaultMaxWorkingHours: 0,
    feePercentageAmount: 0,
  });

  const [privacyPolicyContent, setPrivacyPolicyContent] = useState("");
  const [termsOfServiceContent, setTermsOfServiceContent] = useState("");
  const [rulesContent, setRulesContent] = useState("");
  const [descriptionContent, setDescriptionContent] = useState("");
  const [currentView, setCurrentView] = useState<
    | "main"
    | "privacy-policy"
    | "terms-of-service"
    | "rules"
    | "description"
    | "registration"
  >("main");

  // Sync server data to local state
  useEffect(() => {
    const data = instanceConfigResponse.data;
    console.log(data);
    if (data) {
      const details = (data.details as any) || {};
      setConfig({
        name: details.name ?? "",
        link: details.link ?? "",
        websocketLink: details.websocketLink ?? "",
        imageUrl: details.imageUrl ?? "",
        region: details.region ?? null,
        courierMatcherType: data.courierMatcherType ?? "",
        quoteCalculationType: data.quoteCalculationType ?? "",
        geoCalculationType: data.geoCalculationType ?? "",
        deliveryDurationCalculationType:
          data.deliveryDurationCalculationType ?? "",
        courierCompensationCalculationType:
          data.courierCompensationCalculationType ?? "",
        defaultDietaryRestrictions: Array.isArray(
          data.defaultDietaryRestrictions,
        )
          ? data.defaultDietaryRestrictions
          : [],
        currency: data.currency ?? "",
        distanceUnit: data.distanceUnit ?? "",
        maxAssignmentDistance: data.maxAssignmentDistance ?? 0,
        maxDriftDistance: data.maxDriftDistance ?? 0,
        quoteExpirationMinutes: data.quoteExpirationMinutes ?? 0,
        defaultCourierPayRate: data.defaultCourierPayRate ?? 0,
        defaultMinimumCourierPay: data.defaultMinimumCourierPay ?? 0,
        defaultMaxWorkingHours: data.defaultMaxWorkingHours ?? 0,
        feePercentageAmount: data.feePercentageAmount ?? 0,
      });
      setPrivacyPolicyContent(details.privacyPolicyContent ?? "");
      setTermsOfServiceContent(details.termsOfServiceContent ?? "");
      setRulesContent(details.rulesContent ?? "");
      setDescriptionContent(details.descriptionContent ?? "");
    }
  }, [instanceConfigResponse.data]);

  const onInstanceConfigChangeDietaryRestrictions = (select: any) => {
    const result = [];
    const options = select && select.options;
    let opt;

    for (let i = 0, iLen = options.length; i < iLen; i++) {
      opt = options[i];
      if (opt.selected) {
        result.push(opt.value || opt.text);
      }
    }

    setConfig({ ...config, defaultDietaryRestrictions: result });
  };

  const handleSavePrivacyPolicy = async () => {
    setIsSaving(true);
    try {
      const existingDetails =
        (instanceConfigResponse.data?.details as any) || {};

      await setInstanceConfigMutation({
        details: {
          ...existingDetails,
          privacyPolicyContent: privacyPolicyContent.trim(),
        },
      } as any);
      // PRINT OUT DATA!
      console.log(config);
      toast({
        title: "Success!",
        description: "Privacy policy saved successfully.",
      });
      setCurrentView("main");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save privacy policy. Please try again.",
        variant: "destructive",
      });
      console.error("Failed to save privacy policy:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveTermsOfService = async () => {
    setIsSaving(true);
    try {
      const existingDetails =
        (instanceConfigResponse.data?.details as any) || {};

      await setInstanceConfigMutation({
        details: {
          ...existingDetails,
          termsOfServiceContent: termsOfServiceContent.trim(),
        },
      } as any);
      toast({
        title: "Success!",
        description: "Terms of service saved successfully.",
      });
      // PRINT OUT DATA!
      console.log(config);
      setCurrentView("main");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save terms of service. Please try again.",
        variant: "destructive",
      });
      console.error("Failed to save terms of service:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveRules = async () => {
    setIsSaving(true);
    try {
      const existingDetails =
        (instanceConfigResponse.data?.details as any) || {};

      await setInstanceConfigMutation({
        details: {
          ...existingDetails,
          rulesContent: rulesContent.trim(),
        },
      } as any);
      toast({
        title: "Success!",
        description: "Rules saved successfully.",
      });
      // PRINT OUT DATA!
      console.log(config);
      setCurrentView("main");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save rules. Please try again.",
        variant: "destructive",
      });
      console.error("Failed to save rules:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDescription = async () => {
    setIsSaving(true);
    try {
      const existingDetails =
        (instanceConfigResponse.data?.details as any) || {};

      await setInstanceConfigMutation({
        details: {
          ...existingDetails,
          descriptionContent: descriptionContent.trim(),
        },
      } as any);
      toast({
        title: "Success!",
        description: "Description saved successfully.",
      });
      // PRINT OUT DATA!
      console.log(config);
      setCurrentView("main");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save description. Please try again.",
        variant: "destructive",
      });
      console.error("Failed to save description:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const isAllFieldsFilled = useMemo(() => {
    return (
      config.name.trim() !== "" &&
      config.link.trim() !== "" &&
      config.websocketLink.trim() !== "" &&
      config.imageUrl.trim() !== "" &&
      config.region !== null &&
      config.defaultDietaryRestrictions.length > 0
    );
  }, [config]);

  const handleSaveAllChanges = async () => {
    setIsSaving(true);
    try {
      const { name, link, websocketLink, imageUrl, region, ...restConfig } =
        config;
      const existingDetails =
        (instanceConfigResponse.data?.details as any) || {};

      // Sanitize and trim URL fields
      const sanitizedName = name.trim();
      const sanitizedLink = sanitizeURL(link.trim());
      const sanitizedWebsocketLink = sanitizeURL(websocketLink.trim());
      const sanitizedImageUrl = sanitizeURL(imageUrl.trim());

      // Update config state with sanitized values
      setConfig({
        ...config,
        name: sanitizedName,
        link: sanitizedLink,
        websocketLink: sanitizedWebsocketLink,
        imageUrl: sanitizedImageUrl,
      });

      // Process region data - keep as FeatureCollection for individual polygon editing
      let processedRegion = null;
      const rawData = regionDataRef.current;

      // If regionDataRef is null, use the existing region from config (no changes made)
      if (!rawData && region) {
        processedRegion = region;
      } else if (rawData) {
        // Normalize Data: Ensure we have a FeatureCollection
        if (Array.isArray(rawData)) {
          // If it's just an array of features, wrap them in a FeatureCollection
          processedRegion = featureCollection(rawData);
        } else if (rawData.type === "FeatureCollection") {
          // It's already formatted correctly
          processedRegion = rawData;
        } else if (rawData.type === "Feature") {
          // Single feature, wrap it in a FeatureCollection
          processedRegion = featureCollection([rawData]);
        }
      }

      await setInstanceConfigMutation({
        ...restConfig,
        details: {
          ...existingDetails,
          name: sanitizedName,
          link: sanitizedLink,
          websocketLink: sanitizedWebsocketLink,
          imageUrl: sanitizedImageUrl,
          privacyPolicyUrl: computedURLs.privacyPolicyUrl,
          termsOfServiceUrl: computedURLs.termsOfServiceUrl,
          rulesUrl: computedURLs.rulesUrl,
          descriptionUrl: computedURLs.descriptionUrl,
          region: processedRegion,
        },
      } as any);
      toast({
        title: "Success!",
        description: "Instance configuration saved successfully.",
      });
      // PRINT OUT DATA!
      console.log(config, computedURLs);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save instance configuration. Please try again.",
        variant: "destructive",
      });
      console.error("Failed to save configuration:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRegistryLinkChange = (value: string) => {
    setRegistryLink(value);
    if (value && !validateURL(value)) {
      setRegistryLinkError("Invalid URL format");
    } else {
      setRegistryLinkError("");
    }
  };

  const handleRegisterSubmit = async () => {
    const sanitizedRegistryUrl = sanitizeURL(registryLink.trim());

    if (!sanitizedRegistryUrl) {
      setRegistryLinkError("Registry link is required");
      return;
    }

    if (!validateURL(sanitizedRegistryUrl)) {
      setRegistryLinkError("Invalid URL format");
      return;
    }

    // Refetch latest config data to ensure we have the most recent updatedAt timestamp
    await instanceConfigResponse.refetch();

    // Normalize region: Convert FeatureCollection to Polygon/MultiPolygon for PostGIS
    const normalizedRegion = normalizeRegionForRegistry(config.region);

    const registrationData = {
      details: {
        name: config.name,
        link: config.link,
        websocketLink: config.websocketLink,
        region: normalizedRegion,
        imageUrl: config.imageUrl,
        rulesUrl: computedURLs.rulesUrl,
        descriptionUrl: computedURLs.descriptionUrl,
        privacyPolicyUrl: computedURLs.privacyPolicyUrl,
        termsOfServiceUrl: computedURLs.termsOfServiceUrl,
        userCount: typeof userCountData === "number" ? userCountData : null,
      },
      config: {
        courierMatcherType: config.courierMatcherType,
        quoteCalculationType: config.quoteCalculationType,
        geoCalculationType: config.geoCalculationType,
        deliveryDurationCalculationType: config.deliveryDurationCalculationType,
        courierCompensationCalculationType:
          config.courierCompensationCalculationType,
        maxAssignmentDistance: config.maxAssignmentDistance,
        maxDriftDistance: config.maxDriftDistance,
        quoteExpirationMinutes: config.quoteExpirationMinutes,
        feePercentageAmount: config.feePercentageAmount,
        defaultCourierPayRate: config.defaultCourierPayRate,
        defaultMinimumCourierPay: config.defaultMinimumCourierPay,
        defaultMaxWorkingHours: config.defaultMaxWorkingHours,
        defaultDietaryRestrictions: config.defaultDietaryRestrictions,
        distanceUnit: config.distanceUnit,
        currency: config.currency,
      },
      updatedAt: instanceConfigResponse.data?.updatedAt ?? null,
    };

    console.log("Registration payload:", registrationData);

    setIsRegistering(true);

    try {
      const response = await fetch(`${sanitizedRegistryUrl}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registrationData),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        const message =
          errorBody?.error ||
          errorBody?.message ||
          `Registry responded with ${response.status}`;
        throw new Error(message);
      }

      const result = await response.json();

      toast({
        title: "Success!",
        description:
          result?.message || "Instance registered successfully with registry.",
      });

      console.log("Registry registration payload", registrationData, result);
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error?.message || "Could not register instance.",
        variant: "destructive",
      });
      console.error("Failed to register instance:", error);
    } finally {
      setIsRegistering(false);
    }
  };

  // Compute URL fields based on instance link
  const computedURLs = useMemo(() => {
    const baseLink = sanitizeURL(config.link);
    return {
      privacyPolicyUrl: baseLink ? `${baseLink}/privacy-policy` : "",
      termsOfServiceUrl: baseLink ? `${baseLink}/terms-of-service` : "",
      rulesUrl: baseLink ? `${baseLink}/rules` : "",
      descriptionUrl: baseLink ? `${baseLink}/description` : "",
    };
  }, [config.link]);

  // Memoize the onUpdate callback to prevent map re-renders
  const handleMapUpdate = useCallback((val: any) => {
    regionDataRef.current = val;
    // Update config state to reflect region changes (including clearing)
    setConfig((prevConfig) => ({
      ...prevConfig,
      region: val,
    }));
  }, []);

  const handleURLFieldChange = (
    field: "link" | "websocketLink" | "imageUrl",
    value: string,
  ) => {
    setConfig({ ...config, [field]: value });
    if (value && !validateURL(value)) {
      setUrlErrors({ ...urlErrors, [field]: "Invalid URL format" });
    } else {
      const newErrors = { ...urlErrors };
      delete newErrors[field];
      setUrlErrors(newErrors);
    }
  };

  return (
    <DefaultLayout>
      {/* Header and Edit Links - Always Visible */}
      <div className="flex items-center gap-4">
        <h2 className="text-3xl font-medium tracking-tight pb-2">
          Instance Configuration
        </h2>
        {currentView !== "main" && (
          <button
            className="bg-gray-200 rounded-md text-gray-900 px-4 py-2 text-sm font-medium hover:bg-gray-300"
            onClick={() => setCurrentView("main")}
          >
            ← Back
          </button>
        )}
        {currentView === "main" && (
          <button
            className="bg-black rounded-md text-white px-4 py-2 text-sm font-medium hover:bg-slate-700"
            onClick={() => setCurrentView("registration")}
          >
            Register Instance
          </button>
        )}
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setCurrentView("rules")}
          className="text-gray-500 cursor-pointer hover:text-gray-800"
        >
          <Label className="cursor-pointer">Edit Rules</Label>
        </button>
        <div className="h-4 w-px bg-gray-300" />
        <button
          onClick={() => setCurrentView("description")}
          className="text-gray-500 cursor-pointer hover:text-gray-800"
        >
          <Label className="cursor-pointer">Edit Description</Label>
        </button>
        <div className="h-4 w-px bg-gray-300" />
        <button
          onClick={() => setCurrentView("terms-of-service")}
          className="text-gray-500 cursor-pointer hover:text-gray-800"
        >
          <Label className="cursor-pointer">Edit Terms of Service</Label>
        </button>
        <div className="h-4 w-px bg-gray-300" />
        <button
          onClick={() => setCurrentView("privacy-policy")}
          className="text-gray-500 cursor-pointer hover:text-gray-800"
        >
          <Label className="cursor-pointer">Edit Privacy Policy</Label>
        </button>
      </div>

      {/* Content - Changes Based on View */}
      {currentView === "main" ? (
        <>
          <div></div>
          <div className="pt-4 flex flex-col gap-2">
            <div>
              <Label className="text-right">Name</Label>
              <Input
                key="instanceName"
                type="text"
                value={config.name}
                onChange={(event) =>
                  setConfig({
                    ...config,
                    name: event.target.value,
                  })
                }
                className="max-w-[500px]"
              />
            </div>
            <div>
              <Label className="text-right">URL</Label>
              <p className="text-sm text-gray-600 mb-1">
                (Warning: Once the URL is saved, it cannot be changed. Please
                ensure it is correct before saving.)
              </p>
              <Input
                key="link"
                type="text"
                value={config.link}
                onChange={(event) =>
                  handleURLFieldChange("link", event.target.value)
                }
                disabled={!!(instanceConfigResponse.data?.details as any)?.link}
                className={`max-w-[500px] ${
                  urlErrors.link ? "border-red-500 border-2" : ""
                } ${
                  !!(instanceConfigResponse.data?.details as any)?.link
                    ? "bg-gray-100 cursor-not-allowed"
                    : ""
                }`}
              />
              {urlErrors.link && (
                <p className="text-red-500 text-sm mt-1">{urlErrors.link}</p>
              )}
            </div>
            <div>
              <Label className="text-right">Websocket URL</Label>
              <Input
                key="websocketLink"
                type="text"
                value={config.websocketLink}
                onChange={(event) =>
                  handleURLFieldChange("websocketLink", event.target.value)
                }
                className={`max-w-[500px] ${
                  urlErrors.websocketLink ? "border-red-500 border-2" : ""
                }`}
              />
              {urlErrors.websocketLink && (
                <p className="text-red-500 text-sm mt-1">
                  {urlErrors.websocketLink}
                </p>
              )}
            </div>
            <div>
              <Label className="text-right">Logo Image URL</Label>
              <Input
                key="imageUrl"
                type="text"
                value={config.imageUrl}
                onChange={(event) =>
                  handleURLFieldChange("imageUrl", event.target.value)
                }
                className={`max-w-[500px] ${
                  urlErrors.imageUrl ? "border-red-500 border-2" : ""
                }`}
              />
              {urlErrors.imageUrl && (
                <p className="text-red-500 text-sm mt-1">
                  {urlErrors.imageUrl}
                </p>
              )}
            </div>
            <div>
              <Label className="text-right">Operating Region</Label>
              <div className="pt-2 max-w-4xl">
                <AdminMap
                  initialGeoJSON={config.region}
                  onUpdate={handleMapUpdate}
                />
              </div>
            </div>
            <div>
              <Label className="text-right">Courier Matcher Type</Label>
              <br />
              <select
                className="border-[1px] border-input rounded-md h-10 px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={config.courierMatcherType}
                onChange={(e) =>
                  setConfig({ ...config, courierMatcherType: e.target.value })
                }
              >
                {instanceConfigOptionsResponse.data?.courierMatcherType.map(
                  (option) => (
                    <option key={option} value={option}>
                      {COURIER_MATCHER_TYPE_TO_HUMAN[option]}
                    </option>
                  ),
                )}
              </select>
            </div>
            <div>
              <Label className="text-right">Quote Calculation Type</Label>
              <br />
              <select
                className="border-[1px] border-input rounded-md h-10 px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={config.quoteCalculationType}
                onChange={(e) =>
                  setConfig({ ...config, quoteCalculationType: e.target.value })
                }
              >
                {instanceConfigOptionsResponse.data?.quoteCalculationType.map(
                  (option) => (
                    <option key={option} value={option}>
                      {QUOTE_CALCULATION_TYPE_TO_HUMAN[option]}
                    </option>
                  ),
                )}
              </select>
            </div>
            <div>
              <Label className="text-right">Geo Calculation Type</Label>
              <br />
              <select
                className="border-[1px] border-input rounded-md h-10 px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={config.geoCalculationType}
                onChange={(e) =>
                  setConfig({ ...config, geoCalculationType: e.target.value })
                }
              >
                {instanceConfigOptionsResponse.data?.geoCalculationType.map(
                  (option) => (
                    <option key={option} value={option}>
                      {GEO_CALCULATION_TYPE_TO_HUMAN[option]}
                    </option>
                  ),
                )}
              </select>
            </div>
            <div>
              <Label className="text-right">
                Delivery Duration Calculation Type
              </Label>
              <br />
              <select
                className="border-[1px] border-input rounded-md h-10 px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={config.deliveryDurationCalculationType}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    deliveryDurationCalculationType: e.target.value,
                  })
                }
              >
                {instanceConfigOptionsResponse.data?.deliveryDurationCalculationType.map(
                  (option) => (
                    <option key={option} value={option}>
                      {DELIVERY_DURATION_CALCULATION_TYPE_TO_HUMAN[option]}
                    </option>
                  ),
                )}
              </select>
            </div>
            <div>
              <Label className="text-right">
                Courier Compensation Calculation Type
              </Label>
              <br />
              <select
                className="border-[1px] border-input rounded-md h-10 px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={config.courierCompensationCalculationType}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    courierCompensationCalculationType: e.target.value,
                  })
                }
              >
                {instanceConfigOptionsResponse.data?.courierCompensationCalculationType.map(
                  (option) => (
                    <option key={option} value={option}>
                      {COURIER_DELIVERY_COMPENSATION_TYPE_TO_HUMAN[option]}
                    </option>
                  ),
                )}
              </select>
            </div>
            <div>
              <Label className="text-right">Default Dietary Restrictions</Label>
              <p className="text-sm text-gray-600 mb-1">(Select multiple)</p>
              <select
                className="border-[1px] border-input rounded-md px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={config.defaultDietaryRestrictions}
                onChange={(e) =>
                  onInstanceConfigChangeDietaryRestrictions(e.target)
                }
                multiple
              >
                {instanceConfigOptionsResponse.data?.defaultDietaryRestrictions.map(
                  (option) => (
                    <option key={option} value={option}>
                      {COURIER_DIETARY_RESTRICTIONS_TO_HUMAN[option]}
                    </option>
                  ),
                )}
              </select>
            </div>
            <div>
              <Label className="text-right">Currency</Label>
              <br />
              <select
                className="border-[1px] border-input rounded-md h-10 px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={config.currency}
                onChange={(e) =>
                  setConfig({ ...config, currency: e.target.value })
                }
              >
                {instanceConfigOptionsResponse.data?.currency.map((option) => (
                  <option key={option} value={option}>
                    {CURRENCY_TO_HUMAN[option]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-right">Distance Unit</Label>
              <br />
              <select
                className="border-[1px] border-input rounded-md h-10 px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={config.distanceUnit}
                onChange={(e) =>
                  setConfig({ ...config, distanceUnit: e.target.value })
                }
              >
                {instanceConfigOptionsResponse.data?.distanceUnit.map(
                  (option) => (
                    <option key={option} value={option}>
                      {DISTANCE_UNIT_TO_HUMAN[option]}
                    </option>
                  ),
                )}
              </select>
            </div>
            <div>
              <Label className="text-right">Max Assignment Distance</Label>
              <Input
                key="maxAssignmentDistance"
                type="number"
                value={config.maxAssignmentDistance}
                onChange={(event) =>
                  setConfig({
                    ...config,
                    maxAssignmentDistance: Number(event.target.value),
                  })
                }
                className="max-w-[120px]"
              />
            </div>
            <div>
              <Label className="text-right">Max Drift Distance</Label>
              <p className="text-sm text-gray-600 mb-1">
                (Maximum amount of distance that the quote and delivery pickup
                can differ in meters)
              </p>
              <Input
                key="maxDriftDistance"
                type="number"
                value={config.maxDriftDistance}
                onChange={(event) =>
                  setConfig({
                    ...config,
                    maxDriftDistance: Number(event.target.value),
                  })
                }
                className="max-w-[120px]"
              />
            </div>
            <div>
              <Label className="text-right">Quote Expiration Minutes</Label>
              <Input
                key="quoteExpirationMinutes"
                type="number"
                value={config.quoteExpirationMinutes}
                onChange={(event) =>
                  setConfig({
                    ...config,
                    quoteExpirationMinutes: Number(event.target.value),
                  })
                }
                className="max-w-[120px]"
              />
            </div>
            <div>
              <Label className="text-right">Default Courier Pay Rate</Label>
              <Input
                key="defaultCourierPayRate"
                type="number"
                value={config.defaultCourierPayRate}
                onChange={(event) =>
                  setConfig({
                    ...config,
                    defaultCourierPayRate: Number(event.target.value),
                  })
                }
                className="max-w-[120px]"
              />
            </div>
            <div>
              <Label className="text-right">Default Minimum Courier Pay</Label>
              <Input
                key="defaultMinimumCourierPay"
                type="number"
                value={config.defaultMinimumCourierPay}
                onChange={(event) =>
                  setConfig({
                    ...config,
                    defaultMinimumCourierPay: Number(event.target.value),
                  })
                }
                className="max-w-[120px]"
              />
            </div>
            <div>
              <Label className="text-right">Default Max Working Hours</Label>
              <Input
                key="defaultMaxWorkingHours"
                type="number"
                value={config.defaultMaxWorkingHours}
                onChange={(event) =>
                  setConfig({
                    ...config,
                    defaultMaxWorkingHours: Number(event.target.value),
                  })
                }
                className="max-w-[120px]"
              />
            </div>
            <div>
              <Label className="text-right">Fee Percentage Amount</Label>
              <Input
                key="feePercentageAmount"
                type="number"
                value={config.feePercentageAmount}
                onChange={(event) =>
                  setConfig({
                    ...config,
                    feePercentageAmount: Number(event.target.value),
                  })
                }
                className="max-w-[120px]"
              />
            </div>
          </div>
          <button
            onClick={handleSaveAllChanges}
            disabled={
              isSaving ||
              Object.keys(urlErrors).length > 0 ||
              !isAllFieldsFilled
            }
            className="mt-4 bg-black rounded-md text-white px-4 py-2 text-sm font-medium hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? "Saving..." : "Save All Changes"}
          </button>
        </>
      ) : currentView === "terms-of-service" ? (
        <div className="mt-4">
          <h3 className="text-lg font-semibold pb-2">
            Editing Terms of Service
          </h3>
          <div className="grid grid-cols-2 gap-6">
            {/* Editor */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
              <div className="mb-1">
                <Label className="block text-sm font-medium text-gray-900 mb-2">
                  Content (Markdown)
                </Label>
                <textarea
                  value={termsOfServiceContent}
                  onChange={(e) => setTermsOfServiceContent(e.target.value)}
                  className="w-full h-96 rounded-md border border-gray-300 px-4 py-3 text-sm font-mono shadow-sm focus:border-black focus:ring-black resize-none"
                  placeholder="# Terms of Service&#10;&#10;## Agreement&#10;Write your content in markdown..."
                />
                <p className="text-xs text-gray-500 mt-2">
                  Use markdown formatting: # Headers, **bold**, *italic*, -
                  Lists, [links](url)
                </p>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">
                Preview
              </h2>
              <div className="bg-white rounded-md border border-gray-200 p-4 prose prose-sm max-w-none overflow-y-auto h-96">
                {termsOfServiceContent ? (
                  <ReactMarkdown>{termsOfServiceContent}</ReactMarkdown>
                ) : (
                  <p className="text-gray-500">No content yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleSaveTermsOfService}
              disabled={isSaving}
              className="bg-black rounded-md text-white px-4 py-2 text-sm font-medium hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => setCurrentView("main")}
              className="bg-gray-200 rounded-md text-gray-900 px-4 py-2 text-sm font-medium hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : currentView === "rules" ? (
        <div className="mt-4">
          <h3 className="text-lg font-semibold pb-2">Editing Rules</h3>
          <div className="grid grid-cols-2 gap-6">
            {/* Editor */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
              <div className="mb-1">
                <Label className="block text-sm font-medium text-gray-900 mb-2">
                  Content (Markdown)
                </Label>
                <textarea
                  value={rulesContent}
                  onChange={(e) => setRulesContent(e.target.value)}
                  className="w-full h-96 rounded-md border border-gray-300 px-4 py-3 text-sm font-mono shadow-sm focus:border-black focus:ring-black resize-none"
                  placeholder="# Rules&#10;&#10;## Guidelines&#10;Write your content in markdown..."
                />
                <p className="text-xs text-gray-500 mt-2">
                  Use markdown formatting: # Headers, **bold**, *italic*, -
                  Lists, [links](url)
                </p>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">
                Preview
              </h2>
              <div className="bg-white rounded-md border border-gray-200 p-4 prose prose-sm max-w-none overflow-y-auto h-96">
                {rulesContent ? (
                  <ReactMarkdown>{rulesContent}</ReactMarkdown>
                ) : (
                  <p className="text-gray-500">No content yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleSaveRules}
              disabled={isSaving}
              className="bg-black rounded-md text-white px-4 py-2 text-sm font-medium hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => setCurrentView("main")}
              className="bg-gray-200 rounded-md text-gray-900 px-4 py-2 text-sm font-medium hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : currentView === "description" ? (
        <div className="mt-4">
          <h3 className="text-lg font-semibold pb-2">Editing Description</h3>
          <div className="grid grid-cols-2 gap-6">
            {/* Editor */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
              <div className="mb-1">
                <Label className="block text-sm font-medium text-gray-900 mb-2">
                  Content (Markdown)
                </Label>
                <textarea
                  value={descriptionContent}
                  onChange={(e) => setDescriptionContent(e.target.value)}
                  className="w-full h-96 rounded-md border border-gray-300 px-4 py-3 text-sm font-mono shadow-sm focus:border-black focus:ring-black resize-none"
                  placeholder="# Description&#10;&#10;## About Us&#10;Write your content in markdown..."
                />
                <p className="text-xs text-gray-500 mt-2">
                  Use markdown formatting: # Headers, **bold**, *italic*, -
                  Lists, [links](url)
                </p>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">
                Preview
              </h2>
              <div className="bg-white rounded-md border border-gray-200 p-4 prose prose-sm max-w-none overflow-y-auto h-96">
                {descriptionContent ? (
                  <ReactMarkdown>{descriptionContent}</ReactMarkdown>
                ) : (
                  <p className="text-gray-500">No content yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleSaveDescription}
              disabled={isSaving}
              className="bg-black rounded-md text-white px-4 py-2 text-sm font-medium hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => setCurrentView("main")}
              className="bg-gray-200 rounded-md text-gray-900 px-4 py-2 text-sm font-medium hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : currentView === "privacy-policy" ? (
        <div className="mt-4">
          <h3 className="text-lg font-semibold pb-2">Editing Privacy Policy</h3>
          <div className="grid grid-cols-2 gap-6">
            {/* Editor */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
              <div className="mb-1">
                <Label className="block text-sm font-medium text-gray-900 mb-2">
                  Content (Markdown)
                </Label>
                <textarea
                  value={privacyPolicyContent}
                  onChange={(e) => setPrivacyPolicyContent(e.target.value)}
                  className="w-full h-96 rounded-md border border-gray-300 px-4 py-3 text-sm font-mono shadow-sm focus:border-black focus:ring-black resize-none"
                  placeholder="# Privacy Policy&#10;&#10;## Introduction&#10;Write your content in markdown..."
                />
                <p className="text-xs text-gray-500 mt-2">
                  Use markdown formatting: # Headers, **bold**, *italic*, -
                  Lists, [links](url)
                </p>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">
                Preview
              </h2>
              <div className="bg-white rounded-md border border-gray-200 p-4 prose prose-sm max-w-none overflow-y-auto h-96">
                {privacyPolicyContent ? (
                  <ReactMarkdown>{privacyPolicyContent}</ReactMarkdown>
                ) : (
                  <p className="text-gray-500">No content yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleSavePrivacyPolicy}
              disabled={isSaving}
              className="bg-black rounded-md text-white px-4 py-2 text-sm font-medium hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => setCurrentView("main")}
              className="bg-gray-200 rounded-md text-gray-900 px-4 py-2 text-sm font-medium hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : currentView === "registration" ? (
        <div className="mt-4">
          <h3 className="text-lg font-semibold pb-2">Instance Registration</h3>
          <p className="text-gray-600 mb-4 text-sm">
            Register your instance to an instance registry, so that couriers can
            more easily discover it!
          </p>

          <div className="flex flex-col gap-4">
            {/* Registry Link Input */}
            <div className="flex flex-col">
              <Label className="mb-2">Registry Link</Label>
              <Input
                type="text"
                value={registryLink}
                onChange={(e) => handleRegistryLinkChange(e.target.value)}
                className={`max-w-[500px] ${
                  registryLinkError ? "border-red-500 border-2" : ""
                }`}
                placeholder="https://registry.example.com"
              />
              {registryLinkError && (
                <p className="text-red-500 text-sm mt-1">{registryLinkError}</p>
              )}
            </div>

            {/* Display Saved Configuration */}
            <div className="">
              <h3 className="text-lg font-semibold mb-2">
                Current Instance Configuration
              </h3>
              <h3 className="text-gray-600 text-md font-semibold mb-2">
                Details
              </h3>
              <div className="w-2/3 grid grid-cols-2 gap-x-8 gap-y-4">
                <div>
                  <Label className="text-gray-600">Name</Label>
                  <p className="text-sm">{config.name}</p>
                </div>
                <div>
                  <Label className="text-gray-600">User Count</Label>
                  <p className="text-sm">
                    {isUserCountLoading
                      ? "Loading..."
                      : typeof userCountData === "number"
                      ? userCountData
                      : "Not available"}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-600">URL</Label>
                  <p className="text-sm break-all">{config.link}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Websocket URL</Label>
                  <p className="text-sm break-all">{config.websocketLink}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Logo Image URL</Label>
                  <p className="text-sm break-all">{config.imageUrl}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Privacy Policy URL</Label>
                  <p className="text-sm break-all">
                    {computedURLs.privacyPolicyUrl}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-600">Terms of Service URL</Label>
                  <p className="text-sm break-all">
                    {computedURLs.termsOfServiceUrl}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-600">Rules URL</Label>
                  <p className="text-sm break-all">{computedURLs.rulesUrl}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Description URL</Label>
                  <p className="text-sm break-all">
                    {computedURLs.descriptionUrl}
                  </p>
                </div>
                <div className="col-span-2">
                  <Label className="text-gray-600 mb-2 block">
                    Operating Region
                  </Label>
                  {config.region ? (
                    <div className="h-40 w-full">
                      <AdminMap
                        initialGeoJSON={config.region}
                        onUpdate={() => {}}
                        readOnly={true}
                        height="h-40"
                        width="w-full"
                        fitPadding={[12, 12]}
                      />
                    </div>
                  ) : (
                    <p className="text-sm">Not set</p>
                  )}
                </div>
              </div>
              <h3 className="text-gray-600 text-md font-semibold mb-2 mt-6">
                Config
              </h3>
              <div className="w-2/3 grid grid-cols-2 gap-x-8 gap-y-4">
                <div>
                  <Label className="text-gray-600">Courier Matcher Type</Label>
                  <p className="text-sm">
                    {
                      COURIER_MATCHER_TYPE_TO_HUMAN[
                        config.courierMatcherType as keyof typeof COURIER_MATCHER_TYPE_TO_HUMAN
                      ]
                    }
                  </p>
                </div>
                <div>
                  <Label className="text-gray-600">
                    Quote Calculation Type
                  </Label>
                  <p className="text-sm">
                    {
                      QUOTE_CALCULATION_TYPE_TO_HUMAN[
                        config.quoteCalculationType as keyof typeof QUOTE_CALCULATION_TYPE_TO_HUMAN
                      ]
                    }
                  </p>
                </div>
                <div>
                  <Label className="text-gray-600">Geo Calculation Type</Label>
                  <p className="text-sm">
                    {
                      GEO_CALCULATION_TYPE_TO_HUMAN[
                        config.geoCalculationType as keyof typeof GEO_CALCULATION_TYPE_TO_HUMAN
                      ]
                    }
                  </p>
                </div>
                <div>
                  <Label className="text-gray-600">
                    Delivery Duration Calculation Type
                  </Label>
                  <p className="text-sm">
                    {
                      DELIVERY_DURATION_CALCULATION_TYPE_TO_HUMAN[
                        config.deliveryDurationCalculationType as keyof typeof DELIVERY_DURATION_CALCULATION_TYPE_TO_HUMAN
                      ]
                    }
                  </p>
                </div>
                <div>
                  <Label className="text-gray-600">
                    Courier Compensation Calculation Type
                  </Label>
                  <p className="text-sm">
                    {
                      COURIER_DELIVERY_COMPENSATION_TYPE_TO_HUMAN[
                        config.courierCompensationCalculationType as keyof typeof COURIER_DELIVERY_COMPENSATION_TYPE_TO_HUMAN
                      ]
                    }
                  </p>
                </div>
                <div>
                  <Label className="text-gray-600">
                    Max Assignment Distance
                  </Label>
                  <p className="text-sm">{config.maxAssignmentDistance}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Max Drift Distance</Label>
                  <p className="text-sm">{config.maxDriftDistance}</p>
                </div>
                <div>
                  <Label className="text-gray-600">
                    Quote Expiration Minutes
                  </Label>
                  <p className="text-sm">{config.quoteExpirationMinutes}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Fee Percentage Amount</Label>
                  <p className="text-sm">{config.feePercentageAmount}</p>
                </div>
                <div>
                  <Label className="text-gray-600">
                    Default Courier Pay Rate
                  </Label>
                  <p className="text-sm">{config.defaultCourierPayRate}</p>
                </div>
                <div>
                  <Label className="text-gray-600">
                    Default Minimum Courier Pay
                  </Label>
                  <p className="text-sm">{config.defaultMinimumCourierPay}</p>
                </div>
                <div>
                  <Label className="text-gray-600">
                    Default Max Working Hours
                  </Label>
                  <p className="text-sm">{config.defaultMaxWorkingHours}</p>
                </div>
                <div>
                  <Label className="text-gray-600">
                    Default Dietary Restrictions
                  </Label>
                  <p className="text-sm">
                    {config.defaultDietaryRestrictions
                      .map(
                        (restriction) =>
                          COURIER_DIETARY_RESTRICTIONS_TO_HUMAN[
                            restriction as keyof typeof COURIER_DIETARY_RESTRICTIONS_TO_HUMAN
                          ],
                      )
                      .join(", ")}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-600">Distance Unit</Label>
                  <p className="text-sm">
                    {
                      DISTANCE_UNIT_TO_HUMAN[
                        config.distanceUnit as keyof typeof DISTANCE_UNIT_TO_HUMAN
                      ]
                    }
                  </p>
                </div>
                <div>
                  <Label className="text-gray-600">Currency</Label>
                  <p className="text-sm">
                    {
                      CURRENCY_TO_HUMAN[
                        config.currency as keyof typeof CURRENCY_TO_HUMAN
                      ]
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-4">
            <h3 className="text-sm text-gray-600 mb-1">
              Please double-check this information before registering!
            </h3>
            <button
              onClick={handleRegisterSubmit}
              disabled={!registryLink || !!registryLinkError || isRegistering}
              className="bg-black rounded-md text-white px-4 py-2 text-sm font-medium hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRegistering ? "Registering..." : "Register"}
            </button>
          </div>
        </div>
      ) : null}
    </DefaultLayout>
  );
};

export default InstanceConfigurationPage;
