$('HTML').addClass('JS');
$(function() {
	var schedule_empty = $('.schedule_empty');
	var schedule = $('.schedule');
	if ('localStorage' in window && window['localStorage'] !== null) {
		var store = window.localStorage;
		function Schedule_init() {
			schedule.fadeIn(200);
		};
		if (!store['Schedule']) {
			var schedule_create_new = $('.schedule_create_new', schedule_empty);
			var schedule_create_form = $('.schedule_create_form');
			var schedule_dates = $('.datepicker', schedule_empty);
			schedule_create_new
				.click(function() {
					schedule_create_new.fadeOut(200, function() {
						schedule_create_new.next('.schedule_create_form').fadeIn(200);
					})
				});
			$.datepicker.setDefaults( $.datepicker.regional[''] );
			schedule_dates.datepicker($.datepicker.regional['ru']);
			$('.schedule_create_form_cancel', schedule_empty)
				.click(function() {
					schedule_create_form.fadeOut(200, function() {
						schedule_create_form.prev('.schedule_create_new').fadeIn(200);
					})
				});
			$('.schedule_create_form_accept', schedule_create_form)
				.click(function() {
					//нужна проверка значений
					var Schedule = {
						startDate : $(".schedule_start_date", schedule_create_form).attr('value'),
						endDate : $(".schedule_end_date", schedule_create_form).attr('value')
					};
					store['Schedule'] = JSON.stringify(Schedule);
					schedule_empty.fadeOut(200, function() {
						Schedule_init();
					});
				})
		} else {
			schedule_empty.css({"display" : "none"});
			var Schedule = JSON.parse(store['Schedule'])
			Schedule_init();
		}
	} else {
		$('.schedule_empty_message', schedule_empty).text("Браузер не поддерживает localStorage");
	}
});
