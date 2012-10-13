$('HTML').addClass('JS');
$(function() {
	var layout_empty = $('.b-schedule__layout_empty');
	var layout_exist = $('.b-schedule__layout_exist');
	var admin_check = $('.b-header__admin-toggle')
		.change(function() {
			if (admin_check.prop('checked')) {
				Admin_init(state);
			} else {
				Admin_unset(state);
			}
		});
	if ('localStorage' in window && window['localStorage'] !== null) {
		var store = window.localStorage;
		 Schedule = {};
		var Admin = {};
		var state;
		if (store.getItem('Schedule')) {
			layout_empty.hide(0);
			Schedule_init();	
		} else {
			state = 'empty'
		}
		if (admin_check.prop('checked')) Admin_init(state);
	} else {
		$('.b-schedule__message', layout_empty).text("Браузер не поддерживает localStorage");
	}
	function Schedule_init() {
		Date.prototype.getRuDay = function () {
			return (this.getDay() + 6) % 7;
		}
		state = 'exist';
		StoreLoad();
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
			daysToCurrent : 0,
			weeksToCurrent : 0,
			currentWeek : 0,
			schedule_days : $(),
			body_width : 0,
			day_width : 0,
			day_container : $('.b-schedule__day-container', layout_exist),
			day_container_offsetLeft : 0,
			event_info : {
				elems : {
					startTime : {
						elem : $('.b-event-info__startTime', layout_exist),
						defaultval : "ЧЧ:ММ"
					},
					endTime : {
						elem : $('.b-event-info__endTime', layout_exist),
						defaultval : "ЧЧ:ММ"
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
					}
				},
				elem : $('.b-event-info', layout_exist),
				width : 0,
				date : null,
				day : null,
				pos : -1,
				event : null,
				event_index : 0,
				pannel : $('.b-event-info__pannel', layout_exist),
				close_btn : $('.b-event-info__close', layout_exist),
				extra_callback : undefined,
				open : function(callback) {
					this.container_resize('-');
					this.elem.animate({'width':this.width}, 400, callback);
				},
				close : function(callback) {
					this.container_resize('+');
					this.pos = -1;
					if (this.extra_callback != undefined) {
						this.elem.animate({'width':0}, 400, function() {
							if (callback != undefined) callback();
							Schedule.Data.event_info.extra_callback();
						})
					} else {
						this.elem.animate({'width':0}, 400, callback);
					}
				},
				container_resize : function(dir) {
					if (this.pos%7>4) {
						Schedule.Data.day_container.animate({'left':dir+'='+(this.pos%7-4)*Schedule.Data.day_width}, 400, function() {
							Schedule.Data.day_container_offsetLeft = Schedule.Data.day_container.offset().left;
						});
					};
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
		Schedule.Data.day_container.width(Schedule.Data.body_width*Schedule.Data.weeks + Schedule.Data.event_info.width);
		layout_exist.css({'visibility':'visible','display':'none'});

		for (var week=0; week<Schedule.Data.weeks; week++) {
			for (var dayInWeek=0; dayInWeek<7; dayInWeek++) {
				var date = GetShiftedDate(Schedule.Data.firstDate, dayInWeek+week*7);
				BuildDay(date,week,dayInWeek).appendTo(Schedule.Data.day_container);
			}
			BuildProgressWeek(week)
				.appendTo(Schedule.Data.progress);
		};
		Schedule.Data.schedule_days = $('.b-day', Schedule.Data.day_container);
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
		Schedule.Data.event_info.close_btn
			.click(function() {
				Schedule.Data.event_info.close();
			});
		if ((new Date() > Schedule.Data.startDate) && (new Date() < Schedule.Data.endDate)) {
			Day_container_move(Schedule.Data.weeksToCurrent, true);
		}
		layout_exist.fadeIn(500);
		Schedule.Data.day_container_offsetLeft = Schedule.Data.day_container.offset().left;
	};
	function Admin_init(stage, unset) {
		if (!Admin.controls) {
			Admin.controls = {
				new_schedule : {
					create_new : $('<span class="b-admin__create-new">+</span>'),
					edit_form : $('<div class="b-admin__edit-form">\
						<input class="b-admin__date-input b-admin__date-input_start" type="text" /> — \
						<input class="b-admin__date-input b-admin__date-input_end" type="text" />\
						<div class="b-admin__form-controls">\
						<a href="#" class="b-admin__form-control b-admin__form-control_create">Создать</a>\
						<a href="#" class="b-admin__form-control b-admin__form-control_cancel">Отмена</a>\
						</div></div>'
						)
				},
				add_event : {
					elem : $('<div class="b-admin">\
						<div class="b-admin__schedule_add_event">+</div>'),
					day : -1
				},
				edit_event : $('<div class="b-admin b-admin__edit-event">\
					<div class="b-admin__form-controls">\
					<a class="b-admin__form-control b-admin__form-control_save">Сохранить</a>\
					<a class="b-admin__form-control b-admin__form-control_create">Создать</a>\
					<a class="b-admin__form-control b-admin__form-control_delete">Удалить</a>\
					</div></div>'
					)
			}
		}
		if (stage == 'empty') {
			Admin.controls.new_schedule.create_new
				.click(function() {
					Admin.controls.new_schedule.create_new.fadeOut(200, function() {
						Admin.controls.new_schedule.edit_form
							.fadeIn(200);
					})
				});
			$.datepicker.setDefaults($.datepicker.regional['']);
			Admin.controls.new_schedule.edit_form
				.find('.b-admin__date-input')
				.datepicker($.datepicker.regional['ru']);
			$('.b-admin__form-control_cancel', Admin.controls.new_schedule.edit_form)
				.click(function() {
					Admin.controls.new_schedule.edit_form.fadeOut(200, function() {
						Admin.controls.new_schedule.create_new.fadeIn(200);
					})
				});
			$('.b-admin__form-control_create', Admin.controls.new_schedule.edit_form)
				.click(function() {
					var date1 = new Date($(".b-admin__date-input_start", Admin.controls.new_schedule.edit_form).val().replace(/(\d+).(\d+).(\d+)/, '$3/$2/$1'));
					var date2 = new Date($(".b-admin__date-input_end", Admin.controls.new_schedule.edit_form).val().replace(/(\d+).(\d+).(\d+)/, '$3/$2/$1'));
					if (date2<date1) {
						alert("Что-то не так с датами");
						return false;
					}
					Schedule.fromStorage = {
						startDate : date1,
						endDate : date2,
						days : {}
					};
					StoreSave();
					layout_empty.fadeOut(200, function() {
						Admin_unset(state);
						Schedule_init();
						Admin_init('exist')
					});
					return false;
				});
			layout_empty
				.append(
					$('<div class="b-admin b-admin_new-schedule"></div>')
						.append(Admin.controls.new_schedule.create_new,Admin.controls.new_schedule.edit_form)
				);
		} else {
			Admin.controls.add_event.elem
				.click(function() {
					Admin.controls.edit_event.addClass('b-admin__edit-event_create');
					Schedule.Data.event_info.extra_callback = function() {
						Admin.controls.edit_event.removeClass('b-admin__edit-event_create');
						Schedule.Data.event_info.extra_callback = undefined;
					};
					Show_event_details($(this).parents('.b-day'));
				});
			Admin.controls.edit_event
				.find('.b-admin__form-control_create')
				.click(function() {
					create_save_event('create');
					return false;
				});
			Admin.controls.edit_event
				.find('.b-admin__form-control_save')
				.click(function() {
					create_save_event('save');
					return false;
				});
			Admin.controls.edit_event
				.find('.b-admin__form-control_delete')
				.click(function() {
					if(confirm("Вы действительно хотите удалить это событие?")) {
						var event_day = Schedule.Data.event_info.day;
						var events = Schedule.fromStorage.days[event_day.data('date').getTime()];
						events.splice(Schedule.Data.event_info.event_index,1);
						if (events.length == 0)
							delete(Schedule.fromStorage.days[event_day.data('date').getTime()]);
						end_edit_event(event_day, events);
						return false;
					}
				});
			function create_save_event(act) {
				//нужна проверка значений
				var event_day = Schedule.Data.event_info.day;
				var new_event = {
					date : event_day.data('date').getTime(),
					startTime : Schedule.Data.event_info.elems.startTime.elem.text(),
					endTime : Schedule.Data.event_info.elems.endTime.elem.text(),
					reporter : Schedule.Data.event_info.elems.reporter.elem.text(),
					title : Schedule.Data.event_info.elems.title.elem.text(),
					description : Schedule.Data.event_info.elems.description.elem.text(),
					yaru : Schedule.Data.event_info.elems.yaru.elem.text(),
					presentation : Schedule.Data.event_info.elems.presentation.elem.text(),
					video : Schedule.Data.event_info.elems.video.elem.text(),
					video_download : Schedule.Data.event_info.elems.video_download.elem.text()
				};
				if (!ValidEvent(new_event)) return false;
				if (act == 'create') {
					if (!Schedule.fromStorage.days[new_event.date])
						Schedule.fromStorage.days[new_event.date] = [];
					var events = Schedule.fromStorage.days[new_event.date].slice();
					events.push(new_event);
					if (!ValidDay(events,true)) return false;
				} else {
					var events = Schedule.fromStorage.days[new_event.date].slice();
					events[Schedule.Data.event_info.event_index] = new_event;
					if (!ValidDay(events,true)) return false;
				}
				Schedule.fromStorage.days[new_event.date] = events;
				end_edit_event(event_day, events);
			};
			function end_edit_event(event_day, events) {
				BuildEvents(event_day.find('.b-event').remove().end(), events);
				StoreSave();
				Schedule.Data.event_info.close();
			}
			$.each(Schedule.Data.event_info.elems, function(index, item) {
				item.elem
					.attr('contenteditable','true')
					.toggleClass('b-event-info__item_editable');
			});
			Schedule.Data.event_info.elem.append(Admin.controls.edit_event);
			Schedule.Data.day_container
				.mousemove(function(e) {
					var i = (e.pageX - Schedule.Data.day_container_offsetLeft);
					var index = Math.floor(i/Schedule.Data.day_width);
					if (Schedule.Data.event_info.pos > -1) {
						if (index > Schedule.Data.event_info.pos)
							index = Admin.controls.add_event.day;
						if (i > Schedule.Data.event_info.pos*Schedule.Data.day_width + Schedule.Data.event_info.width)
							index = Math.floor((i-Schedule.Data.event_info.width)/Schedule.Data.day_width);
					}
					if (index != Admin.controls.add_event.day) {
						Admin.controls.add_event.day = index;
						var day = Schedule.Data.day_container
							.find('.b-day')
							.eq(index);
						if (!day.hasClass('b-day_skip')) {
							Admin.controls.add_event.elem
								.appendTo(day);
						}
					}
				})
				.mouseleave(function() {
					Admin.controls.add_event.elem.hide(0);
				})
				.mouseenter(function() {
					Admin.controls.add_event.elem.show(0);
				})

		}
	};
	function Admin_unset(stage) {
		if (stage=='empty') {
			Admin.controls.new_schedule.edit_form
				.find('.b-admin__date-input')
				.datepicker('destroy');
			$('.b-admin_new-schedule', layout_empty)
				.remove();
		} else {
			$.each(Schedule.Data.event_info.elems, function(index, item) {
				item.elem
					.attr('contenteditable','false')
					.toggleClass('b-event-info__item_editable');
			});
			if (Admin.controls.edit_event.hasClass('b-admin__edit-event_create'))
				Admin.controls.add_event.elem.click();
			Admin.controls.edit_event
				.remove();
			Admin.controls.add_event.elem
				.remove()
			Schedule.Data.day_container
				.unbind();
		}
	}
	function BuildDay(date, week, dayInWeek) {
		var classes = '';
		if (dayInWeek > 4) classes+=' b-day_weekend';
		if (week == Schedule.Data.weeksToCurrent && dayInWeek == Schedule.Data.daysToCurrent) classes+=' b-day_current';
		if ((week == 0 && dayInWeek < Schedule.Data.startDateDay) || (week == Schedule.Data.weeks-1 && dayInWeek > Schedule.Data.endDateDay)) {
			classes+=' b-day_skip';
		}
		var day = '<div class="b-day'+classes+'" style="width:'+Schedule.Data.day_width+'px">\
			<div class="b-day__header">'+Schedule.Data.DaysOfWeek[dayInWeek]+'\
			<span class="b-day__header-date">'+date.getDate()+' '+Schedule.Data.Months[date.getMonth()]+'\
			</span></div></div>';
		day = $(day);
		var events = Schedule.fromStorage.days[date.getTime()];
		if (events) {
			BuildEvents(day,events);
		}
		return day.data('date', date);
	};
	function BuildEvents(day,events) {
		$.each(events, function (index, elem) {
			var day_event = $('<div class="b-event">\
				<div class="b-event__time">\
				'+elem.startTime+' — '+elem.endTime+'</div>\
				<div class="b-event__title">\
				'+elem.title+'</div>'
				)
				.data(elem)
				.appendTo(day);
			day_event
				.click(function() {
					Show_event_details(day,elem,index);
				})
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
	};
	function ValidEvent(event) {
		if (parseInt(event.startTime.replace(/(\d{2}):(\d{2})/, '$1$2'))<parseInt(event.endTime.replace(/(\d+):(\d+)/, '$1$2'))) {
			if (event.reporter != '' && event.title != '') {
				if (event.description == '') delete(event.description);
				if (event.yaru == '') delete(event.yaru);
				if (event.presentation == '') delete(event.presentation);
				if (event.video == '') delete(event.video);
				if (event.video_download == '') delete(event.video_download);
				return true;
			}
			alert("Не заполнены поля 'докладчик' и/или 'тема доклада'");
			return false;
		}
		alert("Что-то не так с временем");
		return false;
	};
	function ValidDay(events,verbose) {
		events.sort(function(a,b) {
			return parseInt(a.startTime.replace(/(\d{2}):(\d{2})/, '$1$2'))-parseInt(b.startTime.replace(/(\d+):(\d+)/, '$1$2'));
		})
		for(var i=0; i<events.length-1; i++) {
			if (parseInt(events[i].endTime.replace(/(\d{2}):(\d{2})/, '$1$2'))>parseInt(events[i+1].startTime.replace(/(\d+):(\d+)/, '$1$2'))) {
				if (verbose) alert("Это время уже занято");
				return false;
			}
		}
		return true;
	};
	function GetShiftedDate(start, diff) {
		return new Date(start.getTime()+diff*(1000*60*60*24));
	};
	function Day_container_move(week, now) {
		Schedule.Data.currentWeek = week;
		var duration;
		now ? duration = 0 : duration = 400;
		if (Schedule.Data.event_info.pos > -1) {
			Schedule.Data.event_info.close();
		}
		Schedule.Data.day_container.animate({'left':(-1)*Schedule.Data.body_width*week+'px'}, duration, function() {
			Schedule.Data.day_container_offsetLeft = Schedule.Data.day_container.offset().left;
		});
	};
	function Show_event_details(day, event, index) {
		var pos = Schedule.Data.schedule_days.index(day);
		if (((pos == Schedule.Data.event_info.pos && !event) || (event == Schedule.Data.event_info.event && event)) && Schedule.Data.event_info.pos>-1) {
			return Schedule.Data.event_info.close();
		}
		Schedule.Data.event_info.date = day.data('date');
		var open = function() {
			$('.b-event-info__item_date', Schedule.Data.event_info.elem)
				.text(Schedule.Data.event_info.date.getDate()+" "+Schedule.Data.MonthsFull[Schedule.Data.event_info.date.getMonth()]);
			Schedule.Data.event_info.pos = pos;
			Schedule.Data.event_info.day = day;
			Schedule.Data.event_info.event = event;
			Schedule.Data.event_info.event_index = index;
			Schedule.Data.event_info.elem
				.insertAfter(day);
			$.each(Schedule.Data.event_info.elems, function(index, item) {
				event ? item.elem.text(event[index]) : item.elem.text(item.defaultval);
			})
			Schedule.Data.event_info.open();
		};
		if (Schedule.Data.event_info.pos > -1) {
			Schedule.Data.event_info.close(function() {
				open();
			});
		} else {
			open();
		}
	};
	function StoreLoad() {
		Schedule.fromStorage = JSON.parse(store['Schedule']);
	};
	function StoreSave() {
		store['Schedule'] = JSON.stringify(Schedule.fromStorage);
	}
});