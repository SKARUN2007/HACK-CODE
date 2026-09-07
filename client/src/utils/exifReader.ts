/**
 * Utility to extract GPS Latitude and Longitude from image EXIF metadata.
 */
export async function extractGpsFromImage(file: File): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const buffer = await file.arrayBuffer();
    const dataView = new DataView(buffer);

    // Verify JPEG SOI marker 0xFFD8
    if (dataView.byteLength < 4 || dataView.getUint16(0, false) !== 0xffd8) {
      return null;
    }

    let offset = 2;
    const length = dataView.byteLength;

    while (offset < length - 4) {
      const marker = dataView.getUint16(offset, false);
      offset += 2;

      // APP1 Marker (EXIF)
      if (marker === 0xffe1) {
        const segmentLength = dataView.getUint16(offset, false);
        if (offset + 6 <= length) {
          const exifHeader = String.fromCharCode(
            dataView.getUint8(offset + 2),
            dataView.getUint8(offset + 3),
            dataView.getUint8(offset + 4),
            dataView.getUint8(offset + 5)
          );

          if (exifHeader === 'Exif') {
            const tiffOffset = offset + 8;
            const littleEndian = dataView.getUint16(tiffOffset, false) === 0x4949; // 'II'

            const firstIfdOffset = dataView.getUint32(tiffOffset + 4, littleEndian);
            if (firstIfdOffset) {
              const gpsCoords = parseGpsIfd(dataView, tiffOffset, tiffOffset + firstIfdOffset, littleEndian);
              if (gpsCoords) return gpsCoords;
            }
          }
        }
        offset += segmentLength;
      } else if ((marker & 0xff00) === 0xff00) {
        if (marker === 0xffda) break; // Start of Scan
        const segmentLength = dataView.getUint16(offset, false);
        offset += segmentLength;
      } else {
        break;
      }
    }
  } catch (err) {
    console.log('No EXIF GPS metadata found in image:', err);
  }
  return null;
}

function parseGpsIfd(dataView: DataView, tiffOffset: number, ifdOffset: number, littleEndian: boolean): { latitude: number; longitude: number } | null {
  try {
    if (ifdOffset + 2 > dataView.byteLength) return null;
    const numEntries = dataView.getUint16(ifdOffset, littleEndian);
    let gpsIfdOffset = 0;

    for (let i = 0; i < numEntries; i++) {
      const entryOffset = ifdOffset + 2 + i * 12;
      if (entryOffset + 12 > dataView.byteLength) break;
      const tag = dataView.getUint16(entryOffset, littleEndian);
      if (tag === 0x8825) { // GPS Info IFD Pointer
        gpsIfdOffset = dataView.getUint32(entryOffset + 8, littleEndian);
        break;
      }
    }

    if (!gpsIfdOffset) return null;

    const gpsIfd = tiffOffset + gpsIfdOffset;
    if (gpsIfd + 2 > dataView.byteLength) return null;
    const gpsNumEntries = dataView.getUint16(gpsIfd, littleEndian);

    let lat: number[] | null = null;
    let latRef: string = 'N';
    let lng: number[] | null = null;
    let lngRef: string = 'E';

    for (let i = 0; i < gpsNumEntries; i++) {
      const entryOffset = gpsIfd + 2 + i * 12;
      if (entryOffset + 12 > dataView.byteLength) break;
      const tag = dataView.getUint16(entryOffset, littleEndian);
      const valueOffset = tiffOffset + dataView.getUint32(entryOffset + 8, littleEndian);

      if (tag === 0x0001) { // GPSLatitudeRef
        latRef = String.fromCharCode(dataView.getUint8(entryOffset + 8));
      } else if (tag === 0x0002) { // GPSLatitude
        lat = readRationals(dataView, valueOffset, 3, littleEndian);
      } else if (tag === 0x0003) { // GPSLongitudeRef
        lngRef = String.fromCharCode(dataView.getUint8(entryOffset + 8));
      } else if (tag === 0x0004) { // GPSLongitude
        lng = readRationals(dataView, valueOffset, 3, littleEndian);
      }
    }

    if (lat && lng && lat.length === 3 && lng.length === 3) {
      let latitude = lat[0] + lat[1] / 60 + lat[2] / 3600;
      if (latRef === 'S') latitude = -latitude;

      let longitude = lng[0] + lng[1] / 60 + lng[2] / 3600;
      if (lngRef === 'W') longitude = -longitude;

      if (!isNaN(latitude) && !isNaN(longitude) && latitude !== 0 && longitude !== 0) {
        return { latitude, longitude };
      }
    }
  } catch (err) {
    // ignore
  }
  return null;
}

function readRationals(dataView: DataView, offset: number, count: number, littleEndian: boolean): number[] {
  const result: number[] = [];
  try {
    for (let i = 0; i < count; i++) {
      const pos = offset + i * 8;
      if (pos + 8 > dataView.byteLength) break;
      const num = dataView.getUint32(pos, littleEndian);
      const den = dataView.getUint32(pos + 4, littleEndian);
      result.push(den === 0 ? 0 : num / den);
    }
  } catch {
    // ignore
  }
  return result;
}
