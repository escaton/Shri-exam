$('HTML').addClass('JS');
$(function() {
	var layout_empty = $('.b-schedule__layout_empty');
	var layout_exist = $('.b-schedule__layout_exist');
	if ('localStorage' in window && window['localStorage'] !== null) {
		var store = window.localStorage;
		var Schedule = {};
		if (!store['Schedule']) {
			var admin = {
				create_new : $('.b-admin__create-new', layout_empty),
				edit_form : $('.b-admin__edit-form', layout_empty),
				date_input : $('.b-admin__date-input', layout_empty)
			}
			admin.create_new
				.click(function() {
					admin.create_new.fadeOut(200, function() {
						admin.edit_form.fadeIn(200);
					})
				});
			$.datepicker.setDefaults($.datepicker.regional['']);
			admin.date_input.datepicker($.datepicker.regional['ru']);
			$('.b-admin__form-control_cancel', admin.edit_form)
				.click(function() {
					admin.edit_form.fadeOut(200, function() {
						admin.edit_form.prev('.b-admin__create-new').fadeIn(200);
					})
				});
			$('.b-admin__form-control_create', admin.edit_form)
				.click(function() {
					//нужна проверка значений
					var date1 = new Date($(".b-admin__date-input_start", admin.edit_form).attr('value').replace(/(\d+).(\d+).(\d+)/, '$3/$2/$1'));
					var date2 = new Date($(".b-admin__date-input_end", admin.edit_form).attr('value').replace(/(\d+).(\d+).(\d+)/, '$3/$2/$1'));
					Schedule = {
						startDate : date1,
						endDate : date2
					};
					store['Schedule'] = JSON.stringify(Schedule);
					layout_empty.fadeOut(200, function() {
						Schedule_init();
					});
				})
		} else {
			layout_empty.css({"display" : "none"});
			Schedule.fromStorage = JSON.parse(store['Schedule']);
			Schedule_init();
		}
	} else {
		$('.b-schedule__message', layout_empty).text("Браузер не поддерживает localStorage");
	}

	function Schedule_init() {
		Date.prototype.getRuDay = function () {
			return (this.getDay() + 6) % 7;
		}
		Schedule.Data = {
			DaysOfWeek : ["Пн","Вт","Ср","Чт","Пт","Сб","Вс"],
			DaysOfWeekFull : ["Понедельник","Вторник","Среда","Четверг","Пятница","Суббота","Воскресенье"],
			startDate : new Date(Schedule.fromStorage.startDate),
			endDate : new Date(Schedule.fromStorage.endDate),
			startDateDay : null,
			endDateDay : null,
			duration : null,
			weeks : null,
			daysToCurrent : null,
			weeksToCurrent : null,
			currentWeek : 0,
			body_width : null,
			event_info_width : 300,
			day_container : $('.b-schedule__day-container', layout_exist),
			event_info : $('.b-event-info', layout_exist)
		};
		Schedule.Data.startDateDay = Schedule.Data.startDate.getRuDay();
		Schedule.Data.endDateDay = Schedule.Data.endDate.getRuDay();
		Schedule.Data.duration = (Schedule.Data.endDate-Schedule.Data.startDate)/(1000*60*60*24) + 1;
		Schedule.Data.weeks = Math.ceil(Schedule.Data.duration/7);
		if (Schedule.Data.startDateDay > Schedule.Data.endDateDay) Schedule.Data.weeks++;
		Schedule.Data.daysToCurrent = Math.floor((new Date()-Schedule.Data.startDate.setDate(Schedule.Data.startDate.getDate()-Schedule.Data.startDateDay))/(1000*60*60*24));
		Schedule.Data.weeksToCurrent = Math.floor(Schedule.Data.daysToCurrent/7);
		Schedule.Data.daysToCurrent = Schedule.Data.daysToCurrent%7;
		layout_exist.css({'visibility':'hidden','display':'block'});
		Schedule.Data.body_width = $('.b-schedule__body', layout_exist).width();
		Schedule.Data.day_container.width(Schedule.Data.body_width*Schedule.Data.weeks + Schedule.Data.event_info_width);
		layout_exist.css({'visibility':'visible','display':'none'});

		for (var week=0; week<Schedule.Data.weeks; week++) {
			for (var dayInWeek=0; dayInWeek<7; dayInWeek++) {
				var day = $('<div>')
					.addClass('b-day');
				var day_header = $('<div>')
					.addClass('b-day__header')
					.text(Schedule.Data.DaysOfWeek[dayInWeek])
					.appendTo(day);
				if (dayInWeek > 4) day.addClass('b-day_weekend');
				if (week == Schedule.Data.weeksToCurrent && dayInWeek == Schedule.Data.daysToCurrent) day.addClass('b-day_current');
				if ((week == 0 && dayInWeek < Schedule.Data.startDateDay) || (week == Schedule.Data.weeks-1 && dayInWeek > Schedule.Data.endDateDay)) {
					day.addClass('b-day_skip');
				} else {
					var add_control = $('<div>')
						.addClass('b-admin')
						.append($('<div>')
							.text("+")
							.addClass('b-admin__schedule_add_event')
							.click(function() {
							})
						)
						.appendTo(day_header);
				}
				day.appendTo(Schedule.Data.day_container);
			}
		};
		$('.b-nav__nav-unit')
			.click(function() {
				if (!Schedule.Data.day_container.is(':animated')) {
					var elem = $(this);
					var dir1 = '+';
					var dir2 = '-';
					var canswitch = Schedule.Data.currentWeek>0;
					if (elem.hasClass('b-nav__nav-unit_right')) {
						dir1 = '-';
						dir2 = '+';
						canswitch = Schedule.Data.currentWeek<Schedule.Data.weeks-1;
					}
					if (canswitch) {
						Day_container_move_to_week(dir1);
						Schedule.Data.currentWeek = Schedule.Data.currentWeek+Number(dir2+'1');
					} else {
						Schedule.Data.day_container
							.animate({'left':dir1+'=50px'}, 200)
							.animate({'left':dir2+'=50px'}, 200);
					}
				}
				return false;
			});
		layout_exist.fadeIn(200);
	};
	function Day_container_move_to_week (direction) {
		Schedule.Data.day_container.animate({'left':direction+'='+Schedule.Data.body_width+'px'}, 400);
	};
});