import { Select } from "antd";
import React, { useEffect, useState } from "react";
import { geoMaps, GeoMapsModel } from "../constants/geo-constants";
import { CircleFlag } from "react-circle-flags";
import { get, set } from "../helpers/Cache";

export const ReviewGeoDropdown = (props: {
  selectedGeo: (geoDetails: GeoMapsModel) => void;
}) => {
  const [defaultGeo, setDefaultGeo] = useState<string>();
  const geoAsArray = Object.keys(geoMaps).map((key: any, index) => {
    return { ...geoMaps[key], key, uniqueKey: key };
  });
  const onChange = async (value: any) => {
    await set("selectedGeo", value);
    props.selectedGeo(geoMaps[value]);
  };
  useEffect(() => {
    (async () => {
      let selectedGeoUniqueKey;
      try {
        selectedGeoUniqueKey = (await get("selectedGeo")) as string;
      } catch {}
      const selectedGeoKey = selectedGeoUniqueKey || geoAsArray[0].uniqueKey;
      setDefaultGeo(selectedGeoKey);
      onChange(selectedGeoKey);
    })();
  }, []);
  return (
    <>
      {defaultGeo ? (
        <Select
          className="geo-dropdown"
          onChange={onChange}
          defaultValue={defaultGeo}
          style={{
            width: "60px",
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
