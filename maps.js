let myMap = null
let polyline = null
ymaps.ready(init)

function init() {// Создаем карту
   myMap = new ymaps.Map("map", {
      center: [55.76, 37.64],
      zoom: 7
   });
}

function createPoint(text) {// Создание метки содержимому поля ввода
   let myCoords = null
   const promise = new Promise(resolve => {
      const myGeocoder = ymaps.geocode(text)
      myGeocoder.then(res => {// Если введенная информация некорректна, поле не очистится, метка не создастся
         myCoords = res.geoObjects.get(0).geometry.getCoordinates()
         const placemark = new ymaps.Placemark(
            myCoords,
            {iconContent: counter + 1},
            {
               preset: 'islands#blackStretchyIcon', draggable: true
            }
         )
         myMap.geoObjects.add(placemark)
         myMap.panTo(myCoords, {duration: 1000})// Плавно перемещаем центр к координатам метки
         placemark.events.add('drag', e => {// обновлять маршрут при перетаскивании метки
            updatePolyline(pointObjects)
         })

         placemark.events.add('click', e => {//Показывать балун при клике на метку
            const pointObject = pointObjects.find(item => item.pointLink === placemark)
            const li = [...document.querySelectorAll('.druggable')].find(li => li.id === pointObject.id)
            const title = li.firstChild.innerText
            myMap.balloon.open(placemark.geometry.getCoordinates(), title);
         })
         resolve(placemark)
      })
   })

   return promise
}



function updatePoint(point, {title}) {
   point.properties.set('iconContent', title)
}

function updateAllPoints(pointObjects) {
   pointObjects.forEach((item, index) =>{
      const point = item.pointLink
      point.properties.set('iconContent', index + 1)
   })
}

function deletePoint(point){
   myMap.geoObjects.remove(point)
   updateAllPoints(pointObjects)
   updatePolyline(pointObjects)

}

function createPolyline(pointObjects) {
   const coordinates = pointObjects.map(item => item.pointLink.geometry.getCoordinates())

   polyline = new ymaps.Polyline(
      coordinates,
      null,
      {
         strokeColor: '#000000',
         strokeWidth: 3
      }
   )

   myMap.geoObjects.add(polyline)
}

function updatePolyline(pointObjects) {
   if(pointObjects.length === 1) {//Если имеется одна точка, удалим маршрут 
      myMap.geoObjects.remove(polyline)
   } else { // Иначе обновим
      const coordinates = pointObjects.map(item => item.pointLink.geometry.getCoordinates())
      polyline.geometry.setCoordinates(coordinates)
   }
}



