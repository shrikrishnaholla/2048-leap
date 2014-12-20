function LeapInputManager() {
  this.events = {};

  this.listen();
}

LeapInputManager.prototype.on = function (event, callback) {
  if (!this.events[event]) {
    this.events[event] = [];
  }
  this.events[event].push(callback);
};

LeapInputManager.prototype.emit = function (event, data) {
  var callbacks = this.events[event];
  if (callbacks) {
    callbacks.forEach(function (callback) {
      callback(data);
    });
  }
};

LeapInputManager.prototype.listen = function () {
  var self = this;

  // Store frame for motion functions
  var previousFrame = null;
  var paused = false;
  var pauseOnGesture = false;

  // Setup Leap loop with frame callback function
  var controllerOptions = {enableGestures: true};

  // to use HMD mode:
  // controllerOptions.optimizeHMD = true;

  Leap.loop(controllerOptions, function(frame) {
    // Frame motion factors
    if (previousFrame && previousFrame.valid) {
      var translation = frame.translation(previousFrame);
      // frameString += "Translation: " + vectorToString(translation) + " mm <br />";

      var rotationAxis = frame.rotationAxis(previousFrame);
      var rotationAngle = frame.rotationAngle(previousFrame);
      // frameString += "Rotation axis: " + vectorToString(rotationAxis, 2) + "<br />";
      // frameString += "Rotation angle: " + rotationAngle.toFixed(2) + " radians<br />";

      var scaleFactor = frame.scaleFactor(previousFrame);
      // frameString += "Scale factor: " + scaleFactor.toFixed(2) + "<br />";
    }

    if (frame.gestures.length > 0) {
      // for (var i = 0; i < frame.gestures.length; i++) {
        if (!paused) {
          var gesture = frame.gestures[0];

          switch (gesture.type) {
            case "circle":
              if ( confirm("Do you want to restart the game?") )
                self.emit("restart");
              break;
            case "swipe":
              var normalized_vector = normalize_vector(gesture.direction, 1);
              console.log("normalized_vector:" + normalized_vector);
              var swipe_direction = get_direction_from_vector(normalized_vector);
              var direction_mapped = swipe_direction ? map_string_to_id(swipe_direction) : -1;
              if (direction_mapped == 4) {
                self.emit("keepPlaying");
              } else if (direction_mapped > 0 ) {
                self.emit("move", direction_mapped);
              }
              break;
          }
          self.pause(1000);
        }
      // }
    }
    // Store frame for motion functions
    previousFrame = frame;
  })
}

LeapInputManager.prototype.pause = function(time_frame) {
  var self = this;
  this.paused = true;
  setTimeout(function(){
    self.paused = false;
  }, time_frame);
};

function normalize_vector(vector, digits) {
  if (typeof digits === "undefined") {
    digits = 1;
  }
  return vector.map(function(v) { return (Math.ceil(parseFloat(v.toFixed(digits)) * 10) / 10.0) });
}

function get_direction_from_vector (vector) {
  if (vector[0] < -0.5) { return "left" };
  if (vector[0] > 0.5) { return "right" };
  if (vector[1] < -0.5) { return "down" };
  if (vector[1] > 0.5) { return "up" };
  if (vector[2] < -0.5) { return "front" };
}

function map_string_to_id (string) {
  switch(string.toLowerCase()) {
    case "up" : case "u" : return 0; break;
    case "right" : case "r" : return 1; break;
    case "down" : case "d" : return 2; break;
    case "left" : case "l" : return 3; break;
    case "front" : case "f" : return 4; break;
    default: return -1;
  }
}
