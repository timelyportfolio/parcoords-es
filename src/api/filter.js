import { matchArray } from 'searchjs';

const filterUpdated = (config, pc, events) => newSelection => {
  config.brushed = newSelection;
  //events.call('filter', pc, config.brushed);
  pc.renderBrushed();
};

// filter data much like a brush but from outside of the chart
const filter = (config, pc, events) =>
  function(filters = null) {
    // will reset if null which goes against most of the API
    //   need to think this through but maybe provide filterReset like brushReset
    //   as a better alternative
    config.filters = filters;
    filterUpdated(config, pc, events)(pc.selected());

    return this;
  };

export default filter;