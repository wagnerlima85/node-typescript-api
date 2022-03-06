import { StormGlass } from '@src/clients/stormGlass';
import axios from 'axios';
import stormGlassWeather3HoursFixture from '@test/fixtures/stormglass_weather_3_hours.json';
import stormglassNormalizedResponseFixture from '@test/fixtures/stormglass_normalize_weather_3_hours_fixture.json';

jest.mock('axios');

describe('StormGlass client', () => {
  const mockedAxios = axios as jest.Mocked<typeof axios>;
  it('should return the normalized forecast from the StormGlass service', async () => {
    const lat = 58.7984;
    const lng = 17.8081;

    axios.get = jest
      .fn()
      .mockReturnValue({ data: stormGlassWeather3HoursFixture });

    const stormGlass = new StormGlass(axios);
    const response = await stormGlass.fetchPoints(lat, lng);
    expect(response).toEqual(stormglassNormalizedResponseFixture);
  });

  it('should get an StormGlassResponseError when the StormGlass service responds with error', async () => {
    const lat = 58.7984;
    const lng = 17.8081;

    mockedAxios.get.mockRejectedValue({
      response: { 
        status: 429, 
        data: { errors: ['Rate Limit reached'] }
      },
    });

    const stormGlass = new StormGlass(mockedAxios);
    await expect(stormGlass.fetchPoints(lat, lng))
      .rejects.toThrow('Unexpected error returned by the StormGlass service: Error: {"errors":["Rate Limit reached"]} Code: 429');
  });
});
