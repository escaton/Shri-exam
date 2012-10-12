$('HTML').addClass('JS');
$(function() {
	var layout_empty = $('.b-schedule__layout_empty');
	var layout_exist = $('.b-schedule__layout_exist');
	if ('localStorage' in window && window['localStorage'] !== null) {
		var store = window.localStorage;
		var Schedule = {};
		var Admin = {};
		if (store['Schedule']) {
			layout_empty.hide(0);
			Schedule_init();
			if (true) admin_init('exist');	
		} else {
			if (true) admin_init('empty');
		}
	} else {
		$('.b-schedule__message', layout_empty).text("Браузер не поддерживает localStorage");
	}
	function Schedule_init() {
		Date.prototype.getRuDay = function () {
			return (this.getDay() + 6) % 7;
		}
		Schedule.fromStorage = JSON.parse(store['Schedule']);
		Schedule.Data = {
			DaysOfWeek : ["Пн","Вт","Ср","Чт","Пт","Сб","Вс"],
			DaysOfWeekFull : ["Понедельник","Вторник","Среда","Четверг","Пятница","Суббота","Воскресенье"],
			MonthsFull : ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"],
			Months : ["янв", "фев", "марта", "апр", "мая", "июня", "июля", "авг", "сент", "окт", "нояб", "дек"],
			startDate : new Date(Schedule.fromStorage.startDate),
			endDate : new Date(Schedule.fromStorage.endDate),
			startDateDay : null,
			endDateDay : null,
			firstDate : null,
			duration : 0,
			weeks : 0,
			daysToCurrent : null,
			weeksToCurrent : null,
			currentWeek : 0,
			body_width : null,
			day_width : null,
			day_container : $('.b-schedule__day-container', layout_exist),
			event_info : {
				elem : $('.b-event-info', layout_exist),
				width : null,
				day : -1,
				date : null,
				pannel : $('.b-event-info__pannel', layout_exist),
				open : function(callback) {
					if (this.day%7>4) {
						Schedule.Data.day_container.animate({'left':'-='+(this.day%7-4)*Schedule.Data.day_width}, 400);
					};
					this.elem.animate({'width':this.width}, 400, callback);
				},
				close : function(callback) {
					if (this.day%7>4) {
						Schedule.Data.day_container.animate({'left':'+='+(this.day%7-4)*Schedule.Data.day_width}, 400);
					};
					this.day = -1;
					this.elem.animate({'width':0}, 400, callback);
				}
			},
			progress : $('.b-progress', layout_exist)
		};
		
		Schedule.Data.startDateDay = Schedule.Data.startDate.getRuDay();
		Schedule.Data.endDateDay = Schedule.Data.endDate.getRuDay();
		Schedule.Data.duration = (Schedule.Data.endDate-Schedule.Data.startDate)/(1000*60*60*24) + 1;
		Schedule.Data.firstDate = GetShiftedDate(Schedule.Data.startDate, (-1)*Schedule.Data.startDateDay);
		Schedule.Data.weeks = Math.ceil(Schedule.Data.duration/7);
		if (Schedule.Data.startDateDay > Schedule.Data.endDateDay) Schedule.Data.weeks++;
		Schedule.Data.daysToCurrent = Math.floor((new Date()-GetShiftedDate(Schedule.Data.startDate,(-1)*Schedule.Data.startDateDay))/(1000*60*60*24));
		Schedule.Data.weeksToCurrent = Math.floor(Schedule.Data.daysToCurrent/7);
		Schedule.Data.daysToCurrent = Schedule.Data.daysToCurrent%7;
		layout_exist.css({'visibility':'hidden','display':'block'});
		Schedule.Data.body_width = $('.b-schedule__body', layout_exist).width();
		Schedule.Data.day_width = Schedule.Data.body_width/7;
		Schedule.Data.event_info.width = Schedule.Data.day_width*2-1;
		Schedule.Data.event_info.pannel.width(Schedule.Data.event_info.width);
		Schedule.Data.event_info.elem.children('.b-event-info__pannel')
		Schedule.Data.day_container.width(Schedule.Data.body_width*Schedule.Data.weeks + Schedule.Data.event_info.width);
		layout_exist.css({'visibility':'visible','display':'none'});

		for (var week=0; week<Schedule.Data.weeks; week++) {
			for (var dayInWeek=0; dayInWeek<7; dayInWeek++) {
				var date = GetShiftedDate(Schedule.Data.firstDate, dayInWeek+week*7);
				BuildDay(date,week,dayInWeek,'new')
					.appendTo(Schedule.Data.day_container);
			}
			BuildProgressWeek(week)
				.appendTo(Schedule.Data.progress);
		};

		$('.b-nav__nav-unit')
			.click(function() {
				if (!Schedule.Data.day_container.is(':animated')) {
					var switchWeek = function(dir1, dir2) {
						if (canswitch) {
							Day_container_move(Schedule.Data.currentWeek+Number(dir1+'1'));
						} else {
							Schedule.Data.day_container
								.animate({'left': dir2+'=50px'}, 200)
								.animate({'left': dir1+'=50px'}, 200);
						}
					}
					var elem = $(this);
					var canswitch = Schedule.Data.currentWeek<Schedule.Data.weeks-1;
					if (elem.hasClass('b-nav__nav-unit_left')) {
						canswitch = Schedule.Data.currentWeek>0;
						switchWeek('-','+');
					} else {
						switchWeek('+','-');
					}
				}
				return false;
			});
		$('.b-event-info__close', Schedule.Data.event_info.elem)
			.click(function() {
				Schedule.Data.event_info.close();
			});
		if ((new Date() > Schedule.Data.startDate) && (new Date() < Schedule.Data.endDate)) {
			Day_container_move(Schedule.Data.weeksToCurrent, true);
		}
		layout_exist.fadeIn(200);
	};
	function admin_init(stage) {
		$('.b-admin').show(0);
		if (stage == 'empty') {
			Admin.schedule = {
				create_new : $('.b-admin__create-new', layout_empty),
				edit_form : $('.b-admin__edit-form', layout_empty),
				date_input : $('.b-admin__date-input', layout_empty)
			};
			Admin.schedule.create_new
				.click(function() {
					Admin.schedule.create_new.fadeOut(200, function() {
						Admin.schedule.edit_form.fadeIn(200);
					})
				});
			$.datepicker.setDefaults($.datepicker.regional['']);
			Admin.schedule.date_input.datepicker($.datepicker.regional['ru']);
			$('.b-admin__form-control_cancel', Admin.schedule.edit_form)
				.click(function() {
					Admin.schedule.edit_form.fadeOut(200, function() {
						Admin.schedule.edit_form.prev('.b-admin__create-new').fadeIn(200);
					})
				});
			$('.b-admin__form-control_create', Admin.schedule.edit_form)
				.click(function() {
					var date1 = new Date($(".b-admin__date-input_start", Admin.schedule.edit_form).attr('value').replace(/(\d+).(\d+).(\d+)/, '$3/$2/$1'));
					var date2 = new Date($(".b-admin__date-input_end", Admin.schedule.edit_form).attr('value').replace(/(\d+).(\d+).(\d+)/, '$3/$2/$1'));
					if (date2<date1) {
						alert("Что-то не так с датами");
						return false;
					}
					Schedule.fromStorage = {
						startDate : date1,
						endDate : date2,
						days : {}
					};
					store['Schedule'] = JSON.stringify(Schedule.fromStorage);
					layout_empty.fadeOut(200, function() {
						Schedule_init();
						admin_init('exist')
					});
					return false;
				});	
		} else {
			Admin.event_info = {
				startTime : {
					elem : $('.b-event-info__startTime', layout_exist),
					defaultval : "12:00"
				},
				endTime : {
					elem : $('.b-event-info__endTime', layout_exist),
					defaultval : "13:00"
				},
				reporter : {
					elem : $('.b-event-info__item_reporter', layout_exist),
					defaultval : "Докладчик"
				},
				title : {
					elem : $('.b-event-info__item_title', layout_exist),
					defaultval : "Тема доклада"
				},
				description : {
					elem : $('.b-event-info__item_description', layout_exist),
					defaultval : "Описание"
				},
				yaru : {
					elem : $('.b-event-info__link_yaru', layout_exist),
					defaultval : "http://clubs.ya.ru/"
				},
				presentation : {
					elem : $('.b-event-info__link_presentation', layout_exist),
					defaultval : "http://yadi.sk/"
				},
				video : {
					elem : $('.b-event-info__link_video', layout_exist),
					defaultval : "http://static.video.yandex.ru/"
				},
				video_download : {
					elem : $('.b-event-info__link_video-download', layout_exist), 
					defaultval : "http://yadi.sk/"
				}, 
			}
			$.each(Admin.event_info, function(index, item) {
				item.elem
					.attr('contenteditable','true')
					.toggleClass('b-event-info__item_editable')
					.text(item.defaultval);
			});
			$('.b-admin__form-control_save', Schedule.Data.event_info.pannel)
				.click(function() {
					//нужна проверка значений
					var event_day = $('.b-day', Schedule.Data.day_container).eq(Schedule.Data.event_info.day);
					var new_event = {
						day : event_day,
						date : event_day.data('date').getTime(),
						startTime : Admin.event_info.startTime.elem.text(),
						endTime : Admin.event_info.endTime.elem.text(),
						reporter : Admin.event_info.reporter.elem.text(),
						title : Admin.event_info.title.elem.text(),
						description : Admin.event_info.description.elem.text(),
						yaru : Admin.event_info.yaru.elem.text(),
						presentation : Admin.event_info.presentation.elem.text(),
						video : Admin.event_info.video.elem.text(),
						video_download : Admin.event_info.video_download.elem.text()
					};
					if (!Schedule.fromStorage.days[new_event.date]) Schedule.fromStorage.days[new_event.date] = [];
					var events = Schedule.fromStorage.days[new_event.date];
					events.push(new_event);
					BuildEvents(event_day.find('.b-event').remove().end(), events);
					store['Schedule'] = JSON.stringify(Schedule.fromStorage);
					Schedule.Data.event_info.close();
					return false;
				});
			$('.b-admin__delete-event', layout_exist)
				.click(function() {
					if(confirm("Вы действительно хотите удалить это событие?")) {
						var day_event = $(this).parents('.b-event');
						var day = day_event.data('day');
						day_event.slideUp(200, function() {
							var events = Schedule.fromStorage.days[day_event.data('date')]
							events.splice(day_event.data('index'),1);
							day.find('.b-event').remove();
							BuildDay(day,events);
							if (events.length == 0) delete(events);
							store['Schedule'] = JSON.stringify(Schedule.fromStorage);
						});
					}
				});
		}
	};
	function BuildDay(date, week, dayInWeek) {
		var day = $('<div>')
			.addClass('b-day')
			.data('date', date);
		var day_header = $('<div>')
			.addClass('b-day__header')
			.text(Schedule.Data.DaysOfWeek[dayInWeek])
			.append($('<span>')
				.addClass('b-day__header-date')
				.text(date.getDate()+" "+Schedule.Data.Months[date.getMonth()])
			)
			.appendTo(day);
		if (dayInWeek > 4) day.addClass('b-day_weekend');
		if (week == Schedule.Data.weeksToCurrent && dayInWeek == Schedule.Data.daysToCurrent) day.addClass('b-day_current');
		if ((week == 0 && dayInWeek < Schedule.Data.startDateDay) || (week == Schedule.Data.weeks-1 && dayInWeek > Schedule.Data.endDateDay)) {
			day.addClass('b-day_skip');
		} else {
			var add_control = $('<div>')
				.addClass('b-admin')
				.appendTo(day_header)
				.append($('<div>')
					.text("+")
					.addClass('b-admin__schedule_add_event')
					.click(function() {
						Show_event_details($(this).parents('.b-day'),'new');
					})
				);
		}
		var events = Schedule.fromStorage.days[date.getTime()];
		if (events) {
			BuildEvents(day,events);
		}
		return day;
	};
	function BuildEvents(day,events) {
		$.each(events, function (index, elem) {
			elem[day] = day;
			elem[index] = index;
			var day_event = $('<div>')
				.addClass('b-event')
				.append('<div class="b-event__time">\
					'+elem.startTime+' — '+elem.endTime+'</div>\
					<div class="b-event__title">\
					'+elem.title+'</div>\
					<div class="b-admin">\
					<div class="b-admin__delete-event b-event-info__close">×</div></div>'
				)
				.data(elem)
				.appendTo(day);
		});
	};
	function BuildProgressWeek(week) {
		var progressWeek = $('<div>')
			.addClass('b-progress__week')
			.css({'width':100/Schedule.Data.weeks+'%'})
			.data('week',week)
			.click(function() {
				Day_container_move($(this).data('week'));
			});
		if (week<Schedule.Data.weeksToCurrent) {
			progressWeek.addClass('b-progress__week_prev');
		} else if (week>Schedule.Data.weeksToCurrent) {
			progressWeek.addClass('b-progress__week_next');
		} else {
			progressWeek.addClass('b-progress__week_current');
		}
		return progressWeek;
	}
	function DeleteEvent() {

	}
	function GetShiftedDate(start, diff) {
		return new Date(start.getTime()+diff*(1000*60*60*24));
	};
	function Day_container_move(week, now) {
		Schedule.Data.currentWeek = week;
		var duration;
		now ? duration = 0 : duration = 400;
		if (Schedule.Data.event_info.day > -1) {
			Schedule.Data.event_info.close();
		}
		Schedule.Data.day_container.animate({'left':(-1)*Schedule.Data.body_width*week+'px'}, duration);
	};
	function Show_event_details(elem, act) {
		var pos = $('.b-day', Schedule.Data.day_container).index(elem);
		if (pos == Schedule.Data.event_info.day) return 0;
		Schedule.Data.event_info.date = elem.data('date');
		var open = function() {
			$('.b-event-info__item_date', Schedule.Data.event_info.elem)
				.text(Schedule.Data.event_info.date.getDate()+" "+Schedule.Data.MonthsFull[Schedule.Data.event_info.date.getMonth()]);
			Schedule.Data.event_info.day = pos;
			Schedule.Data.event_info.elem
				.insertAfter(elem)
			Schedule.Data.event_info.open();
		};
		if (Schedule.Data.event_info.day > -1) {
			Schedule.Data.event_info.close(function() {
				open();
			});
		} else {
			open();
		}
	};
});