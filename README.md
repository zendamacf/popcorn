# popcorn

~~Online demo~~ _TODO_

## CDN

Currently just hosted on GitHub [here](https://raw.githubusercontent.com/zendamacf/popcorn/master/dist/popcorn.min.js).

## Get Started

First, you'll need an array of seats. Each seats needs to be an object with
the following keys (__all keys are optional__):

* `id`: _(string)_ The label for the seat (e.g. A1). If this isn't provided, an empty space is added instead of a seat.
* `booked`: _(boolean)_ If the seat has been booked already.
* `unavailable`: _(boolean)_ If the seat is unavailable.

Next, initialise with the minimum required parameters:

```js
const popcorn = new window.Popcorn({
    elem: '#elem',  // Selector for your element
    width: 1000,  // Width of the canvas
    height: 500,  // Height of the canvas
    rowWidth: 12,  // Maximum number of seats per row
    maxSeats: 2,  // Maximum number of seats to select
    seatList: seats,
});
```

## Events

```js
popcorn.on(eventName, callbackFunction);
```

The callback function will receive an event object with the `detail` property populated with relevant data.

There are 3 types of events available:

* `popcorn.selectseat`: Triggered when selecting a seat. _Event data contains seat label (`id`) & total count of selected seats (`total`)_.
* `popcorn.deselectseat`: Triggering when deselecting a seat. _Event data contains seat label (`id`) & total count of selected seats (`total`)_.
* `popcorn.maxseats`: Triggered when clicking on a seat, but the maximum number of seats has already been reached. _Event data contains total count of selected seats (`total`)_.

## Additional Properties & Methods

```js
// Get an array of seat labels selected
popcorn.selected;

// Set the selected seats
popcorn.selected = ['A1', 'A2', 'A3'];

// Destroy this popcorn instance
popcorn.destroy();
```