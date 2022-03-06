import { ForecastPoint } from '@src/clients/resources/forecastPoint';
import { StormGlassForecastResponse } from '@src/clients/resources/stormGlassForecastResponse';
import { StormGlassPoint } from '@src/clients/resources/stormGlassPoint';
import { ClientRequestError } from '@src/errors/clientRequestError';
import { StormGlassResponseError } from '@src/errors/stormGlassResponseError';
import * as HTTPUtil from '@src/util/request';
import config, { IConfig } from 'config';

const appConfig: IConfig = config.get('App.resources.StormGlass');
const API_URL: string = 'apiUrl';
const API_TOKEN: string = 'apiToken';
export class StormGlass {
  readonly stormGlassAPIParams =
    'swellDirection,swellHeight,swellPeriod,waveDirection,waveHeight,windDirection,windSpeed';
  readonly stormGlassAPISource = 'noaa';

  constructor(protected request = new HTTPUtil.Request()) {}

  public async fetchPoints(lat: number, lng: number): Promise<ForecastPoint[]> {
    try {
      const response = await this.request.get<StormGlassForecastResponse>(
        `${appConfig.get(API_URL)}/weather/point?lat=${lat}&lng=${lng}&params=${
          this.stormGlassAPIParams
        }&source=${this.stormGlassAPISource}`,
        {
          headers: {
            Authorization: appConfig.get(API_TOKEN),
          },
        }
      );
      return this.normalizeResponse(response.data);
    } catch (error: any) {
      if(HTTPUtil.Request.isRequestError(error)) throw StormGlassResponseError.throw(error);
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
