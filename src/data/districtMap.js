// Schematic geometry for the sample district map, as [longitude, latitude] points. The state outline is simplified
// and the district shapes are placeholders drawn around each district's city, not official boundaries; the Power BI
// report would use the Department of Education's district shapefile. Keyed by the names in DISTRICTS (stages.js).
export const SD_OUTLINE = [
  [-104.05, 45.94], [-96.56, 45.94], [-96.6, 45.82], [-96.84, 45.6], [-96.68, 45.41], [-96.45, 45.3],
  [-96.45, 43.5], [-96.6, 43.1], [-96.46, 42.49], [-96.72, 42.67], [-97.02, 42.77], [-97.4, 42.87],
  [-97.85, 42.86], [-98.15, 42.84], [-98.5, 43.0], [-104.05, 43.0],
];

// `label` is where the name and value go, and `anchor` which way the text runs from it.
export const DISTRICT_SHAPES = {
  'Aberdeen 06-1': {
    shape: [[-98.78, 45.62], [-98.25, 45.64], [-98.18, 45.38], [-98.3, 45.24], [-98.72, 45.27]],
    label: [-98.08, 45.5], anchor: 'start',
  },
  'Brookings 05-1': {
    shape: [[-97.02, 44.45], [-96.62, 44.47], [-96.55, 44.22], [-96.7, 44.15], [-97.0, 44.19]],
    label: [-97.12, 44.36], anchor: 'end',
  },
  'Pierre 32-2': {
    shape: [[-100.95, 44.75], [-100.1, 44.8], [-99.95, 44.45], [-100.25, 44.2], [-100.8, 44.25]],
    label: [-100.4, 45.15], anchor: 'middle',
  },
  'Rapid City Area 51-4': {
    shape: [[-103.62, 44.3], [-102.95, 44.32], [-102.8, 44.05], [-102.98, 43.85], [-103.55, 43.88]],
    label: [-103.62, 43.6], anchor: 'start',
  },
  'Sioux Falls 49-5': {
    shape: [[-96.92, 43.68], [-96.6, 43.7], [-96.5, 43.52], [-96.62, 43.42], [-96.88, 43.45]],
    label: [-97.02, 43.6], anchor: 'end',
  },
};
