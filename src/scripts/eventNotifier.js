const EVENT_TYPE = { ALL: 0, SELECTED: 1, HIGHLIGHTED: 2, MOVE: 3 };

const SelectionEvent = function(eventTypeIn, identifiersIn) {
  this.eventType = eventTypeIn;
  this.identifiers = identifiersIn;
}

const returnFullID = function(sourceId) {
  //return full annotations with all different name
}
  
const Subscription = function(subscriberIn, callbackIn, eventType) {
  this.targetedID = [];
  const subscriber = subscriberIn;
  const callback = callbackIn;
  this.targetEventType = eventType;
  const _this = this;

  if (eventType === undefined)
    this.targetEventType = EVENT_TYPE.ALL;
  
  this.getEventType = function() {
    return eventType;
  }
  
  this.notify = function(source, eventType, ids) {
    if (source !== subscriber && (_this.targetEventType ===  EVENT_TYPE.ALL ||
        _this.targetEventType === eventType)) {
      //should support different type of id e.g lyph, name, fmas...
      //need a function that finds all relavant ids
      const event = new SelectionEvent(eventType, ids);
      callback(event);
    }
  }
}

exports.EventNotifier = function() {
  const subscriptions = [];
  
  this.publish = function(source, eventType, id) {
    for (let i = 0; i < subscriptions.length;i++) {
      subscriptions[i].notify(source, eventType, id);
    }
  }
  
  this.subscribe = function(subscriber, callbackFunction, eventType) {
    if (typeof callbackFunction === "function") {
      const subscription = new Subscription(subscriber, callbackFunction, eventType);
      subscriptions.push(subscription);
      return subscription;
    }
    return undefined;
  }
  
  this.unsubscribe = function(subscription) {
    for (let i = 0; i < subscriptions.length;i++) {
      if (subscription === subscriptions[i]) {
        subscriptions.splice(i, 1);
        return;
      }
    }
  }
}  

exports.EVENT_TYPE = EVENT_TYPE;
