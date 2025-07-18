/** @Source https://github.com/kentcdodds/use-deep-compare-effect  */
import * as React from 'react'
import { dequal as deepEqual } from 'dequal'

type UseEffectParams = Parameters<typeof React.useEffect>
type EffectCallback = UseEffectParams[0]
type DependencyList = UseEffectParams[1]

type UseEffectReturn = ReturnType<typeof React.useEffect>

function checkDeps(deps: DependencyList) {
  if (!deps || !deps.length) {
    throw new Error('useDeepCompareEffect should not be used with no dependencies. Use React.useEffect instead.')
  }

  if (deps.every(isPrimitive)) {
    throw new Error(
      'useDeepCompareEffect should not be used with dependencies that are all primitive values. Use React.useEffect instead.'
    )
  }
}

function isPrimitive(val: unknown) {
  return /^[sbn]/.test(typeof val)
}

/**
 * @param value the value to be memoized (usually a dependency list)
 * @returns a memoized version of the value as long as it remains deeply equal
 */
export function useDeepCompareMemoize<T>(value: T) {
  const ref = React.useRef<T>(value)
  const signalRef = React.useRef<number>(0)

  if (!deepEqual(value, ref.current)) {
    ref.current = value
    signalRef.current += 1
  }

  return React.useMemo(() => ref.current, [signalRef.current])
}

export function useDeepCompareEffect(callback: EffectCallback, dependencies: DependencyList): UseEffectReturn {
  if (process.env.NODE_ENV !== 'production') {
    checkDeps(dependencies)
  }
  return React.useEffect(callback, useDeepCompareMemoize(dependencies))
}

export function useDeepCompareEffectNoCheck(callback: EffectCallback, dependencies: DependencyList): UseEffectReturn {
  return React.useEffect(callback, useDeepCompareMemoize(dependencies))
}
