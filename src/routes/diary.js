module.exports = function (diaryRepository) {
    var express = require('express');
    var moment = require('moment');
    var router = express.Router();
    var repo = diaryRepository;

    var titleMaps = {};
    var formatMaps = {};

    function initMaps() {
        titleMaps["values"] = "Glucose Levels";
        titleMaps["terapies"] = "Terapies";
        titleMaps["calories"] = "Calories";
        formatMaps["mmol"] = "mmol/L";
        formatMaps["mgdl"] = "mg/dL";
    }

    initMaps();

    router.get('/:diaryName/values/:format', function (req, res, next) {
        var from = moment().startOf('day');
        var to = moment().endOf('day');
        return getValuesForRequest(req, res, next, from, to);
    });

    router.get('/:diaryName/values/:format/from/:from/to/:to', function (req, res, next) {
        if (moment(req.params.from).diff(moment(req.params.to)) > 0) {
            return res.status(400).send("From Date must be before To Date");
        }
        var from = moment(req.params.from);
        var to = moment(req.params.to);
        if (!from.isValid() || !to.isValid()) {
            return res.status(400).send("You must use the ISO date format to specify date (example: 2015-12-30)");
        }
        return getValuesForRequest(req, res, next, from, to);
    });

    router.get('/:diaryName/terapies', function (req, res, next) {
        var from = moment().startOf('day');
        var to = moment().endOf('day');
        return getTerapiesForRequest(req, res, next, from, to);
    });

    router.get('/:diaryName/terapies/from/:from/to/:to', function (req, res, next) {
        if (moment(req.params.from).diff(moment(req.params.to)) > 0) {
            return res.status(400).send("From Date must be before To Date");
        }
        var from = moment(req.params.from);
        var to = moment(req.params.to);
        if (!from.isValid() || !to.isValid()) {
            return res.status(400).send("You must use the ISO date format to specify date (example: 2015-12-30)");
        }
        return getTerapiesForRequest(req, res, next, from, to);
    });

    router.get('/:diaryName/calories', function (req, res, next) {
        var from = moment().startOf('day');
        var to = moment().endOf('day');
        return getCaloriesForRequest(req, res, next, from, to);
    });

    router.get('/:diaryName/calories/from/:from/to/:to', function (req, res, next) {
        if (moment(req.params.from).diff(moment(req.params.to)) > 0) {
            return res.status(400).send("From Date must be before To Date");
        }
        var from = moment(req.params.from);
        var to = moment(req.params.to);
        if (!from.isValid() || !to.isValid()) {
            return res.status(400).send("You must use the ISO date format to specify date (example: 2015-12-30)");
        }
        return getCaloriesForRequest(req, res, next, from, to);
    });

    router.get('/:diaryName/all/:format/from/:from/to/:to', function (req, res, next) {
        if (moment(req.params.from).diff(moment(req.params.to)) > 0) {
            return res.status(400).send("From Date must be before To Date");
        }
        var from = moment(req.params.from);
        var to = moment(req.params.to);
        return allForAPeriod(req, res, next, from, to);
    });

    router.get('/:diaryName/all/:format', function (req, res, next) {
        var from = moment().startOf('day');
        var to = moment().endOf('day');
        return allForAPeriod(req, res, next, from, to);
    });

    var _prefixTitle = "Diary: ";

    function getValuesForRequest(req, res, next, from, to) {
        if (!formatMaps[req.params.format]) {
            return res.status(400).send("As format you can only use 'mmol' or 'mgdl'");
        }
        return getValues(req.params.diaryName, req.params.format, from, to).then((data) => {
            return res.render('diary', { title: _prefixTitle + req.params.diaryName, subtitle: titleMaps["values"] + " (" + formatMaps[req.params.format] + ")", diaryName: req.params.diaryName, diaryData: data, period: getPeriodText(from, to) });
        }).catch((err) => {
            return res.status(500).send(err.message);
        });
    }

    function getTerapiesForRequest(req, res, next, from, to) {
        return getTerapies(req.params.diaryName, from, to).then((data) => {
            return res.render('diary', { title: req.params.diaryName, subtitle: titleMaps["terapies"], diaryName: req.params.diaryName, diaryData: data, period: getPeriodText(from, to) });
        }).catch((err) => {
            return res.status(500).send(err.message);
        });
    }

    function getCaloriesForRequest(req, res, next, from, to) {
        return getCalories(req.params.diaryName, from, to).then((data) => {
            return res.render('diary', { title: req.params.diaryName, subtitle: titleMaps["calories"], diaryName: req.params.diaryName, diaryData: data, period: getPeriodText(from, to) });
        }).catch((err) => {
            return res.status(500).send(err.message);
        });
    }

    function allForAPeriod(req, res, next, from, to) {
        if (!formatMaps[req.params.format]) {
            return res.status(400).send("As format you can only use 'mmol' or 'mgdl'");
        }
        var data = [];
        return getValues(req.params.diaryName, req.params.format, from, to)
            .then((values) => {
                return merge(values, data);
            }).then((a) => {
                return getCalories(req.params.diaryName, from, to);
            }).then((calories) => {
                return merge(calories, data);
            }).then((b) => {
                return getSlowTerapies(req.params.diaryName, from, to);
            }).then((slowTerapies) => {
                return merge(slowTerapies, data);
            }).then((c) => {
                return getFastTerapies(req.params.diaryName, from, to);
            }).then((fastTerapies) => {
                return merge(fastTerapies, data);
            }).then((c) => {
                var stats = aggregateStats(data);                
                return stats;
            }).then((c) => {
                return res.render('diary', { 
                    title: req.params.diaryName, 
                    subtitle: "all (" + formatMaps[req.params.format] + ")", 
                    diaryName: req.params.diaryName, 
                    diaryData: data, 
                    period: getPeriodText(from, to), 
                    average: isNaN(c.average) === false ? 'Average Glucose Level: ' + c.average : '',
                    calories: c.calories > 0 ? 'Total calories: ' + c.calories : '',
                    fastTerapyTotal: c.fast > 0 ? 'Fast terapy: ' + c.fast : ''
                });
            }).catch((err) => {
                return res.status(500).send(err.message);
            });

        function aggregateStats(data) {
            var sum = 0;            
            var countValues = 0; 
            var totalCalories = 0;
            var totalFastTerapy = 0;
            for (var i = 0; i < data.length; i++) {
                if (data[i].Value) {
                    sum += parseInt(data[i].Value, 10); //don't forget to add the base
                    countValues++;
                }    
                if (data[i].Calories) {
                    totalCalories += data[i].Calories;                    
                }
                if (data[i].Fast) {
                    totalFastTerapy += data[i].Fast;                    
                }           
            }
            var avg = sum / countValues;
            return { average: avg, calories: totalCalories, fast: totalFastTerapy };
        }

        function merge(fromArray, toArray) {
            fromArray.forEach(element => {
                toArray.push(element);
            });
            return toArray;
        }
    }

    function getPeriodText(from, to) {
        if (from.isSame(to, 'd')) {
            //return "Day: " + from.format('DD-MM-YYYY');
            return from.format('DD-MM-YYYY');
        } else {
            return "From: " + from.format('DD-MM-YYYY') + ' To: ' + to.format('DD-MM-YYYY');
        }
    }

    function getCalories(diaryName, from, to) {
        return repo.getData(diaryName, 'Calories', from, to).then((getDataResponse) => {
            var data = [];
            getDataResponse.forEach(element => {
                data.push({
                    Calories: element.Calories, Message: element.Message, LogDate: moment(element.LogDate).format('YYYY-MM-DD HH:mm:ss')
                });
            });
            return data;
        });
    }

    function getTerapies(diaryName, from, to) {
        var data = [];
        return repo.getData(diaryName, 'Slow-Terapy', from, to).then((slowTerapies) => {
            slowTerapies.forEach(element => {
                data.push({
                    Slow: element.SlowTerapy, Message: element.Message, LogDate: moment(element.LogDate).format('YYYY-MM-DD HH:mm:ss')
                });
            });
            return data;
        }).then(() => {
            return repo.getData(diaryName, 'Fast-Terapy', from, to);
        }).then((fastTerapies) => {
            fastTerapies.forEach(element => {
                data.push({
                    Fast: element.FastTerapy, Message: element.Message, LogDate: moment(element.LogDate).format('YYYY-MM-DD HH:mm:ss')
                });
            });
            return data;
        });
    }

    function getSlowTerapies(diaryName, from, to) {
        return repo.getData(diaryName, 'Slow-Terapy', from, to).then((getDataResponse) => {
            var data = [];
            getDataResponse.forEach(element => {
                data.push({
                    Slow: element.SlowTerapy, Message: element.Message, LogDate: moment(element.LogDate).format('YYYY-MM-DD HH:mm:ss')
                });
            });
            return data;
        });
    }

    function getFastTerapies(diaryName, from, to) {
        return repo.getData(diaryName, 'Fast-Terapy', from, to).then((getDataResponse) => {
            var data = [];
            getDataResponse.forEach(element => {
                data.push({
                    Fast: element.FastTerapy, Message: element.Message, LogDate: moment(element.LogDate).format('YYYY-MM-DD HH:mm:ss')
                });
            });
            return data;
        });
    }

    function getValues(diaryName, format, from, to) {
        return repo.getData(diaryName, "Blood-Sugar", from, to).then((getDataResponse) => {
            var data = [];
            getDataResponse.forEach(element => {
                data.push({
                    Value: getValue(element), Message: element.Message, LogDate: moment(element.LogDate).format('YYYY-MM-DD HH:mm:ss')
                });
            });
            function getValue(el) {
                if (format === 'mmol') {
                    return el.Mmolvalue;
                } else {
                    return el.Value;
                }
            }
            return data;
        });
    }

    return router;
}
