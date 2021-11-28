 async function asyncForEach(array, callback) { 
    for (let index = 0; index < array.length; index++) {
      await callback(array[index]);
    }
}

 function getMonthsUntil(date){
  let [year, month] = date.split("-")
  let months = []
  for(let i=2019; i <= year; i++){
    for(let j=1; j<=12; j++){
      months.push(`${i}-${j}`)

    }

  }
  months = months.slice(months.indexOf("2019-10"), months.indexOf(date) + 1)
  return months
}

module.exports = {
  asyncForEach,
  getMonthsUntil


}