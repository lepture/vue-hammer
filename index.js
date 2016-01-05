
var Hammer = require('hammerjs')

var customeEvents = {}

var VueHammer = {
  defauts: Hammer.defauts,
  gestures: ['tap', 'doubletap', 'pan', 'swipe', 'press', 'pinch', 'rotate']
}

VueHammer.install = function(Vue) {

  Vue.directive('hm', {
    params: ['hmOptions', 'hmDirection'],
    acceptStatement: true,

    bind: function() {
      if (!this.el.hammer) {
        // TODO: deal with hmOptions
        var options = this.params.hmOptions || VueHammer.defauts
        this.el.hammer = new Hammer.Manager(this.el, options)
      }
      var mc = this.mc = this.el.hammer
      var event = this.arg
      var custom = customeEvents[event]
      var recognizer

      if (custom) {
        // TODO: custom events
      } else if (!~VueHammer.gestures.indexOf(event)) {
        console.warn('Invalid v-hm event: ' + event)
      } else {
        recognizer = mc.get(event)
        if (!recognizer) {
          // TODO: options
          recognizer = new Hammer[capitalize(event)]()
          mc.add(recognizer)
        }
      }
    },

    update: function(handler) {
      var mc = this.mc
      var vm = this.vm
      var event = this.arg

      if (this.handler) {
        mc.off(event, this.handler)
      }

      this.handler = function(e) {
        vm.$event = e
        e.targetVM = vm
        handler.call(vm, e)
        vm.$event = null
      }

      mc.on(event, this.handler)
    },

    unbind: function() {
      this.mc.off(this.arg, this.handler)
      // destroy hammer manager
      if (!Object.keys(this.mc.handlers).length) {
        this.mc.destroy()
        this.el.hammer = null
      }
    }
  })
}

VueHammer.registerCustomEvent = function(event, options) {
  options.event = event
  customeEvents[event] = options
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

module.exports = VueHammer
