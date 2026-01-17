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

const AdminMap = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="h-[480px] w-full bg-gray-100 animate-pulse rounded-lg">
      Loading Map...
    </div>
  ),
});

const InstanceConfigurationPage: NextPage = () => {
  const instanceConfigOptionsResponse = useGetInstanceConfigOptionsQuery({});
  const instanceConfigResponse = useGetInstanceConfigQuery({});
  const [setInstanceConfigMutation] = useSetInstanceConfigMutation();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const hostname = window.location.origin;
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

  // Sync server data to local state
  useEffect(() => {
    const data = instanceConfigResponse.data;
    if (data) {
      const metadata = (data.metadata as any) || {};
      setConfig({
        name: metadata.name ?? "",
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

  const handleSaveAllChanges = async () => {
    setIsSaving(true);
    try {
      const { name, imageURL, region, ...restConfig } = config;
      const existingMetadata =
        (instanceConfigResponse.data?.metadata as any) || {};

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
          name,
          imageURL,
          region: processedRegion,
        },
      } as any);
      toast({
        title: "Success!",
        description: "Instance configuration saved successfully.",
      });
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

  // Memoize the onUpdate callback to prevent map re-renders
  const handleMapUpdate = useCallback((val: any) => {
    regionDataRef.current = val;
  }, []);

  return (
    <DefaultLayout>
      <div className="flex justify-between">
        <h2 className="text-3xl font-medium tracking-tight">
          Instance configuration
        </h2>
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
      </div>
      <div className="flex gap-4">
        <Link
          href="/termsofservice.html"
          target="_blank"
          className="text-gray-500 cursor-pointer hover:text-gray-800"
        >
          <Label className="text-right cursor-pointer">
            Edit Terms of Service
          </Label>
        </Link>
        <Link
          href="/privacypolicy.html"
          target="_blank"
          className="text-gray-500 cursor-pointer hover:text-gray-800"
        >
          <Label className="text-right cursor-pointer">
            Edit Privacy Policy
          </Label>
        </Link>
      </div>
      <div className="pt-4 flex flex-col gap-2">
        <div>
          <Label className="text-right">Instance name</Label>
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
            className="max-w-[280px]"
          />
        </div>
        <div>
          <Label className="text-right">Instance image URL</Label>
          <Input
            key="imageURL"
            type="text"
            value={config.imageURL}
            onChange={(event) =>
              setConfig({
                ...config,
                imageURL: event.target.value,
              })
            }
            className="max-w-[280px]"
          />
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
          <Label className="text-right">
            Dietary restrictions (select multiple)
          </Label>
          <br />
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
            onChange={(e) => setConfig({ ...config, currency: e.target.value })}
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
            {instanceConfigOptionsResponse.data?.distanceUnit.map((option) => (
              <option key={option} value={option}>
                {DISTANCE_UNIT_TO_HUMAN[option]}
              </option>
            ))}
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
            className="max-w-[280px]"
          />
        </div>
        <div>
          <Label className="text-right">
            Max drift distance (Maximum amount of distance that the quote and
            delivery pickup can differ in metres)
          </Label>
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
            className="max-w-[280px]"
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
            className="max-w-[280px]"
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
            className="max-w-[280px]"
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
            className="max-w-[280px]"
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
            className="max-w-[280px]"
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
            className="max-w-[280px]"
          />
        </div>
      </div>
      <button
        onClick={handleSaveAllChanges}
        disabled={isSaving}
        className="mt-4 bg-black rounded-md text-white px-4 py-2 text-sm font-medium hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSaving ? "Saving..." : "Save All Changes"}
      </button>
    </DefaultLayout>
  );
};

export default InstanceConfigurationPage;
