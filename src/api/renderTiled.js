import bresenham from 'bresenham';
import {scaleQuantize, scaleLinear} from 'd3-scale';
import {range, merge, max, extent} from 'd3-array';
import {nest} from 'd3-collection';
import functor from '../util/functor';

const tileForeground = (config, ctx, x, y, gw, gh, opacity) => {
  // ctx.foreground.fillStyle = functor(config.color)(d, i);
  ctx.foreground.fillStyle = 'rgb(100, 100, 100,' + opacity + ')';
  ctx.foreground.fillRect(x, y, gw, gh);
  // draw rects

};

const singlePathTile = (config, pc, position) => (d) => {
  const yrange = extent(config.dimensions[Object.keys(config.dimensions)[0]].yscale.range());
  const height = Math.abs(yrange[0] - yrange[1]);
  const points = Object.keys(config.dimensions)
    .map(p => [
      position(p),
      d[p] === undefined
        ? getNullPosition(config)
        : config.dimensions[p].yscale(d[p]),
    ])
    .sort((a, b) => a[0] - b[0])

  let bres_grid = [];
  points.forEach( (p,i) => {
    if(i === points.length - 1) {return}
  
    const p2 = points[i + 1];
    const width = pc.xscale.step();
    const resolution = config.resolution || 20;
    const gridh = height / resolution;
    const dim = Object.keys(config.dimensions).filter( d => config.dimensions[d].index === i)[0];
    const dim2 = Object.keys(config.dimensions).filter( d => config.dimensions[d].index === i + 1)[0];
    let scalegx = scaleQuantize();
    let scalegy = scaleQuantize();
  
    scalegx.domain([pc.xscale(dim),pc.xscale(dim2)]).range(range(0, width/gridh));
    scalegy.domain([0,height]).range(range(resolution));
    
    let bres = bresenham(scalegx(p[0]), scalegy(p[1]), scalegx(p2[0]), scalegy(p2[1]));
    bres_grid.push(bres.map( d => {
      return {x: scalegx.invertExtent(d.x), y: scalegy.invertExtent(d.y)}
    }));
  });

  return bres_grid;
};

const renderTiled = (config, pc, ctx, position) => () => {
  pc.clear('foreground');
  pc.clear('highlight');

  //pc.renderBrushed.default();
  //pc.renderMarked.default();

  const points = config.data.map(singlePathTile(config, pc, position));
  const gw = Math.abs(points[0][0][0].x[1] - points[0][0][0].x[0]);
  const gh = Math.abs(points[0][0][0].y[1] - points[0][0][0].y[0]);

  let points_collector = [];
  points.forEach( d => d.forEach( dd => dd.forEach ( ddd => points_collector.push(ddd) )));
  // will need to nest aggregate and apply color/opacity
  debugger;
  const grid_aggregate = nest().key(d=>d.x[0]).key(d=>d.y[0]).rollup(d=>d.length).map(points_collector);
  const max_count = max( merge( grid_aggregate.values().map( d => d.values() )) );

  const scale_opacity = scaleLinear().domain([0, max_count]);
  grid_aggregate.entries().forEach( d => {
    d.value.entries().forEach( y => {
      tileForeground( config, ctx, +d.key, +y.key, gw, gh, scale_opacity(y.value) )
    })
  });
};

const renderTiledQueue = (config, pc, foregroundQueue) => () => {
  //pc.renderBrushed.queue();
  //pc.renderMarked.queue();
  foregroundQueue(config.data);
};

export default renderTiled;

export { tileForeground, renderTiledQueue };
