$('#ageInput').datepicker({});

  jQuery('#fameRating').customSlider({
    start: [0],
    connect: true,
    tooltips: [true],
    range: {
      'min': 0,
      'max': 5
    }
  });

  jQuery('#shards-custom-slider').customSlider({
    start: [0],
    connect: true,
    tooltips: [true],
    range: {
      'min': 0,
      'max': 100
    }
  });

  jQuery('#shards-custom-slider2').customSlider({
    start: [25, 50],
    tooltips: [true, true],
    connect: true,
    range: {
      'min': 0,
      'max': 100
    }
  });

