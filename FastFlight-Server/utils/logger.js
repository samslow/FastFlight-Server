export default class Logger {
  static warn(msg) {
    console.warn(msg);
  }

  static log(msg) {
    process.env.REACT_APP_ENV !== 'PROD' && console.log(msg);
  }
}
