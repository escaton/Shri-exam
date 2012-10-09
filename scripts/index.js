$('HTML').addClass('JS');
$(function() {
	var schedule_empty = $('.schedule_empty');
	var schedule = $('.schedule');
	if ('localStorage' in window && window['localStorage'] !== null) {
		var store = window.localStorage;
		var Schedule;
		function Schedule_init() {
			Date.prototype.getRuDay = function () {
				return (this.getDay() + 6) % 7;
			}
			var DaysOfWeek = ["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];
			var DaysOfWeekFull = ["Понедельник","Вторник","Среда","Четверг","Пятница","Суббота","Воскресенье"];
			var startDate = new Date(Schedule.startDate);
			var startDateDay = startDate.getRuDay();
			var endDate = new Date(Schedule.endDate);
			var endDateDay = endDate.getRuDay();
			var currentDate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
			var duration = (endDate-startDate)/(1000*60*60*24) + 1;
			var weeks = Math.ceil(duration/7);
			var weeksToCurrent = Math.floor((new Date()-new Date(startDate).setDate(startDate.getDate()-startDateDay))/(1000*60*60*24));
			var daysToCurrent = weeksToCurrent%7;
			weeksToCurrent = Math.floor(weeksToCurrent/7);
			if (startDateDay > endDateDay) weeks++;
			var currentWeek = 0;
			var schedule_body = $('.schedule_body', schedule);
			var schedule_day_container = $('.schedule_day_container', schedule_body);
			schedule.css({'visibility':'hidden','display':'block'});
			var schedule_body_width = schedule_body.width();
			schedule_day_container.width(schedule_body_width*weeks);
			schedule.css({'visibility':'visible','display':'none'});
			for (var week=0;week<weeks;week++) {
				for (var dayInWeek=0;dayInWeek<7;dayInWeek++) {
					var day = $('<div>')
						.addClass('schedule_day_col');
					var day_header = $('<div>')
						.addClass('schedule_day_header')
						.text(DaysOfWeek[dayInWeek]);
					if (dayInWeek > 4) day.addClass('schedule_day_weekend');
					if (week == weeksToCurrent && dayInWeek == daysToCurrent) day.addClass('schedule_day_current');
					if ((week == 0 && dayInWeek < startDateDay) || (week == weeks-1 && dayInWeek > endDateDay)) {
						day.addClass('schedule_day_skip');
					};
					day
						.append(day_header)
						.appendTo(schedule_day_container);
				}
			}
			$('.schedule_nav')
				.click(function() {
					if (!schedule_day_container.is(':animated')) {
						var elem = $(this);
						var dir1 = '+';
						var dir2 = '-';
						var canswitch = currentWeek>0;
						if (elem.hasClass('schedule_nav_right')) {
							dir1 = '-';
							dir2 = '+';
							canswitch = currentWeek<weeks-1;
						}
						if (canswitch) {
							schedule_day_container.animate({'left':dir1+'='+schedule_body_width+'px'}, 400);
							currentWeek = currentWeek+Number(dir2+'1');
						} else {
							schedule_day_container
								.animate({'left':dir1+'=50px'}, 200)
								.animate({'left':dir2+'=50px'}, 200);
						}
					}
					return false;
				})
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
			$.datepicker.setDefaults($.datepicker.regional['']);
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
					var date1 = new Date($(".schedule_start_date", schedule_create_form).attr('value').replace(/(\d+).(\d+).(\d+)/, '$3/$2/$1'));
					var date2 = new Date($(".schedule_end_date", schedule_create_form).attr('value').replace(/(\d+).(\d+).(\d+)/, '$3/$2/$1'));
					Schedule = {
						startDate : date1,
						endDate : date2
					};
					store['Schedule'] = JSON.stringify(Schedule);
					schedule_empty.fadeOut(200, function() {
						Schedule_init();
					});
				})
		} else {
			schedule_empty.css({"display" : "none"});
			Schedule = JSON.parse(store['Schedule'])
			Schedule_init();
		}
	} else {
		$('.schedule_empty_message', schedule_empty).text("Браузер не поддерживает localStorage");
	}
});
