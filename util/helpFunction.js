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

function getHour(d) {
    if (!d) {
        return ""
    }
    function addZero(i) {
        if (i < 10) {
            i = "0" + i
        }
        return i
    }

    let h = addZero(d.getHours())
    let m = addZero(d.getMinutes())
    let s = addZero(d.getSeconds())
    let time = h + ":" + m + ":" + s
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

function getMonthsBetween(from, to) {
    let [fromYear, fromMonth] = from.split("-")
    let [toYear, toMonth] = to.split("-")

    let months = []
    for (let i = parseInt(fromYear); i <= parseInt(toYear); i++) {
        for (let j = 1; j <= 12; j++) {
            months.push(`${i}-${j}`)
        }
    }
    months = months.slice(months.indexOf(from), months.indexOf(to) + 1)

    return months
}
function getMonthsForFullYear(date) {
    let year = parseInt(date.split("-")[0])
    let secondYear = year + 1

    let months = []
    for (let i = 7; i <= 12; i++) {
        months.push(`${year}-${i}`)
    }
    for (i = 1; i <= 6; i++) {
        months.push(`${secondYear}-${i}`)
    }

    return months
}

module.exports = {
    asyncForEach,
    getMonthsUntil,
    getMonthsForFullYear,
    formatDate,
    getHour,
    getMonthsBetween
}
