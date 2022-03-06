import { StormGlass } from '@src/clients/stormGlass';
import stormGlassWeather3HoursFixture from '@test/fixtures/stormglass_weather_3_hours.json';
import stormglassNormalizedResponseFixture from '@test/fixtures/stormglass_normalize_weather_3_hours_fixture.json';
import * as HTTPUtil from '@src/util/request';

jest.mock('@src/util/request');

describe('StormGlass client', () => {
  const request = new HTTPUtil.Request() as jest.Mocked<HTTPUtil.Request>;
  const requestAsClass = HTTPUtil.Request as jest.Mocked<typeof HTTPUtil.Request>;
  it('should return the normalized forecast from the StormGlass service', async () => {
    const lat = 58.7984;
    const lng = 17.8081;

    request.get.mockResolvedValue({
      data: stormGlassWeather3HoursFixture,
    } as HTTPUtil.Response);

    const stormGlass = new StormGlass(request);
    const response = await stormGlass.fetchPoints(lat, lng);
    expect(response).toEqual(stormglassNormalizedResponseFixture);
  });

  it('should exclude incomplete data points', async () => {
    const lat = 58.7984;
    const lng = 17.8081;
    const incompleteResponse = {
      hours: [
        {
          windDirection: {
            noaa: 227.0,
          },
          time: '2022-03-01T00:00:00+00:00',
        },
      ],
    };
    
    request.get.mockResolvedValue({data: incompleteResponse} as HTTPUtil.Response);
    const stormGlass = new StormGlass(request);
    const response = await stormGlass.fetchPoints(lat, lng);
    expect(response).toEqual([]);
  });

  it('should get an StormGlassResponseError when the StormGlass service responds with error', async () => {
    const lat = 58.7984;
    const lng = 17.8081;

    requestAsClass.isRequestError.mockReturnValue(true);
    request.get.mockRejectedValue({
      response: {
        status: 429,
        data: { errors: ['Rate Limit reached'] },
      },
    });

    const stormGlass = new StormGlass(request);
    await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow(
      'Unexpected error returned by the StormGlass service: Error: {"errors":["Rate Limit reached"]} Code: 429'
    );
  });
});
