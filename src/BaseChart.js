import Enums from './Enums';
import BaseUtils from './BaseUtils';
import {timeFormat} from 'd3';

  /**
   * The base chart is a simple object that contains methods that will be merged into any of the d3by5 charts
   * @type {Object}
   *       - height - setter/getter for the chart height
   *       - width  - setter/getter for the chart width
   *       - data   - setter/getter for the indata of the chart
   *       - color
   *       - padding
   *       - margin
   *
   * Usage:
   *    calling any of the functions without a value will return the currently set value
   *    calling with a value will set the value on the target and return the target object (the chart that implements it)
   */
export default class BaseChart extends BaseUtils {

  constructor () {
    super();
    this.baseOptions = {
      margin: {
                top: 0,
                right: 0,
                bottom: 0,
                left: 0
              },
      width: 640,
      height: 400,
      padding: 5,
      color: '',
      idPrefix: 'id-',
      on: [],
      valuesFormat: null,
      theme: {
        textColor: '#333'
      },

    }
  }


  /**
   * Sets the color
   * @param  {Number} value - the color
   * @return {instance}     - the chart
   */
  color (value) {
    if (!arguments.length) return this.options.color;
    if (this.options.data) {
      this.options.color = this._getColorAccessor(this.options.data, value);
    } else {
      this.options.color = value;
    }
    return this;
  }

    /**
     * Sets the chart-padding
     * @param  {Number} value - the padding of the chart
     * @return {Mixed}        - the value or chart
     */
  padding(value) {
    if (!arguments.length) return this.options.padding;
    this.options.padding = value;
    return this;
  }

  /**
   * Sets the width of a chart
   * @param  {Number} value - the width of the chart
   * @return {Mixed}        - the value or this
   */
  width(value) {
    if (!arguments.length) return this.options.width;
    this.options.width = value;
    return this;
  }

  /**
   * Sets the height of a chart
   * @param  {Number} value - the height of the chart
   * @return {Mixed}        - the value or chart
   */
  height(value) {
    if (!arguments.length) return this.options.height;
    this.options.height = value;
    return this;
  }

  /**
   * Sets the data on a chart
   * @param  {Number} value - the data used to draw the chart
   * @return {Mixed}        - the value or chart
   */
  data (value) {
    if (!arguments.length) return this.options.data;
    this.options.data = this._parseData(value);
    if (typeof this.updateData === 'function') {
      this.updateData();
    }
    return this;
  }

  /**
   * Sets the marging of a chart, this can be a single value or an object/array
   * @param  {Mixed} argument[0]  - a margin fragment or complete margin object
       *                             Number - a single number, used for margin top, or matched as below
       *                             Object - a valid margins object {top, right, bottom, left}
   * @param  {Number} argument[1] - number describing right or horizontal margin
   * @param  {Number} argument[2] - number describing bottom margin
   * @param  {Number} argument[3] - number describing left margin
   *
   * @return {Mixed}       - the margin object or chart
   */
  margin (...rest) {
    if (!arguments.length) return this.options.margin;
    this.options.margin = this._createMargins.apply(this, arguments);
    return this;
  }

  /**
   * Sets a theme if applicable, handling theis will be up to the pupporting chart
   * @param  {Mixed} value - A theme object if supplied, if no value, the current value is supplied
   * @return {Mixed}       - The theme object or the chart
   */
  theme (value) {
    if (!arguments.length) return this.options.theme;
    this.options.theme = value;
    return this;
  }

  /**
   * Sets a listener on the clices of the chart
   * @param  {String} action    - The type of action to listen to ( ie. 'click', 'mouseover')
   * @param  {Function} method  - A bound method to be called when the action is invoked, passes the datum for this specific slice
   * @return {Mixed}            - The value or chart
   */
  on(action, method) {
    if (!arguments.length || arguments.length === 1) return this.options.on;
    action = action.toLowerCase();
    this.off(action, method);
    this.options.on.push({action: action, method: method});
    return this;
  }

  off(action, method) {
    var onIndex = []
      , i ;

    for(i = 0; i < this.options.on.length; i += 1) {
      if (action === this.options.on[i].action) {
        if (method) {
          if (method === this.options.on[i],method) {
            onIndex.push(i);
          }
        } else {
          onIndex.push(i);
        }
      }
    }
    // remove all in the idexes
    for (i = onIndex.length; i > 0; i -= 1) {
      this.options.on.splice(i, 1);
    }
    return this;
  }


  /**
   * Turns the labels on and off by fixin them
   * @param  {String} value - the position of labels or null (Enums.LABEL_INSIDE| Enums.LABEL_OUTSIDE | Enums.LABEL_FIT | Enums.LABEL_NONE)
   *                          labels will be positioned separately on the
   * @return {Mixed}        - the value or chart
   */
  labelPosition(value) {
    if (!arguments.length) return this.options.labelPosition;
    this.validateOption('labelPosition', value, [Enums.LABEL_INSIDE, Enums.LABEL_OUTSIDE, Enums.LABEL_FIT , Enums.LABEL_NONE]);

    return this;
  }


  labelFormat(value) {
    return arguments.length ? (this.setFormat('labelFormat', value), this) : this.options.labelFormat;
  }
  labelAlign(value) {
    return arguments.length ? (this.validateOption('labelAlign', value, ['left', 'right', 'top', 'bottom']), this) : this.options.labelAlign;
  }
  labelColor(value) {
    return arguments.length ? (this.options.labelColor = value, this) : this.options.labelColor;
  }
  valuesPosition(value) {
    return arguments.length ? (this.validateOption('valuesPosition', value, ['inside', 'outside', 'fit', 'none']) , this) : this.options.valuesPosition;
  }
  valuesAlign(value) {
    return arguments.length ? (this.validateOption('valuesAlign', value, ['left', 'right']), this) : this.options.valuesAlign;
  }
  valuesColor(value) {
    return arguments.length ? (this.options.valuesColor = value, this) : this.options.valuesColor;
  }
  valuesFormat(value) {
    return arguments.length ? (this.options.valuesFormat = value, this) : this.options.valuesFormat;
  }

  setFormat(prop, value) {
    if (value) {
      const formatter = timeFormat(value);
    }
    // check it for data format
    // if the format func returns the input, if is messed up
    if (value && value === formatter(new Date())) {
      this.options[prop] = null;
    } else {
      this.options[prop] = formatter;
    }
  }
  /**
   * TODO: IF this shit works and is useful, move to base utils or somwhere like that
   * A validator that checks if input to option setter is valid. Aborts with console error if not
   * @param  {string} option  the option to be set
   * @param  {string} value   the value to be set
   * @param  {array}  domain  options valid domain of values
   * @return {bool}           returns true or false
   */
  validateOption (option, value, domain) {

    value = String(value).toLowerCase();

    if(value.indexOf(domain) !== -1) {
      this.options[option] = value;
      return true;
    }
    console.error('Error setting ' + option +': "' + value, '" is invalid. Valid input is: "' + domain.join('", "') +'"');
    return false;
  }
}