import { select } from 'd3-selection';

// misc
import renderQueue from './util/renderQueue';
import { _rebind } from './helper';
import getset from './util/getset';
import w from './util/width';

// brush
import install1DAxes from './brush/install1DAxes';
import install2DStrums from './brush/install2DStrums';
import installAngularBrush from './brush/installAngularBrush';

// api
import intersection from './api/intersection';
import mergeParcoords from './api/mergeParcoords';
import selected from './api/selected';
import brushMode from './api/brushMode';
import updateAxes from './api/updateAxes';
import autoscale from './api/autoscale';
import brushable from './api/brushable';
import commonScale from './api/commonScale';
import computeRealCentroids from './api/computeRealCentroids';
import applyDimensionDefaults from './api/applyDimensionDefaults';
import createAxes from './api/createAxes';
import axisDots from './api/axisDots';
import applyAxisConfig from './api/applyAxisConfig';
import reorderable from './api/reorderable';
import resize from './api/resize';
import reorder from './api/reorder';
import sortDimensions from './api/sortDimensions';
import sortDimensionsByRowData from './api/sortDimensionsByRowData';
import clear from './api/clear';
import {
  pathBrushed,
  renderBrushed,
  renderBrushedDefault,
  renderBrushedQueue,
} from './api/renderBrushed';
import brushReset from './api/brushReset';
import toType from './api/toType';
import toString from './api/toString';
import adjacentPairs from './api/adjacentPairs';
import highlight from './api/highlight';
import unhighlight from './api/unhighlight';
import removeAxes from './api/removeAxes';
import render from './api/render';
import renderDefault, { pathForeground } from './api/renderDefault';
import toTypeCoerceNumbers from './api/toTypeCoerceNumbers';
import detectDimensionTypes from './api/detectDimensionTypes';
import getOrderedDimensionKeys from './api/getOrderedDimensionKeys';
import interactive from './api/interactive';
import shadows from './api/shadows';

import { version } from '../package.json';
import initState from './state';
import sideEffects from './sideEffects';

//css
import './parallel-coordinates.css';

const ParCoords = userConfig => {
  const state = initState(userConfig);
  const {
    config: __,
    events,
    flags,
    xscale,
    dragging,
    axis,
    ctx,
    canvas,
    brush,
  } = state;

  const pc = function(selection) {
    selection = pc.selection = select(selection);

    __.width = selection.node().clientWidth;
    __.height = selection.node().clientHeight;
    // canvas data layers
    ['marks', 'foreground', 'brushed', 'highlight'].forEach(function(layer) {
      canvas[layer] = selection
        .append('canvas')
        .attr('class', layer)
        .node();
      ctx[layer] = canvas[layer].getContext('2d');
    });

    // svg tick and brush layers
    pc.svg = selection
      .append('svg')
      .attr('width', __.width)
      .attr('height', __.height)
      .style('font', '14px sans-serif')
      .style('position', 'absolute')

      .append('svg:g')
      .attr(
        'transform',
        'translate(' + __.margin.left + ',' + __.margin.top + ')'
      );

    return pc;
  };

  const position = d => {
    if (xscale.range().length === 0) {
      xscale.range([0, w(__)], 1);
    }
    let v = dragging[d];
    return v == null ? xscale(d) : v;
  };

  const brushedQueue = renderQueue(pathBrushed(__, ctx, position))
    .rate(50)
    .clear(() => pc.clear('brushed'));

  const foregroundQueue = renderQueue(pathForeground(__, ctx, position))
    .rate(50)
    .clear(function() {
      pc.clear('foreground');
      pc.clear('highlight');
    });

  // side effects for setters
  const side_effects = sideEffects(
    __,
    ctx,
    pc,
    xscale,
    flags,
    brushedQueue,
    foregroundQueue
  );

  // create getter/setters
  getset(pc, __, events, side_effects);

  // expose events
  // getter/setter with event firing
  _rebind(pc, events, 'on');

  _rebind(
    pc,
    axis,
    'ticks',
    'orient',
    'tickValues',
    'tickSubdivide',
    'tickSize',
    'tickPadding',
    'tickFormat'
  );

  // expose the state of the chart
  pc.state = __;
  pc.flags = flags;

  pc.autoscale = autoscale(__, pc, xscale, ctx);

  pc.scale = function(d, domain) {
    __.dimensions[d].yscale.domain(domain);

    return this;
  };

  pc.flip = function(d) {
    //__.dimensions[d].yscale.domain().reverse();                               // does not work
    __.dimensions[d].yscale.domain(__.dimensions[d].yscale.domain().reverse()); // works

    return this;
  };

  pc.commonScale = commonScale(__, pc);
  pc.detectDimensions = function() {
    pc.dimensions(pc.applyDimensionDefaults());
    return this;
  };

  pc.applyDimensionDefaults = applyDimensionDefaults(__, pc);
  pc.getOrderedDimensionKeys = getOrderedDimensionKeys(__);

  pc.toType = toType;

  // try to coerce to number before returning type
  pc.toTypeCoerceNumbers = toTypeCoerceNumbers;
  // attempt to determine types of each dimension based on first row of data
  pc.detectDimensionTypes = detectDimensionTypes;

  pc.render = render(__, pc, events);
  pc.renderBrushed = renderBrushed(__, pc, events);

  pc.render.default = renderDefault(__, pc, ctx, position);
  pc.render.queue = function() {
    pc.renderBrushed.queue();

    foregroundQueue(__.data);
  };

  pc.renderBrushed.default = renderBrushedDefault(__, ctx, position, pc, brush);
  pc.renderBrushed.queue = renderBrushedQueue(__, brush, brushedQueue);
  pc.compute_real_centroids = computeRealCentroids(__.dimensions, position);

  pc.shadows = shadows(flags, pc);

  // draw dots with radius r on the axis line where data intersects
  pc.axisDots = axisDots(__, pc, position);
  pc.clear = clear(__, pc, ctx, brush);
  pc.createAxes = createAxes(__, pc, xscale, flags, axis);
  pc.removeAxes = removeAxes(pc);
  pc.updateAxes = updateAxes(__, pc, position, axis, flags);
  pc.applyAxisConfig = applyAxisConfig;
  pc.brushable = brushable(__, pc, flags);
  pc.brushReset = brushReset(__);
  pc.selected = selected(__);
  pc.reorderable = reorderable(__, pc, xscale, position, dragging, flags);
  pc.reorder = reorder(__, pc, xscale);
  pc.sortDimensionsByRowData = sortDimensionsByRowData(__);
  pc.sortDimensions = sortDimensions(__, position);

  // pairs of adjacent dimensions
  pc.adjacent_pairs = adjacentPairs;

  pc.interactive = interactive(flags);
  // expose a few objects
  pc.xscale = xscale;
  pc.ctx = ctx;
  pc.canvas = canvas;
  pc.g = () => pc._g;

  pc.resize = resize(__, pc, flags, events);

  // highlight an array of data
  pc.highlight = highlight(__, pc, canvas, events, ctx, position);

  // clear highlighting
  pc.unhighlight = unhighlight(__, pc, canvas);

  // calculate 2d intersection of line a->b with line c->d
  // points are objects with x and y properties
  pc.intersection = intersection;

  // Merges the canvases and SVG elements into one canvas element which is then passed into the callback
  // (so you can choose to save it to disk, etc.)
  pc.mergeParcoords = mergeParcoords(pc);
  pc.brushModes = () => Object.getOwnPropertyNames(brush.modes);
  pc.brushMode = brushMode(brush, __, pc);

  install1DAxes(brush, __, pc, events);
  install2DStrums(brush, __, pc, events, xscale);
  installAngularBrush(brush, __, pc, events, xscale);

  pc.version = version;
  // this descriptive text should live with other introspective methods
  pc.toString = toString(__);

  return pc;
};

export default ParCoords;
