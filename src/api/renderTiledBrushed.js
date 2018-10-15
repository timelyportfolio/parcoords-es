import { aggregatePoints } from './renderTiled';
import { scaleLinear } from 'd3-scale';
import { interpolateViridis } from 'd3-scale-chromatic';
import { max, merge } from 'd3-array';

const tileForegroundBrushed = (config, ctx, x, y, gw, gh, color, opacity) => {
  // ctx.foreground.fillStyle = functor(config.color)(d, i);
  //ctx.foreground.fillStyle = 'rgb(100, 100, 100,' + opacity + ')';
  ctx.brushed.fillStyle = color;
  ctx.brushed.fillRect(x, y, gw, gh);
  // draw rects
};

const renderTiledBrushed = (config, pc, ctx, position) => () => {
  pc.clear('brushed');

  //pc.renderBrushed.default();
  //pc.renderMarked.default();

  const aggregated = aggregatePoints(config, config.brushed, pc, position);
  const grid_aggregate = aggregated.grid_aggregate;
  const gw = aggregated.gw;
  const gh = aggregated.gh;
  const max_count = max(merge(grid_aggregate.values().map(d => d.values())));

  //const scale_opacity = scaleLinear().domain([0, max_count]);
  const scale_normalize = scaleLinear().domain([0, max_count]);
  grid_aggregate.entries().forEach(d => {
    d.value.entries().forEach(y => {
      //tileForeground( config, ctx, +d.key, +y.key, gw, gh, scale_opacity(y.value) )
      tileForegroundBrushed(
        config,
        ctx,
        +d.key,
        +y.key,
        gw,
        gh,
        interpolateViridis(scale_normalize(y.value))
      );
    });
  });
};

export default renderTiledBrushed;
