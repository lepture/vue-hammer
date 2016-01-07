
var Hammer = require('hammerjs')

var customeEvents = {}

var VueHammer = {
  defauts: Hammer.defauts,
  gestures: ['tap', 'doubletap', 'pan', 'swipe', 'press', 'pinch', 'rotate']
}

VueHammer.install = function(Vue) {

  Vue.directive('hm', {
    params: ['hm-options', 'hm-event-options'],
    acceptStatement: true,

    bind: function() {
      var options
      if (!this.el.hammer) {
        if (this.params.hmOptions) {
          options = parseParam(this.params.hmOptions)
        } else {
          options = VueHammer.defauts
        }
        this.el.hammer = new Hammer.Manager(this.el, options)
      }
      var mc = this.mc = this.el.hammer
      var event = this.arg
      var custom = customeEvents[event]
      var recognizer

      if (custom) {
        recognizer = new Hammer[capitalize(custom.type)](custom)
        recognizer.recognizeWith(mc.recognizers)
        mc.add(recognizer)
      } else if (!~VueHammer.gestures.indexOf(event)) {
        console.warn('Invalid v-hm event: ' + event)
      } else {
        recognizer = mc.get(event)
        if (!recognizer) {
          options = {}
          if (this.params.hmEventOptions) {
            options = parseParam(this.params.hmEventOptions)[event] || {}
            options = hammerOptions(options)
          }
          recognizer = new Hammer[capitalize(event)](options)
          recognizer.recognizeWith(mc.recognizers)
          mc.add(recognizer)
        }
      }
    },

    update: function(handler) {
      var mc = this.mc
      var vm = this.vm
      var event = this.arg
      var modifiers = this.modifiers

      if (this.handler) {
        mc.off(event, this.handler)
      }

      this.handler = function(e) {
        if (modifiers.stop) {
          e.stopPropagation()
        }
        if (modifiers.prevent) {
          e.preventDefault()
        }
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

  function parseParam(s) {
    s = Vue.parsers.expression.parseExpression(s)
    return s.get()
  }
}

VueHammer.registerCustomEvent = function(event, options) {
  options.event = event
  customeEvents[event] = options
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function hammerOptions(options) {
  var rv = {}
  Object.keys(options).forEach(function(k) {
    var value = options[k]
    if (/^[A-Z_]+$/.test(value)) {
      value = Hammer[value]
    }
    rv[k] = value
  })
  return rv
}

module.exports = VueHammer
