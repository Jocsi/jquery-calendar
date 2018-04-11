(function($){
    //开启严格模式
    'use strict';

    //bootstrap-table字符串拼接函数
    var sprintf = function (str) {
        var args = arguments,
            flag = true,
            i = 1;

        str = str.replace(/%s/g, function () {
            var arg = args[i++];

            if (typeof arg === 'undefined') {
                flag = false;
                return '';
            }
            return arg;
        });
        return flag ? str : '';
    };

    var getDate = function(year, month, day) {
        month = Number(month) < 10 ? "0" + month : month;
        day = Number(day) < 10 ? "0" + day : day;
        return year + "-" + month + "-" + day;
    }

    var currentDate = function() {
        var date = new Date();
        var year = date.getFullYear();
        var month = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : '' + date.getMonth() + 1;
        var day = date.getDate() < 10 ? "0" + date.getDate() : '' + date.getDate();
        return { year: year, month: month, day: day };
    };

    var Calendar = function(el, options) {
        this.options = options;
        this.$el = $(el);

        this.init();
    }
    //初始化主方法
    Calendar.prototype.init = function() {
        this.initContainer();
        this.initServer();
    }

    //初始化容器
    Calendar.prototype.initContainer = function() {
        this.current = currentDate();
        this.$container = $([
            '<div class="jquery-calendar">',
                '<div class="calendar-top">',
                    '<div class="calendar-dropdown">',
                        '<a class="dorpdown-chprev">',
                            '<i class="icon iconfont icon-triangle-left"></i>',
                        '</a>',
                        '<span class="title">',
                            '<input id="currentYear" readonly="">',
                            '<label class="icon iconfont icon-triangle-bottom"></label>',
                        '</span>',
                        '<a class="dropdown-chnext">',
                            '<i class="icon iconfont icon-triangle-right"></i>',
                        '</a>',
                        '<div class="dropdown-list">',
                            '<a class="dropdown-btn dropdown-top"><i class="iconfont icon-triangle-top"></i></a>',
                            '<ul id="years">',
                            '</ul>',
                            '<a class="dropdown-btn"><i class="iconfont icon-triangle-bottom"></i></a>',
                        '</div>',
                    '</div>',
                    '<div class="calendar-dropdown">',
                        '<a class="dorpdown-chprev">',
                            '<i class="icon iconfont icon-triangle-left"></i>',
                        '</a>',
                        '<span class="title">',
                            '<input id="currentMonth" readonly="">',
                            '<label class="icon iconfont icon-triangle-bottom"></label>',
                        '</span>',
                        '<a class="dropdown-chnext">',
                            '<i class="icon iconfont icon-triangle-right"></i>',
                        '</a>',
                        '<div class="dropdown-list small">',
                            '<ul id="months">',
                            '</ul>',
                        '</div>',
                    '</div>',
                '</div>',
                '<div class="calendar-table">',
                    '<table>',
                        '<thead>',
                            '<tr>',
                                '<th>日</th>',
                                '<th>一</th>',
                                '<th>二</th>',
                                '<th>三</th>',
                                '<th>四</th>',
                                '<th>五</th>',
                                '<th>六</th>',
                            '</tr>',
                        '</thead>',
                        '<tbody>',
                        '</tbody>',
                    '</table>',
                '</div>',
                '<div class="calendar-bottom"></div>',
                '<div class="shadow">',
                    '<div></div>',
                '</div>',
            '</div>'
        ].join(''));

        this.$container.appendTo(this.$el);
        this.$currentYear = this.$container.find('#currentYear');
        this.$currentMonth = this.$container.find('#currentMonth');
        this.$yearContainer = $(this.$container.find('.calendar-dropdown')[0]);
        this.$monthContainer = $(this.$container.find('.calendar-dropdown')[1]);
        this.$yearDropdownList = this.$yearContainer.find('.dropdown-list');
        this.$yearDropdown = this.$yearContainer.find('#years');
        this.$monthDropdownList = this.$monthContainer.find('.dropdown-list');
        this.$monthDropdown = this.$monthContainer.find('#months');
        this.$dateContainer = this.$container.find('.calendar-table > table > tbody');
        this.$shadow = this.$container.find('.shadow');

        //初始化年份列表
        this.initYearDropdown(this.$yearDropdown, this.current.year);

        //初始化月份列表
        this.initMonthDropdown(this.$monthDropdown, this.current.month);
        //设置年月显示框
        this.setYear(this.$currentYear, this.current.year);
        this.setMonth(this.$currentMonth, this.current.month);

        //初始化日期表格
        this.initDayTable();

        var that = this;
        //点击上一年
        this.$yearContainer.find('.dorpdown-chprev').click(function() {
            that.current.year = that.current.year - 1;
            that.setYear(that.$currentYear, that.current.year);
            that.initYearDropdown(that.$yearDropdown, that.current.year);
            that.initDayTable();
            that.initServer();
        })

        //点击下一年
        this.$yearContainer.find('.dropdown-chnext').click(function() {
            that.current.year = that.current.year + 1;
            that.setYear(that.$currentYear, that.current.year);
            that.initYearDropdown(that.$yearDropdown, that.current.year);
            that.initDayTable();
            that.initServer();
        })

        //年份上翻页
        this.$yearDropdownList.find('a:first').click(function() {
            var firstYear = Number(that.$yearDropdown.find('li:first').attr('y'))
            var begin = firstYear - 14;
            var end = firstYear;
            that.initYearDropdown(that.$yearDropdown, that.current.year, begin, end);
            that.initDayTable();
            that.initServer();
        })

        //年份下翻页
        this.$yearDropdownList.find('a:last').click(function() {
            var lastYear = Number(that.$yearDropdown.find('li:last').attr('y'))
            var begin = lastYear + 1;
            var end = lastYear + 15;
            that.initYearDropdown(that.$yearDropdown, that.current.year, begin, end);
            that.initDayTable();
            that.initServer();
        })

        //点击选择年份
        this.$yearDropdown.on('click', 'li', function(){
            var year = Number($(this).attr('y'));
            that.current.year = year;
            that.setYear(that.$currentYear, year);
            that.$yearDropdownList.hide();
            that.initYearDropdown(that.$yearDropdown, year);
            that.initDayTable();
            that.initServer();
        });

        //点击上一月
        this.$monthContainer.find('.dorpdown-chprev').click(function() {
            var month = Number(that.current.month);
            if(month !== 1) {
                that.current.month = month - 1 < 10 ? '0' + (month - 1) : '' + (month - 1);
                that.setMonth(that.$currentMonth, that.current.month);
                var currentMonth = that.$monthDropdown.find('li[m="'+ (month - 2) +'"]');
                currentMonth.siblings().removeClass('laydate_click')
                currentMonth.addClass('laydate_click');
                that.initDayTable();
                that.initServer();
            }
        })

        //点击下一月
        this.$monthContainer.find('.dropdown-chnext').click(function() {
            var month = Number(that.current.month);
            if(month !== 12) {
                that.current.month = month + 1 < 10 ? '0' + (month + 1) : '' + (month + 1);
                that.setMonth(that.$currentMonth, that.current.month);
                var currentMonth = that.$monthDropdown.find('li[m="'+ month +'"]');
                currentMonth.siblings().removeClass('laydate_click')
                currentMonth.addClass('laydate_click');
                that.initDayTable();
                that.initServer();
            }
        })

        //点击选择月份
        this.$monthDropdown.find('li').click(function(){
            var month = Number($(this).attr('m'));
            month = (month + 1 < 10 ? '0' + (month + 1) : (month + 1));
            that.current.month = month;
            $(this).siblings().removeClass('laydate_click')
            $(this).addClass('laydate_click');
            that.initDayTable();
            that.initServer();

            that.setMonth(that.$currentMonth, month);
            that.$monthDropdownList.hide();
        })

        //点击展开关闭下拉框
        this.$yearContainer.find('.title').click(function(e) {
            var dropdown = that.$yearContainer.find('.dropdown-list');
            if(dropdown.is(':hidden')) {
                that.initYearDropdown(that.$yearDropdown, that.current.year);
                dropdown.show();
            } else {
                dropdown.hide();
            }
        });
        this.$monthContainer.find('.title').click(function(e) {
            var dropdown = that.$monthContainer.find('.dropdown-list');
            if(dropdown.is(':hidden')) {
                dropdown.show();
            } else {
                dropdown.hide();
            }
        })

        //点击外部关闭年、月下拉框
        $(document).bind('click', function(e){
            if($(e.target).closest(that.$yearContainer.find('.dropdown-list')).length == 0
                && $(e.target).closest($(that.$yearContainer.find('.title'))).length == 0) {
                var dropdown = that.$yearContainer.find('.dropdown-list');
                if(!dropdown.is(':hidden')) {
                    dropdown.hide();
                }
            } 
            if($(e.target).closest(that.$monthContainer.find('.dropdown-list')).length == 0
                && $(e.target).closest($(that.$monthContainer.find('.title'))).length == 0) {
                var dropdown = that.$monthContainer.find('.dropdown-list');
                if(!dropdown.is(':hidden')) {
                    dropdown.hide();
                }
            }
        });
    }

    //设置年份显示框
    Calendar.prototype.setYear = function(container, value) {
        container.val(value + '年')
    }

    //设置月份显示框
    Calendar.prototype.setMonth = function(container, value) {
        container.val(value + '月')
    }

    //初始化年份下拉列表
    Calendar.prototype.initYearDropdown = function(container, year, begin, end) {
        var yearArr = [];
        begin = begin || year - 7;
        end = end || year + 7;
        for(var i = begin; i < end; i++) {
            if(i === year) {
                yearArr.push(sprintf('<li class="laydate_click" y="%s">%s年</li>', i, i));
                continue;
            }
            yearArr.push(sprintf('<li y="%s">%s年</li>', i, i));
        }
        container.empty();
        container.append($(yearArr.join('')));
    }

    //初始化月份下拉列表
    Calendar.prototype.initMonthDropdown = function(container, month) {
        var monthArr = [];
        for(var i = 0; i < 12; i++) {
            if(i === Number(month) - 1) {
                monthArr.push(sprintf('<li class="laydate_click" m="%s">%s月</li>', i, (i + 1 < 10) ? "0" + (i + 1) : (i + 1)));
                continue;
            }
            monthArr.push(sprintf('<li m="%s">%s月</li>', i, (i + 1 < 10) ? "0" + (i + 1) : (i + 1)));
        }
        container.append($(monthArr.join('')));
    }

    //初始化日期选择表格
    Calendar.prototype.initDayTable = function() {
        this.selectedDate = this.selectedDate || [];
        var that = this;
        //记录将要展示的日期表格的数组
        this.table = [];
        //创建的时候月份加1，以便使用 setDate(0)获取上月最后一天日期获取当月最大天数
        var date = new Date(this.current.year, this.current.month, '01');
        date.setDate(0);
        //当前月最大天数
        var totalDay = date.getDate();
        date.setDate(1);
        //当前月第一天是星期几
        var weekOfDay = date.getDay();
        var year = date.getFullYear();
        var month = date.getMonth() + 1;

        var datePre = new Date(this.current.year, Number(this.current.month) - 1, '01');
        //上个月最大天数
        datePre.setDate(0);
        var totalDayPre = datePre.getDate()
        var yearPre = datePre.getFullYear();
        var monthPre = datePre.getMonth() + 1;

        //下月
        var dateNxt = new Date(this.current.year, this.current.month, '01');
        var yearNxt = dateNxt.getFullYear();
        var monthNxt = dateNxt.getMonth() + 1;

        if(weekOfDay == 0) {
            //上个月最后几天
            for(var i = totalDayPre - 6; i <= totalDayPre; i++) {
                this.table.push({year: yearPre, month: monthPre, day: i});
            }
            //本月
            for(var i = date.getDate(); i <= totalDay; i++) {
                this.table.push({year: year, month: month, day: i});
            }
            var loopCount = 42 - this.table.length;
            //一页应显示42天， 剩余日期
            for(var i = 1; i <= loopCount; i++) {
                this.table.push({year: yearNxt, month: monthNxt, day: i});
            }
        } else {
            //上个月最后几天
            for(var i = totalDayPre - weekOfDay + 1; i <= totalDayPre; i++) {
                this.table.push({year: yearPre, month: monthPre, day: i})
            }
            //本月
            for(var i = date.getDate(); i <= totalDay; i++) {
                this.table.push({year: year, month: month, day: i});
            }
            var loopCount = 42 - this.table.length;
            //一页应显示42天， 剩余日期
            for(var i = 1; i <= loopCount; i++) {
                this.table.push({year: yearNxt, month: monthNxt, day: i});
            }
        }
        
        var dateTable = [];
        var now = new Date();
        now = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        //循环构建dom(每次加7)
        for(var i = 0; i < this.table.length; i = i+7) {
            var html = [
                '<tr>',
                sprintf('<td class="%s%s%s%s" y="%s" m="%s" d="%s">%s</td>', 
                    new Date(this.table[i].year, Number(this.table[i].month) - 1, this.table[i].day).getTime() < now.getTime() ? 'disable ' : '',
                    Number(this.table[i].month) !== Number(this.current.month) ? 'not-in-month ' : '',
                    new Date(this.table[i].year, Number(this.table[i].month) - 1, this.table[i].day).getTime() === now.getTime()  ? 'today ' : '',
                    $.inArray(getDate(this.table[i].year, this.table[i].month, this.table[i].day), this.selectedDate) > -1 ? 'selected' : '',
                    this.table[i].year, this.table[i].month, this.table[i].day, this.table[i].day),
                sprintf('<td class="%s%s%s%s" y="%s" m="%s" d="%s">%s</td>', 
                    new Date(this.table[i+1].year, Number(this.table[i+1].month) - 1, this.table[i+1].day).getTime() < now.getTime() ? 'disable ' : '', 
                    Number(this.table[i+1].month) !== Number(this.current.month) ? 'not-in-month ' : '',
                    new Date(this.table[i+1].year, Number(this.table[i+1].month) - 1, this.table[i+1].day).getTime() === now.getTime()  ? 'today ' : '',
                    $.inArray(getDate(this.table[i+1].year, this.table[i+1].month, this.table[i+1].day), this.selectedDate) > -1 ? 'selected' : '',
                    this.table[i+1].year, this.table[i+1].month, this.table[i+1].day, this.table[i+1].day),
                sprintf('<td class="%s%s%s%s" y="%s" m="%s" d="%s">%s</td>', 
                    new Date(this.table[i+2].year, Number(this.table[i+2].month) - 1, this.table[i+2].day).getTime() < now.getTime() ? 'disable ' : '', 
                    Number(this.table[i+2].month) !== Number(this.current.month) ? 'not-in-month ' : '',
                    new Date(this.table[i+2].year, Number(this.table[i+2].month) - 1, this.table[i+2].day).getTime() === now.getTime()  ? 'today ' : '',
                    $.inArray(getDate(this.table[i+2].year, this.table[i+2].month, this.table[i+2].day), this.selectedDate) > -1 ? 'selected' : '',
                    this.table[i+2].year, this.table[i+2].month, this.table[i+2].day, this.table[i+2].day),
                sprintf('<td class="%s%s%s%s" y="%s" m="%s" d="%s">%s</td>', 
                    new Date(this.table[i+3].year, Number(this.table[i+3].month) - 1, this.table[i+3].day).getTime() < now.getTime() ? 'disable ' : '', 
                    Number(this.table[i+3].month) !== Number(this.current.month) ? 'not-in-month ' : '',
                    new Date(this.table[i+3].year, Number(this.table[i+3].month) - 1, this.table[i+3].day).getTime() === now.getTime()  ? 'today ' : '',
                    $.inArray(getDate(this.table[i+3].year, this.table[i+3].month, this.table[i+3].day), this.selectedDate) > -1 ? 'selected' : '',
                    this.table[i+3].year, this.table[i+3].month, this.table[i+3].day, this.table[i+3].day),
                sprintf('<td class="%s%s%s%s" y="%s" m="%s" d="%s">%s</td>', 
                    new Date(this.table[i+4].year, Number(this.table[i+4].month) - 1, this.table[i+4].day).getTime() < now.getTime() ? 'disable ' : '', 
                    Number(this.table[i+4].month) !== Number(this.current.month) ? 'not-in-month ' : '',
                    new Date(this.table[i+4].year, Number(this.table[i+4].month) - 1, this.table[i+4].day).getTime() === now.getTime()  ? 'today ' : '',
                    $.inArray(getDate(this.table[i+4].year, this.table[i+4].month, this.table[i+4].day), this.selectedDate) > -1 ? 'selected' : '',
                    this.table[i+4].year, this.table[i+4].month, this.table[i+4].day, this.table[i+4].day),
                sprintf('<td class="%s%s%s%s" y="%s" m="%s" d="%s">%s</td>', 
                    new Date(this.table[i+5].year, Number(this.table[i+5].month) - 1, this.table[i+5].day).getTime() < now.getTime() ? 'disable ' : '', 
                    Number(this.table[i+5].month) !== Number(this.current.month) ? 'not-in-month ' : '',
                    new Date(this.table[i+5].year, Number(this.table[i+5].month) - 1, this.table[i+5].day).getTime() === now.getTime()  ? 'today ' : '',
                    $.inArray(getDate(this.table[i+5].year, this.table[i+5].month, this.table[i+5].day), this.selectedDate) > -1 ? 'selected' : '',
                    this.table[i+5].year, this.table[i+5].month, this.table[i+5].day, this.table[i+5].day),
                sprintf('<td class="%s%s%s%s" y="%s" m="%s" d="%s">%s</td>', 
                    new Date(this.table[i+6].year, Number(this.table[i+6].month) - 1, this.table[i+6].day).getTime() < now.getTime() ? 'disable ' : '', 
                    Number(this.table[i+6].month) !== Number(this.current.month) ? 'not-in-month ' : '',
                    new Date(this.table[i+6].year, Number(this.table[i+6].month) - 1, this.table[i+6].day).getTime() === now.getTime()  ? 'today ' : '',
                    $.inArray(getDate(this.table[i+6].year, this.table[i+6].month, this.table[i+6].day), this.selectedDate) > -1 ? 'selected' : '',
                    this.table[i+6].year, this.table[i+6].month, this.table[i+6].day, this.table[i+6].day),
                '</tr>'
            ]
            dateTable = dateTable.concat(html);
        }
        if(dateTable.length) {
            this.$dateContainer.empty();
            $(dateTable.join('')).appendTo(this.$dateContainer);
        }

        //绑定点击日期事件
        this.$dateContainer.find('td').on('click', function(){
            if(!$(this).hasClass('disable')) {
                var year = $(this).attr('y');
                var month = Number($(this).attr('m')) < 10 ? '0' + $(this).attr('m') : $(this).attr('m');
                var day = Number($(this).attr('d')) < 10 ? '0' + $(this).attr('d') : $(this).attr('d');
                if(!$(this).hasClass('selected')) {
                    $(this).addClass('selected');
                    that.selectedDate.push(year+'-'+month+'-'+day)
                } else {
                    $(this).removeClass('selected');
                    var index = that.selectedDate.indexOf(year+'-'+month+'-'+day)
                    if(index > -1) {
                        that.selectedDate.splice(index, 1);
                    }
                }
            }
        })
    }

    //初始化数据
    Calendar.prototype.initServer = function() {
        var that = this,
            request,
            data,
            begin,
            end,
            tempDay1,
            tempDay2;
        tempDay1 = new Date(this.current.year, Number(this.current.month) - 1);
        tempDay1.setDate(tempDay1.getDate() - 14);
        begin = tempDay1.getFullYear() + '-' + (tempDay1.getMonth() + 1 < 10 ? "0"+(tempDay1.getMonth() + 1): tempDay1.getMonth() + 1) + '-' + (tempDay1.getDate() < 10 ? "0"+tempDay1.getDate() : tempDay1.getDate());
        tempDay2 = new Date(this.current.year, this.current.month);
        tempDay2.setDate(tempDay2.getDate() + 14);
        end = tempDay2.getFullYear() + '-' + (tempDay2.getMonth() + 1 < 10 ? "0"+(tempDay2.getMonth() + 1): tempDay2.getMonth() + 1) + '-' + (tempDay2.getDate() < 10 ? "0"+tempDay2.getDate() : tempDay2.getDate());
        data = {
            begin: begin,
            end: end
        };    
        request = $.extend({}, {
            type: this.options.method,
            url: this.options.url,
            data: this.options.contentType === 'application/json' && this.options.method === 'post' ?
                JSON.stringify(data) : data,
            dateType: this.options.dataType,
            success: function(res) {
                that.resourceDate = res;
                that.selectedDate = $.extend([], that.resourceDate);
                that.initDayTable();
                that.$shadow.hide();
            }, 
            error: function (res) {
                that.$shadow.hide();
                alert(res);
            }
        });
        if(request.url && request.data) this.$shadow.show() && $.ajax(request)
    }

    //获取选择列表
    Calendar.prototype.getSelected = function() {
        return this.selectedDate;
    }

    //获取变更列表
    Calendar.prototype.getChangeList = function() {
        var _insert = [],
            _delete = [];

        for(var i = 0; i < this.resourceDate.length; i++) {
            var notInList = true;
            for(var j = 0; j < this.selectedDate.length; j++) {
                if(this.resourceDate[i] == this.selectedDate[j]) {
                    notInList = false;
                    break;
                }
            }
            if(notInList) {
                _delete.push(this.resourceDate[i])
            }
        }
        
        for(var i = 0; i < this.selectedDate.length; i++) {
            var notInList = true;
            for(var j = 0; j < this.resourceDate.length; j++) {
                if(this.selectedDate[i] == this.resourceDate[j]) {
                    notInList = false;
                    break;
                }
            }
            if(notInList) {
                _insert.push(this.selectedDate[i])
            }
        }

        return {"insert": _insert, "delete": _delete}
    }

    Calendar.Default = {
        url: undefined,
        method: 'get',
        contentType: 'application/json',
        dataType: 'json',
        resourceDate: []
    }

    var allowedMethods = [
        'getSelected', 'getChangeList'
    ];

    $.fn.calendar = function(option) {
        var value, args = Array.prototype.slice.call(arguments, 1);

        this.each(function() {
            var that = $(this),
                data = that.data('jquery.calendar'),
                options = $.extend({}, Calendar.Default, that.data(), typeof option === 'object' && option);
            
            if (typeof option === 'string') {
                if ($.inArray(option, allowedMethods) < 0) {
                    throw new Error("Unknown method: " + option);
                }

                if (!data) {
                    return;
                }

                value = data[option].apply(data, args);

                if (option === 'destroy') {
                    that.removeData('jquery.calendar');
                }
            }

            if (!data) {
                that.data('jquery.calendar', (data = new Calendar(this, options)));
            }
        });
        return typeof value === 'undefined' ? this : value;
    }

    $.fn.calendar.Constructor = Calendar;
    $.fn.calendar.methods = allowedMethods;

    //默认data-toggle="calendar"的元素为日历选择器
    $(function(){
        $("[data-toggle='calendar']").calendar();
    });
})(jQuery)