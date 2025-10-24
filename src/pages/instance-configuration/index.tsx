import {
  useGetInstanceConfigOptionsQuery,
  useGetInstanceConfigQuery,
  useSetInstanceConfigMutation,
} from '@/api/configApi'
import { DefaultLayout } from '@/components/layouts/DefaultLayout'
import type { NextPage } from 'next'
import { InstanceConfigSettingsAdminInput } from '@/backend-admin-sdk'
import { Input, Label } from '@/admin-web-components'
import { COURIER_DELIVERY_COMPENSATION_TYPE_TO_HUMAN, COURIER_DIETARY_RESTRICTIONS_TO_HUMAN, COURIER_MATCHER_TYPE_TO_HUMAN, CURRENCY_TO_HUMAN, DELIVERY_DURATION_CALCULATION_TYPE_TO_HUMAN, DISTANCE_UNIT_TO_HUMAN, GEO_CALCULATION_TYPE_TO_HUMAN, QUOTE_CALCULATION_TYPE_TO_HUMAN } from '@/shared-types'

const InstanceConfigurationPage: NextPage = () => {
  const instanceConfigOptionsResponse = useGetInstanceConfigOptionsQuery({})
  const instanceConfigResponse = useGetInstanceConfigQuery({})
  const [setInstanceConfigMutation] = useSetInstanceConfigMutation()

  const onInstanceConfigChangeDietaryRestrictions = async (select: any) => {
    const result = []
    const options = select && select.options
    let opt

    for (let i = 0, iLen = options.length; i < iLen; i++) {
      opt = options[i]
      if (opt.selected) {
        result.push(opt.value || opt.text)
      }
    }

    await setInstanceConfigMutation({
      defaultDietaryRestrictions: result,
    })
  }

  const onInstanceConfigChange = async (key: keyof InstanceConfigSettingsAdminInput, value: any) => {
    await setInstanceConfigMutation({
      [key]: value,
    })
  }

  return (
    <DefaultLayout>
      <h2 className="text-3xl font-medium tracking-tight">Instance configuration</h2>
      <Label className="text-right">Courier matcher type</Label>
      <br />
      <select onChange={(e) => onInstanceConfigChange('courierMatcherType', e.target.value)}>
        {instanceConfigOptionsResponse.data?.courierMatcherType.map((option) => (
          <option key={option} value={option} selected={instanceConfigResponse.data?.courierMatcherType === option}>
            {COURIER_MATCHER_TYPE_TO_HUMAN[option]}
          </option>
        ))}
      </select>
      <br />
      <br />
      <Label className="text-right">Quote calculation type</Label>
      <br />
      <select onChange={(e) => onInstanceConfigChange('quoteCalculationType', e.target.value)}>
        {instanceConfigOptionsResponse.data?.quoteCalculationType.map((option) => (
          <option key={option} value={option} selected={instanceConfigResponse.data?.quoteCalculationType === option}>
            {QUOTE_CALCULATION_TYPE_TO_HUMAN[option]}
          </option>
        ))}
      </select>
      <br />
      <br />
      <Label className="text-right">Geo calculation type</Label>
      <br />
      <select onChange={(e) => onInstanceConfigChange('geoCalculationType', e.target.value)}>
        {instanceConfigOptionsResponse.data?.geoCalculationType.map((option) => (
          <option key={option} value={option} selected={instanceConfigResponse.data?.geoCalculationType === option}>
            {GEO_CALCULATION_TYPE_TO_HUMAN[option]}
          </option>
        ))}
      </select>
      <br />
      <br />
      <Label className="text-right">Delivery duration calculation type</Label>
      <br />
      <select onChange={(e) => onInstanceConfigChange('deliveryDurationCalculationType', e.target.value)}>
        {instanceConfigOptionsResponse.data?.deliveryDurationCalculationType.map((option) => (
          <option
            key={option}
            value={option}
            selected={instanceConfigResponse.data?.deliveryDurationCalculationType === option}
          >
            {DELIVERY_DURATION_CALCULATION_TYPE_TO_HUMAN[option]}
          </option>
        ))}
      </select>
      <br />
      <br />
      <Label className="text-right">Courier compensation calculation type</Label>
      <br />
      <select onChange={(e) => onInstanceConfigChange('courierCompensationCalculationType', e.target.value)}>
        {instanceConfigOptionsResponse.data?.courierCompensationCalculationType.map((option) => (
          <option
            key={option}
            value={option}
            selected={instanceConfigResponse.data?.courierCompensationCalculationType === option}
          >
            {COURIER_DELIVERY_COMPENSATION_TYPE_TO_HUMAN[option]}
          </option>
        ))}
      </select>
      <br />
      <br />
      <Label className="text-right">Dietary restrictions</Label>
      <br />
      <select onChange={(e) => onInstanceConfigChangeDietaryRestrictions(e.target)} multiple>
        {instanceConfigOptionsResponse.data?.defaultDietaryRestrictions.map((option) => (
          <option
            key={option}
            value={option}
            selected={(instanceConfigResponse.data?.defaultDietaryRestrictions ?? ([] as any)).indexOf(option) >= 0}
          >
            {COURIER_DIETARY_RESTRICTIONS_TO_HUMAN[option]}
          </option>
        ))}
      </select>
      <br />
      <br />
      <Label className="text-right">Currency</Label>
      <br />
      <select onChange={(e) => onInstanceConfigChange('currency', e.target.value)}>
        {instanceConfigOptionsResponse.data?.currency.map((option) => (
          <option key={option} value={option} selected={instanceConfigResponse.data?.currency === option}>
            {CURRENCY_TO_HUMAN[option]}
          </option>
        ))}
      </select>
      <br />
      <br />
      <Label className="text-right">Distance unit</Label>
      <br />
      <select onChange={(e) => onInstanceConfigChange('distanceUnit', e.target.value)}>
        {instanceConfigOptionsResponse.data?.distanceUnit.map((option) => (
          <option key={option} value={option} selected={instanceConfigResponse.data?.distanceUnit === option}>
            {DISTANCE_UNIT_TO_HUMAN[option]}
          </option>
        ))}
      </select>
      <br />
      <br />
      <Label className="text-right">Max assignment distance</Label>
      <Input
        key="maxAssignmentDistance"
        type="number"
        value={instanceConfigResponse.data?.maxAssignmentDistance ?? 0}
        onChange={(event) => onInstanceConfigChange('maxAssignmentDistance', event.target.value)}
        className="max-w-[280px] pl-8"
      />
      <br />
      <br />
      <Label className="text-right">Max drift distance (Maximum amount of distance that the quote and delivery pickup can differ in metres)</Label>
      <Input
        key="maxDriftDistance"
        type="number"
        value={instanceConfigResponse.data?.maxDriftDistance ?? 0}
        onChange={(event) => onInstanceConfigChange('maxDriftDistance', event.target.value)}
        className="max-w-[280px] pl-8"
      />
      <br />
      <Label className="text-right">Quote expiration minutes</Label>
      <Input
        key="quoteExpirationMinutes"
        type="number"
        value={instanceConfigResponse.data?.quoteExpirationMinutes ?? 0}
        onChange={(event) => onInstanceConfigChange('quoteExpirationMinutes', event.target.value)}
        className="max-w-[280px] pl-8"
      />
      <br />
      <Label className="text-right">Default courier pay rate</Label>
      <Input
        key="defaultCourierPayRate"
        type="number"
        value={instanceConfigResponse.data?.defaultCourierPayRate ?? 0}
        onChange={(event) => onInstanceConfigChange('defaultCourierPayRate', event.target.value)}
        className="max-w-[280px] pl-8"
      />
      <br />
      <Label className="text-right">Default minimum courier pay</Label>
      <Input
        key="defaultMinimumCourierPay"
        type="number"
        value={instanceConfigResponse.data?.defaultMinimumCourierPay ?? 0}
        onChange={(event) => onInstanceConfigChange('defaultMinimumCourierPay', event.target.value)}
        className="max-w-[280px] pl-8"
      />
      <br />
      <Label className="text-right">Default max working hours</Label>
      <Input
        key="defaultMaxWorkingHours"
        type="number"
        value={instanceConfigResponse.data?.defaultMaxWorkingHours ?? 0}
        onChange={(event) => onInstanceConfigChange('defaultMaxWorkingHours', event.target.value)}
        className="max-w-[280px] pl-8"
      />
      <br />
      <Label className="text-right">Fee percentage amount</Label>
      <Input
        key="feePercentageAmount"
        type="number"
        value={instanceConfigResponse.data?.feePercentageAmount ?? 0}
        onChange={(event) => onInstanceConfigChange('feePercentageAmount', event.target.value)}
        className="max-w-[280px] pl-8"
      />
    </DefaultLayout>
  )
}

export default InstanceConfigurationPage
