import * as React from "react"

export function useDebouncedValue<T>(value: T, delay = 400) {
  const [debouncedValue, setDebouncedValue] = React.useState(value)

  React.useEffect(() => {
    const handle = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handle)
  }, [value, delay])

  return debouncedValue
}
