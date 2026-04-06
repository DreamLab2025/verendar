/** Style descriptor URL cho Amazon Location Service Maps (vd. explore.map.Grab). */
export function getAmazonLocationStyleDescriptorUrl(
  region: string,
  mapName: string,
  apiKey: string,
): string {
  const key = encodeURIComponent(apiKey);
  return `https://maps.geo.${region}.amazonaws.com/maps/v0/maps/${mapName}/style-descriptor?key=${key}`;
}
