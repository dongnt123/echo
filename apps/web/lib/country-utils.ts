import { getCountry, getTimezone } from "countries-and-timezones";

export const getCountryFromTimezone = (timezone: string | undefined) => {
  if (!timezone) return null;

  const timezoneInfo = getTimezone(timezone);
  if (!timezoneInfo?.countries.length) return null;

  const countryCode = timezoneInfo.countries[0];
  const country = getCountry(countryCode as string);

  return {
    code: countryCode,
    name: country?.name || countryCode
  }
}

export const getCountryFlagUrl = (countryCode: string) => {
  return `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`;
}