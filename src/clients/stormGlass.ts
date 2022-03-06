import axios, { AxiosStatic } from 'axios';
import { ForecastPoint } from '@src/clients/resources/forecastPoint';
import { StormGlassForecastResponse } from '@src/clients/resources/stormGlassForecastResponse';
import { Constants } from '@src/util/constants';
import { StormGlassPoint } from '@src/clients/resources/stormGlassPoint';
import { ClientRequestError } from '@src/errors/clientRequestError';
import { StormGlassResponseError } from '@src/errors/stormGlassResponseError';

export class StormGlass {
  readonly stormGlassAPIParams =
    'swellDirection,swellHeight,swellPeriod,waveDirection,waveHeight,windDirection,windSpeed';
  readonly stormGlassAPISource = 'noaa';

  constructor(protected request: AxiosStatic = axios) {}

  public async fetchPoints(lat: number, lng: number): Promise<ForecastPoint[]> {
    try {
      const response = await this.request.get<StormGlassForecastResponse>(
        `${Constants.URL_API}/weather/point?lat=${lat}&lng=${lng}&params=${this.stormGlassAPIParams}&source=${this.stormGlassAPISource}`,
        {
          headers: {
            Authorization: 'fake-token',
          },
        }
      );
      return this.normalizeResponse(response.data);
    } catch (error: any) {
      if (error.response && error.response.status) {
        throw StormGlassResponseError.throw(error);
      }
      throw ClientRequestError.throw(error);
    }
  }

  private normalizeResponse(
    points: StormGlassForecastResponse
  ): ForecastPoint[] {
    return points.hours.filter(this.isValidPoint.bind(this)).map((point) => ({
      swellDirection: point.swellDirection[this.stormGlassAPISource],
      swellHeight: point.swellHeight[this.stormGlassAPISource],
      swellPeriod: point.swellPeriod[this.stormGlassAPISource],
      time: point.time,
      waveDirection: point.waveDirection[this.stormGlassAPISource],
      waveHeight: point.waveHeight[this.stormGlassAPISource],
      windDirection: point.windDirection[this.stormGlassAPISource],
      windSpeed: point.windSpeed[this.stormGlassAPISource],
    }));
  }

  private isValidPoint(point: Partial<StormGlassPoint>): boolean {
    return !!(
      point.time &&
      point.swellDirection?.[this.stormGlassAPISource] &&
      point.swellHeight?.[this.stormGlassAPISource] &&
      point.swellPeriod?.[this.stormGlassAPISource] &&
      point.waveDirection?.[this.stormGlassAPISource] &&
      point.waveHeight?.[this.stormGlassAPISource] &&
      point.windDirection?.[this.stormGlassAPISource] &&
      point.windSpeed?.[this.stormGlassAPISource]
    );
  }
}
