export type Occasion = 'casual' | 'office' | 'party' | 'date' | 'wedding' | 'sport';

export interface OutfitRecommendation {
  title: string;
  description: string;
  items: {
    category: string;
    item: string;
    stylingTip: string;
  }[];
  overallStylingTip: string;
  colorPalette: string[];
}

export interface WeatherData {
  temp: number;
  condition: string;
  city: string;
}
