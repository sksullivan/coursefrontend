(function () {
    "use strict";

    angular
        .module('scheedule')
        .service('d3CalendarService', [d3CalendarService]);

    function d3CalendarService() {
        var d3s = this;
    
        //Creates a calendar object with specific functions to manipulate the calendar
        function initializeCalendar(elem, isDetailed) {

            var margin = {top: 10, right: 0, bottom: 30, left: 70},
                width = 960 - margin.left - margin.right,
                height = 500 - margin.top - margin.bottom;

            var color = d3.scale.category10();

            var x = d3.scale.ordinal()
                .domain(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]);

            var t1 = d3.time.hour.offset(d3.time.day(new Date), 7);
            var t2 = d3.time.hour.offset(d3.time.day(new Date), 21);
            var y = d3.time.scale()
                .domain([t1, t2]);

            var xAxis = d3.svg.axis()
                .orient("bottom");
            var yAxis = d3.svg.axis()
                .orient("left")
                .outerTickSize(0)
                .tickPadding(10)
                .tickFormat(d3.time.format("%I:%M %p"));
           
            var events = [];
             
            //Creates svg elements for events
            function cal_event(selection){
                selection.each(function(d, i){

                    var y = d.yScale,
                        x = d.xScale,
                        c = d.colorScale,
                        ed = d.eventData;

                    // Translating event based on day
                    var element = d3.select(this);
                    element
                        .attr("transform", function(d, i) { return "translate(" + x(ed.day) + ",0)"; });

                    if (ed.hovering)
                    {
                        element
                            .attr("opacity", "0.5");
                    }
                
                    // Creating html elements for event
                    var strip = element.select("rect.strip");
                    var body = element.select("rect.body");
                    var text = element.select("text");

                    if(strip.empty()){
                        strip = element.append("rect")
                        .attr("class", "strip");
                    }
                    if(body.empty()){
                        body = element.append("rect")
                        .attr("class", "body");
                    }
                    if(text.empty()){
                        text = element.append("text");
                    }

                    strip
                        .attr("y", y(ed.start))
                        .attr("height", y(ed.end) - y(ed.start))
                        .attr("width", 8)
                        .attr("fill", d3.rgb(c(ed.classId)).brighter(1));

                    body
                        .attr("x", 5)
                        .attr("y", y(ed.start))
                        .attr("height", y(ed.end) - y(ed.start))
                        .attr("width", x.rangeBand() - 5)
                        .attr("fill", "#d3d3d3");

                    /*
                    rect.transition()
                        .attr("y", y(ed.start))
                        .attr("height", y(ed.end) - y(ed.start))
                        .attr("width", x.rangeBand())
                        .attr("fill", d3.rgb(c(ed.classId)).brighter(1));
                    */
                    
                    if (isDetailed)
                    {
                        text
                            .attr("x", x.rangeBand()/2)
                            .attr("text-anchor", "middle")
                            .attr("y", y(ed.start) + 4)
                            .attr("dy", "0.75em")
                            .text(ed.content);
                    } 

                });
            }

            //Creates calendar based off events
            function compute(d, context) {

                var element = d3.select(context).select("g.main");

                if (element.empty()) {

                    // No main canvas, build it.
                    element = d3.select(context)
                        .attr("width", width + margin.left + margin.right)
                        .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                        .attr("class", "main")
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                    // Scales and Axes
                    x = x.rangeRoundBands([0, width], .1);
                    y = y.range([0, height]);

                    xAxis = xAxis.scale(x);
                    yAxis = yAxis.scale(y).innerTickSize(-width);

                    if (isDetailed)
                    {
                        element.append("g")
                            .attr("class", "x axis")
                            .attr("transform", "translate(0," + height + ")")
                            .call(xAxis);
                    }

                    element.append("g")
                        .attr("class", "y axis")
                        .call(yAxis);
                }

                // Formatting data from event creation
                var entry = element.selectAll("g.entry").data(d.map(function(d){
                    return {
                        yScale: y,
                        xScale: x,
                        colorScale: color,
                        eventData: d
                    };
                }));
            
                // Creation and deletion of events based on change in data
                entry.enter()
                    .append("g")
                    .attr("class", "entry");
                entry.exit().remove();
                entry.call(cal_event);
            };
    
            // Resize to current width and height
            function resize(selection) {
                selection.each(function(d, i) {
                    var element = d3.select(this).select("g.main");
                    if (!element.empty()) {
                        // Update current element
                        element = d3.select(this)
                            .attr("width", width + margin.left + margin.right)
                            .attr("height", height + margin.top + margin.bottom);

                        // Update scales and axes
                        x = x.rangeRoundBands([0,width], .1);
                        y = y.range([0, height]);

                        xAxis = xAxis.scale(x);
                        yAxis = yAxis.scale(y).innerTickSize(-width);

                        if (isDetailed)
                        {
                            element.select("g.x")
                                .attr("transform", "translate(0," + height + ")")
                                .call(xAxis);
                        }
                        element.select("g.y")
                            .call(yAxis);

                        // Update events
                        var entry = element.selectAll("g.entry").data(d.map(function(d){
                            return {
                                yScale: y,
                                xScale: x,
                                colorScale: color,
                                eventData: d
                            };
                        }));

                        entry.call(cal_event);
                    }
                });
            };

            //Calendar object render function
            function inner(selection){
                selection.each(function(d, i) {
                    compute(d, this);
                });
            };

            //Calendar object resize function 
            inner.resize = function() {
                inner.width(elem.parentNode.offsetWidth);
                if (isDetailed)
                    inner.height(window.innerHeight-100);
                else
                    inner.height((window.innerHeight-180)/3);

                d3.select(elem)
                    .datum(events)
                    .call(resize);
            }

            //Calendar object get and set width
            inner.width = function(_) {
                if(!arguments.length) return width;
                width = _ - margin.left - margin.right;
            };

            //Calendar object get and set height
            inner.height = function(_) {
                if(!arguments.length) return height;
                height = _ - margin.top - margin.bottom;
            };

            //Calendar object get and set margin
            inner.margin = function(_) {
                if(!arguments.length) return margin;
                margin = _;
                return inner;
            };
            
            inner.addClass = function(classData) {
                /*
                 * Class Data Format:
                 * {
                 *    classId: <id>,
                 *    sectionId: <id>,
                 *    start: <hour number>,
                 *    end: <hour number>,
                 *    meetingTimes: ["Tuesday", "Thursday"]
                 * }
                 */

                // Make sure it's not already there
                events = events.filter(function(e){
                    if(classData.classId != e.classId) {
                        return true;
                    }
                    return classData.sectionId != e.sectionId;
                });
                
                //Formatting event data
                classData.meetingTimes.forEach(function(d){
                    events.push({
                        classId: classData.classId,
                        sectionId: classData.sectionId,
                        start: d3.time.minute.offset(d3.time.hour.offset(d3.time.day(new Date), classData.start.hour()), classData.start.minute()),
                        end: d3.time.minute.offset(d3.time.hour.offset(d3.time.day(new Date), classData.end.hour()), classData.end.minute()),
                        day: d,
                        content: classData.content,
                        hovering: classData.hovering
                    });
                });

                d3.select(elem)
                    .datum(events)
                    .call(inner);
            };

            //Helper removal function
            function filterOut(val, attr){
                events = events.filter(function(e) {
                    return val != e[attr];
                });

                d3.select(elem)
                    .datum(events)
                    .call(inner);
            };

            inner.removeClass = function(classId) {
                filterOut(classId, 'classId');
            };

            inner.removeSection = function(sectionId) {
                filterOut(sectionId, 'sectionId');
            };

            inner.clearClasses = function() {
                events = [];

                d3.select(elem)
                    .datum(events)
                    .call(inner);
            };

            return inner;
        }
        
        //d3CalendarService calendar object creation
        d3s.createCalendar = function(elem) {
            var cal = initializeCalendar(elem, true);
            cal.height(window.innerHeight-100);
            cal.width(elem.parentNode.offsetWidth);
            
            d3.select(elem)
                .datum([])
                .call(cal);

            return cal;
        }
        
        //d3CalendarService genereated schedule object creation
        d3s.createSchedule = function(elem) {
            var cal = initializeCalendar(elem, false);
            cal.margin({top: 20, right: 20, bottom: 20, left: 20});
            cal.height((window.innerHeight-180)/3);
            cal.width(elem.parentNode.offsetWidth); 

            d3.select(elem)
                .datum([])
                .call(cal);

            return cal;
        }
    }    
})();
