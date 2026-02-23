import { WeatherData } from "../types";

export async function getCurrentWeather(): Promise<WeatherData | null> {
  try {
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });

    const { latitude, longitude } = position.coords;
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
    );
    const data = await response.json();

    if (data.current_weather) {
      return {
        temp: Math.round(data.current_weather.temperature),
        condition: getWeatherCondition(data.current_weather.weathercode),
        city: "Your Location",
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching weather:", error);
    return null;
  }
}

function getWeatherCondition(code: number): string {
  if (code === 0) return "Clear sky";
  if (code <= 3) return "Partly cloudy";
  if (code <= 48) return "Foggy";
  if (code <= 67) return "Rainy";
  if (code <= 77) return "Snowy";
  if (code <= 82) return "Rain showers";
  if (code <= 99) return "Thunderstorm";
  return "Unknown";
}
