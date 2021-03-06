import d3 from 'd3';
import _ from 'lodash';
export default function ChartTitleFactory(Private) {

  const defaults = {
    style: {
      color: '#eee'
    },
    categoryLines: false,
    valueAxis: undefined,
  };

  class ChartGrid {
    constructor(handler, gridConfig) {
      if (!gridConfig) return;
      this._handler = handler;
      this._values = _.defaultsDeep({}, gridConfig, defaults);
    }

    drawLine(svg, tick, axis, width, height) {
      const isHorizontal = axis.axisConfig.isHorizontal();
      const scale = axis.getScale();
      svg.append('path')
        .attr('d', () => {
          const x0 = isHorizontal ? tick : 0;
          const x1 = isHorizontal ? tick : width;
          const y0 = !isHorizontal ? tick : 0;
          const y1 = !isHorizontal ? tick : height;
          const d3Line = d3.svg.line()
            .x(d => isHorizontal ? scale(d[0]) : d[0])
            .y(d => !isHorizontal ? scale(d[1]) : d[1]);
          return d3Line([[x0, y0], [x1, y1]]);
        })
        .attr('fill', 'none')
        .attr('stroke', this.get('style.color'))
        .attr('stroke-width', 1);
    }

    drawCategoryLines(svg, width, height) {
      const axis = this._handler.categoryAxes[0];
      axis.getScale().ticks().forEach(tick => {
        this.drawLine(svg, tick, axis, width, height);
      });
    }

    drawValueLines(svg, width, height) {
      const axis = this._handler.valueAxes.find(axis => axis.axisConfig.get('id') === this.get('valueAxis'));
      axis.getScale().ticks().forEach(tick => {
        this.drawLine(svg, tick, axis, width, height);
      });
    }

    draw(width, height) {
      const self = this;
      return function (selection) {
        if (!self._values) return;
        selection.each(function () {
          if (self.get('categoryLines')) self.drawCategoryLines(d3.select(this), width, height);
          if (self.get('valueAxis', false)) self.drawValueLines(d3.select(this), width, height);
        });
      };
    }

    get(property, defaults) {
      if (_.has(this._values, property) || typeof defaults !== 'undefined') {
        return _.get(this._values, property, defaults);
      } else {
        throw new Error(`Accessing invalid config property: ${property}`);
        return defaults;
      }
    }

    set(property, value) {
      return _.set(this._values, property, value);
    }
  }

  return ChartGrid;
}
