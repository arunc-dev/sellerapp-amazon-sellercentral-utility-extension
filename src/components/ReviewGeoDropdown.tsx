import { Select } from "antd";
import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { geoMaps, GeoMapsModel } from "../constants/geo-constants";
import { CircleFlag } from "react-circle-flags";
import { get, set } from "../helpers/Cache";

export const ReviewGeoDropdown = (props: {
  selectedGeo: (geoDetails: GeoMapsModel) => void;
  skipInitialCallback?: boolean;
}) => {
  const [defaultGeo, setDefaultGeo] = useState<string>();
  const hasInitializedRef = useRef(false);
  const callbackRef = useRef(props.selectedGeo);
  const skipInitialCallbackRef = useRef(props.skipInitialCallback);

  // Keep refs updated but only when they actually change
  useEffect(() => {
    callbackRef.current = props.selectedGeo;
    skipInitialCallbackRef.current = props.skipInitialCallback;
  }, [props.selectedGeo, props.skipInitialCallback]);

  // Memoize geoAsArray to prevent recreating on every render
  const geoAsArray = useMemo(
    () =>
      Object.keys(geoMaps).map((key: any, index) => {
        return { ...geoMaps[key], key, uniqueKey: key };
      }),
    []
  );

  // Stable onChange function using ref to avoid dependency on props.selectedGeo
  const onChange = useCallback(async (value: any) => {
    await set("selectedGeo", value);
    callbackRef.current(geoMaps[value]);
  }, []);

  useEffect(() => {
    // Prevent running multiple times
    if (hasInitializedRef.current) {
      return;
    }

    // Mark as initialized immediately, synchronously, to prevent race conditions in StrictMode
    hasInitializedRef.current = true;

    (async () => {
      let selectedGeoUniqueKey;
      try {
        selectedGeoUniqueKey = (await get("selectedGeo")) as string;
      } catch {}
      const selectedGeoKey = selectedGeoUniqueKey || geoAsArray[0].uniqueKey;
      setDefaultGeo(selectedGeoKey);

      // Only call onChange if not skipping initial callback
      if (!skipInitialCallbackRef.current) {
        onChange(selectedGeoKey);
      }
    })();
  }, [geoAsArray, onChange]);
  return (
    <>
      {defaultGeo ? (
        <Select
          className="geo-dropdown"
          onChange={onChange}
          defaultValue={defaultGeo}
          style={{
            width: "70px",
          }}
          labelRender={(details) => {
            const key = details.value || "AMAZON_US";
            return (
              <div className="flex justify-center items-center">
                <CircleFlag
                  countryCode={geoMaps[key].countryCode}
                  height="24"
                  width="24"
                />
              </div>
            );
          }}
          options={geoAsArray.map((value, index) => {
            return {
              value: value.uniqueKey,
              label: (
                <div className="flex justify-center items-center">
                  <CircleFlag
                    countryCode={value.countryCode}
                    height="24"
                    width="24"
                  />
                </div>
              ),
            };
          })}
        />
      ) : (
        ""
      )}
    </>
  );
};
