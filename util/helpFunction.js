async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index])
    }
}

function formatDate(date) {
    let d = new Date(date)
    ;(month = "" + (d.getMonth() + 1)),
        (day = "" + d.getDate()),
        (year = d.getFullYear())

    if (month.length < 2) month = "0" + month
    if (day.length < 2) day = "0" + day

    return [day, month, year].join("/")
}

function getHour(d){
  if(!d){
    return ""
  }
  function addZero(i) {
    if (i < 10) {i = "0" + i}
    return i;
  }
  
  let h = addZero(d.getHours());
  let m = addZero(d.getMinutes());
  let s = addZero(d.getSeconds());
  let time = h + ":" + m + ":" + s;
  return time
}

function getMonthsUntil(date) {
    let [year, month] = date.split("-")
    let months = []
    for (let i = 2019; i <= year; i++) {
        for (let j = 1; j <= 12; j++) {
            months.push(`${i}-${j}`)
        }
    }
    months = months.slice(months.indexOf("2019-10"), months.indexOf(date) + 1)
    return months
}

module.exports = {
    asyncForEach,
    getMonthsUntil,
    formatDate,
    getHour
}
