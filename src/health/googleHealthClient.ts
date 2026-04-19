export interface GoogleHealthOAuthState {
  userId: string;
  nonce: string;
  redirectTo?: string;
}

export interface GoogleHealthDataset {
  daily: Array<{
    date: string;
    sleepMinutes?: number;
    steps?: number;
    activeMinutes?: number;
    restingHeartRate?: number;
    hrvRmssd?: number;
  }>;
}

export interface GoogleHealthClient {
  buildAuthorizationUrl(state: string): URL;
  exchangeCodeForToken(code: string): Promise<{ accessToken: string; refreshToken: string }>;
  fetchDailySummaries(accessToken: string, startDate: string, endDate: string): Promise<GoogleHealthDataset>;
}

export class StubGoogleHealthClient implements GoogleHealthClient {
  public buildAuthorizationUrl(state: string): URL {
    const url = new URL("https://example.com/oauth/google-health");
    url.searchParams.set("state", state);
    return url;
  }

  public exchangeCodeForToken(
    code: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    void code;
    return Promise.resolve({
      accessToken: "stub-access-token",
      refreshToken: "stub-refresh-token"
    });
  }

  public fetchDailySummaries(
    accessToken: string,
    startDate: string,
    endDate: string
  ): Promise<GoogleHealthDataset> {
    void accessToken;
    void startDate;
    void endDate;
    return Promise.resolve({ daily: [] });
  }
}
