import {
  useGetInstanceConfigOptionsQuery,
  useGetInstanceConfigQuery,
  useSetInstanceConfigMutation,
} from "@/api/configApi";
import { DefaultLayout } from "@/components/layouts/DefaultLayout";
import type { NextPage } from "next";
import { InstanceConfigSettingsAdminInput } from "@/backend-admin-sdk";
import { useForm } from "react-hook-form";
import {
  Input,
  Label,
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  useToast,
} from "@/admin-web-components";
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
import {
  openModal,
  closeModal,
} from "@/admin-web-components/components/molecules/modal";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { union, featureCollection } from "@turf/turf";
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
  const [setInstanceConfigMutation] = useSetInstanceConfigMutation();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const hostname = window.location.origin;
  const [urlErrors, setUrlErrors] = useState<{
    link?: string;
    websocketLink?: string;
    imageURL?: string;
  }>({});
  const form = useForm({
    defaultValues: {
      name: "",
      domainUrl: hostname,
      descriptionURL: "",
      termsOfServiceUrl: `${hostname}/termsofservice.html`,
      privacyPolicyUrl: `${hostname}/privacypolicy.html`,
      contactEmail: "",
    },
  });

  const regionDataRef = useRef<any>(null);

  // Local state for all config fields
  const [config, setConfig] = useState({
    name: "",
    link: "",
    websocketLink: "",
    imageURL: "",
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
    "main" | "privacy-policy" | "terms-of-service" | "rules" | "description"
  >("main");

  // Sync server data to local state
  useEffect(() => {
    const data = instanceConfigResponse.data;
    if (data) {
      const metadata = (data.metadata as any) || {};
      setConfig({
        name: metadata.name ?? "",
        link: metadata.link ?? "",
        websocketLink: metadata.websocketLink ?? "",
        imageURL: metadata.imageURL ?? "",
        region: metadata.region ?? null,
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
      setPrivacyPolicyContent(metadata.privacyPolicyContent ?? "");
      setTermsOfServiceContent(metadata.termsOfServiceContent ?? "");
      setRulesContent(metadata.rulesContent ?? "");
      setDescriptionContent(metadata.descriptionContent ?? "");
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
      const existingMetadata =
        (instanceConfigResponse.data?.metadata as any) || {};

      await setInstanceConfigMutation({
        metadata: {
          ...existingMetadata,
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
      const existingMetadata =
        (instanceConfigResponse.data?.metadata as any) || {};

      await setInstanceConfigMutation({
        metadata: {
          ...existingMetadata,
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
      const existingMetadata =
        (instanceConfigResponse.data?.metadata as any) || {};

      await setInstanceConfigMutation({
        metadata: {
          ...existingMetadata,
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
      const existingMetadata =
        (instanceConfigResponse.data?.metadata as any) || {};

      await setInstanceConfigMutation({
        metadata: {
          ...existingMetadata,
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
      config.imageURL.trim() !== "" &&
      config.region !== null &&
      config.defaultDietaryRestrictions.length > 0
    );
  }, [config]);

  const handleSaveAllChanges = async () => {
    setIsSaving(true);
    try {
      const { name, link, websocketLink, imageURL, region, ...restConfig } =
        config;
      const existingMetadata =
        (instanceConfigResponse.data?.metadata as any) || {};

      // Sanitize and trim URL fields
      const sanitizedName = name.trim();
      const sanitizedLink = sanitizeURL(link.trim());
      const sanitizedWebsocketLink = sanitizeURL(websocketLink.trim());
      const sanitizedImageURL = sanitizeURL(imageURL.trim());

      // Update config state with sanitized values
      setConfig({
        ...config,
        name: sanitizedName,
        link: sanitizedLink,
        websocketLink: sanitizedWebsocketLink,
        imageURL: sanitizedImageURL,
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
        metadata: {
          ...existingMetadata,
          name: sanitizedName,
          link: sanitizedLink,
          websocketLink: sanitizedWebsocketLink,
          imageURL: sanitizedImageURL,
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

  const onSubmit = (data: any) => {
    console.log(data);
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
    field: "link" | "websocketLink" | "imageURL",
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
      <div className="flex justify-between">
        <h2 className="text-3xl font-medium tracking-tight pb-1">
          Instance Configuration
        </h2>
        {currentView === "main" && (
          <button
            className="bg-black rounded-md text-white px-4 py-2 text-sm font-medium hover:bg-slate-700"
            onClick={() =>
              openModal({
                id: "instance-registration-modal",
                title: "Instance Registration Form",
                description:
                  "Register your instance to the instance registry, so that users can discover it!",
                children: (
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="flex flex-col gap-4"
                    >
                      {/* Instance Name */}
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Instance Name</FormLabel>
                            <FormControl>
                              <input
                                type="text"
                                {...field}
                                className="mt-1 w-1/2 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-black focus:ring-black"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Instance Domain URL */}
                      <FormItem className="flex flex-col">
                        <FormLabel>Instance Domain URL</FormLabel>
                        <FormControl>
                          <input
                            type="text"
                            value={hostname}
                            readOnly
                            className="cursor-auto mt-1 w-1/2 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-black focus:ring-black"
                          />
                        </FormControl>
                      </FormItem>

                      {/* Instance Description */}
                      <FormField
                        control={form.control}
                        name="descriptionURL"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Instance Description</FormLabel>
                            <FormControl>
                              <input
                                type="text"
                                value={`${hostname}/description.html`}
                                readOnly
                                className="cursor-auto mt-1 w-1/2 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-black focus:ring-black"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Geographic Region */}
                      <FormItem className="flex flex-col">
                        <FormLabel>Geographic Region</FormLabel>
                        <p className="text-gray-600">placeholder for now</p>
                      </FormItem>

                      {/* Terms of Service URL */}
                      <FormItem className="flex flex-col">
                        <FormLabel>Terms of Service URL</FormLabel>
                        <FormControl>
                          <input
                            type="text"
                            value={`${hostname}/termsofservice.html`}
                            readOnly
                            className="cursor-auto mt-1 w-1/2 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-black focus:ring-black"
                          />
                        </FormControl>
                      </FormItem>

                      {/* Privacy Policy URL */}
                      <FormItem className="flex flex-col">
                        <FormLabel>Privacy Policy URL</FormLabel>
                        <FormControl>
                          <input
                            type="text"
                            value={`${hostname}/privacypolicy.html`}
                            readOnly
                            className="cursor-auto mt-1 w-1/2 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-black focus:ring-black"
                          />
                        </FormControl>
                      </FormItem>

                      {/* Admin Contact Email */}
                      <FormField
                        control={form.control}
                        name="contactEmail"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Administrator Contact Email</FormLabel>
                            <FormControl>
                              <input
                                type="email"
                                {...field}
                                className="mt-1 w-1/2 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-black focus:ring-black"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Submit */}
                      <button
                        type="submit"
                        className="bg-black rounded-md text-white px-4 py-2 text-sm font-medium w-fit hover:bg-slate-700"
                      >
                        Register
                      </button>
                    </form>
                  </Form>
                ),
              })
            }
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
                disabled={
                  !!(instanceConfigResponse.data?.metadata as any)?.link
                }
                className={`max-w-[500px] ${
                  urlErrors.link ? "border-red-500 border-2" : ""
                } ${
                  !!(instanceConfigResponse.data?.metadata as any)?.link
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
                key="imageURL"
                type="text"
                value={config.imageURL}
                onChange={(event) =>
                  handleURLFieldChange("imageURL", event.target.value)
                }
                className={`max-w-[500px] ${
                  urlErrors.imageURL ? "border-red-500 border-2" : ""
                }`}
              />
              {urlErrors.imageURL && (
                <p className="text-red-500 text-sm mt-1">
                  {urlErrors.imageURL}
                </p>
              )}
            </div>
            <div>
              <Label className="text-right">Operating region</Label>
              <div className="pt-2 max-w-4xl">
                <AdminMap
                  initialGeoJSON={config.region}
                  onUpdate={handleMapUpdate}
                />
              </div>
            </div>
            <div>
              <Label className="text-right">Courier matcher type</Label>
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
              <Label className="text-right">Quote calculation type</Label>
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
              <Label className="text-right">Geo calculation type</Label>
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
                Delivery duration calculation type
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
                Courier compensation calculation type
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
              <Label className="text-right">Dietary restrictions</Label>
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
              <Label className="text-right">Distance unit</Label>
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
              <Label className="text-right">Max assignment distance</Label>
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
              <Label className="text-right">Max drift distance</Label>
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
              <Label className="text-right">Quote expiration minutes</Label>
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
              <Label className="text-right">Default courier pay rate</Label>
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
              <Label className="text-right">Default minimum courier pay</Label>
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
              <Label className="text-right">Default max working hours</Label>
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
              <Label className="text-right">Fee percentage amount</Label>
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
        <div className="mt-6">
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
          <div className="flex gap-2 mt-6">
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
        <div className="mt-6">
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
          <div className="flex gap-2 mt-6">
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
        <div className="mt-6">
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
          <div className="flex gap-2 mt-6">
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
        <div className="mt-6">
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
          <div className="flex gap-2 mt-6">
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
      ) : null}
    </DefaultLayout>
  );
};

export default InstanceConfigurationPage;
