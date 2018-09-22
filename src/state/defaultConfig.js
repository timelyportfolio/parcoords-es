const DefaultConfig = {
  data: [],
  highlighted: [],
  marked: [],
  dimensions: {},
  dimensionTitleRotation: 0,
  brushes: [],
  brushed: false,
  brushedColor: null,
  alphaOnBrushed: 0.0,
  lineWidth: 1.4,
  highlightedLineWidth: 3,
  mode: 'default',
  markedLineWidth: 3,
  markedShadowColor: '#ffffff',
  markedShadowBlur: 10,
  rate: 20,
  width: 600,
  height: 300,
  margin: { top: 24, right: 20, bottom: 12, left: 20 },
  nullValueSeparator: 'undefined', // set to "top" or "bottom"
  nullValueSeparatorPadding: { top: 8, right: 0, bottom: 8, left: 0 },
  color: '#069',
  composite: 'source-over',
  alpha: 0.7,
  bundlingStrength: 0.5,
  bundleDimension: null,
  smoothness: 0.0,
  showControlPoints: false,
  hideAxis: [],
  flipAxes: [],
  animationTime: 1100, // How long it takes to flip the axis when you double click
  rotateLabels: false,
  filters: null
};

export default DefaultConfig;
