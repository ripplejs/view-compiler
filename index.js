var Compiler = require('compiler');
var each = require('each');
var attrs = require('attributes');

module.exports = function(template) {

  /**
   * Return a plugin
   *
   * @param {View} View
   */
  return function(View) {

    /**
     * Compiler that renders binds the view to
     * the DOM and manages the bindings
     *
     * @type {Compiler}
     */
    var compiler = new Compiler();

    /**
     * Set the compiler on the view when it
     * is created. This means the instances will
     * have a reference to the compiler
     */
    View.on('created', function(){
      this.compiler = compiler;
    });

    /**
     * Unmount when the view is destroyed
     */
    View.on('destroy', function(){
      this.unmount();
    });

    /**
     * Add a component
     *
     * @param {String} match
     * @param {Function} fn
     *
     * @return {View}
     */
    View.compose = function(match, Component) {
      compiler.component(match, function(node, view){

        var props = {};
        each(attrs(node), function(name, value){
          props[name] = view.interpolate(value);
        });

        var component = Component.create({
          owner: view,
          props: props
        });

        each(attrs(node), function(name, value){
          view.interpolate(value, function(val){
            component.props.set(name, val);
          });
        });

        component.mount(node, {
          replace: true,
          template: (node.innerHTML !== "") ? node.innerHTML : null
        });

        view.on('destroy', function(){
          component.destroy();
        });

      });
      return this;
    };

    /**
     * Add a directive
     *
     * @param {String|Regex} match
     * @param {Function} fn
     *
     * @return {View}
     */
    View.directive = function(match, fn) {
      compiler.directive(match, fn);
      return this;
    };

    /**
     * Append this view to an element
     *
     * @param {Element} node
     *
     * @return {View}
     */
    View.prototype.mount = function(node, options) {
      options = options || {};
      View.emit('before mount', this, node, options);
      this.emit('before mount', node, options);
      var comp = options.compiler || compiler;
      var html = options.template || template;
      if(!this.el) {
        this.el = comp.render(html, this);
      }
      if(options.replace) {
        node.parentNode.replaceChild(this.el, node);
      }
      else {
        node.appendChild(this.el);
      }
      View.emit('mount', this, node, options);
      this.emit('mount', node, options);
      return this;
    };

    /**
     * Remove the element from the DOM
     *
     * @return {View}
     */
    View.prototype.unmount = function() {
      if(!this.el || !this.el.parentNode) return this;
      this.el.parentNode.removeChild(this.el);
      this.el = null;
      View.emit('unmount', this);
      this.emit('unmount');
      return this;
    };

  };
};