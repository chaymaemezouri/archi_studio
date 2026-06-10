"use client";

import { useId, useMemo } from "react";
import {
  getAllVilles,
  getArrondissementsForPrefecture,
  getCommunesForPrefecture,
  getMoroccoRegionNames,
  getProvinceNamesForRegion,
  getVillesForPrefecture,
  hasArrondissements,
  resolveCommuneByName,
  resolveVilleByName,
} from "@/lib/morocco-admin";
import { glassInput, glassSelect } from "@/lib/glass-styles";
import { cn } from "@/lib/utils";

interface MoroccoLocationFieldsProps {
  /** Région administrative (champ `province` en base). */
  region: string;
  prefecture: string;
  commune: string;
  arrondissement: string;
  city: string;
  onRegionChange: (value: string) => void;
  onPrefectureChange: (value: string) => void;
  onCommuneChange: (value: string) => void;
  onArrondissementChange: (value: string) => void;
  onCityChange: (value: string) => void;
  fieldClass?: string;
}

function FieldLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="mb-1 block text-[11px] font-medium text-glass-secondary">
      {children}
      {required ? <span className="text-red-400"> *</span> : null}
    </label>
  );
}

function FreeTextLocationInput({
  value,
  onChange,
  onCommit,
  options,
  placeholder,
  disabled,
  className,
  listId,
}: {
  value: string;
  onChange: (value: string) => void;
  onCommit?: (value: string) => void;
  options: string[];
  placeholder: string;
  disabled?: boolean;
  className?: string;
  listId: string;
}) {
  return (
    <>
      <input
        className={cn(glassInput, "min-w-0 px-3", className)}
        list={options.length > 0 ? listId : undefined}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onBlur={(e) => onCommit?.(e.target.value)}
      />
      {options.length > 0 ? (
        <datalist id={listId}>
          {options.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
      ) : null}
    </>
  );
}

export default function MoroccoLocationFields({
  region,
  prefecture,
  commune,
  arrondissement,
  city,
  onRegionChange,
  onPrefectureChange,
  onCommuneChange,
  onArrondissementChange,
  onCityChange,
  fieldClass,
}: MoroccoLocationFieldsProps) {
  const prefectureListId = useId();
  const communeListId = useId();
  const villeListId = useId();
  const arrondissementListId = useId();

  const regionNames = useMemo(() => getMoroccoRegionNames(), []);

  const provinceNames = useMemo(
    () => getProvinceNamesForRegion(region),
    [region],
  );

  const communeNames = useMemo(
    () => getCommunesForPrefecture(region, prefecture),
    [region, prefecture],
  );

  const villeNames = useMemo(() => {
    const scoped = getVillesForPrefecture(region, prefecture);
    return scoped.length > 0 ? scoped : getAllVilles();
  }, [region, prefecture]);

  const arrondissementNames = useMemo(
    () => getArrondissementsForPrefecture(prefecture),
    [prefecture],
  );

  const showArrondissement = hasArrondissements(prefecture);

  const hints = { region, prefecture };

  const regionOptions = useMemo(() => {
    if (region.trim() && !regionNames.includes(region)) {
      return [region, ...regionNames];
    }
    return regionNames;
  }, [region, regionNames]);

  const applyResolved = (resolved: ReturnType<typeof resolveVilleByName>) => {
    if (!resolved) return;
    onRegionChange(resolved.regionName);
    onPrefectureChange(resolved.prefectureName);
    onCommuneChange(resolved.communeName);
    if (resolved.cityName) onCityChange(resolved.cityName);
  };

  const handleRegionChange = (next: string) => {
    onRegionChange(next);
    if (
      prefecture &&
      !getProvinceNamesForRegion(next).some(
        (name) => name.toLowerCase() === prefecture.toLowerCase(),
      )
    ) {
      onPrefectureChange("");
      onCommuneChange("");
      onArrondissementChange("");
    }
  };

  const handlePrefectureChange = (next: string) => {
    onPrefectureChange(next);
    if (
      commune &&
      !getCommunesForPrefecture(region, next).some(
        (name) => name.toLowerCase() === commune.toLowerCase(),
      )
    ) {
      onCommuneChange("");
    }
    onArrondissementChange("");
  };

  const handleCommuneChange = (next: string) => {
    onCommuneChange(next);
    if (!city.trim() || city === commune) {
      const resolved = resolveCommuneByName(next, hints);
      onCityChange(resolved?.cityName ?? next);
    }
  };

  const handleCommuneCommit = (next: string) => {
    handleCommuneChange(next);
    applyResolved(resolveCommuneByName(next, hints));
  };

  const handleCityCommit = (next: string) => {
    onCityChange(next);
    applyResolved(resolveVilleByName(next, hints));
  };

  return (
    <div className="space-y-2.5">
      <div>
        <FieldLabel>Région</FieldLabel>
        <select
          className={cn(glassSelect, "w-full min-w-0", fieldClass)}
          value={region}
          onChange={(e) => handleRegionChange(e.target.value)}
        >
          <option value="">Choisir une région</option>
          {regionOptions.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <div className="min-w-0">
          <FieldLabel>Préfecture / Province</FieldLabel>
          <FreeTextLocationInput
            listId={prefectureListId}
            value={prefecture}
            onChange={handlePrefectureChange}
            onCommit={(next) => {
              const resolved =
                resolveCommuneByName(next, hints) ??
                resolveVilleByName(next, hints);
              if (resolved) applyResolved(resolved);
            }}
            options={provinceNames}
            placeholder="Préfecture ou province"
            className={fieldClass}
          />
        </div>
        <div className="min-w-0">
          <FieldLabel>Commune</FieldLabel>
          <FreeTextLocationInput
            listId={communeListId}
            value={commune}
            onChange={handleCommuneChange}
            onCommit={handleCommuneCommit}
            options={communeNames}
            placeholder="Commune"
            className={fieldClass}
          />
        </div>
        <div className="min-w-0">
          <FieldLabel required>Ville</FieldLabel>
          <FreeTextLocationInput
            listId={villeListId}
            value={city}
            onChange={onCityChange}
            onCommit={handleCityCommit}
            options={villeNames}
            placeholder="Ville"
            className={fieldClass}
          />
        </div>
        {showArrondissement ? (
          <div className="min-w-0">
            <FieldLabel>Arrondissement</FieldLabel>
            <FreeTextLocationInput
              listId={arrondissementListId}
              value={arrondissement}
              onChange={onArrondissementChange}
              options={arrondissementNames}
              placeholder="Arrondissement"
              className={fieldClass}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
