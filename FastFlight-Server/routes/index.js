import { requestGet } from '../utils/fetchHelper';
import { get } from 'lodash';
import moment from 'moment';

var express = require('express');
var router = express.Router();

var firebaseConfig = require('../config/firebase.json');

var firebase = require('firebase');
var config = {
  apiKey: firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  databaseURL: firebaseConfig.databaseURL,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
  appId: firebaseConfig.appId,
};
firebase.initializeApp(config);

router.get('/list', async function(req, res, next) {
  /*
   *
   * { BX: '에어부산',
   *   OZ: '아시아나',
   *   LJ: '진에어',
   *   KE: '대한항공',
   *   TW: '티웨이항공',
   *   ZE: '이스타항공',
   *   7C: '제주항공' }
   *
   */
  const depOriginData = await requestGet(
    `https://domair.interpark.com/api/booking/airJourney.do?format=json&dep=GMP&arr=CJU&depDate=${req.query.depDate}&adt=1&chd=0&inf=0&tripDivi=1&airlineCode=&siteCode=`,
  ).then(r => {
    return get(r, 'body.replyAvailFare.availFareSet', []);
  });

  const arrOriginData = await requestGet(
    `https://domair.interpark.com/api/booking/airJourney.do?format=json&dep=CJU&arr=GMP&depDate=${req.query.arrDate}&adt=1&chd=0&inf=0&tripDivi=1&airlineCode=&siteCode=`,
  ).then(r => {
    return get(r, 'body.replyAvailFare.availFareSet', []);
  });

  let depData = [];
  let arrData = [];

  let bestDepData = null;
  let bestArrData = null;

  depOriginData.forEach(item => {
    if (item.segFare.depTime.slice(0, 2) === req.query.depTime) {
      console.log(item);
      depData.push(item);
      item.segFare.classDetail.forEach(fare => {
        if (bestDepData === null) {
          bestDepData = item;
          bestDepData.segFare.classDetail = [fare];
        } else if (bestDepData.segFare.classDetail[0].chdFare > fare.chdFare) {
          bestDepData = item;
          bestDepData.segFare.classDetail = [fare];
        }
      });
    }
  });

  arrOriginData.forEach(item => {
    if (item.segFare.depTime.slice(0, 2) === req.query.arrTime) {
      console.log(item);
      arrData.push(item);
      item.segFare.classDetail.forEach(fare => {
        if (bestArrData === null) {
          bestArrData = item;
          bestArrData.segFare.classDetail = [fare];
        } else if (bestArrData.segFare.classDetail[0].chdFare > fare.chdFare) {
          bestArrData = item;
          bestArrData.segFare.classDetail = [fare];
        }
      });
    }
  });

  res.json({ bestDepData: bestDepData, bestArrData: bestArrData, depData: depData, arrData: arrData });

  var newDataKey = firebase
    .database()
    .ref()
    .child('flightData')
    .push().key;

  var postData = { depOriginData: depOriginData, arrOriginData: arrOriginData };

  var updates = {};
  updates['/flightData/' + newDataKey] = postData;

  firebase
    .database()
    .ref()
    .update(updates);
});

module.exports = router;
