var express = require('express');
var moment = require('moment');
var elasticRepositoryModule = require('../public/javascripts/elasticRepository');
var repo = new elasticRepositoryModule();
var router = express.Router();

var titleMaps = {};
var formatMaps = {};

function initMaps() {
    titleMaps["Blood-Sugar"] = "Glucose Levels";
    formatMaps["mmol"] = "mmol/L";
    formatMaps["mgdl"] = "mg/dL";
}

initMaps();

router.get('/:diaryName/values/:format', function (req, res, next) {
    if (!formatMaps[req.params.format]) {
        return res.status(400).send("As format you can only use 'mmol' or 'mgdl'");
    }
    return getValues(req.params.diaryName).then((res) => {
        return res.render('diary', { title: req.params.diaryName, subtitle: titleMaps[req.params.logType] + " (" + formatMaps[req.params.format] + ")", diaryName: req.params.diaryName, diaryData: data });
    });
});

router.get('/:diaryName/terapies', function (req, res, next) {
    return getTerapies(req.params.diaryName).then((res) => {
        return res.render('diary', { title: req.params.diaryName, subtitle: req.params.logType, diaryName: req.params.diaryName, diaryData: data });
    });
});

router.get('/:diaryName/calories', function (req, res, next) {
    return getCalories(req.params.diaryName).then((res) => {
        return res.render('diary', { title: req.params.diaryName, subtitle: req.params.logType, diaryName: req.params.diaryName, diaryData: data });
    });
});

router.get('/:diaryName/all/:format', function (req, res, next) {
    return res.status(500).send("TODO");
    if (!formatMaps[req.params.format]) {
        return res.status(400).send("As format you can only use 'mmol' or 'mgdl'");
    }
    var allData = [];
    return getValues(req.params.diaryName, req.params.format)
        .then((values) => {
            return allData["Value"] = values;
        })
        .then((a) => {
            return getCalories(req.params.diaryName);
        })
        .then((calories) => {
            return allData["Calories"] = calories;
        })
        .then((b) => {
            return getTerapies(req.params.diaryName);
        })
        .then((terapies) => {
            return allData["Terapies"] = terapies;
        }).then((c) => {
            // TODO fix the alldata structure to show multiple lines in the chart
            return res.render('diary', { title: req.params.diaryName, subtitle: "all (" + formatMaps[req.params.format] + ")", diaryName: req.params.diaryName, diaryData: allData });
        });
});

function getCalories(diaryName) {
    return repo.getData(diaryName, "Food").then((getDataResponse) => {
        var data = [];
        getDataResponse.forEach(element => {
            data.push({
                Value: element.Calories, LogDate: moment(element.LogDate).format('YYYY-MM-DD HH:mm:ss')
            });
        });
        return data;
    });
}

function getTerapies(diaryName) {
    return repo.getData(diaryName, "Terapy").then((getDataResponse) => {
        var data = [];
        getDataResponse.forEach(element => {
            data.push({
                Value: element.Value, LogDate: moment(element.LogDate).format('YYYY-MM-DD HH:mm:ss')
            });
        });
        return data;
    });
}

function getValues(diaryName, format) {
    return repo.getData(diaryName, "Blood-Sugar").then((getDataResponse) => {
        var data = [];
        getDataResponse.forEach(element => {
            data.push({
                Value:
                    (format == 'mmol' && element.Mmolvalue) ||
                    (format == 'mgdl' && element.Value),
                LogDate: moment(element.LogDate).format('YYYY-MM-DD HH:mm:ss')
            });
        });
        return data;
    });
}

module.exports = router;