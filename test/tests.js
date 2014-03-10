var assert = require('assert');
var view = require('view');
var compiler = require('view-compiler');
var interpolate = require('view-interpolate');
var dom = require('fastdom');

describe('view-compiler', function(){
  var View, One, Two;

  beforeEach(function () {
    View = view()
      .use(interpolate)
      .use(compiler('<div></div>'));

    One = view()
      .use(interpolate)
      .use(compiler('<div></div>'));

    Two = view()
      .use(interpolate)
      .use(compiler('<div></div>'));
  });

  it('should mount to an element and fire an event', function(done){
    var view = new View();
    view.on('mount', function(){
      assert(document.body.contains(view.el));
      done();
    })
    view.mount(document.body);
    view.unmount();
  })

  it('should unmount and fire an event', function(done){
    var view = new View();
    view.mount(document.body);
    view.on('unmount', function(){
      done();
    })
    view.unmount();
  })

  it('should have a different compiler for each view', function () {
    var one = new One();
    var two = new Two();
    assert(one.compiler !== two.compiler);
  });

  it('should have the same compiler for each instance', function () {
    var one = new One();
    var two = new One();
    assert(two.compiler === one.compiler);
  });

  describe('rendering', function () {
    var one, two, rendered, target;

    beforeEach(function () {
      target = document.createElement('div');
      document.body.appendChild(target);
      rendered = 0;
      one = new View();
      two = new View();
      var render = one.compiler.render;
      one.compiler.render = function(){
        rendered += 1;
        return render.apply(this, arguments);
      };
    });

    afterEach(function () {
      one.unmount();
      two.unmount();
      if(target.parentNode) target.parentNode.removeChild(target);
    });

    it('should mount to an element and render', function () {
      one.mount(document.body);
      assert(rendered === 1);
      assert(document.body.lastElementChild === one.el);
    });

    it('should not re-render when mounting another element', function () {
      one.mount(document.body);
      one.mount(target);
      assert(target.lastElementChild === one.el);
      assert(rendered === 1);
    });

    it('should replace an element', function(){
      assert( target.parentNode != null );
      one.mount(target, {
        replace: true
      });
      assert( target.parentNode == null );
    });

    it('should re-render if unmounted', function () {
      one.mount(target);
      one.unmount();
      one.mount(target);
      assert(rendered === 2);
    });

    it('should not unmount if not mounted', function () {
      var count = 0;

      one.on('unmount', function(){
        count += 1;
      });

      one
        .mount(target)
        .unmount(target)
        .unmount(target);

      assert(count === 1);
    });

  });


  describe('composing', function () {
    var child, items;

    beforeEach(function () {
      var items = ['red','blue','green'];

      Parent = view()
        .use(interpolate)
        .use(compiler('<div><dummy id="bar" color="{{color}}" items="{{items}}"></dummy></div>'));

      Child = view()
        .use(interpolate)
        .use(compiler('<div id="{{id}}" color="{{color}}" hidden="{{hidden}}">{{length}}</div>'));

      Child.on('created', function(){
        var self = this;
        assert(this.props.get('id') === 'bar');
        assert(this.props.get('color') === 'red');
        assert(this.props.get('items') === items);
        this.state.set('id', this.props.get('id'));
        this.state.set('length', this.props.get('items').length);
        this.props.change('color', function(val){
          self.set('color', val);
        });
      });

      Parent.on('created', function(){
        this.state.set({
          'color': 'red',
          'items': items,
          'hidden': false
        });
      });

      Parent.compose('dummy', Child);

      child = new Parent();
      child.mount(document.body);
    });

    afterEach(function () {
      child.unmount();
    });

    it('should pass data to the component', function (done) {
      dom.defer(function(){
        assert(child.el.firstChild.id === "bar");
        done();
      });
    });

    it('should pass data as an expression to the component', function (done) {
      dom.defer(function(){
        assert(child.el.firstChild.getAttribute('color') === "red");
        done();
      });
    });

    it('should update data passed to the component', function (done) {
      child.set('color', 'blue');
      dom.defer(function(){
        assert(child.el.firstChild.getAttribute('color') === "blue");
        done();
      });
    });

    it('should use a custom template', function (done) {
      Parent = view()
        .use(interpolate)
        .use(compiler('<div><dummy>{{color}}</dummy></div>'));

      Child = view()
        .use(interpolate)
        .use(compiler('<div></div>'));

      Parent.on('created', function(){
        this.state.set({
          'color': 'red'
        });
      });

      Parent.compose('dummy', Child);

      child = new Parent();
      child.mount(document.body);

      dom.defer(function(){
        assert(child.el.innerHTML === 'red');
        done();
      });

    });

    it('should allow a component as the root element', function (done) {
      Parent = view()
        .use(interpolate)
        .use(compiler('<dummy></dummy>'));

      Child = view()
        .use(interpolate)
        .use(compiler('<div>{{color}}</div>'));

      Parent.on('created', function(){
        this.state.set({
          'color': 'red'
        });
      });

      Parent.compose('dummy', Child);

      child = new Parent();
      child.mount(document.body);

      dom.defer(function(){
        assert(child.el.outerHTML === '<div>red</div>');
        done();
      });
    });

    describe('looking up state from the parent', function () {
      it('should lookup data from the parent', function (done) {
        dom.defer(function(){
          assert(child.el.firstChild.hasAttribute("hidden") === false);
          done();
        });
      });
      it('should update', function(done){
        child.set('hidden', true);
        dom.defer(function(){
          assert(child.el.firstChild.hasAttribute("hidden") === true);
          done();
        });
      });
    });

  });

});