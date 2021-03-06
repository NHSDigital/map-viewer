/**
 * MessageBox
 */
L.Control.Messagebox = L.Control.extend({
  options: {
    position: "topright"
    //timeout: 3000
  },

  onAdd: function(map) {
    this._container = L.DomUtil.create(
      "div",
      "leaflet-control-messagebox sns-popup"
    );
    //L.DomEvent.disableClickPropagation(this._container);
    return this._container;
  },

  show: function(message, timeout) {
    var elem = this._container;
    elem.innerHTML = message;
    elem.style.display = "block";
  }
});

L.Map.mergeOptions({
  messagebox: false
});

L.Map.addInitHook(function() {
  if (this.options.messagebox) {
    this.messagebox = new L.Control.Messagebox();
    this.addControl(this.messagebox);
  }
});

L.control.messagebox = function(options) {
  return new L.Control.Messagebox(options);
};
